import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import {
  getData,
} from '../utils/storage';

import React from 'react'
import axios from 'axios';
import { View, Alert, StyleSheet, Text, Dimensions, PixelRatio } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import Discover from './screens/Discover'

import { UserDataContext } from '../../Context'
import ENDPOINTS from "../endpoints"
import CommunityList from './screens/CommunityList';
import Follower from './screens/listItems/Follower'
import Following from './screens/listItems/Following'
import Rival from './screens/listItems/Rival'
import COMMUNITY_CONSTANTS from './CommunityConstants'
const { FOLLOWERS, FOLLOWING, RIVALS, PENDING, DISCOVER, NO_SEARCH_RESULTS } = COMMUNITY_CONSTANTS
const searchURL = ENDPOINTS.searchUser
const friendReqURL = ENDPOINTS.sendFriendReq
// const getUserInfoURL = "https://us-central1-athlos-live.cloudfunctions.net/athlos-server/getUserInfo"
const tokenToID = ENDPOINTS.tokenToID
const acceptFriendURL = ENDPOINTS.acceptFriendReq
const imgAlt = "default"

const CommunityNav = (props) => {
  const { navigation } = props;
  const context = React.useContext(UserDataContext);

  const [searches, setSearches] = React.useState([]);

  const [communityState, setCommunityState] = React.useState({
    followerRequests: context.followerRequests,
    followers: context.followers,
    followingPending: context.followingPending,
    following: context.following,
    rivalRequests: context.rivalRequests,
    rivalsPending: context.rivalsPending,
    rivals: context.rivals,
  })

  const [numFriendsDisplay, setNumFriendsDisplay] = React.useState(25);

  // cancel token for cancelling Axios requests on unmount
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  React.useEffect(() => {
    console.log("Community Nav has mounted");
    return () => {
      console.log("cleanup community nav")
      source.cancel('Operation has been canceled')
    };
  }, [])

  const search = (searchText, setIsLoading) => {
    const asyncSearch = async () => {
      if (!searchText) return;
      // first clear the current searches
      setSearches([]);
      setIsLoading(true);
      var userToken = await getData();
      try {
        const reqBody = {
          searchText,
          userToken,
        }
        const config = {
          headers: { 'Content-Type': 'application/json' },
          cancelToken: source.token
        }
        var res = await axios.post(searchURL, reqBody, config);
        var json = res.data
        if (!json.success) {
          // DISPLAY SOME SORT OF ERROR
          console.log("json.success is false: ", json)
          Alert.alert(`Oh No :(`, "Something went wrong with the server. Please try again.", [{ text: "Okay" }]);
          setIsLoading(false);
        }
        var { users } = json
        if (users === undefined || users.length === 0) {
          // set searches to a sad message of not being able to find anything :(
          setSearches([NO_SEARCH_RESULTS])
        } else {
          setSearches(users);
        }
        setIsLoading(false);
      } catch(e) {
        Alert.alert(`Oh No :(`, "Something went wrong with the connection to the server. Please try again.", [{ text: "Okay" }]);
        setIsLoading(false);
      }
    }
    asyncSearch();
  }

  const toUserProfile = (user) => {
    console.log("redirect to this user: ", user)
    navigation.navigate(COMMUNITY_CONSTANTS.SEARCH_PROFILE, { _id: user._id });
  }

  const TopTab = createMaterialTopTabNavigator();
  const {
    followingPending,
    following,
    followerRequests,
    followers,
    rivalRequests,
    rivalsPending,
    rivals,
  } = context
  return (
    <TopTab.Navigator
      tabBarOptions={{
        labelStyle: { fontSize: 11 },
        style: { backgroundColor: 'powderblue' },
      }}
    >
      <TopTab.Screen
        name={DISCOVER}
      >
        {(props) => (
          <Discover
            {...props}
            search={search}
            users={searches}
            onItemPress={toUserProfile}
          />
        )}
      </TopTab.Screen>
      <TopTab.Screen
        name={FOLLOWING}
      >
        {/* INSTEAD OF TWO LISTS, MERGE THEM INTO ONE ARRAY FOR SECTIONLIST */}
        {(props) => (
          <CommunityList
            {...props}
            listItem={Following}
            peopleTitle={FOLLOWING}
            peopleSubtitle="you're following"
            pendingTitle="Pending"
            pendingSubtitle="you've sent a request"
            pendingList={followingPending}
            itemList={following}
            onItemPress={toUserProfile}
          />
        )}
      </TopTab.Screen>
      <TopTab.Screen
        name={FOLLOWERS}
      >
        {(props) => (
          <CommunityList
            {...props}
            listItem={Follower}
            peopleTitle={FOLLOWERS}
            peopleSubtitle="is following you"
            pendingTitle="Requests"
            pendingSubtitle="wants to follow you!"
            pendingList={followerRequests}
            itemList={followers}
            onItemPress={toUserProfile}
          />
        )}
      </TopTab.Screen>
      <TopTab.Screen
        name={RIVALS}
        style={styles.tabHeaders}
      >
        {(props) => (
          <CommunityList 
            {...props}
            listItem={Rival}
            peopleTitle={RIVALS}
            peopleSubtitle="thinks they're better than you >:("
            pendingTitle="Pending"
            pendingSubtitle="wants to challenge you!"
            pendingList={rivalsPending}
            // add another for rival requests
            itemList={rivals}
            onItemPress={toUserProfile}
          />
        )}
      </TopTab.Screen>
    </TopTab.Navigator>
  )
}
const styles = StyleSheet.create({
  tabHeaders: {
    fontSize: 10,
    backgroundColor: 'black'
  }
})
export default gestureHandlerRootHOC(CommunityNav)
