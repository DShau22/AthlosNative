import {
  storeFitnessBytes,
  getFitnessBytes,
  removeFitnessBytes,
  setNeedsFitnessUpdate,
  removeFitnessRecords,
  getData
} from '../utils/storage';
import BLUETOOTH_CONSTANTS from './BluetoothConstants';
const {STOP_SCAN_ERR} = BLUETOOTH_CONSTANTS;
import ENDPOINTS from '../endpoints';
const Buffer = require('buffer/').Buffer;
const SERVICE_UUID = 'e49a25f0-f69a-11e8-8eb2-f2801f1b9fd1';
const TX = 'e49a25f1-f69a-11e8-8eb2-f2801f1b9fd1';
const RX = 'e49a28f2-f69a-11e8-8eb2-f2801f1b9fd1';
import axios from 'axios';
import { BleManager } from 'react-native-ble-plx';

const calcChecksum = (bytes, start, end) => {
  let res = 0;
  for (let i = start; i < end; i++) {
    res += bytes[i];
  }
  res = res & 0xff;
  return res;
}

const calcNumSaDataBytes = (readValueInRawBytes) => {
  if (readValueInRawBytes.length < 10)
    throw new Error("read value in raw bytes is too short to be valid: ", readValueInRawBytes);
  // start at idx 3 cuz first 3 bytes are metadata
  var totalNum = 0;
  for (let i = 3; i < 10; i++) {
    totalNum += readValueInRawBytes[i] * 10**(9 - i); // start at 10^6 down to 10^0
  }
  return totalNum;
}

class DataItem {
  constructor(data, tryCount) {
    this.data = data;
    this.tryCount = tryCount;
    this.length = data.length;
  }
}

// destroying manager must be handled OUTSIDE this class (in case we setup manager, then navigate away before we are able to construct this class)
class BLEHandler {
  static MAX_PKG_LEN = 64;
  static METADATA_SIZE = 5;
  constructor(manager) {
    this.readSubscription = null;
    this.scanSubscription = null;
    this.disconnectSubscription = null;
    this.manager = manager;
    this.device = null;
    this.userDeviceID = ""; // the device id that belongs to this particular user. Stored in Mongo
    
    this.sainit = null;
    
    this.writePkgId = 0;
    this.lastPkgId = null; // for validating response packets
    
    this.registerCompleter = null;
    this.saDataCompleter = null // completer for when device is connected and sadata is read
    this.resCompleter = null; // completer for the next expected response
    this.currItem = null; // current item that we are trying to send
    this.isTransmitting = false; // flag for if the phone is currently sending sainit

    this.readBuffers = []; // list of Buffers/byte arrays to be concatenated once all of sadata is received
    this.totalNumSaDataBytes = 0; // number of sadata bytes to expect when sadata is being sent over
    this.numSaDataBytesRead = 0; // current number of bytes read in from earbuds for sadata. Stop reading when this hits totalNumSaDataBytes
    this.isReading = false;
  }

  /**
   * Destroys the manager. This handler should not be used anymore after this is called.
   * Issue if destroy while transmitting or reading?
   */
  async destroy() {
    if (this.device) {
      await this.device.cancelConnection();
    }
    if (this.readSubscription) {
      this.readSubscription.remove();
    }
    if (this.scanSubscription) {
      this.scanSubscription.remove();
    }
    this.manager.destroy();
    this.readSubscription = null;
    this.scanSubscription = null;
    this.userDeviceID = "";
    this.disconnectSubscription = null;
    this.device = null;
    this.sainit = null;
    this.writePkgId = 0;
    this.lastPkgId = null;
    this.saDataCompleter = null;
    this.resCompleter = null;
    this.registerCompleter = null;
    this.currItem = null;
    this.isTransmitting = false;
    this.readBuffers = [];
    this.totalNumSaDataBytes = 0;
    this.numSaDataBytesRead = 0;
    this.isReading = false;
  }

