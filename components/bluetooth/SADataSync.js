import { useTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { AppFunctionsContext, UserDataContext } from '../../Context';
import { View, StyleSheet, Image, Animated } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import ThemeText from '../generic/ThemeText';
import { useFocusEffect } from '@react-navigation/native';
import BLUETOOTH_CONSTANTS from './BluetoothConstants';
const {STOP_SCAN_ERR} = BLUETOOTH_CONSTANTS;
import {
  requestLocationPermission,
  hasLocationPermission
} from '../utils/permissions';
import SAinit from '../bluetooth/SAinitManager';
import {
  needsFitnessUpdate,
  setDeviceId,
  getSaInitConfig,
} from '../utils/storage';
import { showSnackBar } from '../utils/notifications';
import Icon from 'react-native-vector-icons/FontAwesome';
import GlobalBleHandler from './GlobalBleHandler';
import Axios from 'axios';
import ENDPOINTS from '../endpoints';
import { Alert } from 'react-native';
import { UserActivities } from '../fitness/data/UserActivities';
Icon.loadFont();

const { SYNC_PAGE, SYNC_HELP_PAGE } = BLUETOOTH_CONSTANTS;
/**
 * User will use this component to either 'sync' their devices with the phone or 
 * register a new device. Syncing under the hood just tells the Global Ble handler to reset and rescan again to prompt
 * the earbuds to resend sadata. Registering a device is necessary otherwise someone else might try to connect their athlos
 * earbuds to their phone while this user is around, and this user will then "steal" their fitness data.
 */
export default function SADataSync(props) {
  const { athlosConnected } = props;
  const { colors } = useTheme();
  const appFunctionsContext = React.useContext(AppFunctionsContext);
  const userDataContext = React.useContext(UserDataContext);
  const { updateLocalUserInfo, updateLocalUserFitness, setAppState } = appFunctionsContext;
  const [transmitting, setTransmitting] = React.useState(false);
  const [isLinked, setIsLinked] = React.useState(GlobalBleHandler.hasID());

  const transferTimerRef = React.useRef();

  const expand1  = React.useRef(new Animated.Value(0)).current;
  const opacity1 = React.useRef(new Animated.Value(1)).current;
  const expand2  = React.useRef(new Animated.Value(0)).current;
  const opacity2 = React.useRef(new Animated.Value(1)).current;
  const expand3  = React.useRef(new Animated.Value(0)).current;
  const opacity3 = React.useRef(new Animated.Value(1)).current;

  const arrowOpacity = React.useRef(new Animated.Value(1)).current;
  useFocusEffect(
    React.useCallback(() => {
      setIsLinked(GlobalBleHandler.hasID());
    }, [])
  );

  React.useEffect(() => {
    console.log("connected: ", athlosConnected);
  }, [athlosConnected]);

  React.useEffect(() => {
    console.log("using transmitting effect: ", transmitting);
    if (!transmitting) {
      if (transferTimerRef.current) {
        clearTimeout(transferTimerRef.current);
        transferTimerRef.current = null;
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
      transferTimerRef.current = setTimeout(() => {
        GlobalBleHandler.stopTransmit();
        GlobalBleHandler.stopScan();
        showSnackBar(`Having trouble ${isLinked ? 'syncing with' : 'linking'} your Athlos earbuds. Please try again.`);
        setTransmitting(false);
      }, 30000);
      arrowOpacity.stopAnimation();
      startScanAnimations();
    }
    return () => {
      console.log("Unmounting. Transmitting is: ", transmitting);
      if (transmitting) {
        GlobalBleHandler.stopTransmit();
      }
      if (transferTimerRef.current)
        clearTimeout(transferTimerRef.current)
    }
  }, [transmitting]);

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

  const link = async () => {
    if (!(await hasLocationPermission())) {
      await requestLocationPermission();
      return;
    }
    console.log("******* swiped down to link **********");
    if (transmitting) {
      return;
    }
    setTransmitting(true);
    try {
      const newDeviceID = await GlobalBleHandler.scanAndRegister();
      console.log("registered: ", newDeviceID);
      GlobalBleHandler.setID(newDeviceID); // THIS HAS TO HAPPEN BEFORE SCAN AND CONNECT
      await GlobalBleHandler.scanAndConnect();
      console.log("connected: ", newDeviceID);
      await setDeviceId(newDeviceID);
      setIsLinked(true);
      Alert.alert(
        "All Set!",
        "Successfully linked your new Athlos earbuds with this device :). Hit the gear icon on your profile if you" +
        " want to re-link with different earbuds.",
        [{text: "Okay"}]
      );
    } catch(e) {
      console.log(e);
      GlobalBleHandler.setID("");
      await GlobalBleHandler.disconnect();
      GlobalBleHandler.stopScan();
      showSnackBar(`Something went wrong with the linking process. Please try again later. ${e.toString()}`);
    }
    setTransmitting(false);
  }

  const readActivityData = async () => {
    if (!(await hasLocationPermission())) {
      await requestLocationPermission();
      return;
    }
    console.log("******* swiped down to read **********");
    if (transmitting) {
      return;
    }
    if (!GlobalBleHandler.isConnected) {
      showSnackBar("Your device is not connected. Please make sure your earbuds are within range and are in Bluetooth mode");
      return;
    }
    setTransmitting(true);
    let tryCount = 3;
    let success = false;
    console.log("begin syncing....");
    while (tryCount > 0 && !success) {
      try {
        var numBytesRead = await GlobalBleHandler.readActivityData(); // should take care of uploading to server in background
        if (numBytesRead <= 8) {
          showSnackBar("Your activity records are already synced.");
          // await uploadToServer();
          setTransmitting(false);
          return;
        }
        console.log("finished transferring activity data....");
        success = true;
      } catch(e) {
        console.log("error with sync: ", e);
        if (e === STOP_SCAN_ERR) { // if we manually or programmatically stopped the scan, then stop the animation and don't try again.
          setTransmitting(false);
          return;
        }
        showSnackBar(`${e}. Trying again...`);
        tryCount -= 1;
      }
    }
    if (!success) {
      showSnackBar(`Something went wrong with syncing. Please try again.`);
      setTransmitting(false);
      return;
    } else {
      showSnackBar('Successfully synced with your Athlos earbuds :]');
    }
    // await uploadToServer();
    await updateLocalUserInfo();
    await updateSaInit();
    setTransmitting(false);
    showSnackBar("Successfully updated your activities!", "long");
  }

  const updateSaInit = async () => {
    // store the device config in local storage first
    const saInitConfig = await getSaInitConfig();
    console.log("sainit is: ", saInitConfig);
    if (!saInitConfig) {
      console.log("no sa init stored yet");
      return;
    }
    console.log("before run efforts: ", userDataContext.runEfforts);
    const { settings, cadenceThresholds, referenceTimes, runEfforts, swimEfforts, bests } = userDataContext;
    console.log("after run efforts: ", runEfforts);
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
    await GlobalBleHandler.sendByteArray(saInitBytes);
  }

  // const uploadToServer = async () => {
  //   let uploadCount = 3;
  //   let uploadSuccess = false;
  //   while (uploadCount > 0 && !uploadSuccess) {
  //     uploadCount -= 1;
  //     try {
  //       await GlobalBleHandler.uploadToServer();
  //       uploadSuccess = true;
  //     } catch(e) {
  //       console.log("upload with sync failed. Trying again");
  //     }
  //   }
  //   if (!uploadSuccess) {
  //     showSnackBar('Your activity records could not be updated. Try syncing again and make sure your internet connection is strong');
  //   } else {
  //     try {
  //       await updateLocalUserFitness(); // need both cuz of thresholds and nefforts 
  //       await updateLocalUserInfo(); // no promise.all to avoid race conditions with updating the state
  //       showSnackBar('Your activity records have been updated!');
  //     } catch(e) {
  //       console.log("update local user fitness or local info failed: ", e);
  //       showSnackBar('Your activity records have been updated! Please refresh to view updates.');
  //     }
  //   }
  // }

  const Stack = createStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={SYNC_PAGE}
        options={{ title: "Sync your device" }}
      >
        {props => (
          <GestureRecognizer style={{flex: 1}}
            onSwipeDown={async (gestureState) => {
              if (isLinked) {
                await readActivityData();
              } else {
                await link();
              }
            }}
            // onSwipeUp={async (gestureState) => await stopScan()}
          >
            <View style={styles.container}>
              {transmitting ? 
                <View style={styles.topText}>
                  <ThemeText style={styles.swipeText}>This may take some time</ThemeText>
                </View>
              : <View style={styles.topText}>
                  <ThemeText style={styles.swipeText}>
                    {`Swipe down to ${isLinked ? 'sync' : 'link'}`}
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
                {transmitting ? 
                  <View style={styles.transmittingTextContainer}>
                    <ThemeText style={styles.transmittingText}>{GlobalBleHandler.hasID() > 0 ? 'Syncing...' : 'Linking...'}</ThemeText>
                    <ThemeText style={styles.transmittingSubtitle}>
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
  transmittingTextContainer: {
    margin: 20,
    alignItems: 'center'
  },
  transmittingText: {
    fontSize: 24,
  },
  transmittingSubtitle: {
    fontSize: 14,
    textAlign: 'center'
  },
});
