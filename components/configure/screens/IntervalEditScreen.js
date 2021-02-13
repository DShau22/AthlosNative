import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
MaterialCommunityIcons.loadFont();
import Entypo from 'react-native-vector-icons/Entypo';
Entypo.loadFont();

import { DEVICE_CONFIG_CONSTANTS, MUSCLE_GROUP_LIST } from '../DeviceConfigConstants';
const {
  INTERVAL,
  MODE_CONFIG,
  WORK,
  REST
} = DEVICE_CONFIG_CONSTANTS;
import GLOBAL_CONSTANTS from '../../GlobalConstants';
const { SCREEN_HEIGHT, SCREEN_WIDTH } = GLOBAL_CONSTANTS;
import { useTheme } from '@react-navigation/native';
import ThemeText from '../../generic/ThemeText';
import SaveButton from './SaveButton';
import Spinner from 'react-native-loading-spinner-overlay';
import MenuPrompt from './MenuPrompt';
import ActionButton from 'react-native-action-button';
import {numToWord, capitalize} from '../../utils/strings';

const WORK_COLOR = '#9cffb6';
const REST_COLOR = '#fc6868';

export default function IntervalEditScreen(props) {
  const { colors } = useTheme();
  const { navigation, deviceConfig, setDeviceConfig } = props;
  const { editIdx } = props.route.params; // index of the object in deviceConfig array we are editing
  const intervalSettings = deviceConfig[editIdx];

  const [isLoading, setIsLoading] = React.useState(false);
  const [intervals, setIntervals] = React.useState(intervalSettings.intervals);
  const [numRounds, setNumRounds] = React.useState(intervalSettings.numRounds);
  const firstUpdate = React.useRef(true);

  React.useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    setIsLoading(false);
    Alert.alert('Done!', 'Successfully saved your interval training settings', [{text: 'Okay'}]);
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
    for (let i = 1; i <= 10; i++) {
      res.push(i);
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

  const renderListItem = ({item, index, drag, isActive}) => {
    const { time, muscleGroup } = item;
    var mins = Math.floor(time / 60);
    var secs = time % 60;
    var minsText = mins === 0 ? '' : `${mins} ${mins === 1 ? 'min' : 'mins'} `;
    var secsText = secs === 0 ? '' : `${secs} ${mins === 1 ? 'second' : 'seconds'}`;
    var promptSubtitle = `${minsText}${secsText}`;
    return (
      <View style={{
        padding: 5,
        marginTop: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: muscleGroup === REST ? REST_COLOR : WORK_COLOR,
        width: '94%',
        alignSelf: 'center',
      }}>
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
        <MenuPrompt
          noDividers
          noChevron
          pullUpTitle="Activity & time"
          promptTitle={`${index + 1}: ${muscleGroup}`}
          promptSubtitle={promptSubtitle}
          onSave={(muscleGroup, mins, secs) => {
            const totalSeconds = parseInt(mins) * 60 + parseInt(secs);
            setIntervals(prev => {
              const copy = [...prev];
              copy[index].time = totalSeconds;
              copy[index].muscleGroup = muscleGroup;
              return copy;
            });
          }}
          onLongPress={drag}
          childArrays={[
            {
              title: 'Muscle group',
              width: SCREEN_WIDTH / 2,
              array: MUSCLE_GROUP_LIST
            },
            {
              title: 'Minutes',
              width: SCREEN_WIDTH / 4,
              array: Array.from({length: 15}, (_, i) => `${i} min`)
            },
            {
              title: 'Seconds',
              width: SCREEN_WIDTH / 4,
              array: Array.from({length: 12}, (_, i) => `${i * 5} sec`)

            },
          ]}
          selectedItems={[muscleGroup, `${mins} min`, `${secs} sec`]}
        />
      </View>
    )
  }

  return (
    <>
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
              Number of rounds
            </ThemeText>
            <MenuPrompt
              promptTitle={`Rounds: ${numRounds}`}
              childArrays={[
                {
                  title: "Number of rounds",
                  width: SCREEN_WIDTH,
                  array: getRoundsArray()
                }
              ]}
              selectedItems={[numRounds]}
              onSave={num => setNumRounds(num)}
            />
            <ThemeText style={[styles.textHeader,]}>
              {`Total time per round: ${totalIntervalTime()}`}
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
          </>
        )}
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
          buttonColor={WORK_COLOR}
          title="Work"
          onPress={() => {
            if (intervals.length >= 6) {
              Alert.alert('Whoops', 'Cannot have more than 6 intervals', [{text: 'Okay'}]);
              return;
            }
            setIntervals(prev => {
              var newTime = 600;
              var prevMuscleGroup = WORK;
              for (let i = prev.length - 1; i >= 0; i--) {
                if (!(prev[i].muscleGroup === REST)) {
                  newTime = prev[i].time;
                  prevMuscleGroup = prev[i].muscleGroup;
                  break;
                }
              }
              const copy = [...prev];
              copy.push({time: newTime, muscleGroup: prevMuscleGroup});
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
          buttonColor={REST_COLOR}
          title="Rest"
          onPress={() => {
            if (intervals.length >= 6) {
              Alert.alert('Whoops', 'Cannot have more than 6 intervals', [{text: 'Okay'}]);
              return;
            }
            setIntervals(prev => {
              var newTime = 100;
              for (let i = prev.length - 1; i >= 0; i--) {
                if (prev[i].muscleGroup === REST) {
                  newTime = prev[i].time;
                  break;
                }
              }
              const copy = [...prev];
              copy.push({time: newTime, muscleGroup: REST});
              return copy;
            });
          }}
        >
          <MaterialCommunityIcons name="plus" style={styles.actionButtonIcon} />
        </ActionButton.Item>
      </ActionButton>
    </>
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
    alignSelf: 'center',
    zIndex: 5,
  },
  listItemContainer: {
    padding: 2,
    height: 100,
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 15,
    marginLeft: 15,
    marginRight: 15,
  },
  listItemContent: {
    backgroundColor: 'red',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  deleteInterval: {
    zIndex: 2,
    position: 'absolute',
    top: 10,
    right: 10,
  }
});