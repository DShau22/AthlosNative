import React from 'react'
import { View, StyleSheet, Alert, TouchableOpacity, StatusBar } from 'react-native'
import { Text } from 'react-native-elements'
import Textbox from "./Textbox"
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import Spinner from 'react-native-loading-spinner-overlay';
import * as Yup from 'yup';
import { signUpValidationSchema } from "./validationSchema";
import ENDPOINTS from '../endpoints'
import axios from 'axios'
export default function PasswordReset() {
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
    <View style={styles.largeContainer}>
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
          headerText={"Email you used to sign up"}
          placeholder="Your email..."
          icon="mail"
          handleChange={handleEmailChange}
          didChange={emailChange}
          errMsg={emailMsg}
        />
        <View style={styles.button}>
          <TouchableOpacity
            style={styles.smallContainer}
            onPress={() => onPasswordResetRequest()}
          >
            <LinearGradient
              colors={['#08d4c4', '#01ab9d']}
              style={styles.smallContainer}
            >
              <Text style={[styles.textSign, {
                color:'#fff'
              }]}>Request Password Reset</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animatable.View>
    </View>
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
  button: {
    alignItems: 'center',
    marginTop: 50
  },
  signUp: {
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
