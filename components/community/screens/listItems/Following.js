import React from 'react'
import { Tooltip, Text, ListItem } from 'react-native-elements';
import { View, StyleSheet, SectionList } from 'react-native'
import ActionButton from '../../ActionButton'
import COMMUNITY_CONSTANTS from '../../CommunityConstants'
const { FOLLOWERS, REQUESTS } = COMMUNITY_CONSTANTS
const Following = (props) => {
  const { item, section, onItemPress, setAppState } = props;
  // cancels the follow request that the user sent to this person
  const cancelFollowRequest = () => {
    console.log('cancel follow request')
  }
  // removes this person from the user's following list
  const stopFollowing = () => {
    console.log('stop following')
  }
  return (
    <ListItem
      key={item._id}
      title={`${item.firstName} ${item.lastName}`}
      // subtitle={section.title === 'Requests' ? pendingSubtitle : peopleSubtitle}
      // MAKE THIS THEIR PHOTO. USE CLOUDINARY URL
      // leftAvatar={{ source: { uri: item.avatar_url } }}

      // MAKE THIS THE FOLLOW/ACCEPT BUTTON
      rightElement={() => {
        switch(section.title) {
          case('Pending'):
            return (
              <ActionButton
                initialTitle='Cancel'
                onPress={cancelFollowRequest}       
              />
            )
          case('Following'):
            return (
              <ActionButton
                initialTitle='Unfollow'
                onPress={stopFollowing}       
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
export default Following