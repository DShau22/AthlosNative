import * as React from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
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
import LoadingSpin from '../generic/LoadingSpin';
import Fitness from "../fitness/Fitness"
import { UserDataContext, AppFunctionsContext } from "../../Context"
import Home from "./Home"
import Settings from "../settings/Settings"
import Community from "../community/Community"
import Profile from '../profile/Profile'
import DeviceConfig from '../configure/DeviceConfig'
import Example from '../configure/Example'

import GLOBAL_CONSTANTS from '../GlobalConstants'
const {
  HOME,
  FITNESS,
  COMMUNITY,
  SETTINGS,
  PROFILE,
  DEVICE_CONFIG,
} = GLOBAL_CONSTANTS
// server url
const defaultProfile = "./profile/default_profile.png"

const imgAlt = "../profile/default_profile.png"

const dataURL = ENDPOINTS.getData

function Athlos(props) {
  const [isLoading, setIsLoading] = React.useState(false);
  // const [rivals, setRivals] = React.useState([]);
  // const [rivalsPending, setRivalsPending] = React.useState([]);
  // const [rivalRequests, setRivalRequests] = React.useState([]);

  // const [followers, setFollowers] = React.useState([]);
  // const [followerRequests, setFollowerRequests] = React.useState([]);

  // const [following, setFollowing] = React.useState([]);
  // const [followingPending, setFollowingPending] = React.useState([]);

  const [state, setState] = React.useState({
    headerText: 'Home',
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
    jumpJson: {
      activityData: [],
      action: "jump",
      imageUrl: "https://img.icons8.com/ios/50/000000/trampoline-park-filled.png"
    },
    runJson: {
      activityData: [],
      action: "run",
      imageUrl: "https://img.icons8.com/nolan/64/000000/running.png",
    },
    swimJson: {
      activityData: [],
      action: "swim",
      imageUrl: "https://img.icons8.com/nolan/64/000000/swimming.png"
    },
  });
  
  React.useEffect(() => {
    const prepareData = async () => {
      console.log("Athlos component using effect")
      setIsLoading(true);
      console.log("just set isloading")
      // set up the web socket connection to server
      // var socket = await this.setUpSocket()

      // first check if info is in Async storage
      const token = await getData();
      const userData = await getDataObj()
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
      var headers = new Headers();
      headers.append("authorization", `Bearer ${props.token}`);
      try {
        var res = await fetch(ENDPOINTS.getUserInfo, { method: "GET", headers });
        var userJson = await res.json();
      } catch(e) {
        console.error(e);
        Alert.alert(`Oh No :(`, "Something went wrong with the connection to the server. Please refresh.", [{ text: "Okay" }]);
        setIsLoading(false);
      }
      console.log('user json: ', userJson);

      // var { numFriendsDisplay } = state;
      // try {
      //   var friendTableRows = await addFriendRows(userJson.friends, numFriendsDisplay)
      // } catch(e) {
      //   console.error(e)
      //   setIsLoading(false);
      // }

      // get user's fitness data for jumps, runs, swims
      // MAKE AWAIT PROMISES.ALL LATER
      try {
        var [jumpsTracked, swimsTracked, runsTracked] = await Promise.all([
          getActivityJson("jump"),
          getActivityJson("swim"),
          getActivityJson("run")
        ]);
      } catch(e) {
        console.error(e)
        Alert.alert(`Oh No :(`, "Something went wrong with the connection to the server. Please refresh.", [{ text: "Okay" }]);
        setIsLoading(false);
      }
      var gotAllInfo = userJson.success && jumpsTracked.success && swimsTracked.success && runsTracked.success
      if (gotAllInfo) {
        console.log("successfully got all user info");
        const userData = {
          ...state,
          ...userJson,
          mounted: true,
          // friendTableRows,
          jumpJson: {
            ...state.jumpJson,
            activityData: jumpsTracked.activityData 
          },
          runJson: {
            ...state.runJson,
            activityData: runsTracked.activityData 
          },
          swimJson: {
            ...state.swimJson,
            activityData: swimsTracked.activityData 
          },
        }
        // one bug that could come up is if another setState occurred outside this function before
        // the fetch response finished running. This delayed setState would then
        // run after the other setState which could cause some mixups in which state is correct
        // Shouldn't be a problem thoughsince the socket field is only updated here and users can't see it.
        setState(userData);
        // store in Async storage so no need to request every time
        // probably change this later so this refreshes every now and then?
        // adding a service worker or background process would be good
        storeDataObj(userData);
        setIsLoading(false);        
      } else {
        console.log("one of the requests to get fitness data or user info didn't work");
        console.log("user: ", userJson);
        console.log("jumps: ", jumpsTracked);
        console.log("swims: ", swimsTracked);
        console.log("runs: ", runsTracked);
        Alert.alert(`Oh No :(`, "Something went wrong with the connection to the server. Please refresh.", [{ text: "Okay" }]);
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

  const getActivityJson = async (activity) => {
    // CHANGE TO GET THE FIRST 10-50 ENTRIES MAYBE
    var headers = new Headers()
    var token = await getData()
    headers.append("authorization", `Bearer ${token}`)
    headers.append("activity", activity)

    var res = await fetch(dataURL, {
      method: "GET",
      headers: headers,
    })
    var trackedFitness = await res.json()
    return trackedFitness
  }

  // async componentDidMount() {
  //   this._isMounted = true
  //   // if there is no token then user hasn't logged in...
  //   // log them out and redirect them back to login page,
  //   // and don't run the rest of this method cuz it involves setting
  //   // up stuff as if the user had logged in
  //   var userToken = getToken()
  //   if (!userToken) {
  //     this.setState({
  //       logout: true
  //     })
  //     this.props.history.push("/")
  //     return
  //   }

  //   // set up the web socket connection to server
  //   // var socket = await this.setUpSocket()

  //   // get the user's information here from database
  //   // make request to server to user information and set state
  //   var headers = new Headers()
  //   headers.append("authorization", `Bearer ${userToken}`)
  //   try {
  //     var res = await fetch(getUserInfoURL, { method: "GET", headers })
  //     var userJson = await res.json()
  //   } catch(e) {
  //     console.error(e)
  //   }
  //   console.log(userJson)

  //   var { numFriendsDisplay } = this.state
  //   try {
  //     var friendTableRows = await this.addFriendRows(userJson.friends, numFriendsDisplay)
  //   } catch(e) {
  //     console.error(e)
  //   }

  //   // get user's fitness data for jumps, runs, swims
  //   // MAKE AWAIT PROMISES.ALL LATER
  //   try {
  //     var jumpsTracked = await this.getActivityJson("jump")
  //     var swimsTracked = await this.getActivityJson("swim")
  //     var runsTracked = await this.getActivityJson("run")
  //   } catch(e) {
  //     console.error(e)
  //   }
  //   var gotAllInfo = userJson.success && jumpsTracked.success && swimsTracked.success && runsTracked.success
  //   if (gotAllInfo && this._isMounted) {
  //     // one bug that could come up is if another setState occurred outside this function before
  //     // the fetch response finished running. This delayed setState would then
  //     // run after the other setState which could cause some mixups in which state is correct
  //     // Shouldn't be a problem thoughsince the socket field is only updated here and users can't see it.
  //     this.setState(prevState => ({
  //       ...userJson,
  //       // socket,
  //       mounted: true,
  //       friendTableRows,
  //       jumpJson: {
  //         ...prevState.jumpJson,
  //         activityData: jumpsTracked.activityData 
  //       },
  //       runJson: {
  //         ...prevState.runJson,
  //         activityData: runsTracked.activityData 
  //       },
  //       swimJson: {
  //         ...prevState.swimJson,
  //         activityData: swimsTracked.activityData 
  //       }
  //     }))
  //   } else {
  //     alert("not success")
  //   }
  // }

  // logout() {
  //   console.log("logging out...")
  //   // var { socket } = this.state
  //   // console.log(socket)
  //   removeFromLocalStorage(storageKey)
  //   removeFromSessionStorage(storageKey)
  //   // remove socket id from session storage
  //   this.setState({
  //     isLoading: true,
  //     logout: true,
  //   });
  //   this.props.history.push("/")
  //   // emit logout event to server
  //   // var userToken = getToken()
  //   // var data = { userToken }
  //   // socket.emit("logoutServer", data)
  // }

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
    var userToken = await getData()
    var headers = new Headers()
    headers.append("authorization", `Bearer ${userToken}`)
    try {
      var res = await fetch(ENDPOINTS.getUserInfo, { method: "GET", headers })
      var userJson = await res.json()
      if (!userJson.success) {
        console.log(userJson)
        Alert.alert(`Oh No :(`, "Something went wrong with the request to the server. Please refresh.", [{ text: "Okay" }]);
      }
      const newState = {
        ...userJson,
        // socket: prevState.socket,
        mounted: true,
        jumpJson: state.jumpJson,
        runJson: state.runJson,
        swimJson: state.swimJson,
      }
      setState(newState);
      storeDataObj(newState);
    } catch(e) {
      console.log("error in updateLocalUserInfo: ", e)
      Alert.alert(`Oh No :(`, "Something went wrong with the connection to the server. Please refresh.", [{ text: "Okay" }]);
    }
  }

  const BottomTab = createBottomTabNavigator();
  console.log("Athlos context: ", state)
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
          <Header
            leftComponent={{ icon: 'menu', color: '#fff' }}
            rightComponent={{ icon: 'home', color: '#fff' }}
          />
          <BottomTab.Navigator>
            <BottomTab.Screen name={HOME} component={Home} />
            <BottomTab.Screen name={FITNESS} component={Fitness} />
            <BottomTab.Screen name={PROFILE} component={Profile} />
            <BottomTab.Screen name={SETTINGS} component={Settings} />
            <BottomTab.Screen name={COMMUNITY} component={Community} />
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