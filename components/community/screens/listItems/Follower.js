import React from 'react'
import { Tooltip, Text, ListItem } from 'react-native-elements';
import { View, StyleSheet, SectionList } from 'react-native'
import ActionButton from '../../ActionButton'
import AcceptRejectButton from './AcceptRejectButton'
import { AppFunctionsContext } from '../../../../Context'
import COMMUNITY_CONSTANTS from '../../CommunityConstants'
const { FOLLOWERS, REQUESTS } = COMMUNITY_CONSTANTS
const Follower = (props) => {
  const { item, section, onItemPress } = props;
  console.log(section.title)
  // const { setAppState } = React.useContext(AppFunctionsContext);
  const removeFollower = () => {
    console.log('remove follower')
  }
  const acceptFollowerRequest = () => {
    console.log('accept follower request')
  }
  const rejectFollowerRequest = () => {
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
                accept={acceptFollowerRequest}
                reject={rejectFollowerRequest}
              />
            )
          case(FOLLOWERS):
            return (
              <ActionButton
                title='Remove'
                afterPressTitle='Removed'
                onPress={removeFollower}              
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