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
  constructor(manager, device) {
    this.readSubscription = null;
    this.manager = manager;
    this.device = device;

    this.sainit = Buffer.from([0xff, 0xff, 0xff, 0xff]); // default sainit
    
    this.writePkgId = 0;
    this.lastPkgId = null; // for validating response packets

    this.resCompleter = null; // completer for the next expected response
    this.currItem = null; // current item that we are trying to send
    this.isTransmitting = false; // flag for if the phone is currently sending sainit

    this.writeQueue = []; // queue of data items
  }

  destroy() {
    this.readSubscription.remove();
  }

  async sendResponse(readValueInRawBytes) {
    console.log("********SENDING RESPONSE********")
    const len = readValueInRawBytes.length;
    console.log("num bytes: ", len);
    console.log("readable value: ", readValueInRawBytes.toString('utf8'));
    const checkSum = calcChecksum(readValueInRawBytes, 0, len - 1);
    console.log("calculated checksum is: ", checkSum);
    console.log("below is all the stuff in base 64");
    console.log('checkSum: ', readValueInRawBytes[len - 1]);
    console.log('package id: ', readValueInRawBytes[len - 2]);
    console.log('first byte: ', readValueInRawBytes[0]);
    console.log('second byte: ', readValueInRawBytes[1]);
    var resPackage = Buffer.from([readValueInRawBytes[len - 2], checkSum]).toString('base64');
    try {
      await this.device.writeCharacteristicWithoutResponseForService(SERVICE_UUID, TX, resPackage);
    } catch(e) {
      console.log("failed to write characteristic: ", e);
    }
  }

  async setUpNotifyListener() {
    try {
      var readChar = await this.device.readCharacteristicForService(SERVICE_UUID, RX);
    } catch(e) {
      console.log("failed to read characteristic: ", e);
    }
    this.readSubscription = readChar.monitor(async (err, c) => {
      console.log("******MONITOR CALLBACK******");
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

  async validateResponse(readValueInRawBytes) {
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
      console.log(`Invalid checksum: the package must've gotten tampered with or it's 
        one of those response messages that just gets sent back for some reason.
        Expected ${expectedChecksum} but got ${checksum}`);
      return;
    }
    if (checksum !== calcChecksum(this.currItem.data, 0, this.currItem.data.length - 1)) {
      console.log(`checksum doesn't match that of the previously trasmitted package.
        Expected ${calcChecksum(this.currItem.data, 0, this.currItem.data.length - 1)} got ${checksum}`);
      return;
    }
    // if both checks pass, then we resolve the promise so that sendAndWaitResponse ends
    this.currItem = null;
    this.resCompleter.complete(pkgId);
  }

  async sendAndWaitResponse(dataItem) {
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

  // have settings/getters for all the sainit indices that correspond to different settings
  async sendByteArray(bytes) { // bytes should be a Buffer type already but no checksum or metadata yet
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
      pkg[packageSize - 1] = calcChecksum(bytes, 0, bytes.length);
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