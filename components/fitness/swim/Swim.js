import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import React, { Component } from 'react'
import { View, StyleSheet, Text, ScrollView } from 'react-native'
import { Divider } from 'react-native-elements'

import Details from "../Details"
import StatCard from '../StatCard'
import ThemeText from '../../generic/ThemeText'
import { UserDataContext } from '../../../Context'
import WeeklyBarChart from "../charts/WeeklyBarChart"
import withFitnessPage from "../withFitnessPage"
import DistributionDonut from '../charts/DistributionDonut'
import LineProgression from '../charts/LineProgression'
import { COLOR_THEMES } from '../../ColorThemes'
const metersToYards = 1.0 / 1.09361
const yardsToMeters = 1.0 / 0.9144

const Swim = (props) => {
  const {
    weekIndex,
    dayIndex,
    currentDay,
    weeklyGraphData,
    weeklyGraphLabels,
    calcAvgNum,
    calcAvgCals,

    settings,
    activityJson,
    roundToNDecimals,
    isNullOrUndefined
  } = props;

  // this is daily
  const makeDonutData = () => {
    const { activityData } = activityJson;
    if (isNullOrUndefined(activityData) || activityData.length === 0) {
      return [];
    }
    var flyCount    = 0, 
        backCount   = 0,
        breastCount = 0,
        freeCount   = 0;
    currentDay.strokes.forEach((stroke, _) => {
      let lowerCaseStroke = stroke.toLowerCase()
      if (lowerCaseStroke === "u") {
        flyCount += 1
      } else if (lowerCaseStroke === "y") {
        backCount += 1
      } else if (lowerCaseStroke === "o") {
        breastCount += 1
      } else if (lowerCaseStroke === "f") {
        freeCount += 1
      }
    });
    if (flyCount + backCount + breastCount + freeCount === 0) return [];
    return [flyCount, backCount, breastCount, freeCount];
  }

  const makeTimeLabels = () => {
    var inc;
    if (currentDay.lapTimes.length < 20) {
      inc = 1;
    } else {
      inc = Math.ceil(currentDay.lapTimes.length / 20);
    }
    let res = [];
    for (let i = 0; i < currentDay.lapTimes.length; i+=inc) {
      // res.push(i === 0 ? 1 : i);
      res.push(i);
    }
    return res;
  }
  
  const { unitSystem } = settings;

  // 50m, 25yd, or 25m
  return (
    <View style={styles.container}>
      <View style={{alignItems: 'center'}}>
        <ThemeText h4>Lap Times</ThemeText>
      </View>
      <ScrollView
        horizontal
        style={{marginTop: 20}}
        contentContainerStyle={[styles.sideScrollContent, {marginLeft: activityJson.activityData.length === 0 ? -20 : 0}]}
      >
        <LineProgression
          activityColor={COLOR_THEMES.SWIM_THEME}
          yAxisInterval='10'
          xAxisInterval='10'
          yAxisUnits='s'
          data={currentDay ? currentDay.lapTimes.map(({lapTime}, _) => lapTime) : []}
          labels={currentDay ? makeTimeLabels().map((_, idx) => '') : []}
        />
      </ScrollView>
      <View style={{alignItems: 'center'}}>
        <ThemeText h4>Stroke Distribution</ThemeText>
      </View>
      <View>
        <DistributionDonut
          activity='swim'
          style={{height: 250}}
          data={makeDonutData()}
          indexToLabel={['Fly', 'Back', 'Breast', 'Free']}
          labelUnit=' laps'
          gradients={COLOR_THEMES.SWIM_DONUT_GRADIENTS}
        />
      </View>
      <View style={{alignItems: 'center'}}>
        <Divider style={{width: '95%', marginBottom: 10, marginTop: 10}}/>
      </View>
      <View style={{alignItems: 'center'}}>
        <ThemeText h4>Weekly Swims</ThemeText>
      </View>
      <ScrollView horizontal contentContainerStyle={{alignItems: 'center', marginTop: 15}}>
        <WeeklyBarChart
          labels={weeklyGraphLabels}
          data={weeklyGraphData}
          activity="Swims"
          yAxisMin={0}
          yAxisMax={Math.max(...weeklyGraphData)}
        />
      </ScrollView>
      {/* <View style={{alignItems: 'center'}}>
        <StatCard
          imageUri='https://reactnative.dev/img/tiny_logo.png'
          label='Average laps per session'
          stat={calcAvgNum()}
        />
        <StatCard
          imageUri='https://reactnative.dev/img/tiny_logo.png'
          label='Average Speed'
          stat={`${calcAvgSpeed()} ${unitSystem === "metric" ? "m/s" : "yd/s"}`}
        />
        <StatCard
          imageUri='https://reactnative.dev/img/tiny_logo.png'
          label='Avg Time per Lap'
          stat={`${calcAvgTimePerLap()} s`}
        />
        <StatCard
          imageUri='https://reactnative.dev/img/tiny_logo.png'
          label='Avg Cals burned per Session'
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
    // alignItems: 'center',
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
  }
})

export default gestureHandlerRootHOC(withFitnessPage(Swim))
