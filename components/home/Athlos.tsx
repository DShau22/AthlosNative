import * as React from 'react';
import { Text, View, StyleSheet, Alert, DeviceEventEmitter, Platform, } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import BLUETOOTH_CONSTANTS from '../bluetooth/BluetoothConstants';
import { BluetoothStatus } from 'react-native-bluetooth-status';
import {
  getToken,
  getShouldAutoSync,
  setShouldAutoSync,
  storeUserData,
  getUserData,
  getFirstTimeLogin,
  setFirstTimeLogin,
  getDeviceId,
  getShouldShowAutoSyncWarningDialog,
  setShouldShowAutoSyncWarningDialog,
} from '../utils/storage';
import ENDPOINTS from "../endpoints";
import {
  requestLocationPermission,
  requestLocationServices
} from '../utils/permissions';
import {
  UserActivities
} from '../fitness/data/UserActivities';
import {
  DEFAULT_RUN_EFFORTS,
  DEFAULT_SWIM_EFFORTS,
  DEFAULT_WALK_EFFORTS,
  getUserActivityData,
} from '../fitness/data/localStorage';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
MaterialCommunityIcons.loadFont();
import Ionicons from 'react-native-vector-icons/Ionicons';
Ionicons.loadFont();
import Feather from 'react-native-vector-icons/Feather';
Feather.loadFont();

import { showSnackBar } from '../utils/notifications';
import LoadingSpin from '../generic/LoadingSpin';
import { UserDataContext, AppFunctionsContext } from "../../Context";
import Profile from '../profile/Profile';
import DeviceConfig from '../configure/DeviceConfig';
import GlobalBleHandler from '../bluetooth/GlobalBleHandler';
import SADataSync from '../bluetooth/SADataSync';
import WelcomeModal from './WelcomeModal';

import GLOBAL_CONSTANTS from '../GlobalConstants';
const {
  HOME,
  FITNESS,
  COMMUNITY,
  SETTINGS,
  PROFILE,
  DEVICE_CONFIG,
  SYNC,
} = GLOBAL_CONSTANTS;
import FITNESS_CONTANTS from '../fitness/FitnessConstants';
import ThemeText from '../generic/ThemeText';
import { useTheme } from '@react-navigation/native';
import Axios from 'axios';
import { UserDataInterface } from '../generic/UserTypes';
import AutoSyncWarningModal from './AutoSyncWarningModal';

