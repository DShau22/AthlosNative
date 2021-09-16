/**
 * Utilities for managin the local storage of user fitness
 * and syncing with the server and database.
 * This is also where we go from bytes to actual data
 */
import { DEVICE_CONFIG_CONSTANTS, DISTANCES_LIST, MUSCLE_GROUP_LIST, STROKES_LIST } from '../../configure/DeviceConfigConstants';
import FITNESS_CONSTANTS from '../FitnessConstants';
import { PoolLengthsEnum, SwimStrokesEnum } from '../FitnessTypes';
import {
  RunSchema,
  SwimSchema,
  JumpSchema,
  SwimReferenceTimes,
  IntervalSchema,
  IntervalType,
  IntervalWorkoutSchema,
  SwimWorkoutSchema
} from './UserActivities';


const { DateTime } = require("luxon");

const eventTable = [
  // 50 yd free
];

const M_ascii = 'M'.charCodeAt(0); // switched modes
const basketball_mode = '5'.charCodeAt(0);
const semicolon_ascii = ";".charCodeAt(0);
const {
  FLY,
  BACK,
  BREAST,
  FREE,
  HEAD_UP,
} = FITNESS_CONSTANTS;

const INTERVAL = 36;
const SWIM_WORKOUT = 37;

//fly back breast free or any of the races
const swimSet = new Set([
  FLY.charCodeAt(0),
  BACK.charCodeAt(0),
  BREAST.charCodeAt(0),
  FREE.charCodeAt(0),
  HEAD_UP.charCodeAt(0),
]);

const swimWorkoutSet = new Set([SWIM_WORKOUT,]);

// uses stepCount to determine the pool length this person was swimming in. ORDER MATTERS
const numToPoolLength = {
  '0': PoolLengthsEnum.NCAA,
  '1': PoolLengthsEnum.OLYMPIC,
  '2': PoolLengthsEnum.BRITISH,
  '3': PoolLengthsEnum.THIRD_YD,
  '4': PoolLengthsEnum.TWENTY_YARD,
  '5': PoolLengthsEnum.HOME,
  '6': PoolLengthsEnum.SHORT,
  '7': PoolLengthsEnum.THIRD_M,
}
  
const intervalSet = new Set([INTERVAL,]);
const jumpSet = new Set(['3'.charCodeAt(0), '4'.charCodeAt(0), basketball_mode]);
const stepSet = new Set(['R'.charCodeAt(0), 'W'.charCodeAt(0)]);

// all the characters that the first marker byte could be
const markerSet = new Set([
  ...jumpSet,
  ...stepSet,
  ...intervalSet,
  ...swimSet,
  ...swimWorkoutSet,
  M_ascii, // switched modes
]);

function validate(byte: number, idx: number): boolean {
  if (!markerSet.has(byte)) {
    console.log("*********** NOT A VALID FILE ************");
    console.log(`${String.fromCharCode(byte)} is not part of the cEvent marker set`);
  }
  return markerSet.has(byte);
} 

function merge_two_bytes(first8: number, second8: number): number {
  return (first8 << 8) + second8;
}

function merge_three_bytes(first8: number, second8: number, third8: number): number {
  return (first8 << 16) + (second8 << 8) + third8;
}

/**
 * jump cevent: '3' (report height), '4' (report hangtime), '5' (bball)
 * jump lapCount: # jumps
 * jump ndata: ndata .02s,
 * jump stepCount: bs,
 * jump lapTime: hangtime in .02s
 * jump calories: 10*(# baskets made)
 * swim cEvent: stroke,
 * swim lapCount: lap count,
 * swim ndata: ndata in .1s,
 * swim stepCount: 0 or junk, 0 means they did a turn
 * swim lapTime: laptime,
 * swim calories: cals
 * run cevent: "R" for run, 'W' for walk, and more for other modes
 * run lapCount: ?
 * run ndata: time in .1s
 * run stepCount: step count
 * run lapTime: time in minutes,
 * run cals: cals
 * interval[0]: 36
 * interval lapCount: num intervals completed since start
 * interval stepCount: upper 10 bits is interval time, lower 6 bits is event
 * interval lapTime: time passed in this interval
 * interval Calorie: lowest byte is total intervals, second lowest byte is num rounds
 * unscrambles encoded byte file
 * @param {Buffer} byteArr 
 * returns a list of lists where the sublists contain 6 elements representing a stat report.
 */
