import React from 'react'
import { View, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native'
import { Text, Button, Input, CheckBox } from 'react-native-elements'
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
Icon.loadFont();
import {splitValidationSchema} from './validationSchema';
import { useTheme } from '@react-navigation/native';
import ThemeText from '../../generic/ThemeText';

NUM_TO_WORD = ['First', 'Second', 'Third', 'Fouth', 'Fifth', 'Sixth', 'Seventh', 'Eigth'];

// renders splits based on what the event distance is
// 1 input for 50
// 2 inputs for 100
// 4 inputs for 200
// 8 inputs for 400 and above
export default function SplitInputs(props) {
  const { colors } = useTheme();
  const { distance, setSplits, splits, errorMsgs, setErrorMsgs, label } = props;
  // sets the nth split (so the nth 50)
  const setSpecificSplit = (idx, newTime) => {
    setSplits(prev => {
      prev[idx] = newTime;
      return [...prev];
    })
  }

  const handleInputChange = (textNumber, idx) => {
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
      <View style={styles.container}>
        <Input
          leftIcon={
            <Icon
              name='timer'
              size={24}
              color={colors.textColor}
            />
          }
          style={[styles.splitsInput, {color: colors.textColor}]}
          containerStyle={{width: '100%'}}
          label={`${NUM_TO_WORD[num]} ${label}${distance > 400 && num === 7 ? ' (repeats until finished)' : ''}`}
          placeholderTextColor={colors.textColor}
          keyboardType='numeric'
          maxLength={3}
          value={`${splits[num]}`}
          onChangeText={val => handleInputChange(val, num)}
          errorMessage={errorMsgs[num]}
          renderErrorMessage={errorMsgs[num] !== undefined && errorMsgs[num].length > 0}
        />
      </View>
    )
  }

  const renderSplitInputs = () => {
    res = [];
    for (let i = 0; i < Math.min(8, parseInt(distance / 50)); i++) {
      res.push(splitInput(i));
    }
    return res;
  }

  return (
    <View style={styles.splitsContainer}>
      {renderSplitInputs()}
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  splitsContainer: {
    width: '100%',
    marginTop: 25,
    marginLeft: 2,
    marginRight: 2,
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
  },
  splitsRow: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center'
  },
  innerEditContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})

const SharedSplitInputProps = {
  style: styles.splitsInput,
  placeholderTextColor: "#666666",
  keyboardType: 'numeric',
}