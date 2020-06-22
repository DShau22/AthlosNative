import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/Feather';
export default function Duration( props ) {
  return (
    <View style={styles.durationCircle}>
      <Icon name="clock" style={styles.clock}/>
      <Text style={styles.text}>{props.duration / 10}</Text>
    </View>
  )
}
const styles = StyleSheet.create({
  durationCircle: {
    height: 75,
    width: 75,
    backgroundColor: '#bbb',
    borderRadius: 50,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {

  },
  clock: { fontSize: 25 }
})