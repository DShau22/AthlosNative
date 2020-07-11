import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React, { Component } from 'react';
import { View } from 'react-native'
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

const Profile = (props) => {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator headerMode='none'>
      <Stack.Screen name={PROFILE_CONSTANTS.PROFILE}>
        {(props) => (
          <>
            <Text>BUNCH OF TEXT HELLO</Text>
            <UserProfile {...props}/>
            {/* <Fitness /> */}
          </>
        )}
      </Stack.Screen>
      <Stack.Screen name={PROFILE_CONSTANTS.EDIT_PROFILE} component={EditProfileFunc}/>
    </Stack.Navigator>
  )
    var { context } = this
    var { username } = this.props.match.params
    // if (username === context.username) {
    //   // this is the same user who is looking at their own profile
    //   return ( <UserProfile/> )
    // }
    // return ( <SearchProfile/> )
}

// export default withRouter(Profile)
export default gestureHandlerRootHOC(Profile)
