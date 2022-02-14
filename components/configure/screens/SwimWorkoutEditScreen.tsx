import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
MaterialCommunityIcons.loadFont();
import Entypo from 'react-native-vector-icons/Entypo';
Entypo.loadFont();

import {
  DEVICE_CONFIG_CONSTANTS,
  SwimWorkoutInterface,
  SwimSet,
  DISTANCES_LIST,
  STROKES_LIST,
} from '../DeviceConfigConstants';
const {
  SWIM_WORKOUT,
  MODE_CONFIG,
  WORK,
  REST,
  BUTTERFLY,
  BACKSTROKE,
  BREASTROKE,
  FREESTYLE,
  IM,
} = DEVICE_CONFIG_CONSTANTS;
import GLOBAL_CONSTANTS from '../../GlobalConstants';
const { SCREEN_HEIGHT, SCREEN_WIDTH } = GLOBAL_CONSTANTS;
import { COLOR_THEMES } from '../../ColorThemes';
const {
  SWIM_DONUT_GRADIENTS
} = COLOR_THEMES;
import { useTheme } from '@react-navigation/native';
import ThemeText from '../../generic/ThemeText';
import SaveButton from './SaveButton';
import Spinner from 'react-native-loading-spinner-overlay';
import MenuPrompt from './MenuPrompt';
import ActionButton from 'react-native-action-button';

export default function SwimWorkoutEditScreen(props) {
  const { colors } = useTheme();
  const { navigation, deviceConfig, setDeviceConfig } = props;
  const { editIdx } = props.route.params; // index of the object in deviceConfig array we are editing
  const workoutSettings: SwimWorkoutInterface = deviceConfig[editIdx];

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [sets, setSets] = React.useState<Array<SwimSet>>(workoutSettings.sets);
  const [numRounds, setNumRounds] = React.useState(workoutSettings.numRounds);
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
        mode: SWIM_WORKOUT,
        sets,
        numRounds,
      };
      prevConfig[editIdx] = newModeSettings;
      return [...prevConfig];
    })
  }

  const resetState = () => {
    setIsLoading(false);
    setSets(workoutSettings.sets);
    setNumRounds(workoutSettings.numRounds);
  }

  const getSecondsArray = (distance: number) => {
    const result = [];
    if (distance <= 200) {
      for (let i = 1; i <= 11; i++) {
        result.push(`${i * 5} s`);
      } 
    } else {
      for (let i = 0; i <= 5; i++) {
        result.push(`${i * 10} s`);
      } 
    }
    return result;
  }

  const renderListItem = ({item, index, drag, isActive}) => {
    var swimSet: SwimSet = item;
    const { timeInSeconds, reps, stroke, distance } = swimSet;
    console.log(`selected reps for ${stroke}, ${distance}: ${reps}`);
    var mins = Math.floor(timeInSeconds / 60);
    var secs = timeInSeconds % 60;
    var minsText = mins === 0 ? '' : `${mins} ${mins === 1 ? 'min' : 'mins'} `;
    var secsText = secs === 0 ? '' : `${secs} ${mins === 1 ? 'second' : 'seconds'}`;
    var promptSubtitle = `${minsText}${secsText}`;
    return (
      <View style={{
        padding: 5,
        marginTop: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#82eefd',
        width: '94%',
        alignSelf: 'center',
      }}>
        <TouchableOpacity
          style={styles.deleteInterval}
          onPress={() => {
            setSets(prev => {
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
            color={colors.text}
          />
        </TouchableOpacity>
        <MenuPrompt
          noDividers
          noChevron
          fontSize={16}
          promptTitle={`${reps}x${distance} ${stroke}`}
          promptSubtitle={promptSubtitle}
          onSave={(newReps: number, newDistance: number, newStroke: string, newMin: string, newSec: string) => {
            const totalSeconds = parseInt(newMin) * 60 + parseInt(newSec);
            setSets(prev => {
              const copy = [...prev];
              copy[index].timeInSeconds = totalSeconds;
              copy[index].distance = newDistance;
              copy[index].reps = newReps;
              copy[index].stroke = newStroke;
              return copy;
            });
          }}
          onLongPress={drag}
          childArrays={[
            {
              title: 'Reps',
              width: SCREEN_WIDTH * 0.15,
              array: Array.from({length: 8}, (_, i) => i + 1)
            },
            {
              title: 'Distance',
              width: SCREEN_WIDTH * 0.15,
              array: DISTANCES_LIST,
            },
            {
              title: 'Stroke',
              width: SCREEN_WIDTH * 0.4,
              array: STROKES_LIST,
            },
            {
              title: 'Min',
              width: SCREEN_WIDTH * 0.15,
              array: Array.from({length: distance <= 200 ? 5 : 10}, (_, i) => `${i} m`)
            },
            {
              title: 'Sec',
              width: SCREEN_WIDTH * 0.15,
              array: getSecondsArray(distance),
            },
          ]}
          selectedItems={[reps, distance, stroke, `${mins} m`, `${secs} s`]}
        />
      </View>
    )
  }

  const getTotalWorkoutTime = (): string => {
    var totalTimeInSeconds = 0;
    for (let i = 0; i < sets.length; i++) {
      let set = sets[i];
      totalTimeInSeconds += set.reps * set.timeInSeconds;
    }
    totalTimeInSeconds = totalTimeInSeconds * numRounds;
    var hours = Math.floor(totalTimeInSeconds / (60 * 60));
    var minutes = Math.floor((totalTimeInSeconds % 3600) / 60);
    var seconds = totalTimeInSeconds % 60;
    var hoursText = hours === 0 ? '' : `${hours} ${hours === 1 ? 'hr' : 'hrs'} `; 
    var minsText = minutes === 0 ? '' : `${minutes} ${minutes === 1 ? 'min' : 'mins'} `;
    var secsText = seconds === 0 ? '' : `${seconds} ${seconds === 1 ? 'sec' : 'secs'}`;
    return `${hoursText}${minsText}${secsText}`;
  }

  return (
    <>
      <DraggableFlatList
        ListHeaderComponent={() => (
          <>
            <Spinner
              visible={isLoading}
              textContent='Saving...'
              textStyle={{color: colors.text}}
            />
            <ThemeText style={{fontSize: 20, fontWeight: 'bold', alignSelf: 'flex-start', margin: 10}}>
              Create your own swimming workout:
            </ThemeText>
            <ThemeText style={{margin: 10}}>
              Customize a swimming workout and upload it to your Athlos earbuds. Your coach will tell you
              what to swim, when to leave, and will update you on your progress throughout the workout. 
              Forget about needing a clock or having to memorize your workouts!
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
                  array: Array.from({length: 8}, (_, i) => i + 1)
                }
              ]}
              selectedItems={[numRounds]}
              onSave={(num: number) => setNumRounds(num)}
            />
            <ThemeText style={[styles.textHeader,]}>
              {`Total workout time: ${getTotalWorkoutTime()}`}
            </ThemeText>
          </>
        )}
        data={sets}
        renderItem={renderListItem}
        keyExtractor={(_, index) => `draggable-item-${index}`}
        onDragEnd={({ data }) => {
          setSets(data);
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
        onPress={() => {
          if (sets.length >= 6) {
            Alert.alert('Whoops', 'Cannot have more than 6 sets in a round', [{text: 'Okay'}]);
            return;
          }
          setSets(prev => {
            const copy = [...prev];
            copy.push({
              reps: 4,
              distance: 100,
              stroke: FREESTYLE,
              timeInSeconds: 90,
            });
            return copy;
          });
        }}
      />      
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