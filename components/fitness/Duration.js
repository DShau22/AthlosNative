import React from 'react'
import { View, Text } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
FontAwesome.loadFont();

export default function Duration( props ) {
  return (
    <View className="duration-circle">
      <FontAwesome icon="clock"/>
      <Text>{props.duration / 10}</Text>
    </View>
  )
}
