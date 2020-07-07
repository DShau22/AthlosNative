import React from 'react'
import { View, ScrollView, StyleSheet, Alert, FlatList } from 'react-native'
import { Tooltip, Text, ListItem } from 'react-native-elements';
import { UserDataContext, SettingsContext, AppFunctionsContext } from "../../Context"
import LoadingScreen from "../generic/LoadingScreen"
import { createStackNavigator } from '@react-navigation/stack';
import axios from 'axios';

import Spinner from 'react-native-loading-spinner-overlay';
import {
  getData,
  storeDataObj,
} from '../utils/storage';

import SettingsMenu from "./settingScreens/SettingsMenu"

import Success from "../messages/Success"
import ErrorAlert from "../messages/Error"
import ENDPOINTS from '../endpoints'
import PrivacySetting from './settingScreens/PrivacySetting';

const Settings = (props) => {
  const context = React.useContext(UserDataContext);
  let { settings } = context;
  const { setAppState } = React.useContext(AppFunctionsContext); 

  const [isLoading, setIsLoading] = React.useState(false);
  const [customSwimUnits, setCustomSwimUnits] = React.useState('Yards');
  const [currCustomSwimLength, setCurrCustomSwimLength] = React.useState('');
  const [customSwimLength, setCustomSwimLength] = React.useState(0);
  const [friendsListChoice, setFriendsListChoice] = React.useState(settings.seeFriendsList);
  const [fitnessChoice, setFitnessChoice] = React.useState(settings.seeFitness);
  const [basicInfoChoice, setBasicInfoChoice] = React.useState(settings.seeBasicInfo);
  const [unitDisplayChoice, setUnitDisplayChoice] = React.useState(settings.unitSystem);
  const [swimLengthChoice, setSwimLengthChoice] = React.useState(settings.swimLap);

  // cancel token for cancelling Axios requests on unmount
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  React.useEffect(() => {
    console.log("Community Nav has mounted");
    return () => {
      console.log("Settings requests are being canceled")
      source.cancel('Operation has been canceled')
    };
  }, [])

  const saveSettings = () => {
    const asyncSaveSettings = async () => {
      console.log('saving settings...')
      setIsLoading(true);
      console.log(friendsListChoice, fitnessChoice, basicInfoChoice, unitDisplayChoice, swimLengthChoice)
      // get user token
      try {
        var token = await getData()
        if (!token) {
          // send them back to the login page
          console.log("WOT they have no token hmmmm")
          setIsLoading(false);
          return
        } 
      } catch(e) {
        console.log(e)
      }
  
      // update settings with the backend
      try {
        const config = {
          headers: { 'Content-Type': 'application/json' },
          cancelToken: source.token
        }
        var res = await axios.post(settingsURL, {
          userToken: token,
          seeFriendsList: friendsListChoice,
          seeFitness: fitnessChoice,
          seeBasicInfo: basicInfoChoice,
          unitSystem: unitDisplayChoice,
          swimLap: swimLengthChoice
        }, config)
        var json = res.data
        console.log("axios response: ", json)
        if (json.success) {
          // props.updateUserInfo()
          Alert.alert('All Done!', "Your settings have been successfully updated :)", [{ text: "Okay" }]);
          setIsLoading(false);
        } else {
          Alert.alert('Oh No :(', json.message, [{ text: "Okay" }]);
          setIsLoading(false);
        }
      } catch(e) {
        console.error(e)
        Alert.alert('Oh No :(', "Something went wrong with the connection to the server. Please try again.", [{ text: "Okay" }]);
        setIsLoading(false);
      }
      // update Athlos state
      const newState = {
        ...context,
        settings: {
          seeBasicInfo: basicInfoChoice,
          seeFitness: fitnessChoice,
          seeFriendsList: friendsListChoice,
          swimLap: swimLengthChoice,
          unitSystem: unitDisplayChoice
        }
      }
      setAppState(newState)
      console.log("app state updated")
  
      // update async storage
      try {
        // THIS DOESN'T ACTUALLY WORK DOESNT SEEM LIKE CONTEXT DOESNT GET UPDATED FUCK
        console.log("storing data object: ", newState)
        await storeDataObj(newState)
      } catch(e) {
        console.error(e)
        Alert.alert('Oh No :(', "Something went wrong with trying to save your settings. Please try again.", [{ text: "Okay" }]);
      }
      console.log("async storage updated")
    }
    asyncSaveSettings();
  }
  // // saves the custom entered swimming pool length the user put in to the state 
  // // in the format: "distance units"
  // const setCustomSwimLength = () => {
  //   var { customSwimUnits, currCustomSwimLength } = state
  //   // user must have entered a swimming length
  //   if (!currCustomSwimLength) {

  //   }
  //   // standardize for database
  //   if (customSwimUnits === "Meters") {
  //     customSwimUnits = "m"
  //   } else {
  //     customSwimUnits = 'yds'
  //   }
  //   // set the custom swim length that can be uploaded to database, and also
  //   // close the modal
  //   setState({
  //     swimLengthChoice: `${currCustomSwimLength} ${customSwimUnits}`,
  //     showCustomSwimSettings: false
  //   })
  // }

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

  // for navigating to each setting page
  const Stack = createStackNavigator();
  // if the firstname in the context is blank then it hasnt finished populating yet
  if (!context.firstName) {
    return ( <LoadingScreen/>)
  } else {
    return (
      <SettingsContext.Provider value={{
        saveSettings,
      }}>
        <Text>CHANGE IT SO UNIT SYSTEM AND SWIM LAP WORK LATER</Text>
        <Spinner
          visible={isLoading}
          textContent={'Saving...'}
          textStyle={styles.spinnerTextStyle}
        />
        <Stack.Navigator>
          <Stack.Screen name={SETTINGS_MENU}>
            {(props) => <SettingsMenu {...props} saveSettings={saveSettings}/>}
          </Stack.Screen>
          <Stack.Screen name={FRIENDS_SETTINGS}>
            {(props) => (
              <PrivacySetting
                settingsList={FRIENDS_SETTINGS_LIST}
                updateSettings={setFriendsListChoice}
                defaultOption={friendsListChoice}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name={FITNESS_SETTINGS}>
            {(props) => (
              <PrivacySetting
                settingsList={FITNESS_SETTINGS_LIST}
                updateSettings={setFitnessChoice}
                defaultOption={fitnessChoice}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name={BASIC_INFO_SETTINGS}>
            {(props) => (
              <PrivacySetting
                settingsList={BASIC_INFO_SETTINGS_LIST}
                updateSettings={setBasicInfoChoice}
                defaultOption={basicInfoChoice}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name={UNIT_SYSTEM_SETTINGS}>
            {(props) => (
              <PrivacySetting
                settingsList={UNIT_SYSTEM_SETTINGS_LIST}
                updateSettings={setUnitDisplayChoice}
                defaultOption={unitDisplayChoice}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name={SWIM_SETTINGS}>
            {(props) => (
              <PrivacySetting
                {...props}
                settingsList={SWIM_SETTINGS_LIST}
                updateSettings={setSwimLengthChoice}
                defaultOption={swimLengthChoice}
              />
            )}
          </Stack.Screen>
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

import GLOBAL_CONSTANTS from '../GlobalConstants'
const { ONLY_ME, FOLLOWERS, EVERYONE } = GLOBAL_CONSTANTS

const FRIENDS_SETTINGS_LIST = [
  {
    title: EVERYONE,
    subtitle: 'FRIENDS_SETTINGS_LIST',  
  },
  {
    title: FOLLOWERS,
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
    title: FOLLOWERS,
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
    title: FOLLOWERS,
    subtitle: 'BASIC_INFO_SETTINGS_LIST',
  },
  {
    title: ONLY_ME,
    subtitle: 'BASIC_INFO_SETTINGS_LIST', 
  },
]

const UNIT_SYSTEM_SETTINGS_LIST = [
  {
    title: 'English',
    subtitle: 'yards, feet, inches, etc...',  
  },
  {
    title: 'Metric',
    subtitle: 'meters, centimeters, kilometers, etc...',
  },
]

const SWIM_SETTINGS_LIST = [
  {
    title: EVERYONE,
    subtitle: 'SWIM_SETTINGS_LIST',  
  },
  {
    title: FOLLOWERS,
    subtitle: 'SWIM_SETTINGS_LIST',
  },
  {
    title: ONLY_ME,
    subtitle: 'SWIM_SETTINGS_LIST', 
  },
]

export default Settings