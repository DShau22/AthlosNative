import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React, { Component } from 'react'
import { Divider } from 'react-native-elements'
import { Card } from 'react-native-paper'
import { View, Text, StyleSheet, ScrollView, FlatList, Dimensions, Image } from 'react-native'
import Past from "../charts/Past"
import RunDonut from "./RunDonut"
import withFitnessPage from "../withFitnessPage"
import { UserDataContext } from "../../../Context"
import { COLOR_THEMES } from '../../ColorThemes'
import { PieChart } from 'react-native-svg-charts'
import ThemeText from '../../generic/ThemeText'
import CadenceLineProgression from "./CadenceLineProgression"

// btw restPaceMin and walkPaceMax is walking
// greater that walkPaceMax is running
const walkCadenceMax = 130// 130 steps per minute is a fast walk, which is 2.16 steps/sec, 2.314 (.2sec) / step
// anything above restcadenceMax is resting
const restCadenceMin = 50 // say 60 steps per minute is basically resting. 1 step/sec, 5 (.2sec) / step

const Run = (props) => {
  const context = React.useContext(UserDataContext)
  const { settings, activityJson } = props
  const runJson = activityJson;
  const makeDonutData = () => {
    var runCount = 0
    var walkCount = 0
    var count = 0
    var { activityData } = runJson
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
    if (count === 0) {
      return [0, 0, 0]
    }
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

  const estimateDistanceRun = (style) => {
    var { unitSystem } = settings
    // this means the person's height is in cm, display km
    if (unitSystem === "metric") {

    } else {
      // person's height in inches, display miles
    }
    return (<Text style={style}>estimated dist</Text>)
  }

  // returns an array of time labels for a given cadences array
  // and the total time the user spent on running mode. Only displays
  // the label for every 5 minutes
  const makeCadenceLabels = (cadences, totalTime) => {
    console.log(totalTime / cadences.length)
    let timeInterval = Math.floor(totalTime / cadences.length)
    let timeSeries = Array(cadences.length)

    // add 1 to length of cadences array cuz you wanna start with 0
    // on the display chart
    for (let i = 0; i < cadences.length + 1; i+=5) {
      timeSeries[i] = `${Math.floor(timeInterval * i)}`
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
  var currentStatDisplay = runJson.activityData[activityIndex]

  data = [15, 15, 15]
  const pieData = data.map((value, index) => ({
    value,
    svg: {
      fill: 'red',
      onPress: () => console.log('press', index),
    },
    key: `pie-${index}-${value}`,
  }))
  return (
    <View style={styles.container}>
      <View style={{alignItems: 'center'}}>
        <ThemeText h4>Cadence Progression</ThemeText>
      </View>
      <ScrollView horizontal style={{marginTop: 20}}>
        <CadenceLineProgression
          activity="Cadence Progression"
          data={[0, ...currentStatDisplay.cadences]} // add 0 to beginning of cadences array to indicate 0 cadence at time 0
          labels={makeCadenceLabels(currentStatDisplay.cadences, currentStatDisplay.time)}
        />
      </ScrollView>
      <View style={{alignItems: 'center'}}>
        <Divider style={{width: '95%', marginBottom: 10, marginTop: 10}}/>
        <ThemeText h4>Distribution</ThemeText>
      </View>
      <View>
        <RunDonut
          style={{height: 250}}
          labels={['% run', '% walk', '% rest']}
          data={makeDonutData()}
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
          chartTitle="Previous Runs"
          labels={pastGraphLabels}
          data={pastGraphData}
          hoverLabel="Steps"
          activity="Runs"
          yAxisMin={0}
          yAxisMax={Math.max(...pastGraphData)}
        />
      </ScrollView>
      <View style={{alignItems: 'center'}}>
        <Card style={styles.cardContainer}>
          <Card.Content style={styles.cardContent}>
            <Image
              style={{width: 35, height: 35, borderRadius: 70}}
              source={{
                uri: 'https://reactnative.dev/img/tiny_logo.png',
              }}
            />
            <View style={{marginLeft: 40}}>
              <ThemeText >Average steps per session</ThemeText>
              <ThemeText style={{marginTop: 5}}>{calcAvgNum()}</ThemeText>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.cardContainer}>
          <Card.Content style={styles.cardContent}>
            <Image
              style={{width: 35, height: 35, borderRadius: 70}}
              source={{
                uri: 'https://reactnative.dev/img/tiny_logo.png',
              }}
            />
            <View style={{marginLeft: 40}}>
              <ThemeText >Average cadence per Session</ThemeText>
              <ThemeText style={{marginTop: 5}}>{calcAvgCadence()}</ThemeText>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.cardContainer}>
          <Card.Content style={styles.cardContent}>
            <Image
              style={{width: 35, height: 35, borderRadius: 70}}
              source={{
                uri: 'https://reactnative.dev/img/tiny_logo.png',
              }}
            />
            <View style={{marginLeft: 40}}>
              <ThemeText >Average Calories burned per Session</ThemeText>
              <ThemeText style={{marginTop: 5}}>{calcAvgCals()}</ThemeText>
            </View>
          </Card.Content>
        </Card>
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
  }
})
export default gestureHandlerRootHOC(withFitnessPage(Run))
