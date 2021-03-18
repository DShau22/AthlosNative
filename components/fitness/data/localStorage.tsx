import Axios from "axios";
import ENDPOINTS from "../../endpoints";
import { getToken } from "../../utils/storage";
import { 
  RunActivitiesInterface,
  SwimActivitiesInterface,
  JumpActivitiesInterface,
  UserActivities,
  RunSchema,
  SwimSchema,
  JumpSchema,
} from './UserActivities';
import {
  getUserData,
  storeUserData
} from '../../utils/storage';
import {
  getLastMonday,
  getNextSunday,
  sameDate,
} from '../../utils/dates';
import {
  getUserFitnessData,
  setUserFitnessData,
} from '../../utils/storage';
import {
  unscrambleSessionBytes,
  createSessionJsons,
  calcReferenceTimes,
} from "./decoders";
import { Use } from "react-native-svg";
/**
 * Utilities for managing the local storage of user fitness
 * and syncing with the server and database.
 */
const DEFAULT_GOALS = {
  goalSteps: 20000,
  goalLaps: 50,
  goalVertical: 12,
  goalCaloriesBurned: 2000,
  goalWorkoutTime: 180,
};

const DEFAULT_REF_TIMES = {
  fly: [22, 20],
  back: [30, 26],
  breast: [32, 28],
  free: [25, 22]
};

const DEFAULT_CADENCES = [30, 46, 73];

const DEFAULT_RUN_EFFORTS = [1, 2.5, 5, 7]; // efforts inc/dec after 30 second intervals
const DEFAULT_WALK_EFFORTS = [1, 2.5, 5, 7]; // efforts inc/dec after 30 second intervals

const DEFAULT_SWIM_EFFORTS = [4, 8, 12, 16]; // efforts increment after turns

const { DateTime } = require('luxon');

const WALK_CADENCE = DEFAULT_CADENCES[1] * 2;
const RUN_CADENCE = DEFAULT_CADENCES[2] * 2;

/**
 * Reads from async storage the user fitness (which is in UTC).
 * Looks at the current date (in their timezone), converts that date to UTC,
 * and based on that date updates local storage to fill in the weeks since the 
 * last updated date and todays date.
 */
// user fitness should be a dictionary of dates ISO strings which map to arrays of length 7
const getUserActivityData = async (): Promise<UserActivities> => {
  const today = DateTime.local();
  console.log("today: ", today);
  var userActivities: UserActivities = await UserActivities.createFromStorage();
  if (!userActivities) {
    // grab fitness from server and store it
    console.log("creating from server...");
    try {
      userActivities = await UserActivities.createFromServer();
      await userActivities.storeToAsyncStorage();
    } catch(e) {
      console.log("error creating user activities from server: ", e);
    }
    return userActivities;
  } else {
    console.log("creating from storage...");
    // delete old fitness records and upload those to database if they have data
    await userActivities.fillAndRemoveOldRecords();
    console.log("filled and removed");
    await userActivities.storeToAsyncStorage();
    console.log("stored...");
    await UserActivities.uploadStoredOldRecords();
    // await Promise.all([userActivities.storeToAsyncStorage(), UserActivities.uploadStoredOldRecords()]);
    console.log("returning activities...");
    return userActivities;
  }
}

/**
 * Takes in a list of scrambled byte arrays, unscrambles them, decodes them
 * into session statistics, and updates the user's fitness in the async storage
 */
const updateActivityData = async (date: typeof DateTime, sessionBytes: Buffer) => {
  console.log("date that user sent: ", date);
  var sessionMidnightDate = date.set({
    hour: 0, minute: 0, second: 0, millisecond: 0
  }).toUTC();
  console.log("session date midnight: ", sessionMidnightDate);
  const unscrambledBytes = unscrambleSessionBytes(sessionBytes);
  const sessionJsons = createSessionJsons(unscrambledBytes, sessionMidnightDate);
  const {run, swim, jump} = sessionJsons;
  // at this point find out where to insert it into the async storage UserActivity
  const userActivities: UserActivities = await UserActivities.createFromStorage();
  await userActivities.fillAndRemoveOldRecords();

  // update the other user data such as bests, nefforts, thresholds, etc...
  const userData = await getUserData();
  // user had to swim for 8 or more laps
  if (swim.lapTimes.length >= 8) {
    userData.referenceTimes = calcReferenceTimes(userData.referenceTimes, swim);
    const oldAverageNumLaps = userData.swimEfforts[0] / 0.2;
    const newMovingAvgNumLaps = (7 * oldAverageNumLaps)/8 + swim.lapTimes.length/8;
    userData.swimEfforts = [
      newMovingAvgNumLaps * .2, // level 1
      newMovingAvgNumLaps * .3, // level 2
      newMovingAvgNumLaps * .4, // level 3
      newMovingAvgNumLaps * .6, // level 4
    ];
  }
  // user had to run for 3 or more minutes for run efforts to be updated
  if (run.cadences.length >= 6) {
    const oldAvgRunHalfMins = userData.runEfforts[0] / 0.1;
    var sessionRunHalfMins = 0;
    run.cadences.forEach((cadence, _) => {
      if (cadence >= RUN_CADENCE) {
        sessionRunHalfMins += 1;
      }
    });
    const newAvgRunHalfMins = (7 * oldAvgRunHalfMins)/8 + sessionRunHalfMins/8;
    console.log("new avg run half mins ", newAvgRunHalfMins);
    console.log("session run half mins: ", sessionRunHalfMins);
    userData.runEfforts = [
      newAvgRunHalfMins * .1,  // level 1
      newAvgRunHalfMins * .25, // level 2
      newAvgRunHalfMins * .50, // level 3
      newAvgRunHalfMins * .70, // level 4
    ];
    const oldAvgWalkHalfMins = userData.walkEfforts[0] / 0.1;
    var sessionWalkHalfMins = 0;
    run.walkCadences.forEach((walkCadence, _) => {
      if (walkCadence >= WALK_CADENCE) {
        sessionWalkHalfMins += 1;
      }
    });
    const newAvgWalkHalfMins = (7 * oldAvgWalkHalfMins)/8 + (sessionWalkHalfMins + sessionRunHalfMins)/8;
    console.log("new avg walk half mins ", newAvgWalkHalfMins);
    console.log("session walk half mins: ", sessionWalkHalfMins);
    userData.walkEfforts = [
      newAvgWalkHalfMins * .1,  // level 1
      newAvgWalkHalfMins * .25, // level 2
      newAvgWalkHalfMins * .50, // level 3
      newAvgWalkHalfMins * .70, // level 4
    ];
  }

  // update user bests
  userData.bests = {
    mostCalories: Math.max(userData.bests.mostCalories, run.calories, swim.calories),
    mostSteps: Math.max(userData.bests.mostSteps, run.num),
    mostLaps: Math.max(userData.bests.mostLaps, swim.num),
    highestJump: Math.max(userData.bests.highestJump, Math.max(...jump.heights)),
    bestEvent: userData.bests.bestEvent // don't do anything about the best event yet
  };

  // add to user activity data
  delete run["walkCadences"];
  await Promise.all([
    userActivities.addSession("run", run.uploadDate, run),
    userActivities.addSession("swim", swim.uploadDate, swim),
    userActivities.addSession("jump", jump.uploadDate, jump),
    storeUserData(userData),
  ]);
}

export {
  getUserActivityData,
  updateActivityData,
}