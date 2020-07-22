import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React, { Component } from 'react';
import { View, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Button } from 'react-native'
import { Text } from 'react-native-elements'
// import {
//   withRouter
// } from "react-router-dom";
// import UserProfile from "./UserProfile"
// import SearchProfile from "./SearchProfile"
import { UserDataContext } from '../../Context';
import Fitness from '../fitness/Fitness'
import UserProfile from './UserProfile'
import EditProfileFunc from './EditProfileFunc';
import LoadingScreen from '../generic/LoadingScreen';
import { createStackNavigator } from '@react-navigation/stack';
import PROFILE_CONSTANTS from "./ProfileConstants"
import WithRefresh from '../generic/WithRefresh'
import SearchProfile from './SearchProfile';

const Profile = (props) => {
  // this is the user's own id
  const { _id, test } = props.route.params;
  const userDataContext = React.useContext(UserDataContext)

  const [id, setId] = React.useState(_id)
  // whenever the id changes, check if it matches the id of the user. If it does,
  // set the state based on the context. If not, do a fetch and set state based on
  // fetch results and the search user's settings. If they settings don't permit this
  // user to view that field, don't set the field so it'll remain undefined.
  React.useEffect(() => {
    console.log("using effect cuz route params: ", _id);
    setId(_id)
  }, [_id])

  const wait = (timeout) => {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  }

  const onRefresh = () => {
    return wait(2000);
  }

  const Stack = createStackNavigator();
  console.log('returning the profile props, id is: ', _id);
  return (
    // <WithRefresh
    //   refreshFunction={onRefresh}
    // >
    <>
      { _id === userDataContext._id ? 
        <UserProfile /> : <SearchProfile _id={_id} />
      }
    </>
    // </WithRefresh>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
    // backgroundColor: 'pink',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
})
export default gestureHandlerRootHOC(Profile)
