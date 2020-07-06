import React from 'react'
import { View, StyleSheet } from 'react-native'
import ActionButton from '../../ActionButton'
export default function AcceptRejectButton(props) {
  return (
    <View style={styles.container}>
      <ActionButton
        title='Accept'
        afterPressTitle='Accepted'
        onPress={props.accept}
      />
      <ActionButton
        title='Reject'
        afterPressTitle='Rejected'
        onPress={props.reject}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row'
  }
})