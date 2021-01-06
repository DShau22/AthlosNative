import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput,
  Platform,
  StyleSheet,
  StatusBar,
  Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ThemeText from '../generic/ThemeText';

export default function LoginButton(props) {
  const { containerStyle, style, onPress, text, icon, buttonTextStyle, filled } = props;
  console.log("filled: ", filled);
  return (
    <View style={containerStyle}>
      <TouchableOpacity onPress={() => onPress()}>
        {filled ? 
          <LinearGradient
            colors={['#83cade', '#1CB5E0']}
            style={style}
          >
            <ThemeText style={buttonTextStyle}>{text}</ThemeText>
            {icon ? icon : null}
          </LinearGradient> :
          <View style={style}>
            <ThemeText style={buttonTextStyle}>{text}</ThemeText>
            {icon ? icon : null}
          </View>
        }
      </TouchableOpacity>
    </View>
  )
}
