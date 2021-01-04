import React from 'react'
import { BleManager } from 'react-native-ble-plx';
import { View, Text, Alert, BackHandler, DeviceEventEmitter } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import ThemeText from '../generic/ThemeText';
import { connect } from 'formik';

const Buffer = require('buffer/').Buffer;
const SERVICE_UUID = 'e49a25f0-f69a-11e8-8eb2-f2801f1b9fd1';
const TX = 'e49a25f1-f69a-11e8-8eb2-f2801f1b9fd1';
const RX = 'e49a28f2-f69a-11e8-8eb2-f2801f1b9fd1';


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
  const [athlosDevice, setAthlosDevice] = React.useState(null); // controlled with state cuz this should change the UI
  const notifyListenerRef = React.useRef();
  const managerRef = React.useRef();
  const scanSubscriptionRef = React.useRef();
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
        // if (notifyListenerRef.current) {
        //   notifyListenerRef.current.remove();
        // }
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
          console.log("after getting services", deviceWithServices);
          var characteristic = await device.readCharacteristicForService(SERVICE_UUID, RX);
          characteristic.monitor(async (err, c) => {
            console.log("MONITOR CALLBACK");
            characteristic.isNotifying = true;
            console.log("new value: ", c.value);
            var readValueInRawBytes = Buffer.from(c.value, 'base64');
            const len = readValueInRawBytes.length;
            console.log("num bytes: ", len);
            const checkSum = calcChecksum(readValueInRawBytes, 0, len - 1);
            console.log("checksum is: ", checkSum);
            console.log("below is all the stuff in base 64");
            console.log('checkSum: ', readValueInRawBytes[len - 1]);
            console.log('package id: ', readValueInRawBytes[len - 2]);
            console.log('first byte: ', readValueInRawBytes[0]);
            console.log('second byte: ', readValueInRawBytes[1]);

            var resPackage = Buffer.from([readValueInRawBytes[len - 2], checkSum]).toString('base64');
            console.log('response: ', resPackage);
            const writeChar = await device.writeCharacteristicWithoutResponseForService(SERVICE_UUID, TX, resPackage);
            characteristic.isNotifying = false;
          });
          // var readValueInBase64 = characteristic.value
          // var readValueInRawBytes = Buffer.from(readValueInBase64, 'base64');
          // console.log("characteristic uuid: ", characteristic.uuid);
          // console.log("service uuid: ", characteristic.serviceUUID);
          // console.log("plain read value: ", readValueInBase64);
          // console.log("value in Raw Bytes: ", readValueInRawBytes);
          // console.log("num bytes: ", readValueInRawBytes.length);

          // const resPackage = Buffer.from([readValueInRawBytes[1], readValueInRawBytes[0]]).toString('base64');
          // const writeChar = await device.writeCharacteristicWithoutResponseForService(SERVICE_UUID, TX, resPackage);
          // console.log("AFTER WRITE WITHOUT RESPONSE");
          // console.log("characteristic uuid: ", writeChar.uuid);
          // console.log("service uuid: ", writeChar.serviceUUID);
          // console.log("value: ", writeChar.value);

          // characteristic = await device.readCharacteristicForService(SERVICE_UUID, RX);
          // readValueInBase64 = characteristic.value
          // readValueInRawBytes = Buffer.from(readValueInBase64, 'base64');
          // console.log("characteristic uuid: ", characteristic.uuid);
          // console.log("service uuid: ", characteristic.serviceUUID);
          // console.log("plain read value: ", readValueInBase64);
          // console.log("value in Raw Bytes: ", readValueInRawBytes);
          // console.log("num bytes: ", readValueInRawBytes.length);



          // const services = await deviceWithServices.services();
          // console.log("services: ", services);
          // services.forEach(async (service, idx) => {
          //   const characteristics = await service.characteristics();
          //   characteristics.forEach((characteristic) => {
          //     console.log("characteristic uuid: ", characteristic.uuid);
          //     console.log("service uuid: ", characteristic.serviceUUID);
          //     console.log("readable: ", characteristic.isReadable);
          //     console.log("writeable with response: ", characteristic.isWritableWithResponse);
          //     console.log("writeable without response: ", characteristic.isWritableWithoutResponse);
          //   });
          // });
        } catch(e) {
          console.log("something went wrong with trying to connect athlos: ", e);
        }

          // .then((device) => {
          //   return device.discoverAllServicesAndCharacteristics();
          // })
          // .then((device) => {
          //   // Do work on device with services and characteristics
          //   const services = await device.services();
          //   console.log("services: ", services);
          //   setAthlosDevice(device);
          // })
          // .catch((error) => {
          //     // Handle errors
          // });
      }
    });
  }
  return (
    <View>
      {athlosDevice ? <ThemeText>Found device!</ThemeText> : null}
    </View>
  )
}
