import * as React from 'react';
import { Text, View, StyleSheet, Alert, ScrollView, SafeAreaView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  getData,
  getDeviceId,
  setDeviceId,
  storeDataObj,
  getDataObj,
  needsFitnessUpdate,
  setNeedsFitnessUpdate,
  getFirstTimeLogin,
  setFirstTimeLogin,
} from '../utils/storage';
import ENDPOINTS from "../endpoints";
import {
  getLastMonday,
  getNextSunday,
  parseDate,
  sameDate,
} from "../utils/dates";
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

function Athlos(props) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false); // controls when to set an error screen
  // const [rivals, setRivals] = React.useState([]);
  // const [rivalsPending, setRivalsPending] = React.useState([]);
  // const [rivalRequests, setRivalRequests] = React.useState([]);

  // const [followers, setFollowers] = React.useState([]);
  // const [followerRequests, setFollowerRequests] = React.useState([]);

  // const [following, setFollowing] = React.useState([]);
  // const [followingPending, setFollowingPending] = React.useState([]);
  const [showWelcomeModal, setShowWelcomeModal] = React.useState(false);
  const [state, setState] = React.useState({
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
    deviceID: "",
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
    const setUpApp = async () => {
      // await GlobalBleHandler.destroy();
      // GlobalBleHandler.reinit();
      console.log("Athlos component using effect");
      setIsLoading(true);
      // first check if info is in Async storage
      const token = await getData();
      const userData = await getDataObj();
      console.log("user data: ", userData);
      if (!token) {
        console.log("This is weird. Somehow log them out and redirect to login page")
      }
      if (userData && userData._id.length > 0) {
        console.log("there is valid data is async storage");
        // console.log("setting state in beginning of use effect: ", userData);
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
        GlobalBleHandler.setID(userData ? userData.deviceID : "");
        await setFirstTimeLogin();
        return;
      }
      const deviceID = userData ? userData.deviceID : state.deviceID;
      GlobalBleHandler.setID(deviceID);
      try {
        await GlobalBleHandler.scanAndConnect();
        await GlobalBleHandler.uploadToServer();
        console.log("successfully read and saved sadata bytes");
      } catch(e) {
        console.log("error scanning and connecting: ", e);
      }
      try {
        console.log("updating local user fitness after scan and connect finishes in athlos component");
        await updateLocalUserFitness(); 
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
      GlobalBleHandler.destroy().then(() => {console.log("destroyed")});
      GlobalBleHandler.reinit();
    }
  }, []);
  console.log("last monday: ", getLastMonday());
  console.log("next sunday: ", getNextSunday());

  React.useEffect(() => {
    // console.log("use effect with state: ", state);
    if (state._id.length > 0) {
      storeDataObj(state);
      GlobalBleHandler.setID(state.deviceID);
    }
  }, [state]); // store the state in async storage every time it gets updated

  // Keeps the past 26 weeks of activity data updated. Only query the missing weeks of data.
  const getActivityJson = async (activity, lastUpdated) => {
    // If it's completely updated, then don't do anything
    const lastMonday = getLastMonday();
    const needsThisWeekData = await needsFitnessUpdate();
    if (sameDate(lastUpdated, lastMonday) && !needsThisWeekData) {
      console.log("fitness already fully updated: ", parseDate(lastUpdated));
      return {
        success: true,
        activityData: [] // no additional activityData to append
      };
    }
    var headers = new Headers();
    var token = await getData();
    if (!token) { token = props.token; }
    headers.append("authorization", `Bearer ${token}`);
    headers.append("activity", activity);
    headers.append("last_updated", lastUpdated.getTime().toString()); // apparently the backend can't handle camel case with middleware

    var res = await fetch(ENDPOINTS.getData, {
      method: "GET",
      headers: headers,
    })
    var additionalActivityData = await res.json();
    if (!additionalActivityData.success) {
      throw new Error(additionalActivityData.message);
    }
    return additionalActivityData;
  }

  /**
   * Updates only the state and therefore local storage for the user's fitness data
   */
  const updateLocalUserFitness = async () => {
    const today = new Date();
    var userData = await getDataObj();
    if (!userData) {
      userData = state;
    }
    // console.log("updating local user fitness: ", userData);
    // console.log("state in local user fitness: ", state);
    const lastMonday = getLastMonday(today);
    const halfYearAgo = new Date();
    halfYearAgo.setDate(lastMonday.getDate() - NUM_WEEKS_IN_PAST * 7); // make sure its from that monday
    // figure out the latest locally updated week. Assume jumpJson, swimJson, runJson are accurate
    var lastJumpUpdated;
    if (userData && userData.jumpJson && userData.jumpJson.activityData.length > 0) {
      lastJumpUpdated = new Date(userData.jumpJson.activityData[0][0].uploadDate); // get upload date of the monday of most recent week
      lastJumpUpdated = lastJumpUpdated < halfYearAgo ? new Date(halfYearAgo) : lastJumpUpdated;
      lastJumpUpdated.setHours(0,0,0,0);
    } else {
      // if userData does not exist, then get the Monday 26 weeks ago and start from there
      lastJumpUpdated = new Date(halfYearAgo);
    }
    var lastSwimUpdated;
    if (userData && userData.swimJson && userData.swimJson.activityData.length > 0) {
      lastSwimUpdated = new Date(userData.swimJson.activityData[0][0].uploadDate);
      lastSwimUpdated = lastSwimUpdated < halfYearAgo ? new Date(halfYearAgo) : lastSwimUpdated;
      lastSwimUpdated.setHours(0,0,0,0);
    } else {
      lastSwimUpdated = new Date(halfYearAgo);
    }
    var lastRunUpdated;
    if (userData && userData.runJson && userData.runJson.activityData.length > 0) {
      console.log("user data does exist!");
      lastRunUpdated = new Date(userData.runJson.activityData[0][0].uploadDate);
      lastRunUpdated = lastRunUpdated < halfYearAgo ? new Date(halfYearAgo) : lastRunUpdated;
      lastRunUpdated.setHours(0,0,0,0);
    } else {
      console.log("user data does not exist!");
      lastRunUpdated = new Date(halfYearAgo);
    }
    // dates to get activity data from and onwards
    // console.log("jump monday: ", lastJumpUpdated.getMonth(), lastJumpUpdated.getDate());
    // console.log("swim monday: ", lastSwimUpdated.getMonth(), lastSwimUpdated.getDate());
    // console.log("run  monday: ", lastRunUpdated.getMonth(), lastRunUpdated.getDate());
    var [additionalJumpData, additionalSwimData, additionalRunData] = await Promise.all([
      getActivityJson("jump", lastJumpUpdated),
      getActivityJson("swim", lastSwimUpdated),
      getActivityJson("run",  lastRunUpdated)
    ]);
    // console.log("more jumps: ", additionalJumpData.activityData[0]);
    // console.log("more swims: ", additionalSwimData.activityData[0]);
    // console.log("more runs: ", additionalRunData.activityData[0]);
    var gotAllInfo = additionalJumpData.success && additionalSwimData.success && additionalRunData.success;
    if (gotAllInfo) {
      console.log("successfully got all user fitness");
      // console.log(additionalJumpData.activityData.length, additionalRunData.activityData.length, additionalSwimData.activityData.length);
      const newState = {
        ...userData,
        // NOTE THAT FITNESS ISN'T UPDATED. THIS SHOULD CHANGE
        jumpJson: {
          ...userData.jumpJson,
          activityData: updateActivityData(userData.jumpJson.activityData, additionalJumpData.activityData)
        },
        runJson: {
          ...userData.runJson,
          activityData: updateActivityData(userData.runJson.activityData, additionalRunData.activityData)
        },
        swimJson: {
          ...userData.swimJson,
          activityData: updateActivityData(userData.swimJson.activityData, additionalSwimData.activityData)
        },
      }
      // console.log("setting state in update local fitness: ", newState);
      setState(newState);
      await setNeedsFitnessUpdate(false);
    } else {
      console.log("additional swim data: ", additionalSwimData);
      console.log("additional run data: ", additionalRunData);
      console.log("additional jump data: ", additionalJumpData);
      throw new Error("failed to get all user info");
    }
  }

  // remember index 0 is most recent data
  const updateActivityData = (prevActivityData, additionalActivityData) => {
    // console.log("prev activity data: ", prevActivityData);
    // console.log("new activity data: ", additionalActivityData);
    if (additionalActivityData.length === 0) {
      return prevActivityData;
    }
    if (prevActivityData.length === 0) {
      return additionalActivityData.slice(0, NUM_WEEKS_IN_PAST);
    }
    if (additionalActivityData.length > NUM_WEEKS_IN_PAST) {
      console.log("additional data larger than 26: ", additionalActivityData.length);
      additionalActivityData.splice(
        NUM_WEEKS_IN_PAST, // take off anything at index 26 (num_Weeks_in_past) and beyond
        additionalActivityData.length, // fine if it's an overestimate
      ) // remove the necessary amount to get 26 week entries
    }
    const newActivityData = [];
    additionalActivityData.forEach((week, idx) => {
      newActivityData.push(week);
    });
    const mondayDate = newActivityData[newActivityData.length - 1][0].uploadDate;
    // for the remaining weeks in the prev activity data, only add weeks that are older than mondayDate
    var idxToStartAddingFrom = 0;
    var currMondayDate = prevActivityData[0][0].uploadDate;
    console.log(currMondayDate, newActivityData.length);
    while (mondayDate <= currMondayDate) {
      idxToStartAddingFrom += 1;
      console.log(currMondayDate, idxToStartAddingFrom);
      currMondayDate = prevActivityData[idxToStartAddingFrom][0].uploadDate;
    }
    console.log(idxToStartAddingFrom);
    console.log(NUM_WEEKS_IN_PAST - newActivityData.length);
    const newWeeksAddedSoFar = newActivityData.length;
    for (let i = 0; i < NUM_WEEKS_IN_PAST - newWeeksAddedSoFar; i++) {
      newActivityData.push(prevActivityData[i + idxToStartAddingFrom]);
    }
    console.log(newActivityData.length);
    return newActivityData;
  }

  // updates the state and therefore the context if the user info is suspected
  // to change. For example if the user changes their settings we want the new
  // settings to be applied automatically. For now only used for settings.
  // DOES NOT UPDATE THE LOCAL USER FITNESS
  const updateLocalUserInfo = async () => {
    // get the user's information here from database
    // make request to server to user information and set state
    var userToken = await getData();
    var userData = await getDataObj();
    if (!userToken) { // this means it's probably right after a login
      userToken = props.token; 
    }
    if (!userData) {
      userData = state;
    }
    var headers = new Headers();
    headers.append("authorization", `Bearer ${userToken}`);
    var res = await fetch(ENDPOINTS.getUserInfo, { method: "GET", headers });
    var userJson = await res.json();
    if (!userJson.success) {
      console.log("get user info failed: ", userJson);
      Alert.alert(`Oh No :(`, "Something went wrong with the request to the server. Please refresh.", [{ text: "Okay" }]);
      return;
    } else {
      console.log("successfully got all user info");
      const newState = {
        ...userData,
        ...userJson,
        jumpJson: {
          ...userData.jumpJson,
        },
        runJson: {
          ...userData.runJson,
        },
        swimJson: {
          ...userData.swimJson,
        },
      }
      // console.log("setting state in update localuser info: ", newState);
      setState(newState);
    }
  }

  const BottomTab = createBottomTabNavigator();
  console.log("Athlos context: ", state);
  if (isError) {
    return (<View><Text>shit something went wrong with the server :(</Text></View>)
  }
  return (
    <UserDataContext.Provider value={state}>
      <AppFunctionsContext.Provider
        value={{
          setAppState: async (newState) => {
            setState(newState);
            storeDataObj(newState);
          },
          updateLocalUserInfo,
          updateLocalUserFitness,
        }}
      >
      { isLoading ? <View style={styles.container}><LoadingSpin/></View> : 
        <>
          <WelcomeModal
            isVisible={showWelcomeModal}
            setVisible={setShowWelcomeModal}
          />
          <BottomTab.Navigator>
            {/* <BottomTab.Screen name={HOME} component={Home} /> */}
            {/* <BottomTab.Screen name={PROFILE}>
              {props => <Profile {...props} initialId={state._id}/>}
            </BottomTab.Screen> */}
            <BottomTab.Screen name={PROFILE} component={Profile} initialParams={{_id: state._id,}} />
            {/* <BottomTab.Screen name={FITNESS} component={Fitness} initialParams={{_id: state._id,}} /> */}
            {/* something like this for passing the navigation props and other props too */}
            {/* <Stack.Screen name={COMMUNITY_CONSTANTS.COMMUNITY}>
              {(props) => <CommunityNav {...props} />}
            </Stack.Screen> */}
            {/* <BottomTab.Screen name={SETTINGS} component={Settings} /> */}
            {/* <BottomTab.Screen name={COMMUNITY} component={Community} /> */}
            <BottomTab.Screen name={DEVICE_CONFIG} component={DeviceConfig} />
            <BottomTab.Screen name={SYNC} component={SADataSync} />
          </BottomTab.Navigator>
        </>
      }
      </AppFunctionsContext.Provider>
    </UserDataContext.Provider>
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