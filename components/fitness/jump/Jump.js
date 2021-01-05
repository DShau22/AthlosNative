import React, { Component } from 'react'
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { Divider } from 'react-native-elements'
import { View, StyleSheet, Text, ScrollView } from 'react-native'
import GLOBAL_CONSTANTS from '../../GlobalConstants'
import { COLOR_THEMES } from '../../ColorThemes'
import { UserDataContext } from '../../../Context'
import WeeklyBarChart from "../charts/WeeklyBarChart"
import withFitnessPage from "../withFitnessPage"
import { rawHeightConvert } from "../../utils/unitConverter" 
import StatCard from '../StatCard';
import ThemeText from '../../generic/ThemeText'
import LineProgression from '../charts/LineProgression'
const Jump = (props) => {
  const {
    weekIndex,
    dayIndex,
    currentDay,
    weeklyGraphData,
    weeklyGraphLabels,
    calcAvgNum,
    calcAvgCals,
    
    activityJson,
    settings
  } = props;
  const { unitSystem } = settings;
  const jumpJson = activityJson;

  // weekly basis
  const calcAvgHeight = () => {
    const { activityData } = jumpJson;
    var avg = 0;
    var count = 0;
    activityData[weekIndex].forEach((session, i) => {
      session.heights.forEach((height, j) => {
        avg += height; count += 1;
      })
    })
    // show only 2 decimal digits
    return (count === 0) ? 0 : parseFloat(avg / count).toFixed(2);
  }

  const getWeekBestHeight = () => {
    const { unitSystem } = settings;
    const { activityData } = jumpJson;
    const { weekIndex } = props;
    if (activityData.length === 0) { return null };
    const week = activityData[weekIndex];
    var best = 0;
    week.forEach((session, _) => {
      best = Math.max(best, ...session.heights);
    })
    return unitSystem === GLOBAL_CONSTANTS.METRIC ? rawHeightConvert(unitSystem, best) : best;
  }

  // daily basis
  const makeTimeLabels = (inc) => {
    const { activityData } = jumpJson;
    if (activityData.length === 0) {
      return [];
    }
    res = [];
    for (i = 0; i < activityData[weekIndex][dayIndex].heights.length; i+=inc) {
      res.push(i === 0 ? 1 : i);
    }
    return res;
  }


  // this could be undefined if user has no recorded data
  return (
    <View style={styles.container}>
      <View style={{alignItems: 'center'}}>
        <ThemeText h4>Verticals</ThemeText>
      </View>
      <ScrollView
        horizontal
        style={{marginTop: 20}}
        contentContainerStyle={[styles.sideScrollContent, {marginLeft: jumpJson.activityData.length === 0 ? -20 : 0}]}
      >
        <LineProgression
          activityColor={COLOR_THEMES.JUMP_THEME}
          yAxisInterval='4'
          yAxisUnits={unitSystem === GLOBAL_CONSTANTS.METRIC ? ' cm' : ' in'}
          data={currentDay ? currentDay.heights : []}
          labels={currentDay ? makeTimeLabels(4) : []}
        />
      </ScrollView>
      <View style={{alignItems: 'center'}}>
        <ThemeText h4>Weekly Bests</ThemeText>
      </View>
      <ScrollView horizontal contentContainerStyle={{alignItems: 'center', marginTop: 15}}>
        <WeeklyBarChart
          labels={weeklyGraphLabels}
          data={weeklyGraphData}
          activity="Jumps"
          yAxisUnits={unitSystem === GLOBAL_CONSTANTS.METRIC ? ' cm' : ' in'}
        />
      </ScrollView>
      {/* <View style={{alignItems: 'center', width: '100%'}}>
        <StatCard
          imageUri='https://reactnative.dev/img/tiny_logo.png'
          label='Average number per Session'
          stat={calcAvgNum()}
        />
        <StatCard
          imageUri='https://reactnative.dev/img/tiny_logo.png'
          label='Average session vertical height'
          stat={calcAvgHeight() + " " + (unitSystem === "metric" ? "cm" : "in")}
        />
        <StatCard
          imageUri='https://reactnative.dev/img/tiny_logo.png'
          label='Average Calories burned per session'
          stat={calcAvgCals()}
        />
      </View> */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // height: '100%',
    width: '100%',
    // backgroundColor: 'red',
    alignItems: 'center',
    marginTop: 25
  },
  calsAndTimeContainer: {
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  circle: {
    flex: 1,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'black',
    // minWidth: 80,
    // alignItems: 'center',
    marginBottom: 10
  },
  cardContainer: {
    width: '90%',
    // height: 80,
    borderRadius: 15,
    marginTop: 20,
  },
  cardContent: {
    flexDirection: 'row',
    marginTop: 5,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  sideScrollContent: {
    alignItems:'center',
    width: '100%'
  }
})
export default gestureHandlerRootHOC(withFitnessPage(Jump))
