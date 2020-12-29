import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLOR_THEMES } from '../ColorThemes';
import ThemeText from '../generic/ThemeText';

export default function Duration( props ) {
  const { duration, activity } = props;
  const getColorTheme = () => {
    switch(activity.toLowerCase()) {
      case 'run':
        return COLOR_THEMES.RUN_THEME
      case 'swim':
        return COLOR_THEMES.SWIM_THEME
      case 'jump':
        return COLOR_THEMES.JUMP_THEME
      default:
        return 'black'
    }
  }
  return (
    <View style={[styles.durationCircle, {borderColor: getColorTheme()}]}>
      <Icon name="clock" style={[styles.clock, {color: getColorTheme()}]}/>
      <ThemeText style={styles.text}>{duration / 10}</ThemeText>
    </View>
  )
}
const styles = StyleSheet.create({
  durationCircle: {
    height: 75,
    width: 75,
    borderRadius: 50,
    borderWidth: 5,
    // backgroundColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {

  },
  clock: {
    fontSize: 25,
  }
})