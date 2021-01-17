import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, ListItem } from 'react-native-elements'
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();

import { DEVICE_CONFIG_CONSTANTS, } from '../DeviceConfigConstants';
const { HANGTIME, VERTICAL_HEIGHT, JUMP, JUMP_SUBTITLE, MODE_CONFIG } = DEVICE_CONFIG_CONSTANTS;
import SwitchSelector from "react-native-switch-selector";
import Spinner from 'react-native-loading-spinner-overlay';

import ThemeText from '../../generic/ThemeText';
import SaveButton from './SaveButton';

const VERTICAL_REPORT_LIST = [
  {
    title: 'Vertical Height',
    subtitle: 'Your device will report how high you jump in inches'
  },
  {
    title: 'Hangtime',
    subtitle: 'Your device will report how long you stay in the air to the hundredth of a second'
  }
];

export default function VerticalEditScreen(props) {
  const { colors } = useTheme();
  const { navigation, deviceConfig, setDeviceConfig } = props;
  const { editIdx } = props.route.params; // index of the object in deviceConfig array we are editing

  // report either vertical height or hangtime
  const [isLoading, setIsLoading] = React.useState(false);
  const [reportMetric, setReportMetric] = React.useState(deviceConfig[editIdx].metric);
  const firstUpdate = React.useRef(true);

  React.useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    setIsLoading(false);
    Alert.alert('Done!', 'Successfully saved your vertical tracking settings', [{text: 'Okay'}]);
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
    setDeviceConfig(prevConfig => {
      const newModeSettings = {
        mode: JUMP,
        subtitle: JUMP_SUBTITLE,
        metric: reportMetric
      };
      prevConfig[editIdx] = newModeSettings
      return [...prevConfig]
    })
  }

  const resetState = () => {
    firstUpdate.current = true;
    setIsLoading(false);
    setReportMetric(deviceConfig[editIdx].metric);
  }

  const renderReportMetric = () => {
    return VERTICAL_REPORT_LIST.map(({title, subtitle}, _) => (
      <ListItem
        containerStyle={{backgroundColor: colors.background}}
        key={title}
        bottomDivider
        onPress={() => setReportMetric(title)}
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
          checked={reportMetric === title}
          checkedColor={colors.textColor}
          checkedIcon='dot-circle-o'
          uncheckedIcon='circle-o'
          onPress={() => setReportMetric(title)}
        />
      </ListItem>
    ));
  }

  return (
    <View style={styles.container}>
      <Spinner
        visible={isLoading}
        textContent='Saving...'
        textStyle={{color: colors.textColor}}
      />
      <ThemeText style={styles.reportMetricLabel}>Measure your vertical jumps:</ThemeText>
      <ThemeText style={styles.description}>
        Your device will track your vertical height and report it to you after every jump in this mode.
        Choose to have either how high you jump (vertical height)
        reported or the amount of time you spend in the air (hangtime)
      </ThemeText>
      <ThemeText style={styles.reportMetricLabel}>What to report?</ThemeText>
      <View style={{width: '100%'}}>
        {renderReportMetric()}
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
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  description: {
    margin: 10
  },
  reportMetricLabel: {
    fontSize: 20,
    margin: 10,
    alignSelf: 'flex-start'
  },
})