// Displays the profile of the user who is logged in on the browser
// They should be able to see everything
import React, { Component } from 'react'
import {
  withRouter,
} from "react-router-dom";
import ShowMoreText from 'react-show-more-text';

import SpaContext from '../Context';
import { weightConvert, heightConvert } from "../utils/unitConverter"
import "./css/userProfile.css"
import Popup from "reactjs-popup";
import EditProfileFunc from "./EditProfileFunc"
// replace with default avatar link
const imgAlt = "./default_profile.png"

class UserProfile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      bestJump: "",
      bestSwim: "",
      bestRun: "",
      editProfile: false,
      expandBio: false,
    }
  }

  componentDidMount() {
    console.log("profile mounted")
    // make a fetch request to get the bests of each user,
    // as well as the units they wanna display
  }

  renderBio() {
    var { bio } = this.context
    const onClick = () => {
      this.setState({ expandBio: true })
    }
    if (!bio) {
      return (
        <p>No bio yet</p>
      )
    }
    return (
      <ShowMoreText
        /* Default options */
        lines={3}
        more='Show more'
        less='Show less'
        anchorClass=''
        onClick={onClick}
        expanded={this.state.expandBio}
      >
        {bio}
      </ShowMoreText>
    )
  }

  renderHeight() {
    // HEIGHT IS IN FORMAT (num) (units in in/cm). Can flat out display it if they 
    // want metric, else convert to __ ft __ in for english system 
    var { height, settings } = this.context
    var { unitSystem } = settings
    unitSystem = unitSystem.toLowerCase()
    if (!height) {
      return ( <p>set height</p> )
    }
    var displayHeight = height
    if (unitSystem === "english") {
      // convert to english system if database stores it in cm else just display it in __ ft __ in
      displayHeight = heightConvert("english", height)
    } else if (unitSystem === "metric") {
      displayHeight = heightConvert('metric', height)
    } else {
      console.error(new Error("unitsystem is not 'english' or 'metric'..."))
    }
    return displayHeight
  }

  renderWeight() {
    // weight has format (num) (units in kg/lbs)
    var { weight, settings } = this.context
    var { unitSystem } = settings
    unitSystem = unitSystem.toLowerCase()
    var displayWeight = weight
    if (unitSystem === "english") {
      // convert to english system if database stores it in cm else just display it in __ ft __ in
      displayWeight = weightConvert("english", weight)
    } else if (unitSystem === "metric") {
      displayWeight = weightConvert('metric', weight)
    } else {
      console.error(new Error("unitsystem is not 'english' or 'metric'..."))
    }
    return displayWeight
  }

  renderBests() {
    // calculate bests based off of state and settings
  }

  renderNumFriends() {
    var { friends } = this.context
    return (
      <p>{"friends: " + friends.length}</p>
    )
  }

  renderPopup() {
    const editBtn = (
      <div className='edit-btn-container'>
        <i className='far'>&#xf044;</i>
        <span className="edit-btn">Edit Profile</span>
      </div>
    )
    return (
      <Popup trigger={editBtn} modal>
        {close => (
          <div className="popup-modal">
            <div className="popup-close" onClick={close}>
              &times;
            </div>
            <h4 className="popup-header"> Edit your profile </h4>
            <div className="content">
              <EditProfileFunc closePopup={close}/>
            </div>
          </div>
        )}
      </Popup>
    )
  }

  render() {
    var { context } = this
    // if user clicked the button to go to the edit profile page
    if (context.mounted) {
      return (
        <div className="profile-container">
          <div className='top-half'>
            {this.renderPopup()}
            <div className='img-container mt-2'>
              <img 
                className='profile-pic'
                src={context.profilePicture.profileURL}
                height="75%"
                width="75%"
                alt={imgAlt}
              />
            </div>
            <div className="name-container">
              <span className='fname'>{context.firstName}</span>
              <span className='lname'>{context.lastName}</span>
            </div>
            <div className='info-container m-3'>
              <div className='row'>
                <div className='col-4'>
                  <h5>Age</h5>
                  <span>{context.age}</span>
                </div>
                <div className='col-4'>
                  <h5>Height</h5>
                  <span>{this.renderHeight()}</span>
                </div>
                <div className='col-4'>
                  <h5>Weight</h5>
                  <span>{this.renderWeight()}</span>
                </div>
              </div>
            </div>
            <div className='bio-container m-3'>
              <span>{this.renderBio()}</span>
            </div>
          </div>
          <div className='bot-half'>
            <div className='row'>
              <div className='col-6'>
                total steps
              </div>
              <div className='col-6'>
                total mins
              </div>
            </div>
            <div className='row'>
              <div className='col-6'>
                total laps
              </div>
              <div className='col-6'>
                hightest jump
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
UserProfile.contextType = SpaContext
export default withRouter(UserProfile)
