import React from 'react';
import { View, StyleSheet, Text } from "react-native";
import { UserDataContext } from "../../../Context";
import { COLOR_THEMES } from "../../ColorThemes";
import * as Animatable from 'react-native-animatable';
import { ProgressCircle } from 'react-native-svg-charts';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/dist/Feather';
import CustomIcons from '../../../CustomIcons';
CustomIcons.loadFont();

import FITNESS_CONSTANTS from '../../fitness/FitnessConstants';
import ThemeText from '../../generic/ThemeText';
const { DateTime } = require('luxon');

const { RUN_THEME, SWIM_THEME, JUMP_THEME } = COLOR_THEMES;
const ImageSlide = (props) => {
  const { activityJson, weekIndex, dayIndex } = props;
  const { activityData } = activityJson;
  const { uploadDate } = activityData[weekIndex][dayIndex];
  const { colors } = useTheme();
  const userDataContext = React.useContext(UserDataContext);
  const { settings, goals } = userDataContext;
  const { unitSystem } = settings;
  const getLabels = (action) => {
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

  const actionToIcon = {};
  actionToIcon[FITNESS_CONSTANTS.RUN]  = <CustomIcons name='running' style={{position: 'absolute', top: '35%', color: 'white'}} size={50}/>
  actionToIcon[FITNESS_CONSTANTS.SWIM] = <CustomIcons name='swimmer' style={{position: 'absolute', top: '35%', color: 'white'}} size={50}/>
  actionToIcon[FITNESS_CONSTANTS.JUMP] = <Icon name='chevrons-up' style={{position: 'absolute', top: '35%', color: 'white'}} size={50}/>

  const renderNum = (style) => {
    var labels = getLabels(activityJson.action);
    var num = activityData.length === 0 ? 0 : activityData[weekIndex][dayIndex].num;
    return (
      <ThemeText style={style}> {`${num} ${labels.numLabel}`} </ThemeText>
    );
  }

  const renderDate = () => {
    const parsed = DateTime.fromISO(uploadDate);
    const dateDisplay = `${parsed.weekdayShort}, ${parsed.month}/${parsed.day}`;
    return (
      <ThemeText style={{
        position: 'absolute',
        top: '20%',
        fontSize: 16,
      }}>
        {dateDisplay}
      </ThemeText>
    );
  }

  const getActivityColor = () => {
    switch (activityJson.action) {
      case FITNESS_CONSTANTS.RUN:
        return RUN_THEME;
      case FITNESS_CONSTANTS.SWIM:
        return SWIM_THEME;
      default:
        return JUMP_THEME;
    }
  }

  const calcWeeklyProgress = () => {
    var aggregateProgress = 0;
    switch (activityJson.action) {
      case FITNESS_CONSTANTS.RUN:
        for (let i = 0; i <= dayIndex; i++) {
          aggregateProgress += activityData[weekIndex][i].num;
        }
        return aggregateProgress / goals.goalSteps;
      case FITNESS_CONSTANTS.SWIM:
        for (let i = 0; i <= dayIndex; i++) {
          aggregateProgress += activityData[weekIndex][i].num;
        }
        return aggregateProgress / goals.goalLaps;
      case FITNESS_CONSTANTS.JUMP:
        for (let i = 0; i <= dayIndex; i++) {
          const bestHeightOfDay =  Math.max(...activityData[weekIndex][i].heights);
          aggregateProgress = Math.max(aggregateProgress, bestHeightOfDay);
        }
        return aggregateProgress / goals.goalVertical;
      default: 
        break;
    }
  }


  return (
    <View style={styles.imageSlide}> 
      <ProgressCircle 
        style={{ height: '100%', width: '100%' }}
        progress={calcWeeklyProgress()}
        progressColor={getActivityColor()}
        backgroundColor={colors.backgroundOffset}
        strokeWidth={8}
      />
      {renderDate()}
      {actionToIcon[activityJson.action]}
      {renderNum(styles.number)}
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
    top: '65%',
    fontSize: 20
  },
  run:  { borderColor: RUN_THEME },
  swim: { borderColor: SWIM_THEME },
  jump: { borderColor: JUMP_THEME }
})
export default ImageSlide
