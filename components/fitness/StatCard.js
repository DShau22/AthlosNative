import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-elements';
import { useTheme } from '@react-navigation/native';
import { Card } from 'react-native-paper'
import ThemeText from '../generic/ThemeText'

const StatCard = (props) => {
  const { imageUri, label, stat } = props;
  return (
    <Card style={styles.cardContainer}>
      <Card.Content style={styles.cardContent}>
        <Image
          style={{width: 35, height: 35, borderRadius: 70}}
          source={{
            uri: imageUri,
          }}
        />
        <View style={{marginLeft: 40}}>
          <ThemeText >{label}</ThemeText>
          <ThemeText style={{marginTop: 5}}>{stat}</ThemeText>
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
    borderRadius: 15,
    marginTop: 20,
  },
  cardContent: {
    flexDirection: 'row',
    marginTop: 5,
    // alignItems: 'center',
    // justifyContent: 'center',
  }
})