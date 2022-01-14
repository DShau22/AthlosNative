import React from 'react';
import { View, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-elements';
import { useTheme } from '@react-navigation/native';
import ThemeText from '../../generic/ThemeText';
import LineProgression from './LineProgression';
import { COLOR_THEMES } from '../../ColorThemes';

interface FineDataDisplayProps {
  route: any,
  navigation: any,
  backNavScreen: string,
  title: string,
  lineColor: string,
};

const FineDataDisplay: React.FC<FineDataDisplayProps> = ({ route, navigation, backNavScreen, title, lineColor }) => {
  const { progressionData, progressionLabels } = route.params;
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={{alignItems: 'center', marginBottom: 25}}>
        <ThemeText h4>{title}</ThemeText>
          <ScrollView
            horizontal
            style={{marginTop: 20}}
            contentContainerStyle={[styles.sideScrollContent, {marginLeft: progressionData.length === 0 ? -20 : 0}]}
          >
          <LineProgression
            activityColor={lineColor}
            yAxisInterval={5}
            data={progressionData}
            labels={progressionLabels}
          />
        </ScrollView>
      </View>
      <TouchableOpacity
        style={{
          alignItems: "center",
          alignSelf: 'center',
          width: '90%',
          borderRadius: 10,
          backgroundColor: colors.backgroundOffset,
          padding: 10,
        }}
        onPress={() => {navigation.navigate(backNavScreen)}}
      >
        <ThemeText>Back</ThemeText>
      </TouchableOpacity>
    </View>
  )
}

export default FineDataDisplay;
const styles = StyleSheet.create({
  sideScrollContent: {
    alignItems:'center',
  },

  container: {
    width: '100%',
    // backgroundColor: 'red',
    marginTop: 25
  },
});