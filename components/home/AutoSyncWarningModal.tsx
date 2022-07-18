import React from 'react';
import { useTheme } from '@react-navigation/native';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import GenericModal from '../configure/popups/GenericModal';
import ThemeText from '../generic/ThemeText';

interface AutoSyncWarningModalProps {
  isVisible: boolean,
  setVisible: Function,
  setOnCheck: Function,
  continueSync: Function,
};

const AutoSyncWarningModal: React.FC<AutoSyncWarningModalProps> = (props) => {
  const { colors } = useTheme();
  const { isVisible, setVisible, continueSync } = props;
  return (
    <View>
      <GenericModal
        isVisible={isVisible}
        setVisible={setVisible}
        height={'75%'}
        titleText={`Hold Up!`}
        subtitle='Preparing to sync.'
      >
        <View style={{
          width: '100%',
          padding: 20,
          flexDirection: 'column'
        }}>
          <Text style={{color: 'grey'}}>
            Make sure your earbuds are NOT in a smart mode AND that you have turned off your earbuds
             since they were last in a smart mode. Not doing so can result in inconsistencies and unwanted behavior.
             If this happens, reset your device configs by heading to the config tab and hitting
             the "save and update device" button.
          </Text>
          <View style={{
            alignSelf: 'center',
            width: '100%',
            margin: 15,
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}>
            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={{
                backgroundColor: colors.backgroundOffset,
                width: '45%',
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
              <ThemeText>Cancel Sync</ThemeText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => continueSync(false)}
              style={{
                backgroundColor: colors.backgroundOffset,
                width: '45%',
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
              <ThemeText>Continue Sync</ThemeText>
            </TouchableOpacity>
          </View>
        </View>
      </GenericModal>
    </View>
  );
}

const styles = StyleSheet.create({
  
});
export default AutoSyncWarningModal;