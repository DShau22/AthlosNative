/**
 * utilities and classes for managing the device config for sadata
 */
const Buffer = require('buffer/').Buffer;
import {
  DEVICE_CONFIG_CONSTANTS,
  MUSCLE_GROUP_LIST,
  STROKES_LIST,
  DISTANCES_LIST,
  SwimWorkoutInterface,
  SwimSet,
} from '../configure/DeviceConfigConstants';
const {
  POOL_LENGTH_CHOICES,
  BASKETBALL,
  RUN,
  SWIM,
  JUMP,
  SWIMMING_EVENT,
  SWIM_WORKOUT,
  INTERVAL,
  TIMER,
  MUSIC_ONLY,
  RANDOM_MUSIC_SEQUENCE,
  ORDER_BY_DATE,

  REPEAT_LAST,
  CYCLES,
  ENDS,
  TRIGGER_STEPS,
  TRIGGER_MIN,

  VERTICAL_HEIGHT,
  HANGTIME,

  YARDS,
  METERS,
  BUTTERFLY,
  BACKSTROKE,
  BREASTROKE,
  FREESTYLE,
  IM,
} = DEVICE_CONFIG_CONSTANTS;

const {
  NCAA,
  OLYMPIC,
  BRITISH,
  THIRD_M,
  THIRD_YD,
  HOME
} = POOL_LENGTH_CHOICES;

class SAinit {
  static SA_INIT_SIZE = 128;
  // byte characters and their meanings in sainit
  static LOWER_X = 'x'.charCodeAt(0);
  static R = 'R'.charCodeAt(0);
  static W = 'W'.charCodeAt(0);
  static ZERO = '0'.charCodeAt(0);
  static ONE = '1'.charCodeAt(0);
  static TWO = '2'.charCodeAt(0);
  static THREE = '3'.charCodeAt(0);
  static FOUR = '4'.charCodeAt(0);
  static FIVE = '5'.charCodeAt(0);
  static SIX = '6'.charCodeAt(0);
  static SEVEN = '7'.charCodeAt(0);
  static EIGHT = '8'.charCodeAt(0);
  static NINE = '9'.charCodeAt(0);
  static A = 'A'.charCodeAt(0);
  static B = 'B'.charCodeAt(0);
  static C = 'C'.charCodeAt(0);
  static D = 'D'.charCodeAt(0);
  static E = 'E'.charCodeAt(0);
  static G = 'G'.charCodeAt(0);
  static POOL_LENGTH_MAP = {
    [NCAA]: '0'.charCodeAt(0),
    [OLYMPIC]: '1'.charCodeAt(0),
    [BRITISH]: '2'.charCodeAt(0),
    [THIRD_M]: '7'.charCodeAt(0),
    [THIRD_YD]: '3'.charCodeAt(0),
    [HOME]: '5'.charCodeAt(0),
  }
  constructor(
    initialDeviceConfig,
    userSettings,
    userRunEfforts,
    userSwimEfforts,
    userReferenceTimes,
    cadenceThresholds,
    bestJump) {
    this.deviceConfig = initialDeviceConfig; // an array of mode config objects
    this.settings = userSettings; // must be READ ONLY
    this.runEfforts = userRunEfforts;
    this.swimEfforts = userSwimEfforts;
    this.refTimes = userReferenceTimes;
    this.cadenceThresholds = cadenceThresholds;
    this.bestJump = bestJump;
    this.eventLookupTable = null;
  }

