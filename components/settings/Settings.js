import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

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
import GLOBAL_CONSTANTS from '../GlobalConstants'
import SETTINGS_CONSTANTS from './SettingsConstants'
const {
  COMMUNITY_SETTINGS_LIST,
  FITNESS_SETTINGS_LIST,
  BASIC_INFO_SETTINGS_LIST,
  UNIT_SYSTEM_SETTINGS_LIST,
  SWIM_SETTINGS_LIST,
  BESTS_SETTINGS_LIST,
  TOTALS_SETTINGS_LIST,

  SETTINGS_MENU,
  COMMUNITY_SETTINGS,
  FITNESS_SETTINGS,
  BESTS_SETTINGS,
  TOTALS_SETTINGS,
  BASIC_INFO_SETTINGS,
  UNIT_SYSTEM_SETTINGS,
  SWIM_SETTINGS,
} = SETTINGS_CONSTANTS
const { ONLY_ME, FOLLOWERS, EVERYONE } = GLOBAL_CONSTANTS

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
  const [communityChoice, setCommunityChoice] = React.useState(settings.seeCommunity);
  const [fitnessChoice, setFitnessChoice] = React.useState(settings.seeFitness);
  const [basicInfoChoice, setBasicInfoChoice] = React.useState(settings.seeBasicInfo);
  const [bestsChoice, setBestsChoice] = React.useState(settings.seeBests);
  const [totalsChoice, setTotalsChoice] = React.useState(settings.seeTotals);
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
        console.log(bestsChoice, totalsChoice)
        var res = await axios.post(ENDPOINTS.updateSettings, {
          userToken: token,
          seeCommunity: communityChoice,
          seeFitness: fitnessChoice,
          seeBests: bestsChoice,
          seeTotals: totalsChoice,
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
          throw new Error(json.message)
        }
      } catch(e) {
        console.log(e)
        Alert.alert('Oh No :(', e.toString(), [{ text: "Okay" }]);
        setIsLoading(false);
        return;
      }
      // update Athlos state
      const newState = {
        ...context,
        settings: {
          seeBasicInfo: basicInfoChoice,
          seeFitness: fitnessChoice,
          seeBests: bestsChoice,
          seeTotals: totalsChoice,
          seeCommunity: communityChoice,
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
        console.log("async storage updated")
      } catch(e) {
        console.error(e)
        Alert.alert('Oh No :(', "Something went wrong with trying to save your settings. Please try again.", [{ text: "Okay" }]);
      }
    }
    asyncSaveSettings();
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
        <Spinner
          visible={isLoading}
          textContent={'Saving...'}
          textStyle={styles.spinnerTextStyle}
        />
        <Text>CHANGE IT SO UNIT SYSTEM AND SWIM LAP WORK LATER</Text>
        <Stack.Navigator>
          <Stack.Screen
            name={SETTINGS_MENU}
            options={{ title: "Your Settings" }}
          >
            {props => <SettingsMenu {...props} saveSettings={saveSettings}/>}
          </Stack.Screen>
          <Stack.Screen name={COMMUNITY_SETTINGS}>
            {props => (
              <PrivacySetting
                settingsList={COMMUNITY_SETTINGS_LIST}
                updateSettings={setCommunityChoice}
                defaultOption={communityChoice}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name={FITNESS_SETTINGS}>
            {props => (
              <PrivacySetting
                settingsList={FITNESS_SETTINGS_LIST}
                updateSettings={setFitnessChoice}
                defaultOption={fitnessChoice}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name={BESTS_SETTINGS}>
            {props => (
              <PrivacySetting
                settingsList={BESTS_SETTINGS_LIST}
                updateSettings={setBestsChoice}
                defaultOption={bestsChoice}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name={TOTALS_SETTINGS}>
            {props => (
              <PrivacySetting
                settingsList={TOTALS_SETTINGS_LIST}
                updateSettings={setTotalsChoice}
                defaultOption={totalsChoice}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name={BASIC_INFO_SETTINGS}>
            {props => (
              <PrivacySetting
                settingsList={BASIC_INFO_SETTINGS_LIST}
                updateSettings={setBasicInfoChoice}
                defaultOption={basicInfoChoice}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name={UNIT_SYSTEM_SETTINGS}>
            {props => (
              <PrivacySetting
                settingsList={UNIT_SYSTEM_SETTINGS_LIST}
                updateSettings={setUnitDisplayChoice}
                defaultOption={unitDisplayChoice}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name={SWIM_SETTINGS}>
            {props => (
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

export default gestureHandlerRootHOC(Settings)