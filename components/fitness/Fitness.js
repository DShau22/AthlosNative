import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React from 'react'
import Run from "./run/Run"
import Jump from "./jump/Jump"
import Swim from "./swim/Swim"
import { UserDataContext, ProfileContext, AppFunctionsContext } from "../../Context"
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import LoadingScreen from '../generic/LoadingScreen';
import { View, StyleSheet, Alert, ScrollView, RefreshControl } from "react-native";
import { useFocusEffect } from '@react-navigation/native';

import WithRefresh from '../generic/WithRefresh'
import PROFILE_CONSTANTS from '../profile/ProfileConstants'
import ENDPOINTS from '../endpoints'
import axios from 'axios';
import FITNESS_CONSTANTS from './FitnessConstants'

const Fitness = (props) => {
  const userDataContext = React.useContext(UserDataContext);
  const appFunctionsContext = React.useContext(AppFunctionsContext)
  const profileContext = React.useContext(ProfileContext);

  const [isLoading, setIsLoading] = React.useState(false);  

  const [refreshing, setRefreshing] = React.useState(false);

  const [runJson, setRunJson] = React.useState(userDataContext.runJson)
  const [swimJson, setSwimJson] = React.useState(userDataContext.swimJson)
  const [jumpJson, setJumpJson] = React.useState(userDataContext.jumpJson)
  
  const { settings, relationshipStatus } = profileContext
  const { _id } = props

  const getFitnessFromServer = React.useCallback(async () => {
    setIsLoading(true)
    console.log('getting fitness with use id: ', _id)
    // fetch jsons
    try {
      const [jumpsTracked, swimsTracked, runsTracked] = await Promise.all([
        getSearchActivityJson("jump", _id),
        getSearchActivityJson("swim", _id),
        getSearchActivityJson("run", _id)
      ])
      setRunJson({
        activityData: runsTracked,
        action: FITNESS_CONSTANTS.RUN,
        imageUrl: FITNESS_CONSTANTS.RUN
      })
      setSwimJson({
        activityData: swimsTracked,
        action: FITNESS_CONSTANTS.SWIM,
        imageUrl: FITNESS_CONSTANTS.SWIM
      })
      setJumpJson({
        activityData: jumpsTracked,
        action: FITNESS_CONSTANTS.JUMP,
        imageUrl: FITNESS_CONSTANTS.JUMP
      })
    } catch(e) {
      console.log(e)
      Alert.alert('Oh No :(', 'Something went wrong with the connection to the server. Please refresh and try again.', [{text: 'Ok'}])
    } finally {
      console.log("finally")
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    console.log("using fitness effect")
    // if this is another user, must get the fitness from the server. Otherwise can just use
    // local async storage (the defaults used in the state)
    if (relationshipStatus !== PROFILE_CONSTANTS.IS_SELF) getFitnessFromServer();
    return () => {
      console.log("Fitness requests are being canceled")
      source.cancel()
    };
  }, [_id])
  // console.log("is loading is: ", isLoading)
  // console.log('settings is: ', settings)
  // console.log("run json is: ", runJson)
  // console.log("swim json is: ", swimJson)
  // console.log("jump json is: ", jumpJson)


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
      style={{height: '100%'}}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={getFitnessFromServer}
        />
      }
    >
      { isLoading ? <LoadingScreen /> :
        <TopTab.Navigator style={styles.topTab}>
          <TopTab.Screen
            name={FITNESS_CONSTANTS.RUN}
            component={Run}
            initialParams={{
              id: FITNESS_CONSTANTS.RUN,
              activityJson: runJson,
              settings: settings,
            }}
          />
          <TopTab.Screen
            name={FITNESS_CONSTANTS.SWIM}
            component={Swim}
            initialParams={{
              id: FITNESS_CONSTANTS.SWIM,
              activityJson: swimJson,
              settings: settings,
            }}
          />
          <TopTab.Screen
            name={FITNESS_CONSTANTS.JUMP}
            component={Jump}
            initialParams={{
              id: FITNESS_CONSTANTS.JUMP,
              activityJson: jumpJson,
              settings: settings,
            }}
          />
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
