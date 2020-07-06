import React from 'react'
import { Tooltip, Text, ListItem } from 'react-native-elements';
import { View, StyleSheet, SectionList, Alert } from 'react-native'
import ActionButton from '../../ActionButton'
import AcceptRejectButton from './AcceptRejectButton'
import COMMUNITY_CONSTANTS from '../../CommunityConstants'
import ENDPOINTS from '../../../endpoints'
import { getData } from '../../../utils/storage'
const { acceptFollowerRequest, rejectFollowerRequest, removeFollower} = ENDPOINTS
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
      var res = await fetch(acceptFollowerRequest, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      var resJson = await res.json()
      if (resJson.success) {
        // set the button text to be accepted
        setActionSuccess(true)
        setButtonText('Accepted')
      } else {
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
    } finally {
      // button will not be loading anymore
      setIsLoading(false)
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
      leftAvatar={{ source: { uri: item.profilePicUrl } }}

      // MAKE THIS THE FOLLOW/ACCEPT BUTTON
      rightElement={() => {
        switch(section.title) {
          case(REQUESTS):
            return (
              <AcceptRejectButton
                accept={(setButtonText, setActionSuccess, setIsLoading) => acceptFollowerRequest(item, setButtonText, setActionSuccess, setIsLoading)}
                reject={(setButtonText, setActionSuccess, setIsLoading) => rejectFollowerRequest(item, setButtonText, setActionSuccess, setIsLoading)}
              />
            )
          case(FOLLOWERS):
            return (
              <ActionButton
                title='Remove'
                afterPressTitle='Removed'
                onPress={(setButtonText, setActionSuccess, setIsLoading) => removeFollower(item, setButtonText, setActionSuccess, setIsLoading)}              
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