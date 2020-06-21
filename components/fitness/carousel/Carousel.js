import { StyleSheet, View, Text, TouchableOpacity, Button, ScrollView } from "react-native"

import ImageSlide from "./ImageSlide"
// import "./Carousel.css"
import Arrow from "./Arrow"
import React from 'react'
import { parseDate } from "../../utils/unitConverter"

// const jumpActivity = "jump"
// const runActivity = "run"
// const swimActivity = "swim"

const Carousel = (props) => {
  const getDropdownDates = (stats) => {
    var { dropdownItemClick } = props
    var dropdownItems = []
    stats.activityData.forEach((session, idx) => {
      var parsed = parseDate(new Date(session.uploadDate))
      var dayMonth = parsed[0] + ", " + parsed[1] + " " + parsed[2]
      dropdownItems.push(
        <TouchableOpacity
          onPress={dropdownItemClick}
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

  var { stats, previousSlide, nextSlide, activityIndex, displayDate, renderSecondary } = props
  return (
    <View styles={styles.carousel}>
      <View className="btn-group dropdown">
        <Button
          title={displayDate()}
          className="btn btn-secondary btn-sm mt-3 dropdown-toggle"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        />
        <ScrollView styles={styles.activitiesDropdown}>
          {getDropdownDates(stats)}
        </ScrollView>
      </View>

      <View styles={styles.slideShow}>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activitiesDropdown: {
    height: 'auto',
    maxHeight: 250,
  },
  slideShow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
export default Carousel
