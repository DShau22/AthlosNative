import React, { Component } from "react";
import SpaContext from "../Context"
import Community from "../community/Community"
import Fitness from "../fitness/Fitness"
import RunDetails from "../fitness/run/RunDetails"
import SwimDetails from "../fitness/swim/SwimDetails"
import JumpDetails from "../fitness/jump/JumpDetails"
import Profile from "../profile/Profile"
// import EditProfile from "../profile/EditProfile"
import Settings from "../settings/Settings"
import Stats from "../settings/Stats"
import Navbar from "../generic/Navbar"
import Home from "./Home";
import SideMenu from "../generic/SideMenu"
import FriendDisplay from "../community/friends/FriendDisplay"
// Be sure to include styles at some point, probably during your bootstraping
import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import './header.css'

import "../transitions.css"
import Media from 'react-media';

// web sockets
import io from "socket.io-client"

import {
  getBests,
  getProfile,
  getUsername
} from "../utils/userInfo"

import {
  Route,
  withRouter,
  Switch
} from "react-router-dom";

import {
  getToken,
  removeFromLocalStorage,
  removeFromSessionStorage,
  storageKey,
} from '../utils/storage';
import EditProfileFunc from "../profile/EditProfileFunc";
import ENDPOINTS from "../endpoints"
// server url
const getUserInfoURL = ENDPOINTS.getUserInfo
const defaultProfile = "./profile/default_profile.png"
const root = "/app"

const imgAlt = "../profile/default_profile.png"

const sidebarMediaQuery = '600px'
const dataURL = ENDPOINTS.getData
class Header extends Component {
  constructor(props) {
    super(props)
    this.state = {
      friends: [],
      friendRequests: [],
      friendsPending: [],
      firstName: "",
      lastName: "",
      username: "",
      gender: "",
      bio: "",
      height: "",
      weight: "",
      age: "",
      profilePicture: "",
      settings: {},
      isLoading: false,
      logout: false,
      // socket: null,
      notification: null,
      mounted: false,
      rootURL: this.props.match.url,
      friendTableRows: [],
      numFriendsDisplay: 25,
      jumpJson: {
        activityData: [],
        action: "jump",
        imageUrl: "https://img.icons8.com/ios/50/000000/trampoline-park-filled.png"
      },
      runJson: {
        activityData: [],
        action: "run",
        imageUrl: "https://img.icons8.com/nolan/64/000000/running.png",
      },
      swimJson: {
        activityData: [],
        action: "swim",
        imageUrl: "https://img.icons8.com/nolan/64/000000/swimming.png"
      },
    }
    this.logout = this.logout.bind(this);
    // this.setUpSocket = this.setUpSocket.bind(this)
    this.getActivityJson = this.getActivityJson.bind(this)
    this.addFriendRows = this.addFriendRows.bind(this)
    this.renderHeader = this.renderHeader.bind(this)
    this.updateUserInfo = this.updateUserInfo.bind(this)
  }

  // setUpSocket() {
  //   var prom = new Promise(async (resolve, reject) => {
  //     // send request to get decoded user ID
  //     var userToken = getToken()
  //     var headers = new Headers()
  //     headers.append("authorization", `Bearer ${userToken}`)
  //     var response = await fetch(ENDPOINTS.tokenToID, { method: "GET", headers })
  //     var json = await response.json()
  //     var { userID } = json

  //     // establish socket connection and send socket ID, userID
  //     var data = { userID }
  //     var connectionOptions = {
  //       'sync disconnect on unload':false
  //     }
  //     var socket = io.connect(serverURL, connectionOptions)

  //     // send userID after socket connects
  //     socket.on("connect", () => {
  //       socket.emit("sendUserID", data)
  //       // put socket is session storage
  //     })

  //     socket.on('receiveFriendRequest', (data) => {
  //       alert("got friend request!")
  //       console.log(data)
  //       this.setState({
  //         notification: "!"
  //       })
  //     })

  //     socket.on("newFriend", (data) => {
  //       alert("got new friend")
  //       console.log(data)
  //       this.setState({
  //         notification: "***"
  //       })
  //     })

