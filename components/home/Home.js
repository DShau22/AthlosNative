import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { UserDataContext } from "../../Context"
import { useFocusEffect } from '@react-navigation/native';

const Home = (props) => {
  const context = React.useContext(UserDataContext);
  useFocusEffect(
    React.useCallback(() => {
      context.renderHeaderText("Home")
    }, [])
  );
  return (
    <View style={styles.container}>
      <Text>Welcome, {context.firstName}</Text>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    alignItems: 'center',
    color: 'white',
    justifyContent: 'center',
  }
});
export default Home

