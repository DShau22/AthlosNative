import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '@react-navigation/native';
import { COLOR_THEMES } from '../ColorThemes'

export default function Duration( props ) {
  const { colors } = useTheme();
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
      <Icon name="clock" style={styles.clock}/>
      <Text style={styles.text}>{duration / 10}</Text>
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
  clock: { fontSize: 25 }
})