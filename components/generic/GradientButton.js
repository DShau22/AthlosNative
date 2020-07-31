import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '@react-navigation/native';

const GradientButton = (props) => {
  const { onPress, buttonText } = props;
  const { colors } = useTheme(); 
  return (
    <TouchableOpacity
      style={styles.buttonContainer}
      onPress={onPress}
    >
      <LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        colors={[colors.gradientLeft, colors.gradientMiddle, colors.gradientRight]}
        style={styles.button}
      >
        <Text style={{color: colors.textButtonColor, fontSize: 25}}>{buttonText}</Text>
      </LinearGradient>
    </TouchableOpacity>
  )
}

export default GradientButton;
const styles = StyleSheet.create({
  buttonContainer: {
    margin: 15,
  },
  button: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 25,
    paddingRight: 25,
  },
})