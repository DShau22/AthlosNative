// Displays the profile of the user who is logged in on the browser
// They should be able to see everything
import React, { Component } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-elements'

import { UserDataContext, ProflieContext } from '../../Context';
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
  return (
    <ProfileTemplate
      _id={context._id}
      relationshipStatus={PROFILE_CONSTANTS.IS_SELF}
      rootNav={props.rootNav}

      profileContext={context}
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
