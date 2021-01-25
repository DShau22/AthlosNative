import { useTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { AppFunctionsContext, UserDataContext } from '../../Context';
import { View, StyleSheet, Image, Animated } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import Snackbar from 'react-native-snackbar';
import {
  setNeedsFitnessUpdate,
} from '../utils/storage';

import ThemeText from '../generic/ThemeText';
import BLUETOOTH_CONSTANTS from './BluetoothConstants';

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
  console.log("scanning: ", scanning);
  console.log("device ID: ", deviceID);
  // console.log("ble device: ", GlobalBleHandler.device);

  const timerRef = React.useRef();

  const expand1  = React.useRef(new Animated.Value(0)).current;
  const opacity1 = React.useRef(new Animated.Value(1)).current;
  const expand2  = React.useRef(new Animated.Value(0)).current;
  const opacity2 = React.useRef(new Animated.Value(1)).current;
  const expand3  = React.useRef(new Animated.Value(0)).current;
  const opacity3 = React.useRef(new Animated.Value(1)).current;

  const arrowOpacity = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (!scanning) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
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
      timerRef.current = setTimeout(() => {
        showSnackBar("Having trouble finding your Athlos earbuds. Make sure they're within an arm's reach and are also scanning.");
      }, 10000);
      startScanAnimations();
      arrowOpacity.stopAnimation();
    }
  }, [scanning]);

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

  const showSnackBar = (text) => {
    Snackbar.show({
      text: text,
      duration: Snackbar.LENGTH_INDEFINITE,
      action: {
        text: 'Okay',
        textColor: colors.textHighlight,
      },
      numberOfLines: 5
    });
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

  const stopScan = async () => {
    if (scanning) {
      setScanning(false);
      // give the illusion that the scans have stopped normally unless the user is registering their device
      if (!deviceID || deviceID.length === 0) {
        GlobalBleHandler.stopScan();
        // await GlobalBleHandler.disconnect();
      }
    }
  }

  const startScan = async () => {
    console.log("******* swiped down **********");
    if (scanning) {
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
        await Promise.all([updateLocalUserInfo(), setNeedsFitnessUpdate(true)]);
        GlobalBleHandler.setID(newDeviceID);
        stopScanAnimations();
        Alert.alert(
          "All Set!",
          "Successfully linked your new Athlos earbuds with this account :). Hit the gear icon on your profile if you" +
          " ever want to link different earbuds to this account",
          [{text: "Okay"}]
        )
      } catch(e) {
        console.log(e);
        showSnackBar('Something went wrong with the registration process. Please try again later.');
      } finally {
        await GlobalBleHandler.scanAndConnect(); // start the background scanning
      }
    } else {
      try {
        console.log("begin syncing....")
        await GlobalBleHandler.scanAndConnect();
        await setNeedsFitnessUpdate(true);
        showSnackBar('Successfully synced with your Athlos earbuds. Your fitness records should be up to date in a minute :]');
      } catch(e) {
        console.log("error with sync: ", e);
        if (e !== 'stopped scan') {
          showSnackBar("Something went wrong with syncing. Please try again.");
        }
      } finally {
        setScanning(false);
      }
      await updateLocalUserFitness();
    }
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
            onSwipeUp={async (gestureState) => await stopScan()}
          >
            <View style={styles.container}>
              {scanning ? 
                <>
                  <ThemeText style={styles.swipeContainer}>Swipe up to stop</ThemeText>
                  <Animated.View
                    style={[styles.rippleStyle, {
                      borderColor: 'white',
                      borderWidth: 1,
                      opacity: opacity3,
                      transform: [{scale: expand3}]
                    }]}
                  ></Animated.View>
                  <Animated.View
                    style={[styles.rippleStyle, {
                      borderColor: 'white',
                      borderWidth: 1,
                      opacity: opacity2,
                      transform: [{scale: expand2}]
                    }]}
                  ></Animated.View>
                  <Animated.View
                    style={[styles.rippleStyle, {
                      borderColor: 'white',
                      borderWidth: 1,
                      opacity: opacity1,
                      transform: [{scale: expand1}]
                    }]}
                  ></Animated.View>
                </>
              : <>
                  <ThemeText style={styles.swipeContainer}>
                    {`Swipe to ${!deviceID || deviceID.length === 0 ? 'link new earbuds' : 'start sync'}`}
                  </ThemeText>
                  <ThemeText style={[styles.swipeContainer, {fontSize: 12, top: 80}]}>
                    Make sure no other Athlos earbuds are nearby and scanning
                  </ThemeText>
                </>
              }
              <View style={[styles.imageContainer, {backgroundColor: colors.header}]}>
                <Image
                  source={require('../assets/AthlosLogo.png')}
                  style={styles.swipeDownImage}
                />
              </View>
              {scanning ? 
                <>
                  <ThemeText style={styles.scanningText}>Scanning...</ThemeText>
                  <ThemeText style={styles.scanningSubtitle}>
                    Feel free to navigate to other pages
                  </ThemeText>
                  <ThemeText style={styles.scanningSubSubtitle}>
                    in the meantime
                  </ThemeText>
                </> :
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
      {/* <Stack.Screen
        name={SYNC_PAGE}
        options={{ title: "Sync your device" }}
      >

      </Stack.Screen> */}
    </Stack.Navigator>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  swipeContainer: {
    fontSize: 26,
    fontWeight: 'bold',
    top: 30,
    position: 'absolute'
  },
  swipeDownImage: {
    alignSelf: 'center',
    height: 150,
    width: 200,
  },
  imageContainer: {
    zIndex: 2,
    width: 250,
    height: 250,
    borderRadius: 150,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rippleStyle: {
    width: 400,
    height: 400,
    borderRadius: 200,
    position: 'absolute',
  },
  scanningText: {
    position: 'absolute',
    bottom: 100,
    fontSize: 24
  },
  scanningSubtitle: {
    position: 'absolute',
    bottom: 75,
    fontSize: 14,
  },
  scanningSubSubtitle: {
    position: 'absolute',
    bottom: 55,
    fontSize: 14,
  },
  dragDownIconsContainer: {
    flexDirection: 'column',
    position: 'absolute',
    bottom: 60
  },
  dragDownIcon: {

  }
});