  // creates the event lookup table needed for swimming events
  _buildEventLookupTable() {
    this.eventLookupTable = {
      [YARDS]: {
        [BUTTERFLY]: {
          ['50']: 9,
          ['100']: 10,
          ['200']: 11
        },
        [BACKSTROKE]: {
          ['50']: 6,
          ['100']: 7,
          ['200']: 8
        },
        [BREASTROKE]: {
          ['50']: 12,
          ['100']: 13,
          ['200']: 14
        },
        [FREESTYLE]: {
          ['50']: 0,
          ['100']: 1,
          ['200']: 2,
          ['500']: 3,
          ['1000']: 4,
          ['1650']: 5,
        },
        [IM]: {
          ['100']: 15,
          ['200']: 16,
          ['400']: 17
        }
      },
      [METERS]: {
        [BUTTERFLY]: {
          ['50']: 27,
          ['100']: 28,
          ['200']: 29
        },
        [BACKSTROKE]: {
          ['50']: 24,
          ['100']: 25,
          ['200']: 26
        },
        [BREASTROKE]: {
          ['50']: 30,
          ['100']: 31,
          ['200']: 32
        },
        [FREESTYLE]: {
          ['50']: 18,
          ['100']: 19,
          ['200']: 20,
          ['400']: 21,
          ['800']: 22,
          ['1500']: 23,
        },
        [IM]: {
          ['200']: 33,
          ['400']: 34
        }
      },
    };
  }
  /**
   * converts the deviceConfig array to the 128 byte sainit array
   */
  createSaInit() {
    // set the first 8 bytes
    const sainit = Buffer.alloc(SAinit.SA_INIT_SIZE);
    this.deviceConfig.forEach((modeObject, idx) => {
      switch(modeObject.mode) {
        case MUSIC_ONLY:
          this._setMusicConfig(sainit, modeObject, idx);
          break;
        case RUN:
          this._setRunConfig(sainit, modeObject, idx);
          break;
        case SWIM:
          this._setSwimConfig(sainit, modeObject, idx);
          break;
        case JUMP:
          this._setJumpConfig(sainit, modeObject, idx);
          break;
        case SWIMMING_EVENT:
          this._setSwimmingEventConfig(sainit, modeObject, idx);
          break;
        case INTERVAL:
          this._setIntervalConfig(sainit, modeObject, idx);
          break;
        case TIMER:
          this._setTimerConfig(sainit, modeObject, idx);
          break;
        case SWIM_WORKOUT:
          this._setSwimWorkoutConfig(sainit, modeObject, idx);
          break;
        default:
          // set it as unused
          sainit[idx] = SAinit.ZERO;
          break;
      }
    });
    for (let i = this.deviceConfig.length; i < 8; i++) {
      sainit[i] = SAinit.LOWER_X;
    }
    sainit[7] = SAinit.LOWER_X; // make sure 8th byte is always unused
    for (let i = 0; i < 128; i++) {
      console.log(`index ${i}: ${sainit[i].toString(16)}`);
    }
    console.log("in utf8: ", sainit.toString('utf8'));
    return sainit;
  }

  _setMusicConfig(sainit, musicObject, idx) {
    console.log("setting music config: ", musicObject);
    const { musicPlaySequence } = musicObject;
    sainit[8] = musicPlaySequence === ORDER_BY_DATE ? SAinit.ZERO : SAinit.THREE;
  }

  /**
   * Given the index of the run mode in the sainit array, set the rest of the running config
   * given the run mode object according to the sainit docs
   * @param {Buffer} sainit 
   * @param {Object} runObject 
   * @param {int} idx 
   */
  _setRunConfig(sainit, runObject, idx) {
    console.log("setting run config: ", runObject);
    const { trigger, numUntilTrigger, reportCalories, walking } = runObject;
    sainit[idx] = walking ? SAinit.W : SAinit.R;
    if (trigger === TRIGGER_STEPS) {
      if (reportCalories) {
        sainit[idx + 8] = SAinit.ONE;
      } else {
        sainit[idx + 8] = SAinit.THREE;
      }
    } else {
      if (reportCalories) {
        sainit[idx + 8] = SAinit.ZERO;
      } else {
        sainit[idx + 8] = SAinit.TWO;
      }
    }
    sainit[idx + 16] = numUntilTrigger + SAinit.ZERO;
    // set cadence thresholds
    console.log(`cadence thresholds: ${this.cadenceThresholds}`); // 30 65 80
    sainit[idx + 24] = this.cadenceThresholds[0];
    sainit[idx + 40] = 100; // make the +2 almost impossible to obtain for now. Would needa do 200 steps per minute
    if (walking) {
      sainit[idx + 32] = this.cadenceThresholds[1]; // walking cadence
    } else {
      sainit[idx + 32] = this.cadenceThresholds[2]; // running cadence
    }
    // set neffort thresholds
    console.log(`run efforts: ${this.runEfforts}`); // 1 2 4 6 default
    sainit[idx + 48] = parseInt(Math.round(this.runEfforts[0]));
    sainit[idx + 56] = parseInt(Math.round(this.runEfforts[1]));
    sainit[idx + 64] = parseInt(Math.round(this.runEfforts[2]));
    sainit[idx + 72] = parseInt(Math.round(this.runEfforts[3]));
    console.log("set run config: ", sainit);
  }

