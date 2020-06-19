import React from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    TextInput,
    Platform,
    StyleSheet,
    ScrollView,
    StatusBar,
    Alert
} from 'react-native';
import Textbox from "./Textbox"
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { signUpValidationSchema } from "./validationSchema";
import * as Yup from 'yup';

const SignUp = ({navigation}) => {

  // password: signUpPassword,
  // passwordConf: signUpPasswordConf,
  // email: signUpEmail,
  // firstName: signUpFirstName,
  // lastName: signUpLastName,
  // username: signUpUsername

  const [data, setData] = React.useState({
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
    Yup.reach(signUpValidationSchema, "signUpPasswordConf").validate(val)
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
    })
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

  const handleSignUp = async () => {
    // 1. typical fetch stuff
    // 2. alert user at the end
    Alert.alert(`Welcome ${data.firstName}!`, "Check your email for a confirmation", [{ text: "Okay" }]);
  }

  return (
    <View style={styles.container}>
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
            headerText={"Email"}
            placeholder="Your email..."
            icon="mail"
            handleChange={handleEmailChange}
            didChange={data.emailChange}
            errMsg={data.emailMsg}
          />

          <Textbox 
            headerText={"First Name"}
            placeholder="Your first name..."
            icon="user"
            handleChange={handleFirstNameChange}
            didChange={data.firstNameChange}
            errMsg={data.firstNameMsg}
          />

          <Textbox 
            headerText={"Last Name"}
            placeholder="Your last name..."
            icon="user"
            handleChange={handleLastNameChange}
            didChange={data.lastNameChange}
            errMsg={data.lastNameMsg}
          />

          <Textbox 
            headerText={"Username"}
            placeholder="A username..."
            icon="user"
            handleChange={handleUsernameChange}
            didChange={data.usernameChange}
            errMsg={data.usernameMsg}
          />

          <Textbox 
            headerText={"Password"}
            placeholder="Confirm your password..."
            icon="lock"
            handleChange={handlePasswordChange}
            didChange={data.passwordChange}
            errMsg={data.passwordMsg}
            updateSecureText={updateSecureTextEntry}
            secureTextEntry={data.secureTextEntry}
          />

          <Textbox 
            headerText={"Confirm Password"}
            placeholder="Same password..."
            icon="lock"
            handleChange={handleConfirmPasswordChange}
            didChange={data.passwordConfChange}
            errMsg={data.passwordConfMsg}
            updateSecureText={updateConfirmSecureTextEntry}
            secureTextEntry={data.confirm_secureTextEntry}
          />

          <View style={styles.textPrivate}>
            <Text style={styles.color_textPrivate}>
              By signing up you agree to our
            </Text>
            <Text style={[styles.color_textPrivate, {fontWeight: 'bold'}]}>{" "}Terms of service</Text>
            <Text style={styles.color_textPrivate}>{" "}and</Text>
            <Text style={[styles.color_textPrivate, {fontWeight: 'bold'}]}>{" "}Privacy policy</Text>
          </View>
          <View style={styles.button}>
            <TouchableOpacity
              style={styles.signUp}
              onPress={() => {handleSignUp()}}
            >
              <LinearGradient
                colors={['#08d4c4', '#01ab9d']}
                style={styles.signUp}
              >
                <Text style={[styles.textSign, {
                  color:'#fff'
                }]}>Sign Up</Text>
              </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={[styles.signUp, {
                  borderColor: '#009387',
                  borderWidth: 1,
                  marginTop: 15
                }]}
              >
                <Text style={[styles.textSign, {
                  color: '#009387'
                }]}>Sign In</Text>
              </TouchableOpacity>
          </View>
        </ScrollView>
      </Animatable.View>
    </View>
  );
};

export default SignUp;

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
});