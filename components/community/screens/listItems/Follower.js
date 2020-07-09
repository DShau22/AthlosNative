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
const { FOLLOWERS, REQUESTS, DISAPPEAR_TIME } = COMMUNITY_CONSTANTS

const ACCEPT_FOLLOWER_REQUEST = 'accept follower request'
const REJECT_FOLLOWER_REQUEST = 'reject follower request'
const REMOVE_FOLLOWER         = 'remove follower'

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
  // generates the error message based on what action the user performed
  errorMsg(action, requester) {
    switch(action) {
      case ACCEPT_FOLLOWER_REQUEST:
        return `Something went wrong with accepting ${requester.firstName} ${requester.lastName}'s request. Please try again.`
      case REJECT_FOLLOWER_REQUEST:
        return `Something went wrong with rejecting ${requester.firstName} ${requester.lastName}'s request. Please try again.`
      case REMOVE_FOLLOWER:
        return `Something went wrong with remove ${requester.firstName} ${requester.lastName} from your followers. Please try again.`
    }
  }

  // returns new app state after accepting a follower
  accpetFollowerNewState(requester) {
    const newFollowerRequests = this.context.followerRequests.filter(user => {
      return user._id !== requester._id
    })
    const newFollower = {
      _id: requester._id,
      firstName: requester.firstName,
      lastName: requester.lastName,
      profilePicUrl: requester.profilePicUrl
    }
    return {
      ...this.context,
      followers: [...this.context.followers, newFollower],
      followerRequests: newFollowerRequests
    }
  }

  // returns new app state after rejecting a follower
  rejectFollowerNewState(requester) {
    const newFollowerRequests = this.context.followerRequests.filter(user => {
      return user._id !== requester._id
    })
    return {
      ...this.context,
      followerRequests: newFollowerRequests
    }
  }

  // updates async storage after removing a follower
  removeFollowerNewState(requester) {
    const newFollowers = this.context.followers.filter(user => {
      return user._id !== requester._id
    })
    return {
      ...this.context,
      followers: newFollowers
    }
  }

  // will accept/reject follower request or remove the follower 
  // setButtonText is passed as a useState function from action button.
  // it will set the text of the action button once the request is complete
  async buttonAction(requester, action) {
    // set button text to be loading
    const {  setAppState, disappear } = this.props;
    console.log("action taken: ", action)
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
    try {
      const userToken = await getData();
      const requestBody = {
        userToken,
        receiverFirstName: this.context.firstName,
        receiverLastName: this.context.lastName,
        receiverProfilePicUrl: this.context.profilePicture.profileUrl,
        
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
      Alert.alert(
        'Oh No :(',
        this.errorMsg(action, requester),
        [{ text: "Okay" }]
      );
      return;
    }
    // set the app state and update async storage separately hear, and throw error
    // asking for refresh if this fails
    try {
      var newState;
      switch(action) {
        case ACCEPT_FOLLOWER_REQUEST:
          newState = this.accpetFollowerNewState(requester);
          break;
        case REJECT_FOLLOWER_REQUEST:
          newState = this.rejectFollowerNewState(requester);
          break;
        case REMOVE_FOLLOWER:
          newState = this.removeFollowerNewState(requester);
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
    }
  }
  render() {
    console.log('render: ', this.state.animation)

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
              case(REQUESTS):
                return (
                  <AcceptRejectButton
                    accept={() => this.buttonAction(item, ACCEPT_FOLLOWER_REQUEST)}
                    reject={() => this.buttonAction(item, REJECT_FOLLOWER_REQUEST)}
                  />
                )
              case(FOLLOWERS):
                return (
                  <ActionButton
                    initialTitle='Remove'
                    onPress={() => this.buttonAction(item, REMOVE_FOLLOWER)}
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
      </Animated.View>

    )
  }
}
Follower.contextType = UserDataContext
export default Follower