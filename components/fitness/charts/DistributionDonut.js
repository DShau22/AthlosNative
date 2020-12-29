import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { PieChart, LineChart, Grid } from 'react-native-svg-charts';
import { Text as SvgText } from 'react-native-svg';
import ThemeText from '../../generic/ThemeText';
import { useTheme } from '@react-navigation/native';

const DistributionDonut = (props) => {
  // data should be just a simple array of values
  const { data, indexToLabel, colors, activity, labelUnit } = props;
  const [slicePressed, setSlicePressed] = React.useState(null);
  const themeColors = useTheme().colors;
  const pieData = data.map((value, index) => ({
    value,
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
        <SvgText
          key={index}
          x={pieCentroid[ 0 ]}
          y={pieCentroid[ 1 ]}
          fill={themeColors.textColor}
          textAnchor={'middle'}
          alignmentBaseline={'middle'}
          fontSize={24}
          stroke={themeColors.textColor}
          strokeWidth={0.2}
        >
          {index === slicePressed ? `${data.value}${labelUnit} ${indexToLabel[index]}` : ''}
        </SvgText>
      )
    })
  }
  if (data.length === 0) {
    const noData = [{
      key: ":(",
      value: 1,
      svg: {
        fill: '#e5e5e5'
      }
    }]
    return (
      <>
        <View style={{alignItems: 'center', marginTop: 20, marginBottom: 20}}>
          <ThemeText>{`Looks like you didn't ${activity} this day`}</ThemeText>
        </View>
        <PieChart
          style={props.style}
          data={noData}
          spacing={0}
          innerRadius='35%'
          outerRadius='80%'
        />
      </>
    )
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

export default DistributionDonut;