import React from 'react'
import { View, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native'
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
} = DEVICE_CONFIG_CONSTANTS;
import * as Yup from 'yup';
import { Dropdown } from 'react-native-material-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
Icon.loadFont();
import {splitValidationSchema} from './validationSchema';
import { useTheme } from '@react-navigation/native';

NUM_TO_WORD = ['First', 'Second', 'Third', 'Fouth', 'Fifth', 'Sixth', 'Seventh', 'Eigth'];

// renders splits based on what the event distance is
// 1 input for 50
// 2 inputs for 100
// 4 inputs for 200
// 8 inputs for 400 and above
export default function SplitInputs(props) {
  const { colors } = useTheme();
  const { distance, setSplits, splits, errorMsgs, setErrorMsgs } = props;
  // sets the nth split (so the nth 50)
  const setSpecificSplit = (idx, newTime) => {
    setSplits(prev => {
      prev[idx] = newTime;
      return [...prev];
    })
  }

  const handleInputChange = (textNumber, idx) => {
    console.log(splits);
    textNumber = textNumber.replace(/\D/g,'');
    const validationString = textNumber.length > 0 ? textNumber : '0'
    Yup.reach(splitValidationSchema, "split").validate(parseInt(validationString))
      .then(function(isValid) {
        setSpecificSplit(idx, textNumber);
        setErrorMsgs(prev => {
          prev[idx] = '';
          return [...prev];
        })
      })
      .catch(function(e) {
        console.log(e);
        setSpecificSplit(idx, '');
        setErrorMsgs(prev => {
          prev[idx] = e.toString();
          return [...prev];
        })
      });
  }

  const splitInput = (num) => {
    return (
      <View style={{flexDirection: 'row'}}>
        <Input
          leftIcon={
            <Icon
              name='timer'
              size={24}
              color={colors.background}
            />
          }
          style={styles.splitsInput}
          label={`${NUM_TO_WORD[num]} 50${distance > 400 && num === 7 ? ' (repeats until finished)' : ''}`}
          placeholderTextColor="#666666"
          keyboardType='numeric'
          maxLength={3}
          value={`${splits[num]}`}
          onChangeText={val => handleInputChange(val, num)}

          errorMessage={errorMsgs[num]}
          renderErrorMessage={errorMsgs[num].length > 0}
        />
      </View>
    )
  }

  return (
    <View style={styles.splitsContainer}>
      {splitInput(0)}
      {splitInput(1)}
      {splitInput(2)}
      {splitInput(3)}
      {/* { distance === 50 ? 
        <View style={styles.splitsRow}>
          <View style={{flexDirection: 'row'}}>
            <Icon
              name={`numeric-1`}
              size={24}
              color='black'
            />
            <TextInput 
              {...SharedSplitInputProps}
              onChangeText={setSplits}
            />
          </View>
        </View> : null
      } */}

      
      {/* { distance >= 100 ? splitInputRow(1) : null }
      { distance >= 200 ? splitInputRow(2) : null }
      { distance >= 400 ? splitInputRow(3) : null }
      { distance >= 400 ? splitInputRow(4) : null }
      { distance >  400 ? <Text style={{position: 'absolute', right: 50, bottom: -25}}>Repeats until finish</Text> : null } */}
    </View>
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
  splitInputContainer: {
    flexDirection: 'row'
  }, 
  splitsInput: {
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#05375a',
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
  style: styles.splitsInput,
  placeholderTextColor: "#666666",
  keyboardType: 'numeric',
}