  /**
   * Given the index of the swim mode in the sainit array, set the rest of the swimming config
   * given the swim mode object according to the sainit docs
   * @param {Buffer} sainit 
   * @param {Object} runObject 
   * @param {int} idx 
   */
  _setSwimConfig(sainit, swimObject, idx) {
    console.log("setting swim config: ", swimObject);
    // use the 8 bits to create a bitmap for which reporting options to include
    // rn just uses 4
    // order is lap time, lap count, calories, stroke,
    // bit is 0 if that stat should be reported
    sainit[idx] = SAinit.ONE;
    const bitmap = Buffer.alloc(1);
    const metrics = new Set(swimObject.metrics);
    if (!metrics.has(DEVICE_CONFIG_CONSTANTS.LAP_COUNT)) {
      bitmap[0] = bitmap[0] | 0x08;
    }
    if (!metrics.has(DEVICE_CONFIG_CONSTANTS.LAPTIME)) {
      bitmap[0] = bitmap[0] | 0x04;
    }
    if (!metrics.has(DEVICE_CONFIG_CONSTANTS.CALORIES)) {
      bitmap[0] = bitmap[0] | 0x02;
    }
    if (!metrics.has(DEVICE_CONFIG_CONSTANTS.STROKE)) {
      bitmap[0] = bitmap[0] | 0x01;
    }
    sainit[idx + 8] = bitmap[0] + SAinit.ZERO;
    // set swimming pool length
    const { poolLength } = swimObject;
    console.log("pool length: ", poolLength);
    console.log(SAinit.POOL_LENGTH_MAP[poolLength]);
    sainit[idx + 16] = SAinit.POOL_LENGTH_MAP[poolLength];
    // set reference times here
    const dt = poolLength === OLYMPIC ? 0.8 : 0.4;
    console.log(`Reftimes fly: ${this.refTimes.fly}`); // 22 20
    console.log(`Reftimes back: ${this.refTimes.back}`); // 30 26
    console.log(`Reftimes breast: ${this.refTimes.breast}`); // 32 28
    console.log(`Reftimes free: ${this.refTimes.free}`); // 25 22
    sainit[idx + 32] = parseInt(Math.ceil(this.refTimes.fly[0] / dt));
    sainit[idx + 40] = parseInt(Math.ceil(this.refTimes.fly[1] / dt));
    sainit[idx + 48] = parseInt(Math.ceil(this.refTimes.back[0] / dt));
    sainit[idx + 56] = parseInt(Math.ceil(this.refTimes.back[1] / dt));
    sainit[idx + 64] = parseInt(Math.ceil(this.refTimes.breast[0] / dt));
    sainit[idx + 72] = parseInt(Math.ceil(this.refTimes.breast[1] / dt));
    sainit[idx + 80] = parseInt(Math.ceil(this.refTimes.free[0] / dt));
    sainit[idx + 88] = parseInt(Math.ceil(this.refTimes.free[1] / dt));
    // set effort levels here
    console.log(`Swim Efforts: ${this.swimEfforts}`); // 4 8 12 16
    sainit[idx + 96]  = parseInt(Math.round(this.swimEfforts[0]));
    sainit[idx + 104] = parseInt(Math.round(this.swimEfforts[1]));
    sainit[idx + 112] = parseInt(Math.round(this.swimEfforts[2]));
    sainit[idx + 120] = parseInt(Math.round(this.swimEfforts[3]));
    console.log('set swim config: ', sainit);
  }

