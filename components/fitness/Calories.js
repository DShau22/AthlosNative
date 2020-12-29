import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLOR_THEMES } from '../ColorThemes'
import ThemeText from '../generic/ThemeText'

MaterialCommunityIcons.loadFont()
export default function Calories( props ) {
  const { cals, activity } = props;
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
    <View style={[styles.caloriesCircle, {borderColor: getColorTheme()}]}>
      <MaterialCommunityIcons
        name='fire'
        style={[styles.fire, {color: getColorTheme()}]}
      />
      <ThemeText>{cals}</ThemeText>
    </View>
  )
}
const styles = StyleSheet.create({
  caloriesCircle: {
    height: 75,
    width: 75,
    borderRadius: 50,
    borderWidth: 5,
    // backgroundColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center'
  },
  fire: {
    fontSize: 30,
  }
})

