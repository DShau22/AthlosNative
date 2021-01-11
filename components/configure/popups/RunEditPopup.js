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
import GenericModal from './GenericModal'
import ThemeText from '../../generic/ThemeText'
import { useTheme } from '@react-navigation/native'

const ANIMATION_DURATION = 150
export default function RunEditPopup(props) {
  const { colors } = useTheme();
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
  }, [editModeItem]);

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
    });
    setVisible(false);
  }

  const resetState = () => {
    setVisible(false);
  }

  const renderRunEditModalContent = () => {
    return (
      <View style={styles.container}>
        <View style={{width: '100%', height: 200, backgroundColor: colors.background}}>
          <ThemeText style={{alignSelf: 'center'}}>Add image here</ThemeText>
        </View>
        <Text style={{color: 'grey', margin: 10}}>
          Your device will track your step count, cadence, and calories burned when using this mode.
          You can customize which stats to report and when to report them below.
        </Text>
        <View style={styles.innerEditRunContainer}>
          <Text style={{fontSize: 16, }}>Report feedback every</Text>
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
      </View>
    )
  }
  
  return (
    <GenericModal
      isVisible={visible}
      setVisible={setVisible}
      titleText='Running Mode'
      height='60%'
      resetState={resetState}
      saveEdits={saveEdits}
    >
      <View style={styles.container}>
        {renderRunEditModalContent()}
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
