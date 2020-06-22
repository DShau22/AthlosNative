import React, { Component } from 'react';
import { Text, View } from 'react-native';

class LoadingScreen extends Component {
  render() {
    return (
      <View style={styles}>
        <Text>Loading...</Text>
      </View>
    )
  }
}

const styles = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center'
}

export default LoadingScreen
