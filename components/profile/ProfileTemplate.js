// A template for the general structure and style of a profile
// has many holes that need to be filled with a shit ton of props
// oassed in from the profile component

import React, { Component } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack';

import { UserDataContext, ProfileContext } from '../../Context';
import { poundsToKg, inchesToCm } from "../utils/unitConverter"
import PROFILE_CONSTANTS from "./ProfileConstants"
const {
  IS_SELF, IS_FOLLOWER, IS_FOLLOWING, IS_RIVAL, USER_PROFILE, SEARCH_PROFILE
} =  PROFILE_CONSTANTS
import GLOBAL_CONSTANTS from '../GlobalConstants'
const { METRIC, ENGLISH, EVERYONE, FOLLOWERS, ONLY_ME } = GLOBAL_CONSTANTS
import Community from '../community/Community'
import Fitness from '../fitness/Fitness'
import ProfileHeader from './sections/ProfileHeader'
import ProfileBests from './sections/ProfileBests'
import ProfileInfo from './sections/ProfileInfo'
import ProfileAggregates from './sections/ProfileAggregates'
import EditProfile from './EditProfileFunc'
// replace with default avatar link
const imgAlt = "./default_profile.png"

const ProfileTemplate = (props) => {
  const userDataContext = React.useContext(UserDataContext)
  const {
    _id,
    relationshipStatus,
    profileContext
    // rootNav
  } = props
  const { settings } = profileContext

  const navigateToFitness = (navigation) => {
    if (relationshipStatus === PROFILE_CONSTANTS.IS_SELF) {
      navigation.navigate(GLOBAL_CONSTANTS.FITNESS, {_id: userDataContext._id})
    } else {
      navigation.navigate(GLOBAL_CONSTANTS.FITNESS, {_id: _id})
    }
  }

  const canViewFitness = () => (
    relationshipStatus === IS_SELF ||
    settings.seeFitness === EVERYONE ||
    ((relationshipStatus === IS_FOLLOWING || relationshipStatus === IS_RIVAL) && settings.seeFitness === FOLLOWERS)
  )

  const canViewTotals = () => (
    relationshipStatus === IS_SELF ||
    settings.seeTotals === EVERYONE ||
    ((relationshipStatus === IS_FOLLOWING || relationshipStatus === IS_RIVAL) && settings.seeTotals === FOLLOWERS)
  )

  const canViewBests = () => (
    relationshipStatus === IS_SELF ||
    settings.seeBests === EVERYONE ||
    ((relationshipStatus === IS_FOLLOWING || relationshipStatus === IS_RIVAL) && settings.seeBests === FOLLOWERS)
  )

  const canViewBasicInfo = () => (
    relationshipStatus === IS_SELF ||
    settings.seeBasicInfo === EVERYONE ||
    ((relationshipStatus === IS_FOLLOWING || relationshipStatus === IS_RIVAL) && settings.seeBasicInfo === FOLLOWERS)
  )
  console.log('setings', settings)
  console.log('bests', canViewBests())
  const Stack = createStackNavigator();
  const profileScreenName = relationshipStatus === IS_SELF ? USER_PROFILE : SEARCH_PROFILE
  return (
    <ProfileContext.Provider value={{...profileContext, relationshipStatus}}>
      <Stack.Navigator initialRouteName={profileScreenName}>
        <Stack.Screen
          name={profileScreenName}
          options={{ title: relationshipStatus === IS_SELF ? 'Your Profile' : `${profileContext.firstName}'s Profile` }}
        >
          {(props) => (
            <ScrollView>
              <View style={styles.container}>
                {relationshipStatus !== IS_SELF ? 
                  <Button 
                    title='back to your profile'
                    onPress={() => props.navigation.navigate(GLOBAL_CONSTANTS.PROFILE, {_id: userDataContext._id})}
                  /> : null
                }
                <ProfileHeader
                  navigation={props.navigation}
                  relationshipStatus={relationshipStatus}
                />
                <View style={styles.routeButtons}>
                  {canViewFitness() ?
                    <Button
                      title='See Fitness'
                      onPress={() => navigateToFitness(props.navigation)}
                    /> : null
                  }
                  {canViewBasicInfo() ?
                    <Button
                      title='See Basic Info'
                      onPress={() => props.navigation.navigate(PROFILE_CONSTANTS.BASIC_INFO)}
                    /> : null
                  }
                </View>
                {canViewBests() ? <ProfileBests /> : null}
                {canViewTotals() ? <ProfileAggregates /> : null}
              </View>
            </ScrollView>
          )}
        </Stack.Screen>
        <Stack.Screen
          name={GLOBAL_CONSTANTS.COMMUNITY}
          options={{ title: relationshipStatus === IS_SELF ? 'Your Community' : `${profileContext.firstName}'s Community` }}
        >
          {props => (
            <Community
              navigation={props.navigation}
              // rootNav={rootNav}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name={GLOBAL_CONSTANTS.FITNESS}
          options={{ title: relationshipStatus === IS_SELF ? 'Your Fitness' : `${profileContext.firstName}'s Fitness` }}
        >
          {props => (
            <Fitness
              _id={_id}
              navigation={props.navigation}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name={PROFILE_CONSTANTS.BASIC_INFO}
          options={{ title: relationshipStatus === IS_SELF ? 'Your Basic Info' : `${profileContext.firstName}'s Basic Info` }}
        >
          {props => (
            <ProfileInfo
              _id={_id}
              navigation={props.navigation}
              relationshipStatus={relationshipStatus}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name={PROFILE_CONSTANTS.EDIT_PROFILE}
          options={{ title: 'Edit Your Profile' }}
        >
          {props => ( <EditProfile navigation={props.navigation}/> )}
        </Stack.Screen>
      </Stack.Navigator>
    </ProfileContext.Provider>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    alignItems: 'center'
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
  logo: {
    width: 66,
    height: 58,
  },
  routeButtons: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: 'red',
    width: '80%'
  }
});

export default ProfileTemplate