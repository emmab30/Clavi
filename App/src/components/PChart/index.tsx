import React from 'react';
import {
    Dimensions,
    Text
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import _ from 'lodash';
import * as Utils from '../../styles'
import { any, string } from 'prop-types';

const { width, height } = Dimensions.get('window');

interface IProps {
  categories: any,
  config?: any
}

export const PChart = (props: IProps) => {
    let {
      categories,
      config
    } = props;

    let data = _.map(categories, i => {
        return {
            name: `${i.categoryType} - ${i.name}`,
            amount: i.amount,
            color: Utils.Color.setAlpha(i.categoryColor, 1),
        }
    })

    return (
        <PieChart
            data={data}
            width={width * 0.4} // from react-native
            height={150}
            chartConfig={{
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
            accessor={"amount"}
            backgroundColor={"transparent"}
            center={[width * .1, 0]}
            absolute
            style={{
                
            }}
            hasLegend={false}
        />
    );
}