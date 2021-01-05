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

  const { activityJson, previousSlide, nextSlide, weekIndex, dayIndex, dropdownItemClick } = props

  // get each week in the activityData
  const createDropdownItems = () => {
    const { activityData } = activityJson;
    let weeks = [];
    activityData.forEach((week, i) => {
      let monday = parseDate(week[0].uploadDate);
      let sunday = parseDate(week[week.length - 1].uploadDate);
      let dayMonth = `${monday[1]} ${monday[2]} - ${sunday[1]} ${sunday[2]}, ${sunday[3]}`
      weeks.push({
        timeStamp: monday,
        label: dayMonth,
        value: i,
      });
    });
    return weeks;
  }
  const dropDownItems = createDropdownItems();
  const initialDropdownText = dropDownItems.length === 0 ? 
    `You have no recorded ${activityJson.action.toLowerCase()} sessions`: dropDownItems[0].label
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
          activity={activityJson.action}
        />

        <ImageSlide
          activityJson={activityJson}
          weekIndex={weekIndex}
          dayIndex={dayIndex}
        />

        <Arrow
          direction="right"
          clickFunction={ nextSlide }
          glyph="&#8250;"
          activity={activityJson.action}
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
