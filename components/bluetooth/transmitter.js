const Buffer = require('buffer/').Buffer;
const SERVICE_UUID = 'e49a25f0-f69a-11e8-8eb2-f2801f1b9fd1';
const TX = 'e49a25f1-f69a-11e8-8eb2-f2801f1b9fd1';
const RX = 'e49a28f2-f69a-11e8-8eb2-f2801f1b9fd1';

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
    this.manager = manager;
    this.device = null;

    this.sainit = null;
    
    this.writePkgId = 0;
    this.lastPkgId = null; // for validating response packets

    this.resCompleter = null; // completer for the next expected response
    this.currItem = null; // current item that we are trying to send
    this.isTransmitting = false; // flag for if the phone is currently sending sainit

    this.writeQueue = []; // queue of data items
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
  isConnected() {
    return this.device !== null && this.device !== undefined;
  }
  /**
   * According to the docs, we must wait until the state changes to powered on before
   * scanning and connecting.
   */
  scanAndConnect() {
    console.log("testing scan and connect from global ble");
    this.scanSubscription = this.manager.onStateChange(state => {
      console.log("state changed and is now: ", state);
      if (state === 'PoweredOn') {
        console.log("state is powered on!");
        this._scanAndConnect();
        this.scanSubscription.remove();
      }
    }, true);
  }
  /**
   * Repeatedly scan until we find the athlos earbuds. Once found, we subscribe to
   * the RX characteristic (setUpNotifyListener) so we can read from the earbuds.
   */
  _scanAndConnect() {
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
          await this.setUpNotifyListener(); // for now just handle reading
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
  async setUpNotifyListener() {
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
          await this.validateResponse(readValueInRawBytes);
        } else if (!this.isTransmitting) {
          // earbuds are transmitting to phone
          await this.sendResponse(readValueInRawBytes);
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
   * Call this when the earbuds are transmitting data to the phone, and we are sending the
   * 2 byte response package of package id and package checksum (which amounts to the package id)
   * @param {Buffer} readValueInRawBytes 
   */
  async sendResponse(readValueInRawBytes) {
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
  async validateResponse(readValueInRawBytes) {
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
  async sendAndWaitResponse(dataItem) {
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
    for (let i = 0; i < bytes.length; i+= BLEHandler.MAX_PKG_LEN) {
      const packageSize = Math.min(bytes.length - i, BLEHandler.MAX_PKG_LEN) + BLEHandler.METADATA_SIZE;
      const pkg = Buffer.alloc(packageSize);
      pkg[0] = 1; // 1 for document
      pkg[1] = currId;
      currId += 1; // HANDLE OVERFLOW LATER
      pkg[2] = Math.floor((bytes.length + BLEHandler.MAX_PKG_LEN) / BLEHandler.MAX_PKG_LEN);
      for (let j = 3; j < packageSize - 2; j++) {
        pkg[j] = bytes[j - 3];
      }
      pkg[packageSize - 2] = this.writePkgId;
      pkg[packageSize - 1] = calcChecksum(pkg, 0, pkg.length - 1);
      this.lastPkgId = this.writePkgId;
      this.writePkgId += 1; // HANDLE OVERFLOW LATER
      console.log("sending: ", pkg);
      try {
        const expectedPkgId = await this.sendAndWaitResponse(new DataItem(pkg, 5)); // keep trying until timeout? check about promise timeouts...
      } catch(e) {
        console.log("error processing next in sendSaInitBytes: ", e);
        break;
      }
    }
    this.resetAfterSendBytes();
  }

  /**
   * Resets the class state after we finish transmitting a byte array over to the earbuds.
   */
  resetAfterSendBytes() {
    this.isTransmitting = false;
    this.currItem = null;
    this.lastPkgId = null;
    this.writePkgId = 0;
    this.resCompleter = null;
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