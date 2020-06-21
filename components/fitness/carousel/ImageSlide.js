import React from 'react'
import { View, StyleSheet, Text } from "react-native"
import { UserDataContext } from "../../../Context"
import { runTheme, jumpTheme, swimTheme } from "../../Constants"
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

  const renderNum = (stats, indexDisplay) => {
    var { activityData } = stats
    var labels = getLabels(stats.action)
    var num = activityData.length === 0 ? 0 : activityData[indexDisplay].num
    return ( <Text> {`${num} ${labels.numLabel}`} </Text> )
  }

  var { stats, indexDisplay, renderSecondary } = props
  return (
    <View styles={[styles.imageSlide, styles[stats.action]]}> 
      <Text>Img should go here!</Text>
      {/* <img src={stats.imageUrl} alt="loading..."/> */}
      {renderNum(stats, indexDisplay)}
      {renderSecondary()}
    </View>
  )
}
ImageSlide.contextType = UserDataContext
const styles = StyleSheet.create({
  imageSlide: {
    height: 200,
    marginTop: 15,
    width: 200,
    borderRadius: 50,
    backgroundColor: 'white',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  run: {
    borderColor: runTheme
  },
  swim: {
    borderColor: swimTheme
  },
  jump: {
    borderColor: jumpTheme
  }
})
export default ImageSlide
