import React from 'react';
import {
    Component,
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    SafeAreaView,
    AsyncStorage,
    TouchableWithoutFeedback,
    ScrollView,
    KeyboardAvoidingView,
    Vibration,
    Platform,
    Keyboard
} from 'react-native';

// Modules
import _ from 'lodash';
import LottieView from 'lottie-react-native';
import firebase from 'react-native-firebase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as RNLocalize from "react-native-localize";
import moment from 'moment-timezone/builds/moment-timezone-with-data';
import 'moment/locale/es'
moment.locale('es');
moment.tz.setDefault(RNLocalize.getTimeZone());
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { showMessage, hideMessage } from "react-native-flash-message";
import {
    Switch
} from 'react-native-paper';
import { TextInputMask } from 'react-native-masked-text'

// Styles
import * as Utils from '../../styles'

// Components
import HeaderBar from 'app/src/components/HeaderBar';
import Container from 'app/src/components/Container';
import Button from '../../components/Button';

// Services
import * as Services from 'app/src/services';
import {
    Txt,
    Input,
    KeyboardEntry
} from 'app/src/components';

const Banner = firebase.admob.Banner;
const AdRequest = firebase.admob.AdRequest;
const request = new AdRequest();

const RANDOM_PHRASES = [
    'Cuida de los pequeños gastos; un pequeño agujero, hunde un barco',
    'Ahorrar no es solo guardar, sino saber gastar',
    'Barco en varadero, no gana dinero',
    'La forma más rápida de doblar tu dinero es plegar los billetes y meterlos en el bolsillo',
    'No pongas tu interés en el dinero, pero pon tu dinero a interés',
    'Por ahorrar dinero, la gente está dispuesta a pagar cualquier precio',
    'Un centavo ahorrado es un centavo ganado',
    'Nunca gastes tu dinero antes de tenerlo',
    'Compra solamente lo necesario; lo superfluo, aunque cueste sólo un céntimo, es caro',
    'El ahorro es una cosa muy hermosa especialmente cuando tus padres lo han hecho por ti',
    'La mejor manera de ahorrar dinero es no perder',
    'Gasta siempre una moneda menos de lo que ganes',
    'Una ganga no es una ganga a menos que sea algo que necesites',
    'Ahorrar no es solo guardar, sino saber gastar',
    'Si quieres que el dinero no te falte, el primero que tengas no lo gastes',
    'Quien vive con más desahogo no es el que tiene más, sino el que administra bien lo mucho o poco que tiene',
    'Mientras puedas, ahorra para la vejez y la necesidad, porque el sol de la mañana no dura todo el día',
    'El más rico de todos los hombres es el ahorrativo; el más pobre, el avaro',
    'El hombre que sabe gastar y ahorrar es el más feliz, porque disfruta con ambas cosas',
    'Si añades lo poco a lo poco y lo haces así con frecuencia, pronto llegará a ser mucho'
];

export default class NewIncomeOutcome extends React.Component {

