import React, { Component } from 'react'
import { Tooltip, Text, ListItem } from 'react-native-elements';
import { View, StyleSheet, SectionList, Alert, Animated } from 'react-native'
import ActionButton from '../../ActionButton'
import AcceptRejectButton from './AcceptRejectButton'
import COMMUNITY_CONSTANTS from '../../CommunityConstants'
import ENDPOINTS from '../../../endpoints'
import { UserDataContext } from '../../../../Context'
import { getData, storeDataObj } from '../../../utils/storage'
import Background from '../../../nativeLogin/Background';
import { followerAction, storeNewFollowers } from '../../communityFunctions/followers'
const defaultProfile = require('../../../assets/profile.png')
const { 
  FOLLOWERS,
  REQUESTS,
  DISAPPEAR_TIME,
  ACCEPT_FOLLOWER_REQUEST,
  REJECT_FOLLOWER_REQUEST,
  REMOVE_FOLLOWER
} = COMMUNITY_CONSTANTS

class Follower extends Component {
  constructor(props) {
    super(props)
    // stores the animation starting point for list items
    const INIT_OPACITY = 1
    this.state = {
      animation: new Animated.Value(INIT_OPACITY),
    }
  }
  disappear() {
    console.log('disappear: ', this.state.animation)
    const disappearAnimations = [
      Animated.timing(this.state.animation, {
        toValue: 0,
        duration: DISAPPEAR_TIME,
        useNativeDriver: true
      }),
    ];
    Animated.sequence(disappearAnimations).start()
  }
  // will accept/reject follower request or remove the follower 
  // setButtonText is passed as a useState function from action button.
  // it will set the text of the action button once the request is complete
  async buttonAction(requester, action, setIsButtonLoading) {
    // set button text to be loading
    setIsButtonLoading(true)
    const { setAppState } = this.props;
    console.log("action taken: ", action, requester)
    try {
      await followerAction(requester, action, this.context, setAppState)
      var newState = await storeNewFollowers(requester, action, this.context)
    } catch(e) {
      console.log(e)
      Alert.alert('Oh No :(', e.toString(), [{text: 'Ok'}])
      setIsButtonLoading(false)
    }
    // start the disappearing animation
    this.disappear()
    // delay setting app state so diappear animation can complete
    setTimeout(() => {
      console.log("done!")
      setAppState(newState)
      setIsButtonLoading(false)
    }, DISAPPEAR_TIME + 100);
  }
  render() {
    const { item, section, onItemPress, showActionButton } = this.props;
    return (
      <Animated.View
        style={{
          opacity: this.state.animation,
        }}
      >
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
            if (!showActionButton) return;
            switch(section.title) {
              case(REQUESTS):
                return (
                  <AcceptRejectButton
                    accept={(setIsButtonLoading) => this.buttonAction(item, ACCEPT_FOLLOWER_REQUEST, setIsButtonLoading)}
                    reject={(setIsButtonLoading) => this.buttonAction(item, REJECT_FOLLOWER_REQUEST, setIsButtonLoading)}
                  />
                )
              case(FOLLOWERS):
                return (
                  <ActionButton
                    initialTitle='Remove'
                    onPress={(setIsButtonLoading) => this.buttonAction(item, REMOVE_FOLLOWER, setIsButtonLoading)}
                  />
                )
            }
          }}
          bottomDivider
          onPress={() => {
            // get the user's profile and display based on their settings
            onItemPress(item)
          }}
        />
      </Animated.View>
    )
  }
}
Follower.contextType = UserDataContext
export default Follower