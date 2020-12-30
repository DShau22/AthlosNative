import React from 'react';
import { View, StyleSheet, Text } from "react-native";
import { UserDataContext } from "../../../Context";
import { COLOR_THEMES } from "../../ColorThemes";
import * as Animatable from 'react-native-animatable';
import { ProgressCircle } from 'react-native-svg-charts';
import { useTheme } from '@react-navigation/native';

import FITNESS_CONSTANTS from '../../fitness/FitnessConstants';
import ThemeText from '../../generic/ThemeText';
import CustomIcons from '../../../CustomIcons';
CustomIcons.loadFont();
import Icon from 'react-native-vector-icons/dist/Feather';

const { RUN_THEME, SWIM_THEME, JUMP_THEME } = COLOR_THEMES;
const ImageSlide = (props) => {
  const { colors } = useTheme();
  const getLabels = (action) => {
    var { unitSystem } = React.useContext(UserDataContext).settings
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

  const renderNum = (stats, indexDisplay, style) => {
    var { activityData } = stats
    var labels = getLabels(stats.action)
    var num = activityData.length === 0 ? 0 : activityData[indexDisplay].num
    return (
      <ThemeText style={style}> {`${num} ${labels.numLabel}`} </ThemeText>
      // <Animatable.Text animation="slideInLeft">{`${num} ${labels.numLabel}`}</Animatable.Text>
    )
  }

  const getActivityColor = () => {
    switch (props.stats.action) {
      case FITNESS_CONSTANTS.RUN:
        return RUN_THEME;
      case FITNESS_CONSTANTS.SWIM:
        return SWIM_THEME;
      default:
        return JUMP_THEME;
    }
  }

  var { stats, indexDisplay } = props
  return (
    <View style={styles.imageSlide}> 
      <ProgressCircle 
        style={{ height: '100%', width: '100%' }}
        progress={stats.action === FITNESS_CONSTANTS.SWIM ? 0.20 : 0.7}
        progressColor={getActivityColor()}
        backgroundColor={colors.backgroundOffset}
        strokeWidth={8}
      />
      {actionToIcon[stats.action]}
      {/* <ThemeText style={{ position: 'absolute', top: '35%'}}>Img should go here!</ThemeText> */}
      {/* add data through props */}
      {/* <img src={stats.imageUrl} alt="loading..."/> */}
      {renderNum(stats, indexDisplay, styles.number)}
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