  reinit(deviceID) {
    this.manager = new BleManager();
    this.userDeviceID = deviceID ? deviceID : '';
  }

  setID(userDeviceID) {
    console.log("setting new device id to: ", userDeviceID);
    this.userDeviceID = userDeviceID;
  }

  /**
   * Scans for devices and returns the device ID. Used in the SADataSync component when
   * the user is registering their device for the first time.
   */
  async scanAndRegister() {
    this.stopScan();
    await this.disconnect();
    this.registerCompleter = new Completer();
    this.scanSubscription = this.manager.onStateChange(async state => {
      console.log("state changed and is now: ", state);
      if (state === 'PoweredOn') {
        this.manager.startDeviceScan(null, null, async (error, device) => {
          if (error) {
            // Handle error (scanning will be stopped automatically)
            const errorJson = JSON.parse(JSON.stringify(error));
            console.log("error: ", errorJson);
            if (errorJson.errorCode === 101) {
              console.log("please make sure you enable bluetooth and location");
            }
            this.registerCompleter.error(error);
            return;
          }
          if (device.name === 'AthlosData') {
            // Stop scanning as it's not necessary if you are scanning for one device.
            this.stopScan();
            this.registerCompleter.complete(device.id);
          }
        });
      }
    }, true);
    return this.registerCompleter.result;
  }

  /**
   * Stops scanning for devices. Must call scanAndConnect again to restart it
   */
  stopScan() {
    console.log("stopping scan", this.saDataCompleter);
    if (this.readSubscription) {
      this.readSubscription.remove()
    }
    if (this.manager) {
      this.manager.stopDeviceScan();
    }
    if (this.scanSubscription) {
      this.scanSubscription.remove();
      this.scanSubscription = null;
    }
    if (this.saDataCompleter && !this.saDataCompleter.hasFinished()) {
      console.log("completer erroring");
      this.saDataCompleter.error(STOP_SCAN_ERR);
    }
  }

  /**
  * disconnects from connected Athlos device
  */
  async disconnect() {
    if (this.device && (await this.device.isConnected())) {
      console.log("disconnecting");
      await this.device.cancelConnection(); // this is async
    }
  }

  /**
   * Remove the read subscription to the RX characteristic. Called when we want to stop
   * BLE functionlity
   */
  unSubscribeRead() {
    if (!this.readSubscription) {
      console.log("has not subscribed to athlos earbuds yet");
      return;
    }
    this.readSubscription.remove();
  }

  /**
   * Adds a byte array that is supposed to be sainit to this class' instance variable
   */
  addSainit(sainit) {
    if (!sainit) {
      throw new Error(`Sainit is not valid: ${sainit}`);
    }
    this.sainit = sainit;
  }

