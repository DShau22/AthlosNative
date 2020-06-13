// Displays the profile of the searched person
// that the user logged in on the browser searched for

import React, { Component } from 'react'
// import {
//   Redirect,
// } from "react-router-dom";
// import { englishHeight }from "../utils/unitConverter"
import SpaContext from '../Context';
import { withRouter } from 'react-router-dom';
import ErrorAlert from "../messages/Error"
import './css/userProfile.css'
import { getToken } from "../utils/storage"
import ENDPOINTS from '../endpoints'
const getSearchUserUrl = ENDPOINTS.getSearchUser
const getBasicInfoURL = ENDPOINTS.getSearchUserBasicInfo
const getFriendsURL = ENDPOINTS.getSearchUserFriends
const getFitnessURL = ENDPOINTS.getSearchUserFitness

const imgAlt = "./default_profile.png"

class SearchProfile extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
      errorMsgs: [],
      settings: {},
      firstName: '',
      lastName: '',
      isFriend: false,
      bio: '',
      age: 0,
      height: '',
      weight: '',
      totals: {},
      bests: {},
      profilePicture: {},
      friends: []
    }
    this.getBasicInfo = this.getBasicInfo.bind(this)
    this.getFriends = this.getFriends.bind(this)
    this.getTotalsAndBests = this.getTotalsAndBests.bind(this)
  }

  async getBasicInfo() {
    var { seeBasicInfo } = this.state.settings
    var { isFriend } = this.state
    var { username } = this.props.match.params
    if (seeBasicInfo === "everyone" || (seeBasicInfo === 'friends' && isFriend)) {
      var res = await fetch(getBasicInfoURL, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      var { bio, weight, height, age, gender } = await res.json()
      this.setState({ bio, weight, height, age, gender })
    }
  }

  async getFriends() {
    var { seeFriendsList } = this.state.settings
    var { isFriend } = this.state
    var { username } = this.props.match.params
    if (seeFriendsList === "everyone" || (seeFriendsList === "friends" && isFriend)) {
      var res = await fetch(getFriendsURL, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      var { friends } = await res.json()
      this.setState({ friends })
    }
  }

  async getTotalsAndBests() {
    var { seeFitness } = this.state.settings
    var { isFriend } = this.state
    var { username } = this.props.match.params
    if (seeFitness === "everyone" || (seeFitness === "friends" && isFriend)) {
      var res = await fetch(getFitnessURL, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      var { bests, totals } = await res.json()
      this.setState({ bests, totals })
    }
  }

  async componentDidMount() {
    console.log("mounting search profile")
    // query this user's settings, bests, totals and set state
    let { username } = this.props.match.params
    var token = getToken()
    let postBody = { searchUserName: username, userToken: token }
    try {
      var res = await fetch(getSearchUserUrl, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postBody),
      })
      var { success, settings, firstName, lastName, isFriend, profilePicture } = await res.json()
      if (!success) {
        this.setState(prevState => ({
          errorMsgs: [...prevState.errorMsgs, 'Something went wrong. Please refresh and try again']
        }))
        return
      }
      this.setState({ settings, firstName, lastName, isFriend, profilePicture })
      await Promise.all([this.getBasicInfo(), this.getTotalsAndBests(), this.getFriends()])
    } catch(e) {
      console.log("poswjefioawef")
      console.error(e)
      alert('Something went wrong. Please refresh and try again')
      this.setState(prevState => ({
        errorMsgs: [...prevState.errorMsgs, e.toString()]
      }))
    }
  }

  // takes in an object of error messages and returns html elements to display them
  showError(msg, idx) {
    const onClose = () => {
      this.setState(prevState => ({
        errorMsgs: new Set( [...prevState.errorMsgs].filter(errMsg => errMsg !== msg))
      }))
    }
    return ( <ErrorAlert msg={msg} key={idx} onClose={onClose}/> )
  }

  // Shows all the errors due to bad signin or signup
  displayErrors() {
    var errorMsgs = [...this.state.errorMsgs]
    return errorMsgs.map(this.showError)
  }

  render() {
    console.log("search profile has rendered")
    var { context } = this
    var { firstName, lastName, age, height, bio, weight, totals, bests, profilePicture } = this.state
    if (context.mounted) {
      return (
        <div className="profile-container">
          <div className='top-half'>
            <div className='img-container mt-2'>
              <img 
                className='profile-pic'
                src={profilePicture.profileURL}
                height="75%"
                width="75%"
                alt={imgAlt}
              />
            </div>
            <div className="name-container">
              <span className='fname'>{firstName}</span>
              <span className='lname'>{lastName}</span>
            </div>
            <div className='info-container m-3'>
              <div className='row'>
                <div className='col-4'>
                  <h5>Age</h5>
                  <span>{age}</span>
                </div>
                <div className='col-4'>
                  <h5>Height</h5>
                  <span>{height}</span>
                </div>
                <div className='col-4'>
                  <h5>Weight</h5>
                  <span>{weight}</span>
                </div>
              </div>
            </div>
            <div className='bio-container m-3'>
              <span>{bio}</span>
            </div>
          </div>
          <div className='bot-half'>
            <div className='row'>
              <div className='col-6'>
                <h5>Total Steps</h5>
                <span>{totals.steps}</span>
              </div>
              <div className='col-6'>
                <h5>Total Min</h5>
                <span>{totals.minutes}</span>
              </div>
            </div>
            <div className='row'>
              <div className='col-6'>
                <h5>Total Laps</h5>
                <span>{totals.laps}</span>
              </div>
              <div className='col-6'>
                <h5>Highest Jump</h5>
                <span>{bests.jump}</span>
              </div>
            </div>
          </div>
        </div>
      )
    } else {
      // spa hasn't mounted and established context yet
      return (
        <div className="profile-loading-container">
          <span>loading...</span>
        </div>
      )
    }
  }
}
SearchProfile.contextType = SpaContext

export default withRouter(SearchProfile)