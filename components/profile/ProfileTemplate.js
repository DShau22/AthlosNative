// A template for the general structure and style of a profile
// has many holes that need to be filled with a shit ton of props
// oassed in from the profile component
import React from 'react'
import { getData, storeDataObj } from '../utils/storage';
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native'
import { Text, Button, Divider, ListItem } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '@react-navigation/native';
import axios from 'axios';

import { UserDataContext, ProfileContext, AppFunctionsContext } from '../../Context';
import PROFILE_CONSTANTS from "./ProfileConstants";
import SETTINGS_CONSTANTS from '../settings/SettingsConstants';
import ENDPOINTS from '../endpoints';
const {
  UNIT_SYSTEM_SETTINGS_LIST,
} = SETTINGS_CONSTANTS;
const {
  USER_PROFILE,
  SEARCH_PROFILE,
  IS_RIVAL,

  IS_SELF,
  UNRELATED,
  IS_FOLLOWER,
  IS_FOLLOWING,
  IS_FOLLOWER_PENDING,
  IS_FOLLOWING_PENDING,
} = PROFILE_CONSTANTS;
import {
  getShouldAutoSync,
  setShouldAutoSync,
} from '../utils/storage';
import {
  showSnackBar
} from '../utils/notifications'
import GLOBAL_CONSTANTS from '../GlobalConstants'
const { METRIC, ENGLISH, EVERYONE, FOLLOWERS, ONLY_ME } = GLOBAL_CONSTANTS
import Community from '../community/Community'
import Fitness from '../fitness/Fitness'
import ProfileHeader from './sections/ProfileHeader'
import ProfileBests from './sections/ProfileBests'
import ProfileGoals from './sections/ProfileGoals'
import ProfileAggregates from './sections/ProfileAggregates'
import EditProfile from './EditProfile'
import EditGoals from './EditGoals'
import { TouchableOpacity } from 'react-native-gesture-handler';
import StatCard from '../fitness/StatCard';
import ThemeText from '../generic/ThemeText';
import ProfileAboutYou from './sections/ProfileAboutYou';

