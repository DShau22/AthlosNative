const { DateTime } = require('luxon');
// save tokens to the browser storage to remember if user signed in or not
const TOKEN_KEY =  "token_key"; // login token key
const DATA_KEY = "data_key"; // app context/user data key
const FITNESS_KEY = 'fitness_key'; // key for the queue of fitness raw data from earbuds
const DEVICE_ID_KEY = 'device_id_key'; // key for string of the device id. Currently not used in the actual App
const FITNESS_UPDATE_KEY = 'fitness_update_key'; // key of boolean to see if user fitness needs an update or not
const FIRST_TIME_LOGIN_KEY = 'first time login key'; // key of boolean to see if this is the user's first time logging on or after logging out
const AUTO_SYNC_KEY = 'should auto sync?'; // key for if the user wants to auto sync with this device or not
const CONFIG_KEY = 'Config Key'; // key that stores saInit in human readable json form
const FITNESS_DATA_KEY = "Fitness data key"; // key that stores the user's fitness data to display
const OLD_FITNESS_RECORDS_KEY = "Old fitness records key";
import AsyncStorage from '@react-native-community/async-storage';
import { OldRecords, SerializedActivities } from '../fitness/data/UserActivities';

const logOut = async () => {
  await AsyncStorage.multiRemove([
    TOKEN_KEY,
    DATA_KEY,
    FITNESS_KEY,
    DEVICE_ID_KEY,
    FITNESS_UPDATE_KEY,
    FIRST_TIME_LOGIN_KEY,
    AUTO_SYNC_KEY,
    CONFIG_KEY,
    FITNESS_DATA_KEY,
    OLD_FITNESS_RECORDS_KEY,
  ]);
}

const getShouldAutoSync = async () => {
  const res = await AsyncStorage.getItem(AUTO_SYNC_KEY);
  console.log("should auto sync: ", res);
  return res;
}

const setShouldAutoSync = async (bool: boolean) => {
  if (bool) {
    await AsyncStorage.setItem(AUTO_SYNC_KEY, JSON.stringify(true));
  } else {
    await AsyncStorage.removeItem(AUTO_SYNC_KEY);
  }
}

const getFirstTimeLogin = async () => {
  const firstTime = await AsyncStorage.getItem(FIRST_TIME_LOGIN_KEY);
  return firstTime === null;
}

const setFirstTimeLogin = async () => {
  await AsyncStorage.setItem(FIRST_TIME_LOGIN_KEY, 'logged in');
}

const needsFitnessUpdate = async () => {
  return await AsyncStorage.getItem(FITNESS_UPDATE_KEY);
}

const setNeedsFitnessUpdate = async (needsUpdate: boolean) => {
  if (needsUpdate) {
    await AsyncStorage.setItem(FITNESS_UPDATE_KEY, JSON.stringify(true));
  } else {
    await AsyncStorage.removeItem(FITNESS_UPDATE_KEY);
  }
}

const getDeviceId = async () => {
  const deviceID = await AsyncStorage.getItem(DEVICE_ID_KEY);
  return deviceID ? JSON.parse(deviceID) : "";
}

const setDeviceId = async (newID: string) => {
  if (newID) {
    await AsyncStorage.setItem(DEVICE_ID_KEY, JSON.stringify(newID));
  } else {
    await AsyncStorage.removeItem(DEVICE_ID_KEY);
  }
}

const storeToken = async (value) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, value)
  } catch (e) {
    // saving error
    console.log("something went wrong with async setItem")
  }
}

const storeUserData = async (value) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(DATA_KEY, jsonValue)
  } catch (e) {
    // saving error
    console.log("something went wrong with async setItem")
  }
}

// gets an item that's stored as a string. If it doesn't exist, return empty string
const getToken = async (): Promise<string> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch(e) {
    // error reading value
    console.log("something went wrong with async getItem")
  }
}

const getUserData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(DATA_KEY)
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch(e) {
    // error reading value
    console.log("something went wrong with async getItem")
  }
}

/**
 * Stores user session bytes in async storage as base64 strings.
 * The sessions are stored as a list/queue of objects
 * {
 *   date: Date,
 *   bytes: utf8 encoded string representing session bytes
 * }
 * @param {Buffer} sessionBytes 
 */
