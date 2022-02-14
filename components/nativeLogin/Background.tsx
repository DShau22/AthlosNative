import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import React from 'react'
import {
  View, 
  Text, 
  ScrollView, 
  Dimensions,
  StyleSheet,
  StatusBar,
} from 'react-native';

import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '@react-navigation/native';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';

import LOGIN_CONSTANTS from './LoginConstants'
import LoginButton from './LoginButton';
const { SIGNIN } = LOGIN_CONSTANTS

MaterialIcons.loadFont();
Ionicons.loadFont();

const Background = ({ navigation }) => {
  const { colors } = useTheme();
  return (
    <LinearGradient style={styles.container} colors={['#000046', '#1CB5E0']}>
      <View style={[styles.header]}>
        <Animatable.Image 
          animation="bounceIn"
          duration={1500}
          source={require('../assets/AthlosLogo.png')}
          style={styles.logo}
          resizeMode="stretch"
        />
      </View>
      <Animatable.View 
        style={[styles.footer, {
          backgroundColor: colors.header,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        }]}
        animation="fadeInUpBig"
      >
        {/* '#000046', '#1CB5E0' */}
        <LinearGradient colors={['#F4F5FC', '#F4F5FC']} style={{
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        }}>
          <ScrollView style={{
            backgroundColor: '#F4F5FC',
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
          }}>
            <Text style={[styles.title, {color: colors.header}]}>
              Welcome to the Athlos Live app! 
            </Text>
            <Text style={[styles.title, {color: colors.header}]}>
              Here you can track your fitness and customize your device!
            </Text>
            <LoginButton
              containerStyle={styles.startButton}
              style={styles.signIn}
              buttonTextStyle={styles.buttonTextStyle}
              filled={true}
              text='Get Started'
              onPress={() => navigation.navigate(SIGNIN)}
              icon={<MaterialIcons name="navigate-next" color="#fff" size={20}/>}
            />
          </ScrollView>
        </LinearGradient>
      </Animatable.View>
    </LinearGradient>
  )
}

const { height} = Dimensions.get("screen");
const height_logo = height * 0.28;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
  },
  header: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    height: '45%',
  },
  logo: {
    width: 270,
    height: 210,
  },
  title: {
    marginLeft: 30,
    marginRight: 30,
    marginTop: 30,
    fontSize: 30,
    // color: 'black',
    fontWeight: 'bold'
  },
  text: {
    color: 'grey',
    marginTop:5
  },
  startButton: {
    alignItems: 'flex-end',
    marginRight: 25,
    marginTop: 20,
    marginBottom: 30,
  },
  signIn: {
    width: 150,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    flexDirection: 'row'
  },
  buttonTextStyle: {
    fontWeight: 'bold',
    fontSize: 16
  },
  textSign: {
    color: 'white',
    fontWeight: 'bold'
  }
});

export default gestureHandlerRootHOC(Background)