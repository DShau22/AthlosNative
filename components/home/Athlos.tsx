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
  needsFitnessUpdate,
  setNeedsFitnessUpdate,
  getFirstTimeLogin,
  setFirstTimeLogin,
  getDeviceId,
} from '../utils/storage';
import ENDPOINTS from "../endpoints";
import {
  getLastMonday,
  getNextSunday,
  sameDate,
} from "../utils/dates";
import {
  requestLocationPermission,
  requestLocationServices
} from '../utils/permissions';
import {
  UserActivities
} from '../fitness/data/UserActivities';
import {
  getUserActivityData,
  updateActivityData,
} from '../fitness/data/localStorage';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
MaterialCommunityIcons.loadFont();
import Ionicons from 'react-native-vector-icons/Ionicons';
Ionicons.loadFont();
import Feather from 'react-native-vector-icons/Feather';
Feather.loadFont();

import { showSnackBar } from '../utils/notifications';
import BLUETOOTH_CONSTANTS from '../bluetooth/BluetoothConstants';
const {STOP_SCAN_ERR} = BLUETOOTH_CONSTANTS;
import LoadingSpin from '../generic/LoadingSpin';
import Fitness from "../fitness/Fitness";
import { UserDataContext, AppFunctionsContext } from "../../Context";
import Home from "./Home";
import Settings from "../settings/Settings";
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
const {
  NUM_WEEKS_IN_PAST
} = FITNESS_CONTANTS;
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
  const [isError, setIsError] = React.useState<boolean>(false); // controls when to set an error screen
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
          setIsError(true);
          Alert.alert(`Oh No :(`, "Something went wrong with the connection to the server. Please refresh.", [{ text: "Okay" }]);
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
        showSnackBar("Searching for your Athlos device...", "long");
        GlobalBleHandler.scanAndConnect()
          .then(() => {
            console.log("found athlos device");
            setAthlosConnected(true);
          })
          .catch((e) => {
            console.log("error connecting to device: ", e);
          });
      }
      // if ((await getShouldAutoSync())) {
      //   try {
      //     showSnackBar("Auto-syncing...", 'length_long', "Okay");
      //     await GlobalBleHandler.scanAndConnect();
      //     await GlobalBleHandler.setUpNotifyListener();
      //     console.log("successfully read and saved sadata bytes");
      //     await GlobalBleHandler.uploadToServer();
      //     showSnackBar("Successfully auto-synced with your Athlos earbuds. Your activity records should be ready in a minute :]");
      //   } catch(e) {
      //     console.log("error scanning and connecting: ", e);
      //     if (e === STOP_SCAN_ERR) {
      //       showSnackBar("Stopped auto-syncing", 'length_long');
      //     } else {
      //       showSnackBar("Failed to auto-sync with your Athlos earbuds. ", e);
      //     }
      //   }
      // }
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
      GlobalBleHandler.destroy().then(() => {console.log("destroyed")});
      GlobalBleHandler.reinit();
    }
  }, []);

  React.useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    if (athlosConnected) {
      showSnackBar("Athlos device connected!", "long");
    } else {
      showSnackBar("Athlos device disconnected. Trying to reconnect...", "long");
    }
  }, [athlosConnected]);

  React.useEffect(() => {
    // console.log("use effect with state: ", state);
    if (state._id.length > 0) {
      storeUserData(state);
    }
  }, [state]); // store the state in async storage every time it gets updated

  // Keeps the past 26 weeks of activity data updated. Only query the missing weeks of data.
  const getActivityJson = async (activity, lastUpdated) => {
    // If it's completely updated, then don't do anything
    const lastMonday = getLastMonday();
    const needsThisWeekData = await needsFitnessUpdate();
    // console.log(activity, " last updated: ", lastUpdated);
    // console.log("last monday: ", lastMonday);
    // console.log("needs fitness update: ", needsThisWeekData);
    if (sameDate(lastUpdated, lastMonday) && !needsThisWeekData) {
      // console.log("fitness already fully updated. Last updated: ", lastUpdated);
      return {
        success: true,
        activityData: [] // no additional activityData to append
      };
    }
    const token = await getToken();
    const res = await Axios.post(ENDPOINTS.getUserFitness, {
      userToken: token,
      activity,
      lastUpdated: lastUpdated.toISO(),
      userToday: DateTime.local().toISO(), // use the zone rn because if last updated was b4 DST it'll be off for server
    });
    const additionalActivityData = res.data;
    if (!additionalActivityData.success) {
      throw new Error(additionalActivityData.message);
    }
    return additionalActivityData;
  }

  /**
   * Updates only the state and therefore local storage for the user's fitness data
   */
  const updateLocalUserFitness = async () => {
    const userActivityData: UserActivities = await getUserActivityData();
    // console.log("setting state in update local fitness: ", newState);
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
    // // console.log("updating local user fitness: ", userData);
    // // console.log("state in local user fitness: ", state);
    // const halfYearAgo = getLastMonday().minus({day: NUM_WEEKS_IN_PAST * 7}).set({
    //   hour: 0, minute: 0, second: 0, millisecond: 0
    // });
    // // figure out the latest locally updated week. Assume jumpJson, swimJson, runJson are accurate
    // var lastJumpUpdated;
    // if (userData && userData.jumpJson && userData.jumpJson.activityData.length > 0) {
    //   lastJumpUpdated = DateTime.fromISO(userData.jumpJson.activityData[0][0].uploadDate); // get upload date of the monday of most recent week
    //   lastJumpUpdated = lastJumpUpdated < halfYearAgo ? DateTime.fromISO(halfYearAgo.toISO()) : lastJumpUpdated;
    //   lastJumpUpdated.set({
    //     hour: 0, minute: 0, second: 0, millisecond: 0
    //   });
    // } else {
    //   // if userData does not exist, then get the Monday 26 weeks ago and start from there
    //   lastJumpUpdated = DateTime.fromISO(halfYearAgo.toISO());
    // }
    // var lastSwimUpdated;
    // if (userData && userData.swimJson && userData.swimJson.activityData.length > 0) {
    //   lastSwimUpdated = DateTime.fromISO(userData.swimJson.activityData[0][0].uploadDate);
    //   lastSwimUpdated = lastSwimUpdated < halfYearAgo ? DateTime.fromISO(halfYearAgo.toISO()) : lastSwimUpdated;
    //   lastSwimUpdated.set({
    //     hour: 0, minute: 0, second: 0, millisecond: 0
    //   });
    // } else {
    //   lastSwimUpdated = DateTime.fromISO(halfYearAgo.toISO());
    // }
    // var lastRunUpdated;
    // if (userData && userData.runJson && userData.runJson.activityData.length > 0) {
    //   // console.log("user data does exist!");
    //   lastRunUpdated = DateTime.fromISO(userData.runJson.activityData[0][0].uploadDate);
    //   lastRunUpdated = lastRunUpdated < halfYearAgo ? DateTime.fromISO(halfYearAgo.toISO()) : lastRunUpdated;
    //   lastRunUpdated.set({
    //     hour: 0, minute: 0, second: 0, millisecond: 0
    //   });
    // } else {
    //   // console.log("user data does not exist!");
    //   lastRunUpdated = DateTime.fromISO(halfYearAgo.toISO());
    // }
    // // dates to get activity data from and onwards
    // // console.log("jump monday: ", lastJumpUpdated.getMonth(), lastJumpUpdated.getDate());
    // // console.log("swim monday: ", lastSwimUpdated.getMonth(), lastSwimUpdated.getDate());
    // // console.log("run  monday: ", lastRunUpdated.getMonth(), lastRunUpdated.getDate());
    // var [additionalJumpData, additionalSwimData, additionalRunData] = await Promise.all([
    //   getActivityJson("jump", lastJumpUpdated),
    //   getActivityJson("swim", lastSwimUpdated),
    //   getActivityJson("run",  lastRunUpdated)
    // ]);
    // // console.log("more jumps: ", additionalJumpData.activityData[0]);
    // // console.log("more swims: ", additionalSwimData.activityData[0]);
    // // console.log("more runs: ", additionalRunData.activityData[0]);
    // var gotAllInfo = additionalJumpData.success && additionalSwimData.success && additionalRunData.success;
    // if (gotAllInfo) {
    //   // console.log("successfully got all user fitness");
    //   // console.log(additionalJumpData.activityData.length, additionalRunData.activityData.length, additionalSwimData.activityData.length);
    //   const newState = {
    //     ...userData,
    //     // NOTE THAT FITNESS ISN'T UPDATED. THIS SHOULD CHANGE
    //     jumpJson: {
    //       ...userData.jumpJson,
    //       activityData: updateActivityData(userData.jumpJson.activityData, additionalJumpData.activityData)
    //     },
    //     runJson: {
    //       ...userData.runJson,
    //       activityData: updateActivityData(userData.runJson.activityData, additionalRunData.activityData)
    //     },
    //     swimJson: {
    //       ...userData.swimJson,
    //       activityData: updateActivityData(userData.swimJson.activityData, additionalSwimData.activityData)
    //     },
    //   }
    //   // console.log("setting state in update local fitness: ", newState);
    //   setState(newState);
    //   await setNeedsFitnessUpdate(false);
    // } else {
    //   // console.log("additional swim data: ", additionalSwimData);
    //   // console.log("additional run data: ", additionalRunData);
    //   // console.log("additional jump data: ", additionalJumpData);
    //   throw new Error("failed to get all user info");
    // }
  }

  // // remember index 0 is most recent data
  // const updateActivityData = (prevActivityData, additionalActivityData) => {
  //   // console.log("prev activity data: ", prevActivityData);
  //   // console.log("new activity data: ", additionalActivityData);
  //   if (additionalActivityData.length === 0) {
  //     return prevActivityData;
  //   }
  //   if (prevActivityData.length === 0) {
  //     return additionalActivityData.slice(0, NUM_WEEKS_IN_PAST);
  //   }
  //   if (additionalActivityData.length > NUM_WEEKS_IN_PAST) {
  //     // console.log("additional data larger than 26: ", additionalActivityData.length);
  //     additionalActivityData.splice(
  //       NUM_WEEKS_IN_PAST, // take off anything at index 26 (num_Weeks_in_past) and beyond
  //       additionalActivityData.length, // fine if it's an overestimate
  //     ) // remove the necessary amount to get 26 week entries
  //   }
  //   const newActivityData = [];
  //   additionalActivityData.forEach((week, idx) => {
  //     newActivityData.push(week);
  //   });
  //   const mondayDate = newActivityData[newActivityData.length - 1][0].uploadDate;
  //   // for the remaining weeks in the prev activity data, only add weeks that are older than mondayDate
  //   var idxToStartAddingFrom = 0;
  //   var currMondayDate = prevActivityData[0][0].uploadDate;
  //   // console.log(currMondayDate, newActivityData.length);
  //   while (mondayDate <= currMondayDate) {
  //     idxToStartAddingFrom += 1;
  //     // console.log(currMondayDate, idxToStartAddingFrom);
  //     currMondayDate = prevActivityData[idxToStartAddingFrom][0].uploadDate;
  //   }
  //   // console.log(idxToStartAddingFrom);
  //   // console.log(NUM_WEEKS_IN_PAST - newActivityData.length);
  //   const newWeeksAddedSoFar = newActivityData.length;
  //   for (let i = 0; i < NUM_WEEKS_IN_PAST - newWeeksAddedSoFar; i++) {
  //     newActivityData.push(prevActivityData[i + idxToStartAddingFrom]);
  //   }
  //   // console.log(newActivityData.length);
  //   return newActivityData;
  // }

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
  if (isError) {
    return (<View><Text>shit something went wrong with the server :(</Text></View>)
  }
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
        { isLoading ? <View style={styles.container}><LoadingSpin/></View> : 
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