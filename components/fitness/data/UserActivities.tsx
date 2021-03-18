/**
 * A class with factory constructors that represent a user's fitness.
 * Can be easily worked with to display different statistics
 */
import FITNESS_CONSTANTS from '../FitnessConstants';
import {
  storeOldFitnessRecords,
  getOldFitnessRecords,
  getToken,
  getUserFitnessData,
  setOldFitnessRecords,
  setUserFitnessData,
} from '../../utils/storage';
import {
  getLastMonday
} from '../../utils/dates';
import ENDPOINTS from '../../endpoints';
import Axios from 'axios';
import { run } from 'jest';
const { DateTime } = require('luxon');

type ACTIVITY_ENUMS = "run" | "swim" | "jump";
type DAY_INDICES = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface RunSchema {
  _id?: string,
  userID: string,
  uploadDate: string,
  num: number,
  cadences: Array<number>,
  walkCadences?: Array<number>,
  calories: number,
  time: number,
  uploadedToServer: boolean,
}

interface Lap {
  finished: boolean,
  lapTime: number,
}
interface SwimSchema {
  _id?: string,
  userID: string,
  uploadDate: string,
  num: number,
  lapTimes: Array<Lap>,
  strokes: Array<string>,
  calories: number,
  time: number,
  uploadedToServer: boolean,
}

interface JumpSchema {
  _id?: string,
  userID: string,
  uploadDate: string,
  num: number,
  heights: Array<number>,
  shotsMade: number,
  time: number,
  uploadedToServer: boolean,
}

interface RunActivitiesInterface {
  [weekMondayDate: string]: Array<RunSchema>;
};
interface SwimActivitiesInterface {
  [weekMondayDate: string]: Array<SwimSchema>;
};
interface JumpActivitiesInterface {
  [weekMondayDate: string]: Array<JumpSchema>;
};

interface SerializedActivities {
  run: RunActivitiesInterface,
  swim: SwimActivitiesInterface,
  jump: JumpActivitiesInterface
}

interface OldRecords {
  oldRuns: Array<RunSchema>,
  oldSwims: Array<SwimSchema>,
  oldJumps: Array<JumpSchema>
}

interface SwimReferenceTimes {
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

const blank_week = (activity: ACTIVITY_ENUMS, mondayDate: typeof DateTime) => {
  if (mondayDate.day !== 1) {
    throw Error(`Expected a monday but got: ${mondayDate.day}`);
  }
  var result = Array(7);
  for (let day = 0; day < 7; day ++) {
    result[day] =
      activity === "run" ? blank_run(mondayDate.plus(day)) :
      activity === "swim" ? blank_swim(mondayDate.plus(day)) :
      activity === "jump" ? blank_jump(mondayDate.plus(day)) : null;
  }
  return result;
} 

// Object remplate for storing to async storage

class UserActivities {
  public runs: RunActivitiesInterface;
  public swims: SwimActivitiesInterface;
  public jumps: JumpActivitiesInterface;
  public static WEEKS_BACK = 26;

  static async createFromStorage(): Promise<UserActivities> {
    const userActivityData: SerializedActivities = await getUserFitnessData();
    if (userActivityData) {
      return new this(userActivityData);
    } else {
      return null;
    }
  }

  static createBlankActivities(): UserActivities {
    return new this();
  }

  static async createFromServer(): Promise<UserActivities> {
    const newActivities: SerializedActivities = {
      run: {},
      swim: {},
      jump: {},
    };
    // grab fitness from server and store it
    var lastUpdated = getLastMonday();
    lastUpdated = lastUpdated.minus({days: (UserActivities.WEEKS_BACK + 1) * 7});
    console.log("last updated create from server: ", lastUpdated);
    const userToken: string = await getToken();
    const activities: Array<ACTIVITY_ENUMS> = ["run", "swim", "jump"];
    const activityData = {};
    for (let i = 0; i < activities.length; i++) {
      const res = await Axios.post(ENDPOINTS.getUserFitness, {
        userToken,
        activity: activities[i],
        lastUpdated: lastUpdated.toISODate(),
        userToday: DateTime.local().toISODate(), // use the zone rn because if last updated was b4 DST it'll be off for server
      });
      // CHANGE THIS ENDPOINT WHEN TIME PERMITS
      if (!res.data.success) {
        throw new Error(res.data.message);
      }
      activityData[activities[i]] = res.data.activityData;
    }
    for (let i = 0; i < activities.length; i++) {
      let activity = activities[i];
      for (let j = 0; j < activityData[activity].length; j++) {
        let week = activityData[activity][j];
        let weekMondayDate = DateTime.fromISO(week[0].uploadDate);
        newActivities[activity][weekMondayDate.toISODate()] = week;
      }
    }
    return new this(newActivities);
  }

