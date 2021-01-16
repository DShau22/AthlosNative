import React from 'react';
import { View, StyleSheet, Alert, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { DEVICE_CONFIG_CONSTANTS, } from '../DeviceConfigConstants';
const {
  POOL_LENGTH_CHOICES,
  TIMER,
  BUTTERFLY,
  BACKSTROKE,
  BREASTROKE,
  FREESTYLE,
  IM,
  MODE_CONFIG
} = DEVICE_CONFIG_CONSTANTS;
import ActionButton from 'react-native-action-button';
import { useTheme } from '@react-navigation/native';
import GLOBAL_CONSTANTS from '../../GlobalConstants';
const { METRIC } = GLOBAL_CONSTANTS;
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
Icon.loadFont();
import SplitInputs from '../popups/SplitInputs';
import ThemeText from '../../generic/ThemeText';
import { UserDataContext } from '../../../Context';
import SaveButton from './SaveButton';
import Spinner from 'react-native-loading-spinner-overlay';
import { ListItem } from 'react-native-elements';
import PullUpMenu from './PullUpMenu';
import MenuPrompt from './MenuPrompt';
import {numToWord} from '../../utils/strings';
export default function TimerEditScreen(props) {
  const { colors } = useTheme();
  const { navigation, deviceConfig, setDeviceConfig } = props;
  const { editIdx } = props.route.params; // index of the object in deviceConfig array we are editing
  const timerSettings = deviceConfig[editIdx];

  const [isLoading, setIsLoading] = React.useState(false);
  const [splits, setSplits] = React.useState(timerSettings.splits);
  const [cycles, setCycles] = React.useState(false);
  const [errorMsgs, setErrorMsgs] = React.useState(splits.map((_, idx) => '')); // array of error messages for each split input
  const firstUpdate = React.useRef(true);
  const refRBSheetSplits = React.useRef();

  React.useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    setIsLoading(false);
    // Alert.alert('Done!', 'Successfully saved your timer settings', [{text: 'Okay'}]);
    // navigation.navigate(MODE_CONFIG);
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
    // check if any of the splits are empty first
    var existsEmptySplit = false;
    errorMsgs.forEach((msg, _) => {
      if (msg.length > 0) {
        Alert.alert('Whoops!', "Make sure all the errors are addressed", [{ text: 'okay' }]);
        return;
      }
    })
    splits.forEach((split, i) => {
      existsEmptySplit = existsEmptySplit || split.length === 0 || parseInt(split) <= 9
      splits[i] = parseInt(splits[i]);
    })
    if (existsEmptySplit) {
      Alert.alert('Whoops!', "Make sure none of the splits you entered are empty and that they're all greater than 9 seconds", [{ text: 'okay' }]);
      return;
    }
    // depending on the edit mode
    setDeviceConfig(prevConfig => {
      const newModeSettings = {
        mode: SWIMMING_EVENT,
        subtitle: SWIMMING_EVENT_SUBTITLE,
        stroke: stroke,
        distance: distance,
        splits: splits,
      };
      prevConfig[editIdx] = newModeSettings;
      return [...prevConfig];
    })
  }

  const resetState = () => {
    setIsLoading(false);
    setSplits(timerSettings.splits);
    setErrorMsgs(timerSettings.splits.map((_) => ''))
  }

  const totalSplitTime = () => {
    const reduced = splits.reduce((a, b) => parseInt(a) + parseInt(b), 0);
    return isNaN(reduced) ? '' : `${reduced} seconds`;
  }

  const addCheckpoint = () => {
    setSplits(prev => {
      const copy = [...prev];
      copy.push('60');
      return copy;
    });
  }

  const renderCheckpoints = () => {
    return splits.map((split, idx) => {
      split = parseInt(split);
      var hours = Math.floor(split / 3600);
      var mins = Math.floor(split / 60);
      var secs = split % 60;
      var hoursText = hours === 0 ? '' : `${hours} ${hours === 1 ? 'hour' : 'hours'} `;
      var minsText = mins === 0 ? '' : `${mins} ${mins === 1 ? 'min' : 'mins'} `;
      var secsText = secs === 0 ? '' : `${secs} ${mins === 1 ? 'second' : 'seconds'}`;
      var promptSubtitle = `${hoursText}${minsText}${secsText}`;
      return (
        <></>
        // <MenuPrompt
        //   promptTitle={`${numToWord(idx)} interval:`}
        //   promptSubtitle={promptSubtitle}
        //   onSave={(totalSeconds) => {
        //     setSplits(prev => {
        //       const copy = [...prev];
        //       copy[idx] = totalSeconds;
        //       return copy;
        //     })
        //   }}
        //   childArray={Array.from(Array(3).keys())}
        //   secondChildArray={Array.from(Array(60).keys())}
        //   thirdChildArray={Array.from(Array(60).keys())}
        //   selectedItem={parseInt(hours)}
        //   secondSelectedItem={parseInt(mins)}
        //   thirdSelectedItem={parseInt(secs)}
        // />
      );
    });
  }

  return (
    <View style={{height: '100%', width: '100%'}}>
      <ScrollView>
        <ThemeText style={{fontSize: 20, fontWeight: 'bold', alignSelf: 'flex-start', margin: 10}}>
          Timer with alerts:
        </ThemeText>
        <ThemeText style={{margin: 10}}>
          Set up a timer with alerts on how much time has passed. You can customize when these alerts will occur (up to a max of 6).
        </ThemeText>
        {renderCheckpoints()}
        {/* <ThemeText style={[styles.textHeader, {marginTop: 20, marginBottom: 20}]}>
          Set the number of intervals
        </ThemeText>
        <ListItem
          containerStyle={[styles.menuOpener, {backgroundColor: colors.background}]}
          bottomDivider
          topDivider
          onPress={() => refRBSheetSplits.current.open()}
        >
          <ListItem.Content>
            <ListItem.Title>
              <ThemeText>{`Number of checkpoints: ${splits.length}`}</ThemeText>
            </ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron name='chevron-forward'/>
        </ListItem>
        <PullUpMenu
          refRBSheet={refRBSheetSplits}
          childArray={[
            {label: 1, value: 1},
            {label: 2, value: 2},
            {label: 3, value: 3},
            {label: 4, value: 4},
            {label: 5, value: 5},
            {label: 6, value: 6}]}
          selected={splits.length}
          onItemPress={num => setSplits(prev => {
            const copy = [...prev];
            if (num > prev.length) {
              for (let i = prev.length; i < num; i++)
                copy.push(60);
              return copy;
            } else if (num < prev.length) {
              for (let i = prev.length; i > num; i--)
                copy.pop();
              return copy;
            }
          })}
        /> */}
        <ThemeText style={[styles.textHeader,]}>
          {`Total time: ${totalSplitTime()}`}
        </ThemeText>
        {/* <SplitInputs
          distance={splits.length * 50}
          setSplits={setSplits}
          splits={splits}
          errorMsgs={errorMsgs}
          setErrorMsgs={setErrorMsgs}
          label={'split'}
        /> */}
        <SaveButton
          containerStyle={{
            margin: 20,
            alignSelf: 'center'
          }}
          onPress={saveEdits}
        />
      </ScrollView>
      <ActionButton
        position='right'
        offsetX={15}
        offsetY={15}
        buttonColor={'#ff03b7'}
        size={60}
        onPress={addCheckpoint}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  splitsContainer: {
    width: '100%',
    marginTop: 25,
  },
  textHeader: {
    fontSize: 20,
    alignSelf: 'flex-start',
    margin: 10,
    marginTop: 20,
    marginBottom: 0
  },
});
