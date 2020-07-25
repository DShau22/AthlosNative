import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-elements';
import { UserDataContext, ProfileContext } from '../../../Context';
import { Card, } from 'react-native-paper';
import GLOBAL_CONSTANTS from '../../GlobalConstants'

const ProfileAggregates = (props) => {
  const profileContext = React.useContext(ProfileContext);
  const { totals } = profileContext
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Card style={styles.cardContainerStyle}>
          <Card.Title title="Total Steps Taken" />
          <Card.Content style={styles.cardContentStyle}>
            <Text h3>
              {totals.steps}
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.cardContainerStyle}>
          <Card.Title title="Total Laps Swum" />
          <Card.Content style={styles.cardContentStyle}>
            <Text h3>{totals.laps}</Text>
          </Card.Content>
        </Card>
      </View>
      <View style={styles.row}>
        <Card style={styles.cardContainerStyle}>
          <Card.Title title="Total Jumps" style={styles.cardTitleStyle}/>
          <Card.Content style={styles.cardContentStyle}>
            <Text h3>
              {totals.verticalJumps}
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.cardContainerStyle} onPress={() => setShowSplits(true)}>
          <Card.Title title="Total Calories Burned" style={styles.cardTitleStyle}/>
          <Card.Content style={styles.cardContentStyle}>
            <Text>{totals.calories}</Text>
          </Card.Content>
        </Card>
      </View>
    </View>
  )
}

export default ProfileAggregates;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    // backgroundColor: 'red'
  },
  row: {
    flex: 1,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%'
  },
  cardContainerStyle: {
    width: '40%'
  },
  cardContentStyle: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardTitleStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  }
})