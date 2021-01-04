import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text, Button, colors } from 'react-native-elements';
import { useTheme } from '@react-navigation/native';
import { Card } from 'react-native-paper'
import ThemeText from '../generic/ThemeText'

const StatCard = (props) => {
  const { imageUri, label, stat } = props;
  const { colors } = useTheme();
  return (
    <Card style={[styles.cardContainer, {backgroundColor: colors.cardBackground}, props.style]}>
      <Card.Content style={styles.cardContent}>
        <Image
          style={{width: 35, height: 35, borderRadius: 70}}
          source={{
            uri: imageUri,
          }}
        />
        <View style={{marginLeft: 40}}>
          <ThemeText {...props.labelProps}>{label}</ThemeText>
          <ThemeText {...props.statProps} style={{marginTop: 5}}>{stat}</ThemeText>
        </View>
      </Card.Content>
    </Card>
  )
}

export default StatCard;
const styles = StyleSheet.create({
  cardContainer: {
    width: '90%',
    // height: 80,
    borderRadius: 10,
    marginTop: 20,
    elevation: 4,
  },
  cardContent: {
    flexDirection: 'row',
    marginTop: 5,
    alignItems: 'center',
    // justifyContent: 'center',
  }
})