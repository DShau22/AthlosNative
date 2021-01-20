import { useTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { AppFunctionsContext } from '../../Context';
import { View, StyleSheet, Image, Animated, Dimensions } from 'react-native';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import Snackbar from 'react-native-snackbar';

import ThemeText from '../generic/ThemeText';
import BLUETOOTH_CONSTANTS from './BluetoothConstants';

import Icon from 'react-native-vector-icons/FontAwesome';
import GlobalBleHandler from './GlobalBleHandler';
Icon.loadFont();

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
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
  const { updateLocalUserInfo, updateLocalUserFitness, } = appFunctionsContext;
  const [scanning, setScanning] = React.useState(false);

  const expand1  = React.useRef(new Animated.Value(0)).current;
  const opacity1 = React.useRef(new Animated.Value(1)).current;
  const expand2  = React.useRef(new Animated.Value(0)).current;
  const opacity2 = React.useRef(new Animated.Value(1)).current;
  const expand3  = React.useRef(new Animated.Value(0)).current;
  const opacity3 = React.useRef(new Animated.Value(1)).current;

  const arrowOpacity = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (!scanning) {
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

  const startScan = async () => {
    setScanning(true);
    setTimeout(() => {
      if (scanning) {
        showSnackBar("Having trouble finding your Athlos earbuds. Make sure they're within an arm's reach and are also scanning.");
      }
    }, 10000);
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
    try {
      await GlobalBleHandler.scanAndConnect();
      showSnackBar('Successfully synced with your Athlos earbuds. Your fitness records should be up to date in a minute :]');
    } catch(e) {
      console.log("error with sync: ", e);
      showSnackBar("Something went wrong with syncing. Please try again.");
    } finally {
      setScanning(false);
      stopScanAnimations();
    }
    try {
      await Promise.all([updateLocalUserFitness(), updateLocalUserInfo()]);
    } catch(e) {
      console.log(e);
      showSnackBar("Something went wrong with the server request. Please refresh and try again.");
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
          >
            <View style={styles.container}>
              {scanning ? 
                <>
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
              : <ThemeText style={styles.swipeContainer}>Swipe to start sync</ThemeText> }
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
    // top: Dimensions.get('window').height / 2,
    // left: Dimensions.get('window').width / 2,
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
