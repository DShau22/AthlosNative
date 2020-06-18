// save tokens to the browser storage to remember if user signed in or not
const storageKey =  "token_key"
const socketStorageKey = "socket"
import AsyncStorage from '@react-native-community/async-storage';

const storeData = async (value) => {
  try {
    await AsyncStorage.setItem(storageKey, value)
  } catch (e) {
    // saving error
    console.log("something went wrong with async setItem")
  }
}

const storeDataObj = async (value) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(storageKey, jsonValue)
  } catch (e) {
    // saving error
    console.log("something went wrong with async setItem")
  }
}

// gets an item that's stored as a string. If it doesn't exist, return empty string
const getData = async () => {
  try {
    const value = await AsyncStorage.getItem(storageKey)
    return value ? value : ''
  } catch(e) {
    // error reading value
    console.log("something went wrong with async getItem")
  }
}

const getDataObj = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(storageKey)
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch(e) {
    // error reading value
    console.log("something went wrong with async getItem")
  }
}

function getFromLocalStorage(key) {
  if (!key) {
    return null;
  }
  try {
    const valueStr = localStorage.getItem(key);
    if (valueStr) {
      return JSON.parse(valueStr);
    }
    return null;
  } catch (err) {
    return null;
  }
}

function getFromSessionStorage(key) {
  if (!key) {
    return null;
  }
  try {
    const valueStr = sessionStorage.getItem(key);
    if (valueStr) {
      return JSON.parse(valueStr);
    }
    return null;
  } catch (err) {
    return null;
  }
}

function getToken() {
  var lsUserToken = getFromLocalStorage(storageKey)
  var ssUserToken = getFromSessionStorage(storageKey)
  if (lsUserToken) {
    return lsUserToken.token
  } else if (ssUserToken) {
    return ssUserToken.token
  } else {
    return null
  }
}

function setInLocalStorage(key, obj) {
  if (!key) {
    console.error('Error: Key is missing');
  }
  try {
    localStorage.setItem(key, JSON.stringify(obj));
  } catch (err) {
    console.error(err);
  }
}

function removeFromLocalStorage(key) {
  localStorage.removeItem(key)
}

function removeFromSessionStorage(key) {
  sessionStorage.removeItem(key)
}

function setInSessionStorage(key, obj) {
  if (!key) {
    console.error('Error: Key is missing');
  }
  try {
    sessionStorage.setItem(key, JSON.stringify(obj));
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  getFromLocalStorage,
  setInLocalStorage,
  removeFromLocalStorage,
  removeFromSessionStorage,
  setInSessionStorage,
  getFromSessionStorage,
  getToken,
  storageKey,
  socketStorageKey,
  storeData,
  storeDataObj,
  getData,
  getDataObj
}
