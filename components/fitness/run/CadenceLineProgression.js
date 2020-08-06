import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-elements';
import { LineChart } from 'react-native-chart-kit'
import { useTheme } from '@react-navigation/native';
import { COLOR_THEMES } from '../../ColorThemes' 
const screenWidth = Dimensions.get("window").width;

const CadenceLineProgression = (props) => {
  const { labels, data } = props
  const { colors } = useTheme();
  const chartWidth = Math.max(screenWidth, data.length / 20 * screenWidth)
  const chartData = {
    labels,
    datasets: [
      {
        data,
      }
    ],
  };
  chartConfig={
    // backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    // backgroundGradientFrom: 'white',
    // backgroundGradientFromOpacity: 0,
    backgroundGradientTo: colors.background,
    // backgroundGradientTo: 'white',
    // backgroundGradientToOpacity: 0.5,
    useShadowColorFromDataset: false, // optional
    decimalPlaces: 0, // optional, defaults to 2dp
    color: (opacity = 1) => COLOR_THEMES.RUN_THEME, // controls bar colors
    labelColor: (opacity = 1) => colors.textColor,
    style: {
      borderRadius: 16,
    },
    fillShadowGradientOpacity: .6,
    propsForBackgroundLines: {
      stroke: colors.textColor,
      opacity: .3,
      strokeWidth: '1',
    },
  };
  return (
    <LineChart
      data={chartData}
      width={chartWidth}
      height={300}
      yAxisInterval='5'
      chartConfig={chartConfig}
      xLabelsOffset={5}
      yLabelsOffset={20}
    />
  )
}

export default CadenceLineProgression;
const styles = StyleSheet.create({

})