  /**
   * Given the index of the jump mode in the sainit array, set the rest of the jump config
   * given the jump mode object according to the sainit docs
   * @param {Buffer} sainit 
   * @param {Object} runObject 
   * @param {int} idx 
   */
  _setJumpConfig(sainit, jumpObject, idx) {
    console.log("setting jump config: ", jumpObject);
    if (jumpObject.metric === HANGTIME) {
      sainit[idx] = SAinit.FOUR;
    } else if (jumpObject.metric === BASKETBALL) {
      sainit[idx] = SAinit.FIVE;
    } else {
      sainit[idx] = SAinit.THREE;
    }
    // Best jump is stored with 2 bytes. Stores number of .1 inches the user jumped
    const numberOfTenths = parseInt(Math.ceil(this.bestJump / 0.1));
    console.log(`Current best jump: ${this.bestJump}`);
    console.log(`Current best jump in tenths: ${numberOfTenths}`);
    if (this.bestJump === 0) {
      // User hasn't jumped yet so no encouragement
      for (let i = 32; i <= 104; i += 8) {
        sainit[idx + i] = 100;
      }
    } else {
      sainit[idx + 104] = numberOfTenths & 0xff; // the least significant byte
      sainit[idx + 96] = (numberOfTenths & 0xff00) >> 8; // the second least significant byte 
      const level4 = numberOfTenths - 30;
      const level3 = numberOfTenths - 50;
      const level2 = numberOfTenths - 70;
      const level1 = numberOfTenths - 100;
      sainit[idx + 88] = level4 & 0xff;
      sainit[idx + 80] = (level4 & 0xff00) >> 8;

      sainit[idx + 72] = level3 & 0xff;
      sainit[idx + 64] = (level3 & 0xff00) >> 8;

      sainit[idx + 56] = level2 & 0xff;
      sainit[idx + 48] = (level2 & 0xff00) >> 8;

      sainit[idx + 40] = level1 & 0xff;
      sainit[idx + 32] = (level1 & 0xff00) >> 8;
    }
    console.log("set jump config: ", sainit);
  }

  /**
   * Given the index of the swimmg event mode in the sainit array, set the rest of the swimmg event config
   * given the swimmg event mode object according to the sainit docs
   * @param {Buffer} sainit 
   * @param {Object} runObject 
   * @param {int} idx 
   */
  _setSwimmingEventConfig(sainit, swimmingEventObject, idx) {
    console.log("setting race config: ", swimmingEventObject);
    // build the event lookup table only if we have a swimming event config
    if (!this.eventLookupTable) {
      this._buildEventLookupTable();
    }
    const { distance, stroke, splits, poolLength } = swimmingEventObject;
    if (splits.length > 4)
      throw new Error(`split array must have less than 4 elements. Got:${splits.length}`);
    const metric = poolLength === OLYMPIC || poolLength === THIRD_M || poolLength === BRITISH ? METERS : YARDS;
    console.log(distance, metric, stroke);
    sainit[idx] = this.eventLookupTable[metric][stroke][distance];
    var offset8 = Buffer.alloc(1);
    // bits 2-7 are number of laps for the race
    // set bits 0-5 and then left shift
    offset8[0] = splits.length - 1;
    offset8[0] = offset8[0] << 4; // left shift by 3
    if (distance === 400 && stroke === IM) {
      offset8[0] |= 0x01; // set lsb to 1 for 400 im
    }
    offset8[0] |= 0x02; // for now only start with countdown. Bit 1 = 1
    if (distance > 200) { // repeat last time, so bit 2 is set to 1
      offset8[0] |= 0x04 // for now only stops at end or repeats last time if distance > 200. No cycling.
    }
    sainit[idx + 8] = offset8[0] + SAinit.ZERO;
    sainit[idx + 16] = SAinit.POOL_LENGTH_MAP[poolLength]; // set swimming pool length
    if (poolLength === OLYMPIC || poolLength === THIRD_M || poolLength === BRITISH) { // number of laps
      sainit[idx + 24] = parseInt(Math.floor(distance/50)) + SAinit.ZERO; 
    } else {
      sainit[idx + 24] = parseInt(Math.floor(distance/25)) + SAinit.ZERO; 
    }

    // set the split reference times
    var totalTimeInTenths = 0;
    for (let i = 0; i < splits.length; i++) {
      const timeInTenths = splits[i] * 10;
      console.log(`time in tenths: ${timeInTenths.toString(16)} at index ${i}`);
      totalTimeInTenths += timeInTenths;
      sainit[idx + 32 + i*16] = (timeInTenths & 0xff00) >> 8; // second lsb
      sainit[idx + 32 + i*16+8] = timeInTenths & 0xff; // lsb
    }
    // set the total event time
    sainit[idx + 96] = (totalTimeInTenths & 0xff00) >> 8; // second lsb
    sainit[idx + 104] = totalTimeInTenths & 0xff; // lsb
    // set the personal best time (RN DOES NOT INCLUDE)
    sainit[idx + 112] = 0;
    sainit[idx + 120] = 2;
    console.log('set swimming event config: ', sainit);
  }