  constructor(activitiesObj?: SerializedActivities) {
    if (activitiesObj) {
      this.runs = activitiesObj.run;
      this.swims = activitiesObj.swim;
      this.jumps = activitiesObj.jump;
    } else {
      const blankActivities: SerializedActivities = {
        run: {},
        swim: {},
        jump: {},
      };
      const today = DateTime.local();
      var startMondayDate : typeof DateTime = getLastMonday(today.minus({days: UserActivities.WEEKS_BACK * 7}));
      var startMondayString = startMondayDate.toISODate();
      for (let j = 0; j <= UserActivities.WEEKS_BACK; j++) {
        blankActivities.run[startMondayString] = blank_week("run", startMondayDate);
        blankActivities.swim[startMondayString] = blank_week("swim", startMondayDate);
        blankActivities.jump[startMondayString] = blank_week("jump", startMondayDate);
        startMondayDate = startMondayDate.plus({days: 7});
      }
      this.runs = blankActivities.run;
      this.swims = blankActivities.swim;
      this.jumps = blankActivities.jump;
    }
  }

  static async uploadStoredOldRecords() {
    const oldFitnessRecords: OldRecords = await getOldFitnessRecords();
    console.log("old records: ", oldFitnessRecords);
    if (!oldFitnessRecords) { return; }
    const token = await getToken();
    const res = await Axios.post(ENDPOINTS.uploadFitnessRecords, {
      token,
      runs: oldFitnessRecords.oldRuns,
      swims: oldFitnessRecords.oldSwims,
      jumps: oldFitnessRecords.oldJumps,
    });
    if (!res.data.success) {
      throw new Error(res.data.message);
    }
    await setOldFitnessRecords({
      oldRuns: [],
      oldSwims: [],
      oldJumps: [],
    });
  }

  // fills with empty fitness records and removes old ones if needed
  // Tries to upload old records to DB. If fail then store to Async storage and try again
  // next time.

  async fillAndRemoveOldRecords() {
    const today = DateTime.local();
    var userLastUpdated: typeof DateTime = this.getLastUpdated();
    // fill in empty fitness records if needed
    userLastUpdated = userLastUpdated.plus({days: 7});
    while (userLastUpdated.startOf("day") <= today.startOf("day")) {
      this.runs[userLastUpdated.toISODate()] = blank_week("run", userLastUpdated);
      this.swims[userLastUpdated.toISODate()] = blank_week("swim", userLastUpdated);
      this.jumps[userLastUpdated.toISODate()] = blank_week("jump", userLastUpdated);
      userLastUpdated = userLastUpdated.plus({days: 7});
    }
    // remove old records and store to async storage
    var oldestDate = this.getOldestDate();
    var numToRemove = Object.keys(this.runs).length - UserActivities.WEEKS_BACK;
    const oldRecords: OldRecords = {
      oldRuns: [],
      oldSwims: [],
      oldJumps: [],
    };
    // INEFFICIENT. CONSIDER SORTING AND REMOVING OLDEST ___ DATES 
    console.log("num to remove: ", numToRemove);
    console.log("runs dates: ", Object.keys(this.runs));
    while (numToRemove > 0) {
      const oldestDateString = oldestDate.toISODate();
      console.log("oldest date: ", oldestDateString);
      console.log(this.runs[oldestDateString]);
      for (let i = 0; i < this.runs[oldestDateString].length; i++) {
        let runRecord: RunSchema = this.runs[oldestDateString][i];
        let swimRecord: SwimSchema = this.swims[oldestDateString][i];
        let jumpRecord: JumpSchema = this.jumps[oldestDateString][i];
        if (runRecord.cadences.length > 0 && !runRecord.uploadedToServer) {
          oldRecords.oldRuns.push(runRecord);
        }
        if (swimRecord.lapTimes.length > 0 && !swimRecord.uploadedToServer) {
          oldRecords.oldSwims.push(swimRecord);
        }
        if (jumpRecord.heights.length > 0 && !jumpRecord.uploadedToServer) {
          oldRecords.oldJumps.push(jumpRecord);
        }
      }
      delete this.runs[oldestDateString];
      delete this.swims[oldestDateString];
      delete this.jumps[oldestDateString];
      numToRemove -= 1;
      oldestDate = this.getOldestDate();
    }
    await storeOldFitnessRecords(oldRecords);
  }