    // Hide header bar
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {
            showDatePickerIndex: null,
            showDatePickerIndex: null,
            showNameInput: false,
            phrase: _.sample(RANDOM_PHRASES),
            transaction: {
                reminders: []
            }
        };
    }

    componentDidMount() {
        const { getParam } = this.props.navigation;
        let transaction = this.state.transaction;
        transaction.transaction_type_id = getParam('type');
        if(transaction.transaction_type_id != null) {
            transaction.categories = [Services.TransactionService.categories.find((e) => e.transaction_type_id == getParam('type'))]
        }

        // If is editing then take it to the state
        if(getParam('transaction') != null) {
            this.setState({
                transaction: getParam('transaction')
            }, () => {
                if(this.state.transaction.owe_to_alias != null) {
                    this.setState({ showNameInput : true });
                }

                // this.forceUpdate();
            });
        } else {
            this.setState({
                transaction
            });
        }
    }

    getCurrencies = () => {
        this.props.screenProps.setLoading(true);
        Services.CurrencyService.getCurrencies((data) => {
            if(data.success) {
                let currencies = data.currencies;
                let options = [];
                for(var idx in currencies) {
                    const currency = currencies[idx];
                    options.push({
                        id: currency.id,
                        code: currency.code,
                        symbol: currency.symbol,
                        label: `${currency.symbol} - ${currency.name}`
                    })
                }

                this.props.screenProps.setLoading(false);
                this.props.navigation.push('OptionsPickerModal', {
                    options: options,
                    onSelectedOption: (option) => {
                        let transaction = this.state.transaction;
                        transaction.currency_id = option.id;
                        this.setState({ transaction });
                        this.props.navigation.pop();
                    }
                });
            }
        }, (err) => {
            // Do nothing
        });
    }

    onSubmit = () => {
        const {
            transaction
        } = this.state;

        // Dismiss keyboard
        Keyboard.dismiss();

        this.props.screenProps.setLoading(true);
        // Set transaction dates to UTC
        if(transaction.reminders) {
            for(var idx in transaction.reminders) {
                transaction.reminders[idx].datetime = moment.utc(transaction.reminders[idx].datetime);
            }
        }

        // If it's for shared account then update it
        if(this.props.navigation.getParam('shared_account_id') != null) {
            transaction.shared_account_id = this.props.navigation.getParam('shared_account_id');
        }
        
        Services.TransactionService.createTransaction(transaction, (data) => {
            if(data.success) {
                showMessage({
                    message: Services.LanguageService.string('success'),
                    description: Services.LanguageService.string('success_message'),
                    type: "success",
                });

                Services.AnalyticsService.postEvent({
                    type: 'post_transaction',
                    view: 'NewIncomeOutcome'
                });

                this.props.screenProps.setLoading(false);
                if(this.props.navigation.state.params.onCreated)
                    this.props.navigation.state.params.onCreated();

                this.props.navigation.pop();
            } else {
                this.props.screenProps.setLoading(false);
                if(data.message) {
                    showMessage({
                        message: Services.LanguageService.string('NewIncomeOutcome.check_data'),
                        description: data.message,
                        type: "danger",
                    });
                    //Alert.alert("Revisa la información", data.message);
                }
            }
        }, (err) => {
            // Do nothing
            this.props.screenProps.setLoading(false);
        })
    }

    render() {

        const {
            transaction,
            showDatePickerIndex,
            showTimePickerIndex
        } = this.state;

        const isIncome = transaction.transaction_type_id == 1;
        let backgroundColor = Utils.Color.White;
        let typeText = transaction.transaction_type_id == 1 ? 'ingreso' : 'egreso';

        /* Options for category modal */
        let categories = Services.TransactionService.categories;
        if(isIncome)
            categories = categories.filter((e) => e.transaction_type_id == 1);
        else
            categories = categories.filter((e) => e.transaction_type_id == 2);

        let options = [];
        for(var idx in categories) {
            // Check if it's for incomes or outcomes
            const category = categories[idx];
            options.push({
                id: category.id,
                label: category.name,
                name: category.name,
                customRow: () => {
                    return (
                        <View style={{ width: '100%', flexDirection: 'row', height: 60, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,.1)' }}>
                            <View style={{ width: '90%', paddingLeft: '5%', flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={[{ fontFamily: Utils.Font.Montserrat(900), color: '#222', flex: 1 }]}>{ category.name }</Text>
                                { category.color_hex != null &&
                                    <View style={{ width: 20, height: 20, borderRadius: 15, backgroundColor: category.color_hex }}></View>
                                }
                            </View>
                        </View>
                    );
                }
            })
        }

        const isForSharedAccount = this.props.navigation.getParam('shared_account_id');

        return (
            <Container style={[styles.container, { backgroundColor : backgroundColor }]}>
                <ScrollView
                    keyboardShouldPersistTaps={'always'}
                    contentContainerStyle={{
                        paddingBottom: 35,
                        minHeight: '100%'
                    }}
                    style={styles.form}>

                    <HeaderBar
                        containerStyle={{ paddingTop: 0 }}
                        isBackButton={true}
                        navigation={this.props.navigation}
                        title={ Services.LanguageService.string('NewIncomeOutcome.load_new') }
                    />

                    { transaction.transaction_type_id == null ?
                        <View style={{ flex: 1, flexDirection: 'column'}}>

                            <Text style={{ fontFamily: Utils.Font.Montserrat(800), fontSize: Utils.UI.normalizeFont(14), color: Utils.Color.Primary, alignSelf: 'center', marginBottom: 20 }}>¿Qué deseas cargar?</Text>

                            <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems : 'center'}}>
                                <TouchableOpacity
                                    activeOpacity={.9}
                                    onPress={() => {
                                        transaction.transaction_type_id = 1;
                                        
                                        Services.UIService.Animate();
                                        this.setState({ transaction });
                                    }}
                                    style={{ backgroundColor: Utils.Color.Secondary, padding: 20, width: '45%', alignItems: 'center', justifyContent: 'center', borderRadius: 5 }}>
                                    <Text style={{ fontFamily: Utils.Font.Montserrat(600), fontSize: Utils.UI.normalizeFont(11), color: 'white' }}>{ Services.LanguageService.string('new_income') }</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={.9}
                                    onPress={() => {
                                        transaction.transaction_type_id = 2;

                                        Services.UIService.Animate();
                                        this.setState({ transaction });
                                    }}
                                    style={{ backgroundColor: Utils.Color.PrimaryRed, padding: 20, width: '45%', alignItems: 'center', justifyContent: 'center', borderRadius: 5 }}>
                                <Text style={{ fontFamily: Utils.Font.Montserrat(600), fontSize: Utils.UI.normalizeFont(11), color: 'white' }}>{ Services.LanguageService.string('new_expense') }</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={{ flex : 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Image
                                    source={{ uri: 'https://cdn1.iconfinder.com/data/icons/text-editing-6/32/Text_Editing_quotes-256.png' }}
                                    style={{ tintColor: 'rgba(0,0,0,.1)', resizeMode: 'contain', width: 70, height: 30 }}
                                />
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontFamily:  Utils.Font.Montserrat(300), color: 'rgba(0,0,0,.9)', marginBottom: 0, fontSize: Utils.UI.normalizeFont(16), textAlign: 'center' }}>
                                        { this.state.phrase }
                                    </Text>
                                </View>
                            </View>

                            {/* <View style={{ flex: 1}}>
                                <LottieView
                                    source={require('app/src/assets/animations/relax.json')}
                                    autoPlay
                                    style={{ position: 'absolute', bottom: 20, width: '100%', height: 150 }}
                                />
                            </View> */}
                        </View>
                    :
                        <KeyboardAvoidingView
                            enabled={Platform.OS === 'ios'}
                            behavior={Platform.OS === 'android' ? 'padding' : 'position'}>

                            { !isForSharedAccount &&
                                <View style={[styles.formInput]}>
                                    <Txt style={[styles.label]}>Categoría</Txt>
                                    <TouchableWithoutFeedback
                                        onPress={() => {
                                            this.props.navigation.push('OptionsPickerModal', {
                                                options: options,
                                                topView: () => {
                                                    return (
                                                        <Button
                                                            text={'Crear nueva categoría'}
                                                            textStyle={{ color: 'white' }}
                                                            buttonStyle={{ width: '95%', alignSelf: 'center', backgroundColor: Utils.Color.Primary, borderWidth: 0 }}
                                                            onPress={() => {
                                                                this.props.navigation.pop();
                                                                this.props.navigation.push('TransactionCategoriesScreen', {
                                                                    transaction_type_id : transaction.transaction_type_id,
                                                                    focusOnCreation: true,
                                                                    onCreated: (category) => {
                                                                        transaction.categories = [category];
                                                                        this.setState({
                                                                            transaction
                                                                        });
                                                                    }
                                                                });
                                                            }}
                                                        />
                                                    );
                                                },
                                                onSelectedOption: (option) => {
                                                    this.props.navigation.pop();

                                                    transaction.categories = [option];
                                                    this.setState({
                                                        transaction
                                                    });
                                                }
                                            })
                                        }}>
                                        <View style={[styles.valueContainer, { padding: 15, borderWidth: 0, backgroundColor: Utils.Color.Primary, ...Utils.Styles.Shadowed }]}>
                                            <Text style={[styles.value, { color: 'white' }]}>{ transaction.categories != null && transaction.categories.length > 0 ? transaction.categories[0].name : Services.LanguageService.string('no_category') }</Text>
                                            {/* <Icon
                                                name={'arrow-down'}
                                                style={{ marginLeft: 5 }}
                                                size={18}
                                            /> */}
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                            }

                            { false && transaction.transaction_type_id == 2 && transaction.id == null &&
                                <View style={styles.formInput}>
                                    <Txt style={styles.label}>{ Services.LanguageService.string('owe_someone') }</Txt>
                                    <View style={[styles.valueContainer, { backgroundColor: 'transparent', justifyContent: 'flex-end', borderWidth: 0, padding: 0 }]}>
                                        <Switch
                                            value={transaction.is_owe == 1 ? true : false}
                                            onValueChange={(value) => {
                                                Services.UIService.Animate();
                                                transaction.is_owe = value;
                                                this.setState({ transaction });
                                            }}
                                        />
                                    </View>
                                </View>
                            }

                            { transaction.transaction_type_id == 2 && (transaction.is_owe == 1 || transaction.is_owe == true) &&
                                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
                                    <View style={{ flex: 1, flexDirection: 'column' }}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                this.props.navigation.push('SearchUserModal', {
                                                    onPickUser: (user) => {
                                                        if(user && user.username && user.id) {
                                                            transaction.owe_to_alias = user.username;
                                                            transaction.owe_to_id = user.id;
                                                            this.setState({
                                                                transaction,
                                                                showNameInput: true
                                                            });
                                                        }
                                                        this.props.navigation.pop();
                                                    }
                                                });
                                            }}
                                            style={{ flex: 1, padding: 10, backgroundColor: Utils.Color.Primary, borderRadius: 5, marginRight: 10, justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontFamily: Utils.Font.Montserrat(500), fontSize: Utils.UI.normalizeFont(12), color: 'white', textAlign: 'center' }}>{ Services.LanguageService.string('NewIncomeOutcome.add_user') }</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => {
                                                Vibration.vibrate();
                                                showMessage({
                                                    message: Services.LanguageService.string('help'),
                                                    description: Services.LanguageService.string('NewIncomeOutcome.user_alias_help'),
                                                    type: "success",
                                                    position: "bottom",
                                                    duration: 5000
                                                });
                                            }}
                                            style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                                            <Icon
                                                name={'help-box'}
                                                size={Utils.UI.normalizeFont(20)}
                                                style={{ color: Utils.Color.Primary }}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{ flex: 1, flexDirection: 'column' }}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                Services.UIService.Animate();
                                                this.setState({ showNameInput: true }, () => {
                                                    if(this.oweToInput != null) {
                                                        this.oweToInput.focus();
                                                    }
                                                });
                                            }}
                                            style={{ flex: 1, padding: 10, backgroundColor: '#222', borderRadius: 5, marginLeft: 10, justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontFamily: Utils.Font.Montserrat(500), fontSize: Utils.UI.normalizeFont(12), color: 'white', textAlign: 'center' }}>{ Services.LanguageService.string('NewIncomeOutcome.add_name') }</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => {
                                                Vibration.vibrate();
                                                showMessage({
                                                    message: Services.LanguageService.string('help'),
                                                    description: Services.LanguageService.string('NewIncomeOutcome.user_name_help'),
                                                    type: "success",
                                                    position: "bottom",
                                                    duration: 5000
                                                });
                                            }}
                                            style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                                            <Icon
                                                name={'help-box'}
                                                size={Utils.UI.normalizeFont(20)}
                                                color={Utils.Color.DarkGray}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            }

                            { this.state.showNameInput &&
                                <TextInput
                                    ref={(e) => { this.oweToInput = e; }}
                                    autoCapitalize={'words'}
                                    style={[styles.value, { marginTop: 10, color: Utils.Color.Primary, textAlign: 'center', width: '100%', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255, .2)', borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255, .4)', borderRightWidth: 1, borderRightColor: 'rgba(255,255,255, .4)', paddingBottom: 5 }]}
                                    value={transaction.owe_to_alias}
                                    onChangeText={(text) => {
                                        let transaction = this.state.transaction;
                                        transaction.owe_to_alias = text;
                                        this.setState({ transaction });
                                    }}
                                    placeholder={Services.LanguageService.string('NewIncomeOutcome.person_name')}
                                    placeholderTextColor={Utils.Color.Primary}
                                    selectionColor={Utils.Color.PrimaryDark}
                                    returnKeyType='done'
                                />
                            }

                            <View style={{ width: '100%', height: 1, backgroundColor: 'rgba(0,0,0,.05)', marginBottom: 5, marginTop: 20 }}></View>

                            { transaction.reminders != null && transaction.transaction_type_id == 2 && (transaction.is_owe == 1 || transaction.is_owe == true) && transaction.reminders.length == 0 &&
                                <View style={{ width: '100%', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                                    <Text style={{ flex: 1, textAlign: 'left', fontFamily: Utils.Font.Montserrat(400), color: Utils.Color.PrimaryDark, marginVertical: 10, fontSize: Utils.UI.normalizeFont(12) }}>
                                        { Services.LanguageService.string('NewIncomeOutcome.no_reminders') }
                                    </Text>
                                </View>
                            }

                            { transaction.transaction_type_id == 2 && (transaction.is_owe == 1 || transaction.is_owe == true) && transaction.reminders.map((e, index) => {
                                return (
                                    <View style={[styles.formInput, { flexDirection: 'column' }]}>
                                        <Text style={[styles.label, { marginBottom: 10, justifyContent: 'center', alignItems: 'center' }]}>
                                            <Icon
                                                name={'clock'}
                                                size={Utils.UI.normalizeFont(12)}
                                            /> { Services.LanguageService.string('reminder') } { index + 1 }
                                        </Text>
                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <TouchableWithoutFeedback
                                                onPress={() => {
                                                    this.setState({
                                                        showDatePickerIndex: index
                                                    });
                                                }}>
                                                <View style={[styles.valueContainer, { marginRight: 5 }]}>
                                                    <Text style={styles.value}>{ moment(this.state.transaction.reminders[index].datetime).isSame(moment(), 'day') ? Services.LanguageService.string('today') : moment(this.state.transaction.reminders[index].datetime).format('DD/MM/YYYY') }</Text>
                                                    <Icon
                                                        name={'arrow-down'}
                                                        style={{ marginLeft: 5 }}
                                                        size={18}
                                                    />
                                                </View>
                                            </TouchableWithoutFeedback>

                                            <TouchableWithoutFeedback
                                                onPress={() => {
                                                    this.setState({
                                                        showTimePickerIndex: index
                                                    });
                                                }}>
                                                <View style={[styles.valueContainer, { marginRight: 5 }]}>
                                                    <Text style={styles.value}>{ moment.utc(this.state.transaction.reminders[index].datetime).tz(RNLocalize.getTimeZone()).format('HH:mm') }</Text>
                                                    <Icon
                                                        name={'arrow-down'}
                                                        style={{ marginLeft: 5 }}
                                                        size={18}
                                                    />
                                                </View>
                                            </TouchableWithoutFeedback>

                                            <TouchableOpacity
                                                onPress={() => {
                                                    let transaction = this.state.transaction;
                                                    transaction.reminders.splice(index, 1);
                                                    Services.UIService.Animate();
                                                    this.setState({ transaction });
                                                }}
                                                style={[styles.valueContainer, { flex: 0, marginLeft: 5, backgroundColor: 'transparent', borderWidth: 2, borderColor: 'white' }]}>
                                                <Icon
                                                    name={'minus'}
                                                    size={Utils.UI.normalizeFont(13)}
                                                    color={Utils.Color.PrimaryRed}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })}

                            { transaction.transaction_type_id == 2 && (transaction.is_owe == 1 || transaction.is_owe == true) &&
                                <TouchableOpacity
                                    onPress={() => {
                                        Services.UIService.Animate();

                                        let transaction = this.state.transaction;
                                        let inFiveMinutes = moment().add(5, 'minute')
                                        transaction.reminders.push({
                                            datetime: inFiveMinutes
                                        });
                                        this.setState({ transaction });
                                    }}
                                    style={{ flex: 1, padding: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: Utils.Color.ErrorRed, borderRadius: 5, marginRight: 0 }}>
                                    <Icon
                                        name={'clock'}
                                        size={Utils.UI.normalizeFont(12)}
                                        color={Utils.Color.White}
                                    />
                                    <Text style={{ fontFamily: Utils.Font.Montserrat(500), fontSize: Utils.UI.normalizeFont(12), color: 'white' }}>{ Services.LanguageService.string('NewIncomeOutcome.add_reminder') }</Text>
                                </TouchableOpacity>
                            }

                            <View style={styles.formInput}>
                                <Txt style={styles.label}>{ Services.LanguageService.string('amount') }</Txt>
                                <View style={[styles.valueContainer, { padding: 0, borderWidth: 0 }]}>
                                    <Input
                                        style={styles.value}
                                        value={transaction.amount}
                                        onChangeText={(amount) => {
                                            let transaction = this.state.transaction;
                                            transaction.amount = amount;
                                            this.setState({ transaction });
                                        }}
                                        isNumberFormat={true}
                                        keyboardType={'numeric'}
                                        placeholder={Services.LanguageService.string('how_much')}
                                        placeholderTextColor={Utils.Color.setAlpha(Utils.Color.White, .5)}
                                        onSubmitEditing={() => {
                                            if(this.refs.description != null) {
                                                this.refs.description.focus();
                                            }
                                        }}
                                    />
                                </View>
                            </View>

                            <View style={styles.formInput}>
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                    <Txt style={[styles.label, { flex : 0, marginRight: 10 }]}>{ Services.LanguageService.string('keywords') }</Txt>
                                    <TouchableWithoutFeedback onPress={() => {
                                        Vibration.vibrate()
                                        showMessage({
                                            message: Services.LanguageService.string('help'),
                                            description: Services.LanguageService.string('NewIncomeOutcome.keyword_help'),
                                            type: "success",
                                            position: "bottom"
                                        });
                                    }}>
                                        <Icon
                                            name={'help-box'}
                                            size={Utils.UI.normalizeFont(20)}
                                            color={Utils.Color.Primary}
                                        />
                                    </TouchableWithoutFeedback>
                                </View>
                                <View style={[styles.valueContainer, { padding: 0, margin: 0 }]}>
                                    <Input
                                        ref={'description'}
                                        value={transaction.description}
                                        onChangeText={(text) => {
                                            let transaction = this.state.transaction;
                                            transaction.description = text;
                                            this.setState({ transaction });
                                        }}
                                        placeholder={Services.LanguageService.string('touch_to_type')}
                                        placeholderTextColor={Utils.Color.setAlpha(Utils.Color.White, .5)}
                                        style={styles.value}
                                        returnKeyType='done'
                                        onSubmitEditing={this.onSubmit}
                                    />
                                </View>
                            </View>

                            <Button
                                text={Services.LanguageService.string('save')}
                                textStyle={{ color: Utils.Color.White }}
                                buttonStyle={{ backgroundColor: Utils.Color.Primary, borderWidth: 0, marginTop: 20 }}
                                onPress={this.onSubmit}
                            />

                            { showDatePickerIndex != null &&
                                <DateTimePickerModal
                                    date={moment(this.state.transaction.reminders[showDatePickerIndex].datetime).toDate() || new Date()}
                                    isVisible={true}
                                    minimumDate={new Date()}
                                    mode="date"
                                    onConfirm={(e) => {
                                        let transaction = this.state.transaction;
                                        transaction.reminders[showDatePickerIndex].datetime = moment.utc(e);
                                        this.setState({ showDatePickerIndex : null, transaction });
                                    }}
                                    onCancel={() => {
                                        this.setState({ showDatePickerIndex : null });
                                    }}
                                />
                            }

                            { showTimePickerIndex != null &&
                                <DateTimePickerModal
                                    date={moment(this.state.transaction.reminders[showTimePickerIndex].datetime).toDate() || new Date()}
                                    isVisible={true}
                                    minimumDate={new Date()}
                                    mode="time"
                                    onConfirm={(e) => {
                                        let datetime = moment.utc(this.state.transaction.reminders[showTimePickerIndex].datetime);
                                        datetime.set({
                                            hour: moment.utc(e).get('hour'),
                                            minute: moment.utc(e).get('minute')
                                        });
                                        transaction.reminders[showTimePickerIndex].datetime = datetime;
                                        this.setState({ showTimePickerIndex : null, transaction });
                                    }}
                                    onCancel={() => {
                                        this.setState({ showTimePickerIndex : null });
                                    }}
                                />
                            }
                        </KeyboardAvoidingView>
                    }
                </ScrollView>

                {/* <KeyboardEntry /> */}

                <View
                    style={{ width: '100%', backgroundColor: Utils.Color.Red, justifyContent: 'center', alignItems: 'center', paddingVertical: 10 }}>
                    <Banner
                        size={"MINI_BANNER"}
                        style={{ top: 0, left: 0, backgroundColor: Utils.Color.Red, marginBottom: 5 }}
                        unitId={Services.AdsService.getBannerIdentifier('new_transaction')}
                        request={request.build()}
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
    sectionTitle: {
        flex: 0,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    sectionTitleText: {
        fontFamily: Utils.Font.Montserrat(700),
        fontSize: 30,
        color: Utils.Color.Primary
    },
    form: {
        flexDirection: 'column',
        padding: 10
    },
    formInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10
    },
    label: {
        flex: 1,
        justifyContent: 'flex-start',
        color: Utils.Color.DarkGray
    },
    valueContainer: {
        maxWidth: '49%',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        padding: 10,
        borderRadius: 5,
        maxHeight: 45
    },
    value: {
        flex: 1,
        alignSelf: 'center',
        fontFamily: Utils.Font.Montserrat(400),
        fontSize: Utils.UI.normalizeFont(13),
        color: 'white',
        height: '100%',
        width: '100%'
    }
});