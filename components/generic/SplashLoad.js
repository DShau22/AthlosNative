import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import ThemeText from './ThemeText';

export default function SplashLoad() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, {backgroundColor: colors.header}]}>
      <ThemeText>Loading...</ThemeText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }
});