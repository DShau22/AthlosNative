import ENDPOINTS from "../endpoints"

const getBestsURL = ENDPOINTS.getBests
const getProfileURL = ENDPOINTS.getProfilePic
const getUsernameURL = ENDPOINTS.getUsername

/**
 * gets the bests of a user given their id
 */
export async function getBests(id) {
  var reqBody = { id }
  var res = await fetch(getBestsURL, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reqBody)
  })
  var bestsJson = await res.json()
  if (bestsJson.success) {
    return bestsJson.bests
  }
  alert("could not get bests for id: ", id)
}

/**
 * gets the profile pic url of the user 
 * given their user id in Mongo
 */
export async function getProfile(id) {
  var reqBody = { id }
  var res = await fetch(getProfileURL, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reqBody)
  })
  var profileJson = await res.json()
  if (profileJson.success) {
    return profileJson.profilePicture.profileURL
  }
  alert("could not get profile url for id: ", id)
}

export async function getUsername(id) {
  var reqBody = { id }
  var res = await fetch(getUsernameURL, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reqBody)
  })
  var usernameJson = await res.json()
  if (usernameJson.success) {
    return usernameJson.username
  }
  alert("could not get profile url for id: ", id)
}

// module.exports = {
//   getBests, 
//   getProfile, 
//   getUsername,
// }