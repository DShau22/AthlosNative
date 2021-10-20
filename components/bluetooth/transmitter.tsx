import {
  storeFitnessBytes,
  getFitnessBytes,
  removeFitnessBytes,
  setNeedsFitnessUpdate,
  removeFitnessRecords,
  getToken,
  getShouldAutoSync,
  getSaInitConfig,
  getUserData
} from '../utils/storage';
import BLUETOOTH_CONSTANTS from './BluetoothConstants';
const {STOP_SCAN_ERR, DISCONNECT_ERR} = BLUETOOTH_CONSTANTS;
const Buffer = require('buffer/').Buffer;
const SERVICE_UUID = 'e49a25f0-f69a-11e8-8eb2-f2801f1b9fd1';
const TX = 'e49a25f1-f69a-11e8-8eb2-f2801f1b9fd1';
const RX = 'e49a28f2-f69a-11e8-8eb2-f2801f1b9fd1';
import { BleManager } from 'react-native-ble-plx';
import { updateActivityData } from '../fitness/data/localStorage';
import { BluetoothStatus } from 'react-native-bluetooth-status';
import { showSnackBar } from '../utils/notifications';
import SAinit from './SAinitManager';
const { DateTime } = require("luxon");

const calcChecksum = (bytes, start, end) => {
  let res = 0;
  for (let i = start; i < end; i++) {
    res += bytes[i];
  }
  res = res & 0xff;
  return res;
}

const calcNumSaDataBytes = (readValueInRawBytes: Buffer) => {
  if (readValueInRawBytes.length < 10)
    throw new Error(`read value in raw bytes is too short to be valid: ${readValueInRawBytes}`);
  // start at idx 3 cuz first 3 bytes are metadata
  var totalNum = 0;
  for (let i = 3; i < 10; i++) {
    totalNum += parseInt(String.fromCharCode(readValueInRawBytes[i])) * 10**(9 - i); // start at 10^6 down to 10^0
  }
  return totalNum;
}

class DataItem {
  data: any;
  tryCount: any;
  length: any;
  constructor(data, tryCount) {
    this.data = data;
    this.tryCount = tryCount;
    this.length = data.length;
  }
}

/**
 * New App workflow:
 * On first time, still keep everything the same except after linking is finished, call connect()
 * Syncing still works the same way except now no need to destroy and reinit every time
 * 
 * 
 * New API:
 * All the instance variables will still be the same
 * 
 * link(): Scans and gets the Athlos earbuds' device ID. Does not actually connect
 * 
 * connect(): scans and connects to the bluetooth device with matching device id.
 * ON DISCONNECT HANDLER must be set and when it happens call connect again. 
 * 
 * disconnect(): if connected, disconnects app from device
 * 
 * sendByteArray(dir, file, bytes): Takes in a byte array and sends it to the connected buds. Also takes in
 * a file name and directory name. This is for generic writing to the earbuds.
 * 
 * readActivityData(): sends the read package to the earbuds and reads sadata. Need a completer
 * for the entirety and a timer for timeout. Also must send a P package to reset the byte ptr
 * 
 * readFile(dir, file): Generic reading for any file. Takes in a directory and file name
 * 
 * destroy(): same as rn. Deallocates the BLEManager
 * 
 * reinit(): same as rn. Reinits with a new BLEManager and device id
 * 
 * stopTransmit(): Stops sending/reading data to/from the Athlos device. Used on timeouts
 * 
 * Now all the read methods will check for an 'E' package instead of counting bytes.
 * When sending sainit is finished, make sure to send an 'E' package too
 */

