import React, { Component } from 'react'
import { Tooltip, Text, ListItem } from 'react-native-elements';
import { View, StyleSheet, SectionList, Alert, Animated } from 'react-native'
import ActionButton from '../../ActionButton'
import AcceptRejectButton from './AcceptRejectButton'
import COMMUNITY_CONSTANTS from '../../CommunityConstants'
import ENDPOINTS from '../../../endpoints'
import { UserDataContext } from '../../../../Context'
import { getData, storeDataObj } from '../../../utils/storage'
const defaultProfile = require('../../../assets/profile.png')
const { FOLLOWING, PENDING, DISAPPEAR_TIME } = COMMUNITY_CONSTANTS

class Following extends Component {
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

  // cancels the follow request that the user sent to this person
  async cancelFollowRequest(user, setIsButtonLoading) {
    // set button text to be loading
    setIsButtonLoading(true)
    const { setAppState } = this.props;
    console.log('cancelling follow request: ', user)
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
      Alert.alert(
        'Oh No :(',
        `Something went wrong with canceling your request to follow ${user.firstName, user.lastName}. Please try again.`,
        [{ text: "Okay" }]
      );
      setIsButtonLoading(false)
      return;
    }
    // set the app state and update async storage separately hear, and throw error
    // asking for refresh if this fails
    try {
      var newState = {
        ...this.context,
        followingPending: this.context.followingPending.filter(pending => {
          return pending._id !== user._id
        })
      }
      console.log('setting new state: ', newState)
      await storeDataObj(newState)
      // start the disappearing animation
      this.disappear()
      // delay setting app state so diappear animation can complete
      setTimeout(() => {
        console.log("done!")
        setAppState(newState)
      }, DISAPPEAR_TIME + 100);
    } catch(e) {
      console.log(e)
      Alert.alert(
        'Oh No :(',
        `Something went wrong updating the app storage. Please refresh.`,
        [{ text: "Okay" }]
      );
      setIsButtonLoading(false)
    }
  }

  // removes this person from the user's following list
  async unfollow(user, setIsButtonLoading) {
    // set button text to be loading
    setIsButtonLoading(true)
    const { setAppState } = this.props;
    console.log('unfollowing: ', user)
    try {
      const userToken = await getData();
      const requestBody = {
        userToken,
        userToUnfollowId: user._id,
      }
      console.log(requestBody)
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
      Alert.alert(
        'Oh No :(',
        `Something went wrong trying to unfollow ${user.firstName, user.lastName}. Please try again.`
        [{ text: "Okay" }]
      );
      setIsButtonLoading(false)
      return;
    }
    // set the app state and update async storage separately hear, and throw error
    // asking for refresh if this fails
    try {
      var newState = {
        ...this.context,
        following: this.context.following.filter(userFollowing => {
          return userFollowing._id !== user._id
        })
      }
      console.log('setting new state: ', newState)
      await storeDataObj(newState)
      // start the disappearing animation
      this.disappear()
      // delay setting app state so diappear animation can complete
      setTimeout(() => {
        console.log("done!")
        setAppState(newState)
      }, DISAPPEAR_TIME + 100);
    } catch(e) {
      console.log(e)
      Alert.alert(
        'Oh No :(',
        `Something went wrong updating the app storage. Please refresh.`,
        [{ text: "Okay" }]
      );
      setIsButtonLoading(false)
    }
  }

  render() {
    const { item, section, onItemPress } = this.props;
    return (
      <Animated.View
        style={{
          opacity: this.state.animation
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
            switch(section.title) {
              case(PENDING):
                return (
                  <ActionButton
                    initialTitle='Cancel'
                    onPress={(setIsButtonLoading) => this.cancelFollowRequest(item, setIsButtonLoading)}
                  />
                )
              case(FOLLOWING):
                return (
                  <ActionButton
                    initialTitle='Unfollow'
                    onPress={(setIsButtonLoading) => this.unfollow(item, setIsButtonLoading)}
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

Following.contextType = UserDataContext
export default Following