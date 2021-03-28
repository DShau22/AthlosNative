import { useTheme } from '@react-navigation/native';
import React from 'react'
import { ActivityIndicator, StyleSheet, Text, View, TouchableWithoutFeedback } from "react-native";

export default function LoadingSpin() {
  const { colors } = useTheme();
  console.log(colors)
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
    width: '100%',
    height: '100%',
  }
});