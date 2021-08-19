/**
 * A class with factory constructors that represent a user's fitness.
 * Can be easily worked with to display different statistics
 */
import {
  storeOldFitnessRecords,
  getOldFitnessRecords,
  getToken,
  getUserFitnessData,
  setOldFitnessRecords,
  setUserFitnessData,
} from '../../utils/storage';
import {
  getLastMonday,
  sameDate
} from '../../utils/dates';
import ENDPOINTS from '../../endpoints';
import Axios from 'axios';
import { PoolLengthsEnum } from '../FitnessTypes';
const { DateTime } = require('luxon');

type ACTIVITY_ENUMS = "run" | "swim" | "jump" | "interval";

export interface ActivitySchema {
  _id?: string,
  userID: string,
  uploadDate: string,
  time: number,
  uploadedToServer: boolean
}

export interface RunSchema extends ActivitySchema {
  num: number,
  cadences: Array<number>,
  walkCadences?: Array<number>,
  calories: number,
}

export type Lap = {
  finished: boolean,
  lapTime: number,
}
export interface SwimSchema extends ActivitySchema {
  num: number,
  poolLength: PoolLengthsEnum,
  lapTimes: Array<Lap>,
  strokes: Array<string>,
  calories: number,
}

export interface JumpSchema extends ActivitySchema {
  num: number,
  heights: Array<number>,
  shotsMade: number,
}

export interface IntervalSchema extends ActivitySchema {
  workouts: Array<IntervalWorkoutSchema>,
}

export interface IntervalWorkoutSchema {
  intervalsCompleted: Array<IntervalType>,
  totalRoundsPlanned: number,
  intervalsPerRoundPlanned: number,
  workoutName: string,
  workoutTime: number,
}

export type IntervalType = {
  lengthInSeconds: number,
  exercise: string,
}

export interface SerializedActivities {
  run: Array<Array<RunSchema>>,
  swim: Array<Array<SwimSchema>>,
  jump: Array<Array<JumpSchema>>,
  interval: Array<Array<IntervalSchema>>
}

export interface OldRecords {
  oldRuns: Array<RunSchema>,
  oldSwims: Array<SwimSchema>,
  oldJumps: Array<JumpSchema>,
  oldIntervals: Array<IntervalSchema>,
}

export interface SwimReferenceTimes {
  fly: Array<number>,
  back: Array<number>,
  breast: Array<number>,
  free: Array<number>
}

const blank_run = (date: typeof DateTime): RunSchema => (
  {
    userID: '',
    uploadDate: date.toISODate(),
    num: 0,
    cadences: [],
    calories: 0,
    time: 0,
    uploadedToServer: false,
  }
)

const blank_swim = (date: typeof DateTime): SwimSchema => (
  {
    userID: '',
    uploadDate: date.toISODate(),
    num: 0,
    lapTimes: [],
    strokes: [],
    calories: 0,
    time: 0,
    uploadedToServer: false,
  }
)

const blank_jump = (date: typeof DateTime): JumpSchema => (
  {
    userID: '',
    uploadDate: date.toISODate(),
    num: 0,
    heights: [],
    shotsMade: 0,
    time: 0,
    uploadedToServer: false,
  }
)

const blank_interval = (date: typeof DateTime): IntervalSchema => (
  {
    workouts: [],
    userID: '',
    uploadDate: date.toISODate(),
    time: 0,
    uploadedToServer: false,
  }
)

const blank_week = (activity: ACTIVITY_ENUMS, mondayDate: typeof DateTime) => {
  if (mondayDate.weekday !== 1) {
    throw Error(`Expected a monday but got: ${mondayDate.weekday}`);
  }
  var result = Array(7);
  for (let day = 0; day < 7; day ++) {
    const blank_date = mondayDate.plus({days: day})
    result[day] =
      activity === "run" ? blank_run(blank_date) :
      activity === "swim" ? blank_swim(blank_date) :
      activity === "jump" ? blank_jump(blank_date) :
      activity === "interval" ? blank_interval(blank_date) : null;
  }
  return result;
} 

// Object remplate for storing to async storage

class UserActivities {
  public runs: Array<Array<RunSchema>>;
  public swims: Array<Array<SwimSchema>>;
  public jumps: Array<Array<JumpSchema>>;
  public intervals: Array<Array<IntervalSchema>>;
  public static WEEKS_BACK = 26;

