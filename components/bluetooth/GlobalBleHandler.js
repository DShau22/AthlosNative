import { BleManager } from 'react-native-ble-plx';
import { BLEHandler } from './transmitter';
console.log('running global ble');
const GlobalBleHandler = new BLEHandler(new BleManager());
const test = async () => {
  await GlobalBleHandler.scanAndConnect();
  // await GlobalBleHandler.scanAndConnect();
  // await GlobalBleHandler.scanAndConnect();
}
// test().catch(e => {console.log(`***** fail *****`, e)})
export default GlobalBleHandler;
