import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
FontAwesome.loadFont();

export default function Calories( props ) {
  return (
    <View styles={styles.caloriesCircle}>
      <FontAwesome icon="fire-alt"/>
      <Text>{props.cals}</Text>
    </View>
  )
}
const styles = StyleSheet.create({
  caloriesCircle: {
    height: 75,
    width: 75,
    backgroundColor: '#bbb',
    borderRadius: 50,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

