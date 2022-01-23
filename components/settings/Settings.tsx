import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React from 'react';
import { View, ScrollView, StyleSheet, Alert, FlatList, ActivityIndicator } from 'react-native';
import { Tooltip, Text, ListItem } from 'react-native-elements';
import { UserDataContext, SettingsContext, AppFunctionsContext, AppFunctionsContextType } from "../../Context";
import LoadingScreen from "../generic/LoadingScreen";
import { createStackNavigator } from '@react-navigation/stack';
import axios from 'axios';
import {
  getToken,
  storeUserData,
  setDeviceId
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
  getDeviceId,
} from '../utils/storage';
import {
  showSnackBar
} from '../utils/notifications'
import { List } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import SyncProgressCircleHeader from '../bluetooth/SyncProgressCircleHeader';
import { UserDataInterface } from '../generic/UserTypes';
/**
 * THIS IS NO LONGER USED. ONLY SERVES AS A REFERENCE. ALL SETTINGS STUFF IS HANDLED IN PROFILE TEMPLATE NOW
 */

const Settings = (props) => {
  const { colors } = useTheme();
  const context = React.useContext(UserDataContext) as UserDataInterface;
  const { settings, _id } = context;
  const { setAppState, syncProgress } = React.useContext(AppFunctionsContext) as AppFunctionsContextType; 

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
  const [autoSync, setAutoSync] = React.useState<boolean>(false);

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
      var token;
      try {
        token = await getToken();
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
      // MAKE THIS ASYNC WITH NO AWAIT
      const config = {
        headers: { 'Content-Type': 'application/json' },
        cancelToken: source.token
      }
      axios.post(ENDPOINTS.updateSettings, {
        userToken: token,
        // seeCommunity: communityChoice,
        // seeFitness: fitnessChoice,
        // seeBests: bestsChoice,
        // seeTotals: totalsChoice,
        // seeBasicInfo: basicInfoChoice,
        // poolLength: swimLengthChoice,
        unitSystem: unitDisplayChoice,
      }, config);
      // update Athlos state
      // update async storage
      try {
        const newState = {
          ...context,
          settings: {
            // seeBasicInfo: basicInfoChoice,
            // seeFitness: fitnessChoice,
            // seeBests: bestsChoice,
            // seeTotals: totalsChoice,
            // seeCommunity: communityChoice,
            poolLength: swimLengthChoice,
            unitSystem: unitDisplayChoice
          }
        }
        await setAppState(newState);
        console.log("app state updated");
        console.log("storing data object: ", newState);
        await storeUserData(newState);
        console.log("async storage updated");
        Alert.alert('All Done!', "Your settings have been successfully updated :)", [{ text: "Okay" }]);
      } catch(e) {
        console.error(e)
        Alert.alert('Oh No :(', "Something went wrong with trying to save your settings. Please try again.", [{ text: "Okay" }]);
      } finally {
        setIsLoading(false);
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
            const deviceID = await getDeviceId();
            setIsLoading(true);
            if (deviceID.length === 0) {
              Alert.alert(
                "Whoops",
                "Looks like you don't actually have any Athlos earbuds linked to this device",
                [{text: "Okay"}]
              );
              setIsLoading(false);
              return;
            }
            try {
              await GlobalBleHandler.disconnect();
              GlobalBleHandler.stopScan();
              GlobalBleHandler.setID("");
              await setDeviceId(null);
              Alert.alert(
                "All Done!",
                "Successfully unlinked your Athlos earbuds from this device.",
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
        {isLoading ? 
          <View style={{
            height: GLOBAL_CONSTANTS.SCREEN_HEIGHT,
            width: GLOBAL_CONSTANTS.SCREEN_WIDTH,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'black',
            opacity: .4,
            zIndex: 1000,
            position: 'absolute',
          }}>
            <ActivityIndicator size='large'/>
          </View> : null
        }
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
          <Stack.Screen
            name={SETTINGS_CONSTANTS.UNIT_SYSTEM_SETTINGS}
          >
          {props => (
            <GeneralSetting
              initialChoice={unitDisplayChoice}
              settingsList={UNIT_SYSTEM_SETTINGS_LIST}
              updateSettings={setUnitDisplayChoice}
              saveSettings={saveSettings}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name={SETTINGS_CONSTANTS.DEVICE_SETTINGS}
        >
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
                  setShouldAutoSync(!autoSync).then(() => {
                    const oldAutoSync = autoSync;
                    setAutoSync(!autoSync);
                    console.log("old auto sync: ", oldAutoSync);
                    showSnackBar(`Auto sync ${oldAutoSync ? 'disabled' : 'enabled'}`);
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
                      Athlos earbuds when the app is open and your earbuds are scanning for devices. 
                      You can still manually sync with the sync tab. You will have to manually 
                      sync by going to the sync tab and swiping down if auto-sync is off.
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