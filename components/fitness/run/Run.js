import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React from 'react'
import { Divider } from 'react-native-elements'
import { View, Text, StyleSheet, ScrollView, FlatList, Dimensions, Image } from 'react-native'
import Past from "../charts/Past"
import withFitnessPage from "../withFitnessPage"
import StatCard from '../StatCard'
import ThemeText from '../../generic/ThemeText'
import { UserDataContext } from "../../../Context"
import { COLOR_THEMES } from '../../ColorThemes'
import LineProgression from "../charts/LineProgression"
import DistributionDonut from '../charts/DistributionDonut'

// btw restPaceMin and walkPaceMax is walking
// greater that walkPaceMax is running
const walkCadenceMax = 130// 130 steps per minute is a fast walk, which is 2.16 steps/sec, 2.314 (.2sec) / step
// anything above restcadenceMax is resting
const restCadenceMin = 50 // say 60 steps per minute is basically resting. 1 step/sec, 5 (.2sec) / step

const Run = (props) => {
  const context = React.useContext(UserDataContext)
  const { settings, activityJson } = props
  const runJson = activityJson;
  // returns an array of percentages for the distribution of walking, running, and resting.
  // returns an empty array if there is no fitness data
  const makeDonutData = () => {
    var runCount = 0
    var walkCount = 0
    var count = 0
    var { activityData } = runJson
    if (activityData.length === 0) return []
    activityData.forEach((session, i) => {
      session.cadences.forEach((cadence, j) => {
        // if cadence is somehow undefined or NaN or null then skip
        if (!(!cadence || isNaN(cadence))) {
          if (cadence > walkCadenceMax) {
            runCount += 1
          } else if (cadence <= walkCadenceMax && cadence > restCadenceMin) {
            walkCount += 1
          }
          count += 1
        } else {
          console.log("this cadence entry is corrupted somehow...")
        }
      })
    })
    var runPercent = Math.floor(100 * runCount / count)
    var walkPercent = Math.floor(100 * walkCount / count)
    return [runPercent, walkPercent, 100 - (runPercent + walkPercent)]
  }

  const calcAvgCadence = () => {
    var { activityData } = runJson
    var avg = 0
    var count = 0
    activityData.forEach((session, i) => {
      session.cadences.forEach((cadence, j) => {
        avg += cadence
        count += 1
      })
    })
    return (count === 0) ? 0 : Math.floor(avg / count)
  }

  // returns an array of time labels for a given cadences array
  // and the total time the user spent on running mode. Only displays
  // the label for every 5 minutes
  const makeCadenceLabels = (cadences, totalTime) => {
    let timeInterval = Math.floor(totalTime / cadences.length)
    let timeSeries   = []

    // add 1 to length of cadences array cuz you wanna start with 0
    // on the display chart
    for (let i = 0; i < cadences.length + 1; i+=5) {
      timeSeries.push(`${Math.floor(timeInterval * i)}`)
    }
    return timeSeries
  }

  // from withFitnessPage
  var {
    activityIndex,
    pastGraphData,
    pastGraphLabels,
    dropdownItemClick,
    displayDate,
    nextSlide,
    previousSlide,
    calcAvgNum,
    calcAvgCals,
    isNullOrUndefined
  } = props
  // this could be undefined if user has no recorded data
  var currentStatDisplay = runJson.activityData[activityIndex]
  return (
    <View style={styles.container}>
      <View style={{alignItems: 'center'}}>
        <ThemeText h4>Cadence Progression</ThemeText>
      </View>
      <ScrollView
        horizontal
        style={{marginTop: 20}}
        contentContainerStyle={[styles.sideScrollContent, {marginLeft: runJson.activityData.length === 0 ? -20 : 0}]}
      >
        <LineProgression
          activityColor={COLOR_THEMES.RUN_THEME}
          yAxisInterval='5'
          data={runJson.activityData.length === 0 ? [] : [0, ...currentStatDisplay.cadences]}
          labels={makeCadenceLabels(currentStatDisplay.cadences, currentStatDisplay.time)}
        />
      </ScrollView>
      <View style={{alignItems: 'center'}}>
        <Divider style={{width: '95%', marginBottom: 10, marginTop: 10}}/>
        <ThemeText h4>Distribution</ThemeText>
      </View>
      <View>
        <DistributionDonut
          style={{height: 250}}
          data={makeDonutData()}
          indexToLabel={{0: 'Running', 1: 'Walking', 2: 'Resting'}}
          labelUnit='%'
          // data={[]}
          colors={[
            'rgba(102, 255, 102, 0.4)',
            'rgba(255, 255, 0, 0.4)',
            'rgba(255, 51, 0, 0.4)',
          ]}
        />
      </View>
      <View style={{alignItems: 'center'}}>
        <Divider style={{width: '95%', marginBottom: 10, marginTop: 10}}/>
      </View>
      <View style={{alignItems: 'center'}}>
        <ThemeText h4>Past Runs</ThemeText>
      </View>
      <ScrollView horizontal contentContainerStyle={{alignItems: 'center', marginTop: 15}}>
        <Past
          labels={pastGraphLabels}
          data={pastGraphData}
          activity="Runs"
        />
      </ScrollView>
      <View style={{alignItems: 'center'}}>
        <StatCard
          imageUri='https://reactnative.dev/img/tiny_logo.png'
          label='Average steps per session'
          stat={calcAvgNum()}
        />
        <StatCard
          imageUri='https://reactnative.dev/img/tiny_logo.png'
          label='Average cadence per Session'
          stat={calcAvgCadence()}
        />
        <StatCard
          imageUri='https://reactnative.dev/img/tiny_logo.png'
          label='Average Calories burned per Session'
          stat={calcAvgCals()}
        />
      </View>
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
export default gestureHandlerRootHOC(withFitnessPage(Run))
