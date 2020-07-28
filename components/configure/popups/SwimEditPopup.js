import React from 'react'
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native'
import { Text, Button } from 'react-native-elements'
import { DEVICE_CONFIG_CONSTANTS, DEFAULT_CONFIG, MODES } from '../DeviceConfigConstants'
const { 
  TRIGGER_LAP, 
  TRIGGER_ON_FINISH,
  SWIM,
  SWIM_SUBTITLE,
  CALORIES,
  SWIMMING_SPEED,
  LAPTIME,
  TOTAL_LAP_COUNT,
  LAP_COUNT,
} = DEVICE_CONFIG_CONSTANTS
import LinearGradient from 'react-native-linear-gradient';
import SwitchSelector from "react-native-switch-selector";
import { CheckBox } from 'react-native-elements';

import UpDownButton from './UpDownButton'
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont()
// popup stuff
import Modal, {
  ModalContent,
  ModalTitle,
  FadeAnimation,
} from 'react-native-modals';

const defaultSettings = MODES[SWIM]
import SaveCancelFooter from './SaveCancelFooter'

const ANIMATION_DURATION = 150
// Report cal, lap time, speed, total lap count, curr lap count
// when to report? Every 1/2/3/4 laps, on finish
export default function SwimEditPopup(props) {
  const { visible, setVisible, setDeviceConfig, editModeItem, } = props;

  const [lapNumber, setLapNumber] = React.useState(defaultSettings.numUntilTrigger);
  const [reportTrigger, setReportTrigger] = React.useState(defaultSettings.trigger);
  const [metrics, setMetrics] = React.useState(defaultSettings.metrics);

  // for the check boxes of what to report. These will be changed once
  // the actual editModeItem is passed in to be the swimming settings in the object
  const [calChecked, setCalChecked] = React.useState(false)
  const [lapTimeChecked, setLapTimeChecked] = React.useState(false)
  const [lapCountChecked, setLapCountChecked] = React.useState(false)
  const [totalLapCountChecked, setTotalLapCountChecked] = React.useState(false)
  const [speedChecked, setSpeedChecked] = React.useState(false)
  
  React.useEffect(() => {
    if (editModeItem.mode === SWIM) {
      setLapNumber(editModeItem.numUntilTrigger)
      setReportTrigger(editModeItem.trigger)
      setMetrics(editModeItem.metrics)
      
      setCalChecked(editModeItem.metrics.includes(CALORIES))
      setLapTimeChecked(editModeItem.metrics.includes(LAPTIME))
      setLapCountChecked(editModeItem.metrics.includes(LAP_COUNT))
      setTotalLapCountChecked(editModeItem.metrics.includes(TOTAL_LAP_COUNT))
      setSpeedChecked(editModeItem.metrics.includes(SWIMMING_SPEED))
    }
  }, [editModeItem])

  const saveEdits = () => {
    // tbh this prob isn't the best way to do this :/
    const metricBooleanArray = [
      calChecked,
      lapTimeChecked,
      lapCountChecked,
      totalLapCountChecked,
      speedChecked,
    ]
    // list of all metrics. Order corresponds to the metric boolean array
    const metricArray = [
      CALORIES,
      LAPTIME,
      LAP_COUNT,
      TOTAL_LAP_COUNT,
      SWIMMING_SPEED,
    ]
    var metrics = []
    metricBooleanArray.forEach((isChecked, idx) => {
      if (isChecked) metrics.push(metricArray[idx])
    })
    // depending on the edit mode
    setDeviceConfig(prevConfig => {
      const newModeSettings = {
        mode: SWIM,
        subtitle: SWIM_SUBTITLE,
        backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${5}, ${132})`,
        trigger: reportTrigger,
        numUntilTrigger: lapNumber,
        metrics,
      };
      const index = prevConfig.indexOf(editModeItem)
      prevConfig[index] = newModeSettings
      console.log('Swim changes', prevConfig)
      return [...prevConfig]
    })
    setVisible(false);
  }

  const resetState = () => {
    setVisible(false);
  }

  const renderSwimEditModalContent = () => {
    return (
      <View style={styles.innerEditRinnerEditContainerunContainer}>
        <Text>What to report?</Text>
        <View>
          <CheckBox
            title="Calories"
            checked={calChecked}
            onPress={() => setCalChecked(prev => !prev)}
          />
          <CheckBox
            title="Lap Time"
            checked={lapTimeChecked}
            onPress={() => setLapTimeChecked(prev => !prev)}
          />
          <CheckBox
            title="Lap Count"
            checked={lapCountChecked}
            onPress={() => setLapCountChecked(prev => !prev)}
          />
          <CheckBox
            title="Total Lap Count"
            checked={totalLapCountChecked}
            onPress={() => setTotalLapCountChecked(prev => !prev)}
          />
          <CheckBox
            title="Speed"
            checked={speedChecked}
            onPress={() => setSpeedChecked(prev => !prev)}
          />
        </View>
        <Text>When to report?</Text>
        <SwitchSelector
          style={styles.triggerSwitch}
          initial={editModeItem.trigger === TRIGGER_LAP ? 0 : 1}
          onPress={value => setReportTrigger(value)}
          textColor='#7a44cf' // purple
          selectedColor='white'
          buttonColor='#7a44cf'
          borderColor='#7a44cf'
          hasPadding
          options={[
            { label: "Laps", value: TRIGGER_LAP },
            { label: "On Finish", value: TRIGGER_ON_FINISH }
          ]}
        />
        { reportTrigger === TRIGGER_LAP ? 
          <UpDownButton
            number={lapNumber}
            // factor is positive or negative for increase/decrease
            incNumber={() => { setLapNumber(prev => Math.min(4, prev + 1)) }}
            decNumber={() => { setLapNumber(prev => Math.max(1, prev - 1)) }}
          /> : null
        }
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
          {renderSwimEditModalContent()}
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
  innerEditContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerSwitch: {
    width: '30%',
  },
})
