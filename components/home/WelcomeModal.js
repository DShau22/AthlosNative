import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import GenericModal from '../configure/popups/GenericModal';
import ThemeText from '../generic/ThemeText';
export default function WelcomeModal(props) {
  const { colors } = useTheme();
  const { isVisible, setVisible } = props;
  return (
    <View>
      <GenericModal
        isVisible={isVisible}
        setVisible={setVisible}
        height={'80%'}
        titleText={`👋`}
        subtitle='Welcome!'
      >
        <View style={{
          width: '100%',
          padding: 20,
          flexDirection: 'column'
        }}>
          <Text style={{color: 'grey'}}>
            Welcome to your Athlos Live fitness tracker! Here, you can view your workout statistics,
            configure your Athlos earbuds, and explore various other features. 
            Start by linking your Athlos earbuds to this account by going to the sync tab on the bottom.
          </Text>
          <TouchableOpacity
            onPress={() => setVisible(false)}
            style={{
              backgroundColor: colors.backgroundOffset,
              width: 70,
              marginTop: 20,
              height: 40,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              borderColor: colors.header,
              borderWidth: 1,
              alignSelf: 'flex-end'
            }}
          >
            <ThemeText>Okay</ThemeText>
          </TouchableOpacity>
        </View>
      </GenericModal>
    </View>
  )
}

const styles = StyleSheet.create({

});