import React, { Component } from 'react'
import Carousel from "../carousel/Carousel"
import Calories from "../Calories"
import Duration from "../Duration"
import { UserDataContext } from '../../../Context'
import Past from "../charts/Past"
import withFitnessPage from "../withFitnessPage"
import { rawHeightConvert } from "../../utils/unitConverter" 
import { View, StyleSheet, Text, ScrollView } from 'react-native'
const Jump = (props) => {
  const context = React.useContext(UserDataContext);
  const calcAvgHeight = () => {
    var { activityData } = context.jumpJson
    var avg = 0
    var count = 0
    activityData.forEach((session, i) => {
      session.heights.forEach((height, j) => {
        avg += height; count += 1;
      })
    })
    // show only 2 decimal digits
    return (count === 0) ? 0 : parseFloat(avg / count).toFixed(2)
  }

  const getCurrentBestHeight = () => {
    var { unitSystem } = context.settings
    var { activityData } = context.jumpJson
    var { activityIndex } = props
    if (activityData.length === 0) { return null }
    var session = activityData[activityIndex]
    var best = Math.max(...session.heights)
    best = unitSystem === "metric" ? rawHeightConvert(unitSystem, best) : best
    return (
      <span>
        {"highest: " + best + (unitSystem === "metric" ? " cm" : " in")}
      </span>
    )
  }

  var { jumpJson, settings, bests } = context
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
    isNullOrUndefined
  } = props
  var currentStatDisplay = jumpJson.activityData[activityIndex]
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContents}
      style={styles.container}
    >
      <Carousel
        stats={jumpJson}
        previousSlide={previousSlide}
        nextSlide={nextSlide}
        activityIndex={activityIndex}
        displayDate={displayDate}
        dropdownItemClick={dropdownItemClick}
        renderSecondary={getCurrentBestHeight}
      />
      <View>
        <Calories 
          cals={isNullOrUndefined(currentStatDisplay) ? 0 : currentStatDisplay.calories}
        />
        <Duration 
          duration={isNullOrUndefined(currentStatDisplay) ? 0 : currentStatDisplay.time}
        />
      </View>
      <Past
        chartTitle="Previous Sessions"
        labels={pastGraphLabels}
        data={pastGraphData}
        hoverLabel="Jumps"
        activity="Jumps"
        yAxisMin={0}
        yAxisMax={20}
      />
      <View className="card text-center">
        <Text className="card-title">Avg Jumps per Session</Text>
        <Text>{calcAvgNum()}</Text>
      </View>
      <View className="card text-center">
        <Text className="card-title">Avg height per Session</Text>
        <Text>{calcAvgHeight() + " " + (unitSystem === "metric" ? "cm" : "in")}</Text>
      </View>
      <View className="card text-center">
        <Text className="card-title">Avg Cals per Session</Text>
        <Text>{calcAvgCals()}</Text>
      </View>
      <View className="card text-center">
        <Text className="card-title">Overall Best</Text>
        <Text>{bests.jump}</Text>
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
  circle: {
    flex: 1,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'black',
    // minWidth: 80,
    // alignItems: 'center',
    marginBottom: 10
  },
  text1: {
    flex: 1,
    // fontSize: 14,
    color: '#2f354b',
    // textAlign: 'center',
    backgroundColor: 'black',
  },
  text2: {
    flex: 2,
    // fontSize: 14,
    color: '#2f354b',
    // textAlign: 'center',
    backgroundColor: 'red',
  }
})
export default withFitnessPage(Jump)
