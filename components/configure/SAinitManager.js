/**
 * utilities and classes for managing the device config for sadata
 */
const Buffer = require('buffer/').Buffer;
import {
  DEVICE_CONFIG_CONSTANTS,
  DEFAULT_CONFIG,
  MODES,
  getDefaultModeObject,
} from './DeviceConfigConstants';
const {
  POOL_LENGTH_CHOICES,
  BASKETBALL,
  RUN,
  SWIM,
  JUMP,
  SWIMMING_EVENT,
  TIMED_RUN,
  MUSIC_ONLY,
  CONFIG_KEY,
  MODE_CONFIG,

  VERTICAL_HEIGHT,
  HANGTIME,

  YARDS,
  METERS,
  BUTTERFLY,
  BACKSTROKE,
  BREASTROKE,
  FREESTYLE,
  IM
} = DEVICE_CONFIG_CONSTANTS;

const {
  NCAA,
  OLYMPIC,
  BRITISH,
  THIRD_M,
  THIRD_YD,
  HOME
} = POOL_LENGTH_CHOICES;

const test = [0x30, 0x33, 0x31, 0x52, 0x01, 0x78, 0x78, 0x78, 0x30, 0x30, 0x31, 0x30, 0x32, 0x30, 0x30, 0x78, 0x32, 0x31, 0x30, 0x31, 0x00, 0x00, 0x3f, 0x00, 0x48, 0x28, 0x00, 0x28, 0x01, 0x00, 0x00, 0x00, 0x3f, 0x00, 0x00, 0x30, 0x00, 0x3f, 0x00, 0x00, 0x70, 0x3c, 0x3c, 0x3c, 0x64, 0x32, 0x3f, 0x3f, 0x3f, 0x00, 0x00, 0x02, 0x00, 0x58, 0x3f, 0x00, 0x3f, 0x50, 0x50, 0x06, 0xef, 0xbf, 0xbd, 0x4b, 0x00, 0x00, 0x3f, 0x00, 0x00, 0x0a, 0x00, 0x64, 0x00, 0x00, 0x3f, 0x64, 0x64, 0x0e, 0xef, 0xbf, 0xbd, 0x5f, 0x3f, 0x00, 0x3f, 0x00, 0x00, 0x00, 0x00, 0x41, 0x3f, 0x00, 0x3f, 0x78, 0x78, 0x00, 0xef, 0xbf, 0xbd, 0x3f, 0x3f, 0x00, 0x3f, 0x00, 0x00, 0x00, 0x00, 0x03, 0x3f, 0x00, 0x3f, 0xef, 0xbf, 0xbd, 0xef, 0xbf, 0xbd, 0x02, 0x00, 0x05, 0x3f, 0x00, 0x3f, 0x00, 0x00, 0x00, 0x04, 0x08, 0x00, 0x00, 0x3f, 0x3f, 0x3f, 0x00, 0x3f, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3f, 0x3f, 0xef, 0xbf, 0xbd, 0x00,]
class SAinit {
  static SA_INIT_SIZE = 128;
  // byte characters and their meanings in sainit
  static LOWER_X = 'x'.charCodeAt(0);
  static R = 'R'.charCodeAt(0);
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
    NCAA: '0'.charCodeAt(0),
    OLYMPIC: '1'.charCodeAt(0),
    BRITISH: '2'.charCodeAt(0),
    THIRD_M: '7'.charCodeAt(0),
    THIRD_YD: '3'.charCodeAt(0),
    HOME: '5'.charCodeAt(0),
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
    this.eventLookupTable = {};
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
   * deletes the mode config at the index in the deviceConfig array
   * @param {int} index 
   */
  delete(deleteIndex) {
    if (deleteIndex === 0) {
      console.log("cannot delete the 0th index that is music only");
      return;
    }
    if (this.deviceConfig.length === 0) {
      console.log('Something is wrong: deviceConfig is empty when trying to delete at index: ', deleteIndex);
      return;
    }
    this.deviceConfig = this.deviceConfig.filter((_, idx) => {
      return deleteIndex !== idx;
    });
  }

  /**
   * adds a new default mode object to the device config
   */
  addNewMode(mode) {
    const modeObject = getDefaultModeObject[mode];
    if (!modeObject) {
      console.log(`mode ${mode} is not a valid mode`);
      return;
    }
    this.deviceConfig.push(modeObject);
  }

  /**
   * replaces the mode object at index with newModeObject
   * @param {int} index 
   * @param {Object} newModeObject
   */
  saveNewModeObject(index, newModeObject) {
    this.deviceConfig[index] = newModeObject;
  }

