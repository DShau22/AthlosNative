import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import ThemeText from '../generic/ThemeText';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
EvilIcons.loadFont();
export default function SettingsButton(props) {
  const { onPress } = props;
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={styles.buttonStyle}
      onPress={onPress}
    >
      <EvilIcons name='gear' color={colors.textColor} size={45}/>
      
    </TouchableOpacity>
  )
}
const styles = StyleSheet.create({
  buttonStyle: {
    position: 'absolute',
    right: 0,
  }
})
