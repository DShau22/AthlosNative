import { useTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { View, StyleSheet, Image, Animated, Dimensions } from 'react-native';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import ThemeText from '../generic/ThemeText';
import BLUETOOTH_CONSTANTS from './BluetoothConstants';

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
  const [scanning, setScanning] = React.useState(false);

  const expand1  = React.useRef(new Animated.Value(0)).current;
  const opacity1 = React.useRef(new Animated.Value(1)).current;
  const expand2  = React.useRef(new Animated.Value(0)).current;
  const opacity2 = React.useRef(new Animated.Value(1)).current;
  const expand3  = React.useRef(new Animated.Value(0)).current;
  const opacity3 = React.useRef(new Animated.Value(1)).current;


  console.log("scanning: ", scanning);
  const startScan = () => {
    setScanning(true);
    Animated.loop(
      Animated.stagger(200, [
        Animated.parallel([
          Animated.timing(expand1, {
            toValue: 2,
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
            toValue: 2,
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
            toValue: 2,
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
    ).start()
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
            onSwipeDown={(gestureState) => startScan()}
          >
            <View style={styles.container}>
              <Animated.View
                style={[styles.rippleStyle, {
                  borderColor: 'white',
                  borderWidth: 1,
                  opacity: opacity3,
                  transform: [
                    {scale: expand3 }
                  ]
                }]}
              ></Animated.View>
              <Animated.View
                style={[styles.rippleStyle, {
                  borderColor: 'white',
                  borderWidth: 1,
                  opacity: opacity2,
                  transform: [
                    {scale: expand2 }
                  ]
                }]}
              ></Animated.View>
              <Animated.View
                style={[styles.rippleStyle, {
                  borderColor: 'white',
                  borderWidth: 1,
                  opacity: opacity1,
                  transform: [
                    {scale: expand1 }
                  ]
                }]}
              ></Animated.View>
              <View style={[styles.imageContainer, {backgroundColor: colors.header}]}>
                <Image
                  source={require('../assets/AthlosLogo.png')}
                  style={styles.swipeDownImage}
                />
              </View>
              {scanning ? <ThemeText style={styles.scanningText}>Scanning...</ThemeText> : null }
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
    alignItems: 'center',
    justifyContent: 'center'    
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
  }
});
