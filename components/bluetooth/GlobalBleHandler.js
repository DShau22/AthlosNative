import React from 'react';
import { BleManager } from 'react-native-ble-plx';
import { BLEHandler } from './transmitter';
console.log('running global ble');
const GlobalBleHandler = new BLEHandler(new BleManager());
export default GlobalBleHandler;
