import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { PieChart, LineChart, Grid } from 'react-native-svg-charts'
import { Text } from 'react-native-svg'
import ThemeText from '../../generic/ThemeText'
// import {
//   PieChart
// } from "react-native-chart-kit";

const RunDonut = (props) => {
  const { data, labels, colors } = props;
  const [slicePressed, setSlicePressed] = React.useState(null);
  const indexToActivity = {0: 'Running', 1: 'Walking', 2: 'Resting'}
  const pieData = data.map((value, index) => ({
    value,
    activity: 'Running',
    svg: {
      fill: colors[index],
      onPress: () => setSlicePressed(index === slicePressed ? null : index),
    },
    key: `pie-${index}-${value}`,
    arc: { outerRadius: index === slicePressed ? '90%' : '80%', cornerRadius: 0 }
  }))
  const Labels = ({ slices, height, width }) => {
    return slices.map((slice, index) => {
      const { labelCentroid, pieCentroid, data } = slice;
      return (
        <Text
          key={index}
          x={pieCentroid[ 0 ]}
          y={pieCentroid[ 1 ]}
          fill={'black'}
          textAnchor={'middle'}
          alignmentBaseline={'middle'}
          fontSize={24}
          stroke={'black'}
          strokeWidth={0.2}
        >
          {index === slicePressed ? `${data.value}% ${indexToActivity[index]}` : ''}
        </Text>
      )
    })
  }
  return (
    <PieChart
      style={[props.style]}
      valueAccessor={({item}) => item.value}
      data={pieData}
      spacing={0}
      innerRadius='35%'
    >
      <Labels />
    </PieChart>
  )
}

const styles = StyleSheet.create({

})
export default RunDonut;