  async uploadDayRecord(activity: ACTIVITY_ENUMS, week: string | typeof DateTime, day: DAY_INDICES) {
    const weekKey = typeof week === "string" ? week : week.toISODate(); 
    const token = await getToken();
    const res = await Axios.post(ENDPOINTS.uploadFitnessRecords, {
      token,
      runs: activity === "run" ? [this.runs[weekKey][day]] : [],
      swims: activity === "swim" ? [this.swims[weekKey][day]] : [],
      jumps: activity === "jump" ? [this.jumps[weekKey][day]] : []
    });
    if (!res.data.success) {
      throw new Error(res.data.message);
    }
    this.runs[weekKey][day].uploadedToServer = true;
    this.swims[weekKey][day].uploadedToServer = true;
    this.jumps[weekKey][day].uploadedToServer = true;
  }

  async storeToAsyncStorage() {
    const serialized: SerializedActivities = {
      run: this.runs,
      swim: this.swims,
      jump: this.jumps,
    }
    await setUserFitnessData(serialized);
  }

  getWeekData(activity: ACTIVITY_ENUMS, week: string | typeof DateTime): Array<RunSchema | SwimSchema | JumpSchema> {
    const weekKey = typeof week === "string" ? week : week.toISODate();
    if (activity === "run") {
      return this.runs[weekKey];
    } else if (activity === "swim") {
      return this.swims[weekKey];
    } else {
      return this.jumps[weekKey];
    }
  }

  getDayData(activity: ACTIVITY_ENUMS, week: string | typeof DateTime, day: DAY_INDICES): RunSchema | SwimSchema | JumpSchema {
    const weekKey = typeof week === "string" ? week : week.toISODate();
    if (activity === "run") {
      return this.runs[weekKey][day];
    } else if (activity === "swim") {
      return this.swims[weekKey][day];
    } else {
      return this.jumps[weekKey][day];
    }
  }

  getLastUpdated(): typeof DateTime {
    var userLastUpdated : typeof DateTime = null; // should end up being monday of last updated week
    Object.keys(this.runs).forEach((dateString: string, _) => {
      var date = DateTime.fromISO(dateString);
      if (!userLastUpdated) {
        userLastUpdated = date;
      } else {
        userLastUpdated = DateTime.max(userLastUpdated, date);
      }
    });
    return userLastUpdated;
  }

  getOldestDate(): typeof DateTime {
    var oldestUpdated : typeof DateTime = null; // should end up being monday of oldest week
    Object.keys(this.runs).forEach((dateString: string, _) => {
      var keyDate = DateTime.fromISO(dateString, {zone: 'utc'});
      if (!oldestUpdated) {
        oldestUpdated = keyDate;
      } else {
        oldestUpdated = DateTime.min(oldestUpdated, keyDate);
      }
    });
    return oldestUpdated;
  }

  async addSession(activity: ACTIVITY_ENUMS, date: typeof DateTime, session: RunSchema | SwimSchema | JumpSchema) {
    const dayIndex = date.weekday - 1;
    const weekMonday = getLastMonday(date);
    const dateISOString = weekMonday.toISODate();
    var activities: RunActivitiesInterface | SwimActivitiesInterface | JumpActivitiesInterface;
    if (activity === "run") {
      activities = this.runs;
    } else if (activity === "swim") {
      activities = this.swims;
    } else {
      activities = this.jumps;
    }
    if (!activities[dateISOString]) {
      activities[dateISOString] = blank_week(activity, date);
    }
    activities[dateISOString][dayIndex] = session;
    await this.storeToAsyncStorage();
  }
}

export {
  OldRecords,
  RunActivitiesInterface,
  SwimActivitiesInterface,
  JumpActivitiesInterface,
  SerializedActivities,
  UserActivities,
  RunSchema,
  SwimSchema,
  JumpSchema,
  SwimReferenceTimes,
}