import React from 'react';
import {
    Animated,
    Component,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    AsyncStorage,
    ImageBackground,
    Dimensions,
    ScrollView,
    Alert,
    RefreshControl,
    Vibration,
    Platform
} from 'react-native';

// Modules
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import OneSignal from 'react-native-onesignal';
import firebase from 'react-native-firebase';
import LottieView from 'lottie-react-native';
import _ from 'lodash';
import * as RNLocalize from "react-native-localize";
import moment from 'moment';
import 'moment/locale/es'
moment.locale('es');
import { FloatingAction } from "react-native-floating-action";
import { showMessage, hideMessage } from "react-native-flash-message";
import DeviceInfo from 'react-native-device-info';
import Share from 'react-native-share';

// Components
import Container from 'app/src/components/Container'
import HeaderBar from 'app/src/components/HeaderBar';
import RowTransaction from 'app/src/components/Transactions/RowTransaction'
import RowTransactionOwe from 'app/src/components/Transactions/RowTransactionOwe'
import Balance from '../components/Balance';
import Button from '../components/Button';
import { Input } from '../components';
import { LChart, BChart, CategoryIcon } from '../components'

// Styles
import * as Utils from '../styles'

// Services
import { SetToken } from '../services/BaseService'
import * as Services from 'app/src/services';
import { FlatList } from 'react-native-gesture-handler';
import { redirectionRoutes } from '../../App'; 

// Extras
const { width, height } = Dimensions.get('window');
const Banner = firebase.admob.Banner;
const AdRequest = firebase.admob.AdRequest;
const request = new AdRequest();

export default class HomeScreen extends React.Component {

