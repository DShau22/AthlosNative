import React from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';
import { ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();

import { DEVICE_CONFIG_CONSTANTS, RunInterface } from '../DeviceConfigConstants';
const { TRIGGER_MIN, TRIGGER_STEPS, RUN, MODE_CONFIG } = DEVICE_CONFIG_CONSTANTS;
import ThemeText from '../../generic/ThemeText';
import SaveButton from './SaveButton';
import MenuPrompt from './MenuPrompt';
import {capitalize} from '../../utils/strings';
import GLOBAL_CONSTANTS from '../../GlobalConstants';
import DisableEncouragements from '../DisableEncouragements';
const { SCREEN_HEIGHT, SCREEN_WIDTH } = GLOBAL_CONSTANTS;

const RUN_TRIGGER_LIST = [
  {
    title: TRIGGER_STEPS,
    subtitle: 'Your device will give you feedback every few hundred steps (adjustable by you).'
  },
  {
    title: TRIGGER_MIN,
    subtitle: 'Your device will give you feedback every few minutes (adjustable by you).'
  }
];


export default function RunEditScreen(props) {
  const { colors } = useTheme();
  const { navigation, deviceConfig, setDeviceConfig } = props;
  const { editIdx } = props.route.params; // index of the object in deviceConfig array we are editing
  const { numUntilTrigger, trigger, walking } = deviceConfig[editIdx];

  const [isLoading, setIsLoading] = React.useState(false);
  const [walkingEnabled, setWalkingEnabled] = React.useState(walking);
  const [runNumber, setRunNumber] = React.useState(numUntilTrigger);
  const [runTrigger, setRunTrigger] = React.useState(trigger);
  const [reportCalories, setReportCalories] = React.useState<RunInterface>(deviceConfig[editIdx].reportCalories);
  const [disableEncouragements, setDisableEncouragements] = React.useState<boolean>(deviceConfig[editIdx].disableEncouragements);
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
        walking: walkingEnabled,
        trigger: runTrigger,
        numUntilTrigger: runNumber,
        reportCalories,
        disableEncouragements,
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

  const renderUnits = () => {
    if (runNumber === 1) {
      return `${runTrigger === TRIGGER_MIN ? 'minute' : 'steps'}`
    }
    return `${runTrigger === TRIGGER_MIN ? 'minutes' : 'steps'}`
  }

  const renderReportMetric = () => {
    return RUN_TRIGGER_LIST.map(({title, subtitle}, _) => (
      <ListItem
        containerStyle={{backgroundColor: colors.background}}
        key={title}
        bottomDivider
        topDivider
        onPress={() => setRunTrigger(title)}
      >
        <ListItem.Content>
          <ListItem.Title>
            <ThemeText>{capitalize(title)}</ThemeText>
          </ListItem.Title>
          <ListItem.Subtitle>
            <ThemeText>
              {subtitle}
            </ThemeText>
          </ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.CheckBox
          checked={runTrigger === title}
          checkedColor={colors.textColor}
          checkedIcon='dot-circle-o'
          uncheckedIcon='circle-o'
          onPress={() => setRunTrigger(title)}
        />
      </ListItem>
    ));
  }

  const renderMenuArray = () => {
    const res = [];
    for (let i = 1; i <= 10; i++) {
      res.push(runTrigger === TRIGGER_MIN ? i : i * 100);
    }
    return res;
  }

  return (
    <ScrollView style={styles.container}>
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
      <ThemeText style={{fontSize: 20, fontWeight: 'bold', alignSelf: 'flex-start', margin: 10}}>
        Report triggers
      </ThemeText>
      <View style={{width: '100%'}}>
        {renderReportMetric()}
      </View>
      <ThemeText style={{fontSize: 20, fontWeight: 'bold', alignSelf: 'flex-start', margin: 10}}>
        Set report frequency
      </ThemeText>
      <MenuPrompt
        pullUpTitle={runTrigger}
        promptTitle={`Every ${runTrigger === TRIGGER_MIN ? runNumber : runNumber * 100} ${renderUnits()}`}
        onSave={(newRunNumber) => {
          setRunNumber(runTrigger === TRIGGER_MIN ? newRunNumber : newRunNumber / 100);
        }}
        childArrays={[
          {
            title: 'Frequency',
            width: SCREEN_WIDTH,
            array: renderMenuArray()
          },
        ]}
        selectedItems={[runTrigger === TRIGGER_MIN ? runNumber : runNumber * 100]}
      />
      <ThemeText style={{fontSize: 20, fontWeight: 'bold', alignSelf: 'flex-start', margin: 10}}>
        More options
      </ThemeText>
      <ListItem
        containerStyle={{backgroundColor: colors.background}}
        bottomDivider
        topDivider
        onPress={() => setReportCalories(prev => !prev)}
      >
        <ListItem.Content>
          <ListItem.Title>
            <ThemeText>Report calories burned?</ThemeText>
          </ListItem.Title>
        </ListItem.Content>
        <ListItem.CheckBox
          checked={reportCalories}
          checkedColor={colors.textColor}
          onPress={() => setReportCalories(prev => !prev)}
        />
      </ListItem>
      <ListItem
        containerStyle={{backgroundColor: colors.background}}
        bottomDivider
        topDivider
        onPress={() => setReportCalories(prev => !prev)}
      >
        <ListItem.Content>
          <ListItem.Title>
            <ThemeText>Enable hiking mode?</ThemeText>
          </ListItem.Title>
          <ListItem.Subtitle>
            <ThemeText>
              Enable this option if you plan on hiking, walking, or strolling and still want live encouragement.
            </ThemeText>
          </ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.CheckBox
          checked={walkingEnabled}
          checkedColor={colors.textColor}
          onPress={() => setWalkingEnabled(prev => !prev)}
        />
      </ListItem>
      <DisableEncouragements
        disableEncouragements={disableEncouragements}
        setDisableEncouragements={setDisableEncouragements}
      />
      <ThemeText style={{fontSize: 14, alignSelf: 'flex-start', margin: 10}}>
        {`Your Athlos earbuds will report feedback every`+
         ` ${runTrigger === TRIGGER_MIN ? runNumber : runNumber * 100} ${renderUnits()}`}
      </ThemeText>
      <SaveButton
        containerStyle={{
          alignSelf: 'center',
          margin: 20
        }}
        onPress={saveEdits}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    // alignItems: 'center',
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
