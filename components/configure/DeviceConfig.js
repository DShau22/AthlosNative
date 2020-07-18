import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist'
import React from 'react'
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { Text, Button } from 'react-native-elements'
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/Entypo';
Icon.loadFont()
import { DEVICE_CONFIG_CONSTANTS, DEFAULT_CONFIG } from './DeviceConfigConstants'
import AddPopup from './popups/AddPopup'
import ModeItem from './ModeItem'
const {
  RUN,
  SWIM,
  JUMP,
  SWIMMING_EVENT,
  TIMED_RUN
} = DEVICE_CONFIG_CONSTANTS

// edit popups
import RunEditPopup from './popups/RunEditPopup'
import JumpEditPopup from './popups/JumpEditPopup'
import SwimEditPopup from './popups/SwimEditPopup'
import SwimEventEditPopup from './popups/SwimEventEditPopup'


// CONSIDER USING REACT NATIVE PAPER FAB.GROUP INSTEAD OF A POPUP MODAL
// WHEN ADDING A NEW MODE

// ALSO LOOK AT REACT NATIVE NUMERIC INPUT https://github.com/himelbrand/react-native-numeric-input
// FOR THE UP DOWN BUTTON STUFF

const DeviceConfig = (props) => {
  // CHANGE FROM DEFAULT CONFIG TO THE ASYNC STORAGE
  const [deviceConfig, setDeviceConfig] = React.useState(DEFAULT_CONFIG);
  const [adding, setAdding] = React.useState(false);
  // can be one of the 5 modes
  const [editMode, setEditMode] = React.useState('');
  // keeps track of which item in the mode list the user is editing
  const [editModeItem, setEditModeItem] = React.useState({});

  // deletes a mode from the device config
  const deleteMode = (index, mode) => {
    const newConfig = deviceConfig.filter((_, idx) => {
      return index !== idx;
    })
    Alert.alert(
      "",
      `Are you sure you want to delete these ${mode} settings? You can always add new settings by tapping the + button`,
      [
        {
          text: "Yes",
          onPress: () => setDeviceConfig(newConfig)
        },
        {
          text: "No",
        }
      ]
    )
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
          setEditModeItem(item)
          setEditMode(item.mode);
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
          visible={editModeItem.mode === RUN}
          setVisible={(visible) => { if (!visible) setEditModeItem({}) }}
          editModeItem={editModeItem}
          setDeviceConfig={setDeviceConfig}
        />
        <JumpEditPopup 
          visible={editModeItem.mode === JUMP}
          setVisible={(visible) => { if (!visible) setEditModeItem({}) }}
          editModeItem={editModeItem}
          setDeviceConfig={setDeviceConfig}
        />
        <SwimEditPopup 
          visible={editModeItem.mode === SWIM}
          setVisible={(visible) => { if (!visible) setEditModeItem({}) }}
          editModeItem={editModeItem}
          setDeviceConfig={setDeviceConfig}
        />
        <SwimEventEditPopup 
          visible={editModeItem.mode === SWIMMING_EVENT}
          setVisible={(visible) => { if (!visible) setEditModeItem({}) }}
          editModeItem={editModeItem}
          setDeviceConfig={setDeviceConfig}
        />
      </>
    )
  }

  return (
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
    </View>
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