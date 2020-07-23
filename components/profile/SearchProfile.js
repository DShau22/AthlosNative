// Displays the profile of the searched person
// that the user logged in on the browser searched for

import React, { Component } from 'react'
import { UserDataContext } from '../../Context';
import { View, StyleSheet, FlatList, ScrollView, Alert, Button } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack';

import { Text } from 'react-native-elements'
import Spinner from 'react-native-loading-spinner-overlay';
import { getData } from "../utils/storage"
import ENDPOINTS from '../endpoints'
import GLOBAL_CONSTANTS from "../GlobalConstants"
const { ONLY_ME, FOLLOWERS, EVERYONE } = GLOBAL_CONSTANTS
import PROFILE_CONSTANTS from './ProfileConstants'
import Community from '../community/Community'
import ProfileHeader from './sections/ProfileHeader'
import ProfileTemplate from './ProfileTemplate'

const SearchProfile = (props) => {
  const userDataContext = React.useContext(UserDataContext)
  // all these correspond to the fields of the searched user, NOT
  // the user who's using the app right now
  const [isLoading, setIsLoading] = React.useState(false);
  // This state only contains what's necessary. All the fitness stuff
  // should be fetched (if needed) in the fitness component
  const [state, setState] = React.useState({
    settings: {},
    firstName: '',
    lastName: '',
    follows: false,
    bio: '',
    age: '',
    height: '',
    weight: '',
    totals: {},
    bests: {},
    profilePicture: {},

    followers: [],
    following: [],
    rivals: [],
  })
  // the searched user's id
  const { _id } = props
  console.log("search user id: ", _id);

  React.useEffect(() => {
    const setup = async () => {
      console.log("search profile using effect")
      setIsLoading(true);
      // query this user's settings, bests, totals and set state
      const token = await getData()
      try {
        const res = await fetch(ENDPOINTS.getSearchUser, {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _id, userToken: token }),
        })
        const searchUserJson = await res.json();
        const { success, settings, firstName, lastName, follows, profilePicture } = searchUserJson
        if (!success) {
          console.log("not success: ", searchUserJson)
          Alert.alert(`Oh No :(`, "Something went wrong with the server. Please try again.", [{ text: "Okay" }]);
          setIsLoading(false);
          return
        }
        setState(prevState => ({ ...prevState, settings, firstName, lastName, follows, profilePicture }))
        // need to pass in settings, follows cuz setState is asynchronous
        await Promise.all([
          getBasicInfo(settings, follows),
          getTotalsAndBests(settings, follows),
          getPeople(settings, follows)
        ])
        setIsLoading(false);
      } catch(e) {
        console.log(e)
        Alert.alert(`Oh No :(`, "Something went wrong with the connection to the server. Please try again.", [{ text: "Okay" }]);
        setIsLoading(false);
      }
    }
    setup();
  }, []);

  const getBasicInfo = async (settings, follows) => {
    console.log("get basic info")
    const { seeBasicInfo } = settings
    if (seeBasicInfo === EVERYONE || (seeBasicInfo === FOLLOWERS && follows)) {
      const res = await fetch(ENDPOINTS.getSearchUserBasicInfo, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id }),
      })
      const { bio, weight, height, age, gender } = await res.json()
      console.log("get basic info set state")
      setState(prevState => ({ ...prevState, bio, weight, height, age, gender }))
    }
  }

  // gets the followers, following, and rivals lists
  const getPeople = async (settings, follows) => {
    console.log("getting people")
    const { seePeople } = settings
    if (seePeople === EVERYONE || (seePeople === FOLLOWERS && follows)) {
      const res = await fetch(ENDPOINTS.getSearchUserPeople, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id }),
      })
      const { followers, following, rivals } = await res.json()
      console.log("get friends set state")
      setState(prevState => ({ ...prevState, followers, following, rivals }))
    }
  }

  const getTotalsAndBests = async (settings, follows) => {
    console.log("get totals")
    const { seeFitness } = settings
    if (seeFitness === EVERYONE || (seeFitness === FOLLOWERS && follows)) {
      const res = await fetch(ENDPOINTS.getSearchUserFitnessBests, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id }),
      })
      console.log("get totals set state")
      const { bests, totals } = await res.json()
      setState(prevState => ({ ...prevState, bests, totals }))
    }
  }

  const { firstName, lastName, age, height, bio, weight, totals, bests, profilePicture, settings } = state
  const { followers, following, rivals } = state
  console.log("search profile's state: ", state);
  const Stack = createStackNavigator();
  const profileHeaderProps = {
    profileURL: profilePicture.profileURL,
    firstName: firstName,
    lastName: lastName,
    numFollowers: followers.length,
    numFollowing: following.length,
    numRivals: rivals.length,
    relationshipStatus: PROFILE_CONSTANTS.SEARCH_PROFILE,
    settings,
  }
  const communityProps = {
    followers: followers,
    following: following,
    rivals: rivals,
    relationshipStatus: PROFILE_CONSTANTS.SEARCH_PROFILE,
    settings,
  }
  const fitnessProps = {
    settings
  }
  return (
    <>
      <Spinner
        visible={isLoading}
        textContent={'Loading...'}
        // textStyle={styles.spinnerTextStyle}
      />
      <ProfileTemplate
        _id={_id}
        profileHeaderProps={profileHeaderProps}
        communityProps={communityProps}
        fitnessProps={fitnessProps}
        relationshipStatus={'firned....'}
        rootNav={props.rootNav}
      />
    </>
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

export default SearchProfile