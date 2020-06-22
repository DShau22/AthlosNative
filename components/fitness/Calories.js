import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Calories( props ) {
  return (
    <View style={styles.caloriesCircle}>
      <Icon name="fire" style={styles.fire}/>
      <Text>{props.cals}</Text>
    </View>
  )
}
const styles = StyleSheet.create({
  caloriesCircle: {
    height: 75,
    width: 75,
    borderRadius: 50,
    backgroundColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {

  },
  fire: { fontSize: 30 }
})

