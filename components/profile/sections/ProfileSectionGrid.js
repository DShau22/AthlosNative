import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { useTheme } from '@react-navigation/native';
import ThemeText from '../../generic/ThemeText';


const ProfileSectionGrid = (props) => {
  const { colors } = useTheme();
  const { gridElements, sectionTitle, onEditPress } = props;

  const renderGrid = () => {
    const result = [];
    for (let i = 0; i < gridElements.length; i+=2) {
      result.push(
        <View style={styles.row} key={i}>
          <View style={styles.gridBox}>
            {gridElements[i].icon}
            <View style={styles.gridTextBox}>
              <ThemeText h4>{gridElements[i].textDisplay}</ThemeText>
              <ThemeText>{gridElements[i].textDisplayTitle}</ThemeText>
            </View>
          </View>
          {i + 1 < gridElements.length ?
            <View style={styles.gridBox}>
              {gridElements[i + 1].icon}
              <View style={styles.gridTextBox}>
                <ThemeText h4>{gridElements[i + 1].textDisplay}</ThemeText>
                <ThemeText>{gridElements[i + 1].textDisplayTitle}</ThemeText>
              </View>
            </View>
            : null
          }
        </View>
      )
    }
    return result;
  }
  
  return (
    <View style={styles.container}>
      <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between'}}>
        <ThemeText style={{
          fontSize: 24,
          marginLeft: 10,
        }}>{sectionTitle}</ThemeText>
        {onEditPress ?
          <Button
            title='Edit'
            containerStyle={{width: '30%', marginRight: '5%'}}
            buttonStyle={{
              backgroundColor: colors.button
            }}
            onPress={() => onEditPress()}
          /> : null
        }
      </View>
      {renderGrid()}
    </View>
  )
}

export default ProfileSectionGrid;
const styles = StyleSheet.create({
  container: {
    // flex: 1,
    marginBottom: 15,
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