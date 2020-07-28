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
    <Modal
      // the edit mode is not the empty string '' means it should be displayed
      visible={visible}
      onTouchOutside={() => setVisible(false)}
      modalAnimation={new FadeAnimation({
        initialValue: 0,
        animationDuration: ANIMATION_DURATION,
        useNativeDriver: true,
      })}
      modalTitle={
        <ModalTitle
          title={`Your Downloaded Music`}
          align="center"
        />
      }
      width={.9}
    >
      <ModalContent>
        <View style={styles.container}>
          <Text>Add shuffle or in order button here</Text>
          <FlatList
            contentContainerStyle={styles.flatList}
            data={templateSongs}
            keyExtractor={(item, idx) => `${item.title}-idx`}
            // probably have another draggable flatlist for reordering songs
            renderItem={({ item }) => (
              <>
                <Text>{item.title}</Text>
                <Text>{item.artist}</Text>
              </>
            )}
          />
        </View>
        <SaveCancelFooter
          saveEdits={saveEdits}
          resetState={resetState}
        />
      </ModalContent>
    </Modal>
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