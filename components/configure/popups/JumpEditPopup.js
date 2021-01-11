import React from 'react';
import { View, StyleSheet, } from 'react-native';
import { DEVICE_CONFIG_CONSTANTS, } from '../DeviceConfigConstants';
import { Text, ListItem } from 'react-native-elements'
import { useTheme } from '@react-navigation/native';

import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont();
const { HANGTIME, VERTICAL_HEIGHT, JUMP, JUMP_SUBTITLE } = DEVICE_CONFIG_CONSTANTS;
import SwitchSelector from "react-native-switch-selector";
import GenericModal from './GenericModal';
import ThemeText from '../../generic/ThemeText';

REPORT_LIST = [
  {
    title: 'Vertical Height',
    subtitle: 'Your device will report how high you jump in inches'
  },
  {
    title: 'Hangtime',
    subtitle: 'Your device will report how long you stay in the air to the hundredth of a second'
  }
];

export default function JumpEditPopup(props) {
  const { colors } = useTheme();
  const { visible, setVisible, setDeviceConfig, editModeItem, } = props;
  // report either vertical height or hangtime
  const [reportMetric, setReportMetric] = React.useState(editModeItem.metric);
  // editModeItem is always {} initially, but these comps still render
  // this is to make sure when props change the states get updated to
  // since state w/hooks doesnt update with props change
  React.useEffect(() => {
    if (editModeItem.mode === JUMP) setReportMetric(editModeItem.metric)
  }, [editModeItem])

  const renderReportMetric = () => {
    return REPORT_LIST.map((reportObject, _) => (
      <ListItem
        containerStyle={{}}
        key={reportObject.title}
        bottomDivider
        onPress={() => {
          setReportMetric(reportObject.title);
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
          checked={reportMetric === reportObject.title}
          checkedColor={colors.background}
          checkedIcon='dot-circle-o'
          uncheckedIcon='circle-o'
        />
      </ListItem>
    ));
  }

  const saveEdits = () => {
    // depending on the edit mode
    setDeviceConfig(prevConfig => {
      const newModeSettings = {
        mode: JUMP,
        subtitle: JUMP_SUBTITLE,
        backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${5}, ${132})`,
        metric: reportMetric
      };
      const index = prevConfig.indexOf(editModeItem)
      prevConfig[index] = newModeSettings
      console.log('new jump edits:', prevConfig)
      return [...prevConfig]
    })
    setVisible(false);
  }

  const resetState = () => {
    setVisible(false);
  }

  const renderJumpEditModalContent = () => {
    return (
      <View style={styles.innerEditContainer}>
        <View style={{width: '100%', height: 200, backgroundColor: colors.background}}>
          <ThemeText style={{alignSelf: 'center'}}>Add image here</ThemeText>
        </View>
        <Text style={styles.description}>
          Your device will track your vertical height and report it to you after every jump in this mode.
          Choose to have either how high you jump (vertical height)
          reported or the amount of time you spend in the air (hangtime)
        </Text>
        <Text style={styles.reportMetricLabel}>What to report?</Text>
        <View style={{width: '100%'}}>
          {renderReportMetric()}
        </View>
      </View>
    )
  }
  return (
    <GenericModal
      isVisible={visible}
      setVisible={setVisible}
      titleText='Edit Jump Settings'
      height='80%'
      resetState={resetState}
      saveEdits={saveEdits}
    >
      <View style={styles.container}>
        {renderJumpEditModalContent()}
      </View>
    </GenericModal>
  )
}

const styles = StyleSheet.create({
  container: {

  },
  reportMetricSwitch: {
    marginTop: 10,
    width: '80%',
  },
  description: {
    marginTop: 10,
    marginLeft: 10,
    color: 'grey'
  },
  innerEditContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportMetricLabel: {
    fontSize: 20,
    margin: 10,
    alignSelf: 'flex-start'
  },
})