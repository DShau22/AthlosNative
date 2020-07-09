// Displays the profile of the searched person
// that the user logged in on the browser searched for

import React, { Component } from 'react'
// import {
//   Redirect,
// } from "react-router-dom";
// import { englishHeight }from "../utils/unitConverter"
import { UserDataContext } from '../../Context';
import { View, StyleSheet, FlatList, ScrollView, Alert, Image } from 'react-native'
import { Text } from 'react-native-elements'
import Spinner from 'react-native-loading-spinner-overlay';
// import { withRouter } from 'react-router-dom';
// import './css/userProfile.css'
import { getData } from "../utils/storage"
import ENDPOINTS from '../endpoints'
import GLOBAL_CONSTANTS from "../GlobalConstants"
const { ONLY_ME, FRIENDS, EVERYONE } = GLOBAL_CONSTANTS
const getSearchUserUrl = ENDPOINTS.getSearchUser
const getBasicInfoURL = ENDPOINTS.getSearchUserBasicInfo
const getFriendsURL = ENDPOINTS.getSearchUserFriends
const getFitnessURL = ENDPOINTS.getSearchUserFitness

const imgAlt = "./default_profile.png"

const SearchProfile = (props) => {
  const context = React.useContext(UserDataContext);
  // all these correspond to the fields of the searched user, NOT
  // the user who's using the app right now
  const [isLoading, setIsLoading] = React.useState(false);
  const [state, setState] = React.useState({
    errorMsgs: [],
    settings: {},
    firstName: '',
    lastName: '',
    follows: false,
    bio: '',
    age: 0,
    height: '',
    weight: '',
    totals: {},
    bests: {},
    profilePicture: {},
    friends: []
  })
  // the searched user's id
  const { _id } = props.route.params
  console.log("search user id: ", _id);

  React.useEffect(() => {
    const setup = async () => {
      console.log("search profile using effect")
      setIsLoading(true);
      // query this user's settings, bests, totals and set state
      var token = await getData()
      try {
        var res = await fetch(getSearchUserUrl, {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _id, userToken: token }),
        })
        var searchUserJson = await res.json();
        var { success, settings, firstName, lastName, follows, profilePicture } = searchUserJson
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
          getFriends(settings, follows)
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
    var { seeBasicInfo } = settings
    if (seeBasicInfo === EVERYONE || (seeBasicInfo === FRIENDS && follows)) {
      var res = await fetch(getBasicInfoURL, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id }),
      })
      var { bio, weight, height, age, gender } = await res.json()
      console.log("get basic info set state")
      setState(prevState => ({ ...prevState, bio, weight, height, age, gender }))
    }
  }

  const getFriends = async (settings, follows) => {
    console.log("get friends")
    var { seeFriendsList } = settings
    if (seeFriendsList === "everyone" || (seeFriendsList === "friends" && follows)) {
      var res = await fetch(getFriendsURL, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id }),
      })
      var { friends } = await res.json()
      console.log("get friends set state")
      setState(prevState => ({ ...prevState, friends }))
    }
  }

  const getTotalsAndBests = async (settings, follows) => {
    console.log("get totals")
    var { seeFitness } = settings
    if (seeFitness === "everyone" || (seeFitness === "friends" && follows)) {
      var res = await fetch(getFitnessURL, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id }),
      })
      console.log("get totals set state")
      var { bests, totals } = await res.json()
      setState(prevState => ({ ...prevState, bests, totals }))
    }
  }

  var { firstName, lastName, age, height, bio, weight, totals, bests, profilePicture } = state
  console.log("search profile's state: ", state);
  if (context.mounted) {
    return (
      <View className="profile-container">
        <Spinner
          visible={isLoading}
          textContent={'Loading...'}
          // textStyle={styles.spinnerTextStyle}
        />
        <View className='top-half'>
          <View className='img-container mt-2'>
            <Image 
              source={{ uri: profilePicture.profileURL}}
              style={styles.tinyLogo}
              // defaultSource={{uri: imgAlt}}
            />
          </View>
          <View className="name-container">
            <Text className='fname'>{firstName}</Text>
            <Text className='lname'>{lastName}</Text>
          </View>
          <View className='info-container m-3'>
            <View className='row'>
              <View className='col-4'>
                <Text h3>Age</Text>
                <Text>{age}</Text>
              </View>
              <View className='col-4'>
                <Text h3>Height</Text>
                <Text>{height}</Text>
              </View>
              <View className='col-4'>
                <Text h3>Weight</Text>
                <Text>{weight}</Text>
              </View>
            </View>
          </View>
          <View className='bio-container m-3'>
            <Text>{bio}</Text>
          </View>
        </View>
        <View className='bot-half'>
          <View className='row'>
            <View className='col-6'>
              <Text h3>Total Steps</Text>
              <Text>{totals.steps}</Text>
            </View>
            <View className='col-6'>
              <Text h3>Total Min</Text>
              <Text>{totals.minutes}</Text>
            </View>
          </View>
          <View className='row'>
            <View className='col-6'>
              <Text h3>Total Laps</Text>
              <Text>{totals.laps}</Text>
            </View>
            <View className='col-6'>
              <Text h3>Highest Jump</Text>
              <Text>{bests.jump}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  } else {
    // spa hasn't mounted and established context yet
    return (
      <View className="profile-loading-container">
        <Text>loading...</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
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