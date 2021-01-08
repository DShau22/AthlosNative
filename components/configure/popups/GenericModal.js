import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native'
import Modal from 'react-native-modal';
import SaveCancelFooter from './SaveCancelFooter'

export default function GenericModal(props) {
  const { isVisible, setVisible, titleText, height, resetState, saveEdits } = props;
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => setVisible(false)}
      animationIn='slideInUp'
      animationOut='slideOutDown'
      supportedOrientations={['portrait', 'landscape']}
      propagateSwipe
    >
      <View style={[styles.modalContent, {height: height ? height : '80%'}]}>
        <View style={styles.title}>
          <Text style={styles.titleText}>{titleText}</Text>
        </View>
        <ScrollView style={styles.scrollView}>
          {props.children}
        </ScrollView>
        {saveEdits ?
          <SaveCancelFooter 
          resetState={resetState}
          saveEdits={saveEdits}
          /> : null}
      </View>
    </Modal>
  )
}
const styles = StyleSheet.create({
  title: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderBottomColor: '#c7c7c7',
    borderBottomWidth: 1
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 24
  },
  modalContent: {
    borderRadius: 8,
    backgroundColor: 'white'
  },
  scrollView: {
    width: '100%',
    height: '100%',
  },
})