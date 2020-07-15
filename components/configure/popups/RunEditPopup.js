import React from 'react'
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native'
import { Text, Button } from 'react-native-elements'
import { DEVICE_CONFIG_CONSTANTS, DEFAULT_CONFIG, MODES } from '../DeviceConfigConstants'
const { TRIGGER_MIN, TRIGGER_STEPS, RUN, RUN_SUBTITLE } = DEVICE_CONFIG_CONSTANTS
import LinearGradient from 'react-native-linear-gradient';
import SwitchSelector from "react-native-switch-selector";

import UpDownButton from './UpDownButton'
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont()
// popup stuff
import Modal, {
  ModalContent,
  ModalTitle,
  FadeAnimation,
} from 'react-native-modals';

const ANIMATION_DURATION = 150
export default function RunEditPopup(props) {
  // number of steps/minutes
  const [runNumber, setRunNumber] = React.useState(1);
  const [runTrigger, setRunTrigger] = React.useState(TRIGGER_MIN);

  const { visible, setVisible, setDeviceConfig, editModeIdx, } = props;

  React.useEffect(() => {
    setTimeout(() => {
      setRunNumber(1);
      setRunTrigger(TRIGGER_MIN);
    }, ANIMATION_DURATION);
  }, [visible])

  const saveEdits = () => {
    // depending on the edit mode
    setDeviceConfig(prevConfig => {
      const newModeSettings = {
        mode: RUN,
        subtitle: RUN_SUBTITLE,
        backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${5}, ${132})`,
        trigger: runTrigger,
        frequency: runTrigger === TRIGGER_MIN ? runNumber : runNumber * 100
      };
      prevConfig[editModeIdx] = newModeSettings
      console.log('aiodwja', prevConfig)
      return prevConfig
    })
  }

  const resetState = () => {
    setVisible(false);
  }

  const renderRunEditModalContent = () => {
    return (
      <View style={styles.innerEditRunContainer}>
        <Text>Report feedback every</Text>
        <UpDownButton
          number={runTrigger === TRIGGER_MIN ? runNumber : runNumber * 100}
          // factor is positive or negative for increase/decrease
          incNumber={() => { setRunNumber(prev => Math.min(10, prev + 1)) }}
          decNumber={() => { setRunNumber(prev => Math.max(1, prev - 1)) }}
        />
        <SwitchSelector
          style={styles.runTriggerSwitch}
          initial={0}
          onPress={value => setRunTrigger(value)}
          textColor='#7a44cf' // purple
          selectedColor='white'
          buttonColor='#7a44cf'
          borderColor='#7a44cf'
          hasPadding
          options={[
            { label: "Min", value: TRIGGER_MIN },
            { label: "Steps", value: TRIGGER_STEPS }
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
          title={`Edit Run Settings`}
          align="center"
        />
      }
      width={.9}
    >
      <ModalContent>
        <View style={styles.container}>
          {renderRunEditModalContent()}
          <View style={styles.saveCancelContainer}>
            <Button
              style={styles.cancelButton}
              title='Cancel'
              type='outline'
              onPress={resetState}
            />
            <Button
              style={styles.saveButton}
              title='Save'
              onPress={saveEdits}
            />
          </View>
        </View>
      </ModalContent>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {

  },
  innerEditRunContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  runTriggerSwitch: {
    width: '30%',
  },
  saveCancelContainer: {
    marginTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  saveButton: {
    width: 80,
    marginLeft: 15
  },
  cancelButton: {
    width: 80
  }
})