  static async createFromStorage(): Promise<UserActivities | null> {
    const userActivityData: SerializedActivities = await getUserFitnessData();
    if (userActivityData) {
      return new this(userActivityData);
    } else {
      return null;
    }
  }

  // static createBlankActivities(): UserActivities {
  //   return new this();
  // }

  static async createFromServer(): Promise<UserActivities> {
    const newActivities: SerializedActivities = {
      run: [],
      swim: [],
      jump: [],
      interval: [],
    };
    // grab fitness from server and store it
    var lastUpdated = getLastMonday();
    lastUpdated = lastUpdated.minus({days: (UserActivities.WEEKS_BACK + 1) * 7});
    console.log("last updated create from server: ", lastUpdated);
    const userToken: string | null = await getToken();
    const activities: Array<ACTIVITY_ENUMS> = ["run", "swim", "jump", "interval"];
    const activityData = {run: [], swim: [], jump: [], interval: []};
    for (let i = 0; i < activities.length; i++) {
      const res = await Axios.post(ENDPOINTS.getUserFitness, {
        userToken,
        activity: activities[i],
        lastUpdated: lastUpdated.toISODate(),
        userToday: DateTime.local().toISO(), // use the zone rn because if last updated was b4 DST it'll be off for server
      });
      if (!res.data.success) {
        throw new Error(res.data.message);
      }
      activityData[activities[i]] = res.data.activityData;
    }
    newActivities.run = activityData.run;
    newActivities.swim = activityData.swim;
    newActivities.jump = activityData.jump;
    newActivities.interval = activityData.interval;
    return new this(newActivities);
  }

  constructor(activitiesObj: SerializedActivities) {
    this.runs = activitiesObj.run || [];
    this.swims = activitiesObj.swim || [];
    this.jumps = activitiesObj.jump || [];
    this.intervals = activitiesObj.interval || [];
  }

  static async uploadStoredOldRecords() {
    const oldFitnessRecords: OldRecords = await getOldFitnessRecords();
    console.log("old records in upload stored old records: ", oldFitnessRecords);
    const allEmpty = oldFitnessRecords && oldFitnessRecords.oldJumps.length === 0 &&
                     oldFitnessRecords.oldRuns.length === 0 &&
                     oldFitnessRecords.oldSwims.length === 0 && 
                     oldFitnessRecords.oldIntervals.length === 0;
    if (!oldFitnessRecords || allEmpty) { return; }
    const token = await getToken();
    const res = await Axios.post(ENDPOINTS.uploadFitnessRecords, {
      token,
      runs: oldFitnessRecords.oldRuns,
      swims: oldFitnessRecords.oldSwims,
      jumps: oldFitnessRecords.oldJumps,
      intervals: oldFitnessRecords.oldIntervals,
    });
    if (!res.data.success) {
      throw new Error(res.data.message);
    }
    await setOldFitnessRecords({
      oldRuns: [],
      oldSwims: [],
      oldJumps: [],
      oldIntervals: [],
    });
  }

  // fills with empty fitness records and removes old ones if needed
  // Tries to upload old records to DB. If fail then store to Async storage and try again
  // next time.

  async fillAndRemoveOldRecords() {
    const today = DateTime.local();
    const lastMonday = getLastMonday(today);
    var userLastUpdatedMonday: typeof DateTime = this.getLastUpdated();
    // fill in empty fitness records if needed
    userLastUpdatedMonday = userLastUpdatedMonday.plus({days: 7});
    while (userLastUpdatedMonday.startOf("day") <= lastMonday.startOf("day")) {
      console.log("pushing blank week for monday of: ", userLastUpdatedMonday);
      this.runs.unshift(blank_week("run", userLastUpdatedMonday));
      this.swims.unshift(blank_week("swim", userLastUpdatedMonday));
      this.jumps.unshift(blank_week("jump", userLastUpdatedMonday));
      this.intervals.unshift(blank_week("interval", userLastUpdatedMonday));
      userLastUpdatedMonday = userLastUpdatedMonday.plus({days: 7});
    }
    // remove old records and store to async storage
    var numToRemove = this.runs.length - UserActivities.WEEKS_BACK;
    const oldRecords: OldRecords = {
      oldRuns: [],
      oldSwims: [],
      oldJumps: [],
      oldIntervals: [],
    };
    // console.log(this.runs.length);
    // console.log("num to remove: ", numToRemove);
    for (let i = 0; i < numToRemove; i++) {
      oldRecords.oldRuns.push(...this.runs[this.runs.length - 1 - i]);
      oldRecords.oldSwims.push(...this.swims[this.swims.length - 1 - i]);
      oldRecords.oldJumps.push(...this.jumps[this.jumps.length - 1 - i]);
      oldRecords.oldIntervals.push(...this.intervals[this.intervals.length - 1 - i]);
    }
    this.runs = this.runs.slice(0, this.runs.length - numToRemove);
    this.swims = this.swims.slice(0, this.swims.length - numToRemove);
    this.jumps = this.jumps.slice(0, this.jumps.length - numToRemove);
    this.intervals = this.intervals.slice(0, this.intervals.length - numToRemove);
    console.log("before storing old fitness records");
    await storeOldFitnessRecords(oldRecords);
  }

