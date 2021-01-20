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
            Welcome to your Athlos Live fitness tracker! Here, you can view statistics tracked from your workouts,
            configure you Athlos earbuds, and explore our various features. 
            Start by syncing your Athlos earbuds by going to the Sync
            tab on the bottom right hand corner. If you have any questions, concerns, bug reports, 
            or feedback feel free to email athlos-team@athloslive.com.
          </Text>
          <TouchableOpacity
            onPress={() => setVisible(false)}
            style={{
              backgroundColor: colors.backgroundOffset,
              width: 70,
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