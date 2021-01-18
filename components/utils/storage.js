// save tokens to the browser storage to remember if user signed in or not
const TOKEN_KEY =  "token_key"; // login token key
const DATA_KEY = "data_key"; // app context/user data key
const FITNESS_KEY = 'fitness_key'; // key for the queue of fitness raw data from earbuds
const socketStorageKey = "socket";
import AsyncStorage from '@react-native-community/async-storage';

const storeData = async (value) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, value)
  } catch (e) {
    // saving error
    console.log("something went wrong with async setItem")
  }
}

const storeDataObj = async (value) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(DATA_KEY, jsonValue)
  } catch (e) {
    // saving error
    console.log("something went wrong with async setItem")
  }
}

// gets an item that's stored as a string. If it doesn't exist, return empty string
const getData = async () => {
  try {
    const value = await AsyncStorage.getItem(TOKEN_KEY)
    return value ? value : ''
  } catch(e) {
    // error reading value
    console.log("something went wrong with async getItem")
  }
}

const getDataObj = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(DATA_KEY)
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch(e) {
    // error reading value
    console.log("something went wrong with async getItem")
  }
}

/**
 * Stores user session bytes in async storage as utf8 strings.
 * The sessions are stored as a list/queue of objects
 * {
 *   date: Date,
 *   bytes: utf8 encoded string representing session bytes
 * }
 * @param {Buffer} sessionBytes 
 */
const storeFitnessBytes = async (sessionBytes) => {
  await removeFitnessBytes(); // for now
  const byteQueueString = await AsyncStorage.getItem(FITNESS_KEY);
  var byteQueue = JSON.parse(byteQueueString);
  console.log("byteQueue: ", byteQueue);
  if (byteQueue === null) {
    byteQueue = [{
      date: new Date(),
      sessionBytes: sessionBytes.toString('utf8'),
    }];
  } else {
    byteQueue.push({
      date: new Date(),
      sessionBytes: sessionBytes.toString('utf8'),
    });
  }
  console.log("stringified: ", JSON.stringify(byteQueue));
  await AsyncStorage.setItem(FITNESS_KEY, JSON.stringify(byteQueue));
}

/**
 * Stores user session bytes in async storage as utf8 strings.
 * The sessions are stored as a list/queue of objects
 * {
 *   date: Date,
 *   bytes: utf8 encoded string representing session bytes
 * }
 * @param {Buffer} sessionBytes 
 */
const getFitnessBytes = async () => {
  const byteQueueString = await AsyncStorage.getItem(FITNESS_KEY);
  return byteQueueString;
}

const removeFitnessBytes = async () => {
  await AsyncStorage.removeItem(FITNESS_KEY)
}

// adds these new fields to the previous state and stores it in async storage
// newFields should be an ojbect
const storeNewState = async (prevState, newFields) => {
  const newState = {
    ...prevState,
    ...newFields
  }
  await storeDataObj(newState);
  return newState
}

module.exports = {
  TOKEN_KEY,
  DATA_KEY,
  storeData,
  storeDataObj,
  getData,
  getDataObj,
  storeNewState,
  storeFitnessBytes,
  getFitnessBytes,
  removeFitnessBytes
}
