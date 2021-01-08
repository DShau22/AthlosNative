import React from 'react'
import { View, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native'
import { Text, Button, Input } from 'react-native-elements'
import { DEVICE_CONFIG_CONSTANTS, DEFAULT_CONFIG, MODES } from '../DeviceConfigConstants'
const {
  SWIMMING_EVENT,
  SWIMMING_EVENT_SUBTITLE,
  BUTTERFLY,
  BACKSTROKE,
  BREASTROKE,
  FREESTYLE,
  IM,
} = DEVICE_CONFIG_CONSTANTS
import { Dropdown } from 'react-native-material-dropdown';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
Icon.loadFont();
import GenericModal from './GenericModal';
import SplitInputs from './SplitInputs';
const ANIMATION_DURATION = 150;

// check out the docs, items can have icons too if we decide to do that
// https://www.npmjs.com/package/react-native-dropdown-picker
const strokes = [
  {label: BUTTERFLY, value: BUTTERFLY},
  {label: BACKSTROKE, value: BACKSTROKE},
  {label: BREASTROKE, value: BREASTROKE},
  {label: FREESTYLE, value: FREESTYLE},
  {label: IM, value: IM},
]
const distances = {}
distances[BUTTERFLY] = [
  {label: 50, value: 50},
  {label: 100, value: 100},
  {label: 200, value: 200}
]
distances[BACKSTROKE] = [
  {label: 50, value: 50},
  {label: 100, value: 100},
  {label: 200, value: 200}
]
distances[BREASTROKE] = [
  {label: 50, value: 50},
  {label: 100, value: 100},
  {label: 200, value: 200}
]
distances[FREESTYLE] = [
  {label: 50, value: 50},
  {label: 100, value: 100},
  {label: 200, value: 200},
  {label: 400, value: 400},
  {label: 500, value: 500},
  {label: 800, value: 800},
  {label: 1000, value: 1000},
  {label: 1650, value: 1650},
]
distances[IM] = [
  {label: 100, value: 100},
  {label: 200, value: 200},
  {label: 400, value: 400},
]
export default function SwimEventEditPopup(props) {
  const { visible, setVisible, setDeviceConfig, editModeItem } = props;

  const [stroke, setStroke] = React.useState(FREESTYLE);
  const [distance, setDistance] = React.useState(200);
  const [splits, setSplits] = React.useState([30, 30, 30, 30]);

  // editModeItem is always {} initially, but these comps still render.
  // this is to make sure when props change the states get updated to
  // since state w/hooks doesnt update with props change
  React.useEffect(() => {
    // only change state if the edit mode is correct.
    // Otherwise you'll get errors with things being undefined
    console.log('edit mode item from edit popup: ', editModeItem)
    if (editModeItem.mode === SWIMMING_EVENT) {
      console.log('setting bunch of states')
      setStroke(editModeItem.stroke);
      setDistance(editModeItem.distance);
      setSplits([...editModeItem.splits]);
    }
  }, [editModeItem])

  const saveEdits = () => {
    // check if any of the splits are empty first
    var existsEmptySplit = false;
    splits.forEach((split, _) => {
      existsEmptySplit = existsEmptySplit || split.length === 0 || parseInt(split) <= 9
    })
    if (existsEmptySplit) {
      Alert.alert('Whoops!', "Make sure none of the splits you entered are empty! And that they're all greater than 9 seconds", [{ text: 'okay' }]);
      return;
    }
    // depending on the edit mode
    setDeviceConfig(prevConfig => {
      const newModeSettings = {
        mode: SWIMMING_EVENT,
        subtitle: SWIMMING_EVENT_SUBTITLE,
        stroke: stroke,
        backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${5}, ${132})`,
        distance: distance,
        splits: splits,
      };
      const index = prevConfig.indexOf(editModeItem)
      prevConfig[index] = newModeSettings
      console.log('swim event changes', prevConfig)
      return [...prevConfig]
    })
    setVisible(false);
  }

  const resetState = () => {
    setVisible(false);
  }

  const renderDistance = () => {
    // if the selected stroke from the dropdown is NOT
    // the same as the state stroke, render the lowest distance
    if (Object.keys(editModeItem).length > 0 && editModeItem.stroke !== stroke) {
      return distances[stroke][0].value
    }
    // if the ARE EQUAL, then show the editModeItem distance
    return editModeItem.distance
  }

  const switchStrokes = (newStroke) => {
    // if the value stroke is different from the state stroke, update the splits too
    if (newStroke !== stroke) {
      const newDefaultDistance = distances[newStroke][0].value
      // if the new stroke is the same as what is already set, then return the already set distance
      const newDistance = newStroke === editModeItem.stroke ? editModeItem.distance : newDefaultDistance
      setDistance(newDistance)
      const newDefaultSplits = [...Array(Math.min(8, newDistance/50)).keys()].map(_ => 30)
      setSplits(newDefaultSplits)
      setStroke(newStroke)
    }
    // else the user just tapped the same stroke so nothing should happen
  }

  const renderEditModalContent = () => {
    console.log('splits: ', splits)
    return (
      <View style={styles.innerEditContainer}>
        <Dropdown 
          label='Choose a Stroke'
          data={strokes}
          value={stroke}
          containerStyle={{width: '100%', height: 40, marginBottom: 50}}
          onChangeText={(value) => {switchStrokes(value)}}
          animationDuration={ANIMATION_DURATION}
        />
        <Text>Choose a distance</Text>
        <Dropdown 
          label='Choose a distance'
          data={distances[stroke]}
          value={renderDistance()}
          containerStyle={{width: '100%', height: 40, marginBottom: 50}}
          onChangeText={(value) => {
            setDistance(value)
            // an array of all 30s depending on the distance
            const newDefaultSplits = [...Array(Math.min(8, value/50)).keys()].map(_ => 30)
            setSplits(newDefaultSplits)
          }}
          animationDuration={ANIMATION_DURATION}
        />
        <Text>Set your goal splits</Text>
        <SplitInputs
          distance={distance}
          setSplits={setSplits}
          splits={splits}
        />
      </View>
    )
  }
  
  return (
    <GenericModal
      isVisible={visible}
      setVisible={setVisible}
      titleText='Edit Swim Settings'
      height='80%'
      resetState={resetState}
      saveEdits={saveEdits}
    >
      <View style={styles.container}>
        {renderEditModalContent()}
      </View>
    </GenericModal>
  )
}

const styles = StyleSheet.create({
  container: {
    // flex: 1
  },
  innerEditContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropDown: {
    width: '100%',
    backgroundColor: '#fafafa'
  },
  dropDownItem: {
    justifyContent: 'flex-start'
  },
  splitsContainer: {
    width: '100%',
    marginTop: 25,
  },
  splitsInput: {
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#05375a',
    borderWidth: 1,
    borderColor: 'black',
    paddingTop: 8,
    paddingBottom: 8,
    width: '40%',
  },
  splitsRow: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center'
  }
})

const SharedSplitInputProps = {
  placeholder: 'AIOWEJFOA',
  style: styles.splitsInput,
  placeholderTextColor: "#666666",
  keyboardType: 'numeric',
  defaultValue: '30',
}