  /**
   * Returns a boolean indicating if this device is connected to the athlos earbuds 
   * on the BLE channel
   */
  async isConnected() {
    if (this.device === null || this.device === undefined) {
      return false;
    }
    return await this.device.isConnected();
  }
  /**
   * According to the docs, we must wait until the state changes to powered on before
   * scanning and connecting. Returns a promise that resolves once sadata has been read and stored in async storage
   * with a resolve value of the session bytes Buffer
   */
  async scanAndConnect() {
    if (!this.userDeviceID || this.userDeviceID.length === 0) {
      throw new Error("Athlos device has not been linked yet");
    }
    this.stopScan();
    this.saDataCompleter = new Completer();
    this.scanSubscription = this.manager.onStateChange(async state => {
      console.log("state changed and is now: ", state);
      if (state === 'PoweredOn') {
        console.log("state is powered on!");
        await this._scanAndConnect();
        this.scanSubscription.remove();
      }
    }, true);
    return this.saDataCompleter.result; // .then this to do something once sadata is read and stored to async storage
  }
  /**
   * Repeatedly scan until we find the athlos earbuds. Once found, we subscribe to
   * the RX characteristic (setUpNotifyListener) so we can read from the earbuds.
   */
  async _scanAndConnect() {
    await this.disconnect();
    console.log("scanning and connecting for id: ", this.userDeviceID);
    this.manager.startDeviceScan(null, null, async (error, device) => {
      if (error) {
        // Handle error (scanning will be stopped automatically)
        const errorJson = JSON.parse(JSON.stringify(error));
        console.log("error: ", errorJson);
        if (errorJson.errorCode === 101) {
          console.log("please make sure you enable bluetooth and location");
        }
        this.saDataCompleter.error(`start device scan failed: ${error}`);
        return;
      }
      if (device.name === 'AthlosData') {
        if (device.id !== this.userDeviceID) {
          console.log("discovered device id: ", device.id);
          console.log("user device id: ", this.userDeviceID);
          return;
        }
        // Stop scanning as it's not necessary if you are scanning for one device.
        if (this.manager) { // sometimes it's null somehow...
          this.manager.stopDeviceScan();
        }
        console.log("found athlos device! ", device.id);
        // Proceed with connection.
        try {
          console.log("connecting...");
          const connectedDevice = await device.connect();
          const deviceWithServices = await connectedDevice.discoverAllServicesAndCharacteristics();
          this.device = deviceWithServices;
          console.log("connected to device with MTU: ", this.device.mtu);
          // ADD ON DISCONNECT HERE
          this.disconnectSubscription = this.device.onDisconnected((err, device) => {
            console.log("device disconnected: ", err);
            this.disconnectSubscription.remove();
            this._resetAfterSendBytes();
            this._resetReadState();
            this._scanAndConnect(); // try scanning and connecting again
          });
          await this._setUpNotifyListener(); // for now just handle reading
        } catch(e) {
          console.log("error connecting device and discovering services: ", e);
          this._scanAndConnect();
        }
      }
    });
  }

  /**
   * Called after the device finds the athlos earbuds. This sets up a subscription to the RX characteristic
   * so that we can read data that the earbuds send to this device.
   */
  async _setUpNotifyListener() {
    console.log("setting up notify listener");
    const deviceConnected = await this.device.isConnected();
    if (!this.device || !(await this.device.isConnected()) ) {
      throw new Error("device is not yet connected");
    }
    console.log("reading characteristics");
    try {
      var readChar = await this.device.readCharacteristicForService(SERVICE_UUID, RX);
    } catch(e) {
      console.log("failed to read characteristic: ", e);
    }
    console.log("setting up monitor");
    this.readSubscription = readChar.monitor(async (err, c) => {
      console.log("******MONITOR CALLBACK******");
      if (err) {
        console.log(err);
        return;
      }
      readChar.isNotifying = true;
      var readValueInRawBytes = Buffer.from(c.value, 'base64');
      console.log("Buffer contents: ", readValueInRawBytes);
      console.log("Buffer contents length: ", readValueInRawBytes.length);
      console.log("Buffer contents readable value: ", readValueInRawBytes.toString('utf8'));
      const len = readValueInRawBytes.length;
      try {
        if (len === 2) {
          // phone is transmitting to athlos earbuds
          await this._validateResponse(readValueInRawBytes);
        } else if (len > 2) {
          this.isReading = true;
          // earbuds are transmitting to phone
          // first validate the incoming package. Don't do anything if the checksum is off
          const checksum = readValueInRawBytes[readValueInRawBytes.length - 1]
          const expectedChecksum = calcChecksum(readValueInRawBytes, 0, readValueInRawBytes.length - 1);
          if (checksum !== expectedChecksum) {
            console.log(`Invalid checksum when reading sadata: the package must've gotten tampered with.
              Expected ${expectedChecksum} but got ${checksum}`);
            return;
          }
          await this._readIncomingBytesAndSendResponse(readValueInRawBytes);
        } else {
          console.log("ignoring package");
        }
      } catch(e) {
        console.log("error transmitting data to athlos earbuds: ", e);
      } finally {
        readChar.isNotifying = false;
      }
    });
  }

