import React from 'react'
import { View, StyleSheet, SectionList } from 'react-native'
import { Button, Text, ListItem } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';

const ActionButton = (props) => {
  const {
    initialTitle,
    onPress,
  } = props;
  const [buttonText, setButtonText] = React.useState(initialTitle);
  // change the outline only when fetch action is complete
  const [isLoading, setIsLoading] = React.useState(false);
  // when true, can't press the button anymore. This means the fetch
  // executed successfully
  const [actionSuccess, setActionSuccess] = React.useState(false);
  return (
    <Button
      title={buttonText}
      type={actionSuccess ? 'outline' : 'solid'}
      disabled={actionSuccess}
      loading={isLoading}
      // linearGradientProps={{
      //   colors: ['red', 'pink'],
      //   start: { x: 0, y: 0.5 },
      //   end: { x: 1, y: 0.5 },
      // }}
      onPress={() => {
        onPress(setButtonText, setActionSuccess, setIsLoading);
      }}
    />
  )
}
const styles = StyleSheet.create({

})
export default ActionButton
