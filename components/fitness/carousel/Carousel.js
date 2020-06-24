import { StyleSheet, View, Text, TouchableOpacity, Button, ScrollView } from "react-native"
import {
  Dropdown
} from 'react-native-material-dropdown';
import ImageSlide from "./ImageSlide"
// import "./Carousel.css"
import Arrow from "./Arrow"
import React from 'react'
import { parseDate } from "../../utils/unitConverter"
import { ProgressCircle } from 'react-native-svg-charts'

// const jumpActivity = "jump"
// const runActivity = "run"
// const swimActivity = "swim"

const Carousel = (props) => {
  const getDropdownDates = () => {
    var { dropdownItemClick, stats } = props
    var dropdownItems = []
    stats.activityData.forEach((session, idx) => {
      var parsed = parseDate(new Date(session.uploadDate))
      var dayMonth = parsed[0] + ", " + parsed[1] + " " + parsed[2]
      dropdownItems.push(
        <TouchableOpacity
          onPress={() => dropdownItemClick(idx)}
          className="dropdown-item"
          key={"dropdown_" + idx}
          id={idx}
        >
          <Text> {dayMonth} </Text>
        </TouchableOpacity>
      )
    })
    return dropdownItems
  }

  var { stats, previousSlide, nextSlide, activityIndex, displayDate, renderSecondary, dropdownItemClick } = props
  var dates = []
  stats.activityData.forEach((session, idx) => {
    var parsed = parseDate(new Date(session.uploadDate))
    var dayMonth = parsed[0] + ", " + parsed[1] + " " + parsed[2]
    dates.push({
      value: dayMonth,
    })
  })
  return (
    <View style={styles.carousel}>
      {/* <Dropdown
        label={displayDate()}
        data={dates}
        onChangeText={(value, idx, data) => {
          console.log("idx: ", idx)
          dropdownItemClick(idx)
        }}
        containerStyle={{ width: '80%' }}
      /> */}
      <View style={styles.slideShow}>
        <Arrow
          direction="left"
          clickFunction={ previousSlide }
          glyph="&#8249;"
          activity={stats.action}
        />

        <ImageSlide
          stats={stats}
          indexDisplay={activityIndex}
          renderSecondary={renderSecondary}
        />

        <Arrow
          direction="right"
          clickFunction={ nextSlide }
          glyph="&#8250;"
          activity={stats.action}
        />
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  carousel: {
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  activitiesDropdown: {
    height: 'auto',
    maxHeight: 250,
  },
  slideShow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
export default Carousel
