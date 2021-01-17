import React from 'react';
import { View, StyleSheet, Alert, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { DEVICE_CONFIG_CONSTANTS, } from '../DeviceConfigConstants';
const {
  TIMER,
  MODE_CONFIG
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
import { ListItem } from 'react-native-elements';
import DraggableFlatList from 'react-native-draggable-flatlist';
import MenuPrompt from './MenuPrompt';
import {numToWord, capitalize} from '../../utils/strings';

export default function TimerEditScreen(props) {
  const { colors } = useTheme();
  const { navigation, deviceConfig, setDeviceConfig } = props;
  const { editIdx } = props.route.params; // index of the object in deviceConfig array we are editing
  const timerSettings = deviceConfig[editIdx];

  const [isLoading, setIsLoading] = React.useState(false);
  const [splits, setSplits] = React.useState(timerSettings.splits); // in tenths
  const [repeats, setRepeats] = React.useState(false);
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
        splits: splits,
        repeats
      };
      prevConfig[editIdx] = newModeSettings;
      return [...prevConfig];
    })
  }

  const resetState = () => {
    setIsLoading(false);
    setSplits(timerSettings.splits);
  }

  const totalSplitTime = () => {
    const totalTenths = splits.reduce((a, b) => a + b, 0);
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
    if (repeats && index === splits.length - 1) {
      secsText = secs === 0 && tenths === 0 ? '' : ` ${secs}.${tenths} second`;
      promptSubtitle = `${minsText}${secsText} intervals onwards`;
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
          // childArray={Array.from(Array(60).keys())}
          // secondChildArray={Array.from(Array(60).keys())}
          // thirdChildArray={Array.from(Array(10).keys())}
          // selectedItem={mins}
          // secondSelectedItem={secs}
          // thirdSelectedItem={tenths}
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
          <ThemeText style={{fontSize: 20, fontWeight: 'bold', alignSelf: 'flex-start', margin: 10}}>
            Timer with alerts:
          </ThemeText>
          <ThemeText style={{margin: 10, marginTop: 0}}>
            Set up a timer with checkpoints. Your device will alert you once these checkpoints have passed in time, and
            you can customize these checkpoint times (up to a max of 6).
          </ThemeText>
          <ListItem
            containerStyle={{backgroundColor: colors.background}}
            bottomDivider
            topDivider
            onPress={() => setRepeats(prev => !prev)}
          >
            <ListItem.Content>
              <ListItem.Title>
                <ThemeText>
                  Repeat last interval?
                </ThemeText>
              </ListItem.Title>
              <ListItem.Subtitle style={{marginTop: 5}}>
                <ThemeText>
                  If enabled, the timer will keep repeating the last interval forever. Otherwise, the timer will stop after 
                  the last interval finishes.
                </ThemeText>
              </ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.CheckBox
              checked={repeats}
              checkedColor={colors.textColor}
              onPress={() => setRepeats(prev => !prev)}
            />
          </ListItem>
          <ThemeText style={{fontSize: 20, fontWeight: 'bold', alignSelf: 'flex-start', margin: 10}}>
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
  }
});
