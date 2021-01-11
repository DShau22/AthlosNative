import { useTheme } from '@react-navigation/native';
import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import LinearGradient from 'react-native-linear-gradient';
import ThemeText from '../../generic/ThemeText';

export default function SaveCancelFooter(props) {
  const { colors } = useTheme();
  const { resetState, saveEdits } = props;
  return (
    <View style={styles.saveCancelContainer}>
      <View style={[styles.buttonContainer, {marginRight: 20}]}>
        <TouchableOpacity onPress={resetState}>
          <View style={[styles.button, {
            borderColor: colors.header,
            borderWidth: 1,
          }]}>
            <ThemeText style={[styles.buttonTextStyle, {color: colors.background}]}>Cancel</ThemeText>
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.buttonContainer]}>
        <TouchableOpacity onPress={saveEdits}>
          <LinearGradient
            colors={[colors.backgroundOffset, colors.background]}
            style={styles.button}
          >
            <ThemeText style={[styles.buttonTextStyle]}>Save</ThemeText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
