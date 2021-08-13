import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, } from 'react-native-elements';
import { DEVICE_CONFIG_CONSTANTS, } from '../DeviceConfigConstants';
const {
  POOL_LENGTH_CHOICES,
  SWIMMING_EVENT,
  SWIMMING_EVENT_SUBTITLE,
  BUTTERFLY,
  BACKSTROKE,
  BREASTROKE,
  FREESTYLE,
  IM,
} = DEVICE_CONFIG_CONSTANTS;
import { Dropdown } from 'react-native-material-dropdown';
import { useTheme } from '@react-navigation/native';
import GLOBAL_CONSTANTS from '../../GlobalConstants';
const { METRIC } = GLOBAL_CONSTANTS;
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
Icon.loadFont();
import GenericModal from './GenericModal';
import SplitInputs from './SplitInputs';
import ThemeText from '../../generic/ThemeText';
import { UserDataContext } from '../../../Context';
import PoolLengthList from '../subcomponents/PoolLengthList';
const ANIMATION_DURATION = 150;

const {
  NCAA,
  OLYMPIC,
  BRITISH,
  THIRD_M,
  THIRD_YD,
  HOME
} = POOL_LENGTH_CHOICES;
const POOL_LENGTH_LIST = [
  {
    title: NCAA,
    subtitle: 'Standard NCAA pool length',  
  },
  {
    title: OLYMPIC,
    subtitle: 'Standard Olympic pool length',
  },
  {
    title: BRITISH,
    subtitle: 'Common European pool length',  
  },
];

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
  const userDataContext = React.useContext(UserDataContext);
  const { metricSystem } = userDataContext.settings;
  const { colors } = useTheme();
  const { visible, setVisible, setDeviceConfig, editModeItem } = props;

  const [stroke, setStroke] = React.useState(FREESTYLE);
  const [distance, setDistance] = React.useState(200);
  const [splits, setSplits] = React.useState([30, 30, 30, 30]);
  const [poolLength, setPoolLength] = React.useState(POOL_LENGTH_CHOICES.NCAA);
  const [errorMsgs, setErrorMsgs] = React.useState(splits.map((_, idx) => '')); // array of error messages for each split input

  // editModeItem is always {} initially, but these comps still render.
  // this is to make sure when props change the states get updated to
  // since state w/hooks doesnt update with props change
  React.useEffect(() => {
    // only change state if the edit mode is correct.
    // Otherwise you'll get errors with things being undefined
    if (editModeItem.mode === SWIMMING_EVENT) {
      setStroke(editModeItem.stroke);
      setDistance(editModeItem.distance);
      setSplits([...editModeItem.splits]);
    }
  }, [editModeItem]);

  const saveEdits = () => {
    // check if any of the splits are empty first
    var existsEmptySplit = false;
    errorMsgs.forEach((msg, _) => {
      if (msg.length > 0) {
        Alert.alert('Whoops!', "Make sure all the errors are addressed", [{ text: 'okay' }]);
        return;
      }
    })
    splits.forEach((split, i) => {
      existsEmptySplit = existsEmptySplit || split.length === 0 || parseInt(split) <= 9
      splits[i] = parseInt(splits[i]);
    })
    if (existsEmptySplit) {
      Alert.alert('Whoops!', "Make sure none of the splits you entered are empty and that they're all greater than 9 seconds", [{ text: 'okay' }]);
      return;
    }
    // depending on the edit mode
    setDeviceConfig(prevConfig => {
      const newModeSettings = {
        mode: SWIMMING_EVENT,
        subtitle: SWIMMING_EVENT_SUBTITLE,
        stroke: stroke,
        distance: distance,
        splits: splits,
      };
      const index = prevConfig.indexOf(editModeItem)
      prevConfig[index] = newModeSettings
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
    return (
      <View style={styles.innerEditContainer}>
        <View style={{width: '100%', height: 200, backgroundColor: colors.background}}>
          <ThemeText style={{alignSelf: 'center'}}>Add image here</ThemeText>
        </View>
        <Text style={{margin: 10, color: 'grey'}}>
          Choose a swimming event and enter splits (in seconds) to keep you on pace – this mode will track your pace and let you know
          how far ahead or behind you are from the splits you enter.
        </Text>
        <Text style={styles.textHeader}>Set your pool length</Text>
        <View style={{width: '100%'}}>
          <PoolLengthList
            poolLength={poolLength}
            setPoolLength={setPoolLength}
            choices={POOL_LENGTH_LIST}
          />
        </View>
        <Text style={[styles.textHeader, {marginTop: 20}]}>Pick a Stroke</Text>
        <Dropdown 
          label='Stroke'
          data={strokes}
          value={stroke}
          containerStyle={{width: '95%', height: 40, marginBottom: 50}}
          onChangeText={(value) => {switchStrokes(value)}}
          animationDuration={ANIMATION_DURATION}
        />
        <Text style={styles.textHeader}>Pick a distance</Text>
        <Dropdown 
          label={`Distance in ${metricSystem === METRIC ? 'm' : 'yds'}`}
          data={distances[stroke]}
          value={renderDistance()}
          containerStyle={{width: '95%', height: 40, marginBottom: 50}}
          onChangeText={(value) => {
            // an array of all 30s depending on the distance
            const newDefaultSplits = [...Array(Math.min(8, parseInt(value/50))).keys()].map(_ => '30');
            setErrorMsgs(newDefaultSplits.map(_ => ''));
            setSplits(newDefaultSplits);
            setDistance(value);
          }}
          animationDuration={ANIMATION_DURATION}
        />
        <Text style={styles.textHeader}>Set your goal splits</Text>
        <SplitInputs
          distance={distance}
          setSplits={setSplits}
          splits={splits}
          errorMsgs={errorMsgs}
          setErrorMsgs={setErrorMsgs}
          label={'50'}
        />
      </View>
    )
  }
  
  return (
    <GenericModal
      isVisible={visible}
      setVisible={setVisible}
      titleText='Swimming Event Tracker'
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
  },
  textHeader: {
    fontSize: 20,
    alignSelf: 'flex-start',
    margin: 10,
    marginBottom: 0
  }
})