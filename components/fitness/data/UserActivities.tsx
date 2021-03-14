/**
 * A class with factory constructors that represent a user's fitness.
 * Can be easily worked with to display different statistics
 */
import React from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {
  addOldFitnessRecords,
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
import { DateTime } from 'luxon';
import { User } from '../../../../nativeBackend/server/database/MongoConfig';
const { DateTime } = require('luxon');

interface RunSchema {
  _id: string,
  userID: string,
  uploadDate: string,
  num: number,
  cadences: Array<number>,
  calories: number,
  time: number,
}

interface Lap {
  finished: boolean,
  lapTime: number,
}
interface SwimSchema {
  _id: string,
  userID: string,
  uploadDate: string,
  num: number,
  lapTimes: Array<Lap>,
  strokes: Array<string>,
  calories: number,
  time: number,
}

interface JumpSchema {
  _id: string,
  userID: string,
  uploadDate: string,
  num: number,
  heights: Array<number>,
  shotsMade: number,
  time: number,
}

interface DaySchema {
  run: RunSchema,
  swim: SwimSchema,
  jump: JumpSchema,
}

interface ActivitiesInterface {
  [weekMondayDate: string]: Array<DaySchema>;
};

const blank_run = (date: typeof DateTime): RunSchema => (
  {
    _id: '',
    userID: '',
    uploadDate: date.toISODate(),
    num: 0,
    cadences: [],
    calories: 0,
    time: 0,
  }
)

const blank_swim = (date: typeof DateTime): SwimSchema => (
  {
    _id: '',
    userID: '',
    uploadDate: date.toISODate(),
    num: 0,
    lapTimes: [],
    strokes: [],
    calories: 0,
    time: 0
  }
)

const blank_jump = (date: typeof DateTime): JumpSchema => (
  {
    _id: '',
    userID: '',
    uploadDate: date.toISODate(),
    num: 0,
    heights: [],
    shotsMade: 0,
    time: 0,
  }
)

const blank_week = (mondayDate: typeof DateTime): Array<DaySchema> => {
  var result = Array(7);
  for (let day = 0; day < 7; day ++) {
    result[day] = {
      run: blank_run(mondayDate.plus(day)),
      swim: blank_swim(mondayDate.plus(day)),
      jump: blank_jump(mondayDate.plus(day)),
    };
  }
  return result;
} 

// Object remplate for storing to async storage

class UserActivities {
  private activities : ActivitiesInterface;
  public static WEEKS_BACK = 26;
  static async createFromStorage(): Promise<UserActivities> {
    const userActivityData = await getUserFitnessData();
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
    const newActivities: ActivitiesInterface = {};
    // grab fitness from server and store it
    var lastUpdated = getLastMonday();
    lastUpdated.minus({days: (UserActivities.WEEKS_BACK + 1) * 7});
    const userToken: string = await getToken();
    const activities  = ["run", "swim", "jump"];
    const activityData = [];
    for (let i = 0; i < activities.length; i++) {      
      const res = await Axios.post(ENDPOINTS.getUserFitness, {
        userToken,
        activity: "run",
        lastUpdated: lastUpdated.toISODate(),
        userToday: DateTime.local().toISODate(), // use the zone rn because if last updated was b4 DST it'll be off for server
      });
      // CHANGE THIS ENDPOINT WHEN TIME PERMITS
      if (!res.data.success) {
        throw new Error(res.data.message);
      }
      activityData.push(res.data);
    }
    for (let i = 0; i < activityData.length; i++) {
      for (let j = 0; j < activityData[i].length; j++) {
        let week = activityData[i][j];
        let weekMondayDate = DateTime.fromISO(week[0].run.uploadDate);
        newActivities[weekMondayDate.toISODate()] = week;
      }
    }
    return new this(newActivities);
  }

  constructor(activitiesObj?: ActivitiesInterface) {
    if (activitiesObj) {
      this.activities = activitiesObj;
      this.fillAndRemoveOldRecords();
      setUserFitnessData(this.activities);
    } else {
      var blankActivities: ActivitiesInterface = {};
      const today = DateTime.local();
      var startMondayDate : typeof DateTime = getLastMonday(today.minus({days: UserActivities.WEEKS_BACK * 7}));
      var startMondayString = startMondayDate.toISODate();
      for (let i = 0; i <= UserActivities.WEEKS_BACK; i++) {
        blankActivities[startMondayString] = blank_week(startMondayDate);
        startMondayDate = startMondayDate.plus({days: 7});
      }
      this.activities = blankActivities;
    }
  }

  // fills with empty fitness records and removes old ones if needed
  // Tries to upload old records to DB. If fail then store to Async storage and try again
  // next time.
  async fillAndRemoveOldRecords() {
    const today = DateTime.local();
    var userLastUpdated = this.getLastUpdated();
    // fill in empty fitness records if needed
    userLastUpdated.plus({days: 7});
    while (userLastUpdated.startOf("day") <= today.startOf("day")) {
      this.activities[userLastUpdated.toISODate()] = blank_week(userLastUpdated);
      userLastUpdated.plus({days: 7});
    }

    // remove old records and store to async storage
    var oldestDate = this.getOldestDate();
    var numToRemove = Object.keys(this.activities).length - UserActivities.WEEKS_BACK;
    const oldRecords: Array<DaySchema> = [];
    // INEFFICIENT. CONSIDER SORTING AND REMOVING OLDEST ___ DATES 
    while (numToRemove > 0) {
      const oldestDateString = oldestDate.toISODate();
      oldRecords.push(...this.activities[oldestDateString]);
      delete this.activities[oldestDateString];
      numToRemove -= 1;
      oldestDate = this.getOldestDate();
    }
    await addOldFitnessRecords(oldRecords);
    try {
      // await this.uploadStoredOldRecords();
      await setOldFitnessRecords([]);
    } catch(e) {
      console.log(e);
    }
  }

  async uploadStoredOldRecords() {
    const oldFitnessRecords : Array<DaySchema> = await getOldFitnessRecords();
    const res = await Axios.post(ENDPOINTS.uploadOldFitnessRecords, {
      oldFitnessRecords,
    });
    if (!res.data.success) {
      throw new Error(res.data.message);
    }
  }

  async storeToAsyncStorage() {
    await setUserFitnessData(this.activities);
  }

  getWeekData(week: string | typeof DateTime): Array<DaySchema> {
    return this.activities[typeof week === DateTime ? week.toISODate() : week];
  }

  getDayData(week: string | typeof DateTime, day: number): DaySchema {
    return this.activities[typeof week === DateTime ? week.toISODate() : week][day];
  }

  getLastUpdated(): typeof DateTime {
    var userLastUpdated : typeof DateTime = null; // should end up being monday of last updated week
    Object.keys(this.activities).forEach((dateString: string, _) => {
      var keyDate = DateTime.fromISO(dateString, {zone: 'utc'});
      if (!userLastUpdated) {
        userLastUpdated = keyDate;
      } else {
        userLastUpdated = DateTime.max(userLastUpdated, keyDate);
      }
    });
  }

  getOldestDate(): typeof DateTime {
    var oldestUpdated : typeof DateTime = null; // should end up being monday of oldest week
    Object.keys(this.activities).forEach((dateString: string, _) => {
      var keyDate = DateTime.fromISO(dateString, {zone: 'utc'});
      if (!oldestUpdated) {
        oldestUpdated = keyDate;
      } else {
        oldestUpdated = DateTime.min(oldestUpdated, keyDate);
      }
    });
  }

  getActivities(): ActivitiesInterface {
    return this.activities;
  }

  addSession(date: DateTime, session: DaySchema) {
    const dayIndex = date.weekday - 1;
    const dateISOString = date.toISODate();
    if (!this.activities[dateISOString]) {
      this.activities[dateISOString] = blank_week(date);
    }
    this.activities[dateISOString][dayIndex] = session;
  }
}

export {
  ActivitiesInterface,
  UserActivities,
  RunSchema,
  SwimSchema,
  JumpSchema,
  DaySchema,
}