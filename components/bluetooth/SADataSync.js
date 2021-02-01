import { useTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { AppFunctionsContext, UserDataContext } from '../../Context';
import { View, StyleSheet, Image, Animated } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import ThemeText from '../generic/ThemeText';
import BLUETOOTH_CONSTANTS from './BluetoothConstants';
const {STOP_SCAN_ERR} = BLUETOOTH_CONSTANTS;
import {
  requestLocationPermission,
  hasLocationPermission
} from '../utils/permissions';
import {
  needsFitnessUpdate,
} from '../utils/storage';
import { showSnackBar } from '../utils/notifications';
import Icon from 'react-native-vector-icons/FontAwesome';
import GlobalBleHandler from './GlobalBleHandler';
import Axios from 'axios';
import ENDPOINTS from '../endpoints';
import { Alert } from 'react-native';
Icon.loadFont();

const { SYNC_PAGE, SYNC_HELP_PAGE } = BLUETOOTH_CONSTANTS;
/**
 * User will use this component to either 'sync' their devices with the phone or 
 * register a new device. Syncing under the hood just tells the Global Ble handler to reset and rescan again to prompt
 * the earbuds to resend sadata. Registering a device is necessary otherwise someone else might try to connect their athlos
 * earbuds to their phone while this user is around, and this user will then "steal" their fitness data.
 */
export default function SADataSync() {
  const { colors } = useTheme();
  const appFunctionsContext = React.useContext(AppFunctionsContext);
  const userDataContext = React.useContext(UserDataContext);
  const { updateLocalUserInfo, updateLocalUserFitness } = appFunctionsContext;
  const { deviceID } = userDataContext;
  const [scanning, setScanning] = React.useState(false);
  const [connected, setConnected] = React.useState(false);
  // console.log("scanning: ", scanning);
  // console.log("device ID: ", deviceID);
  // console.log("ble device: ", GlobalBleHandler.device);

  const connectTimerRef = React.useRef();
  const transferTimerRef = React.useRef();

  const expand1  = React.useRef(new Animated.Value(0)).current;
  const opacity1 = React.useRef(new Animated.Value(1)).current;
  const expand2  = React.useRef(new Animated.Value(0)).current;
  const opacity2 = React.useRef(new Animated.Value(1)).current;
  const expand3  = React.useRef(new Animated.Value(0)).current;
  const opacity3 = React.useRef(new Animated.Value(1)).current;

  const arrowOpacity = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // console.log("using scanning effect: ", scanning);
    if (!scanning) {
      if (connectTimerRef.current) {
        clearTimeout(connectTimerRef.current);
        connectTimerRef.current = null;
      }
      stopScanAnimations();
      Animated.loop(
        Animated.sequence([
          Animated.timing(arrowOpacity, {
            toValue: .5,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(arrowOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          })
        ])
      ).start();
    } else {
      connectTimerRef.current = setTimeout(() => {
        showSnackBar("Having trouble finding your Athlos earbuds. Make sure they're within an arm's reach and are also scanning.");
        stopScan();
      }, 15000);
      startScanAnimations();
      arrowOpacity.stopAnimation();
    }
    return () => {
      stopScan();
      setConnected(false);
      if (connectTimerRef.current)
        clearTimeout(connectTimerRef.current)
      if (transferTimerRef.current)
        clearTimeout(transferTimerRef.current)
    }
  }, [scanning]);

  React.useEffect(() => {
    if (connected) { // get rid of the timer for trying to find athlos earbuds after connection is made
      if (connectTimerRef.current) {
        clearTimeout(connectTimerRef.current);
      }
      transferTimerRef.current = setTimeout(() => {
        showSnackBar("Having trouble transferring over activity data. Please try syncing again");
        stopScan();
        setConnected(false);
      }, 10000);
    } else {
      if (transferTimerRef.current) {
        clearTimeout(transferTimerRef.current);
        transferTimerRef.current = null;
      }
    }
  }, [connected]);

  const stopScanAnimations = () => {
    expand1.stopAnimation();
    opacity1.stopAnimation();
    expand2.stopAnimation();
    opacity2.stopAnimation();
    expand3.stopAnimation();
    opacity3.stopAnimation();
    expand1.setValue(0);
    opacity1.setValue(1);
    expand2.setValue(0);
    opacity2.setValue(1);
    expand3.setValue(0);
    opacity3.setValue(1);
  }

  const startScanAnimations = () => {
    Animated.loop(
      Animated.stagger(200, [
        Animated.parallel([
          Animated.timing(expand1, {
            toValue: 1.8,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(opacity1, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ]),
        Animated.parallel([
          Animated.timing(expand2, {
            toValue: 1.8,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(opacity2, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ]),
        Animated.parallel([
          Animated.timing(expand3, {
            toValue: 1.8,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(opacity3, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ])
    ).start();
  }

  const stopScan = () => {
    if (scanning) {
      setScanning(false);
      GlobalBleHandler.stopScan();
    }
  }

  const startScan = async () => {
    if (!(await hasLocationPermission())) {
      await requestLocationPermission();
      return;
    }
    setConnected(false);
    console.log("******* swiped down **********");
    if (scanning) {
      return;
    }
    // reinit the BLE handler. Can cause an issue with race conditions tho with stopScan
    try {
      GlobalBleHandler.stopScan();
      await GlobalBleHandler.destroy();
      GlobalBleHandler.reinit(deviceID);
    } catch(e) {
      console.log("error with start scan. Either stop scan, destroy, or reinit failed: ", e);
      showSnackBar(`Something went wrong. Please try again in a moment. ${e}`);
      return;
    }
    setScanning(true);
    // first time so run the device registration proceduer
    if (deviceID.length === 0) {
      console.log("no device id, begin linking: ", deviceID);
      try {
        const newDeviceID = await GlobalBleHandler.scanAndRegister();
        const res = await Axios.post(ENDPOINTS.updateDeviceID, {
          deviceID: newDeviceID,
          userID: userDataContext._id,
        });
        if (!res.data.success) {
          throw new Error(res.data.message);
        }
        await updateLocalUserInfo();
        GlobalBleHandler.setID(newDeviceID);
        Alert.alert(
          "All Set!",
          "Successfully linked your new Athlos earbuds with this account :). Hit the gear icon on your profile if you" +
          " want to re-link with different earbuds.",
          [{text: "Okay"}]
        );
      } catch(e) {
        console.log(e);
        showSnackBar(`Something went wrong with the registration process. Please try again later. ${e.toString()}`);
      } finally {
        stopScan();
      }
    } else {
      let tryCount = 3;
      let success = false;
      console.log("begin syncing....");
      while (tryCount > 0 && !success) {
        try {
          await GlobalBleHandler.scanAndConnect();
          setConnected(true);
          showSnackBar('Found your Athlos device! Transferring activity data...');
          await GlobalBleHandler.setUpNotifyListener();
          console.log("finished scanning....");
          success = true;
        } catch(e) {
          console.log("error with sync: ", e);
          if (e === STOP_SCAN_ERR) { // if we manually or programmatically stopped the scan, then stop the animation and don't try again.
            setScanning(false);
            return;
          }
          setConnected(false);
          showSnackBar(`${e}. Trying again...`);
          tryCount -= 1;
        }
      }
      if (!success) {
        showSnackBar(`Something went wrong with syncing. Please try again.`);
      } else {
        showSnackBar('Successfully synced with your Athlos earbuds. Your activity records are almost ready :]');
      }
      setScanning(false);
      let uploadCount = 3;
      let uploadSuccess = false;
      while (uploadCount > 0 && !uploadSuccess) {
        uploadCount -= 1;
        try {
          await GlobalBleHandler.uploadToServer();
          if (!(await needsFitnessUpdate())) {
            showSnackBar('Your activity records are already updated.');
            setConnected(false);
            return;
          }
          uploadSuccess = true;
        } catch(e) {
          console.log("upload with sync failed. Trying again");
        }
      }
      if (!uploadSuccess) {
        showSnackBar('Your activity records could not be updated. Try syncing again and make sure your internet connection is strong');
      } else {
        try {
          await updateLocalUserFitness(); // need both cuz of thresholds and nefforts 
          await updateLocalUserInfo(); // no promise.all to avoid race conditions with updating the state
          showSnackBar('Your activity records have been updated!');
        } catch(e) {
          console.log("update local user fitness or local info failed: ", e);
          showSnackBar('Your activity records have been updated! Please refresh to view updates.');
        }
      }
    }
    setConnected(false);
  }

  const Stack = createStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={SYNC_PAGE}
        options={{ title: "Sync your device" }}
      >
        {props => (
          <GestureRecognizer style={{flex: 1}}
            onSwipeDown={async (gestureState) => await startScan()}
            // onSwipeUp={async (gestureState) => await stopScan()}
          >
            <View style={styles.container}>
              {scanning ? 
                <View style={styles.topText}>
                  <ThemeText style={styles.swipeText}>This may take some time</ThemeText>
                </View>
              : <View style={styles.topText}>
                  <ThemeText style={styles.swipeText}>
                    {`Swipe down to ${!deviceID || deviceID.length === 0 ? 'link earbuds' : 'sync'}`}
                  </ThemeText>
                  <ThemeText style={[styles.swipeText, {fontSize: 12}]}>
                    Make sure no other Athlos earbuds are scanning nearby
                  </ThemeText>
                </View>
              }
              <View style={styles.imageAndArrowContainer}>
                <View style={[styles.imageContainer, {backgroundColor: colors.header}]}>
                  <View style={[styles.imageContainerBackground, {backgroundColor: colors.header}]}></View>
                  <Image
                    source={require('../assets/AthlosLogo.png')}
                    style={styles.swipeDownImage}
                  />
                  <Animated.View
                    style={[styles.rippleStyle, {
                      borderColor: 'white',
                      borderWidth: 1,
                      opacity: opacity3,
                      transform: [{scale: expand3}]
                    }]}
                  />
                  <Animated.View
                    style={[styles.rippleStyle, {
                      borderColor: 'white',
                      borderWidth: 1,
                      opacity: opacity2,
                      transform: [{scale: expand2}]
                    }]}
                  />
                  <Animated.View
                    style={[styles.rippleStyle, {
                      borderColor: 'white',
                      borderWidth: 1,
                      opacity: opacity1,
                      transform: [{scale: expand1}]
                    }]}
                  />
                </View>
                {scanning ? 
                  <View style={styles.scanningTextContainer}>
                    <ThemeText style={styles.scanningText}>{connected ? 'Transferring data...' : 'Scanning...'}</ThemeText>
                    <ThemeText style={styles.scanningSubtitle}>
                      Feel free to navigate to other pages in the meantime
                    </ThemeText>
                  </View> :
                  <View style={styles.dragDownIconsContainer}>
                    <Animated.View style={{marginTop: 20, opacity: arrowOpacity}}>
                      <Icon name='chevron-down' color={colors.textColor} size={30} />
                    </Animated.View>
                    <Animated.View style={{opacity: arrowOpacity}}>
                      <Icon name='chevron-down' color={colors.textColor} size={30} />
                    </Animated.View>
                    <Animated.View style={{opacity: arrowOpacity}}>
                      <Icon name='chevron-down' color={colors.textColor} size={30} />
                    </Animated.View>
                  </View> 
                }
              </View>
            </View>
          </GestureRecognizer>
        )}
      </Stack.Screen>
      <Stack.Screen
        name={SYNC_HELP_PAGE}
        options={{ title: "Syncing your device" }}
      >
        {props => (
          <ThemeText>aowiejfiow</ThemeText>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageAndArrowContainer: {
    flex: 4,
    width: '100%',
    alignItems: 'center',
  },
  topText: {
    flex: 1,
    width: '100%',
    alignItems: 'center'
  },
  dragDownIconsContainer: {
    flexDirection: 'column',
  },
  swipeText: {
    fontSize: 22,
    marginTop: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  imageContainer: {
    marginTop: 30,
    width: 230,
    height: 230,
    borderRadius: 115,
    alignItems: 'center',
    justifyContent: 'center'
  },
  swipeDownImage: {
    zIndex: 3,
    alignSelf: 'center',
    height: 150,
    width: 200,
    position: 'absolute',
  },
  imageContainerBackground: {
    width: 230,
    height: 230,
    borderRadius: 115,
    zIndex: 2,
  }, // this is just used to hide the beginnings of the concentric circle animation
  rippleStyle: {
    width: 400,
    zIndex: 1,
    height: 400,
    borderRadius: 200,
    position: 'absolute',
  },
  scanningTextContainer: {
    margin: 20,
    alignItems: 'center'
  },
  scanningText: {
    fontSize: 24,
  },
  scanningSubtitle: {
    fontSize: 14,
    textAlign: 'center'
  },
});