  //     socket.on("logoutClient", (data) => {
  //       // data should contain the socketID that did the logging out
  //       // socket should have also been disconnected by the server
  //       var { logoutSocketID } = data
  //       console.log(logoutSocketID)
  //       if (socket.id !== logoutSocketID) {
  //         alert("You have been logged out from another tab or browser")
  //       }
  //       // remove user token
  //       removeFromLocalStorage(storageKey)
  //       removeFromSessionStorage(storageKey)
  //       // remove socket id from session storage
  //       this.setState({
  //         isLoading: true,
  //         logout: true,
  //       });
  //       this.props.history.push("/")
  //     })
  //     resolve(socket)
  //   })
  //   return prom
  // }

  async getActivityJson(activity) {
    // CHANGE TO GET THE FIRST 10-50 ENTRIES MAYBE
    var headers = new Headers()
    var token = getToken()
    headers.append("authorization", `Bearer ${token}`)
    headers.append("activity", activity)

    var res = await fetch(dataURL, {
      method: "GET",
      headers: headers,
    })
    var trackedFitness = await res.json()
    return trackedFitness
  }

  /**
   * for each friend in the friend array, return
   * a table row to show in the friends table
   */  
  async addFriendRows(friends, numFriendsDisplay) {
    var tableRows = []

    // DONT FORGET TO SORT FRIENDS
    for (let i = 0; i < friends.length; i++) {
      if (i === numFriendsDisplay - 1) { break }
      let { id, firstName, lastName } = friends[i]
      let [bests, profileUrl, username] = await Promise.all([getBests(id), getProfile(id), getUsername(id)])
      tableRows.push(
        <FriendDisplay 
          key={id}
          isFriend={true}
          isFriendRequest={false}
          rank={i + 1}
          onClick={() => {this.props.history.push(`/app/profile/${username}`)}}
          profileUrl={profileUrl}
          defaultProfile={defaultProfile}
          imgAlt={imgAlt}
          firstName={firstName}
          lastName={lastName}
          bests={bests}
        />
      )
    }
    return tableRows
  }

  async componentDidMount() {
    this._isMounted = true
    // if there is no token then user hasn't logged in...
    // log them out and redirect them back to login page,
    // and don't run the rest of this method cuz it involves setting
    // up stuff as if the user had logged in
    var userToken = getToken()
    if (!userToken) {
      this.setState({
        logout: true
      })
      this.props.history.push("/")
      return
    }

    // set up the web socket connection to server
    // var socket = await this.setUpSocket()

    // get the user's information here from database
    // make request to server to user information and set state
    var headers = new Headers()
    headers.append("authorization", `Bearer ${userToken}`)
    try {
      var res = await fetch(getUserInfoURL, { method: "GET", headers })
      var userJson = await res.json()
    } catch(e) {
      console.error(e)
    }
    console.log(userJson)

    var { numFriendsDisplay } = this.state
    try {
      var friendTableRows = await this.addFriendRows(userJson.friends, numFriendsDisplay)
    } catch(e) {
      console.error(e)
    }

    // get user's fitness data for jumps, runs, swims
    // MAKE AWAIT PROMISES.ALL LATER
    try {
      var jumpsTracked = await this.getActivityJson("jump")
      var swimsTracked = await this.getActivityJson("swim")
      var runsTracked = await this.getActivityJson("run")
    } catch(e) {
      console.error(e)
    }
    var gotAllInfo = userJson.success && jumpsTracked.success && swimsTracked.success && runsTracked.success
    if (gotAllInfo && this._isMounted) {
      // one bug that could come up is if another setState occurred outside this function before
      // the fetch response finished running. This delayed setState would then
      // run after the other setState which could cause some mixups in which state is correct
      // Shouldn't be a problem thoughsince the socket field is only updated here and users can't see it.
      this.setState(prevState => ({
        ...userJson,
        // socket,
        mounted: true,
        friendTableRows,
        jumpJson: {
          ...prevState.jumpJson,
          activityData: jumpsTracked.activityData 
        },
        runJson: {
          ...prevState.runJson,
          activityData: runsTracked.activityData 
        },
        swimJson: {
          ...prevState.swimJson,
          activityData: swimsTracked.activityData 
        }
      }))
    } else {
      alert("not success")
    }
  }

  componentWillUnmount() {
    this._isMounted = false
    console.log("unmounting header...")
  }

