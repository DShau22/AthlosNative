import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, StatusBar } from 'react-native';
import { Text } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import Spinner from 'react-native-loading-spinner-overlay';
import * as Yup from 'yup';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';

import Textbox from "./Textbox";
import { signUpValidationSchema } from "./validationSchema";
import ENDPOINTS from '../endpoints';
import ThemeText from '../generic/ThemeText';
import LoginButton from './LoginButton';
const PasswordReset = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  const [emailChange, setEmailChange] = React.useState(false);
  const [emailMsg, setEmailMsg] = React.useState(false);
  const [email, setEmail] = React.useState('');

  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  React.useEffect(() => {
    return () => source.cancel();
  }, [])

  const handleEmailChange = (val) => {
    console.log(val);
    Yup.reach(signUpValidationSchema, "signUpEmail").validate(val)
      .then(function(isValid) {
        setEmailChange(val.length !== 0);
        setEmailMsg('');
        setEmail(val);
      })
      .catch(function(e) {
        console.log(e);
        setEmailMsg(e.errors[0])
      })
  }

  const onPasswordResetRequest = async () => {
    if (email.length === 0) {
      Alert.alert(
        'Whoops!',
        "Email cannot be empty",
        [{ text: "Okay" }]
      )
      return;
    }
    setIsLoading(true);
    try {
      var res = await axios.post(ENDPOINTS.forgotPassword, { email }, {
        headers: { 'Content-Type': 'application/json' },
        cancelToken: source.token
      })
      var json = res.data
      console.log("json: ", json)
      if (!json.success) throw new Error(json.message)
      Alert.alert(
        'Almost there!',
        'Check your email within the next 12 hours for more instructions on resetting your password :)',
        [{ text: "Okay" }]
      )
    } catch(e) {
      source.cancel();
      console.log(e)
      Alert.alert('Oh no :(', e, [{ text: "Okay" }])
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <LinearGradient style={styles.largeContainer} colors={['#000046', '#1CB5E0']}>
      <Spinner
        visible={isLoading}
        textContent={'Loading...'}
      />
      <StatusBar backgroundColor='#009387' barStyle="light-content"/>
      <View style={styles.header}>
        <Text style={styles.text_header}>Forgot your password?</Text>
      </View>
      <Animatable.View 
        animation="fadeInUpBig"
        style={styles.footer}
      >
        <Textbox 
          headerText={"Email"}
          placeholder="Your registered email..."
          icon={<Feather name='mail' color="#05375a" size={20}/>}
          handleChange={handleEmailChange}
          didChange={emailChange}
          errMsg={emailMsg}
        />
        <View style={styles.textPrivate}>
          <Text style={styles.color_textPrivate}>
            Enter in the email address you used to sign up for an account, and we'll send an email with steps on
            how to reset your password as soon as possible.
          </Text>
        </View>
        <LoginButton
          containerStyle={[styles.buttonContainer, {marginTop: 20}]}
          style={styles.button}
          buttonTextStyle={styles.buttonTextStyle}
          filled={true}
          text='Request Password Reset'
          onPress={() => onPasswordResetRequest()}
          icon={null}
        />
      </Animatable.View>
    </LinearGradient>
  )
}
const styles = StyleSheet.create({
  largeContainer: {
    flex: 1, 
    backgroundColor: '#009387'
  },
  smallContainer: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10
  },
  textSign: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  footer: {
    flex: Platform.OS === 'ios' ? 3 : 5,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30
  },
  header: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 50
  },
  footer: {
    flex: Platform.OS === 'ios' ? 3 : 5,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30
  },
  text_header: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 30
  },
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
  buttonContainer: {
    width: '100%',
    // height: 50,
    justifyContent: 'center',
    borderRadius: 10
  },
  button: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10
  },
  buttonTextStyle: {
    fontWeight: 'bold',
    fontSize: 18
  },
  textPrivate: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20
  },
  color_textPrivate: {
    color: 'grey'
  },
  errorMsg: {
    color: '#FF0000',
    fontSize: 14,
  },
  spinnerTextStyle: {
    color: "black"
  }
})
export default gestureHandlerRootHOC(PasswordReset)