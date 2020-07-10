// apparently this always has to be at the top?
import 'react-native-gesture-handler';

import * as React from 'react';
import { Text, TextInput, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
Ionicons.loadFont();

import Background from "./components/nativeLogin/Background"
import RootStackScreen from './components/nativeLogin/RootStackScreen';

import {
  getData,
  storeData
} from './components/utils/storage';
import LoadingScreen from './components/generic/LoadingScreen';
import Athlos from "./components/home/Athlos"
import AsyncStorage from '@react-native-community/async-storage';

import { AppContext } from "./Context"

function App() {
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [token, setToken] = React.useState('');

  React.useEffect(() => {
    console.log('using effect for app.js')
    const getToken = async () => {
      // await AsyncStorage.clear();
      const userToken = await getData();
      setToken(userToken);
      setIsLoading(false);
    }
    getToken();
  }, [token]);

  console.log("token: ", token);
  console.log("rendering app...")
  if (isLoading) {
    return ( <LoadingScreen />)
  }
  return (
    <AppContext.Provider value={setToken}>
      <NavigationContainer>
        { token ? <Athlos token={token} /> : <RootStackScreen /> }
      </NavigationContainer>
    </AppContext.Provider>
  );
}

export default App;
