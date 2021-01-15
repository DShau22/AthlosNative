import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { Input, ListItem } from 'react-native-elements';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
MaterialCommunityIcons.loadFont();
import Entypo from 'react-native-vector-icons/Entypo';
Entypo.loadFont();

import { DEVICE_CONFIG_CONSTANTS, } from '../DeviceConfigConstants';
const {
  INTERVAL,
  MODE_CONFIG
} = DEVICE_CONFIG_CONSTANTS;
import { useTheme } from '@react-navigation/native';
import GLOBAL_CONSTANTS from '../../GlobalConstants';
const { METRIC } = GLOBAL_CONSTANTS;
import ThemeText from '../../generic/ThemeText';
import { UserDataContext } from '../../../Context';
import SaveButton from './SaveButton';
import Spinner from 'react-native-loading-spinner-overlay';
import PullUpMenu from './PullUpMenu';
import MenuPrompt from './MenuPrompt';
import ActionButton from 'react-native-action-button';

export default function IntervalEditScreen(props) {
  const { colors } = useTheme();
  const { navigation, deviceConfig, setDeviceConfig } = props;
  const { editIdx } = props.route.params; // index of the object in deviceConfig array we are editing
  const intervalSettings = deviceConfig[editIdx];

  const [isLoading, setIsLoading] = React.useState(false);
  const [intervals, setIntervals] = React.useState(intervalSettings.intervals);
  const [numRounds, setNumRounds] = React.useState(intervalSettings.numRounds);
  const [errorMsgs, setErrorMsgs] = React.useState(intervals.map((_, idx) => '')); // array of error messages for each split input
  const firstUpdate = React.useRef(true);
  // const refRBSheetIntervals = React.useRef();
  // const refRBSheetRounds = React.useRef();

  React.useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    setIsLoading(false);
    Alert.alert('Done!', 'Successfully saved your timer settings', [{text: 'Okay'}]);
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
    // check if any of the intervals are empty first
    var existsEmptySplit = false;
    errorMsgs.forEach((msg, _) => {
      if (msg.length > 0) {
        Alert.alert('Whoops!', "Make sure all the errors are addressed", [{ text: 'okay' }]);
        return;
      }
    })
    intervals.forEach(({time, _}, i) => {
      existsEmptySplit = existsEmptySplit || time.length === 0 || parseInt(time) <= 9
      intervals[i].time = parseInt(time);
    })
    if (existsEmptySplit) {
      Alert.alert('Whoops!', "Make sure none of the intervals you entered are empty and that they're all greater than 9 seconds", [{ text: 'okay' }]);
      return;
    }
    // depending on the edit mode
    setDeviceConfig(prevConfig => {
      const newModeSettings = {
        mode: INTERVAL,
        intervals,
        numRounds,
      };
      prevConfig[editIdx] = newModeSettings;
      return [...prevConfig];
    })
  }

  const resetState = () => {
    setIsLoading(false);
    setIntervals(intervalSettings.intervals);
    setErrorMsgs(intervalSettings.intervals.map((_) => ''))
  }

  const totalIntervalTime = () => {
    var reduced = 0;
    intervals.forEach(({time, _}, idx) => {
      reduced += parseInt(time);
    })
    return isNaN(reduced) ? '' : `${reduced} seconds`;
  }

  const getRoundsArray = () => {
    const res = [];
    for (let i = 1; i <= 20; i++) {
      res.push({label: i, value: i});
    }
    return res;
  }

  const getTotalWorkoutTime = () => {
    const totalTimeInSeconds = parseInt(totalIntervalTime()) * numRounds;
    const timeInMinutes = Math.floor(totalTimeInSeconds / 60);
    const remainingSeconds = totalTimeInSeconds % 60;
    return isNaN(timeInMinutes) || isNaN(remainingSeconds) ? '' : 
      `${timeInMinutes} min ${remainingSeconds} s`;
  }

  const handleInputChange = (val, index) => {
    setIntervals(prev => {
      const copy = [...prev];
      copy[index] = `${val}`;
      return copy;
    });
  }

  const renderListItem = ({item, index, drag, isActive}) => {
    const { time, rest } = item;
    return (
      <TouchableOpacity
        style={[styles.listItemContainer, {flex: 1, borderColor: rest ? 'red' : 'white'}]}
        // onPress={onPress}
        onLongPress={drag}
      >
        <View style={styles.listItemContent}>
          <TouchableOpacity
            style={styles.deleteInterval}
            onPress={() => {
              setIntervals(prev => {
                const filtered = prev.filter((_, idx) => {
                  return index !== idx;
                });
                return filtered;
              });
            }}
          >
            <Entypo
              name='cross'
              size={28}
              color={colors.textColor}
            />
          </TouchableOpacity>
          <Input
            leftIcon={
              <MaterialCommunityIcons
                name='timer'
                size={24}
                color={colors.textColor}
              />
            }
            containerStyle={{width: '80%'}}
            // inputContainerStyle={{width: '80%'}}
            inputStyle={{color: colors.textColor}}
            label={`${rest ? 'Rest' : 'Work'} (seconds)`}
            placeholderTextColor={colors.textColor}
            keyboardType='numeric'
            maxLength={3}
            value={`${time}`}
            onChangeText={val => handleInputChange(val, index)}
            errorMessage={errorMsgs[index]}
            renderErrorMessage={errorMsgs[index] !== undefined && errorMsgs[index].length > 0}
          />
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <DraggableFlatList
      ListHeaderComponent={() => (
        <>
          <Spinner
            visible={isLoading}
            textContent='Saving...'
            textStyle={{color: colors.textColor}}
          />
          <ThemeText style={{fontSize: 20, fontWeight: 'bold', alignSelf: 'flex-start', margin: 10}}>
            Create an interval training timer:
          </ThemeText>
          <ThemeText style={{margin: 10}}>
            Customize an interval timer by setting intervals for working and resting.
            Your device will prompt you when it's time to work or rest so you can focus on training.
          </ThemeText>
          <ThemeText style={[styles.textHeader, {marginTop: 20, marginBottom: 20}]}>
            Choose the number of rounds
          </ThemeText>
          <MenuPrompt
            title={`Rounds: ${numRounds}`}
            childArray={getRoundsArray()}
            selectedItem={numRounds}
            onItemPress={num => setNumRounds(num)}
          />
          <ThemeText style={[styles.textHeader,]}>
            {`Total time per set: ${totalIntervalTime()}`}
          </ThemeText>
          <ThemeText style={[styles.textHeader,]}>
            {`Total workout time: ${getTotalWorkoutTime()}`}
          </ThemeText>
        </>
      )}
      data={intervals}
      renderItem={renderListItem}
      keyExtractor={(item, index) => `draggable-item-${item.mode}-${index}`}
      onDragEnd={({ data }) => {
        setIntervals(data);
      }}
      ListFooterComponent={() => (
        <>
          <SaveButton
            containerStyle={{
              margin: 20,
              alignSelf: 'center'
            }}
            onPress={saveEdits}
          />
          <ActionButton
            position='right'
            offsetX={15}
            offsetY={15}
            buttonColor={'#ff03b7'}
            size={60}
          >
            <ActionButton.Item
              size={52}
              textContainerStyle={styles.actionButtonTextContainer}
              textStyle={styles.actionButtonText}
              buttonColor='#ff000d'
              title="Work"
              onPress={() => {
                if (intervals.length >= 6) {
                  Alert.alert('Whoops', 'Cannot have more than 6 intervals', [{text: 'Okay'}]);
                  return;
                }
                setIntervals(prev => {
                  const copy = [...prev];
                  copy.push({time: '60', rest: false});
                  return copy;
                });
              }}
            >
              <MaterialCommunityIcons name="plus" style={styles.actionButtonIcon} />
            </ActionButton.Item>
            <ActionButton.Item
              size={52}
              textContainerStyle={styles.actionButtonTextContainer}
              textStyle={styles.actionButtonText}
              buttonColor='#2bd5ff'
              title="Rest"
              onPress={() => {
                if (intervals.length >= 6) {
                  Alert.alert('Whoops', 'Cannot have more than 6 intervals', [{text: 'Okay'}]);
                  return;
                }
                setIntervals(prev => {
                  const copy = [...prev];
                  copy.push({time: '10', rest: true});
                  return copy;
                });
              }}
            >
              <MaterialCommunityIcons name="plus" style={styles.actionButtonIcon} />
            </ActionButton.Item>
          </ActionButton>
        </>
      )}
    />
  )
}

const styles = StyleSheet.create({
  intervalsContainer: {
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
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
  actionButtonTextContainer: {
    height: 25,
  },
  actionButtonText: {
    fontSize: 14,
    color: 'black',
    alignSelf: 'center'
  },
  listItemContainer: {
    padding: 2,
    height: 80,
    // backgroundColor: colors.header,
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 15,
    marginLeft: 15,
    marginRight: 15,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  deleteInterval: {
    position: 'absolute',
    top: 10,
    right: 10,
  }
});