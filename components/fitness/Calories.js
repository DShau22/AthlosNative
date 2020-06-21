import React from 'react'
import { View, Text } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
FontAwesome.loadFont();

export default function Calories( props ) {
  return (
    <View className="calories-circle">
      <FontAwesome icon="fire-alt"/>
      <Text>{props.cals}</Text>
    </View>
  )
}