  /**
   * Given the index of the timer mode in the sainit array, set the rest of the timer config
   * given the timer mode object according to the sainit docs
   * @param {Buffer} sainit 
   * @param {Object} runObject 
   * @param {int} idx 
   */
  _setTimerConfig(sainit, timerObject, idx) {
    console.log("setting timer config: ", timerObject);
    const { splits, repetition, numRepetitions } = timerObject;
    sainit[idx] = 35;
    var offset8 = Buffer.alloc(1);
    if (splits.length > 6)
      throw new Error(`num rounds must be less or equal to 6. Got:${splits}`);
    offset8[0] = splits.length - 1; // bits 7:4 are number of time periods - 1
    offset8[0] = offset8[0] << 4;
    offset8[0] |= 0x02; // start by countdown by setting second lsb to 1
    if (repetition === REPEAT_LAST) {
      offset8[0] |= 0x04;
      sainit[idx + 16] = splits.length + numRepetitions + SAinit.ZERO; // no repeat periods for now to simplify interface
    } else if (repetition === CYCLES) {
      offset8[0] |= 0x08;
      sainit[idx + 16] = numRepetitions * splits.length + SAinit.ZERO; // no repeat periods for now to simplify interface
    } else { // ends after last period
      sainit[idx + 16] = splits.length + SAinit.ZERO;
    }
    sainit[idx + 8] = offset8[0] + SAinit.ZERO;
    splits.forEach((timeInTenths, i) => {
      sainit[idx + 32 + i*16] = (timeInTenths & 0xff00) >> 8;
      sainit[idx + 32 + i*16+8] = timeInTenths & 0xff;
    });
    console.log("set timer config: ", sainit);
  }

  /**
   * Given the index of the timer mode in the sainit array, set the rest of the timer config
   * given the timer mode object according to the sainit docs
   * @param {Buffer} sainit 
   * @param {Object} runObject 
   * @param {int} idx 
   */
  _setIntervalConfig(sainit: Buffer, intervalObject, idx) {
    console.log("setting interval config: ", intervalObject);
    const { intervals, numRounds } = intervalObject;
    sainit[idx] = 36;
    var offset8 = Buffer.alloc(1);
    if (numRounds > 10)
      throw new Error(`num rounds must be less than 11. Got:${numRounds}`);
    if (intervals.length > 6)
      throw new Error(`num rounds must be less than 7. Got:${intervals}`);
    offset8[0] = intervals.length - 1; // bits 7:4 are number of intervals - 1
    offset8[0] = offset8[0] << 4;
    // always stop at end of interval training, so no need to set bits 3:2
    offset8[0] |= 0x02; // start by countdown by setting second lsb to 1
    // intervals either cycle or end based on how many rounds there are
    if (numRounds > 1) {
      offset8[0] |= 0x08; // cycle by setting the 4th lsb to 1
    }
    sainit[idx + 8] = offset8[0] + SAinit.ZERO;
    sainit[idx + 16] = numRounds * intervals.length + SAinit.ZERO; // total time periods
    intervals.forEach(({time, muscleGroup}, i) => {
      // upper 10 bits is time in seconds
      sainit[idx + 32 + i*16] = (time & 0x03fc) >> 2; // bits 9:2 shifted right by two
      sainit[idx + 32 + i*16+8] = (time & 0x03) << 6; // bits 1:0 shifted 6 since 6 LSBs are for file selection
      sainit[idx + 32 + i*16+8] += MUSCLE_GROUP_LIST.indexOf(muscleGroup);
    });
    console.log("set interval config: ", sainit);
  }

