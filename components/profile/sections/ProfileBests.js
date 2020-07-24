import React from 'react';
import { View, Image, StyleSheet, FlatList } from 'react-native';
import { Text, Button } from 'react-native-elements';
import { UserDataContext } from '../../../Context';
import { Card, } from 'react-native-paper';
import GLOBAL_CONSTANTS from '../../GlobalConstants'
import { inchesToCm } from '../../utils/unitConverter'
// popup stuff for tapping on cards
import Modal, {
  ModalContent,
  ModalTitle,
  SlideAnimation,
} from 'react-native-modals';

const { METRIC, ENGLISH } = GLOBAL_CONSTANTS

const ProfileBests = (props) => {
  const { highestJump, mostLaps, mostSteps, bestEvent } = props
  const userDataContext = React.useContext(UserDataContext);
  const [showSplits, setShowSplits] = React.useState(false);
  const unitSystem = userDataContext.settings.unitSystem.toLowerCase()

  const inchesOrCm = unitSystem === METRIC ? 'cm' : 'in'
  const jumpDisplay = unitSystem === METRIC ? inchesToCm(highestJump) : highestJump
  const eventTitle = `${bestEvent.distance}${bestEvent.metric} ${bestEvent.stroke}`
  const renderSplits = () => {
    return bestEvent.splits.map((time, idx) => {
      return {lap: idx+1, time}
    })
  }
  
  const SplitItem = ({ lap, time }) => (
    <View style={{flexDirection: 'row'}}>
      <View style={{flex: 1}}>
        <Text h3>{lap}</Text>
      </View>
      <View style={{flex: 5, justifyContent: 'center', alignItems: 'center'}}>
        <Text h4>{time}</Text>
      </View>
    </View>
  )
  console.log(unitSystem)
  
  return (
    <View style={styles.container}>
      <Modal
        visible={showSplits}
        onTouchOutside={() => setShowSplits(false)}
        modalAnimation={new SlideAnimation({
          slideFrom: 'bottom',
        })}
        modalTitle={
          <ModalTitle
            title={eventTitle}
            align="center"
          />
        }
        width={.9}
      >
        <ModalContent>
          <FlatList 
            data={renderSplits()}
            keyExtractor={item => item.lap}
            renderItem={({ item }) => (
              <SplitItem lap={item.lap} time={item.time}/>
            )}
          />
        </ModalContent>
      </Modal>
      <View style={styles.row}>
        <Card style={styles.cardContainerStyle}>
          <Card.Title title="Highest Jump" />
          <Card.Content style={styles.cardContentStyle}>
            <Text h3>
              {`${jumpDisplay} ${inchesOrCm}`}
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.cardContainerStyle}>
          <Card.Title title="Most Steps" />
          <Card.Content style={styles.cardContentStyle}>
            <Text h3>{mostSteps}</Text>
          </Card.Content>
        </Card>
      </View>
      <View style={styles.row}>
        <Card style={styles.cardContainerStyle}>
          <Card.Title title="Most Laps" style={styles.cardTitleStyle}/>
          <Card.Content style={styles.cardContentStyle}>
            <Text h3>
              {`${mostLaps}`}
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.cardContainerStyle} onPress={() => setShowSplits(true)}>
          <Card.Title title="Best Event" style={styles.cardTitleStyle}/>
          <Card.Content style={styles.cardContentStyle}>
            <Text>{eventTitle}</Text>
            <Text>{bestEvent.time}</Text>
          </Card.Content>
        </Card>
      </View>
    </View>
  )
}

export default ProfileBests;
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