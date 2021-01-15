import React from 'react';
import { View, StyleSheet, Alert, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
  MODE_CONFIG
} = DEVICE_CONFIG_CONSTANTS;
import { useTheme } from '@react-navigation/native';
import GLOBAL_CONSTANTS from '../../GlobalConstants';
const { METRIC } = GLOBAL_CONSTANTS;
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
Icon.loadFont();
import SplitInputs from '../popups/SplitInputs';
import ThemeText from '../../generic/ThemeText';
import { UserDataContext } from '../../../Context';
import PoolLengthList from '../popups/PoolLengthList';
import SaveButton from './SaveButton';
import Spinner from 'react-native-loading-spinner-overlay';
import { ListItem } from 'react-native-elements';
import PullUpMenu from './PullUpMenu';
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
const distances = {
  [BUTTERFLY]: [
    {label: '50', value: '50'},
    {label: '100', value: '100'},
    {label: '200', value: '200'}
  ],
  [BACKSTROKE]: [
    {label: '50', value: '50'},
    {label: '100', value: '100'},
    {label: '200', value: '200'}
  ],
  [BREASTROKE]: [
    {label: '50', value: '50'},
    {label: '100', value: '100'},
    {label: '200', value: '200'}
  ],
  [FREESTYLE]: [
    {label: '50', value: '50'},
    {label: '100', value: '100'},
    {label: '200', value: '200'},
    {label: '400', value: '400'},
    {label: '500', value: '500'},
    {label: '800', value: '800'},
    {label: '1000', value: '1000'},
    {label: '1650', value: '1650'},
  ],
  [IM]: [
    {label: '100', value: '100'},
    {label: '200', value: '200'},
    {label: '400', value: '400'},
  ]
};
ANIMATION_DURATION = 150;

export default function SwimmingEventEditScreen(props) {
  const { colors } = useTheme();
  const { navigation, deviceConfig, setDeviceConfig } = props;
  const { editIdx } = props.route.params; // index of the object in deviceConfig array we are editing
  const eventSettings = deviceConfig[editIdx];
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [stroke, setStroke] = React.useState(eventSettings.stroke);
  const [distance, setDistance] = React.useState(eventSettings.distance);
  const [splits, setSplits] = React.useState(eventSettings.splits);
  const [poolLength, setPoolLength] = React.useState(eventSettings.poolLength);
  const [errorMsgs, setErrorMsgs] = React.useState(splits.map((_, idx) => '')); // array of error messages for each split input
  const firstUpdate = React.useRef(true);
  const refRBSheetStroke = React.useRef();
  const refRBSheetDistance = React.useRef();

  React.useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    setIsLoading(false);
    Alert.alert('Done!', `Successfully saved settings for tracking the ${distance} ${stroke}`, [{text: 'Okay'}]);
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
      prevConfig[editIdx] = newModeSettings;
      return [...prevConfig];
    })
  }

  const resetState = () => {
    setIsLoading(false);
    setStroke(eventSettings.stroke);
    setDistance(eventSettings.distance);
    setSplits(eventSettings.splits);
    setPoolLength(eventSettings.poolLength);
    setErrorMsgs(eventSettings.splits.map((_) => ''))
  }

  const renderDistance = () => {
    // if the selected stroke from the dropdown is NOT
    // the same as the state stroke, render the lowest distance
    if (Object.keys(eventSettings).length > 0 && eventSettings.stroke !== stroke) {
      return `${distances[stroke][0].value}`;
    }
    // if the ARE EQUAL, then show the distance
    return `${distance}`;
  }

  const switchStrokes = (newStroke) => {
    // if the value stroke is different from the state stroke, update the splits too
    if (newStroke !== stroke) {
      const newDefaultDistance = distances[newStroke][0].value;
      // if the new stroke is the same as what is already set, then return the already set distance
      const newDistance = newStroke === eventSettings.stroke ? eventSettings.distance : newDefaultDistance;
      setDistance(newDistance);
      const newDefaultSplits = [...Array(Math.min(8, newDistance/50)).keys()].map(_ => 30);
      setSplits(newDefaultSplits);
      setStroke(newStroke);
    }
    // else the user just tapped the same stroke so nothing should happen
  }

  return (
    <ScrollView style={styles.container}>
      <Spinner
        visible={isLoading}
        textContent='Saving...'
        textStyle={{color: colors.textColor}}
      />
      <ThemeText style={{fontSize: 20, fontWeight: 'bold', alignSelf: 'flex-start', margin: 10}}>
        Track an event:
      </ThemeText>
      <ThemeText style={{margin: 10}}>
        Choose a swimming event and enter splits (in seconds) to keep you on pace – this mode will track your pace and let you know
        how far ahead or behind you are from the splits you enter.
      </ThemeText>
      <ThemeText style={[styles.textHeader]}>Set your pool length</ThemeText>
      <View style={{width: '100%'}}>
        <PoolLengthList
          containerStyle={{backgroundColor: colors.background}}
          poolLength={poolLength}
          setPoolLength={setPoolLength}
          choices={POOL_LENGTH_LIST}
        />
      </View>
      <ThemeText style={[styles.textHeader, {marginTop: 20, marginBottom: 20}]}>Pick a Stroke</ThemeText>
      <ListItem
        containerStyle={[styles.menuOpener, {backgroundColor: colors.background}]}
        bottomDivider
        topDivider
        onPress={() => refRBSheetStroke.current.open()}
      >
        <ListItem.Content>
          <ListItem.Title>
            <ThemeText>{stroke}</ThemeText>
          </ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron name='chevron-forward'/>
      </ListItem>
      <PullUpMenu
        refRBSheet={refRBSheetStroke}
        childArray={strokes}
        selected={stroke}
        onItemPress={switchStrokes}
      />
      <ThemeText style={[styles.textHeader, {marginTop: 20, marginBottom: 20}]}>Pick a distance</ThemeText>

      <ListItem
        containerStyle={[styles.menuOpener, {backgroundColor: colors.background}]}
        bottomDivider
        topDivider
        onPress={() => {
          refRBSheetDistance.current.open();
        }}
      >
        <ListItem.Content>
          <ListItem.Title>
            <ThemeText>{renderDistance()}</ThemeText>
          </ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron name='chevron-forward'/>
      </ListItem>
      <PullUpMenu
        refRBSheet={refRBSheetDistance}
        childArray={distances[stroke]}
        selected={renderDistance()}
        onItemPress={(value) => {
          // an array of all 30s depending on the distance
          value = parseInt(value);
          const newDefaultSplits = [...Array(Math.min(8, parseInt(value/50))).keys()].map(_ => '30');
          setErrorMsgs(newDefaultSplits.map(_ => ''));
          setSplits(newDefaultSplits);
          setDistance(value);
        }}
      />
      <ThemeText style={[styles.textHeader, {marginTop: 20}]}>Set your goal splits</ThemeText>
      <SplitInputs
        distance={distance}
        setSplits={setSplits}
        splits={splits}
        errorMsgs={errorMsgs}
        setErrorMsgs={setErrorMsgs}
        label={'50'}
      />
      <SaveButton
        containerStyle={{
          margin: 20,
          alignSelf: 'center'
        }}
        onPress={saveEdits}
      />
    </ScrollView>
  )
}
const styles = StyleSheet.create({
  container: {
    // alignItems: 'center',
    // justifyContent: 'center',
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
  },
  dropDownContainer: {
    width: '95%',
    height: 40,
    marginBottom: 50,
    backgroundColor: 'white'
  },
  menuOpener: {

  }
})