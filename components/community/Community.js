import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import React from 'react'
import axios from 'axios';
import { View, Alert, StyleSheet, Text, Dimensions, PixelRatio } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationActions } from 'react-navigation';
import { CommonActions } from '@react-navigation/native';

import {
  getData,
} from '../utils/storage';
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
import { useTheme } from '@react-navigation/native';
const { FOLLOWERS, FOLLOWING, RIVALS, PENDING, DISCOVER, NO_SEARCH_RESULTS } = COMMUNITY_CONSTANTS

const searchURL = ENDPOINTS.searchUser
const friendReqURL = ENDPOINTS.sendFriendReq
// const getUserInfoURL = "https://us-central1-athlos-live.cloudfunctions.net/athlos-server/getUserInfo"
const tokenToID = ENDPOINTS.tokenToID
const acceptFriendURL = ENDPOINTS.acceptFriendReq
const imgAlt = "default"

const Community = (props) => {
  const { colors } = useTheme();
  const { navigation } = props;
  console.log(props.route.state)
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
    // console.log("Community Nav has mounted");
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
          setSearches(NO_SEARCH_RESULTS)
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
    const { _id } = user;
    console.log('nav to: ', user)
    const screen = _id === userDataContext._id ? PROFILE_CONSTANTS.USER_PROFILE : PROFILE_CONSTANTS.SEARCH_PROFILE
    // ok this is super hacky. Try to find a better solution later
    // issue is that when in community, if you click ANY of the tabs after going into commmunity,
    // it'll navigate to the Community of the other person EVEN with popToTop. This is cuz 
    // the props.route.state is undefined until you click on a tab in the community topTab, so
    // we force the props.route.state field to be undefined again...
    props.route.state = undefined
    profileContext.setId(_id)
    navigation.popToTop()
  }

  const createFollowerSectionList = () => {
    const followerSections = []
    if (relationshipStatus === PROFILE_CONSTANTS.IS_SELF) {
      followerSections.push({ title: 'Follower Requests', data: followerRequests })
    }
    followerSections.push({ title: FOLLOWERS, data: followers })
    return followerSections
  }

  const createFollowingSectionList = () => {
    const followingSections = []
    if (relationshipStatus === PROFILE_CONSTANTS.IS_SELF) {
      followingSections.push({ title: 'Pending Requests', data: followingPending })
    }
    followingSections.push({ title: FOLLOWING, data: following })
    return followingSections
  }

  const createRivalSectionList = () => {
    const rivalSections = []
    if (relationshipStatus === PROFILE_CONSTANTS.IS_SELF) {
      rivalSections.push({ title: 'Rival Requests', data: rivalRequests })
      rivalSections.push({ title: 'Rivals Pending', data: rivalsPending })
    }
    rivalSections.push({ title: RIVALS, data: rivals })
    return rivalSections
  }

  const TopTab = createMaterialTopTabNavigator();
  return (
    <TopTab.Navigator
      tabBarOptions={{
        labelStyle: { fontSize: 12, color: colors.textColor },
        style: { backgroundColor: colors.header, paddingTop: 8, paddingBottom: 8 },
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
