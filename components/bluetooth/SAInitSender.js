import React from 'react'
import { BleManager } from 'react-native-ble-plx';
import { View, Alert, DeviceEventEmitter, Button, TouchableOpacity } from 'react-native';
import { useFocusEffect, useTheme } from '@react-navigation/native';

import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import ThemeText from '../generic/ThemeText';

import { BLEHandler } from './transmitter';
import { Platform } from 'react-native';
const Buffer = require('buffer/').Buffer;
const SERVICE_UUID = 'e49a25f0-f69a-11e8-8eb2-f2801f1b9fd1';
const TX = 'e49a25f1-f69a-11e8-8eb2-f2801f1b9fd1';
const RX = 'e49a28f2-f69a-11e8-8eb2-f2801f1b9fd1';

const SA_INIT = Buffer.from([0xff, 0xff, 0xff, 0xff]);
const MAX_PKG_LEN = 200;
// first three package bytes are pkg type, pkg id, total num pkgs in document,
// and the last 2 are id, checksum. 5 bytes of metadata total
const METADATA_SIZE = 5; 

const calcChecksum = (bytes, start, end) => {
  let res = 0;
  for (let i = start; i < end; i++) {
    res += bytes[i];
  }
  console.log("before anding...", res);
  res = res & 0xff;
  return res;
}

export default function SAInitSender(props) {
  const { colors } = useTheme();
  const { saveAndCreateSaInit } = props;
  const [connected, setConnected] = React.useState(false);
  const managerRef = React.useRef();
  const scanSubscriptionRef = React.useRef();
  const bleHandler = React.useRef();
  // for when screen is focused/unfocused;
  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused...
      if (managerRef.current) {
        scanAndConnect();
      }
      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
        if (managerRef.current) {
          managerRef.current.stopDeviceScan();
        }
      };
    }, [])
  );

  React.useEffect(() => {
    const asyncPrep = async () => {
      console.log("bluetooth using effect");
      DeviceEventEmitter.addListener('locationProviderStatusChange', function(status) { // only trigger when "providerListener" is enabled
        console.log("status: ", status); //  status => {enabled: false, status: "disabled"} or {enabled: true, status: "enabled"}
      });
      if (Platform.OS === "android") {
        LocationServicesDialogBox.checkLocationServicesIsEnabled({
          message: "<font color='#f1eb0a'>Use Location ?</font>",
          ok: "YES",
          cancel: "NO",
          style: { // (optional)
            backgroundColor: '#87a9ea',// (optional)
            
            positiveButtonTextColor: '#ffffff',// (optional)
            positiveButtonBackgroundColor: '#5fba7d',// (optional)
            
            negativeButtonTextColor: '#ffffff',// (optional)
            negativeButtonBackgroundColor: '#ba5f5f'// (optional)
          }
        }).then(function(success) {
            console.log("success: ", success);
        }).catch((error) => {
            console.log(error.message);
        });
      }
      managerRef.current = new BleManager();
      scanSubscriptionRef.current = managerRef.current.onStateChange((state) => {
        console.log("state changed and is now: ", state);
        if (state === 'PoweredOn') {
          console.log("state is powered on!");
          scanAndConnect();
          scanSubscriptionRef.current.remove();
        }
      }, true);
    }
    asyncPrep();
    return () => {
      console.log("unmounting...");
      if (Platform.OS === "android") {
        LocationServicesDialogBox.stopListener();
      }
      if (managerRef.current) {
        managerRef.current.destroy();
      }
      if (scanSubscriptionRef.current) {
        scanSubscriptionRef.current.remove();
      }
    }
  }, []);

  const scanAndConnect = () => {
    console.log("scanning and connecting...");
    managerRef.current.startDeviceScan(null, null, async (error, device) => {
      if (error) {
        // Handle error (scanning will be stopped automatically)
        const errorJson = JSON.parse(JSON.stringify(error));
        console.log("error: ", errorJson);
        if (errorJson.errorCode === 101) {
          console.log("please make sure you enable bluetooth and location");
        }
        return;
      }
      // Check if it is a device you are looking for based on advertisement data
      // or other criteria.
      if (device.name === 'AthlosData') {
        // Stop scanning as it's not necessary if you are scanning for one device.
        managerRef.current.stopDeviceScan();
        console.log("found athlos device! ", device);
        // Proceed with connection.
        try {
          const connectedDevice = await device.connect();
          const deviceWithServices = await connectedDevice.discoverAllServicesAndCharacteristics();
          bleHandler.current = new BLEHandler(managerRef.current, deviceWithServices,);
          bleHandler.current.setUpNotifyListener(); // for now just handle reading
          setConnected(true);
        } catch(e) {
          console.log("error connecting device and discovering services: ", e);
        }
      }
    });
  }
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
        if (!connected) {
          Alert.alert(
            "Whoops",
            Platform.OS === 'ios' ? 
              'Your Athlos earbuds have not yet connected to this device. \
              Make sure you have bluetooth enabled for this device and that your Athlos earbuds are scanning for devices'
              : 'Your Athlos earbuds have not yet connected to this device. \
              Make sure you have bluetooth enabled for this device and that your Athlos earbuds are scanning for devices. \
              Please also make sure to enable location services for this app.',
            [{text: 'okay'}]
          );
          return;
        }
        if (bleHandler.current) {
          const sainitBytes = await saveAndCreateSaInit();
          bleHandler.current.addSainit(sainitBytes);
          console.log("Sending byte array!");
          await bleHandler.current.sendByteArray(bleHandler.current.sainit);
        }
      }}
    >
      { connected ? 
        <ThemeText>
          Save and update device
        </ThemeText> : 
        <ThemeText>
          Device not connected
        </ThemeText>
      }
    </TouchableOpacity>
  )
}
