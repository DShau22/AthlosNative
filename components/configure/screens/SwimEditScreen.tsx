import React from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import SwitchSelector from "react-native-switch-selector";
import { useTheme } from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';
import { CheckBox } from 'react-native-elements';
import { Text, ListItem } from 'react-native-elements';


import ThemeText from '../../generic/ThemeText';
import SaveButton from './SaveButton';
import PoolLengthList from '../popups/PoolLengthList';
import { DEVICE_CONFIG_CONSTANTS, SwimInterface } from '../DeviceConfigConstants';
import { Rect } from 'react-native-svg';
import DisableEncouragements from '../DisableEncouragements';
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
  MODE_CONFIG,
} = DEVICE_CONFIG_CONSTANTS;
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

const SWIM_REPORT_LIST = [
  {
    title: 'Every Lap',
    subtitle: 'Hear live feedback after every turn and when you finish a swim'
  },
  {
    title: 'On finish',
    subtitle: 'Only hear live feedback after you finish a swim'
  }
];

export default function SwimEditScreen(props) {
  const { colors } = useTheme();
  const { navigation, deviceConfig, setDeviceConfig } = props;
  const { editIdx } = props.route.params; // index of the object in deviceConfig array we are editing
  const swimSettings: SwimInterface = deviceConfig[editIdx];

  const [isLoading, setIsLoading] = React.useState(false);
  const [lapNumber, setLapNumber] = React.useState(swimSettings.numUntilTrigger);
  const [reportTrigger, setReportTrigger] = React.useState(swimSettings.trigger);
  const [metrics, setMetrics] = React.useState(swimSettings.metrics);

  // for the check boxes of what to report. These will be changed once
  // the actual editModeItem is passed in to be the swimming settings in the object
  const [calChecked, setCalChecked] = React.useState(metrics.includes(CALORIES));
  const [lapTimeChecked, setLapTimeChecked] = React.useState(metrics.includes(LAPTIME));
  const [lapCountChecked, setLapCountChecked] = React.useState(metrics.includes(LAP_COUNT));
  // const [totalLapCountChecked, setTotalLapCountChecked] = React.useState(false)
  // const [speedChecked, setSpeedChecked] = React.useState(false)
  const [strokeChecked, setStrokeChecked] = React.useState(metrics.includes(STROKE));
  const [poolLength, setPoolLength] = React.useState(swimSettings.poolLength);
  const [disableEncouragements, setDisableEncouragements] = React.useState<boolean>(swimSettings.disableEncouragements);
  const firstUpdate = React.useRef(true);

  React.useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    setIsLoading(false);
    Alert.alert('Done!', 'Successfully saved your lap swim settings', [{text: 'Okay'}]);
    navigation.navigate(MODE_CONFIG);
  }, [deviceConfig]);

  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      return () => {
        // Do something when the screen is unfocused
        resetState();
      };
    }, [])
  );

  const saveEdits = () => {
    setIsLoading(true);
    // tbh this prob isn't the best way to do this :/
    const metricBooleanArray = [
      calChecked,
      lapTimeChecked,
      lapCountChecked,
      // totalLapCountChecked,
      // speedChecked,
      strokeChecked,
    ];
    // list of all metrics. Order corresponds to the metric boolean array
    const metricArray = [
      CALORIES,
      LAPTIME,
      LAP_COUNT,
      // TOTAL_LAP_COUNT,
      // SWIMMING_SPEED,
      STROKE,
    ];
    var metrics: Array<string> = [];
    metricBooleanArray.forEach((isChecked, idx) => {
      if (isChecked) metrics.push(metricArray[idx])
    });
    // depending on the edit mode
    setDeviceConfig(prevConfig => {
      const newModeSettings = {
        mode: SWIM,
        subtitle: SWIM_SUBTITLE,
        poolLength: poolLength,
        trigger: reportTrigger,
        numUntilTrigger: lapNumber,
        disableEncouragements,
        metrics,
      };
      prevConfig[editIdx] = newModeSettings;
      return [...prevConfig];
    });
  }

  const resetState = () => {
    setLapNumber(swimSettings.numUntilTrigger);
    setReportTrigger(swimSettings.trigger);
    setMetrics(swimSettings.metrics);
    
    setCalChecked(swimSettings.metrics.includes(CALORIES));
    setLapTimeChecked(swimSettings.metrics.includes(LAPTIME));
    setLapCountChecked(swimSettings.metrics.includes(LAP_COUNT));
    setStrokeChecked(swimSettings.metrics.includes(STROKE));
  }

  const renderStats = () => {
    const swimStatList = [
      {
        title: 'Lap Count',
        subtitle: 'Number of consecutive laps in the current swim',
        setter: setLapCountChecked,
        isChecked: lapCountChecked,
      },
      {
        title: 'Lap Time',
        subtitle: 'Time in seconds it took to finish the last lap',
        setter: setLapTimeChecked,
        isChecked: lapTimeChecked,
      },
      {
        title: 'Calories',
        subtitle: 'Total calories burned so far in the session',
        setter: setCalChecked,
        isChecked: calChecked,
      },
      {
        title: 'Stroke',
        subtitle: 'For dev purposes',
        setter: setStrokeChecked,
        isChecked: strokeChecked,
      },
    ];
    return swimStatList.map(({title, subtitle, setter, isChecked}, _) => (
      <ListItem
        containerStyle={{backgroundColor: colors.background}}
        key={title}
        bottomDivider
        onPress={() => {
          setter(prev => !prev);
        }}
      >
        <ListItem.Content>
          <ListItem.Title>
            <ThemeText>{title}</ThemeText>
          </ListItem.Title>
          <ListItem.Subtitle>
            <ThemeText>
              {subtitle}
            </ThemeText>
          </ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.CheckBox
          onPress={() => setter(prev => !prev)}
          checked={isChecked}
          checkedColor={colors.textColor}
        />
      </ListItem>
    ));
  }

  return (
    <ScrollView>
      <Spinner
        visible={isLoading}
        textContent='Saving...'
        textStyle={{color: colors.textColor}}
      />
      <View style={{backgroundColor: colors.background, flexDirection: 'column', alignItems: 'center'}}>
        <ThemeText style={{fontSize: 20, fontWeight: 'bold', alignSelf: 'flex-start', margin: 10}}>
          Swimming reports:
        </ThemeText>
        <ThemeText style={{margin: 10}}>
          Your device will track your lap count, lap times, swimming strokes, and calories burned in this mode.
          Choose what stats will be reported while swimming, and let your device know the length of your pool.
        </ThemeText>
        <ThemeText style={{fontSize: 22, alignSelf: 'flex-start', margin: 10}}>
          Stats to report:
        </ThemeText>
        <View style={{width: '100%'}}>
          {renderStats()}
        </View>
        {/* <Text style={{fontSize: 24, alignSelf: 'flex-start', margin: 10, marginTop: 20}}>
          When to report:
        </Text>
        <View style={{width: '100%'}}>
          {renderWhenToReport()}
        </View> */}
        <ThemeText style={{fontSize: 22, alignSelf: 'flex-start', margin: 10, marginTop: 20}}>
          Pool Length:
        </ThemeText>
        <View style={{width: '100%'}}>
          <PoolLengthList
            containerStyle={{backgroundColor: colors.background}}
            poolLength={poolLength}
            setPoolLength={setPoolLength}
            choices={POOL_LENGTH_LIST}
          />
        </View>
      </View>
      <DisableEncouragements
        disableEncouragements={disableEncouragements}
        setDisableEncouragements={setDisableEncouragements}
      />
      <SaveButton
        containerStyle={{
          margin: 20,
          alignSelf: 'center'
        }}
        onPress={saveEdits}
      />
    </ScrollView>
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