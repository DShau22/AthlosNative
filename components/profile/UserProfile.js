// Displays the profile of the user who is logged in on the browser
// They should be able to see everything
import React, { Component } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-elements'

import { UserDataContext } from '../../Context';
import { poundsToKg, inchesToCm } from "../utils/unitConverter"
import PROFILE_CONSTANTS from "./ProfileConstants"
import GLOBAL_CONSTANTS from '../GlobalConstants'
const { METRIC, ENGLISH } = GLOBAL_CONSTANTS
import Community from '../community/Community'

import ProfileHeader from './sections/ProfileHeader'
import ProfileTemplate from './ProfileTemplate'
// replace with default avatar link
const imgAlt = "./default_profile.png"

const UserProfile = (props) => {
  const context = React.useContext(UserDataContext);
  const [expandBio, setExpandBio] = React.useState(false);

  const renderBio = () => {
    var { bio } = context
    const onClick = () => {
      expandBio(true);
    }
    if (!bio) {
      return (
        <p>No bio yet</p>
      )
    }
    return (
      <Text>{bio}</Text>
      // <ShowMoreText
      //   /* Default options */
      //   lines={3}
      //   more='Show more'
      //   less='Show less'
      //   anchorClass=''
      //   onClick={onClick}
      //   expanded={state.expandBio}
      // >
      //   {bio}
      // </ShowMoreText>
    )
  }

  const renderHeight = () => {
    var { height, settings } = context
    var { unitSystem } = settings
    unitSystem = unitSystem.toLowerCase()
    return unitSystem === METRIC ? `${inchesToCm(height)} cm` : `${Math.floor(height / 12)} ft ${height % 12} in`
  }

  const renderWeight = () => {
    var { weight, settings } = context
    var { unitSystem } = settings
    unitSystem = unitSystem.toLowerCase()
    return unitSystem === METRIC ? `${poundsToKg(weight)} kg` : `${weight} lbs`
  }

  const renderBests = () => {
    // calculate bests based off of state and settings
  }

  const renderNumFriends = () => {
    var { friends } = context
    return (
      <p>{"friends: " + friends.length}</p>
    )
  }

  const renderPopup = () => {
    const editBtn = (
      <View className='edit-btn-container'>
        <i className='far'>&#xf044;</i>
        <span className="edit-btn">Edit Profile</span>
      </View>
    )
    return (
      <Text>popup should be here</Text>
      // <Popup trigger={editBtn} modal>
      //   {close => (
      //     <View className="popup-modal">
      //       <View className="popup-close" onClick={close}>
      //         &times;
      //       </View>
      //       <h4 className="popup-header"> Edit your profile </h4>
      //       <View className="content">
      //         <EditProfileFunc closePopup={close}/>
      //       </View>
      //     </View>
      //   )}
      // </Popup>
    )
  }
  const profileHeaderProps = {
    profileURL: context.profilePicture.profileURL,
    firstName: context.firstName,
    lastName: context.lastName,
    numFollowers: context.followers.length,
    numFollowing: context.following.length,
    numRivals: context.rivals.length,
    relationshipStatus: PROFILE_CONSTANTS.IS_SELF,
  }
  const communityProps = {
    followerRequests: context.followerRequests,
    followers: context.followers,
    followingPending: context.followingPending,
    following: context.following,
    rivalRequests: context.rivalRequests,
    rivalsPending: context.rivalsPending,
    rivals: context.rivals,
    relationshipStatus: PROFILE_CONSTANTS.IS_SELF,
    settings: context.settings,
  }
  const fitnessProps = {
    settings: context.settings,
  }
  return (
    <ProfileTemplate
      _id={context._id}
      profileHeaderProps={profileHeaderProps}
      communityProps={communityProps}
      fitnessProps={fitnessProps}
      bestsProps={context.bests}
      relationshipStatus={PROFILE_CONSTANTS.IS_SELF}
      rootNav={props.rootNav}
    />
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
  logo: {
    width: 66,
    height: 58,
  },
  editButton: {
    backgroundColor: 'red',
    width: '80%'
  }
});

export default UserProfile
