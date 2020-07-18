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
} = DEVICE_CONFIG_CONSTANTS
import { Dropdown } from 'react-native-material-dropdown';

import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
Icon.loadFont()
// popup stuff
import Modal, {
  ModalContent,
  ModalTitle,
  FadeAnimation,
} from 'react-native-modals';
import ValidatedTextInput from '../../generic/ValidatedTextInput'
import SaveCancelFooter from './SaveCancelFooter'

// renders splits based on what the event distance is
// 1 input for 50
// 2 inputs for 100
// 4 inputs for 200
// 8 inputs for 400 and above
export default function SplitInputs(props) {
  const { distance, setSplits, splits } = props;
  const [textEditable, setTextEditable] = React.useState(true);
  // sets the nth split (so the nth 50)
  const setSpecificSplit = (n, newTime) => {
    setSplits(prev => {
      prev[n - 1] = newTime;
      return [...prev];
    })
  }

  const handleInputChange = (textNumber, firstSplitNumber) => {
    const isThreeDigitInteger = new RegExp('^[0-9]{0,3}$');
    if (isThreeDigitInteger.test(textNumber)) {
      setSpecificSplit(firstSplitNumber, textNumber)
    } else {
      // set editable to false to prevent flicker
    }
  }
  
  // smol component for text input with side label
  // split row is NOT 0 INDEXED IT STARTS AT 1
  const splitInputRow = (splitRow) => {
    // the split number of the first element in this row STARTING WITH 1
    const firstSplitNumber = 2 * splitRow - 1
    const isThreeDigitInteger = new RegExp('^[0-9]+$');
    console.log("splits from split inputs: ", splits)
    return (
      <View style={styles.splitsRow}>
        <View style={{flexDirection: 'row'}}>
          <Icon
            name={`numeric-${firstSplitNumber}`}
            size={24}
            color='black'
          />
          {/* <ValidatedTextInput
            {...SharedSplitInputProps}
            validationRegex={isThreeDigitInteger}
            value={`${splits[firstSplitNumber - 1]}`}
            onChange={val => handleInputChange(val, firstSplitNumber)}
          /> */}
          <TextInput 
            {...SharedSplitInputProps}
            maxLength={3}
            editable={textEditable}
            value={`${splits[firstSplitNumber - 1]}`}
            onChangeText={val => handleInputChange(val, firstSplitNumber)}
          />
        </View>
        <View style={{flexDirection: 'row'}}>
          <Icon
            name={`numeric-${firstSplitNumber + 1}`}
            size={24}
            color='black'
          />
          <TextInput 
            {...SharedSplitInputProps}
            maxLength={3}
            editable={textEditable}
            value={`${splits[firstSplitNumber]}`}
            borderColor={distance > 400 && splitRow === 4 ? 'red' : 'black'}
            onChangeText={val => handleInputChange(val, firstSplitNumber + 1)}
          />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.splitsContainer}>
      { distance === 50 ? 
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
      }
      { distance >= 100 ? splitInputRow(1) : null }
      { distance >= 200 ? splitInputRow(2) : null }
      { distance >= 400 ? splitInputRow(3) : null }
      { distance >= 400 ? splitInputRow(4) : null }
      { distance >  400 ? <Text style={{position: 'absolute', right: 50, bottom: -25}}>Repeats until finish</Text> : null }
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
  style: styles.splitsInput,
  placeholderTextColor: "#666666",
  keyboardType: 'numeric',
}