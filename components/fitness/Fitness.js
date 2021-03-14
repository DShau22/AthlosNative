import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React from 'react'
import Run from "./run/Run"
import Jump from "./jump/Jump"
import Swim from "./swim/Swim"
import { UserDataContext, ProfileContext, AppFunctionsContext } from "../../Context"
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import LoadingScreen from '../generic/LoadingScreen';
import { View, StyleSheet, Alert, ScrollView, RefreshControl } from "react-native";
import { useFocusEffect, useTheme } from '@react-navigation/native';

import PROFILE_CONSTANTS from '../profile/ProfileConstants'
import ENDPOINTS from '../endpoints'
import axios from 'axios';
import FITNESS_CONSTANTS from './FitnessConstants'
import GlobalBleHandler from '../bluetooth/GlobalBleHandler';

const Fitness = (props) => {
  const userDataContext = React.useContext(UserDataContext);
  const { runJson, swimJson, jumpJson } = userDataContext;
  // console.log("Fitness context: ", userDataContext.runJson.activityData.length);
  const appFunctionsContext = React.useContext(AppFunctionsContext);
  const profileContext = React.useContext(ProfileContext);
  const { colors } = useTheme()
  const [isLoading, setIsLoading] = React.useState(true);  

  const [refreshing, setRefreshing] = React.useState(false);
  
  const { settings, relationshipStatus } = profileContext
  const { setAppState, updateLocalUserFitness } = appFunctionsContext
  const { _id } = props;
  // if this is another user, must get the fitness from the server. Otherwise can just use
  // local async storage (the defaults used in the state)
  const getFitness = React.useCallback(async () => {
    setIsLoading(true);
    if (relationshipStatus === PROFILE_CONSTANTS.IS_SELF) {
      try {
        // console.log("updating local user fitness in FITNESS component");
        await GlobalBleHandler.uploadToServer();
        await updateLocalUserFitness();
      } catch(e) {
        console.log("error getting fitness in fitness component: ", e);
        Alert.alert(
          "Oh no :(",
          "Something went wrong with the request to the server. Please refresh and try again.",
          [{text: 'Okay'}]
        );
      }
      setIsLoading(_id.length === 0);
      return;
    }
    console.log('getting fitness with user id: ', _id)
    // fetch jsons THIS SHOULD NOT BE RUN YET SINCE THERES NO COMMUNITY FEATURES
    // try {
    //   const [jumpsTracked, swimsTracked, runsTracked] = await Promise.all([
    //     getSearchActivityJson("jump", _id),
    //     getSearchActivityJson("swim", _id),
    //     getSearchActivityJson("run", _id)
    //   ])
    //   setRunJson({
    //     activityData: runsTracked,
    //     action: FITNESS_CONSTANTS.RUN,
    //     imageUrl: FITNESS_CONSTANTS.RUN
    //   })
    //   setSwimJson({
    //     activityData: swimsTracked,
    //     action: FITNESS_CONSTANTS.SWIM,
    //     imageUrl: FITNESS_CONSTANTS.SWIM
    //   })
    //   setJumpJson({
    //     activityData: jumpsTracked,
    //     action: FITNESS_CONSTANTS.JUMP,
    //     imageUrl: FITNESS_CONSTANTS.JUMP
    //   })
    //   // if this is the current user, save it to async storage and update the context
    //   setAppState(prevState => {
    //     const newAppState = {
    //     ...prevState,
    //     runJson: {
    //       activityData: runsTracked,
    //       action: FITNESS_CONSTANTS.RUN,
    //       imageUrl: FITNESS_CONSTANTS.RUN
    //     },
    //     swimJson: {
    //       activityData: swimsTracked,
    //       action: FITNESS_CONSTANTS.SWIM,
    //       imageUrl: FITNESS_CONSTANTS.SWIM
    //     },
    //     jumpJson: {
    //       activityData: jumpsTracked,
    //       action: FITNESS_CONSTANTS.JUMP,
    //       imageUrl: FITNESS_CONSTANTS.JUMP
    //     }}
    //     storeUserData(newAppState)
    //     return newAppState
    //   })

    // } catch(e) {
    //   console.log(e)
    //   Alert.alert('Oh No :(', 'Something went wrong with the connection to the server. Please refresh and try again.', [{text: 'Ok'}])
    // } finally {
    //   console.log("finally")
    //   setIsLoading(false)
    // }
  }, [])

  React.useEffect(() => {
    // console.log("using fitness effect")
    getFitness();
    return () => {
      console.log("Fitness requests are being canceled")
      source.cancel()
    };
  }, [_id]);

  // cancel token for cancelling Axios requests on unmount
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  const getSearchActivityJson = async (activity, _id) => {
    // CHANGE TO GET THE FIRST 10-50 ENTRIES MAYBE
    const config = {
      headers: { 'Content-Type': 'application/json' },
      cancelToken: source.token
    }
    var res = await axios.post(ENDPOINTS.getSearchUserFitness, {
      activity,
      friendID: _id,
    }, config)
    if (res.data.success) {
      return res.data.activityData
    } else {
      throw Error('res.data.success is false :(')
    }
  }

  const TopTab = createMaterialTopTabNavigator();
  return (
    <ScrollView
      style={{height: '100%', backgroundColor: colors.header}}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={getFitness}
        />
      }
    >
      { isLoading ? <LoadingScreen text='fetching your activities'/> :
        <TopTab.Navigator
          tabBarOptions={{
            activeTintColor: colors.textColor,
            inactiveTintColor: '#9DA0A3',
            labelStyle: { fontSize: 12 },
            indicatorStyle: {
              backgroundColor: colors.textColor,
              height: 2,
            },
            style: { backgroundColor: colors.header, paddingTop: 8, paddingBottom: 8 },
          }}
        >
          <TopTab.Screen
            name={'Runs'}
            // component={Run}
            // initialParams={{
            //   id: FITNESS_CONSTANTS.RUN,
            //   activityJson: runJson,
            //   settings: settings,
            // }}
          >
            {props => (
              <Run activityJson={runJson} settings={settings} />
            )}
          </TopTab.Screen>
          <TopTab.Screen
            name={'Swims'}
            // component={Swim}
            // initialParams={{
            //   id: FITNESS_CONSTANTS.SWIM,
            //   activityJson: swimJson,
            //   settings: settings,
            // }}
          >
            {props => (
              <Swim activityJson={swimJson} settings={settings} />
            )}
          </TopTab.Screen>
          <TopTab.Screen
            name={'Jumps'}
            // component={Jump}
            // initialParams={{
            //   id: FITNESS_CONSTANTS.JUMP,
            //   activityJson: jumpJson,
            //   settings: settings,
            // }}
          >
            {props => (
              <Jump activityJson={jumpJson} settings={settings} />
            )}
          </TopTab.Screen>
        </TopTab.Navigator>
      }
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  topTab: {

  }
})

export default gestureHandlerRootHOC(Fitness);
