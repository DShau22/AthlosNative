import React from 'react'
import { BleManager } from 'react-native-ble-plx';
import { View, Text, Alert, BackHandler, DeviceEventEmitter, Button } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import ThemeText from '../generic/ThemeText';
import { connect } from 'formik';

import { BLEHandler } from './transmitter';
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

export default function Bluetooth(props) {
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
      LocationServicesDialogBox.stopListener();
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
          bleHandler.current = new BLEHandler(managerRef.current, deviceWithServices);
          bleHandler.current.setUpNotifyListener(); // for now just handle reading
          setConnected(true);
        } catch(e) {
          console.log("error connecting device and discovering services: ", e);
        }
      }
    });
  }
  return (
    <View>
      {connected ? <ThemeText>Found device!</ThemeText> : null}
      <Button title="send sainit" onPress={async () => {
        if (bleHandler.current) {
          await bleHandler.current.sendByteArray(bleHandler.current.sainit);
        }
      }}/>
    </View>
  )
}
