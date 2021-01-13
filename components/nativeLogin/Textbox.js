import { useTheme } from '@react-navigation/native';
import React from 'react'
import { 
  View, 
  Text, 
  TextInput,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Feather from 'react-native-vector-icons/Feather';
import ThemeText from '../generic/ThemeText';

export default function Textbox(props) {
  const {
    containerStyle,
    headerText,
    keyboardType,
    defaultValue,
    secureTextEntry,
    didChange,
    errMsg,
    icon,
    placeholder,
    updateSecureText,
    textColor,
    handleChange
  } = props;
  const { colors } = useTheme();
  return (
    <View style={containerStyle}>
      <ThemeText style={[styles.text_footer, {
        color: textColor ? textColor : colors.textColor
      }]}>
        {headerText}
      </ThemeText>
      <View style={styles.action}>
        {icon}
        <TextInput 
          placeholder={placeholder}
          style={[styles.textInput, {
            color: textColor ? textColor : colors.textColor
          }]}
          placeholderTextColor="#666666"
          autoCapitalize="none"
          keyboardType={keyboardType !== undefined ? keyboardType : 'default'}
          defaultValue={defaultValue !== undefined ? defaultValue : ''}
          secureTextEntry={secureTextEntry}
          onChangeText={(val) => handleChange(val)}
        />
        {didChange && !props.errMsg ? 
          <Animatable.View animation="bounceIn">
            <Feather 
              name="check-circle"
              color="green"
              size={20}
            />
          </Animatable.View>
        : null}

        {/* Have additional component for hiding text if props say so */}
        { updateSecureText === undefined ? null : 
          <TouchableOpacity
            onPress={updateSecureText}
            style={{ marginLeft : 10}}
          >
            {secureTextEntry ? 
              <Feather 
                name="eye-off"
                color="grey"
                size={20}
              />
              :
              <Feather 
                name="eye"
                color="grey"
                size={20}
              />
            }
          </TouchableOpacity>
        }
      </View>
      { !errMsg ? null : 
        <Animatable.View animation="fadeInLeft" duration={500}>
          <Text style={styles.errorMsg}>{errMsg}</Text>
        </Animatable.View>
      }
    </View>
  )
}
const styles = StyleSheet.create({
  text_footer: {
    fontSize: 18
  },
  action: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 5,
    // width: '50%'
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
  },
  errorMsg: {
    color: '#FF0000',
    fontSize: 14,
  }
});
