import React from 'react'
import { View, StyleSheet, SectionList } from 'react-native'
import { Button, Text, ListItem } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';

const ActionButton = (props) => {
  const {
    initialTitle,
  } = props;

  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <Button
      title={initialTitle}
      loading={isLoading}
      // linearGradientProps={{
      //   colors: ['red', 'pink'],
      //   start: { x: 0, y: 0.5 },
      //   end: { x: 1, y: 0.5 },
      // }}
      onPress={() => {
        props.onPress(setIsLoading)
      }}
    />
  )
}
const styles = StyleSheet.create({

})
export default ActionButton
