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
const { ONLY_ME, FOLLOWERS, EVERYONE } = GLOBAL_CONSTANTS

const SearchProfile = (props) => {
  const context = React.useContext(UserDataContext);
  // all these correspond to the fields of the searched user, NOT
  // the user who's using the app right now
  const [isLoading, setIsLoading] = React.useState(false);
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
  const { _id } = props.route.params
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
      const res = await fetch(ENDPOINTS.getSearchUserFitness, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id }),
      })
      console.log("get totals set state")
      const { bests, totals } = await res.json()
      setState(prevState => ({ ...prevState, bests, totals }))
    }
  }

  const { firstName, lastName, age, height, bio, weight, totals, bests, profilePicture } = state
  const { followers, following, rivals } = state
  console.log("search profile's state: ", state);
  if (context.mounted) {
    return (
      <View>
        <Spinner
          visible={isLoading}
          textContent={'Loading...'}
          // textStyle={styles.spinnerTextStyle}
        />
        <View>
          <View>
            <Image 
              source={{ uri: profilePicture.profileURL}}
              style={styles.tinyLogo}
              // defaultSource={{uri: imgAlt}}
            />
          </View>
          <View>
            <Text>{firstName}</Text>
            <Text>{lastName}</Text>
          </View>
          <View>
            <View >
              <View>
                <Text h3>Age</Text>
                <Text>{age}</Text>
              </View>
              <View>
                <Text h3>Height</Text>
                <Text>{height}</Text>
              </View>
              <View>
                <Text h3>Weight</Text>
                <Text>{weight}</Text>
              </View>
            </View>
          </View>
          <View>
            <Text h3>Bio</Text>
            <Text>{bio}</Text>
          </View>
        </View>
        <View>
          <View>
            <View>
              <Text h3>Total Steps</Text>
              <Text>{totals.steps}</Text>
            </View>
            <View>
              <Text h3>Total Min</Text>
              <Text>{totals.minutes}</Text>
            </View>
          </View>
          <View>
            <View>
              <Text h3>Total Laps</Text>
              <Text>{totals.laps}</Text>
            </View>
            <View>
              <Text h3>Highest Jump</Text>
              <Text>{bests.jump}</Text>
            </View>
            <View>
              <Text h3>people</Text>
              <Text>have screen for followers, following, rivals. Maybe community Nav???</Text>
            </View>
          </View>
        </View>
      </View>
    )
  } else {
    // spa hasn't mounted and established context yet
    return (
      <View>
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