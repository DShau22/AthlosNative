import React from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Text, Button } from 'react-native-elements';
import { DEVICE_CONFIG_CONSTANTS } from '../DeviceConfigConstants';
const { INTERVAL, INTERVAL_SUBTITLE } = DEVICE_CONFIG_CONSTANTS;
import SwitchSelector from "react-native-switch-selector";
import UpDownButton from './UpDownButton';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
import GenericModal from './GenericModal';
import SplitInputs from './SplitInputs'
import { useTheme } from '@react-navigation/native';
import ThemeText from '../../generic/ThemeText';

INTERVAL_NUM_TO_WORD = ['First', 'Second', 'Third', 'Fouth'];

export default function TimerEditPopup(props) {
  const { colors } = useTheme();
  const { visible, setVisible, setDeviceConfig, editModeItem } = props;
  const [intervals, setIntervals] = React.useState([30]);
  const [cycles, setCycles] = React.useState(true);
  const [rests, setRests] = React.useState(5);
  const [errorMsgs, setErrorMsgs] = React.useState(['']); // array of error messages for each split input

  const resetState = () => {
    setVisible(false);
    setIntervals([30]);
    setErrorMsgs(['']);
  }

  const saveEdits = () => {
    setDeviceConfig(prevConfig => {
      const newModeSettings = {
        mode: INTERVAL,
        subtitle: INTERVAL_SUBTITLE,
        intervals: intervals,
        cycles: cycles,
        rests: rests
      };
      const index = prevConfig.indexOf(editModeItem);
      prevConfig[index] = newModeSettings;
      return [...prevConfig];
    });
    setVisible(false);
  }

  const renderEditModalContent = () => {
    return (
      <View style={styles.container}>
        <View style={{width: '100%', height: 200, backgroundColor: colors.background}}>
          <ThemeText style={{alignSelf: 'center'}}>Add image here</ThemeText>
        </View>
        <Text style={{color: 'grey', margin: 10}}>
          Set up interval training: 
        </Text>
        <View style={styles.innerEditRunContainer}>
          <SplitInputs
            distance={intervals.length * 50}
            setSplits={setIntervals}
            splits={intervals}
            errorMsgs={errorMsgs}
            setErrorMsgs={setErrorMsgs}
            label={'time interval in seconds'}
          />
        </View>
      </View>
    )
  }
  
  return (
    <GenericModal
      isVisible={visible}
      setVisible={setVisible}
      titleText='Interval Training Mode'
      height='60%'
      resetState={resetState}
      saveEdits={saveEdits}
    >
      <View style={styles.container}>
        {renderEditModalContent()}
      </View>
    </GenericModal>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%'
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
