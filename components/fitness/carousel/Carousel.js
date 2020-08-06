import { StyleSheet, View, Text, TouchableOpacity, Button, ScrollView } from "react-native"
import DropDownPicker from 'react-native-dropdown-picker';
import ImageSlide from "./ImageSlide"
// import "./Carousel.css"
import Arrow from "./Arrow"
import React from 'react'
import { parseDate } from "../../utils/unitConverter"
import { ProgressCircle } from 'react-native-svg-charts'
import { useTheme } from '@react-navigation/native';

const Carousel = (props) => {
  const { colors } = useTheme();
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
  const dropDownItems = createDropdownItems();
  const initialDropdownText = dropDownItems.length === 0 ? 
    `You have no recorded ${stats.action.toLowerCase()} sessions`: dropDownItems[0].label
  return (
    <View style={styles.carousel}>
      <DropDownPicker
        items={dropDownItems}
        defaultValue={activityIndex}
        disabled={dropDownItems.length === 0}
        placeholder={initialDropdownText}
        containerStyle={{height: 40}}
        style={{...styles.dropdownStyle, backgroundColor: colors.dropdown}}
        labelStyle={{
          fontSize: 14,
          textAlign: 'left',
          color: colors.textColor
        }}
        dropDownStyle={{backgroundColor: colors.dropdown}}
        onChangeItem={item => {
          // set the activity index to what it should be (item.value)
          dropdownItemClick(item.value)
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
    // backgroundColor: 'red',
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