  /**
   * checks to see if package is the first package of sadata. If it is, set the total number of bytes expected to read
   * so we don't expect to read the entire sadata file.
   * 
   * If all bytes of sadata are read,
   * then save these bytes to local storage and send them to server. If server request fails, user can stll press the sync
   * button on the app or the app can periodically send stuff in local storage.
   * @param {Buffer} readValueInRawBytes 
   */
  async _readIncomingBytesAndSendResponse(readValueInRawBytes) {
    console.log("reading incoming bytes. ReadBuffers length is: ", this.readBuffers.length);
    if (this.readBuffers.length === 0) {
      // this is the first package sent over
      if (readValueInRawBytes[10] !== '\n'.charCodeAt(0)) { // 10 because first 3 bytes are metadata in the package
        console.log(`invalid sadata: 4th byte (3rd index) should be $ but got ${readValueInRawBytes[10]}`);
        throw new Error(`invalid sadata: 4th byte (3rd index) should be $ but got ${readValueInRawBytes[10]}`);
      }
      // butes 0-6 inclusive are character representation of how many bytes are valid in sadata
      this.totalNumSaDataBytes = calcNumSaDataBytes(readValueInRawBytes);
      if (this.totalNumSaDataBytes <= 20) {
        // empty sadata
        this._resetReadState();
        this.saDataCompleter.complete(null);
        return;
      }
      this.numSaDataBytesRead = 0;
    }
    console.log("total num expected: ", this.totalNumSaDataBytes);
    console.log("total num read: ", this.numSaDataBytesRead);
    this.readBuffers.push(readValueInRawBytes.slice(3, readValueInRawBytes.length - 2)); // first 3 bytes, last 2 bytes are metadata
    this.numSaDataBytesRead += readValueInRawBytes.length - BLEHandler.METADATA_SIZE;
    // save data to async storage and send to server.
    // if server request fails, you still have data in async storage
    var totalNumBytes = 0;
    this.readBuffers.forEach((buffer, _) => {
      totalNumBytes += buffer.length;
    });
    if (totalNumBytes != this.numSaDataBytesRead)
      console.log(`num bytes in read buffers ${totalNumBytes} not same as total num bytes read (${this.numSaDataBytesRead})`);
    if (this.numSaDataBytesRead >= this.totalNumSaDataBytes) {
      console.log("done reading...");
      const concatentatedSadata = Buffer.concat(this.readBuffers, totalNumBytes);
      try {
        await this._saveToAsyncStorage(concatentatedSadata);
        this.saDataCompleter.complete(concatentatedSadata);
      } catch(e) {
        console.log("Error storing fitness bytes! No way to handle this error yet other than not storing anything");
        this._resetReadState();
        this.saDataCompleter.error(e);
        return;
      }
      this._resetReadState();
    } else {
      // still expect to get more packages. Send a response to the earbuds
      await this._sendResponse(readValueInRawBytes);
    }
  }

  /**
   * Saves the sadata bytes in async storage as a base64 encoded string
   * @param {Buffer} concatentatedSadata 
   */
  async _saveToAsyncStorage(concatentatedSadata) {
    try {
      await storeFitnessBytes(concatentatedSadata);
    } catch(e) {
      console.log("Error storing fitness bytes! No way to handle this error yet other than not storing anything");
      this._resetReadState();
      this.saDataCompleter.error(e);
      return;
    }
  }

