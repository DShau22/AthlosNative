import * as React from 'react';
import { Text, View, StyleSheet, Alert, ScrollView, SafeAreaView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Header } from 'react-native-elements';

import {
  getData,
  storeData,
  storeDataObj,
  getDataObj
} from '../utils/storage';
import ENDPOINTS from "../endpoints"
import {
  getBests,
  getProfile,
  getUsername
} from "../utils/userInfo"
import {
  getLastMonday,
  getNextSunday,
  parseDate,
  sameDate,
} from "../utils/dates"
import LoadingSpin from '../generic/LoadingSpin';
import Fitness from "../fitness/Fitness";
import { UserDataContext, AppFunctionsContext } from "../../Context"
import Home from "./Home"
import Settings from "../settings/Settings"
import Community from "../community/Community"
import Profile from '../profile/Profile'
import DeviceConfig from '../configure/DeviceConfig'

import GLOBAL_CONSTANTS from '../GlobalConstants'
const {
  HOME,
  FITNESS,
  COMMUNITY,
  SETTINGS,
  PROFILE,
  DEVICE_CONFIG,
} = GLOBAL_CONSTANTS
import FITNESS_CONTANTS from '../fitness/FitnessConstants'

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

  const [state, setState] = React.useState({
    headerText: 'Home',
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
    logout: false,
    // socket: null,
    notification: null,
    mounted: false,
    friendTableRows: [],
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
  
  React.useEffect(() => {
    const prepareData = async () => {
      console.log("Athlos component using effect")
      setIsLoading(true);
      // set up the web socket connection to server
      // var socket = await this.setUpSocket()

      // first check if info is in Async storage
      const token = await getData();
      const userData = await getDataObj();
      if (!token) {
        console.log("This is weird. Somehow log them out and redirect to login page")
      }
      if (userData) {
        console.log("there is data is async storage")
        setState(userData);
        setIsLoading(false);
        return;
      }

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
    prepareData();
  }, []);

  // setUpSocket() {
  //   var prom = new Promise(async (resolve, reject) => {
  //     // send request to get decoded user ID
  //     var userToken = getToken()
  //     var headers = new Headers()
  //     headers.append("authorization", `Bearer ${userToken}`)
  //     var response = await fetch(ENDPOINTS.tokenToID, { method: "GET", headers })
  //     var json = await response.json()
  //     var { userID } = json

  //     // establish socket connection and send socket ID, userID
  //     var data = { userID }
  //     var connectionOptions = {
  //       'sync disconnect on unload':false
  //     }
  //     var socket = io.connect(serverURL, connectionOptions)

  //     // send userID after socket connects
  //     socket.on("connect", () => {
  //       socket.emit("sendUserID", data)
  //       // put socket is session storage
  //     })

  //     socket.on('receiveFriendRequest', (data) => {
  //       alert("got friend request!")
  //       console.log(data)
  //       this.setState({
  //         notification: "!"
  //       })
  //     })

  //     socket.on("newFriend", (data) => {
  //       alert("got new friend")
  //       console.log(data)
  //       this.setState({
  //         notification: "***"
  //       })
  //     })

  //     socket.on("logoutClient", (data) => {
  //       // data should contain the socketID that did the logging out
  //       // socket should have also been disconnected by the server
  //       var { logoutSocketID } = data
  //       console.log(logoutSocketID)
  //       if (socket.id !== logoutSocketID) {
  //         alert("You have been logged out from another tab or browser")
  //       }
  //       // remove user token
  //       removeFromLocalStorage(storageKey)
  //       removeFromSessionStorage(storageKey)
  //       // remove socket id from session storage
  //       this.setState({
  //         isLoading: true,
  //         logout: true,
  //       });
  //       this.props.history.push("/")
  //     })
  //     resolve(socket)
  //   })
  //   return prom
  // }

  // Keeps the past 26 weeks of activity data updated. Only query the missing weeks of data.
  const getActivityJson = async (activity, lastUpdated) => {
    // If it's completely updated, then don't do anything
    const lastMonday = getLastMonday();
    if (sameDate(lastUpdated, lastMonday)) {
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

  // updates the state and therefore the context if the user info is suspected
  // to change. For example if the user changes their settings we want the new
  // settings to be applied automatically. For now only used for settings.

  // RUN THIS EVERY NOW AND THEN. PROBABLY SHOULD UPDATE STATE/CONTEXT
  // LOCALL, SAVE TO ASYNC STORAGE, AND THEN USE THIS TO SEND TO DATABASE

  // HAVE A METHOD THAT RUNS AND JUST UPDATES DATABASE AFTER USER SAVES
  // ANYTHING SUBSTANTIAL LIKE SETTINGS OR THEY SYNC WITH EARBUDS
  const updateLocalUserInfo = async () => {
    // get the user's information here from database
    // make request to server to user information and set state
    var userToken = await getData();
    if (!userToken) { // this means it's probably right after a login
      userToken = props.token; 
    }
    var headers = new Headers();
    headers.append("authorization", `Bearer ${userToken}`);
    var res = await fetch(ENDPOINTS.getUserInfo, { method: "GET", headers });
    var userJson = await res.json();
    if (!userJson.success) {
      console.log("get user info failed: ", userJson);
      Alert.alert(`Oh No :(`, "Something went wrong with the request to the server. Please refresh.", [{ text: "Okay" }]);
      return;
    }

    // GET USER FITNESS. These should get the last 26 weeks of tracked data
    const today = new Date();
    const userData = await getDataObj();
    const lastMonday = getLastMonday(today);
    const halfYearAgo = new Date();
    halfYearAgo.setDate(lastMonday.getDate() - 26 * 7); // make sure its from that monday
    // console.log("last Monday:", lastMonday.getMonth(), lastMonday.getDate(), lastMonday.getFullYear());
    // console.log("half year ago:", halfYearAgo.getMonth(), halfYearAgo.getDate(), halfYearAgo.getFullYear());
    // figure out the latest locally updated week. Assume jumpJson, swimJson, runJson are accurate
    var lastJumpUpdated = new Date();
    if (userData && userData.jumpJson && userData.jumpJson.activityData.length > 0) {
      lastJumpUpdated = new Date(userData.jumpJson.activityData[0][0].uploadDate); // get upload date of the monday of most recent week
    } else {
      // if userData does not exist, then get the Monday 26 weeks ago and start from there
      lastJumpUpdated = halfYearAgo;
    }
    var lastSwimUpdated = new Date();
    if (userData && userData.swimJson && userData.swimJson.activityData.length > 0) {
      lastSwimUpdated = new Date(userData.swimJson.activityData[0][0].uploadDate);
    } else {
      // if userData does not exist, then get the Monday 26 weeks ago and start from there
      lastSwimUpdated = halfYearAgo;
    }
    var lastRunUpdated = new Date();
    if (userData && userData.runJson && userData.runJson.activityData.length > 0) {
      lastRunUpdated = new Date(userData.runJson.activityData[0][0].uploadDate);
    } else {
      // if userData does not exist, then get the Monday 26 weeks ago and start from there
      console.log("user data does not exist!");
      lastRunUpdated = halfYearAgo;
    }
    console.log("last updated jump was: ", lastJumpUpdated.getMonth(), lastJumpUpdated.getDate());
    console.log("last updated swim was: ", lastSwimUpdated.getMonth(), lastSwimUpdated.getDate());
    console.log("last updated run was: ", lastRunUpdated.getMonth(), lastRunUpdated.getDate());
    var [additionalJumpData, additionalSwimData, additionalRunData] = await Promise.all([
      getActivityJson("jump", lastJumpUpdated),
      getActivityJson("swim", lastSwimUpdated),
      getActivityJson("run",  lastRunUpdated)
    ]);

    var gotAllInfo = userJson.success && additionalJumpData.success && additionalSwimData.success && additionalRunData.success
    if (gotAllInfo) {
      console.log("successfully got all user info");
      const newState = {
        ...state,
        ...userJson,
        // socket: prevState.socket,
        mounted: true,
        // NOTE THAT FITNESS ISN'T UPDATED. THIS SHOULD CHANGE
        jumpJson: {
          ...state.jumpJson,
          activityData: [
            ...state.jumpJson.activityData,
            ...additionalJumpData.activityData
          ].slice(Math.max(state.jumpJson.length - FITNESS_CONTANTS.NUM_WEEKS_IN_PAST, 0), state.jumpJson.length)
        },
        runJson: {
          ...state.runJson,
          activityData: [
            ...state.runJson.activityData,
            ...additionalRunData.activityData
          ].slice(Math.max(state.runJson.length - FITNESS_CONTANTS.NUM_WEEKS_IN_PAST, 0), state.runJson.length)
        },
        swimJson: {
          ...state.swimJson,
          activityData: [
            ...state.swimJson.activityData,
            ...additionalSwimData.activityData
          ].slice(Math.max(state.swimJson.length - FITNESS_CONTANTS.NUM_WEEKS_IN_PAST, 0), state.swimJson.length)
        },
      }
      setState(newState);
      storeDataObj(newState);
    } else {
      console.log("additional swim data: ", additionalSwimData);
      console.log("additional run data: ", additionalRunData);
      console.log("additional jump data: ", additionalJumpData);
      throw new Error("failed to get all user info");
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
          setAppState: setState,
          updateLocalUserInfo,
        }}
      >
      { isLoading ? <View style={styles.container}><LoadingSpin/></View> : 
        <>
          {/* <Header
            leftComponent={{ icon: 'menu', color: '#fff' }}
            rightComponent={{ icon: 'home', color: '#fff' }}
          /> */}
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
            <BottomTab.Screen name={SETTINGS} component={Settings} />
            {/* <BottomTab.Screen name={COMMUNITY} component={Community} /> */}
            <BottomTab.Screen name={DEVICE_CONFIG} component={DeviceConfig} />
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