  logout() {
    console.log("logging out...")
    // var { socket } = this.state
    // console.log(socket)
    removeFromLocalStorage(storageKey)
    removeFromSessionStorage(storageKey)
    // remove socket id from session storage
    this.setState({
      isLoading: true,
      logout: true,
    });
    this.props.history.push("/")
    // emit logout event to server
    // var userToken = getToken()
    // var data = { userToken }
    // socket.emit("logoutServer", data)
  }

  renderHeader() {
    const { match } = this.props
    // if there is a token in session or local storage...
    if (getToken()) {
      return (
        <div className="header w-100">
          <div className="d-flex align-items-center w-100 h-100">
            <span className='header-title position-absolute w-100'>
              Athlos Tracker
            </span>
            {/* dont display the sidebar opener (the thing with three lines) unless it's a phone */}
            <Media query={`(max-width: ${sidebarMediaQuery})`} render={() => 
              (
                <div className="navbar-container ml-3 mt-auto mb-auto">
                  <Navbar
                    homeURL="/app"
                    communityURL={`${match.url}/community`}
                    fitnessURL={`${match.url}/fitness`}
                    profileURL={`${match.url}/profile/${this.state.username}`}
                    settingsURL={`${match.url}/settings`}
                    logout={this.logout}
                  />
                </div>
              )}
            />
          </div>
        </div>
      )
    } else {
      // no token, redirect to login
      alert('no token in the storage...')
      this.props.history.push("/")
    }
  }

  renderSideMenu() {
    const { match } = this.props
    return (
      <Media query={`(min-width: ${sidebarMediaQuery})`} render={() => 
        (
          <div className='col-md-3 sideMenu-container'>
            <div className='card text-center'>
              <div className="sideMenu-container">
                <SideMenu
                  homeURL="/app"
                  communityURL={`${match.url}/community`}
                  fitnessURL={`${match.url}/fitness`}
                  profileURL={`${match.url}/profile/${this.state.username}`}
                  settingsURL={`${match.url}/settings`}
                  logout={this.logout}
                />
              </div>
            </div>
          </div>
        )}
      />
    )
  }

  // updates the state and therefore the context if the user info is suspected
  // to change. For example if the user changes their settings we want the new
  // settings to be applied automatically. For now only used for settings.
  async updateUserInfo() {
    // get the user's information here from database
    // make request to server to user information and set state
    var userToken = getToken()
    var headers = new Headers()
    headers.append("authorization", `Bearer ${userToken}`)

    var res = await fetch(getUserInfoURL, { method: "GET", headers })
    var userJson = await res.json()
    this.setState(prevState => ({
      ...userJson,
      // socket: prevState.socket,
      mounted: true,
      friendTableRows: prevState.friendTableRows,
      jumpJson: prevState.jumpJson,
      runJson: prevState.runJson,
      swimJson: prevState.swimJson,
    }))
  }

  render() {
    console.log("rendering header...")
    // renders the general layout of the application
    return (
      <div className="home-container">
        <SpaContext.Provider value={this.state}>
          <div className='row'>
            <div className='col-12'>
              {this.renderHeader()} 
            </div>
          </div>
          {/* only returns elements if it's not a phone */}
          <div className='mt-3 ml-2 p-1 content'>
            {this.renderSideMenu()}
            <div className='col-md-9 col-12 page-container'>
              <div className="card text-center h-100">
                <Switch location={this.props.location}>
                  <Route exact path={`${root}`} component={Home}/>
                  <Route path={`${root}/community`} component={Community}/>
                  <Route path={`${root}/fitness`} component={Fitness}/>
                  <Route path={`${root}/jumpDetails`} component={JumpDetails}/>
                  <Route path={`${root}/swimDetails`} component={SwimDetails}/>
                  <Route path={`${root}/runDetails`} component={RunDetails}/>
                  <Route exact path={`${root}/profile/:username?`} component={Profile}/>
                  {/* <Route path={`${root}/profile/:username?/edit`} component={EditProfile}/> */}
                  <Route path={`${root}/profile/:username?/edit`} component={EditProfileFunc}/>
                  <Route
                    exact path={`${root}/settings`}
                    render={(props) => <Settings {...props} updateUserInfo={this.updateUserInfo} />}
                  />
                  <Route path={`${root}/settings/stats`} component={Stats}/>
                </Switch>
              </div>
            </div>
          </div>
        </SpaContext.Provider>
      </div>
    )
  }
}

export default withRouter(Header);
