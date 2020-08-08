import ENDPOINTS from '../../endpoints'
import COMMUNITY_CONSTANTS from '../CommunityConstants'
import { getData, storeDataObj } from '../../utils/storage'
const { 
  FOLLOWERS,
  REQUESTS,
  ACCEPT_FOLLOWER_REQUEST,
  REJECT_FOLLOWER_REQUEST,
  REMOVE_FOLLOWER
} = COMMUNITY_CONSTANTS
// executes an action (either accept, reject a req or remove the follower)
// makes a request to the server first
// stores in async storage
// sets the app state to update context
const followerAction = async (requester, action, userDataContext) => {
  var endPoint;
  switch(action) {
    case ACCEPT_FOLLOWER_REQUEST:
      endPoint = ENDPOINTS.acceptFollowerRequest;
      break;
    case REJECT_FOLLOWER_REQUEST:
      endPoint = ENDPOINTS.rejectFollowerRequest;
      break;
    case REMOVE_FOLLOWER:
      endPoint = ENDPOINTS.removeFollower;
  }
  console.log(endPoint)
  try {
    const userToken = await getData();
    const requestBody = {
      userToken,
      receiverFirstName: userDataContext.firstName,
      receiverLastName: userDataContext.lastName,
      receiverProfilePicUrl: userDataContext.profilePicture.profileUrl,
      
      requesterID: requester._id,
      requesterFirstName: requester.firstName,
      requesterLastName: requester.lastName,
      requesterProfilePicUrl: requester.profilePicUrl
    }
    var res = await fetch(endPoint, {
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

// stores the user's new follower list based on the action they took in async storage
// returns the new state
const storeNewFollowers = async (requester, action, userDataContext) => {
  // set the app state and update async storage separately here, and throw error
  // asking for refresh if this fails
  try {
    var newState;
    switch(action) {
      case ACCEPT_FOLLOWER_REQUEST:
        newState = acceptFollowerNewState(requester, userDataContext);
        break;
      case REJECT_FOLLOWER_REQUEST:
        newState = rejectFollowerNewState(requester, userDataContext);
        break;
      case REMOVE_FOLLOWER:
        newState = removeFollowerNewState(requester, userDataContext);
    }
    console.log('setting new state: ', newState)
    await storeDataObj(newState)
    return newState
  } catch(e) {
    console.log(e)
    return prevState
  }
}

// returns new app state after accepting a follower
const acceptFollowerNewState = (requester, prevState) => {
  const newFollowerRequests = prevState.followerRequests.filter(user => {
    return user._id !== requester._id
  })
  const newFollower = {
    _id: requester._id,
    firstName: requester.firstName,
    lastName: requester.lastName,
    profilePicUrl: requester.profilePicUrl
  }
  return {
    ...prevState.context,
    followers: [...prevState.followers, newFollower],
    followerRequests: newFollowerRequests
  }
}

// returns new app state after rejecting a follower
const rejectFollowerNewState = (requester, prevState) => {
  const newFollowerRequests = prevState.followerRequests.filter(user => {
    return user._id !== requester._id
  })
  return {
    ...prevState,
    followerRequests: newFollowerRequests
  }
}

// updates async storage after removing a follower
const removeFollowerNewState = (requester, prevState) => {
  const newFollowers = prevState.followers.filter(user => {
    return user._id !== requester._id
  })
  return {
    ...prevState,
    followers: newFollowers
  }
}

const errorMsg = (action, requester)  => {
  switch(action) {
    case ACCEPT_FOLLOWER_REQUEST:
      return `Something went wrong with accepting ${requester.firstName} ${requester.lastName}'s request. Please try again.`
    case REJECT_FOLLOWER_REQUEST:
      return `Something went wrong with rejecting ${requester.firstName} ${requester.lastName}'s request. Please try again.`
    case REMOVE_FOLLOWER:
      return `Something went wrong with removing ${requester.firstName} ${requester.lastName} from your followers. Please try again.`
  }
}
module.exports = {followerAction, storeNewFollowers}