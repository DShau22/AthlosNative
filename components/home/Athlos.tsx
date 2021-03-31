import * as React from 'react';
import { Text, View, StyleSheet, Alert, DeviceEventEmitter, } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";

const { DateTime } = require('luxon');
import {
  getToken,
  getShouldAutoSync,
  setShouldAutoSync,
  storeUserData,
  getUserData,
  getFirstTimeLogin,
  setFirstTimeLogin,
  getDeviceId,
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
import Community from "../community/Community";
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
import {
  RunSchema,
  SwimSchema,
  JumpSchema,
} from '../fitness/data/UserActivities';
interface UserDataInterface {
  _id: string,
  friends: Array<any>,
  friendRequests: Array<any>,
  friendsPending: Array<any>,

  rivals: Array<any>,
  rivalsPending: Array<any>,
  rivalRequests: Array<any>,

  followers: Array<any>,
  followerRequests: Array<any>,

  following: Array<any>,
  followingPending: Array<any>,

  firstName: string,
  lastName: string,
  username: string,
  gender: string,
  bio: string,
  height: string,
  weight: string,
  age: string,
  profilePicture: string,
  settings: Object,
  numFriendsDisplay: number,
  goals: {
    goalSteps: number,
    goalLaps: number,
    goalVertical: number,
    goalCaloriesBurned: number,
    goalWorkoutTime: number,
  },
  jumpJson: {
    activityData: Array<JumpSchema>,
    action: string,
  },
  runJson: {
    activityData: Array<RunSchema>,
    action: string,
  },
  swimJson: {
    activityData: Array<SwimSchema>,
    action: string,
  },
}

interface AthlosInterface {
  token: string,
};
const Athlos: React.FC<AthlosInterface> = (props) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [athlosConnected, setAthlosConnected] = React.useState<boolean>(false);

  const firstUpdate = React.useRef(true);

  // const [rivals, setRivals] = React.useState([]);
  // const [rivalsPending, setRivalsPending] = React.useState([]);
  // const [rivalRequests, setRivalRequests] = React.useState([]);

  // const [followers, setFollowers] = React.useState([]);
  // const [followerRequests, setFollowerRequests] = React.useState([]);

  // const [following, setFollowing] = React.useState([]);
  // const [followingPending, setFollowingPending] = React.useState([]);
  const [showWelcomeModal, setShowWelcomeModal] = React.useState<boolean>(false);
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
    settings: {},
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
  });
  // setting up the Athlos app
  React.useEffect(() => {
    console.log("setting up app")
    const setUpApp = async () => {
      GlobalBleHandler.addSetConnectedFunction(setAthlosConnected);
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
        await Promise.all([setFirstTimeLogin(), setShouldAutoSync(false)]);
        return;
      }
      const deviceID = await getDeviceId();
      GlobalBleHandler.setID(deviceID);
      // keep trying connect to athlos device
      if (deviceID.length > 0) {
        GlobalBleHandler.scanAndConnect()
          .then((connected) => {
            setAthlosConnected(connected ? true : false);
          })
          .catch((e) => {
            console.log("error connecting to device: ", e);
          });
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
      LocationServicesDialogBox.stopListener();
      GlobalBleHandler.destroy().then(() => {
        console.log("BLE manager destroyed. Reiniting...");
        GlobalBleHandler.reinit();
      });
    }
  }, []);

  // responds based on whether or not earbuds are connected
  React.useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    if (athlosConnected) {
      console.log("athlos is connected in use effect")
      showSnackBar("Athlos device connected. Auto syncing...", "long");
      getShouldAutoSync()
        .then((shouldAutoSync) => {
          if (shouldAutoSync) {
            return GlobalBleHandler.readActivityData();
          }
        })
        .then((bytesRead) => {
          console.log("read activity data promise resolved. BytesRead: ", bytesRead);
          if (bytesRead <= 8) {
            showSnackBar("Activities already updated.");
          } else if (bytesRead !== undefined) {
            showSnackBar("Activities successfully synced!");
          }
        })
        .catch(e => {
          console.log("error autosyncing: ", e);
          showSnackBar("Something went wrong with autosyncing. Please go to the sync page and manually sync.");
        });
    } else {
      showSnackBar("Athlos device disconnected. Trying to reconnect...", "long");
    }
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
    };
    setState(newState);
  }

  // updates the state and therefore the context if the user info is suspected
  // to change. For example if the user changes their settings we want the new
  // settings to be applied automatically. For now only used for settings.
  // DOES NOT UPDATE THE LOCAL USER FITNESS
  const updateLocalUserInfo = async () => {
    // get the user's information here from either local storage or database
    // make request to server to user information and set state
    var userToken = await getToken();
    var userData = await getUserData();
    if (!userToken) { // this means it's probably right after a login
      userToken = props.token; 
    }
    if (!userData) { // not in async storage so probably first time or new phone
      var headers = new Headers();
      headers.append("authorization", `Bearer ${userToken}`);
      var res = await fetch(ENDPOINTS.getUserInfo, { method: "GET", headers });
      var userJson = await res.json();
      if (!userJson.success) {
        // console.log("get user info failed: ", userJson);
        Alert.alert(`Oh No :(`, "Something went wrong with the request to the server. Please refresh.", [{ text: "Okay" }]);
        return;
      } else {
        // console.log("successfully got all user info");
        const newState = {
          ...state,
          ...userJson,
          jumpJson: {
            ...state.jumpJson,
          },
          runJson: {
            ...state.runJson,
          },
          swimJson: {
            ...state.swimJson,
          },
        }
        // console.log("setting state in update localuser info: ", newState);
        setState(newState);
      }
    } else {
      setState(userData);
    }
  }

  // const BottomTab = createBottomTabNavigator();
  const BottomTab = createMaterialBottomTabNavigator();
  // console.log("Athlos context: ", state);
  return (
    <SafeAreaProvider>
      <UserDataContext.Provider value={state}>
        <AppFunctionsContext.Provider
          value={{
            setAppState: async (newState) => {
              setState(newState);
              storeUserData(newState);
            },
            updateLocalUserInfo,
            updateLocalUserFitness,
          }}
        >
        { isLoading ? <LoadingSpin/> :
          <SafeAreaView style={{flex: 1}}>
            <WelcomeModal
              isVisible={showWelcomeModal}
              setVisible={setShowWelcomeModal}
            />
            <BottomTab.Navigator barStyle={{
              // backgroundColor: colors.header,
            }}>
              {/* <BottomTab.Screen name={HOME} component={Home} /> */}
              {/* <BottomTab.Screen name={PROFILE}>
                {props => <Profile {...props} initialId={state._id}/>}
              </BottomTab.Screen> */}
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
              {/* <BottomTab.Screen name={FITNESS} component={Fitness} initialParams={{_id: state._id,}} /> */}
              {/* something like this for passing the navigation props and other props too */}
              {/* <Stack.Screen name={COMMUNITY_CONSTANTS.COMMUNITY}>
                {(props) => <CommunityNav {...props} />}
              </Stack.Screen> */}
              {/* <BottomTab.Screen name={SETTINGS} component={Settings} /> */}
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
          </SafeAreaView>
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