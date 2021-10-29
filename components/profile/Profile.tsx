import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React, { Component } from 'react';
import { View, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Button } from 'react-native'
import { Text } from 'react-native-elements'
import PROFILE_CONSTANTS from './ProfileConstants'
import { UserDataContext } from '../../Context';
import UserProfile from './UserProfile'
import EditProfile from './EditProfile';
import LoadingScreen from '../generic/LoadingScreen';
import { createStackNavigator } from '@react-navigation/stack';
import WithRefresh from '../generic/WithRefresh'
import SearchProfile from './SearchProfile';
import { useTheme } from '@react-navigation/native';
import { UserDataInterface } from '../generic/UserTypes';

const Profile = (props) => {
  // this is the user's own id
  const { _id } = props.route.params;
  const userDataContext = React.useContext(UserDataContext) as UserDataInterface;

  const [id, setId] = React.useState(_id)
  // console.log("profile id: ", id)

  // whenever the id changes, check if it matches the id of the user. If it does,
  // set the state based on the context. If not, do a fetch and set state based on
  // fetch results and the search user's settings. If they settings don't permit this
  // user to view that field, don't set the field so it'll remain undefined.
  React.useEffect(() => {
    // console.log("using effect cuz route params: ", _id);
    setId(_id)
  }, [_id])

  const Stack = createStackNavigator();
  const { colors } = useTheme();
  // console.log('returning the profile props, id is: ', _id);
  return (
    <>
      { id === userDataContext._id ? 
        <UserProfile setId={setId} rootNav={props.navigation} _id={id}/> : <SearchProfile setId={setId} rootNav={props.navigation} _id={id} />
      } 
    </>
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