import GeneralSetting from '../settings/settingScreens/GeneralSetting';
import SettingsMenu from '../settings/settingScreens/SettingsMenu';
import Spinner from 'react-native-loading-spinner-overlay';
import GlobalBleHandler from '../bluetooth/GlobalBleHandler';
import Settings from '../settings/Settings';
const ProfileTemplate = (props) => {
  const userDataContext = React.useContext(UserDataContext)
  const {
    followers,
    following,
    followerRequests,
    followingPending,
    deviceID,
  } = userDataContext
  const {
    _id,
    // relationshipStatus,
    profileContext,
    setId,
    refreshing,
    onRefresh,
    rootNav,
  } = props;
  const [isLoading, setIsLoading] = React.useState(false);
  const { settings } = profileContext
  const { colors } = useTheme();

  const getRelationshipStatus = () => {
    // CHECK THE PROFILE CONSTANTS TO MAKE SURE THESE ENUMS MATCH
    if (_id === userDataContext._id) {
      return IS_SELF;
    }
    // ORDER MATTERS
    // for now, can unfollow someone, and then remove them as follower
    // but not the other direction. Add that in later 
    for (i = 0; i < following.length; i++) {
      if (following[i]._id === _id) {
        return IS_FOLLOWING;
      }
    }
    for (i = 0; i < followers.length; i++) {
      if (followers[i]._id === _id) {
        return IS_FOLLOWER;
      }
    }
    for (i = 0; i < followerRequests.length; i++) {
      if (followerRequests[i]._id === _id) {
        return IS_FOLLOWER_PENDING;
      }
    }
    for (i = 0; i < followingPending.length; i++) {
      if (followingPending[i]._id === _id) {
        return IS_FOLLOWING_PENDING;
      }
    }
    return UNRELATED
  }
  const relationshipStatus = getRelationshipStatus()
  // const [relationshipStatus, setRelationshipStatus] = React.useState(getRelationshipStatus())

  const navigateToFitness = (navigation) => {
    navigation.navigate(GLOBAL_CONSTANTS.FITNESS, {_id: _id})
  }

  const canViewFitness = () => (
    relationshipStatus === IS_SELF ||
    settings.seeFitness === EVERYONE ||
    ((relationshipStatus === IS_FOLLOWING || relationshipStatus === IS_RIVAL) && settings.seeFitness === FOLLOWERS)
  )

  const canViewTotals = () => (
    relationshipStatus === IS_SELF ||
    settings.seeTotals === EVERYONE ||
    ((relationshipStatus === IS_FOLLOWING || relationshipStatus === IS_RIVAL) && settings.seeTotals === FOLLOWERS)
  )

  const canViewBests = () => (
    relationshipStatus === IS_SELF ||
    settings.seeBests === EVERYONE ||
    ((relationshipStatus === IS_FOLLOWING || relationshipStatus === IS_RIVAL) && settings.seeBests === FOLLOWERS)
  )

  const canViewBasicInfo = () => (
    relationshipStatus === IS_SELF ||
    settings.seeBasicInfo === EVERYONE ||
    ((relationshipStatus === IS_FOLLOWING || relationshipStatus === IS_RIVAL) && settings.seeBasicInfo === FOLLOWERS)
  )

  //********************** SETTINGS STUFF *************************
  const context = React.useContext(UserDataContext);
  const { setAppState } = React.useContext(AppFunctionsContext); 

  const [unitDisplayChoice, setUnitDisplayChoice] = React.useState(settings.unitSystem);
  // NOT IN USE AT THE MOMENT FOR SETTINGS
  const [communityChoice, setCommunityChoice] = React.useState(settings.seeCommunity);
  const [fitnessChoice, setFitnessChoice] = React.useState(settings.seeFitness);
  const [basicInfoChoice, setBasicInfoChoice] = React.useState(settings.seeBasicInfo);
  const [bestsChoice, setBestsChoice] = React.useState(settings.seeBests);
  const [totalsChoice, setTotalsChoice] = React.useState(settings.seeTotals);
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
        console.log("token: ", token);
        if (!token) {
          // send them back to the login page
          console.log("WOT they have no token hmmmm")
          setIsLoading(false);
          return
        } 
      } catch(e) {
        console.log(e)
        Alert.alert('Oh No :(', e.toString(), [{ text: "Okay" }]);
      }
  
      // update settings with the backend
      try {
        const config = {
          headers: { 'Content-Type': 'application/json' },
          cancelToken: source.token
        }
        var res = await axios.post(ENDPOINTS.updateSettings, {
          userToken: token,
          seeCommunity: communityChoice,
          seeFitness: fitnessChoice,
          seeBests: bestsChoice,
          seeTotals: totalsChoice,
          seeBasicInfo: basicInfoChoice,
          unitSystem: unitDisplayChoice,
        }, config)
        var json = res.data
        console.log("axios response: ", json)
        if (json.success) {
          // props.updateUserInfo()
          Alert.alert('All Done!', "Your settings have been successfully updated :)", [{ text: "Okay" }]);
          setIsLoading(false);
        } else {
          throw new Error(json.message);
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
          unitSystem: unitDisplayChoice
        }
      }
      setAppState(newState);
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

  const Stack = createStackNavigator();
  const profileScreenName = relationshipStatus === IS_SELF ? USER_PROFILE : SEARCH_PROFILE
  return (
    // context for when fitness was part of profile
    <ProfileContext.Provider value={{...profileContext, relationshipStatus, setId, _id}}> 
      <Spinner
        visible={isLoading}
        textContent={'Saving...'}
        textStyle={{color: colors.textColor}}
      />
      <Stack.Navigator initialRouteName={profileScreenName}>
        <Stack.Screen
          name={profileScreenName}
          options={{ title: relationshipStatus === IS_SELF ? 'Your Profile' : `${profileContext.firstName}'s Profile` }}
        >
          {(props) => (
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              <View style={styles.container}>
                {relationshipStatus !== IS_SELF ? 
                  <Button
                    containerStyle={{alignSelf: 'flex-start', marginBottom: 10, marginLeft: 10}}
                    buttonStyle={{backgroundColor: colors.button}}
                    title='back to your profile'
                    onPress={() => setId(userDataContext._id)}
                  /> : null
                }
                <ProfileHeader
                  navigation={props.navigation}
                  relationshipStatus={relationshipStatus}
                />
                <View style={styles.viewFitness}>
                  {canViewFitness() ?
                    <Button
                      title='View Past Activities'
                      containerStyle={{width: '90%', alignSelf: 'center', marginTop: 10, marginBottom: 10}}
                      buttonStyle={{
                        backgroundColor: colors.button
                      }}
                      onPress={() => props.navigation.navigate(GLOBAL_CONSTANTS.FITNESS, {_id: _id})}
                    /> : null }
                </View>
                <View style={{alignItems: 'center', width: '100%'}}>
                  <Divider style={{width: '95%', marginTop: 8 }}/>
                </View>
                {<ProfileAboutYou onEditPress={() => props.navigation.push(PROFILE_CONSTANTS.EDIT_PROFILE)}/>}
                {<ProfileGoals onEditPress={() => props.navigation.push(PROFILE_CONSTANTS.GOALS)}/>}
                {canViewBests() ? <ProfileBests/> : null}
                {/* {canViewTotals() ? <ProfileAggregates /> : null} */}
              </View>
            </ScrollView>
          )}
        </Stack.Screen>
        <Stack.Screen
          name={PROFILE_CONSTANTS.EDIT_PROFILE}
          options={{ title: 'About You' }}
        >
          {props => ( <EditProfile navigation={props.navigation}/> )}
        </Stack.Screen>
        <Stack.Screen
          name={PROFILE_CONSTANTS.GOALS}
          options={{ title: 'Weekly Goals' }}
        >
          {props => ( <EditGoals navigation={props.navigation} /> )}
        </Stack.Screen>
        {/*============================== settings stuff =======================================*/}
        <Stack.Screen
          name={GLOBAL_CONSTANTS.SETTINGS}
          options={{ title: 'App Settings' }}
        >
          {screenProps => (
            <Settings />
            // <SettingsMenu
            //   {...props}
            //   navigation={props.navigation}
            //   saveSettings={saveSettings}
            // />
          )}
        </Stack.Screen>
        {/* <Stack.Screen name={SETTINGS_CONSTANTS.UNIT_SYSTEM_SETTINGS}>
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
        </Stack.Screen> */}
        {/*============================== settings stuff =======================================*/}
        <Stack.Screen
          name={GLOBAL_CONSTANTS.FITNESS}
          options={{ title: relationshipStatus === IS_SELF ? 'Your Activities' : `${profileContext.firstName}'s Activities` }}
        >
          {props => (
            <Fitness
              _id={_id}
              navigation={props.navigation}
            />
          )}
        </Stack.Screen>
        {/* <Stack.Screen
          name={GLOBAL_CONSTANTS.COMMUNITY}
          options={{ title: relationshipStatus === IS_SELF ? 'Your Community' : `${profileContext.firstName}'s Community` }}
        >
          {props => (
            <Community
              {...props}
              rootNav={rootNav}
            />
          )}
        </Stack.Screen> */}
        {/* <Stack.Screen
          name={PROFILE_CONSTANTS.BASIC_INFO}
          options={{ title: relationshipStatus === IS_SELF ? 'Your Basic Info' : `${profileContext.firstName}'s Basic Info` }}
        >
          {props => (
            <ProfileInfo
              _id={_id}
              navigation={props.navigation}
              relationshipStatus={relationshipStatus}
            />
          )}
        </Stack.Screen> */}

      </Stack.Navigator>
    </ProfileContext.Provider>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    alignItems: 'center'
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
  logo: {
    width: 66,
    height: 58,
  },
  routeButtons: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: 'red',
    width: '80%'
  },
  routeButtonCard: {
    flex: 1,
    // backgroundColor: 'red',
    margin: 10,
    elevation: 4,
    height: 80
  },
  routeButtonCardContent: {
    height: 80,
    // backgroundColor: 'blue',
    flexDirection: 'row',
    alignItems: 'center'
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 60,
    marginRight: 10
  },
  viewFitness: {
    width: '100%',
  }
});

export default ProfileTemplate