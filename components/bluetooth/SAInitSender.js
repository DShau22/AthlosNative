import React from 'react';
import GlobalBleHandler from '../bluetooth/GlobalBleHandler';
import { View, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import ThemeText from '../generic/ThemeText';

export default function SAInitSender(props) {
  const { colors } = useTheme();
  const { saveAndCreateSaInit } = props;
  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.backgroundOffset,
        width: 300,
        height: 50,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: colors.header,
        borderWidth: 1
      }}
      onPress={async () => {
        if (GlobalBleHandler.isReading) {
          Alert.alert(
            "Whoops",
            "Your earbuds are busy updating your fitness records. Hang tight and try again later",
            [{text: 'Okay'}]
          );
          return;
        }
        const connected = await GlobalBleHandler.isConnected();
        if (!connected) {
          Alert.alert(
            "Whoops",
            Platform.OS === 'ios' ? 
              `Your Athlos earbuds are not connected to this device. `+
              `Make sure you have bluetooth enabled for this device and that your Athlos earbuds are scanning for devices.`
              : `Your Athlos earbuds have not yet connected to this device. `+
              `Make sure you have bluetooth enabled for this device and that your `+
              `Athlos earbuds are scanning for devices. Please also make sure to enable location services for this app.`,
            [{text: 'Okay'}]
          );
          return;
        }
        const sainitBytes = await saveAndCreateSaInit();
        console.log("Sending byte array!");
        await GlobalBleHandler.sendByteArray(sainitBytes);
      }}
    >
      <ThemeText>
        Save and update device
      </ThemeText>
    </TouchableOpacity>
  )
}
