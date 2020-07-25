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

import { UserDataContext, ProfileContext } from '../../Context'
import ENDPOINTS from "../endpoints"
import CommunityList from './screens/CommunityList';
import Follower from './screens/listItems/Follower'
import Following from './screens/listItems/Following'
import Rival from './screens/listItems/Rival'
import COMMUNITY_CONSTANTS from './CommunityConstants'
import GLOBAL_CONSTANTS from '../GlobalConstants'
import PROFILE_CONSTANTS from '../profile/ProfileConstants'
const { FOLLOWERS, FOLLOWING, RIVALS, PENDING, DISCOVER, NO_SEARCH_RESULTS } = COMMUNITY_CONSTANTS

const searchURL = ENDPOINTS.searchUser
const friendReqURL = ENDPOINTS.sendFriendReq
// const getUserInfoURL = "https://us-central1-athlos-live.cloudfunctions.net/athlos-server/getUserInfo"
const tokenToID = ENDPOINTS.tokenToID
const acceptFriendURL = ENDPOINTS.acceptFriendReq
const imgAlt = "default"

const Community = (props) => {
  const { navigation } = props;
  const userDataContext = React.useContext(UserDataContext);
  const profileContext  = React.useContext(ProfileContext);
  const [searches, setSearches] = React.useState([]);
  const {
    followerRequests,
    followers,
    followingPending,
    following,
    rivalRequests,
    rivalsPending,
    rivals,
    relationshipStatus,
    settings
  } = profileContext;

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
    const screen = user._id === userDataContext ? PROFILE_CONSTANTS.USER_PROFILE : PROFILE_CONSTANTS.SEARCH_PROFILE
    console.log("redirect to this user: ", user)
    navigation.navigate(
      GLOBAL_CONSTANTS.PROFILE,
      { _id: user._id, screen: screen},
    );
    // have to do this cuz for some reason it doesn't actually navigate to the root screen
    navigation.popToTop();
    // props.rootNav.push(
    //   GLOBAL_CONSTANTS.PROFILE,
    //   { _id: user._id, screen: screen },
    // );
  }

  const createFollowerSectionList = () => {
    const followerSections = []
    followerSections.push({ title: FOLLOWERS, data: followers })
    if (relationshipStatus === PROFILE_CONSTANTS.IS_SELF) {
      followerSections.push({ title: 'Follower Requests', data: followerRequests })
    }
    return followerSections
  }

  const createFollowingSectionList = () => {
    const followingSections = []
    followingSections.push({ title: FOLLOWING, data: following })
    if (relationshipStatus === PROFILE_CONSTANTS.IS_SELF) {
      followingSections.push({ title: 'Pending Requests', data: followingPending })
    }
    return followingSections
  }

  const createRivalSectionList = () => {
    const rivalSections = []
    rivalSections.push({ title: RIVALS, data: rivals })
    if (relationshipStatus === PROFILE_CONSTANTS.IS_SELF) {
      rivalSections.push({ title: 'Rival Requests', data: rivalRequests })
      rivalSections.push({ title: 'Rivals Pending', data: rivalsPending })
    }
    return rivalSections
  }

  const TopTab = createMaterialTopTabNavigator();
  return (
    <TopTab.Navigator
      tabBarOptions={{
        labelStyle: { fontSize: 11 },
        style: { backgroundColor: 'powderblue' },
      }}
    >
      { relationshipStatus === PROFILE_CONSTANTS.IS_SELF ?
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
        </TopTab.Screen> : null
      }
      {/* INSTEAD OF TWO LISTS, MERGE THEM INTO ONE ARRAY FOR SECTIONLIST */}
      <TopTab.Screen
        name={FOLLOWING}
      >
        {(props) => (
          <CommunityList
            {...props}
            listItem={Following}
            sectionList={createFollowingSectionList()}
            onItemPress={toUserProfile}
            showActionButton={relationshipStatus === PROFILE_CONSTANTS.IS_SELF}
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
            sectionList={createFollowerSectionList()}
            onItemPress={toUserProfile}
            showActionButton={relationshipStatus === PROFILE_CONSTANTS.IS_SELF}
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
            sectionList={createRivalSectionList()}
            onItemPress={toUserProfile}
            showActionButton={relationshipStatus === PROFILE_CONSTANTS.IS_SELF}
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
export default gestureHandlerRootHOC(Community)
