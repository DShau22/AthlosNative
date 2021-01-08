import React from 'react';
import { View, Image, StyleSheet, FlatList } from 'react-native';
import { Text, Button } from 'react-native-elements';
import Modal, {
  ModalContent,
  ModalTitle,
  FadeAnimation,
} from 'react-native-modals';
import SaveCancelFooter from './SaveCancelFooter'
import { DEVICE_CONFIG_CONSTANTS, DEFAULT_CONFIG, MODES } from '../DeviceConfigConstants'
const { MUSIC_ONLY, MUSIC_ONLY_SUBTITLE } = DEVICE_CONFIG_CONSTANTS
const ANIMATION_DURATION = 150
import GenericModal from './GenericModal'

const templateSongs = [
  {
    title: 'History',
    artist: 'Rich Brian',
  },
  {
    title: 'Perfect',
    artist: 'Logic'
  }
]

const MusicPopup = (props) => {
  const { editModeItem, setDeviceConfig, visible, setVisible } = props;
  React.useEffect(() => {
    // do some stuff here. This might be pretty special cuz this will just be a big array of song objects
    // if (editModeItem.mode === MUSIC_ONLY) setReportMetric(editModeItem.metric)
  }, [editModeItem])

  const saveEdits = () => {
    // save the song orders and whether or not to shuffle or play in order
    console.log('saving music edits...')
  }
  
  const resetState = () => {
    setVisible(false);
  }

  return (
    <GenericModal
      isVisible={visible}
      setVisible={setVisible}
      titleText='Edit Music Settings'
      height='40%'
    >
      <View style={styles.container}>
        <Text>Add shuffle or in order button here</Text>
      </View>
    </GenericModal>
  )
}

export default MusicPopup;
const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // width: '100%',
    // height: '100%',
  },
  flatList: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // width: '100%',
    // height: '100%',
  },
})