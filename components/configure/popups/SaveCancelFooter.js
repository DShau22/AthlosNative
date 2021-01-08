import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-elements'
import LoginButton from '../../nativeLogin/LoginButton';

export default function SaveCancelFooter(props) {
  const { resetState, saveEdits } = props;
  return (
    <View style={styles.saveCancelContainer}>
      <LoginButton
        containerStyle={[styles.buttonContainer, {marginRight: 20}]}
        style={[styles.button, {
          borderColor: '#009387',
          borderWidth: 1,
        }]}
        buttonTextStyle={[styles.buttonTextStyle, {color: '#009387'}]}
        filled={false}
        text='Cancel'
        onPress={resetState}
        icon={null}
      />
      <LoginButton
        containerStyle={[styles.buttonContainer]}
        style={styles.button}
        buttonTextStyle={styles.buttonTextStyle}
        filled={true}
        text='Save'
        onPress={saveEdits}
        icon={null}
      />
    </View>
  )
}
const styles = StyleSheet.create({
  saveCancelContainer: {
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  buttonContainer: {
    width: '30%',
    // height: 50,
    justifyContent: 'center',
    borderRadius: 10
  },
  button: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10
  },
  buttonTextStyle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  saveButton: {
    width: 80,
    marginLeft: 15
  },
  cancelButton: {
    width: 80
  }
})
