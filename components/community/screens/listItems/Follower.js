import React from 'react'
import { Tooltip, Text, ListItem } from 'react-native-elements';
import { View, StyleSheet, SectionList, Alert } from 'react-native'
import ActionButton from '../../ActionButton'
import AcceptRejectButton from './AcceptRejectButton'
import COMMUNITY_CONSTANTS from '../../CommunityConstants'
import ENDPOINTS from '../../../endpoints'
import { getData, storeDataObj } from '../../../utils/storage'
const defaultProfile = require('../../../assets/profile.png')
const { FOLLOWERS, REQUESTS } = COMMUNITY_CONSTANTS

const Follower = (props) => {
  const { item, section, onItemPress, setAppState } = props;
  // this is a work around cuz using useContext here violates some hook rule...
  const { userDataContext } = props

  // setButtonText is passed as a useState function from action button.
  // it will set the text of the action button once the request is complete
  const removeFollower = async (follower, setButtonText, setActionSuccess, setIsLoading) => {
    console.log('remove follower')
  }

  const acceptFollowerRequest = async (requester, setButtonText, setActionSuccess, setIsLoading) => {
    // need the user's fname, lname, token in header, profilepicUrl
    // and the requester's as well
    console.log('accept follower request')
    // set button text to be loading
    console.log("is loading", setIsLoading)
    setIsLoading(true);
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
      var res = await fetch(ENDPOINTS.acceptFollowerRequest, {
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
      Alert.alert(
        'Oh No :(',
        `Something went wrong with accepting ${requester.firstName} ${requester.lastName}'s request. Please try again.`,
        [{ text: "Okay" }]
      );
      setButtonText('Accept')
    }

    // set the app state and update async storage separately hear, and throw error
    // asking for refresh if this fails
    try {
      const newFollowerRequests = userDataContext.followerRequests.filter(user => {
        return user._id !== requester._id
      })
      const newFollower = {
        _id: requester._id,
        firstName: requester.firstName,
        lastName: requester.lastName,
        profilePicUrl: requester.profilePicUrl
      }
      const newState = {
        ...userDataContext,
        followers: [...userDataContext.followers, newFollower],
        followerRequests: newFollowerRequests
      }
      console.log('setting new state: ', newState)
      setAppState(newState)
      await storeDataObj(newState)
      setActionSuccess(true)
      setButtonText('Accepted')
    } catch(e) {
      console.log(e)
      Alert.alert(
        'Oh No :(',
        `Something went wrong updating the app storage. Please refresh.`,
        [{ text: "Okay" }]
      );
      setButtonText('Accept')
    }
  }

  const rejectFollowerRequest = (requester, setButtonText, setActionSuccess, setIsLoading) => {
    console.log('reject follower request')
  }
  return (
    <ListItem
      key={item._id}
      title={`${item.firstName} ${item.lastName}`}
      // subtitle={section.title === 'Requests' ? 'wants to follow you!' : 'is following you'}
      // MAKE THIS THEIR PHOTO. USE CLOUDINARY URL
      leftAvatar={item.profilePicUrl.length > 0 ?
        { source: { uri: item.profilePicUrl }} : 
        { source: defaultProfile } 
      }

      // MAKE THIS THE FOLLOW/ACCEPT BUTTON
      rightElement={() => {
        switch(section.title) {
          case(REQUESTS):
            return (
              <AcceptRejectButton
                accept={(setButtonText, setActionSuccess, setIsLoading) => 
                  acceptFollowerRequest(item, setButtonText, setActionSuccess, setIsLoading)
                }
                reject={(setButtonText, setActionSuccess, setIsLoading) => 
                  rejectFollowerRequest(item, setButtonText, setActionSuccess, setIsLoading)
                }
              />
            )
          case(FOLLOWERS):
            return (
              <ActionButton
                initialTitle='Remove'
                onPress={(setButtonText, setActionSuccess, setIsLoading) => 
                  removeFollower(item, setButtonText, setActionSuccess, setIsLoading)
                }
              />
            )
        }
      }}
      bottomDivider
      onPress={() => {
        console.log("friend pressed")
        // get the user's profile and display based on their settings
        onItemPress(item)
      }}
    />
  )
}
export default Follower