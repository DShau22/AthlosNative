import { StyleSheet, View, Text, TouchableOpacity, Button, ScrollView } from "react-native"
import DropDownPicker from 'react-native-dropdown-picker';
import ImageSlide from "./ImageSlide"
// import "./Carousel.css"
import Arrow from "./Arrow"
import React from 'react'
import { parseDate } from "../../utils/dates"
import { ProgressCircle } from 'react-native-svg-charts'
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/dist/Feather';

const Carousel = (props) => {
  const { colors } = useTheme();

  const { stats, previousSlide, nextSlide, weekIndex, dayIndex, dropdownItemClick } = props

  // get the past 26 weeks since today including the week of today
  const createDropdownItems = () => {
    let weeks = [];
    let lastMonday = new Date();
    let nextSunday = new Date();
    lastMonday.setDate(lastMonday.getDate() - lastMonday.getDay() + 1); // should be the monday of this week
    nextSunday.setDate(lastMonday.getDate() + 6);
    for (let i = 0; i < 26; i++) {
      let parsedMonday = parseDate(lastMonday);
      let parsedSunday = parseDate(nextSunday);
      let dayMonth = `${parsedMonday[1]} ${parsedMonday[2]} - ${parsedSunday[1]} ${parsedSunday[2]}, ${parsedSunday[3]}`
      weeks.push({
        timeStamp: lastMonday,
        label: dayMonth,
        value: i,
      });
      lastMonday.setDate(lastMonday.getDate() - 7);
      nextSunday.setDate(nextSunday.getDate() - 7);
    }

    // stats.activityData.forEach((session, idx) => {
    //   var parsed = parseDate(new Date(session.uploadDate))
    //   var dayMonth = `${parsed[0]}, ${parsed[1]} ${parsed[2]} ${parsed[3]}`
    //   weeks.push({
    //     label: dayMonth,
    //     value: idx,
    //     icon: () => {
    //       return activityIndex === idx ? 
    //         <Icon name="check" size={14} color={colors.textColor} />
    //       : null
    //     }
    //   })
    // })
    return weeks;
  }
  const dropDownItems = createDropdownItems();
  const initialDropdownText = dropDownItems.length === 0 ? 
    `You have no recorded ${stats.action.toLowerCase()} sessions`: dropDownItems[0].label
  return (
    <View style={styles.carousel}>
      <DropDownPicker
        items={dropDownItems}
        defaultValue={weekIndex} // this is needed for the dropdown date to change with the arrows
        disabled={dropDownItems.length === 0}
        placeholder={initialDropdownText}
        arrowColor={colors.textColor}
        arrowSize={21}
        containerStyle={{
          height: 40
        }}
        style={{
          width: '100%',
          height: 100,
          borderWidth: 0,
          backgroundColor: colors.header,
          // backgroundColor: 'orange',
        }}
        labelStyle={{
          fontSize: 14,
          color: colors.textColor,
          // backgroundColor: 'green'
        }}
        itemStyle={{
          // shifts the text all the way to the left
          flexDirection: 'row',
          justifyContent: 'flex-start',

          width: '100%',
          backgroundColor: colors.header,
          paddingLeft: 3,
          // backgroundColor: 'red',
        }}
        dropDownStyle={{
          backgroundColor: colors.header,
          // backgroundColor: 'white',
          borderWidth: 1,
          margin: 0,
          padding: 0,
        }}
        activeItemStyle={{
          backgroundColor: colors.backgroundOffset,
        }}
        onChangeItem={item => {
          // update the weekly activity data objects by passing in the start date of the week
          dropdownItemClick(item.value);
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
          weekIndex={weekIndex}
          dayIndex={dayIndex}
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
