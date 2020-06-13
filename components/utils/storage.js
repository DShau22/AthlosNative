// save tokens to the browser storage to remember if user signed in or not
const storageKey =  "the_main_app"
const socketStorageKey = "socket"
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
}