// destroying manager must be handled OUTSIDE this class (in case we setup manager, then navigate away before we are able to construct this class)
class BLEHandler {
  static MAX_PKG_LEN = 64;
  static METADATA_SIZE = 5;
  athlosResponses: any[];
  sendTimer: any;
  setConnected: Function;
  setUISyncProgress: Function;
  readSubscription: any;
  scanSubscription: any;
  disconnectSubscription: any;
  manager: BleManager;
  device: any;
  userDeviceID: string;
  sainit: any;
  writePkgId: number;
  lastPkgId: any;
  connectCompleter: any;
  registerCompleter: any;
  saDataCompleter: any;
  resCompleter: any;
  currItem: any;
  isSendingData: boolean;
  isConnected: boolean;
  readBuffers: any[];
  totalNumSaDataBytes: number;
  numSaDataBytesRead: number;
  isReading: boolean;
  constructor(manager: BleManager) {
    this.athlosResponses = [], // for JJ's debug purposes
    this.sendTimer = null;
    this.setConnected = () => {};
    this.setUISyncProgress = () => {};

    this.readSubscription = null;
    this.scanSubscription = null;
    this.disconnectSubscription = null;
    this.manager = manager;
    this.device = null;
    this.userDeviceID = ""; // the device id that belongs to this particular user. Stored in Mongo
    
    this.sainit = null;
    
    this.writePkgId = 0;
    this.lastPkgId = null; // for validating response packets
    
    this.connectCompleter = null;
    this.registerCompleter = null;
    this.saDataCompleter = null // completer for when device is connected and sadata is read
    this.resCompleter = null; // completer for the next expected response
    this.currItem = null; // current item that we are trying to send
    this.isSendingData = false; // flag for if the phone is currently sending sainit
    this.isConnected = false; // public exposure to connected that isn't async

    this.readBuffers = []; // list of Buffers/byte arrays to be concatenated once all of sadata is received
    this.totalNumSaDataBytes = 0; // number of sadata bytes to expect when sadata is being sent over
    this.numSaDataBytesRead = 0; // current number of bytes read in from earbuds for sadata. Stop reading when this hits totalNumSaDataBytes
    this.isReading = false;
  }

  /**
   * The BLE handler accepts a function that sets the state of a particular component
   * This is so that the Athlos component knows when the device disconnects
   */
  addSetConnectedFunction(fn: Function = () => {}) {
    this.setConnected = fn;
  }

  addSetSyncProgressFunction(fn: Function = () => {}) {
    this.setUISyncProgress = fn;
  }

  /**
   * Destroys the manager. This handler should not be used anymore after this is called.
   * Issue if destroy while transmitting or reading?
   */
  async destroy() {
    if (this.readSubscription) {
      this.readSubscription.remove();
    }
    if (this.scanSubscription) {
      this.scanSubscription.remove();
    }
    if (this.manager) {
      this.manager.destroy();
    }
    // this results in an error
    // if (this.disconnectSubscription) {
    //   this.disconnectSubscription.remove();
    // }
    await this.disconnect();
    this.manager = null;
    this.athlosResponses = [], // for JJ's debug purposes
    this.sendTimer = null;
    this.readSubscription = null;
    this.scanSubscription = null;
    this.userDeviceID = "";
    this.disconnectSubscription = null;
    this.device = null;
    this.sainit = null;
    this.writePkgId = 0;
    this.lastPkgId = null;
    this.connectCompleter = null;
    this.saDataCompleter = null;
    this.resCompleter = null;
    this.registerCompleter = null;
    this.currItem = null;
    this.isSendingData = false;
    this.readBuffers = [];
    this.totalNumSaDataBytes = 0;
    this.numSaDataBytesRead = 0;
    this.isReading = false;
  }

  reinit(deviceID?: string) {
    this.manager = new BleManager();
    this.userDeviceID = deviceID ? deviceID : '';
  }

  setID(userDeviceID: string) {
    console.log("setting new device id to: ", userDeviceID);
    this.userDeviceID = userDeviceID;
  }

  hasID(): boolean {
    return this.userDeviceID && this.userDeviceID.length > 0;
  }

  /**
   * Scans for devices and returns the device ID. Used in the SADataSync component when
   * the user is registering their device for the first time.
   */
  async scanAndRegister() {
    const isBtEnabled = await BluetoothStatus.state();
    if (!isBtEnabled) {
      showSnackBar("Bluetooth is not enabled. Please turn on Bluetooth to search for earbuds.");
      return;
    }
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
            let discoveredId = device.id;
            this.stopScan();
            this.registerCompleter.complete(discoveredId);
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
    if (this.manager) {
      console.log("stopping scan...");
      this.manager.stopDeviceScan();
    }
    if (this.scanSubscription) {
      this.scanSubscription.remove();
      this.scanSubscription = null;
    }
    if (this.connectCompleter && !this.connectCompleter.hasFinished()) {
      console.log("scan completer erroring");
      this.connectCompleter.error(STOP_SCAN_ERR);
    }
    if (this.saDataCompleter && !this.saDataCompleter.hasFinished()) {
      console.log("sa data completer erroring");
      this.saDataCompleter.error(STOP_SCAN_ERR);
    }
  }