interface AthlosInterface {
  token: string,
};
const Athlos: React.FC<AthlosInterface> = (props) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [athlosConnected, setAthlosConnected] = React.useState<boolean>(false);
  const [bluetoothOn, setBluetoothOn] = React.useState<boolean>(true);

  const firstUpdate = React.useRef(true);

  // const [rivals, setRivals] = React.useState([]);
  // const [rivalsPending, setRivalsPending] = React.useState([]);
  // const [rivalRequests, setRivalRequests] = React.useState([]);

  // const [followers, setFollowers] = React.useState([]);
  // const [followerRequests, setFollowerRequests] = React.useState([]);

  // const [following, setFollowing] = React.useState([]);
  // const [followingPending, setFollowingPending] = React.useState([]);
  const [showWelcomeModal, setShowWelcomeModal] = React.useState<boolean>(false);
  const [showAutoSyncWarningModal, setShowAutoSyncWarningModal] = React.useState<boolean>(false);
  const [syncProgress, setSyncProgress] = React.useState<number>(-1); // for global sync progress bar/wheel
  // flag that triggers fitness components to update from local storage after sadata read
  const [shouldRefreshFitness, setShouldRefreshFitness] = React.useState<boolean>(false); 
  const [state, setState] = React.useState<UserDataInterface>({
    _id: '',
    friends: [],
    friendRequests: [],
    friendsPending: [],

    rivals: [],
    rivalsPending: [],
    rivalRequests: [],

    followers: [],
    followerRequests: [],

    following: [],
    followingPending: [],

    firstName: "",
    lastName: "",
    username: "",
    gender: "",
    bio: "",
    height: "",
    weight: "",
    age: "",
    profilePicture: "",
    settings: {
      unitSystem: GLOBAL_CONSTANTS.ENGLISH
    },
    numFriendsDisplay: 25,
    goals: {
      goalSteps: 1,
      goalLaps: 1,
      goalVertical: 1,
      goalCaloriesBurned: 1,
      goalWorkoutTime: 1,
    },
    jumpJson: {
      activityData: [],
      action: FITNESS_CONTANTS.JUMP,
    },
    runJson: {
      activityData: [],
      action: FITNESS_CONTANTS.RUN,
    },
    swimJson: {
      activityData: [],
      action: FITNESS_CONTANTS.SWIM,
    },
    intervalJson: {
      activityData: [],
      action: FITNESS_CONTANTS.HIIT,
    },
    bests: {
      highestJump: 10,
      mostSteps: 0,
      mostLaps: 0,
      mostCalories: 0,
      bestEvent: {}
    },
    referenceTimes: {
      fly: [22, 20],
      back: [30, 26],
      breast: [32, 28],
      free: [25, 22]
    },
    runEfforts: DEFAULT_RUN_EFFORTS,
    walkEfforts: DEFAULT_WALK_EFFORTS,
    swimEfforts: DEFAULT_SWIM_EFFORTS,
  });

  const syncData = async (): Promise<number | null> => {
    let tryCount = 3;
    let success = false;
    console.log("begin syncing....");
    const isBtEnabled = await BluetoothStatus.state();
    if (!isBtEnabled) {
      Alert.alert("Bluetooth is not on", "Please turn on your phone's Bluetooth to sync", [{text: "Okay"}]);
      return null;
    }
    while (tryCount > 0 && !success) {
      try {
        var numBytesRead = await GlobalBleHandler.readActivityData(); // should take care of uploading to server in background
        console.log("finished transferring activity data....");
        success = true;
      } catch(e) {
        console.log("error with sync: ", e);
        if (e === BLUETOOTH_CONSTANTS.STOP_SCAN_ERR) { // if we manually or programmatically stopped the scan, then stop the animation and don't try again.
          return -1;
        }
        showSnackBar(`${e}. Trying again...`);
        tryCount -= 1;
      }
    }
    if (!success) {
      showSnackBar(`Something went wrong with syncing. Please make sure bluetooth is on and try again.`);
      return null;
    } else {
      return numBytesRead;
    }
  }

  const continueSync = async () => {
    const bytesRead = await syncData();
    if (!bytesRead) {
      showSnackBar(`Something went wrong with syncing. Please make sure bluetooth is on and try again.`);
      return;
    } else if (bytesRead < 0) { // this means user stopped the scan
      showSnackBar("Stopped syncing");
    } else if (bytesRead <= 8 && bytesRead > 0) {
      showSnackBar("Activities already updated.");
      return;
    }
    showSnackBar("Successfully synced!");
    try {
      await updateLocalUserInfo();
    } catch(e) {
      console.log("error updating local user fitness after continuing to sync: ", e);
    }
  }

  // react to user changing phone's bt status
  const onBluetoothStatusChange = (isEnabled: boolean) => {
    if (isEnabled) {
      setBluetoothOn(true);
      console.log("ONNNNN")
      if (GlobalBleHandler.hasID()) {
        GlobalBleHandler.scanAndConnect()
        .then((connected) => {
          setAthlosConnected(connected ? true : false);
        })
        .catch((e) => {
          console.log("error connecting to device: ", e);
          showSnackBar(`Error connecting to device. ${e.toString()}`);
        });
      }
    } else {
      console.log("offffff")
      setBluetoothOn(false);
    }
  }

  // setting up the Athlos app
  React.useEffect(() => {
    const setUpApp = async () => {
      GlobalBleHandler.addSetConnectedFunction(setAthlosConnected);
      GlobalBleHandler.addSetSyncProgressFunction(setSyncProgress);
      GlobalBleHandler.addSetShouldRefreshFitnessFunction(setShouldRefreshFitness);
      BluetoothStatus.addListener(onBluetoothStatusChange);
      const isBtOn = await BluetoothStatus.state();
      setBluetoothOn(isBtOn);
      if (Platform.OS === 'android') {
        await requestLocationServices();
        DeviceEventEmitter.addListener('locationProviderStatusChange', function(status) { // only trigger when "providerListener" is enabled
          if (!status.enabled) {
            // console.log(status);
            Alert.alert(
              "Whoops",
              "You'll need to turn on your phone's location services for this app to be able to make Bluetooth connections " +
              "with your Athlos earbuds. Android requires location services to be on for Bluetooth access.",
              [{text: 'Okay'}]
            );
          }
        });
        await requestLocationPermission(); // request location permissions for Android users
      }
      setIsLoading(true);
      // first check if info is in Async storage
      const token = await getToken();
      const userData = await getUserData();
      if (!token) {
        console.log("This is weird. Somehow log them out and redirect to login page")
      }
      if (userData && userData._id.length > 0) {
        setState(userData);
        setIsLoading(false);
      } else {
        // get the user's information here from database
        // make request to server to user information and set state
        try {
          await updateLocalUserInfo();
        } catch(e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      }
      // check if theyve connected a device. If they have, then proceed to using the GlobalBleHandler.
      // Else show the welcome modal
      const firstTime = await getFirstTimeLogin();
      if (firstTime) {
        setShowWelcomeModal(true);
         // autosync set to true after linking
        await Promise.all([
          setFirstTimeLogin('logged in'),
          setShouldAutoSync(false),
          setShouldShowAutoSyncWarningDialog(true)
        ]);
        return;
      }
      const deviceID = await getDeviceId();
      GlobalBleHandler.setID(deviceID);
      // keep trying connect to athlos device
      if (deviceID.length > 0) {
        const isBtEnabled = await BluetoothStatus.state();
        if (isBtEnabled) {
          GlobalBleHandler.scanAndConnect()
          .then((connected) => {
            setAthlosConnected(connected ? true : false);
          })
          .catch((e) => {
            console.log("error connecting to device: ", e);
            showSnackBar(`Error connecting to device. ${e.toString()}`);
          });
        } else {
          showSnackBar("Bluetooth must be on if you want to sync with your earbuds.");
        }
      }
      try {
        await updateLocalUserFitness(); // need both cuz of thresholds and nefforts 
        await updateLocalUserInfo(); // no promise.all to avoid race conditions with updating the state
      } catch(e) {
        console.log('error updating local user info after scanning and connecting: ', e);
      }
    }
    setUpApp()
      .then(() => {
        console.log("successfully set up app!");
      })
      .catch(e => {
        console.log("error in athlos use effect: ", e);
      })
    return () => {
      console.log("unmounting");
      LocationServicesDialogBox?.stopListener();
      BluetoothStatus.removeListener();
      GlobalBleHandler.destroy().then(() => {
        console.log("BLE manager destroyed. Reiniting...");
        GlobalBleHandler.reinit();
      });
    }
  }, []);

  // responds based on whether or not earbuds are connected
  React.useEffect(() => {
    const asyncConnectHandler = async () => {
      if (firstUpdate.current) {
        firstUpdate.current = false;
        return;
      }
      if (!athlosConnected) {
        showSnackBar("Athlos device disconnected. Trying to reconnect...", "long");
        return;
      }
      // earbuds are connected at this point
      try {
        console.log("athlos is connected in use effect")
        showSnackBar("Athlos device connected", "long");
        const shouldAutoSync = await getShouldAutoSync();
        const shouldShowAutoSyncWarningDialog = await getShouldShowAutoSyncWarningDialog();
        if (shouldAutoSync) {
          // let warning dialog box handle continuing to auto sync
          if (shouldShowAutoSyncWarningDialog) {
            setShowAutoSyncWarningModal(true);
            return;
          }
          await continueSync();
        }
      } catch(e) {
        console.log("error autosyncing: ", e);
        showSnackBar("Something went wrong with autosyncing. Please go to the sync page and manually sync.");
      }
    }
    asyncConnectHandler();
  }, [athlosConnected]);

  React.useEffect(() => {
    if (state._id.length > 0) {
      storeUserData(state);
    }
  }, [state]); // store the state in async storage every time it gets updated

  /**
   * Updates only the state and therefore local storage for the user's fitness data
   */
  const updateLocalUserFitness = async () => {
    const userActivityData: UserActivities = await getUserActivityData();
    var userData = await getUserData();
    if (!userData) {
      userData = state;
    }
    const newState = {
      ...userData,
      // NOTE THAT FITNESS ISN'T UPDATED. THIS SHOULD CHANGE
      jumpJson: {
        activityData: Object.values(userActivityData.jumps),
        action: FITNESS_CONTANTS.JUMP,
      },
      runJson: {
        activityData: Object.values(userActivityData.runs),
        action: FITNESS_CONTANTS.RUN,
      },
      swimJson: {
        activityData: Object.values(userActivityData.swims),
        action: FITNESS_CONTANTS.SWIM,
      },
      intervalJson: {
        activityData: Object.values(userActivityData.intervals),
        action: FITNESS_CONTANTS.HIIT,
      }
    };
    setState(newState);
  }

  // updates the state and therefore the context if the user info is suspected
  // to change. For example if the user changes their settings we want the new
  // settings to be applied automatically. 
  // DOES NOT UPDATE THE LOCAL USER FITNESS
  const updateLocalUserInfo = async (fromServer?: boolean, field?: string, value?: any) => {
    // get the user's information here from either local storage or database
    // make request to server to user information and set state
    var userToken = await getToken();
    var userData = await getUserData();
    if (!userToken) { // this means it's probably right after a login
      userToken = props.token; 
    }
    if (!userData || fromServer) { // not in async storage so probably first time or new phone
      var headers = new Headers();
      headers.append("authorization", `Bearer ${userToken}`);
      var res = await fetch(ENDPOINTS.getUserInfo, { method: "GET", headers });
      var userJson = await res.json();
      if (!userJson.success) {
        // console.log("get user info failed: ", userJson);
        Alert.alert(`Oh No :(`, "Something went wrong with the request to the server. Please refresh.", [{ text: "Okay" }]);
        return;
      } else {
        console.log("fetched user JSON!", userJson.profilePicture);
        const newState = {
          ...state,
          ...userJson,
          profilePicture: {
            ...userJson.profilePicture,
          },
          jumpJson: {
            ...state.jumpJson,
          },
          runJson: {
            ...state.runJson,
          },
          swimJson: {
            ...state.swimJson,
          },
          intervalJson: {
            ...state.intervalJson,
          }
        }
        console.log("new state: ", newState.profilePicture);
        setState(newState);
        if (fromServer) {
          await storeUserData(newState);
        }
      }
    } else {
      if (field) {
        const newState = {
          ...state,
        }
        newState[field] = value;
        setState(newState);
      }
    }
  }

  // const BottomTab = createBottomTabNavigator();
  const BottomTab = createMaterialBottomTabNavigator();
  return (
    <SafeAreaProvider>
      <UserDataContext.Provider value={state}>
        <AppFunctionsContext.Provider
          value={{
            setAppState: async (newFields: Object) => {
              // the state of the app might be stale if setState was called before this
              // function and the state wasn't fully updated yet...
              const newState = {
                ...state,
                ...newFields,
              }
              await storeUserData(newState);
              setState(newState);
            },
            updateLocalUserInfo,
            updateLocalUserFitness,
            syncProgress,
            shouldRefreshFitness,
            setShouldRefreshFitness,
            syncData,
            showAutoSyncWarningModal,
            setShowAutoSyncWarningModal,
          }}
        >
        { isLoading ? <LoadingSpin/> :
          <>
            <WelcomeModal
              isVisible={showWelcomeModal}
              setVisible={setShowWelcomeModal}
            />
            <AutoSyncWarningModal
              isVisible={showAutoSyncWarningModal}
              // do not show this modal again if user checks this box
              setOnCheck={async () => {
                
              }}
              setVisible={setShowAutoSyncWarningModal}
              continueSync={async (bool: boolean) => {
                // close the modal
                setShowAutoSyncWarningModal(bool);
                // continue on with the syncing
                await continueSync();
              }}
            />
            { !bluetoothOn ?
              <View style={{backgroundColor: 'red', height: 45, width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color: 'white', fontSize: 18}}>Bluetooth is off!</Text>
              </View>
              : null
            }
            <BottomTab.Navigator barStyle={{
              // backgroundColor: colors.header,
            }}>
              <BottomTab.Screen
                name={PROFILE}
                component={Profile}
                initialParams={{_id: state._id,}}
                options={{
                  tabBarIcon: ({ color }) => (
                    <MaterialCommunityIcons name="account" color={color} size={26} />
                    ),
                  }}
              />
              <BottomTab.Screen
                name={SYNC}
                options={{
                  tabBarIcon: ({ color }) => (
                    <Feather name="bluetooth" color={color} size={26} />
                  ),
                }}
              >
                {props => <SADataSync {...props} athlosConnected={athlosConnected}/>}
              </BottomTab.Screen>
              {/* <BottomTab.Screen name={COMMUNITY} component={Community} /> */}
              <BottomTab.Screen
                name={DEVICE_CONFIG}
                component={DeviceConfig}
                options={{
                  tabBarIcon: ({ color }) => (
                    <Ionicons name="options" color={color} size={26} />
                  ),
                }}
              />
            </BottomTab.Navigator>
          </>
        }
        </AppFunctionsContext.Provider>
      </UserDataContext.Provider>
    </SafeAreaProvider>
  )
}

export default Athlos;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center'
  },
});