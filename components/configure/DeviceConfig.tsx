import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';
import React from 'react';
import { View, StyleSheet, Dimensions, Alert, Button, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Entypo';
Icon.loadFont();
import { storeSaInitConfig, getSaInitConfig } from '../utils/storage';
import {
  DEVICE_CONFIG_CONSTANTS,
  getDefaultConfig,
  getDefaultModeObject,
  Mode
} from './DeviceConfigConstants';
import { UserDataContext, AppFunctionsContext, AppFunctionsContextType } from '../../Context';
import ModeItem from './ModeItem';
const {
  RUN,
  SWIM,
  JUMP,
  SWIMMING_RACE,
  INTERVAL,
  MUSIC_ONLY,
  TIMER,
  MODE_CONFIG,
  SWIM_WORKOUT,
} = DEVICE_CONFIG_CONSTANTS;
import GLOBAL_CONSTANTS from '../GlobalConstants';
const { SCREEN_HEIGHT, SCREEN_WIDTH } = GLOBAL_CONSTANTS;

// edit screens
import RunEditScreen from './screens/RunEditScreen';
import SwimEditScreen from './screens/SwimEditScreen';
import VerticalEditScreen from './screens/VerticalEditScreen';
import TimerEditScreen from './screens/TimerEditScreen';
import SwimmingRaceEditScreen from './screens/SwimmingRaceEditScreen';
import MusicOnlyEditScreen from './screens/MusicOnlyScreen';
import IntervalEditScreen from './screens/IntervalEditScreen';
import SwimmingWorkoutEditScreen from './screens/SwimWorkoutEditScreen';

import SAinit from '../bluetooth/SAinitManager';
import ThemeText from '../generic/ThemeText';
import { Divider } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';
import SAInitSender from '../bluetooth/SAInitSender';
import PullUpMenu from './screens/PullUpMenu';
import SyncProgressCircle from '../bluetooth/SyncProgressCircle';
import SyncProgressCircleHeader from '../bluetooth/SyncProgressCircleHeader';

const FAB_SIZE = 60;
const DeviceConfig = (props) => {
  const { colors } = useTheme();

  const userDataContext = React.useContext(UserDataContext);
  const { settings, cadenceThresholds, referenceTimes, runEfforts, swimEfforts, bests } = userDataContext;
  const appFunctionsContext = React.useContext(AppFunctionsContext) as AppFunctionsContextType;
  const { syncProgress } = appFunctionsContext;
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [deviceConfig, setDeviceConfig] = React.useState<Array<Mode>>(getDefaultConfig());
  // keeps track of whether or not this is the first render of this component
  const firstUpdate = React.useRef(true);
  const addRBSheetRef = React.useRef();

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
      const initialConfig = await getSaInitConfig();
      console.log("config got: ", initialConfig);
      firstUpdate.current = false;
      if (initialConfig) {
        setDeviceConfig(initialConfig);
      } else {
        const defaultConfig = getDefaultConfig();
        setDeviceConfig(defaultConfig);
        await storeSaInitConfig(defaultConfig);
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
      await storeSaInitConfig(deviceConfig);
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
    return sainitManager.createSaInit(); // should return byte array
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
        options={{ headerTitle: _ => <SyncProgressCircleHeader headerText="Configure your device" syncProgress={syncProgress}/> }}
      >
        {props => 
          <View style={{ flex: 1 }}>
            {isLoading ? 
              <View style={{
                height: GLOBAL_CONSTANTS.SCREEN_HEIGHT,
                width: GLOBAL_CONSTANTS.SCREEN_WIDTH,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'black',
                opacity: .7,
                zIndex: 1000,
                position: 'absolute',
              }}>
                <ActivityIndicator size='large'/>
              </View> : null
            }
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
                  <SAInitSender
                    containerStyle={{
                      width: '90%',
                      alignSelf: 'center',
                      margin: 3
                    }}
                    setIsLoading={setIsLoading}
                    saveAndCreateSaInit={saveAndCreateSaInit}
                  />
                  <Divider style={{ alignSelf: 'center', width: '95%', marginTop: 10, backgroundColor: colors.text }}/>
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
                    <View style={{height: 20}}></View>
                    {/* <SAInitSender
                      containerStyle={{
                        alignSelf: 'center',
                        margin: 20
                      }}
                      setIsLoading={setIsLoading}
                      saveAndCreateSaInit={saveAndCreateSaInit}
                    /> */}
                    {/* <Button 
                      title='test'
                      onPress={async () => console.log(await saveAndCreateSaInit())}
                    /> */}
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
              onPress={() => {
                if (deviceConfig.length >= 7) {
                  Alert.alert(
                    'Whoops',
                    'Cannot have more than 7 modes',
                    [{text: 'Okay'}]
                  )
                } else {
                  addRBSheetRef.current.open()}
                }
              }
            />
            <PullUpMenu
              refRBSheet={addRBSheetRef}
              pullUpTitle={'Modes'}
              childArrays={[
                {
                  title: "Mode",
                  width: SCREEN_WIDTH,
                  array: [
                    RUN,
                    SWIM,
                    SWIM_WORKOUT,
                    JUMP,
                    SWIMMING_RACE,
                    INTERVAL,
                    TIMER,
                  ]
                }
              ]}
              selectedItems={[MUSIC_ONLY]}
              onSave={(chosenMode) => addMode(chosenMode)}
            />
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
        name={SWIMMING_RACE}
        options={{ title: "Swimming Race Tracker" }}
      >
        {props => 
          <SwimmingRaceEditScreen
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
        name={SWIM_WORKOUT}
        options={{ title: "Swimming Workout" }}
      >
        {props => 
          <SwimmingWorkoutEditScreen
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
export default gestureHandlerRootHOC(DeviceConfig)