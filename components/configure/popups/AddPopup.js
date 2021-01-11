import React from 'react'
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native'
import { Text, } from 'react-native-elements'
import { DEVICE_CONFIG_CONSTANTS, getDefaultModeObject } from '../DeviceConfigConstants'
const { MUSIC_ONLY, RUN, SWIM, JUMP, SWIMMING_EVENT, TIMED_RUN } = DEVICE_CONFIG_CONSTANTS
import LinearGradient from 'react-native-linear-gradient';
import GenericModal from './GenericModal'

// ARRAYS FOR LINEARGRADIENT COMPONENTS BASED ON MODE
const modeGradients = {}
modeGradients[MUSIC_ONLY] = ['#401823', '#3b5998', '#192f6a']
modeGradients[RUN] = ['#4c669f', '#3b5998', '#192f6a']
modeGradients[SWIM] = ['#2113A4', '#6527CB', '#6B1B75']
modeGradients[JUMP] = ['#4c669d', '#3b5998', '#297522']
modeGradients[SWIMMING_EVENT] = ['#A40F3C', '#3b5998', '#192f6a']
modeGradients[TIMED_RUN] = ['#A48226', '#3b5998', '#192f6a']

export default function AddPopup(props) {
  const { adding, setAdding, setDeviceConfig, deviceConfig } = props

  return (
    <GenericModal
      isVisible={adding}
      setVisible={setAdding}
      titleText='Add another activity'
      height='80%'
    >
      {deviceConfig.map((modeObject, idx) => {
        return (
          <TouchableOpacity
            key={idx}
            style={styles.listItemStyle}
            onPress={() => {
              setDeviceConfig(prevConfig => [...prevConfig, getDefaultModeObject(modeObject.mode)])
              setAdding(false)
            }}
          >
            <LinearGradient
              style={styles.linearGradient}
              colors={modeGradients[modeObject.mode]}
            >
              <View>
                <Text h3 style={styles.modeTitleStyles}>{modeObject.mode}</Text>
              </View>
              <View>
                <Text style={styles.modeSubtitleStyles}>{modeObject.subtitle}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )
      })}
    </GenericModal>
  )
}

const styles = StyleSheet.create({
  listItemStyle: {
    marginTop: 10,
    flex: 1,
  },
  modeTitleStyles: {
    width: '100%',
    color: 'white'
  },
  modeSubtitleStyles: {
    width: '100%',
    color: 'white'
  },
  linearGradient: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 10,
    paddingTop: 10,
    borderRadius: 8
  }
})