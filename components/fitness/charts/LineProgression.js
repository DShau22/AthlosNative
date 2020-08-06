import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-elements';
import { LineChart } from 'react-native-chart-kit'
import { useTheme } from '@react-navigation/native';
import { COLOR_THEMES } from '../../ColorThemes' 
const screenWidth = Dimensions.get("window").width;

const LineProgression = (props) => {
  const { labels, data, activityColor, yAxisInterval, yAxisUnits } = props
  const { colors } = useTheme();
  const chartWidth = Math.max(.9 * screenWidth, data.length / 20 * screenWidth)
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
    color: (opacity = 1) => activityColor, // controls bar colors
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
  const zeroData = {
    labels: [],
    datasets: [{
      data: [0]
    }]
  }
  return (
    <LineChart
      fromZero
      data={data.length === 0 ? zeroData : chartData}
      width={chartWidth}
      height={300}
      withHorizontalLabels={data.length > 0}
      yAxisInterval={yAxisInterval}
      yAxisSuffix={yAxisUnits ? yAxisUnits : ''}
      chartConfig={chartConfig}
      xLabelsOffset={5}
      yLabelsOffset={20}
    />
  )
}

export default LineProgression;
const styles = StyleSheet.create({

})
