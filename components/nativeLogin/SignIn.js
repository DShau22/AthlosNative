import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

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
import {
  storeData
} from '../utils/storage';
import Axios from 'axios';

import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import Spinner from 'react-native-loading-spinner-overlay';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
FontAwesome.loadFont();
Feather.loadFont();

import LoginButton from './LoginButton';
import { useTheme } from 'react-native-paper';
import { AppContext } from "../../Context";
import ENDPOINTS from '../endpoints';
import LOGIN_CONSTANTS from './LoginConstants';
import Textbox from './Textbox';
const { SIGNUP, FORGOT_PASSWORD } = LOGIN_CONSTANTS;
const signInURL = ENDPOINTS.signIn;

const SignIn = ({ navigation }) => {
  const [data, setData] = React.useState({
    username: '',
    password: '',
    check_textInputChange: false,
    secureTextEntry: true,
    isValidUser: true,
    isValidPassword: true,
    isSignInLoading: false,
  });

  const { colors } = useTheme();
  const setToken = React.useContext(AppContext);

  const textInputChange = (val) => {
    if ( val.trim().length >= 4 ) {
      setData({
        ...data,
        username: val,
        check_textInputChange: true,
        isValidUser: true
      });
    } else {
      setData({
        ...data,
        username: val,
        check_textInputChange: false,
        isValidUser: false
      });
    }
  }

  const handlePasswordChange = (val) => {
    if( val.trim().length >= 8 ) {
      setData({
        ...data,
        password: val,
        isValidPassword: true
      });
    } else {
      setData({
        ...data,
        password: val,
        isValidPassword: false
      });
    }
  }

  const updateSecureTextEntry = () => {
    setData({
      ...data,
      secureTextEntry: !data.secureTextEntry
    });
  }

  const handleValidUser = (val) => {
    if( val.trim().length >= 4 ) {
      setData({
        ...data,
        isValidUser: true
      });
    } else {
      setData({
        ...data,
        isValidUser: false
      });
    }
  }

  const loginHandle = (email, password) => {
    console.log("signing in...");
    setData({
      ...data,
      isSignInLoading: true
    })
    const login = async () => {
      // for android
      // const url = 'https://127.0.0.1:8080/api/account/signin'
      // otherwise apple
      const url = signInURL;
      console.log(url);
      
      try {
        var res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            password
          }),
        })

        var json = await res.json();
        if (json.success) {
          console.log("login succeeded");
          await storeData(json.token);
          // navigate away to the main Athlos app
          // by setting the token and changing the App.js state
          setToken(json.token);
        } else {
          console.log("alerting!")
          Alert.alert('Login Failed :(', json.messages[0], [{ text: 'Okay' }]);
          setData({
            ...data,
            isSignInLoading: false,
          });
        }
      } catch(e) {
        console.log(e);
        Alert.alert('Oops!', 'Something went wrong with the connection to the server. Please try again later', [
          { text: 'Okay' }
        ]);
        setData({
          ...data,
          isSignInLoading: false,
        });
      }
    }
    login();
  }

  return (
    <LinearGradient style={styles.container} colors={['#000046', '#1CB5E0']}>
      <Spinner
        visible={data.isSignInLoading}
        textContent={'Loading...'}
        textStyle={styles.spinnerTextStyle}
      />
      <StatusBar backgroundColor='#009387' barStyle="light-content"/>
      <View style={styles.header}>
        <Text style={styles.text_header}>Sign In</Text>
      </View>
      <Animatable.View 
        animation="fadeInUpBig"
        style={[styles.footer, {
          backgroundColor: colors.background
        }]}
      >
        <Text style={[styles.text_footer, {
          color: colors.text
        }]}>Email</Text>
        <View style={styles.action}>
          <Feather 
            name="mail"
            color={colors.text}
            size={20}
          />
          <TextInput 
            placeholder="Your Username"
            placeholderTextColor="#666666"
            style={[styles.textInput, {
              color: colors.text
            }]}
            autoCapitalize="none"
            onChangeText={(val) => textInputChange(val)}
            onEndEditing={(e)=>handleValidUser(e.nativeEvent.text)}
          />
          {data.check_textInputChange ? 
            <Animatable.View
              animation="bounceIn"
            >
              <Feather 
                name="check-circle"
                color="green"
                size={20}
              />
            </Animatable.View>
          : null}
        </View>
        
        { data.isValidUser ? null : 
          <Animatable.View animation="fadeInLeft" duration={500}>
            <Text style={styles.errorMsg}>Username must be 4 characters long.</Text>
          </Animatable.View>
        }
        <Text style={[styles.text_footer, {
          color: colors.text,
          marginTop: 35
        }]}>Password</Text>
        <View style={styles.action}>
          <Feather 
            name="lock"
            color={colors.text}
            size={20}
          />
          <TextInput 
            placeholder="Your Password"
            placeholderTextColor="#666666"
            secureTextEntry={data.secureTextEntry ? true : false}
            style={[styles.textInput, {
                color: colors.text
            }]}
            autoCapitalize="none"
            onChangeText={(val) => handlePasswordChange(val)}
          />
          <TouchableOpacity
            onPress={updateSecureTextEntry}
          >
            {data.secureTextEntry ? 
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
        </View>
        { data.isValidPassword ? null : 
          <Animatable.View animation="fadeInLeft" duration={500}>
            <Text style={styles.errorMsg}>Password must be 8 characters long.</Text>
          </Animatable.View>
        }

        <TouchableOpacity
          onPress={() => navigation.navigate(FORGOT_PASSWORD)}
        >
          <Text style={{color: '#009387', marginTop:15}}>Forgot password?</Text>
        </TouchableOpacity>
        <LoginButton
          containerStyle={[styles.buttonContainer, {marginTop: 50}]}
          style={styles.button}
          buttonTextStyle={styles.buttonTextStyle}
          filled={true}
          text='Sign In'
          onPress={() => loginHandle(data.username, data.password)}
          icon={null}
        />
        <LoginButton
          containerStyle={styles.buttonContainer}
          style={[styles.button, {
            borderColor: '#009387',
            borderWidth: 1,
            marginTop: 15
          }]}
          buttonTextStyle={[styles.buttonTextStyle, {
            color: '#009387'
          }]}
          filled={false}
          text='Sign Up'
          onPress={() => navigation.navigate(SIGNUP)}
          icon={null}
        />
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
    flex: 3,
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
  actionError: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FF0000',
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
  spinnerTextStyle: {
    color: "black"
  }
});
export default gestureHandlerRootHOC(SignIn);