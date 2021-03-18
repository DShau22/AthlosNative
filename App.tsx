// apparently this always has to be at the top?
import 'react-native-gesture-handler';

// need to wrap application in this to use some of the popups
import { MenuProvider } from 'react-native-popup-menu';

import * as React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
Ionicons.loadFont();

import RootStackScreen from './components/nativeLogin/RootStackScreen';

import {
  getToken,
  storeToken
} from './components/utils/storage';
import LoadingScreen from './components/generic/LoadingScreen';
import Athlos from "./components/home/Athlos"
import AsyncStorage from '@react-native-community/async-storage';

import { AppContext } from "./Context"
import { LIGHT_THEME, DARK_THEME } from './components/ColorThemes'

console.disableYellowBox = true;

function App() {
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [token, setToken] = React.useState<string>('');

  React.useEffect(() => {
    const setUpTokenState = async () => {
      // await AsyncStorage.clear();
      const userToken = await getToken();
      setToken(userToken);
      setIsLoading(false);
    }
    setUpTokenState();
  }, [token]);
  if (isLoading) {
    return ( <LoadingScreen />)
  }
  return (
    <MenuProvider>
      <AppContext.Provider value={setToken}>
        <NavigationContainer theme={DARK_THEME}>
          { token ? <Athlos token={token} /> : <RootStackScreen /> }
        </NavigationContainer>
      </AppContext.Provider>
    </MenuProvider>
  );
}

export default App;
