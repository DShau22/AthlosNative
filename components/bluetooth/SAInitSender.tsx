import React from 'react';
import GlobalBleHandler from './GlobalBleHandler';
import { View, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import ThemeText from '../generic/ThemeText';
import BLUETOOTH_CONSTANTS from './BluetoothConstants';
const { DISCONNECT_ERR } = BLUETOOTH_CONSTANTS;

export default function SAInitSender(props) {
  const { colors } = useTheme();
  const { saveAndCreateSaInit, containerStyle, setIsLoading } = props;

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.backgroundOffset,
        width: 220,
        height: 50,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: colors.header,
        borderWidth: 1,
        ...containerStyle
      }}
      onPress={async () => {
        setIsLoading(true);
        if (GlobalBleHandler.isReading) {
          setIsLoading(false);
          Alert.alert(
            "Whoops",
            "Your earbuds are busy syncing. Hang tight and try again later",
            [{text: 'Okay'}]
          );
          return;
        }
        try {
          if (!GlobalBleHandler.isConnected) {
            Alert.alert(
              "Whoops",
              Platform.OS === 'ios' ? 
                `Your Athlos earbuds are not connected to this device. `+
                `Make sure you have bluetooth enabled for this device and ` +
                `that your Athlos earbuds are connected with bluetooth.`
                : `Your Athlos earbuds have not yet connected to this device. `+
                `Make sure you have bluetooth enabled for this device and that your `+
                `Athlos earbuds are scanning for devices. Please also make sure ` +
                `to enable location services for this app.`,
              [{text: 'Okay'}]
            );
            return;
          }
          const sainitBytes = await saveAndCreateSaInit();
          await GlobalBleHandler.sendByteArray(sainitBytes);
          Alert.alert(
            "All done!",
            "Your Athlos device has been updated!",
            [{text: 'Okay'}]
          );
        } catch(e) {
          console.log("error sending sainit: ", e);
          if (e === DISCONNECT_ERR) {
            Alert.alert(
              "Whoops",
              "Your earbuds have disconnected in the middle of updating. Please resync and try again.",
              [{text: 'Okay'}]
            );
          } else {
            Alert.alert(
              "Oh no :(",
              `There was an issue updating your Athlos device: ${e}`,
              [{text: 'Okay'}]
            );
          }
        } finally {
          setIsLoading(false);
          GlobalBleHandler.stopSendBytes();
        }
      }}
    >
      <ThemeText>
        Save and update device
      </ThemeText>
    </TouchableOpacity>
  )
}
