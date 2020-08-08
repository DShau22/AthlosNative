import ENDPOINTS from '../../endpoints'
import COMMUNITY_CONSTANTS from '../CommunityConstants'
import { getData, storeDataObj, storeNewState } from '../../utils/storage'
const { 
  CANCEL_FOLLOW_REQUEST,
  UNFOLLOW
} = COMMUNITY_CONSTANTS
// cancels the follow request that the user sent to this person
const cancelFollowRequest = async (user) =>{
  // set button text to be loading
  try {
    const userToken = await getData();
    const requestBody = {
      userToken,
      requestReceiverId: user._id,
    }
    var res = await fetch(ENDPOINTS.cancelFollowRequest, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })
    var resJson = await res.json()
    if (!resJson.success) {
      console.log("resJson.success is false: ", resJson.message);
      throw new Error("resJson.success is false")
    }
  } catch(e) {
    console.log(e)
    return;
  }
}

// removes this person from the user's following list
const unfollow = async (user) => {
  // set button text to be loading
  try {
    const userToken = await getData();
    const requestBody = {
      userToken,
      userToUnfollowId: user._id,
    }
    var res = await fetch(ENDPOINTS.unfollow, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })
    var resJson = await res.json()
    if (!resJson.success) {
      console.log("resJson.success is false: ", resJson.message);
      throw new Error("resJson.success is false")
    }
  } catch(e) {
    console.log(e)
    return;
  }
}

const storeNewFollowing = async (user, action, prevState) => {
  // set the app state and update async storage separately hear, and throw error
  // asking for refresh if this fails
  try {
    var newFollowing;
    if (action === UNFOLLOW) {
      newFollowing = prevState.following.filter(userFollowing => {
        return userFollowing._id !== user._id
      })
    } else {
      newFollowing = prevState.followingPending.filter(pendingUser => {
        return pendingUser._id !== user._id
      })
    }
    const newState = await storeNewState(prevState, {following: newFollowing})
    return newState;
  } catch(e) {
    console.log(e)
    return prevState
  }
}
module.exports = {cancelFollowRequest, unfollow, storeNewFollowing}