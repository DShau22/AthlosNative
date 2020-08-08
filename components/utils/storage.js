// save tokens to the browser storage to remember if user signed in or not
const TOKEN_KEY =  "token_key"
const DATA_KEY = "data_key"
const socketStorageKey = "socket"
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
  storeNewState
}
