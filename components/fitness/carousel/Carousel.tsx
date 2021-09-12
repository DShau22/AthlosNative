import { StyleSheet, View, Text, TouchableOpacity, Button, ScrollView } from "react-native"
import ImageSlide from "./ImageSlide"
import Arrow from "./Arrow"
import React from 'react'
import GLOBAL_CONSTANTS from '../../GlobalConstants';
const { SCREEN_HEIGHT, SCREEN_WIDTH } = GLOBAL_CONSTANTS;import { useTheme } from '@react-navigation/native';
import MenuPrompt from "../../configure/screens/MenuPrompt";
const { DateTime } = require('luxon');

const Carousel = (props) => {
  const { colors } = useTheme();
  const [showCalendar, setShowCalendar] = React.useState<boolean>(false);
  const { activityJson, previousSlide, nextSlide, weekIndex, dayIndex, pullUpMenuSelect } = props;

  // get each week in the activityData
  // CHANGE THIS THEN CHANGE IT IN PULL UP MENU SELECT IN WITH FITNESS PAGE TOO
  const createMenuItems = () => {
    const { activityData } = activityJson;
    let weeks = [];
    activityData.forEach((week, _) => {
      if (week) {
        let monday = DateTime.fromISO(week[0].uploadDate);
        let sunday = DateTime.fromISO(week[week.length - 1].uploadDate);
        let dayMonth = `${monday.monthShort} ${monday.day} - ${sunday.monthShort} ${sunday.day}, ${sunday.year}`
        weeks.push(dayMonth);
      }
    });
    return weeks;
  }
  const menuItems = React.useMemo(() => createMenuItems(), [activityJson]);
  const promptTitle = menuItems[weekIndex];
  return (
    <View style={styles.carousel}>
      {/* <MenuPrompt
        promptTitle={promptTitle}
        childArrays={[
          {
            title: 'Week',
            width: SCREEN_WIDTH,
            array: menuItems,
          }
        ]}
        selectedItems={[menuItems[weekIndex]]}
        onSave={weekDate => pullUpMenuSelect(weekDate)}
        pullUpTitle="Week"
      /> */}
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
