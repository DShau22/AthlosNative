import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { runTheme, jumpTheme, swimTheme } from "../../Constants"
const Arrow = ({ direction, clickFunction, glyph, activity }) => (
  <View
    styles={[styles.slideArray, styles[direction], styles[activity]]}
    onClick={ clickFunction }
  >
    <Text>{ glyph }</Text>
  </View>
);
const styles = StyleSheet.create({
  slideArrow: {
    fontSize: 3,
    marginLeft: 8,
  },
  right: {
    marginLeft: 8
  },
  left: {
    marginRight: 8
  },
  run: {
    color: runTheme
  },
  swim: {
    color: swimTheme
  },
  jump: {
    color: jumpTheme
  }
});
export default Arrow
