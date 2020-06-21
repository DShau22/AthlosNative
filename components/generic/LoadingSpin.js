import React from 'react'
import { ActivityIndicator, StyleSheet, Text, View, TouchableWithoutFeedback } from "react-native";

export default function LoadingSpin() {
  return (
    <View styles={[styles.container, styles.horizontal]}>
      <Text>Later add a logo here!</Text>
      <ActivityIndicator size="large" color="#00ff00" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
    position: 'absolute', 
    top: 0, left: 0, 
    right: 0, bottom: 0,
    backgroundColor: 'black',
  }
})