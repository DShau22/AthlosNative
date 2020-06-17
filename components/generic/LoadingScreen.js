import React, { Component } from 'react';
import { Text, View } from 'react-native';

class LoadingScreen extends Component {
  render() {
    return (
      <View className="loading-screen">
        <Text>Loading...</Text>
      </View>
    )
  }
}

export default LoadingScreen
