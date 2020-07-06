import React from 'react'
import { View, StyleSheet } from 'react-native'
import ActionButton from '../../ActionButton'
export default function AcceptRejectButton(props) {
  return (
    <View style={styles.container}>
      <ActionButton
        initialTitle='Accept'
        onPress={props.accept}
      />
      <ActionButton
        initialTitle='Reject'
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