  /**
  * disconnects from connected Athlos device and removes the read subscription
  */
  async disconnect() {
    if (this.readSubscription) {
      this.readSubscription.remove();
      this.readSubscription = null;
    }
    if (this.device && this.isConnected) { // THIS FOR SOME REASON DOESN'T WORK ON BATTERY OUT
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
    this.readSubscription = null;
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

  stopTransmit() {
    if (this.saDataCompleter && !this.saDataCompleter.hasFinished()) {
      this.saDataCompleter.error(STOP_SCAN_ERR);
    }
    if (this.resCompleter && !this.resCompleter.hasFinished()) {
      this.resCompleter.error(STOP_SCAN_ERR);
    }
    this._resetAfterSendBytes();
    this._resetReadState();
  }

  /**
   * According to the docs, we must wait until the state changes to powered on before
   * scanning and connecting. Returns a promise that resolves once sadata has been read and stored in async storage
   * with a resolve value of the session bytes Buffer
   */
  async scanAndConnect() {
    const isBtEnabled = await BluetoothStatus.state();
    if (!isBtEnabled) {
      showSnackBar("Bluetooth is not enabled. Please turn on Bluetooth to search for earbuds.");
      return;
    }
    showSnackBar("Searching for your Athlos device...", "long");
    if (!this.userDeviceID || this.userDeviceID.length === 0) {
      throw new Error("Athlos device has not been linked yet");
    }
    this.stopScan();
    // this.saDataCompleter = new Completer();
    this.connectCompleter = new Completer();
    this.scanSubscription = this.manager.onStateChange(async state => {
      console.log("state changed and is now: ", state);
      if (state === 'PoweredOn') {
        console.log("state is powered on!");
        await this._scanAndConnect();
        this.scanSubscription.remove();
      }
    }, true);
    // return this.saDataCompleter.result; // .then this to do something once sadata is read and stored to async storage
    return this.connectCompleter.result;
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
        // this.saDataCompleter.error(`start device scan failed: ${error}`);
        this.connectCompleter.error(`start device scan failed: ${error}`);
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
          this.disconnectSubscription = this.device.onDisconnected((err, device) => {
            console.log("device disconnected: ", err);
            this.setConnected(false);
            this.isConnected = false;
            this.disconnectSubscription.remove();
            this._resetAfterSendBytes();
            this._resetReadState();
            if (this.readSubscription) {
              this.readSubscription.remove();
              this.readSubscription = null;
            }
            if (this.saDataCompleter && !this.saDataCompleter.hasFinished()) {
              this.saDataCompleter.error(DISCONNECT_ERR); 
            }
            if (this.resCompleter && !this.resCompleter.hasFinished()) {
              this.resCompleter.error(DISCONNECT_ERR);
            }
            this._scanAndConnect(); // try scanning and connecting again on disconnect
          });
          await this.setUpNotifyListener();
          this.connectCompleter.complete(true);
        } catch(e) {
          console.log("error connecting device and discovering services: ", e);
          this._scanAndConnect();
        }
      }
    });
  }

  /**
   * Called after connection made to earbuds. Sets up listener and nothing else. Takes
   * it down in the beginning if it already exists so multiple aren't set up.
   */
  async setUpNotifyListener() {
    console.log("setting up notify listener");
    if (!this.device || !(await this.device.isConnected()) ) {
      throw new Error("device is not yet connected");
    }
    console.log("reading characteristics");
    var readChar = await this.device.readCharacteristicForService(SERVICE_UUID, RX);
    console.log("setting up monitor");
    if (this.readSubscription) {
      this.readSubscription.remove();
      this.readSubscription = null;
    }
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
          this.athlosResponses.push(Buffer.from(readValueInRawBytes, 'base64'));
          await this._validateResponse(readValueInRawBytes);
        } else if (readValueInRawBytes[0] === 'X'.charCodeAt(0)) {
          this.resCompleter.error("Got an X package");
        } else if (this._isEchoPkg(readValueInRawBytes)) {
          this.resCompleter.complete();
          await this._sendResponse(readValueInRawBytes);
        } else if (len > 2) {
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
    this.setConnected(true);
    this.isConnected = true;
  }

  async readActivityData() {
    const isBtEnabled = await BluetoothStatus.state();
    if (!isBtEnabled) {
      showSnackBar("Bluetooth is not enabled. Please turn on Bluetooth to sync.");
      return;
    }
    if (!this.device || !(await this.device.isConnected())) {
      console.log("device is not connected: ", this.device);
      return;
    }
    this.isReading = true;
    this.saDataCompleter = new Completer();
    // send special read sadata package
    const readSaDataPkg = Buffer.alloc(6);
    readSaDataPkg[0] = 'C'.charCodeAt(0);
    readSaDataPkg[1] = 0;
    readSaDataPkg[2] = 1;
    readSaDataPkg[3] = 'D'.charCodeAt(0);
    readSaDataPkg[4] = this.writePkgId;
    readSaDataPkg[5] = calcChecksum(readSaDataPkg, 0, readSaDataPkg.length - 1);
    console.log("send read activity data pkg...");
    await this._sendAndWaitResponse(readSaDataPkg);
    return this.saDataCompleter.result;
  }

  _isSaDataConf(readValueInRawBytes) {
    return readValueInRawBytes[0] === 'C'.charCodeAt(0) &&
          readValueInRawBytes[1] === 0 && 
          readValueInRawBytes[2] === 1 && 
          readValueInRawBytes[3] === 'D'.charCodeAt(0);
  }

  /**
   * Returns true if this is an 'E' package. Indicates the earbuds finished writing/sending its data for reading.
   * @param {Buffer} readValueInRawBytes 
   */
  _isFinishTransmit(readValueInRawBytes) {
    return readValueInRawBytes[0] === 'E'.charCodeAt(0) && 
          readValueInRawBytes[1] === 'E'.charCodeAt(0) && 
          readValueInRawBytes[2] === 'E'.charCodeAt(0);
  }

  /**
   * Wrapper for sending any package.
   * Sets the currItem field to the correct thing.
   * Increments package id by 1.
   * So that I don't have to keep repeating those two above
   * @param {Buffer} packageInBytes 
   */
  async _sendPackage(packageInBytes: Buffer) {
    this.currItem = new DataItem(packageInBytes, 3);
    this.lastPkgId = this.writePkgId;
    this.writePkgId += 1;
    await this.device.writeCharacteristicWithoutResponseForService(SERVICE_UUID, TX, packageInBytes.toString('base64'));
  }

  /**
   * checks to see if this package is equal to this.currItem (the package that was last sent by this phone)
   * @param {Buffer} readValueInRawBytes 
   */
  _isEchoPkg(readValueInRawBytes) {
    if (!this.currItem) {
      console.log("is not echo package cuz this.currItem is null: ", readValueInRawBytes);
      return false;
    }
    if (this.currItem.length !== readValueInRawBytes.length) {
      return false;
    }
    for (let i = 0; i < this.currItem.length; i++) {
      if (this.currItem.data[i] !== readValueInRawBytes[i]) {
        return false;
      }
    }
    console.log("is echo package!");
    return true;
  }

  /**
   * checks to see if package is the first package of sadata. If it is, set the total number of bytes expected to read
   * so we don't expect to read the entire sadata file.
   * 
   * If all bytes of sadata are read,
   * then save these bytes to local storage and send them to server. If server request fails, user can stll press the sync
   * button on the app or the app can periodically send stuff in local storage.
   * @param {Buffer} readValueInRawBytes 
   * @param {Function} setStateHook a function that sets the state of the component using this transmitter. Usually for showing transmitting progress in UI.
   */
  async _readIncomingBytesAndSendResponse(readValueInRawBytes: Buffer) {
    // handle accordingly if this is the first SADATA package
    if (this.readBuffers.length === 0) {
      // this is the first DATA package sent over
      if (readValueInRawBytes[10] !== '\n'.charCodeAt(0)) { // 9 because first 3 bytes are metadata in the package
        this.saDataCompleter.error(`invalid sadata: 11th byte (10th index) should be $ but got ${readValueInRawBytes[10]}`);
        this._resetReadState();
        console.log(`invalid sadata: 11th byte (10th index) should be $ but got ${readValueInRawBytes[10]}`);
        throw new Error(`invalid sadata: 11th byte (10th index) should be $ but got ${readValueInRawBytes[10]}`);
      }
      this.totalNumSaDataBytes = calcNumSaDataBytes(readValueInRawBytes);
      this.setUISyncProgress(0);
      this.numSaDataBytesRead = 0;
    }
    this.numSaDataBytesRead += readValueInRawBytes.length - BLEHandler.METADATA_SIZE;
    if (this.numSaDataBytesRead > this.totalNumSaDataBytes) {
      // we were sent more bytes of SADATA than we should have received which happens when total numbe bytes % 64 != 0
      // this should only happen at the very last package
      let extraBytesReceived = this.numSaDataBytesRead - this.totalNumSaDataBytes;
      this.readBuffers.push(readValueInRawBytes.slice(3, readValueInRawBytes.length - extraBytesReceived - 2));
    } else {
      this.readBuffers.push(readValueInRawBytes.slice(3, readValueInRawBytes.length - 2)); // first 3 bytes, last 2 bytes are metadata
    }
    console.log("total num bytes to read expected: ", this.totalNumSaDataBytes);
    console.log("total num bytes read so far: ", this.numSaDataBytesRead);
    this.setUISyncProgress(this.numSaDataBytesRead / this.totalNumSaDataBytes);

    var totalNumBytes = 0;
    this.readBuffers.forEach((buffer, _) => {
      totalNumBytes += buffer.length;
    });
    if (this._isFinishTransmit(readValueInRawBytes)) {
      console.log("done reading...");
      const concatentatedSadata = Buffer.concat(this.readBuffers, totalNumBytes);
      try {
        if (this.totalNumSaDataBytes > 8) {
          await updateActivityData(DateTime.local(), concatentatedSadata);
          // send package to tell the earbuds to rewrite sadata. Shouldnt need to await
          await this._sendResetSaDataPkg();
          // update sainit here so that user bests, nefforts, etc are updated
          // this.resCompleter should have been completed by now since the read package sent to the earbuds shouldve been completed
          // update sa init is after the reset data package so that the audio played will be "activities updated"
          // this should ideally happen before in case updateSaInit fails but oh well
          await this._updateSaInit();
        }
        console.log("resetting read state");
        let bytesRead = this.totalNumSaDataBytes
        this._resetReadState(); // totalNumSaDataBytes get reset here
        this.saDataCompleter.complete(bytesRead);
      } catch(e) {
        console.log("Error 102: error storing fitness bytes (updateActivityData)");
        this._resetReadState();
        this.saDataCompleter.error(e);
      }
    } else {
      await this._sendResponse(readValueInRawBytes);
      return;
    }
  }

  async _updateSaInit() {
    const saInitConfig = await getSaInitConfig();
    const userData = await getUserData(); // CANT USE CONTEXT CUZ SETSTATE IS ASYNC
    const { settings, cadenceThresholds, referenceTimes, runEfforts, swimEfforts, bests } = userData;
    const sainitManager = new SAinit(
      saInitConfig,
      settings,
      runEfforts,
      swimEfforts,
      referenceTimes,
      cadenceThresholds,
      bests.highestJump,
    );
    const saInitBytes = sainitManager.createSaInit(); // should return byte array
    await this.sendByteArray(saInitBytes);
  }

  async _sendResetSaDataPkg() {
    console.log("sending reset package...")   
    const resetPkg = Buffer.alloc(12);
    resetPkg[0] = 'C'.charCodeAt(0); // 3 means rewrite sadata
    resetPkg[1] = 0; // pkgid is 0
    resetPkg[2] = 1; // 1 pkg total
    resetPkg[3] = 'P'.charCodeAt(0);
    resetPkg[4] = '0'.charCodeAt(0);
    resetPkg[5] = '0'.charCodeAt(0);
    resetPkg[6] = '0'.charCodeAt(0);
    resetPkg[7] = '0'.charCodeAt(0);
    resetPkg[8] = '0'.charCodeAt(0);
    resetPkg[9] = '8'.charCodeAt(0);
    resetPkg[resetPkg.length - 2] = this.writePkgId; // overall pkg id
    resetPkg[resetPkg.length - 1] = calcChecksum(resetPkg, 0, resetPkg.length - 1); // checksum
    await this._sendAndWaitResponse(resetPkg);
  }

  /**
   * Call this when the earbuds are transmitting data to the phone, and we are sending the
   * 2 byte response package of package id and package checksum (which amounts to the package id)
   * @param {Buffer} readValueInRawBytes 
   */
  async _sendResponse(readValueInRawBytes: Buffer) {
    if (!this.device || !(await this.device.isConnected())) {
      throw new Error("device is not yet connected");
    }
    console.log("********SENDING RESPONSE********")
    const len = readValueInRawBytes.length;
    const pkgId = readValueInRawBytes[len - 2];
    // console.log("num bytes: ", len);
    // console.log('checkSum: ', readValueInRawBytes[len - 1]);
    // console.log('package id: ', pkgId);
    // console.log('first byte: ', readValueInRawBytes[0]);
    // console.log('second byte: ', readValueInRawBytes[1]);
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
    this.resCompleter.complete(pkgId);
    if (this.sendTimer) {
      clearTimeout(this.sendTimer);
      this.sendTimer = null;
    }
    console.log(`******validated response******`);
  }

  /**
   * Called when we want to send a packet from this device to the earbuds. This function resolves once
   * we receive a validated response
   * @param {Buffer} packageInBytes 
   */
  async _sendAndWaitResponse(packageInBytes: Buffer) {
    if (!this.device || !(await this.device.isConnected())) {
      throw new Error("device is not yet connected");
    }
    // return a promise that resolves once the monitor receives a response package and validates it
    this.resCompleter = new Completer(); // is there an issue if the old this.resCompleter hasnt resolved yet?
    // set the timeout here after rescompleter is initialized for the closure
    this.sendTimer = setTimeout(() => {
      console.log(this.resCompleter);
      if (this.resCompleter && !this.resCompleter.hasFinished()) {
        this.resCompleter.error(`Timed out. The last response packages received from the earbuds were: ${this.athlosResponses}`);
      }
    }, 8000);
    // send
    try {
      await this._sendPackage(packageInBytes);
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
  async sendByteArray(bytes: Buffer) { // bytes should be a Buffer type already but no checksum or metadata yet
    console.log("sending byte array...");
    const isBtEnabled = await BluetoothStatus.state();
    if (!isBtEnabled) {
      showSnackBar("Bluetooth is not enabled. Please turn on Bluetooth to sync.");
      return;
    }
    if (!this.device || !(await this.device.isConnected())) {
      throw new Error("device is not yet connected");
    }
    console.log("****** SENDING BYTE ARRAY ******");
    console.log("byte array: ", bytes, bytes.length);
    if (this.isSendingData) {
      console.log("Already sending data. Please wait");
      return;
    }
    this.isSendingData = true;
    let currId = 0;
    const numPackagesNeeded = Math.ceil(bytes.length  / BLEHandler.MAX_PKG_LEN);
    for (let i = 0; i < bytes.length; i+= BLEHandler.MAX_PKG_LEN) {
      const packageSize = Math.min(bytes.length - i, BLEHandler.MAX_PKG_LEN) + BLEHandler.METADATA_SIZE;
      const pkg = Buffer.alloc(packageSize);
      pkg[0] = 1; // 1 for document
      pkg[1] = currId;
      currId += 1; // HANDLE OVERFLOW LATER
      pkg[2] = numPackagesNeeded;
      for (let j = 3; j < packageSize - 2; j++) {
        pkg[j] = bytes[i + j - 3];
      }
      pkg[packageSize - 2] = this.writePkgId;
      pkg[packageSize - 1] = calcChecksum(pkg, 0, pkg.length - 1);
      console.log("sending: ", pkg);
      await this._sendAndWaitResponse(pkg);
    }
    this._resetAfterSendBytes();
  }

  /**
   * Stops sending byte array but just resetting
   */
  stopSendBytes() {
    this._resetAfterSendBytes();
  }

  /**
   * Resets the class state after we finish transmitting a byte array over to the earbuds.
   */
  _resetAfterSendBytes() {
    this.athlosResponses = [];
    this.isSendingData = false;
    this.currItem = null;
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
    this.isSendingData = false;
    this.currItem = null;
    this.setUISyncProgress(-1); // non negative means it's currently reading sadata
  }
}

// allows for better programmatic control of when promise is resolved/rejected
class Completer {
  result: Promise<unknown>;
  _resolve: (value: unknown) => void;
  _reject: (reason?: any) => void;
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