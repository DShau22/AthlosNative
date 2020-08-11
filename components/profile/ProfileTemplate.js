// A template for the general structure and style of a profile
// has many holes that need to be filled with a shit ton of props
// oassed in from the profile component
import React, { Component } from 'react'
import { View, ScrollView, StyleSheet, RefreshControl, Image } from 'react-native'
import { Text, Button, Divider } from 'react-native-elements'
import {Card} from 'react-native-paper'
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '@react-navigation/native';

import { UserDataContext, ProfileContext } from '../../Context';
import { poundsToKg, inchesToCm } from "../utils/unitConverter"
import PROFILE_CONSTANTS from "./ProfileConstants"
const {
  USER_PROFILE,
  SEARCH_PROFILE,
  IS_RIVAL,

  IS_SELF,
  UNRELATED,
  IS_FOLLOWER,
  IS_FOLLOWING,
  IS_FOLLOWER_PENDING,
  IS_FOLLOWING_PENDING,
} = PROFILE_CONSTANTS
import GLOBAL_CONSTANTS from '../GlobalConstants'
const { METRIC, ENGLISH, EVERYONE, FOLLOWERS, ONLY_ME } = GLOBAL_CONSTANTS
import Community from '../community/Community'
import Fitness from '../fitness/Fitness'
import ProfileHeader from './sections/ProfileHeader'
import ProfileBests from './sections/ProfileBests'
import ProfileInfo from './sections/ProfileInfo'
import ProfileAggregates from './sections/ProfileAggregates'
import EditProfile from './EditProfileFunc'
import GradientButton from '../generic/GradientButton'
import { TouchableOpacity } from 'react-native-gesture-handler';
import StatCard from '../fitness/StatCard';
import ThemeText from '../generic/ThemeText';

// replace with default avatar link
const imgAlt = "./default_profile.png"

const ProfileTemplate = (props) => {
  const userDataContext = React.useContext(UserDataContext)
  const {
    followers,
    following,
    followerRequests,
    followingPending
  } = userDataContext
  const {
    _id,
    // relationshipStatus,
    profileContext,
    setId,
    refreshing,
    onRefresh,
    rootNav
  } = props
  const { settings } = profileContext
  const { colors } = useTheme();

  const getRelationshipStatus = () => {
    // CHECK THE PROFILE CONSTANTS TO MAKE SURE THESE ENUMS MATCH
    if (_id === userDataContext._id) {
      return IS_SELF;
    }
    // ORDER MATTERS
    // for now, can unfollow someone, and then remove them as follower
    // but not the other direction. Add that in later 
    for (i = 0; i < following.length; i++) {
      if (following[i]._id === _id) {
        return IS_FOLLOWING;
      }
    }
    for (i = 0; i < followers.length; i++) {
      if (followers[i]._id === _id) {
        return IS_FOLLOWER;
      }
    }
    for (i = 0; i < followerRequests.length; i++) {
      if (followerRequests[i]._id === _id) {
        return IS_FOLLOWER_PENDING;
      }
    }
    for (i = 0; i < followingPending.length; i++) {
      if (followingPending[i]._id === _id) {
        return IS_FOLLOWING_PENDING;
      }
    }
    return UNRELATED
  }
  const relationshipStatus = getRelationshipStatus()
  // const [relationshipStatus, setRelationshipStatus] = React.useState(getRelationshipStatus())

  const navigateToFitness = (navigation) => {
    navigation.navigate(GLOBAL_CONSTANTS.FITNESS, {_id: _id})
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

  const Stack = createStackNavigator();
  const profileScreenName = relationshipStatus === IS_SELF ? USER_PROFILE : SEARCH_PROFILE
  return (
    <ProfileContext.Provider value={{...profileContext, relationshipStatus, setId, _id}}>
      <Stack.Navigator initialRouteName={profileScreenName}>
        <Stack.Screen
          name={profileScreenName}
          options={{ title: relationshipStatus === IS_SELF ? 'Your Profile' : `${profileContext.firstName}'s Profile` }}
        >
          {(props) => (
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              <View style={styles.container}>
                {relationshipStatus !== IS_SELF ? 
                  <Button
                    containerStyle={{alignSelf: 'flex-start', marginBottom: 10, marginLeft: 10}}
                    buttonStyle={{backgroundColor: colors.button}}
                    title='back to your profile'
                    onPress={() => setId(userDataContext._id)}
                  /> : null
                }
                <ProfileHeader
                  navigation={props.navigation}
                  relationshipStatus={relationshipStatus}
                />
                <View style={styles.routeButtons}>
                  {canViewFitness() ?
                    <Card
                      onPress={() => navigateToFitness(props.navigation)}
                      style={[styles.routeButtonCard, {backgroundColor: colors.cardBackground}]}
                    >
                      <Card.Content style={styles.routeButtonCardContent}>
                        <Image
                          style={styles.cardImage}
                          source={{uri: 'https://reactnative.dev/img/tiny_logo.png'}}
                        />
                        <ThemeText h4>Fitness</ThemeText>
                      </Card.Content>
                    </Card> : null
                  }
                  {canViewBasicInfo() ?
                    <Card
                      onPress={() => props.navigation.navigate(PROFILE_CONSTANTS.BASIC_INFO)}
                      style={[styles.routeButtonCard, {backgroundColor: colors.cardBackground}]}
                    >
                      <Card.Content style={[styles.routeButtonCardContent]}>
                        <Image
                          style={styles.cardImage}
                          source={{uri: 'https://reactnative.dev/img/tiny_logo.png'}}
                          />
                        <ThemeText h4>Info</ThemeText>
                      </Card.Content>
                    </Card> : null
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
              {...props}
              rootNav={rootNav}
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
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: 'red',
    width: '80%'
  },
  routeButtonCard: {
    flex: 1,
    // backgroundColor: 'red',
    margin: 10,
    elevation: 4,
    height: 80
  },
  routeButtonCardContent: {
    height: 80,
    // backgroundColor: 'blue',
    flexDirection: 'row',
    alignItems: 'center'
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 60,
    marginRight: 10
  }
});

export default ProfileTemplate