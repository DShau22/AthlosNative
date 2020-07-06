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
import Follower from './screens/listItems/Follower'
import Following from './screens/listItems/Following'
import Rival from './screens/listItems/Rival'
import COMMUNITY_CONSTANTS from './CommunityConstants'
const { FOLLOWERS, FOLLOWING, RIVALS, PENDING, DISCOVER } = COMMUNITY_CONSTANTS
const searchURL = ENDPOINTS.searchUser
const friendReqURL = ENDPOINTS.sendFriendReq
// const getUserInfoURL = "https://us-central1-athlos-live.cloudfunctions.net/athlos-server/getUserInfo"
const tokenToID = ENDPOINTS.tokenToID
const acceptFriendURL = ENDPOINTS.acceptFriendReq
const imgAlt = "default"

const CommunityNav = (props) => {
  const { navigation } = props;
  const [stateFriends, setStateFriends] = React.useState([]);
  const [display, setDisplay] = React.useState('friends');
  const [searches, setSearches] = React.useState([]);
  const [searchText, setSearchText] = React.useState('');
  const [showQueries, setShowQueries] = React.useState(false);
  const [emptySearch, setEmptySearch] = React.useState(false);
  const [numFriendsDisplay, setNumFriendsDisplay] = React.useState(25);

  const context = React.useContext(UserDataContext);

  const removeFriendReq = (id) => {
    console.log("removing friend with id: ", id)
    var { friendRequests } = context
    // remove friend object from requests with id
    var removed = friendRequests.filter((friend) => {
      return friend.senderID !== id
    })
    console.log("removed", removed)
    setState({
      friendRequests: removed,
    })
  }

  const addFriendToState = (id, firstName, lastName) => {
    var { friends } = context
    var friendObject = { id, firstName, lastName }
    setFriends([...friends, friendObject])
  }

  const search = (searchText, setIsLoading) => {
    const asyncSearch = async () => {
      if (!searchText) return;
      // first clear the current searches
      setSearches([]);
      setIsLoading(true);
      var userToken = await getData();
      var reqBody = {
        searchText,
        userToken,
      }
      try {
        var res = await fetch(searchURL, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reqBody),
        })
        var json = await res.json()
        if (!json.success) {
          // DISPLAY SOME SORT OF ERROR
          console.log("json.success is false: ", json)
          Alert.alert(`Oh No :(`, "Something went wrong with the server. Please try again.", [{ text: "Okay" }]);
          setIsLoading(false);
        }
        var { users } = json
        if (users === undefined || users.length === 0) {
          setEmptySearch(true);
        } else {
          setSearches(users);
          setShowQueries(true);
          setEmptySearch(false);
        }
        setIsLoading(false);
      } catch(e) {
        Alert.alert(`Oh No :(`, "Something went wrong with the connection to the server. Please try again.", [{ text: "Okay" }]);
        setIsLoading(false);
      }
    }
    asyncSearch();
  }

  const decodeToken = async () => {
    // send request to server to decode stored token into the user id
    var userToken = await getData();
    var headers = new Headers()
    headers.append("authorization", `Bearer ${userToken}`)
    var res = await fetch(tokenToID, {method: "GET", headers})
    var json = await res.json()
    var { userID } = json
    return userID
  }

  const sendReq = async (_id, receiverFirstName, receiverLastName, receiverUsername) => {
    // emit event using web socket to server
    var { socket } = context
    var { firstName, lastName, username } = context

    // get decoded userID
    var userID = await decodeToken()
    var userToken = getToken()
    console.log("sending request", userID)
    socket.emit("sendFriendRequest", {
      senderID: userID,
      senderFirstName: firstName,
      senderLastName: lastName,
      senderUsername: username,
      receiverID: _id,
    })

    var body = JSON.stringify({
      token: userToken,
      senderFirstName: firstName,
      senderLastName: lastName,
      senderUsername: username,
      receiverID: _id,
      receiverFirstName,
      receiverLastName,
      receiverUsername,
    })

    fetch(friendReqURL, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body,
    })
      .then(res => res.json())
      .then((json) => {
        console.log(JSON.stringify(json))
      })
    .catch((err) => {throw err})
  }

  const acceptRequest = async (senderID, senderFirstName, senderLastName) => {
    // SENDER refers to the FRIEND REQUEST SENDER
    var userToken = getToken()
    var { firstName, lastName } = context
    // send notification to server
    var { socket } = context
    var userID = decodeToken()
    socket.emit("acceptFriendRequest", { userID, receiverFirstName: firstName, receiverLastName: lastName, otherFriendID: senderID })

    var reqBody = {
      userToken,
      receiverFirstName: firstName,
      receiverLastName: lastName,
      senderID,
      senderFirstName,
      senderLastName,
    }

    var res = await fetch(acceptFriendURL, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reqBody)
    })
    var json = await res.json()
    console.log("json message: ", json.message)
  }

  const clearSearch = () => {
    // set search state data to inital state
    setSearchText('');
    setSearches([]);
    setShowQueries(false);
    setEmptySearch(false);
  }

  const toUserProfile = (user) => {
    console.log("redirect to this user: ", user)
    navigation.navigate(COMMUNITY_CONSTANTS.SEARCH_PROFILE, { _id: user._id });
  }

  const TopTab = createMaterialTopTabNavigator();
  // const { friends, friendRequests, friendsPending } = context;
  const {
    rivals, rivalsPending, rivalRequests,
    following, followingPending, 
    followers, followerRequests
  } = context;
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
export default CommunityNav
