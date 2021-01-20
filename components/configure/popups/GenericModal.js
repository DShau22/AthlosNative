import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native'
import Modal from 'react-native-modal';
import SaveCancelFooter from './SaveCancelFooter'

export default function GenericModal(props) {
  const { colors } = useTheme();
  const { isVisible, setVisible, titleText, height, resetState, saveEdits, subtitle } = props;
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
        <View style={[styles.title, {backgroundColor: colors.background}]}>
          <Text style={[styles.titleText, {
            color: colors.textColor,
            fontSize: 50,
          }]}>{titleText}</Text>
          { subtitle ? <Text style={{
            color: colors.textColor,
            fontSize: 25,
            marginTop: 20,
          }}>{subtitle}</Text> : null}
        </View>
        <ScrollView style={[styles.scrollView]}>
          {/* below is so that for ios, the bounce will not show the white background */}
          {Platform.OS === 'ios' && (
            <View 
              style={{
                backgroundColor: colors.background,
                height: 1000,
                position: 'absolute',
                top: -1000,
                left: 0,
                right: 0,
              }} 
            />
          )}
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    // backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50%',
    // borderBottomColor: '#c7c7c7',
    // borderBottomWidth: 1
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 24
  },
  modalContent: {
    borderRadius: 16,
    backgroundColor: 'white'
  },
  scrollView: {
    width: '100%',
    height: '100%',
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16,
  },
})