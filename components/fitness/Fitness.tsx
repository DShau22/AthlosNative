import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
const { DateTime } = require('luxon');
import React from 'react'
import Run from "./run/Run"
import Jump from "./jump/Jump"
import Swim from "./swim/Swim"
import { UserDataContext, ProfileContext, AppFunctionsContext, AppFunctionsContextType } from "../../Context"
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import LoadingScreen from '../generic/LoadingScreen';
import { View, StyleSheet, Alert, ScrollView, RefreshControl } from "react-native";

import { useFocusEffect, useTheme } from '@react-navigation/native';

import PROFILE_CONSTANTS from '../profile/ProfileConstants'
import ENDPOINTS from '../endpoints'
import axios from 'axios';
import FITNESS_CONSTANTS from './FitnessConstants'
import GlobalBleHandler from '../bluetooth/GlobalBleHandler';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import Interval from './interval/Interval';
import { StackRouter } from 'react-navigation';
import ThemeText from '../generic/ThemeText';
import Background from '../nativeLogin/Background';
import Arrow from './carousel/Arrow';
import SwimDetails from './swim/SwimDetails';
import { UserDataInterface } from '../generic/UserTypes';

const Fitness = (props) => {
  const userDataContext = React.useContext(UserDataContext);
  const { runJson, swimJson, jumpJson, intervalJson } = userDataContext as UserDataInterface;
  // console.log("Fitness context: ", userDataContext.runJson.activityData.length);
  const appFunctionsContext = React.useContext(AppFunctionsContext) as AppFunctionsContextType;
  const profileContext = React.useContext(ProfileContext);
  const { colors } = useTheme()
  const [isLoading, setIsLoading] = React.useState(true);  
  const [refreshing, setRefreshing] = React.useState<boolean>(false);

  const [weekIndex, setWeekIndex] = React.useState(0);
  const [dayIndex, setDayIndex] = React.useState(DateTime.local().weekday - 1); // 1 is monday 7 is sunday for .weekday
  const { settings, relationshipStatus } = profileContext;
  const { setAppState, updateLocalUserFitness } = appFunctionsContext;
  const { _id } = props;
  // if this is another user, must get the fitness from the server. Otherwise can just use
  // local async storage (the defaults used in the state)
  const getFitness = React.useCallback(async () => {
    setIsLoading(true);
    if (relationshipStatus === PROFILE_CONSTANTS.IS_SELF) {
      try {
        console.log("updating local user fitness in FITNESS component");
        await updateLocalUserFitness();
        console.log("updated local user fitness!");
      } catch(e) {
        console.log("error getting fitness in fitness component: ", e);
        Alert.alert(
          "Oh no :(",
          "Something went wrong with getting your fitness. Please refresh and try again.",
          [{text: 'Okay'}]
        );
      }
      setIsLoading(false);
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

  const nextSlide = () => {
    const nextIndex = (dayIndex + 1) % 7;
    setDayIndex(nextIndex);
  }

  const previousSlide = () => {
    // 0 represents the most recent upload date
    const nextIndex = (dayIndex - 1 + 7) % 7;
    setDayIndex(nextIndex);
  }

  const TopTab = createMaterialTopTabNavigator();
  const Stack = createStackNavigator();
  // need because scrollview doesn't work with navigation stacks as children and swim page needs additional screen for workout details
  // can't put navigation stacks inside Swim component cuz that would force you to put scrollview AND nav stack in withFitnessPage
  const SwimStack = createStackNavigator();
  return (
    isLoading ? <LoadingScreen text='preparing your workout log'/> :
      <Stack.Navigator headerMode='none'>
        <Stack.Screen
          name={'detailed-view'}
        >
          {props =>
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
                  <ScrollView
                    style={{height: '100%', width: '100%', backgroundColor: colors.background}}
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={getFitness}
                      />
                    }
                  >
                    <Run
                      dayIndex={dayIndex}
                      setDayIndex={setDayIndex}
                      setWeekIndex={setWeekIndex}
                      weekIndex={weekIndex}
                      activityJson={runJson}
                      settings={settings}
                    />
                  </ScrollView>
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
                  <SwimStack.Navigator
                    headerMode='none'
                  >
                    <SwimStack.Screen
                      name={FITNESS_CONSTANTS.SWIM}
                    >
                      {props => (
                        <ScrollView
                          style={{height: '100%', width: '100%', backgroundColor: colors.background}}
                          refreshControl={
                            <RefreshControl
                              refreshing={refreshing}
                              onRefresh={getFitness}
                            />
                          }
                        >
                          <Swim
                            dayIndex={dayIndex}
                            setDayIndex={setDayIndex}
                            setWeekIndex={setWeekIndex}
                            weekIndex={weekIndex}
                            activityJson={swimJson}
                            settings={settings}
                            navigation={props.navigation}
                          />
                        </ScrollView>
                      )}
                    </SwimStack.Screen>
                    <SwimStack.Screen
                      name={FITNESS_CONSTANTS.SWIM_DETAILS}
                    >
                      {props => (
                        <ScrollView
                          style={{height: '100%', width: '100%', backgroundColor: colors.background}}
                          refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={getFitness} />
                          }
                        >
                          <SwimDetails workout={swimJson.activityData[weekIndex][dayIndex]}/>
                        </ScrollView>
                      )}
                    </SwimStack.Screen>
                  </SwimStack.Navigator>
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
                  <ScrollView
                    style={{height: '100%', width: '100%', backgroundColor: colors.background}}
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={getFitness}
                      />
                    }
                  >
                    <Jump
                      dayIndex={dayIndex}
                      setDayIndex={setDayIndex}
                      setWeekIndex={setWeekIndex}
                      weekIndex={weekIndex}
                      activityJson={jumpJson}
                      settings={settings}
                    />
                  </ScrollView>
                )}
              </TopTab.Screen>
              <TopTab.Screen
                name={'HIIT'}
                // component={Jump}
                // initialParams={{
                //   id: FITNESS_CONSTANTS.JUMP,
                //   activityJson: jumpJson,
                //   settings: settings,
                // }}
              >
                {props => (
                  <View style={{height: '100%', width: '100%'}}>
                    <ScrollView
                      style={{height: '100%', width: '100%', backgroundColor: colors.background}}
                      contentContainerStyle={{flexGrow: 1}}
                      refreshControl={
                        <RefreshControl
                          refreshing={refreshing}
                          onRefresh={getFitness}
                        />
                      }
                    >
                      <Interval
                        dayIndex={dayIndex}
                        setDayIndex={setDayIndex}
                        setWeekIndex={setWeekIndex}
                        weekIndex={weekIndex}
                        activityJson={intervalJson}
                        settings={settings}
                      />
                    </ScrollView>
                    <Arrow
                      style={{position: 'absolute', bottom: 10, left: 30}}
                      textStyle={{color: colors.textColor}}
                      direction='left'
                      clickFunction={previousSlide}
                      glyph="&#8249;"
                    />
                    <Arrow
                      style={{position: 'absolute', bottom: 10, right: 30}}
                      textStyle={{color: colors.textColor}}
                      direction='right'
                      clickFunction={nextSlide}
                      glyph="&#8250;"
                    />
                  </View>
                )}
              </TopTab.Screen>
            </TopTab.Navigator>
          }
        </Stack.Screen>
        <Stack.Screen
          name={'workout-calendar'}
          options={{ title: 'calendar' }}
        >
          {props => (
            <ScrollView
              style={{height: '100%', width: '100%', backgroundColor: colors.background}}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={getFitness}
                />
              }
            >
              <Calendar/>
            </ScrollView>
          )}
        </Stack.Screen>
      </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  topTab: {

  }
})

export default gestureHandlerRootHOC(Fitness);
