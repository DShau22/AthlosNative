import {request, check, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {Platform, Alert, DeviceEventEmitter} from 'react-native';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";

const requestLocationServices = async () => {
  try {
    const locationCheck = await LocationServicesDialogBox.checkLocationServicesIsEnabled({
      message: "<h2 style='color: #0af13e'>Enable Location?</h2>Android apps need location services to be able to make Bluetooth connections",
      ok: "Yes",
      cancel: "No",
      enableHighAccuracy: true, // true => GPS AND NETWORK PROVIDER, false => GPS OR NETWORK PROVIDER
      showDialog: true, // false => Opens the Location access page directly
      openLocationServices: true, // false => Directly catch method is called if location services are turned off
      preventOutSideTouch: true, // true => To prevent the location services window from closing when it is clicked outside
      preventBackClick: true, // true => To prevent the location services popup from closing when it is clicked back button
      providerListener: true, // true ==> Trigger locationProviderStatusChange listener when the location state changes
    });
    console.log(locationCheck);
  } catch(e) {
    console.log(e);
    Alert.alert(
      "Whoops",
      "You'll need to turn on your phone's location services for this app to be able to make Bluetooth connections " +
      "with your Athlos earbuds. Android requires location services to be on for Bluetooth access.",
      [{text: 'Okay'}]
    );
  }
}

const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    const checkResult = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    if (checkResult === RESULTS.DENIED) {
      const reqResult = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      switch(reqResult) {
        case RESULTS.GRANTED:
          Alert.alert(
            "All set",
            "Android devices need location permissions to be able to use Bluetooth low energy to connect " +
            "to your Athlos earbuds. We will use these permissions only for Bluetooth and nothing else.",
            [{text: 'Okay'}]
          );
          break;
        case RESULTS.DENIED:
          Alert.alert(
            "Whoops",
            "Looks like you've denied location permissions for this app. " +
            "It sounds weird but Android devices need this permission " +
            "to be able to use Bluetooth low energy to connect to your Athlos earbuds. Please head on to " +
            "your app settings and enable location permissions for this app.",
            [{text: 'Okay'}]
          );
          break;
        case RESULTS.BLOCKED:
          Alert.alert(
            "Whoops",
            "Looks like you've blocked location permissions for this app. " +
            "It sounds weird but Android devices need this permission " +
            "to be able to use Bluetooth low energy to connect to your Athlos earbuds. Please head on to " +
            "your app settings and enable location permissions for this app.",
            [{text: 'Okay'}]
          );
          break;
        default:
          break;
      }
    } else if (checkResult === RESULTS.BLOCKED) {
      Alert.alert(
        "Hold on",
        "Location permissions are blocked for this app. Android devices need this permission " +
        "to be able to use Bluetooth low energy to connect to your Athlos earbuds. Please head on to " +
        "your app settings and enable location permissions for this app.",
        [{text: 'Okay'}]
      );
    } else if (checkResult === RESULTS.GRANTED) {
      console.log("location permissions are already granted!");
    } else {
      console.log("check result is: ", checkResult);
    }
  }
}

const hasLocationPermission = async () => {
  if (Platform.OS === 'android') {
    const checkResult = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    return checkResult === RESULTS.GRANTED;
  } else {
    return true;
  }
}
export {
  requestLocationPermission,
  hasLocationPermission,
  requestLocationServices
}