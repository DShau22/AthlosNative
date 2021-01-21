import React from 'react';
import { View, StyleSheet, Alert, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { DEVICE_CONFIG_CONSTANTS, } from '../DeviceConfigConstants';
const {
  TIMER,
  MODE_CONFIG,

  ENDS,
  REPEAT_LAST,
  CYCLES,
} = DEVICE_CONFIG_CONSTANTS;
import ActionButton from 'react-native-action-button';
import { useTheme } from '@react-navigation/native';
import GLOBAL_CONSTANTS from '../../GlobalConstants';
const { METRIC } = GLOBAL_CONSTANTS;
import Entypo from 'react-native-vector-icons/Entypo';
Entypo.loadFont();
import ThemeText from '../../generic/ThemeText';
import { UserDataContext } from '../../../Context';
import SaveButton from './SaveButton';
import Spinner from 'react-native-loading-spinner-overlay';
import { Divider, ListItem } from 'react-native-elements';
import DraggableFlatList from 'react-native-draggable-flatlist';
import MenuPrompt from './MenuPrompt';
import {numToWord, capitalize} from '../../utils/strings';

REP_OPTION_LIST = [
  {
    title: ENDS,
    subtitle: 'Timer stops after the final time period ends.'
  },
  {
    title: CYCLES,
    subtitle: 'Timer repeats from the start after the final time period ends (you can set how many times).'
  },
  {
    title: REPEAT_LAST,
    subtitle: 'Timer repeats the last time period (you can set how many times).'
  },
]

export default function TimerEditScreen(props) {
  const { colors } = useTheme();
  const { navigation, deviceConfig, setDeviceConfig } = props;
  const { editIdx } = props.route.params; // index of the object in deviceConfig array we are editing
  const timerSettings = deviceConfig[editIdx];

  const [isLoading, setIsLoading] = React.useState(false);
  const [splits, setSplits] = React.useState(timerSettings.splits); // in tenths
  const [repetition, setRepetition] = React.useState(timerSettings.repetition);
  const [numRepetitions, setNumRepetitions] = React.useState(timerSettings.numRepetitions);

  const firstUpdate = React.useRef(true);

  React.useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    setIsLoading(false);
    Alert.alert('Done!', 'Successfully saved your timer settings', [{text: 'Okay'}]);
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
        mode: TIMER,
        splits,
        repetition,
        numRepetitions,
      };
      prevConfig[editIdx] = newModeSettings;
      return [...prevConfig];
    })
  }

  const resetState = () => {
    setIsLoading(false);
    setSplits(timerSettings.splits);
  }

  const renderRepetitionOption = () => {
    return REP_OPTION_LIST.map(({title, subtitle}, _) => (
      <ListItem
        containerStyle={{backgroundColor: colors.background}}
        key={title}
        bottomDivider
        onPress={() => setRepetition(title)}
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
          checked={repetition === title}
          checkedColor={colors.textColor}
          checkedIcon='dot-circle-o'
          uncheckedIcon='circle-o'
          onPress={() => setRepetition(title)}
        />
      </ListItem>
    ));
  }


  const totalSplitTime = () => {
    const totalTenths = splits.reduce((a, b) => a + b, 0) * (repetition !== ENDS ? numRepetitions : 1);
    const mins = Math.floor(totalTenths / 600);
    const secs = Math.floor((totalTenths % 600) / 10);
    const tenths = totalTenths % 10;
    return `${mins} ${mins === 1 ? 'min' : 'mins'}, ${secs}.${tenths} seconds`;
  }

  const addCheckpoint = () => {
    if (splits.length >= 6) {
      Alert.alert("Whoops", "Cannot have more than 6 intervals", [{text: 'okay'}]);
      return;
    }
    setSplits(prev => {
      const copy = [...prev];
      copy.push(60);
      return copy;
    });
  }

  const renderListItem = ({item, index, drag, isActive}) => {
    const totalTenths = item;
    const mins = Math.floor(totalTenths / 600);
    const secs = Math.floor((totalTenths % 600) / 10);
    const tenths = totalTenths % 10;
    const minsText = mins === 0 ? '' : `${mins} ${mins === 1 ? 'min' : 'mins'}`;
    var secsText = secs === 0 && tenths === 0 ? '' : ` ${secs}.${tenths} seconds`;
    var promptSubtitle = `${minsText}${secsText} after ${index === 0 ? 'start' : `${numToWord(index - 1)} checkpoint`}`;
    if (repetition === REPEAT_LAST && index === splits.length - 1) {
      secsText = secs === 0 && tenths === 0 ? '' : ` ${secs}.${tenths} second`;
      promptSubtitle = `${minsText}${secsText} periods onwards`;
    }
    return (
      <View style={{
        padding: 5,
        marginTop: 10,
        borderRadius: 8,
        borderWidth: 1,
        width: '94%',
        borderColor: colors.textColor,
        alignSelf: 'center',
      }}>
        <TouchableOpacity
          style={styles.deleteInterval}
          onPress={() => {
            setSplits(prev => {
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
          noChevron
          noDividers
          pullUpTitle='mins | secs | tenths'
          promptTitle={`${capitalize(numToWord(index))} checkpoint:`}
          promptSubtitle={promptSubtitle}
          onLongPress={drag}
          onSave={(mins, secs, tenths) => {
            const totalTenths = mins * 600 + secs * 10 + tenths;
            setSplits(prev => {
              const copy = [...prev];
              copy[index] = totalTenths;
              return copy;
            })
          }}
          childArrays={[
            Array.from(Array(60).keys()),
            Array.from(Array(60).keys()),
            Array.from(Array(10).keys())
          ]}
          selectedItems={[
            mins,
            secs,
            tenths
          ]}
        />
      </View>
    );
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
          <ThemeText style={styles.headerText}>
            Timer with alerts:
          </ThemeText>
          <ThemeText style={{margin: 10, marginTop: 0}}>
            Set up a timer with checkpoints. Your device will alert you once these checkpoints have passed in time, and
            you can customize these checkpoint times (up to a max of 6).
          </ThemeText>
          <Divider />
          {renderRepetitionOption()}
          { repetition === CYCLES || repetition === REPEAT_LAST ? 
            <>
              <ThemeText style={styles.headerText}>
                {`Number of ${repetition === CYCLES ? 'cycles' : 'repeats'}`}
              </ThemeText>
              <MenuPrompt
                pullUpTitle={`Number of ${repetition === CYCLES ? 'cycles' : 'repeats'}`}
                promptTitle={`${numRepetitions} ${repetition === CYCLES ? 'cycles' : 'repeats'}`}
                onSave={(newNumRepetitions) => {
                  setNumRepetitions(newNumRepetitions);
                }}
                childArrays={[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]}
                selectedItems={[numRepetitions]}
              />
            </>
          : null }
          <ThemeText style={styles.headerText}>
            Set your alerts:
          </ThemeText>
        </>
      )}
      data={splits}
      renderItem={renderListItem}
      keyExtractor={(item, index) => `draggable-item-${item.mode}-${index}`}
      onDragEnd={({ data }) => {
        setSplits(data);
      }}
      ListFooterComponent={() => (
        <>
          <ThemeText style={[styles.textHeader,]}>
            {`Total time: ${totalSplitTime()}`}
          </ThemeText>
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
            onPress={addCheckpoint}
          />
        </>
      )}
    />
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
  deleteInterval: {
    zIndex: 2,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    margin: 10
  }
});
