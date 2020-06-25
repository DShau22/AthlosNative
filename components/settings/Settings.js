import React, { Component } from 'react'
import { View, ScrollView, StyleSheet, Alert, FlatList } from 'react-native'
import { Tooltip, Text, ListItem } from 'react-native-elements';
import { UserDataContext, SettingsContext, AppFunctionsContext } from "../../Context"
import LoadingScreen from "../generic/LoadingScreen"
import { useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


import Spinner from 'react-native-loading-spinner-overlay';
import {
  getData,
  storeDataObj,
} from '../utils/storage';

import UnitSystemMenu from "./dropdown-menus/UnitSystemMenu"
import PoolLengthMenu from "./dropdown-menus/PoolLengthMenu"
import PrivacyMenu from "./dropdown-menus/PrivacyMenu"
import PoolLengthPopup from "./PoolLengthPopup"

import SettingsMenu from "./settingScreens/SettingsMenu"
import FriendSettings from "./settingScreens/FriendSettings"

import Success from "../messages/Success"
import ErrorAlert from "../messages/Error"
import ENDPOINTS from '../endpoints'
import PrivacySetting from './settingScreens/PrivacySetting';

const Settings = (props) => {
  const [state, setState] = React.useState({
    isLoading: false,
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
  })
  const context = React.useContext(UserDataContext);
  const { setAppState } = React.useContext(AppFunctionsContext); 
  console.log("settings: ", context.settings)
  useFocusEffect(
    React.useCallback(() => {

    }, [])
  );
  const saveSettings = async () => {
    console.log('saving settings...')
    setState({
      ...state,
      isLoading: true,
    })
    var {
      friendsListChoice,
      fitnessChoice,
      basicInfoChoice,
      unitDisplayChoice,
      swimLengthChoice,
    } = state
    var { settings } = context
    // replace with what's already in the context if it's empty
    friendsListChoice = friendsListChoice ? friendsListChoice : settings.seeFriendsList
    fitnessChoice = fitnessChoice ? fitnessChoice : settings.seeFitness
    basicInfoChoice = basicInfoChoice ? basicInfoChoice : settings.seeBasicInfo
    unitDisplayChoice = unitDisplayChoice ? unitDisplayChoice : settings.unitSystem
    swimLengthChoice = swimLengthChoice ? swimLengthChoice : settings.swimLap

    console.log(friendsListChoice, fitnessChoice, basicInfoChoice, unitDisplayChoice, swimLengthChoice)
    // get user token
    const token = await getData()
    if (!token) {
      // send them back to the login page
      console.log("WOT they have no token hmmmm")
      return
      // return
    } 

    // update Athlos state
    setAppState({
      ...context,
      settings: {
        seeBasicInfo: basicInfoChoice,
        seeFitness: fitnessChoice,
        seeFriendsList: friendsListChoice,
        swimLap: swimLengthChoice,
        unitSystem: unitDisplayChoice
      }
    })
    console.log("app state updated")

    // update async storage
    try {
      await storeDataObj(context)
    } catch(e) {
      console.error(e)
      Alert.alert('Oh No :(', "Something went wrong with trying to save your settings. Please try again.", [{ text: "Okay" }]);
    }
    console.log("async storage updated")

    // update settings with the backend
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
        // props.updateUserInfo()
        Alert.alert('All Done!', "Your settings have been successfully updated :)", [{ text: "Okay" }]);
        setState({
          ...state,
          isLoading: false,
        })
      } else {
        Alert.alert('Oh No :(', "Something went wrong with the response from the server. Please try again.", [{ text: "Okay" }]);
        setState({
          ...state,
          isLoading: false,
        })
      }
    } catch(e) {
      console.error(e)
      Alert.alert('Oh No :(', "Something went wrong with the connection to the server. Please try again.", [{ text: "Okay" }]);
      setState({
        ...state,
        isLoading: false,
      })
    }
  }

  const setFriendsListChoice = (e) => {
    setState({
      friendsListChoice: e.currentTarget.textContent,
    })
  }

  const setFitnessChoice = (e) => {
    setState({
      fitnessChoice: e.currentTarget.textContent,
    })
  }

  const setBasicInfoChoice = (e) => {
    setState({
      basicInfoChoice: e.currentTarget.textContent,
    })
  }

  const setUnitDisplayChoice = (e) => {
    setState({
      unitDisplayChoice: e.currentTarget.textContent,
    })
  }

  const closeCustomSwimSettings = () => {
    setState({
      showCustomSwimSettings: false
    })
  }

  // causes the popup for entering custom swimming lap distance to open
  const onCustomSwimClick = () => {
    setState({
      showCustomSwimSettings: true
    })
  }

  const setSwimLengthChoice = (e) => {
    setState({
      swimLengthChoice: e.currentTarget.textContent,
    })
  }

  const setCustomSwimUnits = (e) => {
    setState({
      customSwimUnits: e.currentTarget.textContent,
    })
  }

  const onCustomSwimLengthChange = (e) => {
    setState({
      currCustomSwimLength: e.target.value
    })
  }

  // saves the custom entered swimming pool length the user put in to the state 
  // in the format: "distance units"
  const setCustomSwimLength = () => {
    var { customSwimUnits, currCustomSwimLength } = state
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
    setState({
      swimLengthChoice: `${currCustomSwimLength} ${customSwimUnits}`,
      showCustomSwimSettings: false
    })
  }

  const renderDropDown = (menuType, dropdownText) => {
    let {
      friendsListChoice,
      fitnessChoice,
      basicInfoChoice,
      unitDisplayChoice,
      swimLengthChoice
    } = state
    if (menuType === friendsListID) {
      return ( 
        <PrivacyMenu
          dropdownText={friendsListChoice ? friendsListChoice : dropdownText}
          onSelect={setFriendsListChoice}
        />
      )
    } else if (menuType === fitnessID) {
      return (<PrivacyMenu dropdownText={fitnessChoice ? fitnessChoice : dropdownText} onSelect={setFitnessChoice}/>)
    } else if (menuType === basicInfoID) {
      return (<PrivacyMenu dropdownText={basicInfoChoice ? basicInfoChoice : dropdownText} onSelect={setBasicInfoChoice}/>)
    } else if (menuType === unitSystemID) {
      return (<UnitSystemMenu dropdownText={unitDisplayChoice ? unitDisplayChoice : dropdownText} onSelect={setUnitDisplayChoice}/>)
    } else if (menuType === swimLapID) {
      return (
        <PoolLengthMenu
          dropdownText={swimLengthChoice ? swimLengthChoice : dropdownText}
          onCustomSwimClick={onCustomSwimClick}
          onSelect={setSwimLengthChoice}
        />
      )
    } else {
      alert('error showing menu')
    }
  }

  const displayErrors = () => {
    const clearErrors = () => {
      console.log("clearing errors...")
      setState({
        errorMsgs: ""
      })
    }
    if (state.errorMsgs) {
      return (
        <div className="msg-container">
          <ErrorAlert msg={state.errorMsgs} onClose={clearErrors}/>
        </div>
      )
    } else {
      return null
    }
  }
  
  const displaySuccesses = () => {
    const clearSuccesses = () => {
      setState({
        successMsgs: ""
      })
    }
    if (state.successMsgs) {
      return (
        <div className="msg-container">
          <Success msg={state.successMsgs} onClose={clearSuccesses}/>
        </div>
      )
    } else {
      return null
    }
  }

  // for navigating to each setting page
  const Stack = createStackNavigator();
  let { settings } = context;
  // if the firstname in the context is blank then it hasnt finished populating yet
  if (!context.firstName) {
    return ( <LoadingScreen/>)
  } else {
    return (
      <SettingsContext.Provider value={{ saveSettings, state, setState }}>
        <Spinner
          visible={state.isLoading}
          textContent={'Saving...'}
          textStyle={styles.spinnerTextStyle}
        />
        <Stack.Navigator>
          <Stack.Screen
            name={SETTINGS_MENU}
            component={SettingsMenu}
          />
          <Stack.Screen
            name={FRIENDS_SETTINGS}
            component={PrivacySetting}
            initialParams={{settingsList: FRIENDS_SETTINGS_LIST}}
          />
          <Stack.Screen
            name={FITNESS_SETTINGS}
            component={PrivacySetting}
            initialParams={{settingsList: FITNESS_SETTINGS_LIST}}
          />
          <Stack.Screen
            name={BASIC_INFO_SETTINGS}
            component={PrivacySetting}
            initialParams={{settingsList: BASIC_INFO_SETTINGS_LIST}}
          />
          <Stack.Screen
            name={UNIT_SYSTEM_SETTINGS}
            component={PrivacySetting}
            initialParams={{settingsList: UNIT_SYSTEM_SETTINGS_LIST}}
          />
          <Stack.Screen
            name={SWIM_SETTINGS}
            component={PrivacySetting}
            initialParams={{settingsList: SWIM_SETTINGS_LIST}}
          />
        </Stack.Navigator>
      </SettingsContext.Provider>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%'
  },
  scrollContents: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
// vars for checking which dropdown menu to display
const friendsListID = 'friends list'
const fitnessID = 'fitness'
const basicInfoID = 'info'
const swimLapID = 'swim lap'
const unitSystemID = 'unit system'
const settingsURL = ENDPOINTS.updateSettings

const SETTINGS_MENU = ' '
const FRIENDS_SETTINGS = 'Friends Settings'
const FITNESS_SETTINGS = 'Fitness Settings'
const BASIC_INFO_SETTINGS = 'Basic Info Settings'
const UNIT_SYSTEM_SETTINGS = 'Unit System Settings'
const SWIM_SETTINGS = 'Swimming Settings'

const ONLY_ME = 'Only Me'
const FRIENDS = 'Only Friends'
const EVERYONE = 'Everyone'

const FRIENDS_SETTINGS_LIST = [
  {
    title: EVERYONE,
    subtitle: 'FRIENDS_SETTINGS_LIST',  
  },
  {
    title: FRIENDS,
    subtitle: 'FRIENDS_SETTINGS_LIST',
  },
  {
    title: ONLY_ME,
    subtitle: 'FRIENDS_SETTINGS_LIST', 
  },
]

const FITNESS_SETTINGS_LIST = [
  {
    title: EVERYONE,
    subtitle: 'FITNESS_SETTINGS_LIST',  
  },
  {
    title: FRIENDS,
    subtitle: 'FITNESS_SETTINGS_LIST',
  },
  {
    title: ONLY_ME,
    subtitle: 'FITNESS_SETTINGS_LIST', 
  },
]

const BASIC_INFO_SETTINGS_LIST = [
  {
    title: EVERYONE,
    subtitle: 'BASIC_INFO_SETTINGS_LIST',  
  },
  {
    title: FRIENDS,
    subtitle: 'BASIC_INFO_SETTINGS_LIST',
  },
  {
    title: ONLY_ME,
    subtitle: 'BASIC_INFO_SETTINGS_LIST', 
  },
]

const UNIT_SYSTEM_SETTINGS_LIST = [
  {
    title: EVERYONE,
    subtitle: 'UNIT_SYSTEM_SETTINGS_LIST',  
  },
  {
    title: FRIENDS,
    subtitle: 'UNIT_SYSTEM_SETTINGS_LIST',
  },
  {
    title: ONLY_ME,
    subtitle: 'UNIT_SYSTEM_SETTINGS_LIST', 
  },
]

const SWIM_SETTINGS_LIST = [
  {
    title: EVERYONE,
    subtitle: 'SWIM_SETTINGS_LIST',  
  },
  {
    title: FRIENDS,
    subtitle: 'SWIM_SETTINGS_LIST',
  },
  {
    title: ONLY_ME,
    subtitle: 'SWIM_SETTINGS_LIST', 
  },
]

export default Settings