  _setSwimWorkoutConfig(sainit: Buffer, workoutObject: SwimWorkoutInterface, idx: number) {
    console.log("setting swim workout config: ", workoutObject);
    const { sets, numRounds } = workoutObject;
    sainit[idx] = 37;
    var offset8 = Buffer.alloc(1);
    if (sets.length > 6)
      throw new Error(`num sets must be less or equal to 6. Got:${sets}`);
    offset8[0] = sets.length - 1; // bits 7:4 are number of sets - 1
    offset8[0] = offset8[0] << 4;
    // always stop at end of interval training, so no need to set bits 3:2
    offset8[0] |= 0x02; // start by countdown by setting second lsb to 1
    // intervals either cycle or end based on how many rounds there are
    if (numRounds > 1) {
      offset8[0] |= 0x08; // cycle by setting the 4th lsb to 1
    }
    sainit[idx + 8] = offset8[0] + SAinit.ZERO;
    var numDistancesPerRound = 0;
    for (let i = 0; i < sets.length; i++) {
      numDistancesPerRound += sets[i].reps;
    }
    sainit[idx + 16] = (numRounds * numDistancesPerRound) + SAinit.ZERO; // total number of sets
    sets.forEach(({reps, distance, stroke, timeInSeconds}, i) => {
      let twoByteParameters = 0; // ints in javascript are 32 bits
      // 15:13 + 1 is # repeats
      console.log("reps: ", reps);
      twoByteParameters |= ((parseInt(reps) - 1) << 13);
      console.log("15:13", twoByteParameters.toString(2));
      // 12:10 is distance
      let distanceBitRep = DISTANCES_LIST.indexOf(parseInt(distance));
      twoByteParameters |= distanceBitRep >= 0 ? (distanceBitRep << 10) : (3 << 10);
      console.log("12:10", twoByteParameters.toString(2));
      // 9:6 is stroke
      let strokeBitRep = STROKES_LIST.indexOf(stroke);
      twoByteParameters |= strokeBitRep >= 0 ? (strokeBitRep << 6) : (3 << 6);
      console.log("9:6", twoByteParameters.toString(2));
      if (distance <= 200) {
        // lower 6 bits is time in 10 seconds
        let timeIn5Seconds = parseInt(Math.ceil(timeInSeconds / 5));
        if (timeIn5Seconds > 63) {
          throw new Error(`time in 5 seconds must be less than 63. Got ${timeIn5Seconds}`);
        }
        twoByteParameters |= timeIn5Seconds;
      } else {
        // lower 6 bits is time in 5 seconds
        let timeIn10Seconds = parseInt(Math.ceil(timeInSeconds / 10));
        if (timeIn10Seconds > 63) {
          throw new Error(`time in 5 seconds must be less than 63. Got ${timeIn10Seconds}`);
        }
        twoByteParameters |= timeIn10Seconds;
      }
      console.log("5:0", twoByteParameters.toString(2));
      console.log("top 8 anded: ", ((twoByteParameters & 0x0000ff00) >> 8).toString(2));
      console.log("top 8 anded: ", (twoByteParameters & 0x000000ff).toString(2));
      sainit[idx + 32 + i*16] = (twoByteParameters & 0x0000ff00) >> 8; // bits [15:8]
      sainit[idx + 32 + i*16+8] = twoByteParameters & 0x000000ff; // bits [7:0]
    });
    console.log("set swim workout config: ", sainit);
  }
}
export default SAinit;