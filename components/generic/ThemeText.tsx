import React from 'react';
import { Text } from 'react-native-elements';
import { useTheme } from '@react-navigation/native';

// a resusable component that contains a text comp with the associated theme text color
interface SyncProgressCircleProps {
  style?: any,
  h4?: boolean,
  h3?: boolean,
  h2?: boolean,
  h1?: boolean,
  highlight?: boolean,
  bold?: boolean
};

const ThemeText: React.FC<SyncProgressCircleProps> = (props) => {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        {
          color: props.highlight ? colors.textHighlight : colors.textColor,
          fontWeight: props.bold ? 'bold' : 'normal'
        },
        props.style
      ]} // color goes first so it can be overriden
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