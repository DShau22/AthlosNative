import React from 'react'
import { View, StyleSheet, TouchableOpacity, FlatList, BackHandler } from 'react-native'
import { Text, Button } from 'react-native-elements'
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
import DropDownPicker from 'react-native-dropdown-picker';
import { Dropdown } from 'react-native-material-dropdown';

import LinearGradient from 'react-native-linear-gradient';
import SwitchSelector from "react-native-switch-selector";
import UpDownButton from './UpDownButton'
import Icon from 'react-native-vector-icons/AntDesign';
Icon.loadFont()
// popup stuff
import Modal, {
  ModalContent,
  ModalTitle,
  FadeAnimation,
} from 'react-native-modals';

import SaveCancelFooter from './SaveCancelFooter'

const ANIMATION_DURATION = 150

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
  const [splits, setSplits] = React.useState([]);

  // editModeItem is always {} initially, but these comps still render
  // this is to make sure when props change the states get updated to
  // since state w/hooks doesnt update with props change
  React.useEffect(() => {
    // only change state if the edit mode is Run
    if (editModeItem.mode === SWIMMING_EVENT) {
      setStroke(editModeItem.stroke);
      setDistance(editModeItem.distance);
      setSplits(editModeItem.splits);
    }
  }, [editModeItem])

  const saveEdits = () => {
    // depending on the edit mode
    setDeviceConfig(prevConfig => {
      const newModeSettings = {
        mode: SWIMMING_EVENT,
        subtitle: SWIMMING_EVENT_SUBTITLE,
        backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${5}, ${132})`,
        distance: distance,
        splits: splits,
      };
      const index = prevConfig.indexOf(editModeItem)
      prevConfig[index] = newModeSettings
      console.log('aiodwja', prevConfig)
      return prevConfig
    })
    setVisible(false);
  }

  const resetState = () => {
    setVisible(false);
  }

  const renderEditModalContent = () => {
    console.log(distances[stroke], stroke);
    return (
      <View style={styles.innerEditContainer}>
        <Dropdown 
          label='Choose a Stroke'
          data={strokes}
          value={stroke}
          containerStyle={{width: '100%', height: 40, marginBottom: 50}}
          onChangeText={(value) => setStroke(value)}
          animationDuration={ANIMATION_DURATION}
        />
        <Text>Choose a distance</Text>
        <Dropdown 
          label='Choose a distance'
          data={distances[stroke]}
          value={distances[stroke][0].value}
          containerStyle={{width: '100%', height: 40, marginBottom: 50}}
          animationDuration={ANIMATION_DURATION}
        />
        <Text>Set your goal splits</Text>
        <View>
          <Text>bunch of inputs here</Text>
        </View>
      </View>
    )
  }
  
  return (
    <Modal
      // the edit mode is not the empty string '' means it should be displayed
      visible={visible}
      onTouchOutside={() => setVisible(false)}
      modalAnimation={new FadeAnimation({
        initialValue: 0,
        animationDuration: ANIMATION_DURATION,
        useNativeDriver: true,
      })}
      modalTitle={
        <ModalTitle
          title={`Edit Run Settings`}
          align="center"
        />
      }
      width={.9}
    >
      <ModalContent>
        <View style={styles.container}>
          {renderEditModalContent()}
          <SaveCancelFooter 
            resetState={resetState}
            saveEdits={saveEdits}
          />
        </View>
      </ModalContent>
    </Modal>
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
  }
})