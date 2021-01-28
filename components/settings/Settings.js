import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React from 'react';
import { View, ScrollView, StyleSheet, Alert, FlatList } from 'react-native';
import { Tooltip, Text, ListItem } from 'react-native-elements';
import { UserDataContext, SettingsContext, AppFunctionsContext } from "../../Context";
import LoadingScreen from "../generic/LoadingScreen";
import { createStackNavigator } from '@react-navigation/stack';
import axios from 'axios';

import Spinner from 'react-native-loading-spinner-overlay';
import {
  getData,
  storeDataObj,
} from '../utils/storage';

import SettingsMenu from "./settingScreens/SettingsMenu";
import GLOBAL_CONSTANTS from '../GlobalConstants';
import SETTINGS_CONSTANTS from './SettingsConstants';
const {
  POOL_LENGTH_CHOICES,
  UNIT_SYSTEM_CHOICES,

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
  DEVICE_SETTINGS,
} = SETTINGS_CONSTANTS;
const { ONLY_ME, FOLLOWERS, EVERYONE } = GLOBAL_CONSTANTS;

import ENDPOINTS from '../endpoints';
import PrivacySetting from './settingScreens/PrivacySetting';
import GeneralSetting from './settingScreens/GeneralSetting';
import ThemeText from '../generic/ThemeText';
import GlobalBleHandler from '../bluetooth/GlobalBleHandler';
import {
  getShouldAutoSync,
  setShouldAutoSync,
} from '../utils/storage';
import {
  showSnackBar
} from '../utils/notifications'
import { List } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
/**
 * THIS IS NO LONGER USED. ONLY SERVES AS A REFERENCE. ALL SETTINGS STUFF IS HANDLED IN PROFILE TEMPLATE NOW
 */

