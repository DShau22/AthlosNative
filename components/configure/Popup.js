import React from 'react'
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native'
import { Text, Button, ListItem } from 'react-native-elements'
import { DEVICE_CONFIG_CONSTANTS, DEFAULT_CONFIG, MODES } from './DeviceConfigConstants'
const { MUSIC_ONLY, RUN, SWIM, JUMP, SWIMMING_EVENT, TIMED_RUN } = DEVICE_CONFIG_CONSTANTS
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
// popup stuff
import Modal, {
  ModalContent,
  ModalTitle,
  SlideAnimation,
} from 'react-native-modals';

export default function Popup(props) {
  const { adding, setAdding, setDeviceConfig } = props

  const addMode = (item) => {

  }
  return (
    <Modal
      visible={adding}
      onTouchOutside={() => setAdding(false)}
      modalAnimation={new SlideAnimation({
        slideFrom: 'bottom',
      })}
      modalTitle={
        <ModalTitle
          title="Add another activity"
          align="center"
        />
      }
      width={.9}
    >
      <ModalContent>
        <FlatList
          data={DEFAULT_CONFIG}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItemStyle}
              onPress={() => {
                setDeviceConfig(prevConfig => [...prevConfig, MODES[item.mode]])
                setAdding(false)
              }}
            >
              <LinearGradient
                style={styles.linearGradient}
                colors={modeGradients[item.mode]}
              >
                <View>
                  <Text h3 style={styles.modeTitleStyles}>{item.mode}</Text>
                </View>
                <View>
                  <Text style={styles.modeSubtitleStyles}>{item.subtitle}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.mode}
        />
      </ModalContent>
    </Modal>
  )
}
// ARRAYS FOR LINEARGRADIENT COMPONENTS BASED ON MODE
const modeGradients = {}
modeGradients[MUSIC_ONLY] = ['#401823', '#3b5998', '#192f6a']
modeGradients[RUN] = ['#4c669f', '#3b5998', '#192f6a']
modeGradients[SWIM] = ['#2113A4', '#6527CB', '#6B1B75']
modeGradients[JUMP] = ['#4c669d', '#3b5998', '#297522']
modeGradients[SWIMMING_EVENT] = ['#A40F3C', '#3b5998', '#192f6a']
modeGradients[TIMED_RUN] = ['#A48226', '#3b5998', '#192f6a']

const styles = StyleSheet.create({
  listItemStyle: {
    marginTop: 10,
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
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 10,
    paddingTop: 10,
    borderRadius: 8
  }
})