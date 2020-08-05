import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-elements';
import { PieChart, LineChart, Grid } from 'react-native-svg-charts'
// import {
//   PieChart
// } from "react-native-chart-kit";

const RunDonut = (props) => {
  const { data, labels, colors } = props;
  const pieData = data.map((value, index) => ({
    value,
    svg: {
      fill: colors[index],
      onPress: () => console.log('press', index),
    },
    key: `pie-${index}-${value}`,
  }))
  const Labels = ({ slices, height, width }) => {
    return slices.map((slice, index) => {
        const { labelCentroid, pieCentroid, data } = slice;
        return (
            <Text
                key={index}
                x={pieCentroid[ 0 ]}
                y={pieCentroid[ 1 ]}
                fill={'white'}
                textAnchor={'middle'}
                alignmentBaseline={'middle'}
                fontSize={24}
                stroke={'black'}
                strokeWidth={0.2}
            >
                {data.amount}
            </Text>
        )
    })
  }
  return (
    <PieChart
      style={[props.style, styles.chart]}
      valueAccessor={({item}) => item.value}
      data={pieData}
    />

  )
}

const styles = StyleSheet.create({
  chart: {
  }
})
export default RunDonut;
