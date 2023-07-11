import React from 'react';
import {
    Dimensions,
    Text
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import _ from 'lodash';
import * as Utils from '../../styles'
import { any, string } from 'prop-types';

const { width, height } = Dimensions.get('window');

interface IProps {
  data: any,
  config?: any
}

export const LChart = (props: IProps) => {
    const {
      data,
      config
    } = props;

    return (
        <LineChart
        data={{
            labels: _.map(data, i => i.label),
            datasets: [
              {
                data: _.map(data, i => i.value)
              }
            ]
          }}
          width={width * 0.95} // from react-native
          height={200}
          withShadow={true}
          yAxisLabel="$ "
          yAxisInterval={1} // optional, defaults to 1
          withInnerLines={true}
          withOuterLines={false}
          chartConfig={{
            backgroundGradientFrom: config && config.backgroundColor ? config && config.backgroundColor : Utils.Color.Primary,
            backgroundGradientTo: config && config.backgroundColor ? config && config.backgroundColor : Utils.Color.PrimaryDark,
            decimalPlaces: 0, // optional, defaults to 2dp
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForLabels: {
              fontSize: Utils.UI.normalizeFont(7),
              fontFamily: Utils.Font.Montserrat(600),
              fontWeight: 800
            },
            propsForDots: {
              r: "4",
              strokeWidth: "1",
              stroke: Utils.Color.Secondary
            }
          }}
          bezier
          style={{
            borderRadius: 5,
            marginVertical: 10,
            marginLeft: width * 0.025
          }}
        />
    );
}