import { StyleSheet, View, Text, TouchableOpacity, Button, ScrollView } from "react-native"
import DropDownPicker from 'react-native-dropdown-picker';
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
<<<<<<< HEAD

  const createDropdownItems = () => {
    let result = []
    stats.activityData.forEach((session, idx) => {
      var parsed = parseDate(new Date(session.uploadDate))
      var dayMonth = parsed[0] + ", " + parsed[1] + " " + parsed[2]
      result.push({
        label: dayMonth,
        value: idx
      })
    })
    return result
  }
  console.log(createDropdownItems())

  return (
    <View style={styles.carousel}>
      <DropDownPicker
        items={createDropdownItems()}
        defaultValue={stats.activityData[activityIndex].uploadDate}
        containerStyle={{height: 40}}
        style={{backgroundColor: '#fafafa'}}
        dropDownStyle={{backgroundColor: '#fafafa'}}
        onChangeItem={item => {
          // set the activity index to what it should be (item.value)
          dropdownItemClick(item.value)
        }}
      />
      {/* <Dropdown
        label={displayDate()}
        data={dates}
        onChangeText={(value, idx, data) => {
          console.log("idx: ", idx)
          dropdownItemClick(idx)
=======
  const makeDropdownItems = () => {
    let dates = [];
    stats.activityData.forEach((session, idx) => {
      var parsed = parseDate(new Date(session.uploadDate))
      var dayMonth = parsed[0] + ", " + parsed[1] + " " + parsed[2]
      dates.push({
        label: dayMonth,
        value: idx,
      })
    })
    if (dates === undefined || dates.length === 0) {
      dates.push({
        label: "You have no records yet :(",
        value: 0
      })
    }
    return dates
  }
  console.log("dropdown items: ", makeDropdownItems())
  const items = makeDropdownItems();
  return (
    <View style={styles.carousel}>
      <DropDownPicker
        items={items}
        defaultValue={items[0].value}
        containerStyle={{height: 40}}
        style={styles.dropdownStyle}
        dropDownStyle={{backgroundColor: '#fafafa'}}
        onChangeItem={(item) => {
          dropdownItemClick(item.value);
>>>>>>> dropdown
        }}
      />
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
  dropdownStyle: {
    backgroundColor: '#fafafa',
    width: '100%',
    height: 100,
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