  /**
   * converts the deviceConfig array to the 128 byte sainit array
   */
  createSaInit() {
    // set the first 8 bytes
    const sainit = Buffer.alloc(SAinit.SA_INIT_SIZE);
    this.deviceConfig.forEach((modeObject, idx) => {
      if (idx === 0) {
        sainit[idx] = SAinit.ZERO;
      } else {
        switch(modeObject.mode) {
          case RUN:
            sainit[idx] = SAinit.R;
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
          case TIMED_RUN:
            this._setTimerConfig(sainit, modeObject, idx);
            break;
          default:
            // set it as unused
            sainit[idx] = SAinit.LOWER_X;
            break;
        }
      }
    });
    for (let i = this.deviceConfig.length; i < 8; i++) {
      sainit[i] = SAinit.LOWER_X;
    }
    sainit[7] = SAinit.LOWER_X; // make sure 8th byte is always unused
    for (let i = 0; i < 128; i++) {
      if (sainit[i] !== test[i]) {
        console.log(`expected ${test[i].toString(16)} but got ${sainit[i].toString(16)} at index ${i}`);
      } else {
        console.log(sainit[i].toString(16));
      }
    }
    console.log("in utf8: ", sainit.toString('utf8'));
    return sainit;
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
    sainit[idx] = SAinit.R;
    switch(runObject.trigger) {
      case DEVICE_CONFIG_CONSTANTS.TRIGGER_STEPS:
        sainit[idx + 8] = SAinit.ONE;
        break;
      case DEVICE_CONFIG_CONSTANTS.TRIGGER_MIN:
        sainit[idx + 8] = SAinit.ZERO;
        break;
      default:
        console.log(`trigger of ${runObject.trigger} is not valid`);
        return;
    }
    sainit[idx + 16] = runObject.numUntilTrigger + SAinit.ZERO;
    // set cadence thresholds
    console.log(`cadence thresholds: ${this.cadenceThresholds}`); // 30 65 80
    sainit[idx + 24] = this.cadenceThresholds[0];
    sainit[idx + 32] = this.cadenceThresholds[1];
    sainit[idx + 40] = this.cadenceThresholds[2];
    // set neffort thresholds
    console.log(`run efforts: ${this.runEfforts}`); // 1 2 4 6
    sainit[idx + 48] = this.runEfforts[0];
    sainit[idx + 56] = this.runEfforts[1];
    sainit[idx + 64] = this.runEfforts[2];
    sainit[idx + 72] = this.runEfforts[3];
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
    sainit[idx + 16] = SAinit.POOL_LENGTH_MAP[poolLength];
    // set reference times here
    var dt = poolLength === OLYMPIC ? 0.8 : 0.4;
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
    sainit[idx + 96]  = parseInt(this.swimEfforts[0]);
    sainit[idx + 104] = parseInt(this.swimEfforts[1]);
    sainit[idx + 112] = parseInt(this.swimEfforts[2]);
    sainit[idx + 120] = parseInt(this.swimEfforts[3]);
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
    this._buildEventLookupTable();
    const { distance, stroke, splits, poolLength } = swimmingEventObject;
    const metric = poolLength === OLYMPIC || poolLength === THIRD_M || poolLength === BRITISH ? METERS : YARDS;
    console.log(distance, metric, stroke);
    sainit[idx] = this.eventLookupTable[metric][stroke][distance];
    var offset8 = Buffer.alloc(1);
    // bits 2-7 are number of laps for the race
    // set bits 0-5 and then left shift
    if (metric === METERS) {
      offset8[0] = parseInt(Math.ceil(distance / 50));
    } else {
      offset8[0] = parseInt(Math.ceil(distance / 25));
    }
    offset8[0] = offset8[0] << 2; // left shift by 2
    if (distance === 400 && stroke === IM) {
      offset8[0] = offset8[0] & 0x01; // set lsb to 1 for 400 im
    }
    offset8[0] = offset8[0] | 0x02; // for now only start with countdown. Bit 1 = 1
    sainit[idx + 8] = offset8[0];
    sainit[idx + 16] = SAinit.POOL_LENGTH_MAP[poolLength]; // set swimming pool length

    // set the split reference times
    var totalTimeInTenths = 0;
    splits.forEach((time, i) => {
      const timeInTenths = parseInt(Math.ceil(time / 0.1));
      console.log(`time in tenths: ${timeInTenths.toString(16)} at index ${i}`);
      totalTimeInTenths += timeInTenths;
      sainit[idx + 32 + i*16] = (timeInTenths & 0xff00) >> 8; // second lsb
      sainit[idx + 32 + i*16+8] = timeInTenths & 0xff; // lsb
    });
    // set the total event time
    sainit[idx + 96] = (totalTimeInTenths & 0xff00) >> 8; // second lsb
    sainit[idx + 104] = totalTimeInTenths & 0xff; // lsb
    // set the personal best time (RN DOES NOT INCLUDE)
    console.log('set swimming event config: ', sainit);
  }

  /**
   * Given the index of the timer mode in the sainit array, set the rest of the timer config
   * given the timer mode object according to the sainit docs
   * @param {Buffer} sainit 
   * @param {Object} runObject 
   * @param {int} idx 
   */
  _setTimerConfig(sainit, raceObject, idx) {

  }
}
export default SAinit;