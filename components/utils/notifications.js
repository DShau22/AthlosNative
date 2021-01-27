import Snackbar from 'react-native-snackbar';

const showSnackBar = (text, length, actionText, onPress) => {
  Snackbar.show({
    text: text,
    duration: length ? Snackbar.LENGTH_LONG : Snackbar.LENGTH_INDEFINITE,
    action: {
      text: actionText ? actionText : 'Okay',
      textColor: '#34ebeb',
      onPress: onPress ? onPress : () => {},
    },
    numberOfLines: 5
  });
}

export {
  showSnackBar
}