  /**
   * Sends the queue of utf8 encoded past sadatas stored in async storage. As long as server requests don't fail, this
   * queue should only have 1 element (the sadata we just read from the earbuds).
   * CONSIDER TAKING OUT PROMISE.ALL HERE SINCE IT CAN CAUSE MONGO WRITE CONFLICTS
   */
  async uploadToServer() {
    const sessionByteList = await getFitnessBytes(); // list of utf8 encoded sadata bytes in async storage
    if (sessionByteList === null) {
      console.log("session byte list is null");
      return;
    }
    const userToken = await getData();
    const config = {
      headers: { 'Content-Type': 'application/json' },
    }
    console.log("session byte list: ", sessionByteList, sessionByteList.length);
    const uploadPromises = [];
    sessionByteList.forEach(({date, sessionBytes}, _) => {
      uploadPromises.push(axios.post(ENDPOINTS.upload, {
        date,
        sessionBytes,
        userToken,
      }, config));
    });
    const promiseResults = await Promise.all(uploadPromises);
    var atLeastOneSuccess = false;
    const recordIndexesToRemove = [];
    for (let i = 0; i < promiseResults.length; i++) {
      const resJson = promiseResults[i].data;
      console.log(`${i} axios response: ${resJson}`);
      atLeastOneSuccess = atLeastOneSuccess && resJson.success;
      if (resJson.success) {
        recordIndexesToRemove.push(i);
        // successfully updated this session byte record, so we can remove it now.
      } else {
        console.log("failed: ", resJson.message);
      }
    }
    await removeFitnessRecords(recordIndexesToRemove);
    const test = await getFitnessBytes();
    console.log("fitness bytes after removing: ", test);
    await setNeedsFitnessUpdate(atLeastOneSuccess && promiseResults.length > 0);
  }

  /**
   * Call this when the earbuds are transmitting data to the phone, and we are sending the
   * 2 byte response package of package id and package checksum (which amounts to the package id)
   * @param {Buffer} readValueInRawBytes 
   */
  async _sendResponse(readValueInRawBytes) {
    if (!this.device || !(await this.device.isConnected())) {
      throw new Error("device is not yet connected");
    }
    console.log("********SENDING RESPONSE********")
    const len = readValueInRawBytes.length;
    const pkgId = readValueInRawBytes[len - 2];
    console.log("num bytes: ", len);
    console.log("below is all the stuff in base 64");
    console.log('checkSum: ', readValueInRawBytes[len - 1]);
    console.log('package id: ', pkgId);
    console.log('first byte: ', readValueInRawBytes[0]);
    console.log('second byte: ', readValueInRawBytes[1]);
    var resPackage = Buffer.from([pkgId, pkgId]).toString('base64');
    try {
      await this.device.writeCharacteristicWithoutResponseForService(SERVICE_UUID, TX, resPackage);
    } catch(e) {
      console.log("failed to write characteristic: ", e);
    }
  }

  /**
   * Validates a response package from the earbuds. This response package should contain the package id of the 
   * package that was just sent by this device, and the response package's checksum should be correct as well.
   * @param {Buffer} readValueInRawBytes 
   */
  async _validateResponse(readValueInRawBytes) {
    if (!this.device || !(await this.device.isConnected())) {
      throw new Error("device is not yet connected");
    }
    // WHAT IF PKGID === LASTPKGID whoop
    // validate the response pkg
    console.log(`******validating response: ${readValueInRawBytes}******`);
    const pkgId = readValueInRawBytes[0];
    const checksum = readValueInRawBytes[1];
    if (pkgId !== this.lastPkgId) {
      console.log(`package id's do not match. Expected ${this.lastPkgId} but got ${pkgId}`);
      return;
    }
    const expectedChecksum = calcChecksum(readValueInRawBytes, 0, readValueInRawBytes.length - 1);
    if (checksum !== expectedChecksum) {
      console.log(`Invalid checksum: the package must've gotten tampered with.
        Expected ${expectedChecksum} but got ${checksum}`);
      return;
    }
    // if both checks pass, then we resolve the promise so that sendAndWaitResponse ends
    this.currItem = null;
    this.resCompleter.complete(pkgId);
    console.log(`******validated response******`);
  }