const storeFitnessBytes = async (sessionBytes) => {
  // await removeFitnessBytes(); // for now
  console.log("storing this many bytes: ", sessionBytes.length);
  const byteQueueString = await AsyncStorage.getItem(FITNESS_KEY);
  var byteQueue = JSON.parse(byteQueueString);
  // console.log("byteQueue: ", byteQueue);
  if (byteQueue === null) {
    byteQueue = [{
      date: DateTime.local().toISO(),
      sessionBytes: sessionBytes.toString('base64'),
    }];
  } else {
    byteQueue.push({
      date: DateTime.local().toISO(),
      sessionBytes: sessionBytes.toString('base64'),
    });
  }
  await AsyncStorage.setItem(FITNESS_KEY, JSON.stringify(byteQueue));
}

/**
 * gets the list of user session byte arrays in async storage as base64 strings.
 * The sessions are stored as a list/queue of objects
 * {
 *   date: Date,
 *   bytes: utf8 encoded string representing session bytes
 * }
 * @param {Buffer} sessionBytes 
 */
const getFitnessBytes = async () => {
  const byteQueueString = await AsyncStorage.getItem(FITNESS_KEY);
  return byteQueueString === null ? null : JSON.parse(byteQueueString);
}

const removeFitnessBytes = async () => {
  await AsyncStorage.removeItem(FITNESS_KEY)
}

// removes the fitness records in the byte queue at these particular list of indicies
const removeFitnessRecords = async (indicies) => {
  console.log("removing fitness record at indicies: ", indicies);
  if (indicies.length === 0)
    return;
  const byteQueueString = await AsyncStorage.getItem(FITNESS_KEY);
  if (byteQueueString !== null) {
    const parsed = JSON.parse(byteQueueString);
    if (parsed.length <= 1) {
      await removeFitnessBytes();
    } else {
      for (let i = indicies.length -1; i >= 0; i--) {
        parsed.splice(indicies[i], 1);
      }
      await AsyncStorage.setItem(FITNESS_KEY, JSON.stringify(parsed));
    }
  } else {
    console.log("trying to remove entry from null fitness queue");
  }
}

// adds these new fields to the previous state and stores it in async storage
// newFields should be an ojbect
const storeNewState = async (prevState, newFields) => {
  const newState = {
    ...prevState,
    ...newFields
  }
  await storeUserData(newState);
  return newState
}

const storeSaInitConfig = async (deviceConfig) => {
  await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(deviceConfig));
}

const getSaInitConfig = async () => {
  return JSON.parse(await AsyncStorage.getItem(CONFIG_KEY));
}

const getUserFitnessData = async (): Promise<SerializedActivities> => {
  return JSON.parse(await AsyncStorage.getItem(FITNESS_DATA_KEY));
}

const setUserFitnessData = async (newData: SerializedActivities) => {
  await AsyncStorage.setItem(FITNESS_DATA_KEY, JSON.stringify(newData));
}

const getOldFitnessRecords = async (): Promise<OldRecords> => {
  return JSON.parse(await AsyncStorage.getItem(OLD_FITNESS_RECORDS_KEY));
}

const storeOldFitnessRecords = async (newRecords: OldRecords) => {
  var oldFitnessRecords = await getOldFitnessRecords();
  if (oldFitnessRecords) {
    oldFitnessRecords.oldRuns.push(...newRecords.oldRuns);
    oldFitnessRecords.oldSwims.push(...newRecords.oldSwims);
    oldFitnessRecords.oldJumps.push(...newRecords.oldJumps);
    await AsyncStorage.setItem(OLD_FITNESS_RECORDS_KEY, JSON.stringify(oldFitnessRecords));
  } else {
    await AsyncStorage.setItem(OLD_FITNESS_RECORDS_KEY, JSON.stringify(newRecords));
  }
}

const setOldFitnessRecords = async (newRecords: OldRecords) => {
  await AsyncStorage.setItem(OLD_FITNESS_RECORDS_KEY, JSON.stringify(newRecords));
}

export {
  TOKEN_KEY,
  DATA_KEY,
  logOut,
  getDeviceId,
  setDeviceId,
  getShouldAutoSync,
  setShouldAutoSync,
  needsFitnessUpdate,
  setNeedsFitnessUpdate,
  getFirstTimeLogin,
  setFirstTimeLogin,
  storeToken,
  storeUserData,
  getToken,
  getUserData,
  storeNewState,
  storeFitnessBytes,
  getFitnessBytes,
  removeFitnessBytes,
  removeFitnessRecords,
  storeSaInitConfig,
  getSaInitConfig,
  getUserFitnessData,
  setUserFitnessData,
  getOldFitnessRecords,
  storeOldFitnessRecords,
  setOldFitnessRecords
}
