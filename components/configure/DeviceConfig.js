import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';
import React from 'react';
import { View, StyleSheet, Dimensions, Alert, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { Button } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Entypo';
Icon.loadFont();

import { DEVICE_CONFIG_CONSTANTS, getDefaultConfig, getDefaultModeObject } from './DeviceConfigConstants';
import { UserDataContext } from '../../Context';
import AddPopup from './popups/AddPopup';
import ModeItem from './ModeItem';
const {
  RUN,
  SWIM,
  JUMP,
  SWIMMING_EVENT,
  INTERVAL,
  MUSIC_ONLY,
  CONFIG_KEY,
  TIMER,
  MODE_CONFIG
} = DEVICE_CONFIG_CONSTANTS;

// edit popups
import RunEditPopup from './popups/RunEditPopup';
import JumpEditPopup from './popups/JumpEditPopup';
import SwimEditPopup from './popups/SwimEditPopup';
import SwimEventEditPopup from './popups/SwimEventEditPopup';
import MusicPopup from './popups/MusicPopup';

// edit screens
import RunEditScreen from './screens/RunEditScreen';
import SwimEditScreen from './screens/SwimEditScreen';
import VerticalEditScreen from './screens/VerticalEditScreen';
import TimerEditScreen from './screens/TimerEditScreen';
import SwimmingEventEditScreen from './screens/SwimmingEventEditScreen';
import MusicOnlyEditScreen from './screens/MusicOnlyScreen';
import IntervalEditScreen from './screens/IntervalEditScreen';

import SAinit from './SAinitManager';
import BLEHandler from '../bluetooth/transmitter';
import ThemeText from '../generic/ThemeText';
import { Divider } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import IntervalEditPopup from './popups/IntervalEditPopup';
import LoadingSpin from '../generic/LoadingSpin';
import Spinner from 'react-native-loading-spinner-overlay';
import SAInitSender from '../bluetooth/SAInitSender';

// CONSIDER USING REACT NATIVE PAPER FAB.GROUP INSTEAD OF A POPUP MODAL
// WHEN ADDING A NEW MODE

// OR ALSO REACT-NATIVE ACTION BUTTON https://github.com/mastermoo/react-native-action-button

// ALSO LOOK AT REACT NATIVE NUMERIC INPUT https://github.com/himelbrand/react-native-numeric-input
// FOR THE UP DOWN BUTTON STUFF
const WIDTH = Dimensions.get('window').width;
const FAB_SIZE = 60;
const DeviceConfig = (props) => {
  const { colors } = useTheme();

  const userDataContext = React.useContext(UserDataContext);
  const { settings, cadenceThresholds, referenceTimes, runEfforts, swimEfforts, bests } = userDataContext;
  const [deviceConfig, setDeviceConfig] = React.useState(getDefaultConfig());
  // keeps track of whether or not this is the first render of this component
  const firstUpdate = React.useRef(true);

  React.useEffect(() => {
    if (firstUpdate.current) {
      asyncPrep();
    } else {
      storeConfig();
    }
  }, [deviceConfig]);

  // run this on the first render
  const asyncPrep = async () => {
    try {
      // await AsyncStorage.removeItem(CONFIG_KEY);
      console.log("getting config from async storage");
      const initialConfig = await AsyncStorage.getItem(CONFIG_KEY);
      console.log("config got: ", initialConfig);
      firstUpdate.current = false;
      if (initialConfig !== null) {
        setDeviceConfig(JSON.parse(initialConfig));
      } else {
        setDeviceConfig(getDefaultConfig());
      }
    } catch(e) {
      console.log(e);
      Alert.alert(
        "Oh No :(",
        `Something went wrong with loading your config settings. Please refresh and try again.`,
        [{text: "Ok"}]
      );
    }
  }
  // run this on every other render
  const storeConfig = async () => {
    try {
      await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(deviceConfig));
      console.log("new config stored: ", deviceConfig);
    } catch(e) {
      console.log(e)
      Alert.alert(
        "Oh No :(",
        `Something went wrong with saving your config settings. Please try again.`,
        [{text: "Ok"}]
      );
    }
  }

  // deletes a mode from the device config
  const deleteMode = (index, mode) => {
    const newConfig = deviceConfig.filter((_, idx) => {
      return index !== idx;
    });
    Alert.alert(
      "",
      `Are you sure you want to delete these ${mode} settings? You can always add new settings by tapping the + button`,
      [
        { text: "Yes", onPress: () => setDeviceConfig(newConfig) },
        { text: "No", }
      ]
    )
  }

  // sends the current device config to the athlos earbuds
  const saveAndCreateSaInit = async () => {
    try {
      // store the device config in local storage first
      await storeConfig();
      const sainitManager = new SAinit(
        deviceConfig,
        settings,
        runEfforts,
        swimEfforts,
        referenceTimes,
        cadenceThresholds,
        bests.highestJump,
      );
      return sainitBuffer = sainitManager.createSaInit(); // should return byte array
    } catch(e) {
      console.log(e);
      Alert.alert(
        "Oh No :(",
        `Something went wrong with updating your config settings. Please try again.`,
        [{text: "Ok"}]
      );
    }
  }

  // function for rendering draggable list item
  const renderItem = (item, index, drag, isActive, navigation) => {
    return (
      <ModeItem
        item={item}
        drag={drag}
        index={index}
        isActive={isActive}
        deleteMode={deleteMode}
        onPress={() => {
          navigation.navigate(item.mode, {editIdx: index});
        }}
      />
    );
  };

  const addMode = (mode) => {
    setDeviceConfig(prevConfig => [...prevConfig, getDefaultModeObject(mode)])
  }

  if (firstUpdate.current) {
    return (
      <View>
        <Spinner
          textStyle={{color: colors.textColor}}
        />
      </View>
    );
  }
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={MODE_CONFIG}
        options={{ title: "Your Device Settings" }}
      >
        {props => 
          <View style={{ flex: 1 }}>
            <DraggableFlatList
              ListHeaderComponent={() => (
                <>
                  <ThemeText style={{ marginTop: 20, marginLeft: 10, fontSize: 20, fontWeight: 'bold' }}>
                    Tailor your device to your preferences:
                  </ThemeText>
                  <ThemeText style={{ margin: 10, fontSize: 14 }}>
                    Customize what stats your device will report to you in workouts and when to report them.
                    Add or remove activity tracking modes that your device can use when powered on.
                  </ThemeText>
                  <Divider style={{ alignSelf: 'center', width: '95%', marginTop: 10, backgroundColor: colors.textColor }}/>
                </>
              )}
              data={deviceConfig}
              renderItem={({item, index, drag, isActive}) => 
                renderItem(item, index, drag, isActive, props.navigation)
              }
              keyExtractor={(item, index) => `draggable-item-${item.mode}-${index}`}
              onDragEnd={({ data }) => {
                if (data[0].mode !== MUSIC_ONLY) {
                  Alert.alert(
                    "Whoops",
                    `The device must always start with Music Only mode when powered on.`,
                    [{text: "Ok"}]
                  );
                } else {
                  setDeviceConfig(data);
                }
              }}
              ListFooterComponent={() => {
                return (
                  <>
                    {/* <SAInitSender
                      saveAndCreateSaInit={saveAndCreateSaInit}
                    /> */}
                    {/* <Button title='test make sainit' onPress={saveAndSendToDevice}/> */}
                  </>
                )
              }}
            />
            <ActionButton
              position='left'
              offsetX={15}
              offsetY={15}
              buttonColor={'#1CB5E0'}
              size={FAB_SIZE}
            >
              <ActionButton.Item
                size={FAB_SIZE - 8}
                textContainerStyle={styles.actionButtonTextContainer}
                textStyle={styles.actionButtonText}
                buttonColor='#9b59b6'
                title="Music Only"
                onPress={() => addMode(MUSIC_ONLY)}
              >
                <Icon name="md-create" style={styles.actionButtonIcon} />
              </ActionButton.Item>
              <ActionButton.Item
                size={FAB_SIZE - 8}
                textContainerStyle={styles.actionButtonTextContainer}
                textStyle={styles.actionButtonText}
                buttonColor='#3498db'
                title="Running"
                onPress={() => addMode(RUN)}
              >
                <Icon name="md-notifications-off" style={styles.actionButtonIcon} />
              </ActionButton.Item>
              <ActionButton.Item
                size={FAB_SIZE - 8}
                textContainerStyle={styles.actionButtonTextContainer}
                textStyle={styles.actionButtonText}
                buttonColor='#1abc9c'
                title="Swimming"
                onPress={() => addMode(SWIM)}
              >
                <Icon name="md-done-all" style={styles.actionButtonIcon} />
              </ActionButton.Item>
              <ActionButton.Item
                size={FAB_SIZE - 8}
                textContainerStyle={styles.actionButtonTextContainer}
                textStyle={styles.actionButtonText}
                buttonColor='#1abc9c'
                title="Vertical"
                onPress={() => addMode(JUMP)}
              >
                <Icon name="md-done-all" style={styles.actionButtonIcon} />
              </ActionButton.Item>
              <ActionButton.Item
                size={FAB_SIZE - 8}
                textContainerStyle={styles.actionButtonTextContainer}
                textStyle={styles.actionButtonText}
                buttonColor='#1abc9c'
                title="Swimming Event"
                onPress={() => addMode(SWIMMING_EVENT)}
              >
                <Icon name="md-done-all" style={styles.actionButtonIcon} />
              </ActionButton.Item>
              <ActionButton.Item
                size={FAB_SIZE - 8}
                textContainerStyle={styles.actionButtonTextContainer}
                textStyle={styles.actionButtonText}
                buttonColor='#1abc9c'
                title="Interval"
                onPress={() => addMode(INTERVAL)}
              >
                <Icon name="md-done-all" style={styles.actionButtonIcon} />
              </ActionButton.Item>
            </ActionButton>
          </View>
        }
      </Stack.Screen>
      <Stack.Screen
        name={RUN}
        options={{ title: "Running Tracker" }}
      >
        {props => 
          <RunEditScreen
            {...props}
            setDeviceConfig={newConfig => setDeviceConfig(newConfig)}
            deviceConfig={deviceConfig}
          />}
      </Stack.Screen>
      <Stack.Screen
        name={SWIM}
        options={{ title: "Lap Swim Tracker" }}
      >
        {props => 
          <SwimEditScreen
            {...props}
            setDeviceConfig={newConfig => setDeviceConfig(newConfig)}
            deviceConfig={deviceConfig}
          />}
      </Stack.Screen>
      <Stack.Screen
        name={JUMP}
        options={{ title: "Vertical Height Tracker" }}
      >
        {props => 
          <VerticalEditScreen
            {...props}
            setDeviceConfig={newConfig => setDeviceConfig(newConfig)}
            deviceConfig={deviceConfig}
          />}
      </Stack.Screen>
      <Stack.Screen
        name={SWIMMING_EVENT}
        options={{ title: "Swimming Event Tracker" }}
      >
        {props => 
          <SwimmingEventEditScreen
            {...props}
            setDeviceConfig={newConfig => setDeviceConfig(newConfig)}
            deviceConfig={deviceConfig}
          />}
      </Stack.Screen>
      <Stack.Screen
        name={TIMER}
        options={{ title: "Time Trial" }}
      >
        {props => 
          <TimerEditScreen
            {...props}
            setDeviceConfig={newConfig => setDeviceConfig(newConfig)}
            deviceConfig={deviceConfig}
          />}
      </Stack.Screen>
      <Stack.Screen
        name={INTERVAL}
        options={{ title: "Interval Training" }}
      >
        {props => 
          <IntervalEditScreen
            {...props}
            setDeviceConfig={newConfig => setDeviceConfig(newConfig)}
            deviceConfig={deviceConfig}
          />}
      </Stack.Screen>
      <Stack.Screen
        name={MUSIC_ONLY}
        options={{ title: "Music Only" }}
      >
        {props => 
          <MusicOnlyEditScreen
            {...props}
            setDeviceConfig={newConfig => setDeviceConfig(newConfig)}
            deviceConfig={deviceConfig}
          />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
const styles = StyleSheet.create({
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
  }
})
export default gestureHandlerRootHOC(DeviceConfig)