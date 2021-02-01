import {request, check, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {Platform, Alert} from 'react-native';

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
}