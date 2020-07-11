import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React, { Component } from 'react'
import Carousel from "../carousel/Carousel"
import Calories from "../Calories"
import Duration from "../Duration"

import Details from "../Details"
import SwimDoughnut from "./SwimDoughnut"
import PieChartWithDynamicSlices from "./PieChartWithDynamicSlices"

import { UserDataContext } from '../../../Context'
import Past from "../charts/Past"
import withFitnessPage from "../withFitnessPage"
import { View, StyleSheet, Text, ScrollView } from 'react-native'

const metersToYards = 1.0 / 1.09361
const yardsToMeters = 1.0 / 0.9144
const swimLink = "/app/swimDetails"

const Swim = (props) => {
  const context = React.useContext(UserDataContext);

  const calculateDistance = (currentStatDisplay) => {
    var { swimLap, unitSystem } = context.settings
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
    var { swimLap, unitSystem } = context.settings
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

  const makeDoughnutData = () => {
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
  
  var { settings, swimJson } = context
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
    <ScrollView
      contentContainerStyle={styles.scrollContents}
      style={styles.container}
    >
      <Carousel
        stats={swimJson}
        previousSlide={previousSlide}
        nextSlide={nextSlide}
        activityIndex={activityIndex}
        displayDate={displayDate}
        dropdownItemClick={dropdownItemClick}
        renderSecondary={calculateDistance}
      />
      <View>
        <Calories 
          cals={isNullOrUndefined(currentStatDisplay) ? 0 : currentStatDisplay.calories}
        />
        <Details detailsLink={swimLink}/>
        <Duration 
          duration={isNullOrUndefined(currentStatDisplay) ? 0 : currentStatDisplay.time}
        />
      </View>
      <Past
        chartTitle="Previous Swims"
        labels={pastGraphLabels}
        data={pastGraphData}
        hoverLabel="Laps"
        activity="Swims"
        yAxisMin={0}
        yAxisMax={50}
      />
      <View>
        <Text>Avg Laps per Session</Text>
        <Text>{calcAvgNum()}</Text>
      </View>
      <View>
        <Text>Avg Speed per Lap</Text>
        <Text>{calcAvgSpeed() + " " + (unitSystem === "metric" ? "m/s" : "yd/s")}</Text>
      </View>
      <View>
        <Text>Avg Time per Lap</Text>
        <Text>{calcAvgTimePerLap() + " seconds"}</Text>
      </View>
      <View>
        <Text>Avg Strokes per Lap</Text>
        <Text>avg strokes</Text>
      </View>
      <View>
        <Text>Avg Cals per Session</Text>
        <Text>{calcAvgCals()}</Text>
      </View>
      <View>
        <Text>Avg Cals per Session</Text>
        <Text>{calcAvgCals()}</Text>
      </View>
      <View style={styles.strokeDistribution}>
        <Text>Stroke Distribution</Text>
        <SwimDoughnut
          data={makeDoughnutData()}
          labels={["laps fly", "laps back", "laps breast", "laps free"]}
          colors={[
            'rgba(102, 255, 102, 0.4)',
            'rgba(255, 255, 0, 0.4)',
            'rgba(255, 51, 0, 0.4)',
            'rgba(255, 153, 0, 0.4)',
          ]}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%'
  },
  scrollContents: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  calsAndTimeContainer: {
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  strokeDistribution: {
    alignItems: 'center',
    justifyContent: 'center',
  }
})

export default gestureHandlerRootHOC(withFitnessPage(Swim))
