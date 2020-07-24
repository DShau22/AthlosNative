// A template for the general structure and style of a profile
// has many holes that need to be filled with a shit ton of props
// oassed in from the profile component

import React, { Component } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack';

import { UserDataContext, ProfileContext } from '../../Context';
import { poundsToKg, inchesToCm } from "../utils/unitConverter"
import PROFILE_CONSTANTS from "./ProfileConstants"
const {
  IS_SELF, USER_PROFILE, SEARCH_PROFILE
} =  PROFILE_CONSTANTS
import GLOBAL_CONSTANTS from '../GlobalConstants'
const { METRIC, ENGLISH } = GLOBAL_CONSTANTS
import Community from '../community/Community'
import Fitness from '../fitness/Fitness'
import ProfileHeader from './sections/ProfileHeader'
import ProfileBests from './sections/ProfileBests'
import ProfileInfo from './sections/ProfileInfo'
// replace with default avatar link
const imgAlt = "./default_profile.png"

const ProfileTemplate = (props) => {
  const userDataContext = React.useContext(UserDataContext)
  const {
    _id,
    profileHeaderProps,
    communityProps,
    relationshipStatus,
    fitnessProps,
    bestsProps,
    infoProps,
    profileContext
    // rootNav
  } = props

  const navigateToFitness = (navigation) => {
    if (relationshipStatus === PROFILE_CONSTANTS.IS_SELF) {
      navigation.navigate(GLOBAL_CONSTANTS.FITNESS, {_id: userDataContext._id})
    } else {
      navigation.navigate(GLOBAL_CONSTANTS.FITNESS, {_id: _id})
    }
  }

  const Stack = createStackNavigator();
  const profileScreenName = relationshipStatus === IS_SELF ? USER_PROFILE : SEARCH_PROFILE
  return (
    <ProfileContext.Provider value={{...props.profileContext, relationshipStatus}}>
      <Stack.Navigator headerMode='none' initialRouteName={profileScreenName}>
        <Stack.Screen
          name={profileScreenName}
        >
          {(props) => (
            <View style={styles.container}>
              {relationshipStatus !== IS_SELF ? 
                <Button 
                  title='back to your profile'
                  onPress={() => props.navigation.navigate(GLOBAL_CONSTANTS.PROFILE, {_id: userDataContext._id})}
                /> : null
              }
              <ProfileHeader
                {...profileHeaderProps}
                navigation={props.navigation}
              />
              <Button
                title='See Fitness'
                onPress={() => navigateToFitness(props.navigation)}
              />
              <ProfileInfo 
                {...infoProps}
              />
              <ProfileBests
                {...bestsProps}
              />
            {/* <View className='top-half'>
              <View className='info-container m-3'>
                <View className='row'>
                  <View className='col-4'>
                    <Text h4>Age</Text>
                    <Text>{context.age}</Text>
                  </View>
                  <View className='col-4'>
                    <Text h4>Height</Text>
                    <Text>{renderHeight()}</Text>
                  </View>
                  <View className='col-4'>
                    <Text h4>Weight</Text>
                    <Text>{renderWeight()}</Text>
                  </View>
                </View>
              </View>
              <View className='bio-container m-3'>
                <Text>{renderBio()}</Text>
              </View>
            </View> */}
            <View className='bot-half'>
              <View className='row'>
                <Text className='col-6'>
                  total steps
                </Text>
                <Text className='col-6'>
                  total mins
                </Text>
              </View>
              <View className='row'>
                <Text className='col-6'>
                  total laps
                </Text>
                <Text className='col-6'>
                  hightest jump
                </Text>
              </View>
            </View>
          </View>
          )}
        </Stack.Screen>
        <Stack.Screen name={GLOBAL_CONSTANTS.COMMUNITY}>
          {props => (
            <Community
              {...communityProps}
              navigation={props.navigation}
              // rootNav={rootNav}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name={GLOBAL_CONSTANTS.FITNESS}>
          {props => (
            <Fitness
              _id={_id}
              {...fitnessProps}
              navigation={props.navigation}
              relationshipStatus={relationshipStatus}
            />
          )}
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
  editButton: {
    backgroundColor: 'red',
    width: '80%'
  }
});

export default ProfileTemplate