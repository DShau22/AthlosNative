import React from 'react';
import GlobalBleHandler from '../bluetooth/GlobalBleHandler';
import { View, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import ThemeText from '../generic/ThemeText';
import BLUETOOTH_CONSTANTS from '../bluetooth/BluetoothConstants';
const { DISCONNECT_ERR } = BLUETOOTH_CONSTANTS;

export default function SAInitSender(props) {
  const { colors } = useTheme();
  const { saveAndCreateSaInit, containerStyle, setIsLoading } = props;
  // const [transmitting, setTransmitting] = React.useState(false);
  // React.useEffect(() => {
  //   if (transmitting) {
  //     transmitting.current = setTimeout(() => {
  //       Alert.alert(
  //         "Timeout",
  //         "Transmitting timed out. Please try again.",
  //         [{text: 'Okay'}]
  //       )
  //     }, 8000);
  //   } else {
  //     if (transmitting.current) {
  //       clearTimeout(transmitting.current);
  //       transmitting.current = null;
  //     }
  //   }
  // }, [transmitting]);
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
          const connected = await GlobalBleHandler.isConnected();
          if (!connected) {
            Alert.alert(
              "Whoops",
              Platform.OS === 'ios' ? 
                `Your Athlos earbuds are not connected to this device. `+
                `Make sure you have bluetooth enabled for this device and that your Athlos earbuds are connected with bluetooth.` +
                ` If the issue still persists, then sync first and try again.`
                : `Your Athlos earbuds have not yet connected to this device. `+
                `Make sure you have bluetooth enabled for this device and that your `+
                `Athlos earbuds are scanning for devices. Please also make sure to enable location services for this app.` +
                ` If the issue still persists, then sync first and try again.`,
              [{text: 'Okay'}]
            );
            return;
          }
          const sainitBytes = await saveAndCreateSaInit();
          // console.log("Sending byte array!");
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
