import React from 'react';
import {
    Component,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    AsyncStorage,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    FlatList,
    Dimensions,
    Alert
} from 'react-native';

// Modules
import _ from 'lodash';
import moment from 'moment';
import 'moment/locale/es'
moment.locale('es');
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
/*import OneSignal from 'react-native-onesignal';*/
import firebase from 'react-native-firebase';
import {
    LineChart,
    PieChart,
    ProgressChart,
    ContributionGraph,
    StackedBarChart
} from "react-native-chart-kit";

// Components
import HeaderBar from '../components/HeaderBar';
import Balance from '../components/Balance';
import Button from '../components/Button';
import RowTransaction from 'app/src/components/Transactions/RowTransaction';

// Styles
import * as Utils from '../styles'

// Services
import { SetToken } from '../services/BaseService'
import * as Services from 'app/src/services';
import { BChart, LChart } from 'app/src/components';

// Extras
const { width, height } = Dimensions.get('window');
const COLUMN_TABLE_WIDTH = width / 3;
const COLUMNS_TABLE_QTY = 3;
const Banner = firebase.admob.Banner;
const AdRequest = firebase.admob.AdRequest;
const request = new AdRequest();


export default class LastMovementsScreen extends React.Component {

    // Hide header bar
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            transactions: [],
            perCategories: [],
            partialBalance: {},
            filters: {
                date_from: moment(),
                date_to: moment()
            },
            chart: null,
            chartData: null,
            showPerCategories: true
        };
    }

    componentDidMount() {
        //this.getTransactions();
        this.props.screenProps.setLoading(true);
        this.loadFilters();

        Services.AnalyticsService.postEvent({
            type: 'view_last_movements',
            view: 'LastMovementsScreen'
        });
    }

    async loadFilters() {
        this.getTransactions()
        this.getChartInfo();

        // Get periods for line chart
        Services.ChartService.getLineChart({}, (data) => {
            if(data.success) {
                this.setState({
                    chart: {
                        data: data.periods,
                        config: data.config,
                        component: LChart,
                        componentType: 'LChart'
                    }
                });
            } else {
                this.setState({ lineChart: null });
            }
        }, (err) => {
            this.setState({ lineChart: null });
        });
    }

    getTransactions = (filters = {}) => {
        this.props.screenProps.setLoading(true);
        Services.TransactionService.getTransactionsByUserId(Services.UserService.user.id, { filters : filters }, (data) => {
            if(data.success) {

                // Amount per category
                let perCategories = [];
                for(var idx in data.transactions) {
                    const transaction = data.transactions[idx];
                    if(!_.some(perCategories, (e) => e.categoryId == transaction.categories[0].id)) {
                        perCategories.push({
                            categoryId: transaction.categories[0].id,
                            name: transaction.categories[0].name,
                            amount: transaction.amount,
                            transaction_type_id: transaction.categories[0].transaction_type_id
                        });
                    } else {
                        let find = _.find(perCategories, (e) => e.categoryId == transaction.categories[0].id);
                        perCategories[perCategories.indexOf(find)].amount += transaction.amount;
                    }
                }
                perCategories = _.orderBy(perCategories, ['amount'], ['desc'])

                this.setState({
                    transactions: data.transactions,
                    partialBalance: data.balance,
                    chartData: data.chartData,
                    perCategories: perCategories
                });
            }

            this.props.screenProps.setLoading(false);
        }, (err) => {
            // Do nothing
            this.props.screenProps.setLoading(false);
        });
    }

    openFilters = () => {
        this.props.navigation.push('FiltersTransactionsModal', {
            filters: this.state.filters,
            onFilter: (filters) => {
                this.setState({ filters });
                this.getTransactions(filters);
            }
        })
    }

    render() {
        const {
            transactions,
            perCategories,
            partialBalance,
            chartData
        } = this.state;

        return (
            <SafeAreaView style={{ flex : 1 }}>
                <HeaderBar
                    containerStyle={{ paddingTop: 0 }}
                    isBackButton={true}
                    navigation={this.props.navigation}
                    title={Services.LanguageService.string('my_balance')}
                    rightStyle={{ alignItems: 'flex-end', paddingRight: 5 }}
                    rightContent={() => {
                        return (
                            <TouchableOpacity
                                style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 15 }}
                                onPress={this.openFilters}>
                                <Icon
                                    name={'filter'}
                                    size={Utils.UI.normalizeFont(20)}
                                    color={Utils.Color.DarkGray}
                                />
                            </TouchableOpacity>
                        );
                    }}
                />

                { this.state.chart != null &&
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={{ textAlign: 'center', fontFamily: Utils.Font.Montserrat(300), fontSize: Utils.UI.normalizeFont(12) }}>Este gráfico representa tus movimientos con los filtros que tienes seleccionados</Text>

                        <LChart
                            data={this.state.chart.data}
                            config={this.state.chart.config}
                        />

                        {/* <BChart
                            data={this.state.chart.data}
                            config={this.state.chart.config}
                        /> */}
                    </View>
                }

                { this.state.chart != null &&
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={{ textAlign: 'center', fontFamily: Utils.Font.Montserrat(300), fontSize: Utils.UI.normalizeFont(12) }}>Este gráfico te permitirá comprender en qué categorías son en las que más prevalecen tus ingresos y egresos.</Text>
                        <PieChart
                            data={[
                                {
                                  name: "Seoul",
                                  population: 21500000,
                                  color: "rgba(131, 167, 234, 1)",
                                  legendFontColor: "#7F7F7F",
                                  legendFontSize: 15
                                },
                                {
                                  name: "Toronto",
                                  population: 2800000,
                                  color: "#F00",
                                  legendFontColor: "#7F7F7F",
                                  legendFontSize: 15
                                },
                                {
                                  name: "Beijing",
                                  population: 527612,
                                  color: "red",
                                  legendFontColor: "#7F7F7F",
                                  legendFontSize: 15
                                },
                                {
                                  name: "New York",
                                  population: 8538000,
                                  color: "#ffffff",
                                  legendFontColor: "#7F7F7F",
                                  legendFontSize: 15
                                },
                                {
                                  name: "Moscow",
                                  population: 11920000,
                                  color: "rgb(0, 0, 255)",
                                  legendFontColor: "#7F7F7F",
                                  legendFontSize: 15
                                }
                            ]}
                            width={width}
                            height={150}
                            chartConfig={{
                                backgroundColor: "#e26a00",
                                backgroundGradientFrom: "#fb8c00",
                                backgroundGradientTo: "#ffa726",
                                decimalPlaces: 2, // optional, defaults to 2dp
                                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                style: {
                                borderRadius: 16
                                },
                                propsForDots: {
                                r: "6",
                                strokeWidth: "2",
                                stroke: "#ffa726"
                                }
                            }}
                            accessor={"population"}
                            backgroundColor={Utils.Color.SecondaryDark}
                            paddingLeft={"0"}
                            center={[10, 50]}
                            absolute
                        />
                    </View>
                }

                <View
                    style={{ flex: 1, width: '100%', height: '100%', backgroundColor: 'white' }}>
                    {/* <ScrollView
                        style={styles.container}>

                        { !this.state.showPerCategories &&
                            <TouchableOpacity
                                activeOpacity={.9}
                                onPress={() => {
                                    Services.UIService.Animate();
                                    this.setState({ showPerCategories: !this.state.showPerCategories });
                                }}
                                style={{ justifyContent: 'center', flexDirection: 'row', padding: 0 }}>
                                <Text style={{ textAlign: 'center', marginVertical: 0, fontSize: Utils.UI.normalizeFont(13), fontFamily: Utils.Font.Montserrat(600), color: Utils.Color.DarkGray, marginRight: 5 }}>{ Services.LanguageService.string('by_categories') }</Text>
                                <Icon
                                    name={'arrow-down'}
                                    size={Utils.UI.normalizeFont(18)}
                                    color={Utils.Color.DarkGray}
                                />
                            </TouchableOpacity>
                        }

                        { this.state.showPerCategories && this.state.perCategories != null &&
                            <FlatList
                                contentContainerStyle={{ width: COLUMNS_TABLE_QTY * COLUMN_TABLE_WIDTH }}
                                data={perCategories}
                                ListHeaderComponent={() => {
                                    return (
                                        <TouchableOpacity
                                            activeOpacity={.95}
                                            onPress={() => {
                                                Services.UIService.Animate();
                                                this.setState({ showPerCategories: !this.state.showPerCategories });
                                            }}
                                            style={{ justifyContent: 'center', flexDirection: 'column', padding: 0 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                                <Text style={{ textAlign: 'center', marginVertical: 0, fontSize: Utils.UI.normalizeFont(13), fontFamily: Utils.Font.Montserrat(600), color: Utils.Color.DarkGray, marginRight: 5 }}>{ Services.LanguageService.string('by_categories') }</Text>
                                                <Icon
                                                    name={'arrow-up'}
                                                    size={Utils.UI.normalizeFont(18)}
                                                    color={Utils.Color.DarkGray}
                                                />
                                            </View>
                                            <View style={{ justifyContent: 'center', flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={{ width: width / 2, textAlign: 'center', marginVertical: 10, fontFamily: Utils.Font.Montserrat(400), color: '#222' }}>{ Services.LanguageService.string('category') }</Text>
                                                <Text style={{ width: width / 2, textAlign: 'center', marginVertical: 10, fontFamily: Utils.Font.Montserrat(400), color: '#222' }}>Total</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                                renderItem={(rowData) => {
                                    return (
                                        <View style={{ width: width, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 0, backgroundColor: rowData.item.transaction_type_id == 1 ? Utils.Color.Secondary : Utils.Color.PrimaryRed, marginVertical: 1 }}>
                                            <Text style={{ flex: 1, width: '50%', fontFamily: Utils.Font.Montserrat(500), color: 'white', textAlign: 'center', padding: 10 }}>{ rowData.item.name }</Text>
                                            <Text style={{ flex: 1, width: '50%', fontFamily: Utils.Font.Montserrat(500), color: 'white', textAlign: 'center', padding: 10 }}>${ rowData.item.amount }</Text>
                                        </View>
                                    );
                                }}
                            />
                        }

                        { perCategories != null && perCategories.length == 0 &&
                            <View style={{ width: '95%', alignSelf: 'center', backgroundColor: Utils.Color.ErrorRed, padding: 10, marginTop: 10 }}>
                                <Text style={{ fontFamily: Utils.Font.Montserrat(400), fontSize: Utils.UI.normalizeFont(12), textAlign: 'center', color: 'white' }}>{ Services.LanguageService.string('no_results') }</Text>
                            </View>
                        }

                        <FlatList
                            contentContainerStyle={{ width: COLUMNS_TABLE_QTY * COLUMN_TABLE_WIDTH }}
                            data={transactions}
                            ListHeaderComponent={() => {
                                return (
                                    <View style={{ justifyContent: 'center', flexDirection: 'column', padding: 0 }}>
                                        <Text style={{ width: width, textAlign: 'center', marginVertical: 15, fontSize: Utils.UI.normalizeFont(13), fontFamily: Utils.Font.Montserrat(600), color: Utils.Color.DarkGray }}>{ Services.LanguageService.string('by_transactions') }</Text>
                                        <View style={{ justifyContent: 'center', flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={{ width: COLUMN_TABLE_WIDTH, textAlign: 'center', marginVertical: 10, fontFamily: Utils.Font.Montserrat(400), color: '#222' }}>{ Services.LanguageService.string('amount') }</Text>
                                            <Text style={{ width: COLUMN_TABLE_WIDTH, textAlign: 'center', marginVertical: 10, fontFamily: Utils.Font.Montserrat(400), color: '#222' }}>{ Services.LanguageService.string('category') }</Text>
                                            <Text style={{ width: COLUMN_TABLE_WIDTH, textAlign: 'center', marginVertical: 10, fontFamily: Utils.Font.Montserrat(400), color: '#222' }}>{ Services.LanguageService.string('modified') }</Text>
                                        </View>
                                    </View>
                                );
                            }}
                            renderItem={(rowData) => {
                                return (
                                    <RowTransaction
                                        transaction={rowData.item}
                                        onPress={() => {
                                            this.props.navigation.push('TransactionDetailsModal', {
                                                transaction: rowData.item,
                                                onReload: () => { this.getTransactions(this.state.filters) },
                                                onDelete: (transaction) => {
                                                    this.props.screenProps.showInteractableAlertWithButtons(Services.LanguageService.string('delete'), Services.LanguageService.string('ask_delete_transaction'), [
                                                        {
                                                            id: 1,
                                                            text: 'Confirmar',
                                                            onPress: () => {
                                                                this.props.screenProps.hideInteractableAlert()

                                                                this.props.screenProps.setLoading(true);
                                                                Services.TransactionService.removeById(transaction.id, (data) => {
                                                                    if(data.success) {
                                                                        this.getTransactions(this.state.filters);
                                                                    }

                                                                    this.props.screenProps.setLoading(false);
                                                                    this.props.navigation.pop();

                                                                    Services.AnalyticsService.postEvent({
                                                                        type: 'deleted_transaction',
                                                                        view: 'TransactionDetailsModal'
                                                                    });
                                                                }, (err) => {
                                                                    this.getTransactions(this.state.filters)

                                                                    this.props.screenProps.setLoading(false);
                                                                    this.props.navigation.pop();
                                                                });
                                                            }
                                                        }
                                                    ], {
                                                        vibrate : true,
                                                        shadowBackgroundImage: require('app/src/assets/images/illustrations/delete.png'),
                                                        shadowBackgroundColor: 'white'
                                                    });
                                                }
                                            });
                                        }}
                                    />
                                );
                            }}
                        />

                        { transactions != null && transactions.length == 0 &&
                            <View style={{ width: '95%', alignSelf: 'center', backgroundColor: Utils.Color.ErrorRed, padding: 10, marginTop: 10 }}>
                                <Text style={{ fontFamily: Utils.Font.Montserrat(400), fontSize: Utils.UI.normalizeFont(12), textAlign: 'center', color: 'white' }}>{ Services.LanguageService.string('no_results') }</Text>
                            </View>
                        }
                    </ScrollView> */}

                    <View
                        style={{ width: '100%', backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', paddingVertical: 10 }}>
                        <Banner
                            style={{ top: 0, left: 0, marginBottom: 10 }}
                            size={"MINI_BANNER"}
                            unitId={Services.AdsService.getBannerIdentifier('last_movements')}
                            request={request.build()}
                            onAdLoaded={() => {
                                // Do nothing
                            }}
                        />
                    </View>
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    sectionLogo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    sectionButtons: {
        flex: 0,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 20
    },
    logo: {
        maxWidth: '40%',
        resizeMode: 'contain'
    },
    button: {
        width: '75%',
        alignSelf: 'center',
        marginBottom: 10,
        padding: 15,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    button1: {
        backgroundColor: '#efc75e'
    },
    button2: {
        backgroundColor: 'white'
    },
    text: {
        fontFamily: Utils.Font.Montserrat(700),
        fontSize: 20,
        color: 'white'
    }
});