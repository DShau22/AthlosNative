import SAinit from '../configure/SAinitManager';
import { storeFitnessBytes, getFitnessBytes } from '../utils/storage';
import ENDPOINTS from '../endpoints';
const Buffer = require('buffer/').Buffer;
const SERVICE_UUID = 'e49a25f0-f69a-11e8-8eb2-f2801f1b9fd1';
const TX = 'e49a25f1-f69a-11e8-8eb2-f2801f1b9fd1';
const RX = 'e49a28f2-f69a-11e8-8eb2-f2801f1b9fd1';
import axios from 'axios';

const calcChecksum = (bytes, start, end) => {
  let res = 0;
  for (let i = start; i < end; i++) {
    res += bytes[i];
  }
  res = res & 0xff;
  return res;
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
  static MAX_PKG_LEN = 200;
  static METADATA_SIZE = 5;
  constructor(manager) {
    this.readSubscription = null;
    this.scanSubscription = null;
    this.disconnectSubscription = null;
    this.manager = manager;
    this.device = null;

    this.sainit = null;
    
    this.writePkgId = 0;
    this.lastPkgId = null; // for validating response packets

    this.saDataCompleter = null // completer for when device is connected and sadata is read
    this.resCompleter = null; // completer for the next expected response
    this.currItem = null; // current item that we are trying to send
    this.isTransmitting = false; // flag for if the phone is currently sending sainit

    this.writeQueue = []; // queue of data items

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
  }

  /**
   * Stops scanning for devices. Must call scanAndConnect again to restart it
   */
  stopScan() {
    if (this.scanSubscription) {
      this.scanSubscription.remove();
      this.scanSubscription = null;
    }
  }

  /**
   * Remove the read subscription to the RX characteristic. Called when we want to stop
   * BLE functionlity
   */
  unSubscribeRead() {
    if (!this.device) {
      throw new Error("device is not yet connected");
    }
    if (!this.readSubscription) {
      throw new Error("has not subscribed to athlos earbuds yet");
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
      return true;
    }
    return await this.device.isConnected();
  }
  /**
   * According to the docs, we must wait until the state changes to powered on before
   * scanning and connecting. Returns a promise that resolves once sadata has been read and stored in async storage
   * with a resolve value of the session bytes Buffer
   */
  async scanAndConnect() {
    this.saDataCompleter = new Completer();
    console.log("testing scan and connect from global ble");
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
    console.log("scanning and connecting...");
    this.manager.startDeviceScan(null, null, async (error, device) => {
      if (error) {
        // Handle error (scanning will be stopped automatically)
        const errorJson = JSON.parse(JSON.stringify(error));
        console.log("error: ", errorJson);
        if (errorJson.errorCode === 101) {
          console.log("please make sure you enable bluetooth and location");
        }
        return;
      }
      if (device.name === 'AthlosData') {
        // Stop scanning as it's not necessary if you are scanning for one device.
        this.manager.stopDeviceScan();
        console.log("found athlos device! ", device);
        // Proceed with connection.
        try {
          const connectedDevice = await device.connect();
          const deviceWithServices = await connectedDevice.discoverAllServicesAndCharacteristics();
          this.device = deviceWithServices;
          // ADD ON DISCONNECT HERE
          this.disconnectSubscription = this.device.onDisconnected((err, device) => {
            console.log("device disconnected: ", err);
            this._resetAfterSendBytes();
            this._resetReadState();
          });
          await this._setUpNotifyListener(); // for now just handle reading
        } catch(e) {
          console.log("error connecting device and discovering services: ", e);
        }
      }
    });
  }

  /**
   * Called after the device finds the athlos earbuds. This sets up a subscription to the RX characteristic
   * so that we can read data that the earbuds send to this device.
   */
  async _setUpNotifyListener() {
    if (!this.device) {
      throw new Error("device is not yet connected");
    }
    try {
      var readChar = await this.device.readCharacteristicForService(SERVICE_UUID, RX);
    } catch(e) {
      console.log("failed to read characteristic: ", e);
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
      const len = readValueInRawBytes.length;
      try {
        if (len === 2 && this.isTransmitting) {
          // phone is transmitting to athlos earbuds
          await this._validateResponse(readValueInRawBytes);
        } else if (!this.isTransmitting) {
          this.isReading = true;
          // earbuds are transmitting to phone
          await this._readIncomingBytes(readValueInRawBytes);
          await this._sendResponse(readValueInRawBytes);
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
   * @param {Buffer} readValueInRawBytes 
   */
  async _readIncomingBytes(readValueInRawBytes) {
    if (this.readBuffers.length === 0) {
      // this is the first package sent over
      if (readValueInRawBytes[6] !== '$'.charCodeAt(0)) { // 6 because first 3 bytes are metadata in the package
        console.log(`invalid sadata: 4th byte (3rd index) should be $ but got ${readValueInRawBytes[6]}`);
        return;
      }
      this.totalNumSaDataBytes = (readValueInRawBytes[0] << 16) + (readValueInRawBytes[1] << 8) + readValueInRawBytes[0];
      this.numSaDataBytesRead = 0;
    }
    await this._readPackage(readValueInRawBytes);
  }

  /**
   * Contains logic for reading an sadata package sent from earbuds. If all bytes of sadata are read,
   * then save these bytes to local storage and send them to server. If server request fails, user can stll press the sync
   * button on the app or the app can periodically send stuff in local storage.
   * @param {Buffer} packageBytes 
   */
  async _readPackage(packageBytes) {
    this.readBuffers.append(packageBytes.slice(4, packageBytes.length - 2)); // first 3 bytes, last 2 bytes are metadata
    this.numSaDataBytesRead += packageBytes.length - SAinit.METADATA_SIZE;
    if (this.numSaDataBytesRead >= this.totalNumSaDataBytes) {
      if (this.numSaDataBytesRead > this.totalNumSaDataBytes)
        console.log(`num read (${this.numSaDataBytesRead}) shouldnt be larger than num expected (${this.totalNumSaDataBytes})`);
      // save data to async storage and send to server.
      // if server request fails, you still have data in async storage
      var totalNumBytes = 0;
      this.readBuffers.forEach((buffer, _) => {
        totalNumBytes += buffer.length;
      });
      if (totalNumBytes != this.numSaDataBytesRead)
        console.log(`num bytes in read buffers ${totalNumBytes} not same as total num bytes read (${this.numSaDataBytesRead})`);
      var concatentatedSadata = Buffer.concat(this.readBuffers, totalNumBytes);
      try {
        await storeFitnessBytes(concatentatedSadata);
      } catch(e) {
        console.log("Error storing fitness bytes! No way to handle this error yet other than not storing anything");
        this._resetReadState();
        this.saDataCompleter.error(e);
        return;
      }
      // send data to server
      try {
        const config = {
          headers: { 'Content-Type': 'application/json' },
        }
        const res = await axios.post(ENDPOINTS.upload, {
          date: new Date(),
          sessionBytes: concatentatedSadata.toString('utf8'),
        }, config);
        const resJson = res.data;
        console.log("axios response: ", resJson);
        if (!json.success) {
          throw new Error(json.message)
        }
      } catch(e) {
        console.log("error sending request to upload user data: ", e);
        this.saDataCompleter.error(e);
      }
      this._resetReadState();
      this.saDataCompleter.complete(concatentatedSadata);
      // rewrite sadata somehow
    }
  }

  /**
   * Call this when the earbuds are transmitting data to the phone, and we are sending the
   * 2 byte response package of package id and package checksum (which amounts to the package id)
   * @param {Buffer} readValueInRawBytes 
   */
  async _sendResponse(readValueInRawBytes) {
    if (!this.device) {
      throw new Error("device is not yet connected");
    }
    console.log("********SENDING RESPONSE********")
    const len = readValueInRawBytes.length;
    const pkgId = readValueInRawBytes[len - 2];
    console.log("num bytes: ", len);
    console.log("readable value: ", readValueInRawBytes.toString('utf8'));
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
    if (!this.device) {
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
    const expectedChecksum = calcChecksum(readValueInRawBytes, 0, readValueInRawBytes - 1);
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
    if (!this.device) {
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
    if (!this.device) {
      throw new Error("device is not yet connected");
    }
    // TODO: assert that queue is empty
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
    });
  }

  complete(value) {
    if (this._resolve) {
      this._resolve(value);
      this._resolve = null;
      this._reject = null;
    } else {
      console.log("promise has not been constructed yet");
    }
  }

  error(err) {
    if (this._reject) {
      this._reject(err);
      this._resolve = null;
      this._reject = null;
    } else {
      console.log("promise has not been constructed yet");
    }
  }
}

export {
  BLEHandler,
  SERVICE_UUID,
  TX,
  RX,
  calcChecksum
}