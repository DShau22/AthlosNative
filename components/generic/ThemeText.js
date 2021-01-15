import React from 'react';
import { Text } from 'react-native-elements';
import { useTheme } from '@react-navigation/native';

// a resusable component that contains a text comp with the associated theme text color
const ThemeText = (props) => {
  const { colors } = useTheme();
  return (
    <Text
      style={[{color: props.highlight ? colors.textHighlight : colors.textColor}, props.style]} // color goes first so it can be overriden
      h4={props.h4}
      h3={props.h3}
      h2={props.h2}
      h1={props.h1}
    >
      {props.children}
    </Text>
  )
}

export default ThemeText;