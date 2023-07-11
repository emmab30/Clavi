import React from 'react';
import {
    Component,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    AsyncStorage,
    Dimensions
} from 'react-native';

// Modules
/*import OneSignal from 'react-native-onesignal';*/
import * as Animatable from 'react-native-animatable';
import LottieView from 'lottie-react-native';
import {
    LineChart,
    BarChart,
    PieChart,
    ProgressChart,
    ContributionGraph,
    StackedBarChart
} from 'react-native-chart-kit'

// Styles
import * as Utils from '../styles'

// Services
import * as Services from '../services';
import { SetToken } from '../services/BaseService'
import CurrencyService from '../services/CurrencyService'
import InteractableAlert from './InteractableAlert';

const { width, height } = Dimensions.get('window');

export default class Balance extends React.Component {

    // Hide header bar
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        const {
            income,
            outcome,
            balance,
            type
        } = this.props;

        if(type == 'lineChart'){
            return this.renderLineChart();
        } else if(type == 'pieChart') {
            return this.renderPieChart();
        }

        const totalIncomeOutcome = parseFloat(income) + parseFloat(outcome);
        if(totalIncomeOutcome == 0 || isNaN(totalIncomeOutcome))
            return null;

        const widthIncome = (income * 100) / totalIncomeOutcome;
        const widthOutcome = (outcome * 100) / totalIncomeOutcome;

        return (
            <View style={{ width: '100%', flexDirection: 'row', backgroundColor: 'white', flexDirection: 'row' }}>
                <View style={{ width : (width * widthIncome) / 100, backgroundColor: Utils.Color.Secondary, height: 50, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontFamily: Utils.Font.Montserrat(600), fontSize: Utils.UI.normalizeFont(11), color: 'white' }}>{widthIncome.toFixed(2)}%</Text>
                </View>
                <View style={{ width : (width * widthOutcome) / 100, backgroundColor: Utils.Color.PrimaryRed, height: 50, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontFamily: Utils.Font.Montserrat(600), fontSize: Utils.UI.normalizeFont(11), color: 'white' }}>{widthOutcome.toFixed(2)}%</Text>
                </View>
            </View>
        );
    }

    renderLineChart() {
        const {
            income,
            outcome,
            balance,
            type
        } = this.props;

        if(!balance)
            return null;

        const chartConfig = {
            backgroundGradientFrom: "#ffffff",
            backgroundGradientFromOpacity: 0,
            backgroundGradientTo: "#ffffff",
            backgroundGradientToOpacity: 0,
            color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
            strokeWidth: 0, // optional, default 3
            barPercentage: 0.5
        };

        const data = {
            data: [0.4, 0.6, 0.8]
        }

        return (
            <View style={styles.container}>
                <ProgressChart
                    data={data}
                    width={width * .5}
                    height={120}
                    chartConfig={chartConfig}
                    hasLegend={false}
                    backgroundColor="transparent"
                    paddingLeft={width * .1}
                />
                <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: width * .7, paddingRight: width * .05 }}>
                    <Text style={{ fontFamily: Utils.Font.Montserrat(600), color: Utils.Color.SuccessGreen, fontSize: Utils.UI.normalizeFont(20) }}>{ CurrencyService.formatCurrency(income) }</Text>
                    <Text style={{ fontFamily: Utils.Font.Montserrat(600), color: Utils.Color.ErrorRed, fontSize: Utils.UI.normalizeFont(20) }}>{ CurrencyService.formatCurrency(outcome) }</Text>
                </View>
            </View>
        );
    }

    renderPieChart() {

        const {
            income,
            outcome,
            balance,
            type
        } = this.props;

        if(!balance)
            return null;

        const chartConfig = {
            backgroundGradientFrom: "#ffffff",
            backgroundGradientFromOpacity: 0,
            backgroundGradientTo: "#ffffff",
            backgroundGradientToOpacity: 0,
            color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
            strokeWidth: 0, // optional, default 3
            barPercentage: 0.5
        };

        const data = [{
            name: "Tus gastos",
            amount: outcome,
            color: Utils.Color.PrimaryRed
        },
        {
            name: "Tus ingresos",
            amount: income,
            color: Utils.Color.Secondary
        }];

        const finalBalance = parseFloat(income) - parseFloat(outcome);

        return (
            <View style={{ flexDirection: 'column', width: '100%' }}>
                <View style={styles.container}>
                    <PieChart
                        data={data}
                        width={width * .4}
                        height={100}
                        chartConfig={chartConfig}
                        hasLegend={false}
                        accessor="amount"
                        backgroundColor="transparent"
                        paddingLeft={width * .1}
                    />
                    <View style={{ flex: 0, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: width * .6, paddingRight: width * .05 }}>
                        <Text style={{ fontFamily: Utils.Font.Montserrat(600), color: Utils.Color.Secondary, fontSize: Utils.UI.normalizeFont(18) }}>{ CurrencyService.formatCurrency(income) }</Text>
                        <Text style={{ fontFamily: Utils.Font.Montserrat(600), color: Utils.Color.PrimaryRed, fontSize: Utils.UI.normalizeFont(18) }}>{ CurrencyService.formatCurrency(outcome) }</Text>

                        <View style={{ width: '100%', height: 2, marginVertical: 5, backgroundColor: Utils.Color.LightGray }}></View>
                        { finalBalance > 0 ?
                            <Text style={{ fontFamily: Utils.Font.Montserrat(600), color: Utils.Color.SuccessGreen, fontSize: Utils.UI.normalizeFont(18) }}>+ { CurrencyService.formatCurrency(parseFloat(income) - parseFloat(outcome)) }</Text>
                        :
                            <Text style={{ fontFamily: Utils.Font.Montserrat(600), color: Utils.Color.PrimaryRed, fontSize: Utils.UI.normalizeFont(18) }}>{ CurrencyService.formatCurrency(parseFloat(income) - parseFloat(outcome)) }</Text>
                        }
                    </View>
                </View>

                <View style={{ width: '100%', padding: 10 }}>
                    { finalBalance > 0 ?
                        <View style={{ backgroundColor: Utils.Color.SuccessGreen, borderRadius: 2 }}>
                            <Text style={{ fontFamily: Utils.Font.Montserrat(700), color: '#777', fontSize: Utils.UI.normalizeFont(12), paddingHorizontal: 5, paddingVertical: 5, color: 'white', textAlign: 'center' }}>{ Services.LanguageService.string('HomeScreen.positive_balance_text') }</Text>
                        </View>
                    :
                        <View style={{ backgroundColor: Utils.Color.ErrorRed, borderRadius: 2 }}>
                            <Text style={{ fontFamily: Utils.Font.Montserrat(700), color: 'white', fontSize: Utils.UI.normalizeFont(12), paddingHorizontal: 5, paddingVertical: 5, color: 'white', textAlign: 'center' }}>{ Services.LanguageService.string('HomeScreen.negative_balance_text') }</Text>
                        </View>
                    }
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 0,
        flexDirection: 'row',
        backgroundColor: 'white'
    },
    box: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    bold: {
        fontFamily: Utils.Font.Montserrat(600)
    },
    big: {
        fontSize: Utils.UI.normalizeFont(14)
    }
});