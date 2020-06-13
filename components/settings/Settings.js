import React, { Component } from 'react'
import SpaContext from "../Context"
import LoadingScreen from "../generic/LoadingScreen"
import {
  withRouter
} from "react-router-dom";
import {
  getToken,
  storageKey
} from '../utils/storage';

import './settings.css'
import $ from 'jquery';

import UnitSystemMenu from "./dropdown-menus/UnitSystemMenu"
import PoolLengthMenu from "./dropdown-menus/PoolLengthMenu"
import PrivacyMenu from "./dropdown-menus/PrivacyMenu"
import PoolLengthPopup from "./PoolLengthPopup"

import Success from "../messages/Success"
import ErrorAlert from "../messages/Error"
import ENDPOINTS from '../endpoints'

const friendsListHelpMsg = 'Set who can see your friends list on you profile'
const fitnessHelpMsg = 'Set who can see your fitness stats such as average number of steps taken per day, calories burned, etc.'
const basicInfoHelpMsg = 'Set who can see descriptions about you such as your bio, height, weight, etc.'
const unitSystemHelpMsg = 'Set what unit system you would prefer to view measurements in'
const lapSwimHelpMsg = 'Set the default length of your lap swim pool. You can change this individually for each workout'
// vars for checking which dropdown menu to display
const friendsListID = 'friends list'
const fitnessID = 'fitness'
const basicInfoID = 'info'
const swimLapID = 'swim lap'
const unitSystemID = 'unit system'
const settingsURL = ENDPOINTS.updateSettings

