import React from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { runTheme, jumpTheme, swimTheme } from "../../Constants"
const Arrow = ({ direction, clickFunction, glyph, activity }) => (
  <TouchableOpacity
    style={[styles.slideArray, styles[direction], styles[activity.toLowerCase()]]}
    onPress={ clickFunction }
  >
    <Text style={[styles.glyphStyle, styles[activity.toLowerCase()]]}>{ glyph }</Text>
  </TouchableOpacity>
);
const styles = StyleSheet.create({
  slideArrow: {
    fontSize: 3,
    marginLeft: 8,
  },
  glyphStyle: {
    fontSize: 50,
  },
  right: {
    marginLeft: 8
  },
  left: {
    marginRight: 8
  },
  run:  { color: runTheme },
  swim: { color: swimTheme },
  jump: { color: jumpTheme }
});
export default Arrow
