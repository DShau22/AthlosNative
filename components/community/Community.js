import {
  getData,
} from '../utils/storage';

import React from 'react'
// import FriendRequests from "./friends/FriendRequests"
// import Friends from "./friends/Friends"
import { View, Alert, StyleSheet, Text, Dimensions, PixelRatio } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import Discover from './screens/Discover'

import { UserDataContext } from '../../Context'
import ENDPOINTS from "../endpoints"
import CommunityList from './screens/CommunityList';
// import UserProfile from '../profile/UserProfile'
import CommunityNav from './CommunityNav';
const searchURL = ENDPOINTS.searchUser
const friendReqURL = ENDPOINTS.sendFriendReq
// const getUserInfoURL = "https://us-central1-athlos-live.cloudfunctions.net/athlos-server/getUserInfo"
const tokenToID = ENDPOINTS.tokenToID
const acceptFriendURL = ENDPOINTS.acceptFriendReq
const imgAlt = "default"

const USER_PROFILE = "User Profile"
const COMMUNITY = "Community"
const Community = (props) => {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen name={COMMUNITY}>
        {(props) => <CommunityNav {...props} USER_PROFILE={USER_PROFILE}/>}
      </Stack.Screen>
      <Stack.Screen name={USER_PROFILE}>
        {(props) => (
          // THIS SHOULD BE THE PROFILE COMPONENT INSTEAD
          <Text>Nother user :0</Text>
        )}
      </Stack.Screen>
    </Stack.Navigator>
    
  )
}

export default Community
