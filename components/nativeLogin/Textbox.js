import React from 'react'
import { 
  View, 
  Text, 
  TextInput,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';

export default function Textbox(props) {
  return (
    <>
      <Text style={[styles.text_footer, {
        marginTop: 35
      }]}>{props.headerText}</Text>
      <View style={styles.action}>
        <Feather 
          name={props.icon}
          color="#05375a"
          size={20}
        />
        <TextInput 
          placeholder={props.placeholder}
          style={styles.textInput}
          secureTextEntry={props.secureTextEntry}
          autoCapitalize="none"
          onChangeText={(val) => props.handleChange(val)}
        />
        {props.didChange && !props.errMsg ? 
          <Animatable.View animation="bounceIn">
            <Feather 
              name="check-circle"
              color="green"
              size={20}
            />
          </Animatable.View>
        : null}

        {/* Have additional component for hiding text if props say so */}
        { props.updateSecureText === undefined ? null : 
          <TouchableOpacity
            onPress={props.updateSecureText}
            style={{ marginLeft : 10}}
          >
            {props.secureTextEntry ? 
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
      { !props.errMsg ? null : 
        <Animatable.View animation="fadeInLeft" duration={500}>
          <Text style={styles.errorMsg}>{props.errMsg}</Text>
        </Animatable.View>
      }
    </>
  )
}
const styles = StyleSheet.create({
  text_footer: {
    color: '#05375a',
    fontSize: 18
  },
  action: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 5
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#05375a',
  },
  errorMsg: {
    color: '#FF0000',
    fontSize: 14,
  }
});