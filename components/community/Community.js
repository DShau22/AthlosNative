import {
  getData,
} from '../utils/storage';

import React from 'react'
// import FriendRequests from "./friends/FriendRequests"
// import Friends from "./friends/Friends"
import { View, Alert, StyleSheet, SectionList, Dimensions, PixelRatio } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import Discover from './screens/Discover'

import { UserDataContext } from '../../Context'
import ENDPOINTS from "../endpoints"
import CommunityList from './screens/CommunityList';
const searchURL = ENDPOINTS.searchUser
const friendReqURL = ENDPOINTS.sendFriendReq
// const getUserInfoURL = "https://us-central1-athlos-live.cloudfunctions.net/athlos-server/getUserInfo"
const tokenToID = ENDPOINTS.tokenToID
const acceptFriendURL = ENDPOINTS.acceptFriendReq
const imgAlt = "default"
const Community = (props) => {
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

  // const renderSearch = () => {
  //   var liTags = []
  //   var { searches, emptySearch } = state
  //   var { friends, friendRequests, friendsPending, rootURL } = context

  //   // put the user ids into a set for easy lookup
  //   // apparently these constructors don't work on IE 11
  //   var friendSet = new Set(friends.map(user => user.id))
  //   var requestSet = new Set(friendRequests.map(user => user.id))
  //   var pendingSet = new Set(friendsPending.map(user => user.id))

  //   // if user just searched name not in database
  //   if (emptySearch) {
  //     liTags.push(
  //       <div className="empty-search-container" key="empty-key">
  //         <span>No search results :( try being more specific</span>
  //       </div>
  //     )
  //   }

  //   var displayButton = (user, friendSet, requestSet, pendingSet) => {
  //     // console.log(user, friendSet, requestSet, pendingSet)
  //     var { firstName, lastName, _id, username} = user
  //     if (friendSet.has(_id)) {
  //       return (
  //         <React.Fragment>
  //           <i className="fas fa-check ml-1 mr-1"></i>
  //           <span className='mr-1'>Friends</span>
  //         </React.Fragment>
  //       )
  //     } else if (requestSet.has(_id)) {
  //       return (
  //         <div
  //           className='rel-wrapper'              
  //           onClick={() => {
  //             acceptRequest(_id, firstName, lastName)
  //             removeFriendReq(_id)
  //             addFriendToState(_id, firstName, lastName)
  //           }}
  //         >
  //           <i className="fas fa-user-plu req-sent ml-1 mr-1"></i>
  //           <span className='accept-req-btn'>
  //             accept
  //           </span>
  //         </div>
  //       )
  //     } else if (pendingSet.has(_id)) {
  //       return (
  //         <React.Fragment>
  //           <i className="fas fa-user-plu req-sent ml-1 mr-1"></i>
  //           <span className=''>Request Sent</span>
  //         </React.Fragment>
  //       )
  //     } else {
  //       return (
  //           <div
  //             className='rel-wrapper'
  //             onClick={() => {sendReq(_id, firstName, lastName, username)}}
  //           >
  //             <i className="fas fa-user-plu req-sent ml-1 mr-1"></i>
  //             <span className='add-friend-btn ml-1'>Add</span> 
  //           </div>
  //       )
  //     }
  //   }

  //   searches.forEach((user, i) => {
  //     var { firstName, lastName, _id, username, profilePicture } = user
  //     // capitalize first and last name before displaying
  //     firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1)
  //     lastName  = lastName.charAt(0).toUpperCase() + lastName.slice(1)
  //     liTags.push(
  //       <div key={_id + "_search"} className="user-container">
  //         <img
  //           src={profilePicture.profileURL}
  //           alt={imgAlt}
  //         ></img>
  //         <NavLink
  //           to={{pathname: `${rootURL}/profile/${username}`}}
  //           className='search-name ml-3'
  //         >
  //           {firstName}, {lastName}
  //         </NavLink>
  //         <div className='search-relationship'>
  //           {displayButton(user, friendSet, requestSet, pendingSet)}
  //         </div>
  //       </div>
  //     )
  //   })

  //   liTags.push(
  //     <div className="clear-search-container mt-3" key="clear-search-container">
  //       <span onClick={clearSearch}>Clear Search</span>
  //     </div>
  //   )
  //   return liTags
  // }

  // const renderDisplay = () => {
  //   var { display } = state
  //   var { context } = this
  //   display = display.toLowerCase()
  //   if (display === 'friends') {
  //     return <Friends />
  //   } else if (display === 'requests') {
  //     return (
  //       <FriendRequests
  //         userToken={getToken()}
  //         userFirstName={context.userFirstName}
  //         userLastName={context.userLastName}
  //         addFriendToState={addFriendToState}
  //         removeFriendReq={removeFriendReq}
  //         friendRequests={context.friendRequests}
  //         friendsPending={context.friendsPending}
  //         friends={context.friends}
  //         numRequests={context.numRequests}
  //         acceptRequest={acceptRequest}
  //       />
  //     )     
  //   } else if (display === 'search') {
  //     return (
  //       <div className='search-wrapper'>
  //         <h4>Search for users</h4>
  //         <Searchbar
  //           search={search}
  //           onSearchTextChange={onSearchTextChange}
  //           mouseLeave={mouseLeave}
  //           searchText={state.searchText}
  //         />
  //         <div className={"queries" + (state.showQueries ? " expand" : " collapsed")}>
  //           {renderSearch()}
  //         </div>
  //       </div>
  //     )
  //   } else {
  //     console.log('display is not friends, requests, or search')
  //     return null
  //   }
  // }

  const TopTab = createMaterialTopTabNavigator();
  const { friends, friendRequests, friendsPending } = context;
  return (
    <TopTab.Navigator
      tabBarOptions={{
        labelStyle: { fontSize: 11 },
        style: { backgroundColor: 'powderblue' },
      }}
    >
      <TopTab.Screen
        name="Discover"
      >
        {(props) => (
          <Discover
            {...props}
            search={search}
            users={searches}
          />
        )}
      </TopTab.Screen>
      <TopTab.Screen
        name="Following"
      >
        {(props) => (
          <CommunityList
            {...props}
            peopleTitle="Following"
            peopleSubtitle="you're following"
            pendingTitle="Requests"
            pendingSubtitle="you've sent a request"
            pendingList={friendsPending}
            itemList={friends}
            onItemPress={() => {}}
          />
        )}
      </TopTab.Screen>
      <TopTab.Screen
        name="Followers"
      >
        {(props) => (
          <CommunityList
            {...props}
            peopleTitle="Followers"
            peopleSubtitle="is following you"
            pendingTitle="Requests"
            pendingSubtitle="wants to follow you!"
            pendingList={friendRequests}
            itemList={friends}
            onItemPress={() => {}}
          />
        )}
      </TopTab.Screen>
      <TopTab.Screen
        name="Rivals"
        style={styles.tabHeaders}
      >
        {(props) => (
          <CommunityList 
            {...props}
            peopleTitle="Rivals"
            peopleSubtitle="thinks they're better than you >:("
            pendingTitle="Pending"
            pendingSubtitle="wants to challenge you!"
            pendingList={friendsPending}
            itemList={friends}
            onItemPress={() => {}}
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
export default Community
