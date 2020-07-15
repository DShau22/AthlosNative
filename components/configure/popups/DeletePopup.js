import React from 'react'
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native'
import { Text, Button, ListItem } from 'react-native-elements'
import { DEVICE_CONFIG_CONSTANTS, DEFAULT_CONFIG, MODES } from '../DeviceConfigConstants'
const { MUSIC_ONLY, RUN, SWIM, JUMP, SWIMMING_EVENT, TIMED_RUN } = DEVICE_CONFIG_CONSTANTS
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
// popup stuff
import Modal, {
  ModalContent,
  ModalTitle,
  SlideAnimation,
  ModalFooter,
  ModalButton
} from 'react-native-modals';

export default function DeletePopup(props) {
  const { deleting, setDeleting, deleteMode } = props
  return (
    <Modal
      visible={deleting}
      onTouchOutside={() => setDeleting(false)}
      modalAnimation={new SlideAnimation({
        slideFrom: 'bottom',
      })}
      footer={
        <ModalFooter>
          <ModalButton
            text="CANCEL"
            onPress={() => {}}
          />
          <ModalButton
            text="OK"
            onPress={() => deleteMode()}
          />
        </ModalFooter>
      }
      // modalTitle={
      //   <ModalTitle
      //     title="Deleting"
      //     align="center"
      //   />
      // }
      width={.9}
    >
      <ModalContent>
        <Text>fawefawef</Text>
      </ModalContent>
    </Modal>
  )
}
