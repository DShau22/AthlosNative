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
import ThemeText from '../../generic/ThemeText';
import { useTheme } from '@react-navigation/native';

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
  const { colors } = useTheme();
  const { editModeItem, setDeviceConfig, visible, setVisible } = props;
  React.useEffect(() => {
    // do some stuff here. This might be pretty special cuz this will just be a big array of song objects
    // if (editModeItem.mode === MUSIC_ONLY) setReportMetric(editModeItem.metric)
  }, [editModeItem])

  const saveEdits = () => {
    // save the song orders and whether or not to shuffle or play in order
  }
  
  const resetState = () => {
    setVisible(false);
  }

  return (
    <GenericModal
      isVisible={visible}
      setVisible={setVisible}
      titleText='Music Only mode'
      height='60%'
    >
      <View style={styles.container}>
        {/* add an icon or image here */}
        <View style={{width: '100%', height: 200, backgroundColor: colors.background}}>
          <ThemeText style={{alignSelf: 'center'}}>Add image here</ThemeText>
        </View>
        <ThemeText style={{marginTop: 10, fontSize: 16, color: 'black'}}>
          Workout and enjoy your favorite songs without needing to carry your phone with you.
          This mode plays the music stored on your device without tracking any activities. 
        </ThemeText>
        <ThemeText style={{marginTop: 10, fontSize: 14, color: 'grey'}}>
          The device always defaults to this mode when powered on.
          Visit ___ for instructions on how to store music on your device.
        </ThemeText>
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