  /**
   * Called when we want to send a packet from this device to the earbuds. This function resolves once
   * we receive a validated response
   * @param {DataItem} dataItem 
   */
  async _sendAndWaitResponse(dataItem) {
    if (!this.device || !(await this.device.isConnected())) {
      throw new Error("device is not yet connected");
    }
    this.isTransmitting = true;
    // return a promise that resolves once the monitor receives a response package and validates it
    this.resCompleter = new Completer(); // is there an issue if the old this.resCompleter hasnt resolved yet?
    this.currItem = dataItem;
    // send
    try {
      const pkg = this.currItem.data.toString('base64');
      await this.device.writeCharacteristicWithoutResponseForService(SERVICE_UUID, TX, pkg);
    } catch(e) {
      // how does writeCharacteristicWithoutResponseForService fail exactly?
      console.log("failed to transmit next package: ", e);
    }
    // promise that resolves when the response package is validated using the completer API
    return this.resCompleter.result;
  }

  /**
   * transmits a byte array to the earbuds
   * @param {Buffer} bytes 
   */
  // have settings/getters for all the sainit indices that correspond to different settings
  async sendByteArray(bytes) { // bytes should be a Buffer type already but no checksum or metadata yet
    if (!this.device || !(await this.device.isConnected())) {
      throw new Error("device is not yet connected");
    }
    console.log("****** SENDING BYTE ARRAY ******");
    if (this.isTransmitting) {
      console.log("Already sending data. Please wait");
      return;
    }
    let currId = 0;
    const numPackagesNeeded = Math.floor((bytes.length + BLEHandler.MAX_PKG_LEN) / BLEHandler.MAX_PKG_LEN);
    for (let i = 0; i < bytes.length; i+= BLEHandler.MAX_PKG_LEN) {
      const packageSize = Math.min(bytes.length - i, BLEHandler.MAX_PKG_LEN) + BLEHandler.METADATA_SIZE;
      const pkg = Buffer.alloc(packageSize);
      pkg[0] = 1; // 1 for document
      pkg[1] = currId;
      currId += 1; // HANDLE OVERFLOW LATER
      pkg[2] = numPackagesNeeded;
      for (let j = 3; j < packageSize - 2; j++) {
        pkg[j] = bytes[j - 3];
      }
      pkg[packageSize - 2] = this.writePkgId;
      pkg[packageSize - 1] = calcChecksum(pkg, 0, pkg.length - 1);
      this.lastPkgId = this.writePkgId;
      this.writePkgId += 1; // HANDLE OVERFLOW LATER
      console.log("sending: ", pkg);
      try {
        const expectedPkgId = await this._sendAndWaitResponse(new DataItem(pkg, 5)); // keep trying until timeout? check about promise timeouts...
      } catch(e) {
        console.log("error processing next in sendSaInitBytes: ", e);
        break;
      }
    }
    this._resetAfterSendBytes();
  }

  /**
   * Resets the class state after we finish transmitting a byte array over to the earbuds.
   */
  _resetAfterSendBytes() {
    this.isTransmitting = false;
    this.currItem = null;
    this.lastPkgId = null;
    this.resCompleter = null;
  }

  /**
   * resets the instance variables so that we can read sadata again
   */
  _resetReadState() {
    this.readBuffers = [];
    this.totalNumSaDataBytes = 0;
    this.numSaDataBytesRead = 0;
    this.isReading = false;
  }
}

// allows for better programmatic control of when promise is resolved/rejected
class Completer {
  constructor() {
    this.result = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
      console.log("created new completer!")
    });
  }

  complete(value) {
    if (this._resolve) {
      this._resolve(value);
      this._resolve = null;
      this._reject = null;
      console.log("resolved completer!")
    } else {
      console.log("already resolved or rejected");
    }
  }

  error(err) {
    if (this._reject) {
      this._reject(err);
      this._resolve = null;
      this._reject = null;
      console.log("rejected completer!")
    } else {
      console.log("already resolved or rejected");
    }
  }

  hasFinished() {
    return this._resolve === null && this._reject === null;
  }
}

export {
  BLEHandler,
  SERVICE_UUID,
  TX,
  RX,
  calcChecksum
}