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
// import PaceLineProgression from "../charts/PaceLineProgression"

// btw restPaceMin and walkPaceMax is walking
// greater that walkPaceMax is running
const walkPaceMax = 2.314 // 130 steps per minute is a fast walk, which is 2.16 steps/sec, 2.314 (.2sec) / step
// anything above restPaceMax is resting
const restPaceMin = 5 // say 60 steps per minute is basically resting. 1 step/sec, 5 (.2sec) / step

const Run = (props) => {
  const context = React.useContext(UserDataContext)
  const { settings, activityJson } = props
  const runJson = activityJson;
  const makeDoughnutData = () => {
    var runCount = 0
    var walkCount = 0
    var count = 0
    var { activityData } = runJson
    activityData.forEach((session, i) => {
      session.paces.forEach((pace, j) => {
        // if pace is somehow undefined or NaN or null then skip
        if (!(!pace || isNaN(pace))) {
          if (pace > walkPaceMax) {
            runCount += 1
          } else if (pace > restPaceMin && pace < walkPaceMax) {
            walkCount += 1
          }
          count += 1
        } else {
          console.log("this pace entry is corrupted somehow...")
        }
      })
    })
    if (count === 0) {
      return [0, 0, 0]
    }
    var runPercent = runCount / count
    var walkPercent = walkCount / count
    return [runPercent, walkPercent, 1 - (runPercent + walkPercent)]
  }

  const calcAvgPace = () => {
    var { activityData } = runJson
    var avg = 0
    var count = 0
    activityData.forEach((session, i) => {
      session.paces.forEach((pace, j) => {
        avg += pace
        count += 1
      })
    })
    return (count === 0) ? 0 : avg / count
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

  // returns an array of time labels for a given paces array
  // and the total time the user spent on running mode
  const makePaceLabels = (paces, totalTime) => {
    let timeInterval = Math.floor(totalTime / paces.length)
    let timeSeries = Array(paces.length)

    // add 1 to length of paces array cuz you wanna start with 0
    // on the display chart
    for (let i = 0; i < paces.length + 1; i++) {
      timeSeries[i] = `${Math.floor(timeInterval * i / 10)} sec`
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
  //   <RunDoughnut
  //   style={{height: 400, backgroundColor: 'blue'}}
  //   labels={['% run', '% walk', '% rest']}
  //   // data={makeDoughnutData()}
  //   data={pieData}
  //   colors={[
  //     // 'rgba(102, 255, 102, 0.4)',
  //     // 'rgba(255, 255, 0, 0.4)',
  //     // 'rgba(255, 51, 0, 0.4)',
  //     'red',
  //     'green',
  //     'blue'
  //   ]}
  // />
    <View style={styles.container}>
      <Past
        chartTitle="Previous Runs"
        labels={pastGraphLabels}
        data={pastGraphData}
        hoverLabel="Steps"
        activity="Runs"
        yAxisMin={0}
        yAxisMax={Math.max(...pastGraphData)}
      />
        <RunDonut
          style={{height: 250}}
          labels={['% run', '% walk', '% rest']}
          // data={makeDoughnutData()}
          data={[.5, .4, .1]}
          colors={[
            'rgba(102, 255, 102, 0.4)',
            'rgba(255, 255, 0, 0.4)',
            'rgba(255, 51, 0, 0.4)',
          ]}
        />
      <Card style={styles.cardContainer}>
        <Card.Content style={styles.cardContent}>
        </Card.Content>
      </Card>
      {/* <PaceLineProgression
        activity="Pace Progression"
        displayDate={displayDate}
        data={[0, ...currentStatDisplay.paces]} // add 0 to beginning of paces array to indicate 0 pace at time 0
        labels={makePaceLabels(currentStatDisplay.paces, currentStatDisplay.time)}
        hoverLabel="Pace"
        yAxisMin={0}
        yAxisMax={Math.max(...currentStatDisplay.paces) + 2}
      /> */}
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
            <ThemeText style={{marginTop: 5}}>{calcAvgPace()}</ThemeText>
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
