// Displays the profile of the user who is logged in on the browser
// They should be able to see everything
import React, { Component } from 'react'
import { View, Image, StyleSheet, ScrollView } from 'react-native'
import { Text, Button } from 'react-native-elements'

import { UserDataContext, AppFunctionsContext } from '../../Context';
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
  const appFunctionsContext = React.useContext(AppFunctionsContext);
  const { updateLocalUserInfo } = appFunctionsContext;
  // passed down to the profile template
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await updateLocalUserInfo();
    setRefreshing(false);
  }, []);

  return (
    <ProfileTemplate
      _id={context._id}
      relationshipStatus={PROFILE_CONSTANTS.IS_SELF}
      rootNav={props.rootNav}
      setId={props.setId}
      refreshing={refreshing}
      onRefresh={onRefresh}

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
