import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';
import SwitchSelector from "react-native-switch-selector";
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();

import { DEVICE_CONFIG_CONSTANTS } from '../DeviceConfigConstants';
const { TRIGGER_MIN, TRIGGER_STEPS, RUN, RUN_SUBTITLE, MODE_CONFIG } = DEVICE_CONFIG_CONSTANTS;
import UpDownButton from '../popups/UpDownButton';
import ThemeText from '../../generic/ThemeText';
import { useTheme } from '@react-navigation/native';
import SaveButton from './SaveButton';

export default function RunEditScreen(props) {
  const { colors } = useTheme();
  const { navigation, deviceConfig, setDeviceConfig } = props;
  const { editIdx } = props.route.params; // index of the object in deviceConfig array we are editing
  const { numUntilTrigger, trigger } = deviceConfig[editIdx];

  const [isLoading, setIsLoading] = React.useState(false);
  const [runNumber, setRunNumber] = React.useState(numUntilTrigger);
  const [runTrigger, setRunTrigger] = React.useState(trigger);
  const firstUpdate = React.useRef(true);

  React.useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    setIsLoading(false);
    Alert.alert('Done!', 'Successfully saved your running settings', [{text: 'Okay'}]);
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
    // depending on the edit mode
    setIsLoading(true);
    setDeviceConfig(prevConfig => {
      const newModeSettings = {
        mode: RUN,
        subtitle: RUN_SUBTITLE,
        trigger: runTrigger,
        numUntilTrigger: runNumber
      };
      prevConfig[editIdx] = newModeSettings
      return [...prevConfig]
    });
  }

  const resetState = () => {
    setRunNumber(numUntilTrigger);
    setRunTrigger(trigger);
    firstUpdate.current = true;
  }

  return (
    <View style={styles.container}>
      <Spinner
        visible={isLoading}
        textContent='Saving...'
        textStyle={{color: colors.textColor}}
      />
      <ThemeText style={{fontSize: 20, fontWeight: 'bold', alignSelf: 'flex-start', margin: 10}}>
        Running reports:
      </ThemeText>
      <ThemeText style={{margin: 10, marginTop: 0}}>
        Your device will track your step count, cadence, and calories burned when using this mode.
        You can customize which stats to report and when to report them below.
      </ThemeText>
      <View style={styles.innerEditRunContainer}>
        <ThemeText style={{fontSize: 16, }}>Report feedback every</ThemeText>
        <UpDownButton
          number={runTrigger === TRIGGER_MIN ? runNumber : runNumber * 100}
          // factor is positive or negative for increase/decrease
          incNumber={() => { setRunNumber(prev => Math.min(10, prev + 1)) }}
          decNumber={() => { setRunNumber(prev => Math.max(1, prev - 1)) }}
        />
        <SwitchSelector
          style={styles.runTriggerSwitch}
          initial={trigger === TRIGGER_MIN ? 0 : 1}
          onPress={value => setRunTrigger(value)}
          borderRadius={7}
          textColor={colors.background}
          selectedColor='white'
          buttonColor={colors.backgroundOffset}
          borderColor={colors.background}
          hasPadding
          options={[
            { label: "Min", value: TRIGGER_MIN },
            { label: "Steps", value: TRIGGER_STEPS }
          ]}
        />
      </View>
      <SaveButton
        containerStyle={{
          position: 'absolute',
          bottom: 20
        }}
        onPress={saveEdits}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  innerEditRunContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  runTriggerSwitch: {
    width: '30%',
    marginLeft: 10
  },
});
