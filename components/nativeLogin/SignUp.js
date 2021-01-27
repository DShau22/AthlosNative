import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    Platform,
    StyleSheet,
    ScrollView,
    StatusBar,
    Alert
} from 'react-native';
import Textbox from "./Textbox"
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import Spinner from 'react-native-loading-spinner-overlay';
import * as Yup from 'yup';
import Feather from 'react-native-vector-icons/Feather';

import { signUpValidationSchema } from "./validationSchema";
import ENDPOINTS from "../endpoints"
import LOGIN_CONSTANTS from './LoginConstants'
import LoginButton from './LoginButton';
const { SIGNIN } = LOGIN_CONSTANTS

const SignUp = ({navigation}) => {

  const [data, setData] = React.useState({
    isLoading: false,

    email: '',
    password: '',
    passwordConf: '',
    firstName: '',
    lastName: '',
    username: '',
    
    usernameChange: false,
    lastNameChange: false,
    firstNameChange: false,
    emailChange: false,
    passwordChange: false,
    passwordConfChange: false,

    usernameMsg: '',
    lastNameMsg: '',
    firstNameMsg: '',
    emailMsg: '',
    passwordMsg: '',
    passwordConf: '',

    secureTextEntry: true,
    confirm_secureTextEntry: true,
  });

  const handleSignUp = async () => {
    // set isLoading to true for the spinner
    setData({
      ...data,
      isLoading: true
    })
    // 1. Make sure all inputs are valid
    // 2. typical fetch stuff
    // 3. alert user at the end

    // 1. input validation
    let {
      usernameMsg,
      lastNameMsg,
      firstNameMsg,
      emailMsg,
      passwordMsg,
      passwordConfMsg,

      password,
      passwordConf,
      email,
      firstName,
      lastName,
      username
    } = data
    if (usernameMsg || !username) {
      Alert.alert(`Oops!`, "The username you entered is empty or isn't valid :(", [{ text: "Okay" }]);
      setData({ ...data, isLoading: false });
      return;
    }
    if (lastNameMsg || !lastName) {
      Alert.alert(`Oops!`, "The last name you entered is empty or isn't valid :(", [{ text: "Okay" }]);
      setData({ ...data, isLoading: false });
      return;
    }
    if (firstNameMsg || !firstName) {
      Alert.alert(`Oops!`, "The first name you entered is empty or isn't valid :(", [{ text: "Okay" }]);
      setData({ ...data, isLoading: false });
      return;
    }
    if (emailMsg || !email) {
      Alert.alert(`Oops!`, "The email you entered is empty or isn't valid :(", [{ text: "Okay" }]);
      setData({ ...data, isLoading: false });
      return;
    }
    if (passwordMsg || passwordConfMsg || !password || !passwordConf) {
      Alert.alert(`Oops!`, "The password or confirmation password you entered is empty or isn't valid :(", [{ text: "Okay" }]);
      setData({ ...data, isLoading: false });
      return;
    }
    // inputs are ok. Go to step 2 (fetch)
    try {
      var res = await fetch(ENDPOINTS.signUp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          passwordConf,
          email,
          firstName,
          lastName,
          username,
          deviceID: "",
        }),
      })
      var json = await res.json();
      console.log('json', json);
      if (json.success) {
        Alert.alert(
          `Welcome ${firstName}!`, 
          "You're almost there! Check your inbox for a confirmation email. It might take ~5 minutes to send.", 
          [{ text: "Okay" }]);
        setData({ ...data, isLoading: false });
      } else {
        // change later to show all error messages probably
        Alert.alert("Oh No :(", json.messages[0]);
        setData({ ...data, isLoading: false });
      }
    } catch(e) {
      console.log(e);
      Alert.alert(`Oh No :(`, "Something went wrong with the connection to the server. Please try again later.", [{ text: "Okay" }]);
      setData({ ...data, isLoading: false });
    }
  }

  const handleEmailChange = (val) => {
    console.log(val);
    Yup.reach(signUpValidationSchema, "signUpEmail").validate(val)
      .then(function(isValid) {
        console.log("email is valid");
        setData({
          ...data,
          email: val,
          emailChange: val.length !== 0,
          emailMsg: ''
        });
      })
      .catch(function(e) {
        console.log(e);
        setData({
          ...data,
          emailMsg: e.errors[0],
        });
      })
  }

  const handleUsernameChange = (val) => {
    Yup.reach(signUpValidationSchema, "signUpUsername").validate(val)
      .then(function(isValid) {
        setData({
          ...data,
          username: val,
          usernameChange: val.length !== 0,
          usernameMsg: ''
        });
      })
      .catch(function(e) {
        console.log(e);
        setData({
          ...data,
          usernameMsg: e.errors[0],
        });
      })
  }

  const handleFirstNameChange = (val) => {
    Yup.reach(signUpValidationSchema, "signUpFirstName").validate(val)
      .then(function(isValid) {
        setData({
          ...data,
          firstName: val,
          firstNameChange: val.length !== 0,
          firstNameMsg: ''
        });
      })
      .catch(function(e) {
        console.log(e);
        setData({
          ...data,
          firstNameMsg: e.errors[0]
        });
      })
  }

  const handleLastNameChange = (val) => {
    Yup.reach(signUpValidationSchema, "signUpLastName").validate(val)
      .then(function(isValid) {
        setData({
          ...data,
          lastName: val,
          lastNameChange: val.length !== 0,
          lastNameMsg: ''
        });
      })
      .catch(function(e) {
        console.log(e);
        setData({
          ...data,
          lastNameMsg: e.errors[0]
        });
      })
  }

  const handlePasswordChange = (val) => {
    Yup.reach(signUpValidationSchema, "signUpPassword").validate(val)
    .then(function(isValid) {
      setData({
        ...data,
        password: val,
        passwordChange: val.length !== 0,
        passwordMsg: ''
      });
    })
    .catch(function(e) {
      console.log(e);
      setData({
        ...data,
        passwordMsg: e.errors[0]
      });
    })
  }

  const handleConfirmPasswordChange = (val) => {
    console.log(val);
    signUpValidationSchema.validateAt("signUpPasswordConf", { 
      signUpPassword: data.password,
      signUpPasswordConf: val
    })
      .then(function(isValid) {
        setData({
          ...data,
          passwordConf: val,
          passwordConfChange: val.length !== 0,
          passwordConfMsg: ''
        });
      })
      .catch(function(e) {
        console.log(e);
        setData({
          ...data,
          passwordConfMsg: e.errors[0]
        });
      });
  }

  const updateSecureTextEntry = () => {
    setData({
      ...data,
      secureTextEntry: !data.secureTextEntry
    });
  }

  const updateConfirmSecureTextEntry = () => {
    setData({
      ...data,
      confirm_secureTextEntry: !data.confirm_secureTextEntry
    });
  }

  return (
    <LinearGradient style={styles.container} colors={['#000046', '#1CB5E0']}>
      <Spinner
        visible={data.isLoading}
        textContent={'Loading...'}
        textStyle={styles.spinnerTextStyle}
      />
      <StatusBar backgroundColor='#009387' barStyle="light-content"/>
      <View style={styles.header}>
        <Text style={styles.text_header}>Register Now!</Text>
      </View>
      <Animatable.View 
        animation="fadeInUpBig"
        style={styles.footer}
      >
        <ScrollView>
          <Textbox
            containerStyle={{marginBottom: 30}}
            headerText={"Email"}
            placeholder="Your email..."
            icon={<Feather name='mail' color="#05375a" size={20}/>}
            handleChange={handleEmailChange}
            didChange={data.emailChange}
            errMsg={data.emailMsg}
            textColor={'black'}
          />

          <Textbox
            containerStyle={{marginBottom: 30}}
            headerText={"First Name"}
            placeholder="Your first name..."
            icon={<Feather name='user' color="#05375a" size={20}/>}
            handleChange={handleFirstNameChange}
            didChange={data.firstNameChange}
            errMsg={data.firstNameMsg}
            textColor={'black'}
          />

          <Textbox
            containerStyle={{marginBottom: 30}}
            headerText={"Last Name"}
            placeholder="Your last name..."
            icon={<Feather name='user' color="#05375a" size={20}/>}
            handleChange={handleLastNameChange}
            didChange={data.lastNameChange}
            errMsg={data.lastNameMsg}
            textColor={'black'}
          />

          <Textbox
            containerStyle={{marginBottom: 30}}
            headerText={"Username"}
            placeholder="A username..."
            icon={<Feather name='user' color="#05375a" size={20}/>}
            handleChange={handleUsernameChange}
            didChange={data.usernameChange}
            errMsg={data.usernameMsg}
            textColor={'black'}
          />

          <Textbox
            containerStyle={{marginBottom: 30}}
            headerText={"Password"}
            placeholder="Confirm your password..."
            icon={<Feather name='lock' color="#05375a" size={20}/>}
            handleChange={handlePasswordChange}
            didChange={data.passwordChange}
            errMsg={data.passwordMsg}
            updateSecureText={updateSecureTextEntry}
            secureTextEntry={data.secureTextEntry}
            textColor={'black'}
          />

          <Textbox
            headerText={"Confirm Password"}
            placeholder="Same password..."
            icon={<Feather name='lock' color="#05375a" size={20}/>}
            handleChange={handleConfirmPasswordChange}
            didChange={data.passwordConfChange}
            errMsg={data.passwordConfMsg}
            updateSecureText={updateConfirmSecureTextEntry}
            secureTextEntry={data.confirm_secureTextEntry}
            textColor={'black'}
          />

          <View style={styles.textPrivate}>
            <Text style={styles.color_textPrivate}>
              By signing up you agree to our
            </Text>
            <Text style={[styles.color_textPrivate, {fontWeight: 'bold'}]}>{" "}Terms of service</Text>
            <Text style={styles.color_textPrivate}>{" "}and</Text>
            <Text style={[styles.color_textPrivate, {fontWeight: 'bold'}]}>{" "}Privacy policy</Text>
          </View>
          <LoginButton
            containerStyle={[styles.buttonContainer, {marginTop: 20}]}
            style={styles.button}
            buttonTextStyle={styles.buttonTextStyle}
            filled={true}
            text='Sign Up'
            onPress={() => handleSignUp()}
            icon={null}
          />
          <LoginButton
            containerStyle={[styles.buttonContainer]}
            style={[styles.button, {
              borderColor: '#009387',
              borderWidth: 1,
              marginTop: 15
            }]}
            buttonTextStyle={[styles.buttonTextStyle, {
              color: '#009387'
            }]}
            filled={false}
            text='Sign In'
            onPress={() => navigation.navigate(SIGNIN)}
            icon={null}
          />
        </ScrollView>
      </Animatable.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#009387'
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
});
export default gestureHandlerRootHOC(SignUp);