import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-elements'
import LinearGradient from 'react-native-linear-gradient';
export default function SaveCancelFooter(props) {
  const { resetState, saveEdits } = props;
  return (
    <View style={styles.saveCancelContainer}>
      <Button
        style={styles.cancelButton}
        title='Cancel'
        type='outline'
        onPress={resetState}
      />
      <Button
        style={styles.saveButton}
        title='Save'
        onPress={saveEdits}
      />
    </View>
  )
}
const styles = StyleSheet.create({
  container: {

  },
  saveCancelContainer: {
    marginTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  saveButton: {
    width: 80,
    marginLeft: 15
  },
  cancelButton: {
    width: 80
  }
})
