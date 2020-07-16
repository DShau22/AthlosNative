import React from 'react'
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native'
import { Text, Button } from 'react-native-elements'
import { DEVICE_CONFIG_CONSTANTS, DEFAULT_CONFIG, MODES } from '../DeviceConfigConstants'
const { HANGTIME, VERTICAL_HEIGHT, JUMP, JUMP_SUBTITLE } = DEVICE_CONFIG_CONSTANTS
import LinearGradient from 'react-native-linear-gradient';
import SwitchSelector from "react-native-switch-selector";

import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont()
// popup stuff
import Modal, {
  ModalContent,
  ModalTitle,
  FadeAnimation,
} from 'react-native-modals';
import SaveCancelFooter from './SaveCancelFooter'
const ANIMATION_DURATION = 150
export default function JumpEditPopup(props) {
  const { visible, setVisible, setDeviceConfig, editModeItem, } = props;
  // report either vertical height or hangtime
  const [reportMetric, setReportMetric] = React.useState(editModeItem.metric);
  // editModeItem is always {} initially, but these comps still render
  // this is to make sure when props change the states get updated to
  // since state w/hooks doesnt update with props change
  React.useEffect(() => {
    if (editModeItem.mode === JUMP) setReportMetric(editModeItem.metric)
  }, [editModeItem])

  const saveEdits = () => {
    // depending on the edit mode
    setDeviceConfig(prevConfig => {
      const newModeSettings = {
        mode: JUMP,
        subtitle: JUMP_SUBTITLE,
        backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${5}, ${132})`,
        metric: reportMetric
      };
      const index = prevConfig.indexOf(editModeItem)
      prevConfig[index] = newModeSettings
      console.log('new jump edits:', prevConfig)
      return prevConfig
    })
    setVisible(false);
  }

  const resetState = () => {
    setVisible(false);
  }

  const renderJumpEditModalContent = () => {
    return (
      <View style={styles.innerEditContainer}>
        <Text style={styles.reportMetricLabel}>What to report?</Text>
        <SwitchSelector
          style={styles.reportMetricSwitch}
          initial={editModeItem.metric === VERTICAL_HEIGHT ? 0 : 1}
          onPress={value => setReportMetric(value)}
          textColor='#7a44cf' // purple
          selectedColor='white'
          buttonColor='#7a44cf'
          borderColor='#7a44cf'
          hasPadding
          options={[
            { label: "Vertical Height", value: VERTICAL_HEIGHT },
            { label: "Hangtime", value: HANGTIME }
          ]}
        />
      </View>
    )
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
          title={`Edit Jump Settings`}
          align="center"
        />
      }
      width={.9}
    >
      <ModalContent>
        <View style={styles.container}>
          {renderJumpEditModalContent()}
          <SaveCancelFooter
            saveEdits={saveEdits}
            resetState={resetState}
          />
        </View>
      </ModalContent>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {

  },
  innerEditContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportMetricLabel: {
    fontSize: 20,
    marginTop: 20
  },
  reportMetricSwitch: {
    marginTop: 30,
    width: '80%',
  },
})