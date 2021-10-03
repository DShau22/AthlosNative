import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import {COLOR_THEMES} from "../../ColorThemes";
const { RUN_THEME, SWIM_THEME, JUMP_THEME, HIIT_THEME } = COLOR_THEMES;

export interface ArrowProps {
  direction: string,
  clickFunction: Function,
  glyph: string,
  activity?: string,
  style?: any,
  textStyle?: any,
}

const Arrow: React.FC<ArrowProps> = ({ direction, clickFunction, glyph, activity, style, textStyle }) => (
  <TouchableOpacity
    style={[styles.slideArray, styles[direction.toLowerCase()], styles[activity?.toLowerCase()], style]}
    onPress={ clickFunction }
  >
    <Text style={[styles.glyphStyle, styles[activity?.toLowerCase()], textStyle]}>{ glyph }</Text>
  </TouchableOpacity>
);
const styles = StyleSheet.create({
  slideArrow: {
    fontSize: 3,
    marginLeft: 8,
  },
  glyphStyle: {
    fontSize: 90,
  },
  right: {
    marginLeft: 8
  },
  left: {
    marginRight: 8
  },
  run:  { color: RUN_THEME },
  swim: { color: SWIM_THEME },
  jump: { color: JUMP_THEME },
  interval: { color: HIIT_THEME }
});
export default Arrow
