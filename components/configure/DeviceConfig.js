import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist'
import React from 'react'
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { Text, Button } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/Entypo';
Icon.loadFont()
import { DEVICE_CONFIG_CONSTANTS, getDefaultConfig } from './DeviceConfigConstants'
import { UserDataContext } from '../../Context';
import AddPopup from './popups/AddPopup'
import ModeItem from './ModeItem'
const {
  RUN,
  SWIM,
  JUMP,
  SWIMMING_EVENT,
  TIMED_RUN,
  MUSIC_ONLY,
  CONFIG_KEY,
  MODE_CONFIG
} = DEVICE_CONFIG_CONSTANTS

// edit popups
import RunEditPopup from './popups/RunEditPopup'
import JumpEditPopup from './popups/JumpEditPopup'
import SwimEditPopup from './popups/SwimEditPopup'
import SwimEventEditPopup from './popups/SwimEventEditPopup'
import MusicPopup from './popups/MusicPopup'

import SAinit from './SAinitManager';
import BLEHandler from '../bluetooth/transmitter';

// CONSIDER USING REACT NATIVE PAPER FAB.GROUP INSTEAD OF A POPUP MODAL
// WHEN ADDING A NEW MODE

//OR ALSO REACT-NATIVE ACTION BUTTON https://github.com/mastermoo/react-native-action-button

// ALSO LOOK AT REACT NATIVE NUMERIC INPUT https://github.com/himelbrand/react-native-numeric-input
// FOR THE UP DOWN BUTTON STUFF

const DeviceConfig = (props) => {
  const userDataContext = React.useContext(UserDataContext)
  const { settings, cadenceThresholds, referenceTimes, runEfforts, swimEfforts, bests } = userDataContext;
  const [deviceConfig, setDeviceConfig] = React.useState(getDefaultConfig());
  const [adding, setAdding] = React.useState(false);
  // idx of the object being edited
  const [editIndex, setEditIndex] = React.useState(null);
  // keeps track of which item in the mode list the user is editing
  const [editModeItem, setEditModeItem] = React.useState({});
  // keeps track of whether or not this is the first render of this component
  const firstUpdate = React.useRef(true);

  React.useEffect(() => {
    console.log(firstUpdate.current);
    if (firstUpdate.current) {
      asyncPrep();
    } else {
      storeConfig();
    }
  }, [deviceConfig]);

  // run this on the first render
  const asyncPrep = async () => {
    try {
      console.log("getting config from async storage");
      const initialConfig = await AsyncStorage.getItem(CONFIG_KEY);
      if (initialConfig !== null) setDeviceConfig(JSON.parse(initialConfig));
      firstUpdate.current = false;
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
  const saveAndSendToDevice = async () => {
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
      const sainitBuffer = sainitManager.createSaInit(); // should return byte array
      // transmit over bluetooth
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
  const renderItem = ({ item, index, drag, isActive }) => {
    return (
      <ModeItem
        item={item}
        drag={drag}
        index={index}
        isActive={isActive}
        deleteMode={deleteMode}
        displayEditModal={() => {
          setEditModeItem(item);
          setEditIndex(index);
        }}
      />
    );
  };

  // lists each of the possible popups that can be rendered based on
  // what the users taps (controlled by the editMode string)
  const popups = () => {
    // IMPORTANT: these popups are always mounted when DeviceConfig mounts,
    // even though they can't always be seen, which is kinda dumb imo
    return (
      <>
        <RunEditPopup
          editIndex={editIndex}
          visible={editModeItem.mode === RUN}
          setVisible={(visible) => { if (!visible) setEditModeItem({}) }}
          editModeItem={editModeItem}
          setDeviceConfig={newConfig => setDeviceConfig(newConfig)}
        />
        <JumpEditPopup
          editIndex={editIndex}
          visible={editModeItem.mode === JUMP}
          setVisible={(visible) => { if (!visible) setEditModeItem({}) }}
          editModeItem={editModeItem}
          setDeviceConfig={setDeviceConfig}
        />
        <SwimEditPopup 
          editIndex={editIndex}
          visible={editModeItem.mode === SWIM}
          setVisible={(visible) => { if (!visible) setEditModeItem({}) }}
          editModeItem={editModeItem}
          setDeviceConfig={setDeviceConfig}
        />
        <SwimEventEditPopup 
          editIndex={editIndex}
          visible={editModeItem.mode === SWIMMING_EVENT}
          setVisible={(visible) => { if (!visible) setEditModeItem({}) }}
          editModeItem={editModeItem}
          setDeviceConfig={setDeviceConfig}
        />
        <MusicPopup
          editIndex={editIndex}
          visible={editModeItem.mode === MUSIC_ONLY}
          setVisible={(visible) => { if (!visible) setEditModeItem({}) }}
          editModeItem={editModeItem}
          setDeviceConfig={setDeviceConfig}
        />
      </>
    )
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
            <AddPopup
              adding={adding}
              setAdding={setAdding}
              setDeviceConfig={setDeviceConfig}
            />
            {popups()}
            <DraggableFlatList
              data={deviceConfig}
              renderItem={renderItem}
              keyExtractor={(item, index) => `draggable-item-${item.mode}-${index}`}
              onDragEnd={({ data }) => setDeviceConfig(data)}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setAdding(true)}
            >
              <Icon name="plus" size={30} color='black' />
            </TouchableOpacity>

            <Button title='test make sainit' onPress={saveAndSendToDevice}/>
          </View>
        }
      </Stack.Screen>
    </Stack.Navigator>
  );
}
const styles = StyleSheet.create({
  addButton: {
    position: 'absolute',
    bottom: 25,
    right: 25,

    borderColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 30,
  },

})
export default gestureHandlerRootHOC(DeviceConfig)