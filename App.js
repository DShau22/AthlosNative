// apparently this always has to be at the top?
import 'react-native-gesture-handler';

import * as React from 'react';
import { Text, TextInput, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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

function HomeScreen({ navigation, route }) {
  React.useEffect(() => {
    if (route.params?.post) {
      // Post updated, do something with `route.params.post`
      // For example, send the post to the server
    }
  }, [route.params?.post]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button
        title="Create post"
        onPress={() => navigation.navigate('CreatePost')}
      />
      <Text style={{ margin: 10 }}>Post: {route.params?.post}</Text>
    </View>
  );
}

function CreatePostScreen({ navigation, route }) {
  const [postText, setPostText] = React.useState('');

  return (
    <>
      <TextInput
        multiline
        placeholder="What's on your mind?"
        style={{ height: 200, padding: 10, backgroundColor: 'white' }}
        value={postText}
        onChangeText={setPostText}
      />
      <Button
        title="Done"
        onPress={() => {
          // Pass params back to home screen
          navigation.navigate('Home', { post: postText });
        }}
      />
    </>
  );
}

// when you wanna use route.params in the options param
function StackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'My home' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ route }) => ({ title: route.params.name })}
      />
    </Stack.Navigator>
  );
}

// const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function App() {
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [token, setToken] = React.useState('');

  React.useEffect(() => {
    console.log('using effect for app.js')
    const getToken = async () => {
      await AsyncStorage.clear();
      const userToken = await getData();
      setToken(userToken);
      setIsLoading(false);
    }
    getToken();
  }, []);

  console.log("token: ", token);
  console.log("rendering app...")
  if (isLoading) {
    return ( <LoadingScreen />)
  }
  return (
    <AppContext.Provider value={setToken}>
      <NavigationContainer>
        { token ? <Athlos /> : <RootStackScreen /> }
      </NavigationContainer>
    </AppContext.Provider>
  );
}

export default App;
