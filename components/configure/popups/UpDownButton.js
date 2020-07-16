import React from 'react'
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native'
import { Text, Tooltip } from 'react-native-elements'
import { DEVICE_CONFIG_CONSTANTS, DEFAULT_CONFIG, MODES } from '../DeviceConfigConstants'
const { MUSIC_ONLY, RUN, SWIM, JUMP, SWIMMING_EVENT, TIMED_RUN } = DEVICE_CONFIG_CONSTANTS
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont()

export default function UpDownButton(props) {
  const { number, incNumber, decNumber } = props
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={incNumber}
      >
        <Icon
          name='caretup'
          size={30}
          color='black'
        />
      </TouchableOpacity>
      <Text>{number}</Text>
      <TouchableOpacity
        onPress={decNumber}
      >
        <Icon
          name='caretdown'
          size={30}
          color='black'
        />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginRight: 10
  }
})