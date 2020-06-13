import {
  getToken,
} from '../utils/storage';
import {
  NavLink,
} from "react-router-dom";

import React, { Component } from 'react'
import Searchbar from "./Searchbar"
import FriendRequests from "./friends/FriendRequests"
import CommunityHeader from "./header/CommunityHeader"
import Friends from "./friends/Friends"

import SpaContext from '../Context'
import "./style/css/Community.css"
import ENDPOINTS from "../endpoints"
const searchURL = ENDPOINTS.searchUser
const friendReqURL = ENDPOINTS.sendFriendReq
// const getUserInfoURL = "https://us-central1-athlos-live.cloudfunctions.net/athlos-server/getUserInfo"
const tokenToID = ENDPOINTS.tokenToID
const acceptFriendURL = ENDPOINTS.acceptFriendReq
const imgAlt = "default"
class Community extends Component {
  // used to keep track of mounting lifecycle
  // sometimes components in the router get
  // mounted, the unmounted right away, still dont know why
  _isMounted = false

  constructor(props) {
    super(props)
    this.state = {
      display: 'friends',
      searches: [],
      searchText: "",
      showQueries: false,
      emptySearch: false,
      numFriendsDisplay: 25,
    }
    this.renderSearch = this.renderSearch.bind(this)
    this.search = this.search.bind(this)
    this.onSearchTextChange = this.onSearchTextChange.bind(this)
    this.mouseLeave = this.mouseLeave.bind(this)
    this.sendReq = this.sendReq.bind(this)
    this.addFriendToState = this.addFriendToState.bind(this)
    this.removeFriendReq = this.removeFriendReq.bind(this)
    this.acceptRequest = this.acceptRequest.bind(this)
    this.clearSearch = this.clearSearch.bind(this)
    this.setDisplay = this.setDisplay.bind(this)
    this.renderDisplay = this.renderDisplay.bind(this)
  }

  componentWillUnmount() {
    this._isMounted = false
    console.log('community has unmounted')
  }

  componentDidMount() {
    console.log("community has mounted")
    this._isMounted = true
  }

  setDisplay(newDisplay) {
    this.setState({ display: newDisplay })
  }

  removeFriendReq(id) {
    console.log("removing friend with id: ", id)
    var { friendRequests } = this.context
    // remove friend object from requests with id
    var removed = friendRequests.filter((friend) => {
      return friend.senderID !== id
    })
    console.log("removed", removed)
    this.setState({
      friendRequests: removed,
    })
  }

  addFriendToState(id, firstName, lastName) {
    var { friends } = this.context
    var friendObject = { id, firstName, lastName }
    this.setState({
      friends: [...friends, friendObject]
    })
  }

  onSearchTextChange(e) {
    this.setState({
      searchText: e.target.value
    })
  }

