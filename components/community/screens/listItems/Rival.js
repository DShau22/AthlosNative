import React from 'react'
import { Tooltip, Text, ListItem } from 'react-native-elements';
import { View, StyleSheet, SectionList } from 'react-native'
import ActionButton from '../../ActionButton'
import AcceptRejectButton from './AcceptRejectButton'
import COMMUNITY_CONSTANTS from '../../CommunityConstants'
const { FOLLOWERS, REQUESTS } = COMMUNITY_CONSTANTS
const Rival = (props) => {
  const { item, section, onItemPress, setAppState, showActionButton } = props;
  const acceptRivalRequest = () => {
    console.log('accept rival request')
  }
  const rejectRivalRequest = () => {
    console.log('reject rival request')
  }
  const endRivalry = () => {
    console.log('end rivalry')
  }
  // cancel the rivalry request the user sent to this person
  const cancelRivalryRequest = () => {
    console.log('cancel rivalry request')
  }
  return (
    <ListItem
      key={item._id}
      title={`${item.firstName} ${item.lastName}`}
      // subtitle={section.title === 'Requests' ? pendingSubtitle : peopleSubtitle}
      // MAKE THIS THEIR PHOTO. USE CLOUDINARY URL
      // leftAvatar={{ source: { uri: item.avatar_url } }}

      // MAKE THIS THE FOLLOW/ACCEPT BUTTON
      // check what section this item is in. Based on that then decide which
      // kind of button to put here
      rightElement={() => {
        if (!showActionButton) return;
        switch(section.title) {
          case('Requests'):
            return (
              <AcceptRejectButton
                accept={acceptRivalRequest}
                reject={rejectRivalRequest}
              />
            )
          case('Pending'):
            return (
              <ActionButton
                title='Cancel'
                afterPressTitle='Cancelled'
                onPress={cancelRivalryRequest}     
              />
            )
          case('Rivals'):
            return (
              <ActionButton
                title='End'
                afterPressTitle='Ended'
                onPress={endRivalry}     
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
export default Rival