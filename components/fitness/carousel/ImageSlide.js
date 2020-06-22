import React from 'react'
import { View, StyleSheet, Text } from "react-native"
import { UserDataContext } from "../../../Context"
import { runTheme, jumpTheme, swimTheme } from "../../Constants"
import { ProgressCircle } from 'react-native-svg-charts'

const ImageSlide = (props) => {
  const getLabels = (action) => {
    var { unitSystem } = React.useContext(UserDataContext).settings
    if (action === "run") {
      return {
        numLabel: "steps",
        secondaryLabel: (unitSystem === "metric") ? "km" : "miles"
      }
    } else if (action === "swim") {
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
    return ( <Text style={style}> {`${num} ${labels.numLabel}`} </Text> )
  }

  var { stats, indexDisplay, renderSecondary } = props
  return (
    <View style={[styles.imageSlide, styles[stats.action]]}> 
      <ProgressCircle style={{ height: 200, width: 200 }} progress={0.7} progressColor={'rgb(134, 65, 244)'} />
      <Text style={{ position: 'absolute', top: '35%'}}>Img should go here!</Text>
      {/* add data through props */}
      {/* <img src={stats.imageUrl} alt="loading..."/> */}
      {renderNum(stats, indexDisplay, styles.number)}
      {renderSecondary(styles.estimatedDistance)}
    </View>
  )
}
const styles = StyleSheet.create({
  imageSlide: {
    height: 300,
    width: '80%',
    marginTop: 15,
    borderWidth: 2,
    borderRadius: 50,
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
  run:  { borderColor: runTheme },
  swim: { borderColor: swimTheme },
  jump: { borderColor: jumpTheme }
})
export default ImageSlide