interface ReadableSession {
  cEvent: number, // 1 byte
  lapCount: number, // 2 bytes
  ndata: number, // 3 bytes
  stepCount: number, // 3 bytes
  lapTime: number, // 3 bytes
  calories: number, // 3 bytes
}
const unscrambleSessionBytes = (byteArr: Buffer): Array<ReadableSession> => {
  var converted: Array<ReadableSession> = [];
  var idx = 0;
  var cEvent: number;
  var lapCount: number;
  var ndata: number;
  var stepCount: number;
  var lapTime: number;
  var calories: number;
  while (idx < (byteArr.length - 15)) {
    // console.log(`idx: ${idx}, byte: ${byteArr[idx]}`);
    if ((byteArr[idx+15] === semicolon_ascii) && validate(byteArr[idx], idx)) {
      // console.log(`valid!: ${byteArr[idx]}`);
      cEvent = byteArr[idx];
      if (cEvent === M_ascii) {
        converted.push({cEvent, lapCount: 0, ndata: 0, stepCount: 0, lapTime: 0, calories: 0});
      } else {
        lapCount = merge_two_bytes(byteArr[idx + 1],byteArr[idx + 2]);
        ndata = merge_three_bytes(byteArr[idx + 5], byteArr[idx + 4], byteArr[idx + 6]);
        stepCount = merge_three_bytes(byteArr[idx + 10], byteArr[idx + 8], byteArr[idx + 9]);
        lapTime = merge_three_bytes(byteArr[idx + 11], byteArr[idx + 7], byteArr[idx + 3]);
        calories = merge_three_bytes(byteArr[idx + 12], byteArr[idx + 13], byteArr[idx + 14]);
        converted.push({cEvent, lapCount, ndata, stepCount, lapTime, calories});
        // console.log("ndata: ", ndata);
      }
      idx += 16;
    } else {
      idx++;
    }
  }
  return converted
}

const calcHeight = (hangtime: number) => {
  // to nearest hundreths digit
  const heightInHundreths = hangtime * hangtime * 2;
  const heightInInches = heightInHundreths / 100;
  return heightInInches;
}

const isAnomaly = (statReport: ReadableSession, isInterval = false): boolean => {
  const isAnomaly = isInterval ? statReport.lapCount > 5000 : statReport.calories > 50000;
  if (isAnomaly) {
    console.log("ANOMALY DETECTED: ", statReport);
  }
  return isAnomaly;
}

type sessionJsonsType = {
  run: RunSchema,
  jump: JumpSchema,
  swim: SwimSchema,
  interval: IntervalSchema
}
/**
 * @param {Array[Array]} unscrambled: unscrambled list of lists. Output of unscrambleSessionBytes function
 * @param {String} userID: user's id in the mongo users collection
 * @param {Date} sessionDate: the LOCAL date that this session byte array was stored on the user's phone
 */