class Settings extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
      // show the custom swim popup or not
      showCustomSwimSettings: false,
      // display either yards or meters in custom swim popup by default
      customSwimUnits: "Yards",
      // user inputted swimming length
      currCustomSwimLength: 25,
      // custom swimming length to save in the format of: distance units
      customSwimLength: "",

      friendsListChoice: "",
      fitnessChoice: "",
      basicInfoChoice: "",
      unitDisplayChoice: "",
      swimLengthChoice: "",

      //errors
      errorMsgs: "",
      successMsgs: "",
    }
    this.saveSettings = this.saveSettings.bind(this)
    this.openCustomSwimSettings = this.openCustomSwimSettings.bind(this)
    this.closeCustomSwimSettings = this.closeCustomSwimSettings.bind(this)
    this.onCustomSwimClick = this.onCustomSwimClick.bind(this)

    this.setFriendsListChoice = this.setFriendsListChoice.bind(this)
    this.setFitnessChoice = this.setFitnessChoice.bind(this)
    this.setBasicInfoChoice = this.setBasicInfoChoice.bind(this)
    this.setUnitDisplayChoice = this.setUnitDisplayChoice.bind(this)
    this.setSwimLengthChoice = this.setSwimLengthChoice.bind(this)
    this.setCustomSwimUnits = this.setCustomSwimUnits.bind(this)
    this.onCustomSwimLengthChange = this.onCustomSwimLengthChange.bind(this)
    this.setCustomSwimLength = this.setCustomSwimLength.bind(this)

    // errors
    this.displayErrors = this.displayErrors.bind(this)
    this.displaySuccesses = this.displaySuccesses.bind(this)
  }
  
  // below is for initalizing tooltips
  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip();
    // debugger;
  }
  
  componentDidUpdate() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  async saveSettings() {
    console.log('saving settings...')
    var {
      friendsListChoice,
      fitnessChoice,
      basicInfoChoice,
      unitDisplayChoice,
      swimLengthChoice,
    } = this.state
    var { settings } = this.context
    // replace with what's already in the context if it's empty
    friendsListChoice = friendsListChoice ? friendsListChoice : settings.seeFriendsList
    fitnessChoice = fitnessChoice ? fitnessChoice : settings.seeFitness
    basicInfoChoice = basicInfoChoice ? basicInfoChoice : settings.seeBasicInfo
    unitDisplayChoice = unitDisplayChoice ? unitDisplayChoice : settings.unitSystem
    swimLengthChoice = swimLengthChoice ? swimLengthChoice : settings.swimLap

    console.log(friendsListChoice, fitnessChoice, basicInfoChoice, unitDisplayChoice, swimLengthChoice)
    // get user token
    const token = getToken(storageKey)
    if (!token) {
      // send them back to the login page
      alert("Your session has expired. Please login again.")
      this.props.history.push("/")
      return
    } 

    try {
      var res = await fetch(settingsURL, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userToken: token,
          seeFriendsList: friendsListChoice,
          seeFitness: fitnessChoice,
          seeBasicInfo: basicInfoChoice,
          unitSystem: unitDisplayChoice,
          swimLap: swimLengthChoice
        })
      })
      var json = await res.json()
      if (json.success) {
        this.props.updateUserInfo()
        this.setState({
          successMsgs: "Successfully saved your new settings"
        })
      } else {
        throw Error(json.messages.msg)
      }
    } catch(e) {
      console.error(e)
      this.setState({
        errorMsgs: "Something went wrong when trying to save your settings. Please try again later."
      })
    }
  }

  setFriendsListChoice(e) {
    this.setState({
      friendsListChoice: e.currentTarget.textContent,
    })
  }

  setFitnessChoice(e) {
    this.setState({
      fitnessChoice: e.currentTarget.textContent,
    })
  }

  setBasicInfoChoice(e) {
    this.setState({
      basicInfoChoice: e.currentTarget.textContent,
    })
  }

  setUnitDisplayChoice(e) {
    this.setState({
      unitDisplayChoice: e.currentTarget.textContent,
    })
  }

  openCustomSwimSettings() {
    this.setState({
      showCustomSwimSettings: true
    })
  }

  closeCustomSwimSettings() {
    this.setState({
      showCustomSwimSettings: false
    })
  }

  // causes the popup for entering custom swimming lap distance to open
  onCustomSwimClick() {
    this.setState({
      showCustomSwimSettings: true
    })
  }

  setSwimLengthChoice(e) {
    this.setState({
      swimLengthChoice: e.currentTarget.textContent,
    })
  }

  setCustomSwimUnits(e) {
    this.setState({
      customSwimUnits: e.currentTarget.textContent,
    })
  }

  onCustomSwimLengthChange(e) {
    this.setState({
      currCustomSwimLength: e.target.value
    })
  }

  // saves the custom entered swimming pool length the user put in to the state 
  // in the format: "distance units"
  setCustomSwimLength() {
    var { customSwimUnits, currCustomSwimLength } = this.state
    // user must have entered a swimming length
    if (!currCustomSwimLength) {

    }
    // standardize for database
    if (customSwimUnits === "Meters") {
      customSwimUnits = "m"
    } else {
      customSwimUnits = 'yds'
    }
    // set the custom swim length that can be uploaded to database, and also
    // close the modal
    this.setState({
      swimLengthChoice: `${currCustomSwimLength} ${customSwimUnits}`,
      showCustomSwimSettings: false
    })
  }

  renderDropDown(menuType, dropdownText) {
    let {
      friendsListChoice,
      fitnessChoice,
      basicInfoChoice,
      unitDisplayChoice,
      swimLengthChoice
    } = this.state
    if (menuType === friendsListID) {
      return ( 
        <PrivacyMenu
          dropdownText={friendsListChoice ? friendsListChoice : dropdownText}
          onSelect={this.setFriendsListChoice}
        />
      )
    } else if (menuType === fitnessID) {
      return (<PrivacyMenu dropdownText={fitnessChoice ? fitnessChoice : dropdownText} onSelect={this.setFitnessChoice}/>)
    } else if (menuType === basicInfoID) {
      return (<PrivacyMenu dropdownText={basicInfoChoice ? basicInfoChoice : dropdownText} onSelect={this.setBasicInfoChoice}/>)
    } else if (menuType === unitSystemID) {
      return (<UnitSystemMenu dropdownText={unitDisplayChoice ? unitDisplayChoice : dropdownText} onSelect={this.setUnitDisplayChoice}/>)
    } else if (menuType === swimLapID) {
      return (
        <PoolLengthMenu
          dropdownText={swimLengthChoice ? swimLengthChoice : dropdownText}
          onCustomSwimClick={this.onCustomSwimClick}
          onSelect={this.setSwimLengthChoice}
        />
      )
    } else {
      alert('error showing menu')
    }
  }

  displayErrors() {
    const clearErrors = () => {
      console.log("clearing errors...")
      this.setState({
        errorMsgs: ""
      })
    }
    if (this.state.errorMsgs) {
      return (
        <div className="msg-container">
          <ErrorAlert msg={this.state.errorMsgs} onClose={clearErrors}/>
        </div>
      )
    } else {
      return null
    }
  }
  
  displaySuccesses() {
    const clearSuccesses = () => {
      this.setState({
        successMsgs: ""
      })
    }
    if (this.state.successMsgs) {
      return (
        <div className="msg-container">
          <Success msg={this.state.successMsgs} onClose={clearSuccesses}/>
        </div>
      )
    } else {
      return null
    }
  }

  render() {
    let { settings } = this.context
    // if the firstname in the context is blank then it hasnt finished populating yet
    console.log("rendering settings")
    if (!this.context.firstName) {
      return ( <LoadingScreen/>)
    } else {
      return (
        <div className='settings-container'>
          <h3 className='settings-header mt-3 pb-3'>Settings</h3>
          <PoolLengthPopup 
            showCustomSwimSettings={this.state.showCustomSwimSettings}
            closeCustomSwimSettings={this.closeCustomSwimSettings}
            onCustomSwimLengthChange={this.onCustomSwimLengthChange}
            setCustomSwimUnits={this.setCustomSwimUnits}
            setCustomSwimLength={this.setCustomSwimLength}
            customSwimUnits={this.state.customSwimUnits}
          />
          <ul className='settings-list'>
            <li className='settings-list-item'>
              <i
                className="fa help-icon"
                data-toggle="tooltip"
                data-placement="top"
                title={friendsListHelpMsg}
              >
                &#xf059;
              </i>
              <span className='setting-text'>Who can see your friends list?</span>
              {this.renderDropDown(friendsListID, settings.seeFriendsList)}
            </li>
            <li className='settings-list-item'>
              <i
                className="fa help-icon"
                data-toggle="tooltip"
                data-placement="top"
                title={fitnessHelpMsg}
              >
                &#xf059;
              </i>
              <span className='setting-text'>Who can see your fitness?</span>
              {this.renderDropDown(fitnessID, settings.seeFitness)}
            </li>
            <li className='settings-list-item'>
              <i
                className="fa help-icon"
                data-toggle="tooltip"
                data-placement="top"
                title={basicInfoHelpMsg}
              >
                &#xf059;
              </i>
              <span className='setting-text'>Who can see your basic info?</span>
              {this.renderDropDown(basicInfoID, settings.seeBasicInfo)}
            </li>
            <li className='settings-list-item'>
              <i
                className="fa help-icon"
                data-toggle="tooltip"
                data-placement="top"
                title={unitSystemHelpMsg}
              >
                &#xf059;
              </i>
              <span className='setting-text'>Unit system to display</span>
              {this.renderDropDown(unitSystemID, settings.unitSystem)}
            </li>
            <li className='settings-list-item'>
              <i
                className="fa help-icon"
                data-toggle="tooltip"
                data-placement="top"
                title={lapSwimHelpMsg}
              >
                &#xf059;
              </i>
              <span className='setting-text'>Default swimming pool length</span>
              {this.renderDropDown(swimLapID, settings.swimLap)}
            </li>
            <li className='settings-list-item' id='save-settings-list-item'>
              <div className='help-icon empty-space'></div>
              <div className='setting-text empty-space'></div>
              <div className='save-settings'>
                <button 
                  className='save-settings-btn btn btn-primary'
                  onClick={this.saveSettings}
                >
                  Save
                </button>
              </div>
            </li>
          </ul>
          {this.displayErrors()}
          {this.displaySuccesses()}
        </div>
      )
    }
  }
}
Settings.contextType = SpaContext
export default withRouter(Settings)