    // Hide header bar
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            balance: null,
            transactions: [],
            transactionsOweTo: null,
            transactionsOweMe: null,
            lineChart: null,
            showGraph: false,
            filters: {
                date_from: moment.utc().subtract(7, 'days'),
                date_to: moment.utc()
            },
            showAds: false,
            shownSuccessBalance: true,
            hasAnalyzedPreviousConfiguration: false,
            sharedAccounts: []
        };

        // Lottie animation for success
        this.animation = null;
        this.opacityCharts = new Animated.Value(1);
        this.floatingButton = null;
    }

    componentDidMount() {
        this.props.screenProps.setLoading(true);

        // If it's in dev environment, then do initial load
        if(__DEV__) {
            this.initialLoad();
        }
        this.getCurrencies();

        this.focusListener = this.props.navigation.addListener('didFocus', () => {
            this.initialLoad();
        });

        // Just update, not success or error.
        let preferredLanguage = RNLocalize.getLocales();
        if(preferredLanguage != null && preferredLanguage.length > 0)
            preferredLanguage = preferredLanguage[0].languageCode;
        else
            preferredLanguage = 'es';

        Services.UserService.updateMetadata({
            timezone: RNLocalize.getTimeZone(),
            appVersion: DeviceInfo.getReadableVersion(),
            platform: Platform.OS,
            language: preferredLanguage
        });

        if(redirectionRoutes && redirectionRoutes.length) {
            try {
                const route = _.first(redirectionRoutes);
                this.props.navigation.navigate(route.path, route.params);
                redirectionRoutes = [];
            } catch (err) {
                // Do nothing
            }
        }
    }

    async initialLoad(manualMode = false) {
        if(manualMode)
            this.setState({ isRefreshing : true });

        // Get balance from user
        this.getMe();
        Services.TransactionService.syncCategories();

        // Get periods for line chart
        Services.ChartService.getLineChart({}, (data) => {
            if(data.success) {
                this.setState({
                    lineChart: {
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

        // Get shared accounts
        Services.SharedAccountService.getMySharedAccounts((data) => {
            if(data.success) {
                this.setState({
                    sharedAccounts: data.shared_accounts
                });
            }
        }, (err) => {
            this.setState({
                sharedAccounts: null
            });
        })
    }

    getSharedTransactions = async () => {
        Services.TransactionService.getSharedTransactions(Services.UserService.user.id, {}, (data) => {
            if(data.success) {
                Services.UIService.Animate();
                this.setState({
                    transactionsOweTo: data.oweTo,
                    transactionsOweMe: data.oweMe
                });
            }
        }, (err) => {
            // Do nothing
        });
    }

    getTransactions = async (filters = null) => {
        if(filters != null) {
            this.setState({
                filters
            });
        } else {
            filters = await Services.TransactionService.getFilters();
        }

        //this.props.screenProps.setLoading(true);
        Services.TransactionService.getTransactionsByUserId(Services.UserService.user.id, { filters : filters, place: 'feed' }, (data) => {
            if(data.success) {
                Services.UIService.Animate();

                this.setState({
                    transactions: data.transactions
                });
            }

            this.setState({ isRefreshing : false });
            this.props.screenProps.setLoading(false);

            setTimeout(() => {
                this.setState({ showAds : true });
            }, 1500);
        }, (err) => {
            // Do nothing
            this.setState({ isRefreshing : false });
            this.props.screenProps.setLoading(false);
        });
    }

    getCurrencies = () => {
        Services.CurrencyService.getCurrencies((data) => {
            if(data.success){
                Services.CurrencyService.currencies = data.currencies;
            }
        }, (err) => null);
    }

    getMe = () => {
        Services.UserService.getMe({}, (data) => {
            if(data.success) {

                // Persist in global state
                Services.UserService.user = data.user;
                if(data.unreadNotifications != this.props.screenProps.hasUnreadNotifications) {
                    this.props.screenProps.setUnreadNotifications(data.unreadNotifications);
                }

                Services.UIService.Animate();
                this.setState({
                    balance: data.balance
                });

                this.getTransactions();

                /*
                *   Disabling shared transactions on this version
                */
                /* this.getSharedTransactions(); */

                // Global scope for this variable
                Services.TransactionService.balance = data.balance;

                /* Success for positive balance */
                if(!this.state.shownSuccessBalance && data.balance && data.balance.balance > 0) {
                    setTimeout(() => {
                        /* if(this.animation)
                            this.animation.play(); */

                        Services.SoundService.playSound('success_welcome.mp3');
                        Vibration.vibrate();
                        /* setTimeout(() => {
                            this.setState({ shownSuccessBalance : true });
                        }, 1000); */
                    }, 1000);
                }

                if(data.user.country_code == null && !this.state.hasAnalyzedPreviousConfiguration) {
                    this.setState({ hasAnalyzedPreviousConfiguration : true });
                    this.props.navigation.push('CountryPickerModal', {
                        onCountrySelected: (country) => {
                            this.props.screenProps.setLoading(true);
                            Services.UserService.updateMe({
                                country_code: country.code,
                                country_name: country.name
                            }, (data) => {
                                if(data.success && data.user) {
                                    Services.UserService.user = data.user;
                                }

                                this.props.screenProps.setLoading(false);
                                this.props.navigation.pop();
                            }, (err) => null);
                        }
                    });
                }
            }
        }, (err) => {
            // Do nothing
        });
    }

    getMyAccounts = () => {
        this.props.screenProps.setLoading(true);
        Services.UserService.getMyAccounts((data) => {
            this.props.screenProps.setLoading(false);

            let options = [];
            for(var idx in data.accounts) {
                const account = data.accounts[idx];
                options.push({
                    id: account.id,
                    label: `Cuenta de ${account.currency.name}`
                })
            }
            this.props.navigation.push('OptionsPickerModal', {
                options: options,
                topView: () => {
                    return (
                        <Button
                            text={Services.LanguageService.string('HomeScreen.add_account')}
                            textStyle={{ color: Utils.Color.White, fontSize: Utils.UI.normalizeFont(13) }}
                            buttonStyle={{ width: '90%', backgroundColor: Utils.Color.Primary, alignSelf: 'center', marginTop: 0, padding: 0, borderWidth: 2, borderColor: 'rgba(255,255,255,.85)', borderRadius: 5, borderWidth: 0, borderColor: 'rgba(0,0,0,.4)', marginBottom: 0 }}
                            onPress={() => {
                                let currencies = [];
                                for(var idx in Services.CurrencyService.currencies) {
                                    const currency = Services.CurrencyService.currencies[idx];
                                    currencies.push({
                                        id: currency.id,
                                        label: `${currency.name}`,
                                        rightText: currency.code,
                                    })
                                }

                                this.props.navigation.push('OptionsPickerModal', {
                                    options: currencies,
                                    onSelectedOption: (option) => {
                                        this.props.screenProps.setLoading(true);
                                        Services.UserService.createAccount({ currency_id: option.id }, (info) => {
                                            this.getMyAccounts();
                                            this.props.navigation.popToTop();
                                        }, (err) => null);
                                    }
                                });
                            }}
                        />
                        
                    );
                },
                onSelectedOption: (option) => {
                    this.props.screenProps.setLoading(true);
                    Services.UserService.updateMe({
                        active_account_id: option.id
                    }, (data) => {
                        if(data.success && data.user) {
                            Services.UserService.user = data.user;
                        }

                        this.props.navigation.pop();
                    }, (err) => null);
                }
            });
        }, (err) => null);
    }

    onPressTransaction = (transaction) => {
        this.props.navigation.push('TransactionDetailsModal', {
            transaction,
            onReload: () => { this.initialLoad() },
            onDelete: (transaction) => {
                if(transaction.can_delete) {
                    this.props.screenProps.showInteractableAlertWithButtons(Services.LanguageService.string('delete'), Services.LanguageService.string('ask_delete_transaction'), [
                        {
                            id: 1,
                            text: 'Confirmar',
                            onPress: () => {
                                this.props.screenProps.hideInteractableAlert()

                                this.props.screenProps.setLoading(true);
                                Services.TransactionService.removeById(transaction.id, (data) => {
                                    if(data.success) {
                                        this.initialLoad()
                                    }

                                    this.props.screenProps.setLoading(false);
                                    this.props.navigation.pop();

                                    Services.AnalyticsService.postEvent({
                                        type: 'deleted_transaction',
                                        view: 'TransactionDetailsModal'
                                    });

                                    showMessage({
                                        message: Services.LanguageService.string('success'),
                                        description: Services.LanguageService.string('success_message'),
                                        type: "success",
                                    });
                                }, (err) => {
                                    this.initialLoad()

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
                } else {
                    showMessage({
                        message: "Oh oh!",
                        description: "Parece que no tenés permisos para eliminar este movimiento",
                        type: "danger"
                    });
                }
            }
        });
    }

    render() {

        return (
            <Container
                inheritedProps={this.props}
                style={{ flex : 1 }}>

                { this.state.balance && this.state.balance.balance > 0 && !this.state.shownSuccessBalance &&
                    <View style={{ position: 'absolute', width: '100%', height: '50%', left: 0, right: 0, bottom: '10%', backgroundColor: 'transparent', zIndex: 999999 }}>
                        <LottieView
                            ref={animation => {
                                this.animation = animation;
                            }}
                            source={require('app/src/assets/animations/fireworks.json')}
                            loop={false}
                            speed={2}
                            style={{
                                width: width,
                                height: 'auto',
                                aspectRatio: 1,
                                position: 'absolute',
                                top: -50,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        />
                    </View>
                }

                <View style={styles.container}>
                    <HeaderBar
                        containerStyle={{ paddingTop: 0 }}
                        isBackButton={false}
                        navigation={this.props.navigation}
                        rightContent={() => {

                            let hasActiveAccount = Services.UserService.user != null && Services.UserService.user.active_account != null;

                            return (
                                <TouchableOpacity
                                    onPress={this.getMyAccounts}
                                    style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                                    <Icon
                                        name={'currency-usd'}
                                        size={13}
                                        color={Utils.Color.DarkGray}
                                    />
                                    { hasActiveAccount &&
                                        <Text style={{ fontFamily: Utils.Font.Montserrat(400), fontSize: Utils.UI.normalizeFont(10), textAlign: 'center', color: Utils.Color.DarkGray, marginLeft: 5 }}>{ Services.UserService.user.active_account.currency.name }</Text>
                                    }
                                </TouchableOpacity>
                            );
                        }}
                        title={Services.LanguageService.string('HomeScreen.index')}
                    />

                    <View style={{ flex : 0, backgroundColor: 'white', padding: 0 }}>
                        { this.state.balance == null &&
                            <View style={{ width: '100%', height: 110 }}>
                                <LottieView
                                    source={require('app/src/assets/animations/loading.json')}
                                    autoPlay
                                    style={{
                                        width: width,
                                        height: height,
                                        aspectRatio: 1
                                    }}
                                />
                            </View>
                        }
                    </View>

                    <View style={{ height: 5, backgroundColor: 'rgba(0,0,0,.025)', width: '100%', borderRadius: 5, marginVertical: 0 }}></View>

                    { this.state.transactions != null &&
                        <ScrollView
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.isRefreshing}
                                    onRefresh={() => this.initialLoad(true)}
                                />
                            }
                            style={{ flex : 1, backgroundColor: Utils.Color.White, paddingTop: 5 }}
                            contentContainerStyle={{ paddingBottom: 5 }}>
                            
                            { this.state.balance != null && this.state.balance.balance != 0 &&
                                <View
                                    style={{ width: '100%', backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', paddingVertical: 5 }}>
                                    <Banner
                                        style={{ top: 0, left: 0 }}
                                        size={"MINI_BANNER"}
                                        unitId={Services.AdsService.getBannerIdentifier('last_movements')}
                                        request={request.build()}
                                        onAdLoaded={() => {
                                            // Do nothing
                                        }}
                                    />
                                </View>
                            }

                            <Text style={{ fontFamily: Utils.Font.Montserrat(700), color: Utils.Color.Primary, fontSize: Utils.UI.normalizeFont(16), paddingHorizontal: 10, paddingVertical: 10 }}>{ Services.LanguageService.string('HomeScreen.current_balance') }</Text>

                            { this.state.balance != null && this.state.balance.balance != 0 ?
                                <Balance
                                    income={this.state.balance.incomes}
                                    outcome={this.state.balance.outcomes}
                                    balance={this.state.balance.balance}
                                    type={'pieChart'}
                                />
                            :
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 10, paddingVertical: 5 }}>
                                    <Text style={{ fontFamily: Utils.Font.Montserrat(400), color: Utils.Color.DarkGray, fontSize: Utils.UI.normalizeFont(13), maxWidth: '90%' }}>{ Services.LanguageService.string('HomeScreen.no_incomes_outcomes') }</Text>
                                </View>
                            }

                            {/* <TouchableOpacity
                                activeOpacity={.9}
                                style={{ backgroundColor: Utils.Color.Primary, padding: 10, justifyContent: 'center', alignItems: 'center', width: '95%', alignSelf: 'center', borderRadius: 5 }}
                                onPress={() => {
                                    this.props.navigation.push('QuestionsList', {
                                        onCreated: () => {
                                            this.props.screenProps.setLoading(true);
                                            this.initialLoad()
                                        }
                                    });
                                }}>
                                <Text style={{ fontFamily: Utils.Font.Montserrat(800), color: 'white', marginTop: 5 }}>Quiero comprarme algo</Text>
                                <Text style={{ fontFamily: Utils.Font.Montserrat(300), color: 'white', textAlign: 'center', marginTop: 5 }}>Descubre si eso que quiere comprarte vale la pena o no</Text>

                                <View style={{ backgroundColor: 'yellow', padding: 5, borderRadius: 3, position: 'absolute', top: 5, right: 5 }}>
                                    <Text style={{ fontFamily: Utils.Font.Montserrat(400), color: '#666', fontSize: Utils.UI.normalizeFont(8) }}>Nuevo</Text>
                                </View>
                            </TouchableOpacity> */}

                            { false && Services.UserService.user != null &&
                                <TouchableOpacity
                                    activeOpacity={.9}
                                    onPress={() => {
                                        this.props.screenProps.showInteractableAlertWithButtons(Services.UserService.user.username, Services.LanguageService.string('invite_text_1'), [
                                            {
                                                id: 1,
                                                text: Services.LanguageService.string('invite_share_alias'),
                                                onPress: () => {
                                                    this.props.screenProps.hideInteractableAlert()

                                                    setTimeout(() => {
                                                        Share.open({
                                                            message: Services.LanguageService.string('invite_text_2', { username: Services.UserService.user.username }),
                                                            title: Services.LanguageService.string('invite_text_2', { username: Services.UserService.user.username })
                                                        })
                                                        .then((res) => {})
                                                        .catch((err) => { err && console.log(err); });
                                                    }, 750);
                                                }
                                            }
                                        ], {
                                            vibrate : true,
                                            shadowBackgroundImage: require('app/src/assets/images/illustrations/username.png'),
                                            shadowBackgroundColor: 'white'
                                        });
                                    }}>
                                    <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 0 }}>
                                        {/*<Text style={{ fontFamily: Utils.Font.Montserrat(600), color: '#222', textAlign: 'center', fontSize: Utils.UI.normalizeFont(12) }}>Mi alias</Text>*/}
                                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 5, paddingHorizontal: 20, backgroundColor: Utils.Color.Primary, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
                                            <Text style={{ fontFamily: Utils.Font.Montserrat(700), color: Utils.Color.White, textAlign: 'center', fontSize: Utils.UI.normalizeFont(20) }}>{ Services.UserService.user.username }</Text>
                                            <Icon
                                                name={'share-variant'}
                                                color={Utils.Color.PrimaryLight}
                                                size={Utils.UI.normalizeFont(18)}
                                                style={{ marginLeft: 5, opacity: .3 }}
                                            />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            }

                            { false &&
                                <View style={{ flex: 1, flexDirection: 'column' }}>
                                    <Text style={{ fontFamily: Utils.Font.Montserrat(700), color: '#777', fontSize: Utils.UI.normalizeFont(19), paddingHorizontal: 20, paddingVertical: 10 }}>{ Services.LanguageService.string('HomeScreen.owe_me') }</Text>

                                    { (!this.state.transactionsOweMe || this.state.transactionsOweMe.length == 0) &&
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 15, paddingVertical: 5 }}>
                                            <Icon
                                                name={'check'}
                                                size={Utils.UI.normalizeFont(16)}
                                                color={Utils.Color.Primary}
                                            />
                                            <Text style={{ fontFamily: Utils.Font.Montserrat(400), fontSize: Utils.UI.normalizeFont(12), maxWidth: '95%', color: Utils.Color.DarkGray }}><Text style={{ color: Utils.Color.PrimaryDark, fontFamily: Utils.Font.Montserrat(700) }}>{ Services.LanguageService.string('HomeScreen.perfect') }</Text> { Services.LanguageService.string('HomeScreen.description_1') }</Text>
                                        </View>
                                    }

                                    { this.state.transactionsOweMe && this.state.transactionsOweMe.length > 0 && this.state.transactionsOweMe.map((e) => {
                                        return (
                                            <RowTransactionOwe
                                                showReminderIn
                                                transaction={e}
                                                onPress={() => {
                                                    this.onPressTransaction(e)
                                                }}
                                            />
                                        );
                                    })}
                                </View>
                            }

                            { this.state.lineChart != null && 
                                <TouchableOpacity
                                    activeOpacity={.6}
                                    onPress={() => {
                                        Services.UIService.Animate();
                                        this.setState({ showGraph: !this.state.showGraph });
                                    }}
                                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 }}>
                                        <Icon
                                            name={'help-rhombus'}
                                            style={{ fontSize: Utils.UI.normalizeFont(12), marginRight: 5 }}
                                            color={Utils.Color.Primary}
                                        />
                                    <Text style={{ fontFamily: Utils.Font.Montserrat(600), fontSize: Utils.UI.normalizeFont(12), color: Utils.Color.Primary, textAlign: 'center' }}>{ this.state.showGraph == true ? 'Ocultar gráficos' : 'Toca para mostrar gráficos' }</Text>
                                </TouchableOpacity>
                            }

                            { this.state.lineChart != null && this.state.showGraph == true && 
                                <Animated.View style={{ opacity: this.opacityCharts }}>
                                    <TouchableOpacity
                                        activeOpacity={.95}
                                        onPress={() => {
                                            let toComponent = LChart;
                                            const isLChart = this.state.lineChart.componentType == 'LChart';
                                            if(isLChart) {
                                                toComponent = BChart;
                                            }

                                            const reverse = Math.random() > 0.5;
                                            Animated.timing(this.opacityCharts, {
                                                toValue: 0.25,
                                                duration: 200,
                                                useNativeDriver: true
                                            }).start(() => {
                                                this.setState({
                                                    lineChart: Object.assign(this.state.lineChart, {
                                                        component: toComponent,
                                                        componentType: isLChart ? 'BChart' : 'LChart'
                                                    })
                                                }, () => {
                                                    Animated.timing(this.opacityCharts, {
                                                        toValue: 1,
                                                        duration: 200,
                                                        useNativeDriver: true
                                                    }).start();
                                                });
                                            });
                                        }}
                                        style={{ flexDirection: 'column' }}>
                                        <this.state.lineChart.component
                                            data={this.state.lineChart.data}
                                            config={this.state.lineChart.config}
                                        />

                                        <Text style={{ textAlign: 'center', fontFamily: Utils.Font.Montserrat(300), fontSize: Utils.UI.normalizeFont(12) }}>Toca para cambiar el gráfico</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            }

                            <View style={{ flex: 1, paddingHorizontal: 10 }}>
                                <Text style={{ fontFamily: Utils.Font.Montserrat(700), color: Utils.Color.Primary, fontSize: Utils.UI.normalizeFont(16), paddingHorizontal: 0, paddingVertical: 10 }}>{ Services.LanguageService.string('HomeScreen.shared_accounts') }</Text>

                                { this.state.sharedAccounts && this.state.sharedAccounts.length == 0 &&
                                    <Text style={{ fontFamily: Utils.Font.Montserrat(400), color: Utils.Color.DarkGray, fontSize: Utils.UI.normalizeFont(13), maxWidth: '90%' }}>{ Services.LanguageService.string('HomeScreen.no_shared_accounts') }</Text>
                                }

                                <FlatList
                                    horizontal
                                    pagingEnabled
                                    showsHorizontalScrollIndicator={false}
                                    scrollEventThrottle={16}
                                    contentContainerStyle={{ paddingVertical: 5 }}
                                    style={{ width: '100%' }}
                                    snapToInterval={width * .63}
                                    data={this.state.sharedAccounts}
                                    renderItem={( { item } ) => {

                                        const members = _.takeRight(item.members, 3);

                                        return (
                                            <TouchableOpacity
                                                activeOpacity={.85}
                                                style={{
                                                    flex: 0,
                                                    width: width * .45,
                                                    height: 100,
                                                    padding: 10,
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    backgroundColor: Utils.Color.Primary,
                                                    ...Utils.Styles.Shadowed,
                                                    borderWidth: 1,
                                                    borderColor: 'rgba(0,0,0,.04)',
                                                    marginRight: 20,
                                                    borderRadius: 5
                                                }}
                                                onPress={() => {
                                                    this.props.navigation.push('DetailsSharedAccount', {
                                                        id: item.id
                                                    });
                                                }}>
                                                <Text style={{ flex: 1, fontFamily: Utils.Font.Montserrat(800), color: 'white', fontSize: Utils.UI.normalizeFont(16), textAlign: 'center' }}>{ item.name }</Text>

                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    { members.map((e) => {
                                                        return (
                                                            <Image
                                                                source={{ uri: `https://ui-avatars.com/api/?name=${e.name.replace(' ', '+')}` }}
                                                                style={{ borderRadius: 10, width: 20, height: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,.75)', marginLeft: -5 }}
                                                            />
                                                        )
                                                    })}

                                                    { item.members.length > 3 &&
                                                        <Text style={{ fontFamily: Utils.Font.Montserrat(600), color: Utils.Color.White, fontSize: Utils.UI.normalizeFont(9), marginLeft: 3 }}>+{ (item.members.length - 3) } miembro {item.members.length - 3 > 1 ? 's' : ''}</Text>
                                                    }
                                                </View>
                                            </TouchableOpacity>
                                        )
                                    }}
                                />
                            </View>

                            <View style={{ flex: 1, flexDirection: 'column', marginTop: 0 }}>
                                <Text style={{ fontFamily: Utils.Font.Montserrat(700), color: Utils.Color.Primary, fontSize: Utils.UI.normalizeFont(16), paddingHorizontal: 10, paddingVertical: 10 }}>{ Services.LanguageService.string('HomeScreen.incomes_and_outcomes') }</Text>

                                { !this.state.transactions || this.state.transactions.length == 0 && [
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 10, paddingVertical: 5 }}>
                                        <Text style={{ fontFamily: Utils.Font.Montserrat(400), color: Utils.Color.DarkGray, fontSize: Utils.UI.normalizeFont(13), maxWidth: '90%' }}>{ Services.LanguageService.string('HomeScreen.no_incomes_outcomes') }</Text>
                                    </View>,
                                    <TouchableOpacity
                                        activeOpacity={.9}
                                        onPress={() => {
                                            if(this.floatingButton)
                                                this.floatingButton.animateButton();
                                        }}>
                                        <LottieView
                                            ref={animation => {
                                                this.animation = animation;
                                            }}
                                            source={require('app/src/assets/animations/sleeping.json')}
                                            autoPlay
                                            style={{ width: '100%', height: 250, alignSelf: 'center', marginTop: -20, aspectRatio: 1 }}
                                        />
                                    </TouchableOpacity>
                                ]}

                                { this.state.transactions && this.state.transactions.length > 0 &&
                                    <Button
                                        text={'Ver todo'}
                                        textStyle={{ color: Utils.Color.White, fontSize: Utils.UI.normalizeFont(13) }}
                                        buttonStyle={{ width: '95%', backgroundColor: Utils.Color.Primary, alignSelf: 'center', marginTop: 5, padding: 3, borderWidth: 2, borderColor: 'rgba(255,255,255,.85)', borderRadius: 5, borderWidth: 0, borderColor: 'rgba(0,0,0,.4)', marginBottom: 15 }}
                                        icon={
                                            <Icon
                                                name={'eye'}
                                                size={Utils.UI.normalizeFont(13)}
                                                style={{ marginRight: 10 }}
                                                color={Utils.Color.PrimaryLight}
                                            />
                                        }
                                        onPress={() => {
                                            this.props.navigation.push('LastMovementsScreen');
                                        }}
                                    />
                                }

                                { this.state.transactions && this.state.transactions.length > 0 && this.state.transactions.map((e) => {
                                    return (
                                        <RowTransaction
                                            transaction={e}
                                            onPress={() => {
                                                this.onPressTransaction(e)
                                            }}
                                        />
                                    );
                                })}
                            </View>
                        </ScrollView>
                    }

                    <FloatingAction
                        ref={(e) => { this.floatingButton = e }}
                        overlayColor={'rgba(22,22,22,.9)'}
                        color={Utils.Color.Primary}
                        actions={[
                            {
                                render: () => {
                                    return (
                                        <View style={{ padding: 8, backgroundColor: 'white', borderRadius: 5 }}>
                                            <Text style={{ fontFamily: Utils.Font.Montserrat(400), color: Utils.Color.DarkGray, textAlign: 'center', fontSize: Utils.UI.normalizeFont(11) }}>{ Services.LanguageService.string('HomeScreen.add_income_outcome') }</Text>
                                        </View>
                                    );
                                },
                                name: "btn_income",
                                position: 0
                            },
                            {
                                render: () => {
                                    return (
                                        <View style={{ padding: 8, backgroundColor: 'white', borderRadius: 5 }}>
                                            <Text style={{ fontFamily: Utils.Font.Montserrat(400), color: Utils.Color.DarkGray, textAlign: 'center', fontSize: Utils.UI.normalizeFont(11) }}>{ Services.LanguageService.string('HomeScreen.add_shared_account') }</Text>
                                        </View>
                                    );
                                },
                                name: "btn_shared_account",
                                position: 0
                            }
                            /* {
                                render: () => {
                                    return (
                                        <View style={{ padding: 8, backgroundColor: 'white', borderRadius: 5 }}>
                                            <Text style={{ fontFamily: Utils.Font.Montserrat(400), color: '#555', textAlign: 'center', fontSize: Utils.UI.normalizeFont(11) }}>{ Services.LanguageService.string('HomeScreen.add_outcome') }</Text>
                                        </View>
                                    );
                                },
                                name: "btn_outcome",
                                position: 1
                            } */
                        ]}
                        onPressItem={name => {
                            if(name == 'btn_income') {
                                this.props.navigation.push('NewIncomeOutcome', {
                                    onCreated: () => {
                                        this.props.screenProps.setLoading(true);
                                        this.initialLoad()
                                    }
                                });
                            } else {
                                this.props.navigation.push('NewSharedAccount', {
                                    onCreated: (sharedAccount) => {
                                        setTimeout(() => {
                                            this.props.navigation.push('DetailsSharedAccount', {
                                                id: sharedAccount.id
                                            });
                                        }, 750);
                                    }
                                });
                            }
                        }}
                    />
                </View>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
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