const createSessionJsons = (unscrambled: Array<ReadableSession>, sessionDate: typeof DateTime): sessionJsonsType => {
  console.log("unscrambled: ", unscrambled);
  var run: RunSchema = {
    userID: "", // these will be set by the server in the backend once uploaded with the token
    uploadDate: sessionDate,
    num: 0,
    cadences: [],
    calories: 0,
    time: 0,
    walkCadences: [], // cadences for when the user has hiking mode enabled to support JJ
    uploadedToServer: false,
  }
  var swim: SwimSchema = {
    userID: "",
    uploadDate: sessionDate,
    num: 0,
    poolLength: PoolLengthsEnum.NCAA,
    lapTimes: [],
    workouts: [],
    strokes: [],
    calories: 0,
    time: 0,
    uploadedToServer: false,
  }
  var jump: JumpSchema = {
    userID: "",
    uploadDate: sessionDate,
    num: 0,
    heights: [],
    shotsMade: 0,
    time: 0,
    uploadedToServer: false,
  }
  var interval: IntervalSchema = {
    userID: "",
    uploadDate: sessionDate,
    workouts: [],
    time: 0,
    uploadedToServer: false,
  }
  const sessionJsons: sessionJsonsType = {run, swim, jump, interval};
  var statReportIdx: number = 0;
  var cEvent: number | null = null;
  var statReport: ReadableSession | null = null;
  while (statReportIdx < unscrambled.length) {
    statReport = unscrambled[statReportIdx];
    cEvent = statReport.cEvent;
    if (stepSet.has(cEvent) && !isAnomaly(statReport)) {
      var prevNumSteps = 0;
      var numSteps = 0;
      var time = 0;
      var prevTime = 0;
      while (stepSet.has(cEvent) && statReportIdx < unscrambled.length) {
        // update cadence array
        prevTime = time;
        time = statReport.lapTime / 600;
        prevNumSteps = numSteps;
        numSteps = statReport.stepCount;
        const cadence = Math.round((numSteps - prevNumSteps) / (time - prevTime));
        sessionJsons.run.cadences.push(cadence);
        if (cEvent === "W".charCodeAt(0)) {
          sessionJsons.run?.walkCadences?.push(cadence);
        }
        // move onto the next stat report record
        statReportIdx += 1;
        statReport = unscrambled[statReportIdx];
        cEvent = statReport ? statReport.cEvent : null;
      }
      const lastStepStatReport = unscrambled[statReportIdx - 1];
      sessionJsons.run.num += lastStepStatReport.stepCount;
      sessionJsons.run.calories += lastStepStatReport.calories / 10;
      sessionJsons.run.time += lastStepStatReport.ndata / 600;
    } else if (swimSet.has(cEvent) && !isAnomaly(statReport)) {
      // console.log("swim: ", statReport);
      while (swimSet.has(cEvent) && statReportIdx < unscrambled.length) {
        sessionJsons.swim.lapTimes.push({
          lapTime: statReport.lapTime / 10, // laptime in seconds
          finished: statReport.stepCount !== 0 // 0 means they turned. Anything else means finished
        });
        sessionJsons.swim.strokes.push(String.fromCharCode(cEvent));
        // move onto the next stat report record
        statReportIdx += 1;
        statReport = unscrambled[statReportIdx];
        cEvent = statReport ? statReport.cEvent : null;
      }
      const lastSwimStatReport = unscrambled[statReportIdx - 1];
      sessionJsons.swim.num = sessionJsons.swim.strokes.length;
      sessionJsons.swim.poolLength = numToPoolLength[parseInt(String.fromCharCode(lastSwimStatReport.stepCount))];
      sessionJsons.swim.calories += lastSwimStatReport.calories / 10;
      // console.log("last swim stat report: ", lastSwimStatReport);
      sessionJsons.swim.time += lastSwimStatReport.ndata / 600;
    } else if (jumpSet.has(cEvent) && !isAnomaly(statReport)) {
      while (jumpSet.has(cEvent) && statReportIdx < unscrambled.length) {
        const heightInInches = calcHeight(statReport.lapTime);
        if (heightInInches < 64) {
          sessionJsons.jump.num++;
          sessionJsons.jump.heights.push(heightInInches); // contains hangtime
        }
        // move onto the next stat report record
        statReportIdx += 1;
        statReport = unscrambled[statReportIdx];
        cEvent = statReport ? statReport.cEvent : null;
      }
      const lastJumpStatReport = unscrambled[statReportIdx - 1];
      sessionJsons.jump.shotsMade += cEvent === basketball_mode ? lastJumpStatReport.calories : 0;
      sessionJsons.jump.time += lastJumpStatReport.ndata / 3000;
    } else if (intervalSet.has(cEvent) && !isAnomaly(statReport, true)) {
      const workoutObject: IntervalWorkoutSchema = {
        intervalsCompleted: [],
        totalRoundsPlanned: 0,
        intervalsPerRoundPlanned: 0,
        workoutName: `${sessionDate.weekdayShort}, ${sessionDate.month}/${sessionDate.day} Workout`,
        workoutTime: 0,
      }
      while (intervalSet.has(cEvent) && statReportIdx < unscrambled.length) {
        var exerciseIdx = statReport.stepCount & 0x3f;
        var lengthInSeconds = (statReport.stepCount >> 6) & 0x3ff;
        var intervalsPerRound = (((statReport.calories & 0xff) - '0'.charCodeAt(0)) >> 4) + 1; // bits 7-4 of the lowest byte
        var totalNumIntervalsPlanned = ((statReport.calories & 0xff00) >> 8) - '0'.charCodeAt(0); // middle byte
        var currentInterval: IntervalType = {
          lengthInSeconds,
          exercise: MUSCLE_GROUP_LIST[exerciseIdx],
        }
        workoutObject.intervalsCompleted.push(currentInterval);
        workoutObject.totalRoundsPlanned = Math.ceil(totalNumIntervalsPlanned / intervalsPerRound);
        workoutObject.intervalsPerRoundPlanned = intervalsPerRound;
        workoutObject.workoutTime += lengthInSeconds;
        // move onto the next stat report record
        statReportIdx += 1;
        statReport = unscrambled[statReportIdx];
        cEvent = statReport ? statReport.cEvent : null;
        // if the number of intervals done since start goes back to 1, we know this is a new workout, so break outta this loop
        if (intervalSet.has(cEvent) && statReport.lapCount === 1) {
          break;
        }
      }
      sessionJsons.interval.workouts.push(workoutObject);
      sessionJsons.interval.time += workoutObject.workoutTime;
    } else if (swimWorkoutSet.has(cEvent) && statReportIdx < unscrambled.length) {
      var currentSwimWorkout: SwimWorkoutSchema = {
        sets: [], 
        totalNumSwimsIntended: ((statReport.calories & 0x00ff00) >> 8) - '0'.charCodeAt(0),
        totalNumRoundsIntended: (((statReport.calories & 0xff) - '0'.charCodeAt(0)) >> 4) + 1,
      }
      if (!sessionJsons.swim.workouts) { sessionJsons.swim.workouts = []; }
      while (swimWorkoutSet.has(cEvent) && statReportIdx < unscrambled.length) {
        addSwimToWorkout(currentSwimWorkout, statReport.stepCount);
        // move onto the next stat report record
        statReportIdx += 1;
        statReport = unscrambled[statReportIdx];
        cEvent = statReport ? statReport.cEvent : null;
        if (swimWorkoutSet.has(cEvent) && statReport.lapCount === 1) {
          break;
        }
      }
      sessionJsons.swim.num += currentSwimWorkout.sets.length;
      sessionJsons.swim.time += currentSwimWorkout.sets.reduce((acc, set) => acc + set.timeIntervalInSeconds, 0);
      sessionJsons.swim.workouts?.push(currentSwimWorkout);
    } else {
      console.log(`not a valid cEvent in the unscrambled array: ${cEvent}`);
      statReportIdx += 1;
    }
  }
  console.log("swim session: ", );
  return sessionJsons;
}