const Settings = (props) => {
  const { colors } = useTheme();
  const context = React.useContext(UserDataContext);
  const { settings, deviceID, _id } = context;
  const { setAppState } = React.useContext(AppFunctionsContext); 

  const [isLoading, setIsLoading] = React.useState(false);
  // NOT CURRENTLY IN USE
  // const [customSwimUnits, setCustomSwimUnits] = React.useState('Yards');
  // const [currCustomSwimLength, setCurrCustomSwimLength] = React.useState('');
  // const [customSwimLength, setCustomSwimLength] = React.useState(0);
  // const [communityChoice, setCommunityChoice] = React.useState(settings.seeCommunity);
  // const [fitnessChoice, setFitnessChoice] = React.useState(settings.seeFitness);
  // const [basicInfoChoice, setBasicInfoChoice] = React.useState(settings.seeBasicInfo);
  // const [bestsChoice, setBestsChoice] = React.useState(settings.seeBests);
  // const [totalsChoice, setTotalsChoice] = React.useState(settings.seeTotals);
  const [swimLengthChoice, setSwimLengthChoice] = React.useState(settings.poolLength);

  const [unitDisplayChoice, setUnitDisplayChoice] = React.useState(settings.unitSystem);
  const [autoSync, setAutoSync] = React.useState(false);

  // cancel token for cancelling Axios requests on unmount
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  React.useEffect(() => {
    getShouldAutoSync().then(bool => {
      setAutoSync(bool);
    });
    return () => {
      console.log("Settings requests are being canceled")
      source.cancel('Operation has been canceled')
    };
  }, []);

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
        var res = await axios.post(ENDPOINTS.updateSettings, {
          userToken: token,
          // seeCommunity: communityChoice,
          // seeFitness: fitnessChoice,
          // seeBests: bestsChoice,
          // seeTotals: totalsChoice,
          // seeBasicInfo: basicInfoChoice,
          // poolLength: swimLengthChoice,
          unitSystem: unitDisplayChoice,
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
          poolLength: swimLengthChoice,
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

  const forgetEarbuds = () => {
    Alert.alert(
      'Are you sure?',
      "You'll have to relink another pair on the sync tab.",
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            console.log("", deviceID);
            if (deviceID.length === 0) {
              Alert.alert(
                "Whoops",
                "Looks like you don't actually have any Athlos earbuds linked to this account",
                [{text: "Okay"}]);
                return;
            }
            setIsLoading(true);
            try {
              const res = await axios.post(ENDPOINTS.updateDeviceID, {
                userID: _id,
                deviceID: "",
              });
              if (!res.data.success)
                throw new Error(res.data.message);
              const newState = {...context, deviceID: ""}
              GlobalBleHandler.setID("");
              await setAppState(newState);
              Alert.alert(
                "All Done!",
                "Successfully unlinked your Athlos earbuds from this account.",
              [{text: "Okay"}]);
            } catch(e) {
              console.log(e);
              Alert.alert(
                "Whoops",
                "Something went wrong with the network request. Please try again.",
                [{text: "Okay"}]);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
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
          textStyle={{color: colors.textColor}}
        />
        <Stack.Navigator
          headerMode='none'
        >
        {/* <SettingsMenu navigation={navigation} saveSettings={saveSettings}/> */}
          <Stack.Screen
            name={SETTINGS_MENU}
            options={{ title: "Your Settings" }}
          >
            {screenProps => 
              <View style={{flex: 1}}>
                <SettingsMenu {...screenProps} saveSettings={saveSettings}/>
              </View>
            }
          </Stack.Screen>
          <Stack.Screen name={SETTINGS_CONSTANTS.UNIT_SYSTEM_SETTINGS}>
          {props => (
            <GeneralSetting
              initialChoice={unitDisplayChoice}
              settingsList={UNIT_SYSTEM_SETTINGS_LIST}
              updateSettings={setUnitDisplayChoice}
              saveSettings={saveSettings}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name={SETTINGS_CONSTANTS.DEVICE_SETTINGS} options={{title: "Athlos device settings"}}>
          {props => (
            <>
              <ListItem 
                containerStyle={{backgroundColor: colors.backgroundColor}}
                topDivider
                bottomDivider
                onPress={forgetEarbuds}
              >
                <ListItem.Content>
                  <ListItem.Title>
                    <ThemeText>Forget Earbuds</ThemeText>
                  </ListItem.Title>
                  <ListItem.Subtitle>
                    <ThemeText>
                      Unlinks your current Athlos earbuds from this device.
                      You'll have to relink another pair on the sync tab.
                    </ThemeText>
                  </ListItem.Subtitle>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
              <ListItem 
                containerStyle={{backgroundColor: colors.backgroundColor}}
                topDivider
                bottomDivider
                onPress={() => {
                  // setIsLoading(true);
                  setShouldAutoSync(!autoSync).then(() => {
                    const oldAutoSync = autoSync;
                    setAutoSync(!autoSync);
                    console.log("old auto sync: ", oldAutoSync)
                    if (oldAutoSync) {
                      GlobalBleHandler.stopScan();
                    } // previously true means it's now false
                    showSnackBar(`Auto sync ${oldAutoSync ? 'disabled' : 'enabled'}. Restart the app for the effects to be enabled`);
                    // setIsLoading(false);
                  })
                }}
              >
                <ListItem.Content>
                  <ListItem.Title>
                    <ThemeText>Enable Auto-sync</ThemeText>
                  </ListItem.Title>
                  <ListItem.Subtitle>
                    <ThemeText>
                      Auto-sync causes your mobile device to automatically sync with your 
                      Athlos earbuds when they are scanning for devices. We'll notify you 
                      once auto-sync succeeds, and you can still manually sync with the sync 
                      tab if auto-sync is taking too long or fails.
                    </ThemeText>
                  </ListItem.Subtitle>
                </ListItem.Content>
                <ListItem.CheckBox
                  checked={autoSync}
                  checkedColor={colors.textColor}
                  checkedIcon='dot-circle-o'
                  uncheckedIcon='circle-o'
                  onPress={() => {
                    // setIsLoading(true);
                    setShouldAutoSync(!autoSync).then(() => {
                      const oldAutoSync = autoSync;
                      setAutoSync(!autoSync);
                      console.log("old auto sync: ", oldAutoSync)
                      if (oldAutoSync) {
                        GlobalBleHandler.stopScan();
                      } // previously true means it's now false
                      showSnackBar(`Auto sync ${oldAutoSync ? 'disabled' : 'enabled'}. Restart the app for the effects to be enabled`);
                      // setIsLoading(false);
                    })
                  }}
                />
              </ListItem>
            </>
          )}
        </Stack.Screen>
          {/* <Stack.Screen name={SWIM_SETTINGS}>
            {props => (
              <GeneralSetting
                {...props}
                initialChoice={settings.poolLength}
                settingsList={SWIM_SETTINGS_LIST}
                updateSettings={setSwimLengthChoice}
                defaultOption={swimLengthChoice}
              />
            )}
          </Stack.Screen> */}
          {/* <Stack.Screen name={COMMUNITY_SETTINGS}>
            {props => (
              <PrivacySetting
                settingsList={COMMUNITY_SETTINGS_LIST}
                updateSettings={setCommunityChoice}
                defaultOption={communityChoice}
              />
            )}
          </Stack.Screen> */}
          {/* <Stack.Screen name={FITNESS_SETTINGS}>
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
          </Stack.Screen> */}
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