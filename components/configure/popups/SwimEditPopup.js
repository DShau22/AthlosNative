import React from 'react'
import { View, StyleSheet, ScrollView, FlatList } from 'react-native'
import { Text, Button } from 'react-native-elements'
import { DEVICE_CONFIG_CONSTANTS, getDefaultModeObject, } from '../DeviceConfigConstants'
const { 
  POOL_LENGTH_CHOICES,
  TRIGGER_LAP, 
  TRIGGER_ON_FINISH,
  SWIM,
  SWIM_SUBTITLE,
  CALORIES,
  SWIMMING_SPEED,
  LAPTIME,
  TOTAL_LAP_COUNT,
  LAP_COUNT,
  STROKE,
} = DEVICE_CONFIG_CONSTANTS
import SwitchSelector from "react-native-switch-selector";
import { CheckBox } from 'react-native-elements';

import UpDownButton from './UpDownButton'
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont()

import GenericModal from './GenericModal'

// Report cal, lap time, speed, total lap count, curr lap count
// when to report? Every 1/2/3/4 laps, on finish
export default function SwimEditPopup(props) {
  const { visible, setVisible, setDeviceConfig, editModeItem, } = props;

  const [lapNumber, setLapNumber] = React.useState(editModeItem.numUntilTrigger);
  const [reportTrigger, setReportTrigger] = React.useState(editModeItem.trigger);
  const [metrics, setMetrics] = React.useState(editModeItem.metrics);

  // for the check boxes of what to report. These will be changed once
  // the actual editModeItem is passed in to be the swimming settings in the object
  const [calChecked, setCalChecked] = React.useState(false)
  const [lapTimeChecked, setLapTimeChecked] = React.useState(false)
  const [lapCountChecked, setLapCountChecked] = React.useState(false)
  // const [totalLapCountChecked, setTotalLapCountChecked] = React.useState(false)
  // const [speedChecked, setSpeedChecked] = React.useState(false)
  const [strokeChecked, setStrokeChecked] = React.useState(false)
  const [poolLength, setPoolLength] = React.useState(POOL_LENGTH_CHOICES.NCAA)
  
  React.useEffect(() => {
    if (editModeItem.mode === SWIM) {
      setLapNumber(editModeItem.numUntilTrigger)
      setReportTrigger(editModeItem.trigger)
      setMetrics(editModeItem.metrics)
      
      setCalChecked(editModeItem.metrics.includes(CALORIES))
      setLapTimeChecked(editModeItem.metrics.includes(LAPTIME))
      setLapCountChecked(editModeItem.metrics.includes(LAP_COUNT))
      // setTotalLapCountChecked(editModeItem.metrics.includes(TOTAL_LAP_COUNT))
      // setSpeedChecked(editModeItem.metrics.includes(SWIMMING_SPEED))
      setStrokeChecked(editModeItem.metrics.includes(STROKE))
      setPoolLength(editModeItem.poolLength)
    }
  }, [editModeItem]);

  const saveEdits = () => {
    // tbh this prob isn't the best way to do this :/
    const metricBooleanArray = [
      calChecked,
      lapTimeChecked,
      lapCountChecked,
      // totalLapCountChecked,
      // speedChecked,
      strokeChecked,
    ]
    // list of all metrics. Order corresponds to the metric boolean array
    const metricArray = [
      CALORIES,
      LAPTIME,
      LAP_COUNT,
      // TOTAL_LAP_COUNT,
      // SWIMMING_SPEED,
      STROKE,
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
        poolLength: poolLength,
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

  return (
    <GenericModal
      isVisible={visible}
      setVisible={setVisible}
      titleText='Edit Swim Settings'
      height='80%'
      resetState={resetState}
      saveEdits={saveEdits}
    >
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
          title="Stroke"
          checked={strokeChecked}
          onPress={() => setStrokeChecked(prev => !prev)}
        />
        {/* <CheckBox
          title="Total Lap Count"
          checked={totalLapCountChecked}
          onPress={() => setTotalLapCountChecked(prev => !prev)}
        /> */}
        {/* <CheckBox
          title="Speed"
          checked={speedChecked}
          onPress={() => setSpeedChecked(prev => !prev)}
        /> */}
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
      <View>
        <CheckBox
          title="25 yd"
          checkedIcon='dot-circle-o'
          uncheckedIcon='circle-o'
          checked={poolLength === POOL_LENGTH_CHOICES.NCAA}
          onPress={() => setPoolLength(POOL_LENGTH_CHOICES.NCAA)}
        />
        <CheckBox
          title="50 m"
          checkedIcon='dot-circle-o'
          uncheckedIcon='circle-o'
          checked={poolLength === POOL_LENGTH_CHOICES.OLYMPIC}
          onPress={() => setPoolLength(POOL_LENGTH_CHOICES.OLYMPIC)}
        />
        <CheckBox
          title="25 m"
          checkedIcon='dot-circle-o'
          uncheckedIcon='circle-o'
          checked={poolLength === POOL_LENGTH_CHOICES.BRITISH}
          onPress={() => setPoolLength(POOL_LENGTH_CHOICES.BRITISH)}
        />
        <CheckBox
          title="33.3 yd"
          checkedIcon='dot-circle-o'
          uncheckedIcon='circle-o'
          checked={poolLength === POOL_LENGTH_CHOICES.THIRD_YD}
          onPress={() => setPoolLength(POOL_LENGTH_CHOICES.THIRD_YD)}
        />
        <CheckBox
          title="33.3 m"
          checkedIcon='dot-circle-o'
          uncheckedIcon='circle-o'
          checked={poolLength === POOL_LENGTH_CHOICES.THIRD_M}
          onPress={() => setPoolLength(POOL_LENGTH_CHOICES.THIRD_M)}
        />
        <CheckBox
          title="15 yd"
          checkedIcon='dot-circle-o'
          uncheckedIcon='circle-o'
          checked={poolLength === POOL_LENGTH_CHOICES.HOME}
          onPress={() => setPoolLength(POOL_LENGTH_CHOICES.HOME)}
        />
      </View>
    </GenericModal>
  )
}

const styles = StyleSheet.create({
  title: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderBottomColor: '#c7c7c7',
    borderBottomWidth: 1
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 24
  },
  modalContent: {
    borderRadius: 8,
    height: '80%',
    backgroundColor: 'white'
  },
  scrollView: {
    width: '100%',
    height: '100%'
  },
  innerEditContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerSwitch: {
    width: '30%',
  },
})
