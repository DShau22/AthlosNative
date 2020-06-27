import React from 'react'
import { View, StyleSheet, SectionList } from 'react-native'
import { Button, Text, ListItem } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';

const ActionButton = (props) => {
  const [pressed, setPressed] = React.useState(false);
  const {
    title,
    afterPressTitle,
    onPress,
  } = props;
  return (
    <Button
      title={pressed ? afterPressTitle : title}
      type={pressed ? 'outline' : 'solid'}
      // linearGradientProps={{
      //   colors: ['red', 'pink'],
      //   start: { x: 0, y: 0.5 },
      //   end: { x: 1, y: 0.5 },
      // }}
      onPress={() => {
        setPressed(!pressed);
        onPress()
      }}
    />
  )
}
const styles = StyleSheet.create({

})
export default ActionButton
