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
import { PChart, BChart, LChart } from 'app/src/components';
import RowTransactionCard from 'app/src/components/Transactions/RowTransactionCard';

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
                date_from: moment().subtract(1, 'year'),
                date_to: moment()
            },
            chart: null,
            chartData: null,
            showPerCategories: true
        };

        // Refs
        this.scrollViewCharts = null;
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
        this.getTransactions(this.state.filters)
        this.getChartInfo(this.state.filters);
    }

    getChartInfo = (filters = {}) => {
        // Get periods for line chart
        Services.ChartService.getLineChart({ filters }, (data) => {
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
                            categoryColor: transaction.categories[0].color_hex,
                            categoryType: transaction.categories[0].transaction_type_id == 1 ? 'Ingresos' : 'Gastos',
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
                this.getChartInfo(filters);
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
                                style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end', paddingLeft: 10 }}
                                onPress={this.openFilters}>
                                <Icon
                                    name={'filter-variant'}
                                    size={Utils.UI.normalizeFont(18)}
                                    color={Utils.Color.DarkGray}
                                />
                            </TouchableOpacity>
                        );
                    }}
                />

                <View
                    style={{ flex: 1, width: '100%', height: '100%', backgroundColor: 'white' }}>

                    <ScrollView
                        style={styles.container}
                        contentContainerStyle={{ paddingBottom: 25 }}>

                        { this.state.filters &&
                            <View style={[{ flex: 0, flexDirection: 'row', backgroundColor: Utils.Color.setAlpha(Utils.Color.Secondary, .3), borderRadius: 0, padding: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'rgba(0,0,0,0.025)', marginBottom: 10 }, Utils.Styles.Shadowed]}>
                                <Icon
                                    name={'filter'}
                                    size={Utils.UI.normalizeFont(16)}
                                    color={Utils.Color.SecondaryDark}
                                />
                                <View style={{ flexDirection: 'column', justifyContent: 'center', paddingLeft: 10, paddingRight: 10 }}>
                                    <Text style={{ marginBottom: 5, fontFamily: Utils.Font.Montserrat(800), color: Utils.Color.SecondaryDark, fontSize: Utils.UI.normalizeFont(11) }}>Filtros:</Text>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <FilterChip
                                            text={`${this.state.filters.date_from.format('DD, MMM [de] YYYY')} a ${this.state.filters.date_to.format('DD, MMM [de] YYYY')}`}
                                            onPress={() => {
                                                this.openFilters()
                                            }}
                                        />

                                        <FilterChip
                                            removable={this.state.filters.transaction_type_id == 1 || this.state.filters.transaction_type_id == 2}
                                            text={!this.state.filters.transaction_type_id ? 'Ingresos & Gastos' : (this.state.filters.transaction_type_id == 1 ? 'Ingresos' : 'Gastos')}
                                            onPress={() => {
                                                if(this.state.filters.transaction_type_id >= 1) {
                                                    let filters = this.state.filters;

                                                    delete filters.transaction_type_id;
                                                    delete filters.categories;
                                                    this.setState({ filters }, this.loadFilters);
                                                } else {
                                                    this.openFilters()
                                                }
                                            }}
                                        />
                                    </View>
                                    {/* <Text style={{ marginLeft: 10, fontFamily: Utils.Font.Montserrat(600), color: Utils.Color.SecondaryDark, fontSize: Utils.UI.normalizeFont(12) }}>{ this.state.filters.date_from.format('DD, MMM [de] YYYY') } <Text style={{ fontFamily: Utils.Font.Montserrat(300)}}>-</Text> { this.state.filters.date_to.format('DD, MMM [de] YYYY') }</Text> */}
                                </View>
                            </View>
                        }

                        { this.state.chart != null &&
                            <View style={{ flexDirection: 'column' }}>
                                <Text style={{ textAlign: 'center', marginVertical: 0, fontSize: Utils.UI.normalizeFont(15), marginTop: 0, marginBottom: 10, fontFamily: Utils.Font.Montserrat(600), color: Utils.Color.DarkGray, marginRight: 5 }}>Gráficos</Text>
                                <Text style={{ textAlign: 'center', fontFamily: Utils.Font.Montserrat(300), fontSize: Utils.UI.normalizeFont(12) }}>Este gráficos representan tus movimientos con los filtros que tienes seleccionados</Text>

                                <ScrollView
                                    ref={(e) => { this.scrollViewCharts = e; }}
                                    contentContainerStyle={{ width : width * 2 }}
                                    pagingEnabled={true}
                                    showsHorizontalScrollIndicator={true}
                                    horizontal>

                                    <View style={{ width: width }}>

                                        <TouchableOpacity
                                            activeOpacity={.9}
                                            onPress={() => {
                                                if(this.scrollViewCharts) {
                                                    this.scrollViewCharts.scrollToEnd({
                                                        animated: true
                                                    });
                                                }
                                            }}
                                            style={{ height: '90%', width: 30, backgroundColor: 'rgba(0,0,0,.1)', position: 'absolute', top: '5%', right: 10, zIndex: 9999, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
                                            <Icon
                                                name={'hand-pointing-right'}
                                                style={{ fontSize: Utils.UI.normalizeFont(20), color: 'white' }}
                                            />
                                        </TouchableOpacity>

                                        <LChart
                                            data={this.state.chart.data}
                                            config={this.state.chart.config}
                                        />
                                    </View>

                                    <View style={{
                                        flex: 0,
                                        width: width - 20,
                                        flexDirection: 'row',
                                        backgroundColor: Utils.Color.setAlpha(Utils.Color.Secondary, 1),
                                        margin: 10,
                                        borderRadius: 5,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginLeft: 10
                                    }}>
                                        <PChart
                                            categories={perCategories}
                                            config={this.state.chart.config}
                                        />
                                        <View style={{ width: width * .57, flexDirection: 'column', justifyContent: 'center' }}>
                                            { perCategories && perCategories.map((e) => {
                                                return (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                                                        <View style={{ width: 10, height: 10, borderRadius: 5, marginRight: 10, backgroundColor: e.categoryColor }}></View> 
                                                        <Text style={{ fontFamily: Utils.Font.Montserrat(800), color: 'white', fontSize: Utils.UI.normalizeFont(9), marginBottom: 0 }}>
                                                            { e.categoryType } > { e.name }: $ { e.amount }
                                                        </Text>
                                                    </View>
                                                )
                                            })}
                                        </View>
                                    </View>
                                </ScrollView>
                            </View>
                        }

                        <View style={{ justifyContent: 'center', flexDirection: 'column', padding: 0, marginBottom: 20 }}>
                            <Text style={{ textAlign: 'center', marginVertical: 0, fontSize: Utils.UI.normalizeFont(15), marginTop: 20, marginBottom: 10, fontFamily: Utils.Font.Montserrat(600), color: Utils.Color.DarkGray, marginRight: 5 }}>Ingresos / Egresos</Text>
                            <Text style={{ textAlign: 'center', fontFamily: Utils.Font.Montserrat(300), fontSize: Utils.UI.normalizeFont(12) }}>Las transacciones según los filtros que tienes configurados.</Text>
                        </View>

                        <FlatList
                            data={transactions}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ padding: 10, paddingVertical: 10 }}
                            renderItem={(rowData) => {
                                return (
                                    <RowTransactionCard
                                        style={{
                                            width : width * .45,
                                            height: 150,
                                            marginRight: 20,
                                            ...Utils.Styles.Shadowed,
                                            borderRadius: 5
                                        }}
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
                                <Text style={{ fontFamily: Utils.Font.Montserrat(400), fontSize: Utils.UI.normalizeFont(12), textAlign: 'center', color: 'white' }}>No hay resultados para lo que estás buscando</Text>
                            </View>
                        }

                        <TouchableOpacity
                            activeOpacity={.95}
                            onPress={() => {
                                Services.UIService.Animate();
                                this.setState({ showPerCategories: !this.state.showPerCategories });
                            }}
                            style={{ justifyContent: 'center', flexDirection: 'column', padding: 0 }}>
                            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ textAlign: 'center', marginVertical: 0, fontSize: Utils.UI.normalizeFont(15), marginTop: 20, marginBottom: 10, fontFamily: Utils.Font.Montserrat(600), color: Utils.Color.DarkGray, marginRight: 5 }}>Categorías</Text>
                                <Text style={{ textAlign: 'center', fontFamily: Utils.Font.Montserrat(300), fontSize: Utils.UI.normalizeFont(12) }}>Aquí puedes ver tus categorías y el dinero que hay para cada una en la moneda que tienes seleccionada.</Text>
                            </View>
                        </TouchableOpacity>
                        <FlatList
                            horizontal
                            data={perCategories}
                            style={{ width: '100%' }}
                            contentContainerStyle={{ padding: 10, paddingVertical: 10 }}
                            renderItem={(rowData) => {
                                return (
                                    <View
                                        style={{
                                            flex: 0,
                                            width: width * .6,
                                            height: 150,
                                            padding: 30,
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            backgroundColor: Utils.Color.setAlpha(rowData.item.categoryColor, .2),
                                            ...Utils.Styles.Shadowed,
                                            borderWidth: 1,
                                            borderColor: 'rgba(0,0,0,.04)',
                                            marginRight: 20,
                                            borderRadius: 5 }}>
                                        <Text style={{ flex: 0, fontFamily: Utils.Font.Montserrat(800), color: Utils.Color.darken(rowData.item.categoryColor, 25), fontSize: Utils.UI.normalizeFont(16), marginBottom: 5 }}>
                                            { rowData.item.categoryType }
                                        </Text>
                                        <Text style={{ flex: 0, fontFamily: Utils.Font.Montserrat(600), color: Utils.Color.darken(rowData.item.categoryColor, 20), fontSize: Utils.UI.normalizeFont(13), textAlign: 'center', padding: 0 }}>{ rowData.item.name }</Text>
                                        <Text style={{ flex: 0, fontFamily: Utils.Font.Montserrat(600), color: Utils.Color.darken(rowData.item.categoryColor, 20), fontSize: Utils.UI.normalizeFont(13), textAlign: 'center', padding: 0 }}>{ Services.CurrencyService.formatCurrency(rowData.item.amount) }</Text>
                                    </View>
                                );
                            }}
                        />

                        { perCategories != null && perCategories.length == 0 &&
                            <View style={{ width: '95%', alignSelf: 'center', backgroundColor: Utils.Color.ErrorRed, padding: 10, marginTop: 10 }}>
                                <Text style={{ fontFamily: Utils.Font.Montserrat(400), fontSize: Utils.UI.normalizeFont(12), textAlign: 'center', color: 'white' }}>No hay resultados para lo que estás buscando</Text>
                            </View>
                        }
                    </ScrollView>

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

const FilterChip = (props) => {
    return (
        <TouchableOpacity
            activeOpacity={.95}
            onPress={props.onPress}
            style={{ backgroundColor: Utils.Color.Secondary, padding: 5, borderRadius: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginRight: 5, marginBottom: 10 }}>
            <Text style={{ color: Utils.Color.White, fontFamily: Utils.Font.Montserrat(600), fontSize: Utils.UI.normalizeFont(11) }}>{ props.text }</Text>
            { props.removable ?
                <Icon
                    name={'close'}
                    style={{ fontSize: Utils.UI.normalizeFont(13), marginLeft: 5, marginTop: 3, color: Utils.Color.SecondaryDark }}
                />
            :
                <Icon
                    name={'filter-variant'}
                    style={{ fontSize: Utils.UI.normalizeFont(13), marginLeft: 5, marginTop: 3, color: Utils.Color.SecondaryDark }}
                />
            }
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 10
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