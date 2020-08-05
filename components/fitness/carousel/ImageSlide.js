import React from 'react'
import { View, StyleSheet, Text } from "react-native"
import { UserDataContext } from "../../../Context"
import {COLOR_THEMES} from "../../ColorThemes"
import * as Animatable from 'react-native-animatable';

const { RUN_THEME, SWIM_THEME, JUMP_THEME } = COLOR_THEMES
import { ProgressCircle } from 'react-native-svg-charts'
import FITNESS_CONSTANTS from '../../fitness/FitnessConstants'
const ImageSlide = (props) => {
  const getLabels = (action) => {
    var { unitSystem } = React.useContext(UserDataContext).settings
    if (action === FITNESS_CONSTANTS.RUN) {
      return {
        numLabel: "steps",
        secondaryLabel: (unitSystem === "metric") ? "km" : "miles"
      }
    } else if (action === FITNESS_CONSTANTS.SWIM) {
      // CHANGE THIS BASED ON SWIMMING PART OF SETTINGS
      return {
        numLabel: "laps",
        secondaryLabel: (unitSystem === "metric") ? "m" : "yds"
      }
    } else {
      return {
        numLabel: "jumps",
        secondaryLabel: (unitSystem === "metric") ? "cm" : "in"
      }
    }
  }

  const renderNum = (stats, indexDisplay, style) => {
    var { activityData } = stats
    var labels = getLabels(stats.action)
    var num = activityData.length === 0 ? 0 : activityData[indexDisplay].num
    return (
      <Text style={style}> {`${num} ${labels.numLabel}`} </Text>
      // <Animatable.Text animation="slideInLeft">{`${num} ${labels.numLabel}`}</Animatable.Text>
    )
  }

  const getActivityColor = () => {
    switch (props.stats.action) {
      case FITNESS_CONSTANTS.RUN:
        return RUN_THEME;
      case FITNESS_CONSTANTS.SWIM:
        return SWIM_THEME;
      default:
        return JUMP_THEME;
    }
  }

  var { stats, indexDisplay } = props
  return (
    <View style={styles.imageSlide}> 
      <ProgressCircle style={{ height: '100%', width: '100%' }} progress={0.7} progressColor={getActivityColor()} />
      <Text style={{ position: 'absolute', top: '35%'}}>Img should go here!</Text>
      {/* add data through props */}
      {/* <img src={stats.imageUrl} alt="loading..."/> */}
      {renderNum(stats, indexDisplay, styles.number)}
    </View>
  )
}
const styles = StyleSheet.create({
  imageSlide: {
    height: 280,
    width: '65%',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activityIcon: {
    position: 'absolute',
    top: '35%',
  },
  estimatedDistance: {
    position: 'absolute',
    top: '55%'
  },
  number: {
    position: 'absolute',
    top: '65%'
  },
  run:  { borderColor: RUN_THEME },
  swim: { borderColor: SWIM_THEME },
  jump: { borderColor: JUMP_THEME }
})
export default ImageSlide
