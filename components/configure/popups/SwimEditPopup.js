import React from 'react'
import { View, StyleSheet, ScrollView, FlatList } from 'react-native'
import { Text, ListItem } from 'react-native-elements'
import { DEVICE_CONFIG_CONSTANTS, } from '../DeviceConfigConstants'
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
} = DEVICE_CONFIG_CONSTANTS;
import { CheckBox } from 'react-native-elements';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont()

import GenericModal from './GenericModal';
import { useTheme } from '@react-navigation/native';
import ThemeText from '../../generic/ThemeText';
import PoolLengthList from './PoolLengthList';
const {
  NCAA,
  OLYMPIC,
  BRITISH,
  THIRD_M,
  THIRD_YD,
  HOME
} = POOL_LENGTH_CHOICES;
const POOL_LENGTH_LIST = [
  {
    title: NCAA,
    subtitle: 'Standard NCAA pool length',  
  },
  {
    title: OLYMPIC,
    subtitle: 'Standard Olympic pool length',
  },
  {
    title: BRITISH,
    subtitle: 'Common European pool length',  
  },
  {
    title: THIRD_YD,
    subtitle: 'Rarer pool length but still standard', 
  },
  {
    title: THIRD_M,
    subtitle: 'Rarer pool length but still standard',
  },
  {
    title: HOME,
    subtitle: 'A typical backyard home pool length',  
  },
];

const REPORT_LIST = [
  {
    title: 'Every Lap',
    subtitle: 'Hear live feedback after every turn and when you finish a swim'
  },
  {
    title: 'On finish',
    subtitle: 'Only hear live feedback after you finish a swim'
  }
]
// Report cal, lap time, speed, total lap count, curr lap count
// when to report? Every 1/2/3/4 laps, on finish
export default function SwimEditPopup(props) {
  const { colors } = useTheme();
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

  const renderWhenToReport = () => {
    return REPORT_LIST.map((reportObject, _) => (
      <ListItem
        containerStyle={{}}
        key={reportObject.title}
        bottomDivider
        onPress={() => {
          setReportTrigger(reportObject.title);
        }}
      >
        <ListItem.Content>
          <ListItem.Title>
            <Text>{reportObject.title}</Text>
          </ListItem.Title>
          <ListItem.Subtitle>
            <Text>
              {reportObject.subtitle}
            </Text>
          </ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.CheckBox
          checked={reportTrigger === reportObject.title}
          checkedColor={colors.background}
          checkedIcon='dot-circle-o'
          uncheckedIcon='circle-o'
        />
      </ListItem>
    ));
  }

  return (
    <GenericModal
      isVisible={visible}
      setVisible={setVisible}
      titleText='Lap Swim Mode'
      height='80%'
      resetState={resetState}
      saveEdits={saveEdits}
    >
      <View style={{backgroundColor: 'white', flexDirection: 'column', alignItems: 'center'}}>
        <View style={{width: '100%', height: 200, backgroundColor: colors.background}}>
          <ThemeText style={{alignSelf: 'center'}}>Add image here</ThemeText>
        </View>
        <Text style={{margin: 10, color: 'grey'}}>
          Your device will track your lap count, lap times, swimming strokes, and calories burned in this mode.
          Choose what stats will be reported while swimming, and let your device know the length of your pool.
        </Text>
        <Text style={{fontSize: 20, alignSelf: 'flex-start', margin: 10}}>
          Stats to report:
        </Text>
        <View style={{width: '100%'}}>
          <CheckBox
            title="Calories"
            checkedColor={colors.background}
            checked={calChecked}
            onPress={() => setCalChecked(prev => !prev)}
          />
          <CheckBox
            title="Lap Time"
            checkedColor={colors.background}
            checked={lapTimeChecked}
            onPress={() => setLapTimeChecked(prev => !prev)}
          />
          <CheckBox
            title="Lap Count"
            checkedColor={colors.background}
            checked={lapCountChecked}
            onPress={() => setLapCountChecked(prev => !prev)}
          />
          <CheckBox
            title="Stroke"
            checkedColor={colors.background}
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
        {/* <Text style={{fontSize: 24, alignSelf: 'flex-start', margin: 10, marginTop: 20}}>
          When to report:
        </Text>
        <View style={{width: '100%'}}>
          {renderWhenToReport()}
        </View> */}
        <Text style={{fontSize: 24, alignSelf: 'flex-start', margin: 10, marginTop: 20}}>
          Pool Length:
        </Text>
        <View style={{width: '100%'}}>
          <PoolLengthList
            poolLength={poolLength}
            setPoolLength={setPoolLength}
            choices={POOL_LENGTH_LIST}
          />
        </View>
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
    margin: 10,
    alignSelf: 'flex-start',
    width: '30%',
  },
})
