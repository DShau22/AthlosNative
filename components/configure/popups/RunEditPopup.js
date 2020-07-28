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

import SaveCancelFooter from './SaveCancelFooter'

const ANIMATION_DURATION = 150
export default function RunEditPopup(props) {
  const { visible, setVisible, setDeviceConfig, editModeItem } = props;
  const [runNumber, setRunNumber] = React.useState(1);
  const [runTrigger, setRunTrigger] = React.useState(TRIGGER_MIN);
  // editModeItem is always {} initially, but these comps still render
  // this is to make sure when props change the states get updated to
  // since state w/hooks doesnt update with props change
  React.useEffect(() => {
    // only change state if the edit mode is Run
    if (editModeItem.mode === RUN) {
      setRunNumber(editModeItem.numUntilTrigger);
      setRunTrigger(editModeItem.trigger);
    }
  }, [editModeItem])

  const saveEdits = () => {
    // depending on the edit mode
    setDeviceConfig(prevConfig => {
      const newModeSettings = {
        mode: RUN,
        subtitle: RUN_SUBTITLE,
        backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${5}, ${132})`,
        trigger: runTrigger,
        numUntilTrigger: runNumber
      };
      const index = prevConfig.indexOf(editModeItem)
      prevConfig[index] = newModeSettings
      console.log('aiodwja', prevConfig)
      return [...prevConfig]
    })
    setVisible(false);
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
          initial={editModeItem.trigger === TRIGGER_MIN ? 0 : 1}
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
          <SaveCancelFooter 
            resetState={resetState}
            saveEdits={saveEdits}
          />
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
})