  async search(e) {
    e.preventDefault()
    var { searchText } = this.state
    var userToken = getToken()

    var reqBody = {
      searchText,
      userToken,
    }

    if (this.state.searchText) {
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
        alert(json.message)
      }
      var { users } = json
      if (users === undefined || users.length === 0) {
        this.setState({
          emptySearch: true,
        })
      } else {
        console.log(users)
        this.setState({
          searches: users,
          showQueries: true,
          emptySearch: false
        })
      }
    }
  }

  mouseLeave() {
    this.setState({
      searchText: ""
    })
  }

  async decodeToken() {
    // send request to server to decode stored token into the user id
    var userToken = getToken()
    var headers = new Headers()
    headers.append("authorization", `Bearer ${userToken}`)
    var res = await fetch(tokenToID, {method: "GET", headers})
    var json = await res.json()
    var { userID } = json
    return userID
  }

  async sendReq(_id, receiverFirstName, receiverLastName, receiverUsername) {
    // emit event using web socket to server
    var { socket } = this.context
    var { firstName, lastName, username } = this.context

    // get decoded userID
    var userID = await this.decodeToken()
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

  async acceptRequest(senderID, senderFirstName, senderLastName) {
    // SENDER refers to the FRIEND REQUEST SENDER
    var userToken = getToken()
    var { firstName, lastName } = this.context
    // send notification to server
    var { socket } = this.context
    var userID = this.decodeToken()
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

  clearSearch() {
    // set search state data to inital state
    this.setState({
      searchText: "",
      searches: [],
      showQueries: false,
      emptySearch: false,
    })
  }

  renderSearch() {
    var liTags = []
    var { searches, emptySearch } = this.state
    var { friends, friendRequests, friendsPending, rootURL } = this.context

    // put the user ids into a set for easy lookup
    // apparently these constructors don't work on IE 11
    var friendSet = new Set(friends.map(user => user.id))
    var requestSet = new Set(friendRequests.map(user => user.id))
    var pendingSet = new Set(friendsPending.map(user => user.id))

    // if user just searched name not in database
    if (emptySearch) {
      liTags.push(
        <div className="empty-search-container" key="empty-key">
          <span>No search results :( try being more specific</span>
        </div>
      )
    }

    var displayButton = (user, friendSet, requestSet, pendingSet) => {
      // console.log(user, friendSet, requestSet, pendingSet)
      var { firstName, lastName, _id, username} = user
      if (friendSet.has(_id)) {
        return (
          <React.Fragment>
            <i className="fas fa-check ml-1 mr-1"></i>
            <span className='mr-1'>Friends</span>
          </React.Fragment>
        )
      } else if (requestSet.has(_id)) {
        return (
          <div
            className='rel-wrapper'              
            onClick={() => {
              this.acceptRequest(_id, firstName, lastName)
              this.removeFriendReq(_id)
              this.addFriendToState(_id, firstName, lastName)
            }}
          >
            <i className="fas fa-user-plu req-sent ml-1 mr-1"></i>
            <span className='accept-req-btn'>
              accept
            </span>
          </div>
        )
      } else if (pendingSet.has(_id)) {
        return (
          <React.Fragment>
            <i className="fas fa-user-plu req-sent ml-1 mr-1"></i>
            <span className=''>Request Sent</span>
          </React.Fragment>
        )
      } else {
        return (
            <div
              className='rel-wrapper'
              onClick={() => {this.sendReq(_id, firstName, lastName, username)}}
            >
              <i className="fas fa-user-plu req-sent ml-1 mr-1"></i>
              <span className='add-friend-btn ml-1'>Add</span> 
            </div>
        )
      }
    }

    searches.forEach((user, i) => {
      var { firstName, lastName, _id, username, profilePicture } = user
      // capitalize first and last name before displaying
      firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1)
      lastName  = lastName.charAt(0).toUpperCase() + lastName.slice(1)
      liTags.push(
        <div key={_id + "_search"} className="user-container">
          <img
            src={profilePicture.profileURL}
            alt={imgAlt}
          ></img>
          <NavLink
            to={{pathname: `${rootURL}/profile/${username}`}}
            className='search-name ml-3'
          >
            {firstName}, {lastName}
          </NavLink>
          <div className='search-relationship'>
            {displayButton(user, friendSet, requestSet, pendingSet)}
          </div>
        </div>
      )
    })

    liTags.push(
      <div className="clear-search-container mt-3" key="clear-search-container">
        <span onClick={this.clearSearch}>Clear Search</span>
      </div>
    )
    return liTags
  }

  renderDisplay() {
    var { display } = this.state
    var { context } = this
    display = display.toLowerCase()
    if (display === 'friends') {
      return <Friends />
    } else if (display === 'requests') {
      return (
        <FriendRequests
          userToken={getToken()}
          userFirstName={context.userFirstName}
          userLastName={context.userLastName}
          addFriendToState={this.addFriendToState}
          removeFriendReq={this.removeFriendReq}
          friendRequests={context.friendRequests}
          friendsPending={context.friendsPending}
          friends={context.friends}
          numRequests={context.numRequests}
          acceptRequest={this.acceptRequest}
        />
      )     
    } else if (display === 'search') {
      return (
        <div className='search-wrapper'>
          <h4>Search for users</h4>
          <Searchbar
            search={this.search}
            onSearchTextChange={this.onSearchTextChange}
            mouseLeave={this.mouseLeave}
            searchText={this.state.searchText}
          />
          <div className={"queries" + (this.state.showQueries ? " expand" : " collapsed")}>
            {this.renderSearch()}
          </div>
        </div>
      )
    } else {
      console.log('display is not friends, requests, or search')
      return null
    }
  }

  render() {
    return (
      //<Header />
      <div className="community-container">
        <CommunityHeader 
          setDisplay={this.setDisplay}
        />
        {this.renderDisplay()}
      </div>
    )
  }
}

Community.contextType = SpaContext

export default Community