  async storeToAsyncStorage() {
    const serialized: SerializedActivities = {
      run: this.runs,
      swim: this.swims,
      jump: this.jumps,
      interval: this.intervals,
    }
    await setUserFitnessData(serialized);
  }

  getLastUpdated(): typeof DateTime {
    const latestWeek = this.runs[0];
    const lastUpdatedMonday = latestWeek[0].uploadDate;
    return DateTime.fromISO(lastUpdatedMonday);
  }

  getOldestDate(): typeof DateTime {
    const oldestWeek = this.runs[this.runs.length - 1];
    const oldestMonday = oldestWeek[0].uploadDate;
    return oldestMonday;
  }

  // it is assumed that fillAndRemoveOldRecords has been called by now cuz this is an instance method
  async addSession(activity: ACTIVITY_ENUMS, date: typeof DateTime, session: RunSchema | SwimSchema | JumpSchema | IntervalSchema) {
    // check if upload date already exists
    console.log("adding session: ", session, date);
    if (activity === "run") {
      let latestWeek = this.runs[0];
      for (let day = 0; day < 7; day++) {
        let sessionDate = DateTime.fromISO(latestWeek[day].uploadDate);
        if (sameDate(date, sessionDate)) {
          let runDaySession: RunSchema = latestWeek[day];
          session = session as RunSchema;
          runDaySession.cadences.push(...session.cadences);
          runDaySession.num += session.num;
          runDaySession.calories += session.calories;
          runDaySession.time += session.time;
        }
      }
    } else if (activity === "swim") {
      let latestWeek = this.swims[0];
      for (let day = 0; day < 7; day++) {
        let sessionDate = DateTime.fromISO(latestWeek[day].uploadDate);
        if (sameDate(date, sessionDate)) {
          let swimDaySession: SwimSchema = latestWeek[day];
          session = session as SwimSchema;
          swimDaySession.lapTimes.push(...session.lapTimes);
          swimDaySession.num += session.num;
          swimDaySession.calories += session.calories;
          swimDaySession.time += session.time;
        }
      }
    } else if (activity === 'interval') {
      // TO DO: FILL OUT THIS LOGIC!!!!
      let latestWeek = this.intervals[0];
      for (let day = 0; day < 7; day++) {
        let sessionDate = DateTime.fromISO(latestWeek[day].uploadDate);
        if (sameDate(date, sessionDate)) {
          let intervalDaySession: IntervalSchema = latestWeek[day];
          session = session as IntervalSchema;
          intervalDaySession.workouts.push(...session.workouts);
          intervalDaySession.time += session.time;
        }
      }
    } else {
      let latestWeek = this.jumps[0];
      for (let day = 0; day < 7; day++) {
        let sessionDate = DateTime.fromISO(latestWeek[day].uploadDate);
        if (sameDate(date, sessionDate)) {
          let jumpDaySession: JumpSchema = latestWeek[day];
          session = session as JumpSchema;
          jumpDaySession.heights.push(...session.heights);
          jumpDaySession.num += session.num;
          jumpDaySession.time += session.time;
        }
      }
    }
    // store this single session in old records
    const oldRecords: OldRecords = {
      oldRuns: activity === "run" ? [session as RunSchema] : [],
      oldSwims: activity === "swim" ? [session as SwimSchema] : [],
      oldJumps: activity === "jump" ? [session as JumpSchema] : [],
      oldIntervals: activity === "interval" ? [session as IntervalSchema] : [],
    };
    await Promise.all([
      this.storeToAsyncStorage(),
      storeOldFitnessRecords(oldRecords),
    ]);
  }
}

export {
  UserActivities,
}