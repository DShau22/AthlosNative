import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import React, { Component } from 'react'
import { View, StyleSheet, Text, ScrollView } from 'react-native'
import { Divider } from 'react-native-elements'

import Details from "../Details"
import StatCard from '../StatCard'
import ThemeText from '../../generic/ThemeText'
import { UserDataContext } from '../../../Context'
import Past from "../charts/Past"
import withFitnessPage from "../withFitnessPage"
import DistributionDonut from '../charts/DistributionDonut'
import LineProgression from '../charts/LineProgression'
import { COLOR_THEMES } from '../../ColorThemes'
const metersToYards = 1.0 / 1.09361
const yardsToMeters = 1.0 / 0.9144
const swimLink = "/app/swimDetails"

const Swim = (props) => {
  const context = React.useContext(UserDataContext);
  const { settings, activityJson } = props
  const swimJson = activityJson

  const calculateDistance = (currentStatDisplay) => {
    var { swimLap, unitSystem } = settings
    const { roundToNDecimals, isNullOrUndefined } = props
    unitSystem = unitSystem.toLowerCase()
    if (isNullOrUndefined(currentStatDisplay)) {
      return 0
    }
    var { num } = currentStatDisplay
    if (swimLap === "50 m") {
      let distanceInMeters = 50 * num
      return (unitSystem === "metric" ? 
              <Text>{distanceInMeters}</Text> : 
              <Text>{roundToNDecimals(distanceInMeters * metersToYards, 2)}</Text>)
    } else if (swimLap === "25 m") {
      let distanceInMeters = 25 * num
      return (unitSystem === "metric" ? 
              <Text>{distanceInMeters}</Text> : 
              <Text>{roundToNDecimals(distanceInMeters * metersToYards, 2)}</Text>)
    } else {
      // 25yd
      let distanceInYards = 25 * num
      return (unitSystem === "english" ? 
              <Text>{distanceInYards}</Text> : 
              <Text>{roundToNDecimals(distanceInYards * yardsToMeters, 2)}</Text>)
    }
  }

  const calcAvgSpeed = () => {
    var { activityData } = props.activityJson
    var { swimLap, unitSystem } = settings
    const { roundToNDecimals, isNullOrUndefined } = props
    if (isNullOrUndefined(activityData)) {
      return 0
    }
    // returns [50/25, m/yd] both as strings
    var distMetric = swimLap.split(" ")
    var distance = 0; var time = 0;
    // var incrementDistance = (distance, distMetric) => {
    //   return distance + distMetric
    // }
    activityData.forEach((session, i) => {
      var { lapTimes, num } = session
      // sum over all times in the lapTimes array
      time += lapTimes.reduce((a, b) => a + b, 0)
      // add 50/25 * the number of laps done
      distance = distMetric[0] * num
    })
    // now have average distance / time in either m/s or yd/s
    var avgSpeed = (distance === 0 ? 0 : distance / time)

    if (distMetric[1] === "yd") {
      // avg speed is in yds / s
      return (unitSystem === "metric" ?
              roundToNDecimals(avgSpeed * yardsToMeters, 2) :
              avgSpeed)
    } else {
      // avg speed is in meters / s
      return (unitSystem === "metric" ?
              avgSpeed :
              roundToNDecimals(avgSpeed * metersToYards, 2))
    }
  }

  const calcAvgTimePerLap = () => {
    var { activityData } = props.activityJson
    const { roundToNDecimals, isNullOrUndefined } = props
    if (isNullOrUndefined(activityData)) {
      return 0
    }
    var totalTime = 0; var totalNumLaps = 0;
    activityData.forEach((session, idx) => {
      totalTime += session.lapTimes.reduce((a, b) => a + b, 0)
      totalNumLaps += session.num
    })
    return roundToNDecimals(totalTime / totalNumLaps, 2)
  }

  const makeDonutData = () => {
    var { activityData } = props.activityJson
    const { isNullOrUndefined } = props
    if (isNullOrUndefined(activityData)) {
      return 0
    }
    var flyCount    = 0, 
        backCount   = 0,
        breastCount = 0,
        freeCount   = 0;
    activityData.forEach((session, i) => {
      session.strokes.forEach((stroke, j) => {
        let lowerCaseStroke = stroke.toLowerCase()
        if (lowerCaseStroke === "u") {
          flyCount += 1
        } else if (lowerCaseStroke === "b") {
          backCount += 1
        } else if (lowerCaseStroke === "r") {
          breastCount += 1
        } else if (lowerCaseStroke === "f") {
          freeCount += 1
        }
      })
    })
    return [flyCount, backCount, breastCount, freeCount]     
  }

  const makeTimeLabels = (currentStatDisplay, inc) => {
    res = []
    for (i = 0; i < currentStatDisplay.lapTimes.length; i+=inc) {
      res.push(i === 0 ? 1 : i)
    }
    return res
  }
  
  var { unitSystem } = settings
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
    isNullOrUndefined,
  } = props
  // this could be undefined if user has no recorded data
  var currentStatDisplay = swimJson.activityData[activityIndex]
  // 50m, 25yd, or 25m
  return (
    <View style={styles.container}>
      <View style={{alignItems: 'center'}}>
        <ThemeText h4>Lap Times</ThemeText>
      </View>
      <ScrollView
        horizontal
        style={{marginTop: 20}}
        contentContainerStyle={[styles.sideScrollContent, {marginLeft: swimJson.activityData.length === 0 ? -20 : 0}]}
      >
        <LineProgression
          activityColor={COLOR_THEMES.SWIM_THEME}
          yAxisInterval='5'
          yAxisUnits='s'
          data={swimJson.activityData.length === 0 ? [] : currentStatDisplay.lapTimes.map(({lapTime}, _) => lapTime)}
          labels={makeTimeLabels(currentStatDisplay, 4)}
        />
      </ScrollView>
      <View style={{alignItems: 'center'}}>
        <ThemeText h4>Distribution</ThemeText>
      </View>
      <View>
        <DistributionDonut
          style={{height: 250}}
          data={makeDonutData()}
          indexToLabel={{0: 'Fly', 1: 'Back', 2: 'Breast', 3: 'Free'}}
          labelUnit=' laps'
          colors={[
            'rgba(102, 255, 102, 0.4)',
            'rgba(255, 255, 0, 0.4)',
            'rgba(255, 51, 0, 0.4)',
            'rgba(255, 153, 0, 0.4)',
          ]}
        />
      </View>
      <Divider style={{width: '95%'}}/>
      <View style={{alignItems: 'center'}}>
        <ThemeText h4>Past Swims</ThemeText>
      </View>
      <ScrollView horizontal contentContainerStyle={{alignItems: 'center', marginTop: 15}}>
        <Past
          labels={pastGraphLabels}
          data={pastGraphData}
          activity="Swims"
          yAxisMin={0}
          yAxisMax={Math.max(...pastGraphData)}
        />
      </ScrollView>
      <View style={{alignItems: 'center'}}>
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
    width: '100%'
  }
})

export default gestureHandlerRootHOC(withFitnessPage(Swim))