// breaks the swim down into 25s and adds it to the swim workout
const addSwimToWorkout = (workout: SwimWorkoutSchema, stepCount: number) => {
  var reps = ((stepCount & 0xe000) >> 13) + 1; //0b1110 0000 ... bits 15:13
  var distance = DISTANCES_LIST[(stepCount & 0x1c00) >> 10]; //0b0001 1100 0000 ...  bits 12:10
  var event = (stepCount & 0x3c0) >> 6; //0b 0000 0011 1100 0000  bits 9:6
  if (distance > 200) { // bits 5:0
    var timeIntervalInSeconds = (stepCount & 0x3f) * 10;
  } else {
    var timeIntervalInSeconds = (stepCount & 0x3f) * 5;
  }
  workout.sets.push({reps, distance, event: STROKES_LIST[event] ? STROKES_LIST[event] : "Unknown", timeIntervalInSeconds});
}

const calcReferenceTimes = (oldRefTimes: SwimReferenceTimes, swimJson: SwimSchema): SwimReferenceTimes => {
  const { lapTimes, strokes } = swimJson;
  var flyAvg = oldRefTimes.fly[0] / 1.1;
  var backAvg = oldRefTimes.back[0] / 1.1;
  var breastAvg = oldRefTimes.breast[0] / 1.1;
  var freeAvg = oldRefTimes.free[0] / 1.1;
  for (let i = 0; i < lapTimes.length; i++) {
    switch(strokes[i]) {
      case SwimStrokesEnum.FLY:
        flyAvg = (7*flyAvg)/8 + lapTimes[i].lapTime/8;
        break;
      case SwimStrokesEnum.BACK:
        backAvg = (7*backAvg)/8 + lapTimes[i].lapTime/8;
        break;
      case SwimStrokesEnum.BREAST:
        breastAvg = (7*breastAvg)/8 + lapTimes[i].lapTime/8;
        break;
      case SwimStrokesEnum.FREE:
        freeAvg = (7*freeAvg)/8 + lapTimes[i].lapTime/8;
        break;
      default:
        console.log(`${strokes[i]} is not valid`);
        break;
    }
  }
  return {
    fly: [flyAvg * 1.1, flyAvg * .9],
    back: [backAvg * 1.1, backAvg * .9],
    breast: [breastAvg * 1.1, breastAvg * .9],
    free: [freeAvg * 1.1, freeAvg * .9],
  };
}

export {
  unscrambleSessionBytes,
  createSessionJsons,
  calcReferenceTimes
}
