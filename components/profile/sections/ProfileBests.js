import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Divider } from 'react-native-elements';
import { UserDataContext, ProfileContext } from '../../../Context';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
Icon.loadFont();

import GLOBAL_CONSTANTS from '../../GlobalConstants'
import { inchesToCm } from '../../utils/unitConverter'
import ThemeText from '../../generic/ThemeText'
// popup stuff for tapping on cards
import Modal, {
  ModalContent,
  ModalTitle,
  SlideAnimation,
} from 'react-native-modals';
import { TouchableOpacity } from 'react-native-gesture-handler';

const { METRIC, ENGLISH } = GLOBAL_CONSTANTS

const ProfileBests = (props) => {
  // const { highestJump, mostLaps, mostSteps, bestEvent } = props
  const userDataContext = React.useContext(UserDataContext);
  const profileContext = React.useContext(ProfileContext);
  const { highestJump, mostLaps, mostSteps, bestEvent } = profileContext.bests
  const [showSplits, setShowSplits] = React.useState(false);
  const unitSystem = userDataContext.settings.unitSystem.toLowerCase()

  const inchesOrCm = unitSystem === METRIC ? 'cm' : 'in'
  const jumpDisplay = unitSystem === METRIC ? inchesToCm(highestJump) : highestJump
  const eventTitle = `${bestEvent.distance}${bestEvent.metric} ${bestEvent.stroke}`

  const { colors } = useTheme();
  const renderSplits = () => {
    return bestEvent.splits.map((time, idx) => {
      return {lap: idx+1, time}
    })
  }
  
  const SplitItem = ({ lap, time }) => (
    <View style={{flexDirection: 'row'}}>
      <View style={{flex: 1}}>
        <ThemeText h3>{lap}</ThemeText>
      </View>
      <View style={{flex: 5, justifyContent: 'center', alignItems: 'center'}}>
        <ThemeText h4>{time}</ThemeText>
      </View>
    </View>
  )
  
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
      {/* <Divider style={styles.divider}/> */}
      <View style={styles.row}>
        <View style={styles.gridBox}>
          <Icon name='long-arrow-up' size={30} color={colors.textColor}/>
          <View style={styles.gridTextBox}>
            <ThemeText h4>{`${jumpDisplay} ${inchesOrCm}`}</ThemeText>
            <ThemeText>Highest Jump</ThemeText>
          </View>
        </View>
        <View style={styles.gridBox}>
          <Icon name='long-arrow-up' size={30} color={colors.textColor}/>
          <View style={styles.gridTextBox}>
            <ThemeText h4>{mostSteps}</ThemeText>
            <ThemeText>Most Steps</ThemeText>
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.gridBox}>
          <Icon name='long-arrow-up' size={30} color={colors.textColor}/>
          <View style={styles.gridTextBox}>
            <ThemeText h4>{mostLaps}</ThemeText>
            <ThemeText>Most Laps</ThemeText>
          </View>
        </View>
        <View style={styles.gridBox}>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center'}}
            onPress={() => setShowSplits(true)}
          >
            <Icon name='long-arrow-up' size={30} color={colors.textColor}/>
            <View style={styles.gridTextBox}>
              <ThemeText h4>{bestEvent.time}</ThemeText>
              <ThemeText>{eventTitle}</ThemeText>
            </View>
          </TouchableOpacity>
        </View>
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
  divider: {
    marginLeft: 8,
    marginRight: 8,
  },
  row: {
    flex: 1,
    marginTop: 20,
    flexDirection: 'row',
    // justifyContent: 'space-around',
    width: '100%'
  },
  gridBox: {
    marginLeft: 30,
    flex: 1,
    // backgroundColor: 'blue',
    flexDirection: 'row',
    // justifyContent: 'center',
    alignItems: 'center'
  },
  gridTextBox: {
    justifyContent: 'center',
    marginLeft: 10
    // alignItems: 'center'
  },
})