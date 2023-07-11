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
    ScrollView
} from 'react-native';

// Modules
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import 'moment/locale/es'
moment.locale('es');
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { showMessage, hideMessage } from "react-native-flash-message";

// Styles
import * as Utils from '../../styles'

// Components
import Container from '../../components/Container';
import HeaderBar from '../../components/HeaderBar'
import Button from '../../components/Button';

// Services
import * as Services from 'app/src/services';

export default class TransactionDetailsModal extends React.Component {

    // Hide header bar
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {
        Services.AnalyticsService.postEvent({
            type: 'view_transaction_details',
            view: 'TransactionDetailsModal'
        });
    }

    render() {
        const transaction = this.props.navigation.getParam('transaction');

        const isIncome = transaction.transaction_type_id == 1;
        // let backgroundColor = transaction.transaction_type_id == 1 ? Utils.Color.SuccessGreen : Utils.Color.ErrorRed;
        let backgroundColor = Utils.Color.White;
        let typeText = transaction.transaction_type_id == 1 ? 'Ingreso' : 'Egreso';

        return (
            <Container
                inheritedProps={this.props}
                style={[styles.container, { backgroundColor : backgroundColor }]}>
                
                <View style={{ paddingLeft: 0 }}>
                    <HeaderBar
                        containerStyle={{ paddingTop: 0 }}
                        isBackButton={true}
                        navigation={this.props.navigation}
                        title={'Detalles'}
                    />
                </View>

                <ScrollView style={{ flex : 1 }}>
                    <View style={{ flex: 1, width: '100%', padding: 10, alignItems: 'center' }}>
                        <Text style={{ fontFamily: Utils.Font.Montserrat(800), fontSize: Utils.UI.normalizeFont(30), color: isIncome ? Utils.Color.Secondary : Utils.Color.PrimaryRed, marginVertical: 5, backgroundColor: 'white', padding: 5, borderRadius: 5, overflow: 'hidden', marginBottom: 0 }}>{ Services.CurrencyService.formatCurrency(transaction.amount) }</Text>

                        { transaction.description != null &&
                            <Text style={{ fontFamily: Utils.Font.Montserrat(400), fontSize: Utils.UI.normalizeFont(14), color: Utils.Color.DarkGray, marginVertical: 5 }}>{ transaction.description }</Text>
                        }

                        { (!transaction.is_owe || transaction.is_owe == 0) && transaction.categories != null && transaction.categories.length > 0 &&
                            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 5, marginBottom: 10 }}>
                                <View style={{ backgroundColor: transaction.categories[0].color_hex, width: 30, height: 30, borderRadius: 15, borderWidth: 0, borderColor: 'white' }}></View>
                                <Text style={{ fontFamily: Utils.Font.Montserrat(400), fontSize: 15, color: Utils.Color.DarkGray, marginLeft: 10 }}>{ transaction.categories[0].name }</Text>
                            </View>
                        }

                        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                            <Text style={{ fontFamily: Utils.Font.Montserrat(400), fontSize: Utils.UI.normalizeFont(11), color: Utils.Color.DarkGray, marginLeft: 10 }}>{ moment(transaction.created_at).fromNow() }</Text>
                            <Text style={{ fontFamily: Utils.Font.Montserrat(400), fontSize: Utils.UI.normalizeFont(11), color: Utils.Color.DarkGray, marginLeft: 10 }}>({ moment(transaction.created_at).format('YYYY-MM-DD HH:mm') })</Text>
                        </View>

                        { transaction != null && transaction.user_account && transaction.user_account.user &&
                            <View style={{ flexDirection: 'row', marginTop: 30, alignItems: 'center' }}>
                                <Image
                                    source={{ uri: `https://ui-avatars.com/api/?name=${transaction.user_account.user.name.replace(' ', '+')}` }}
                                    style={{ borderRadius: 18, width: 36, height: 36 }}
                                />
                                <Text style={{ fontFamily: Utils.Font.Montserrat(200), fontSize: Utils.UI.normalizeFont(11), color: Utils.Color.DarkGray, marginLeft: 5 }}>Creado por { transaction.user_account.user.name }</Text>
                            </View>
                        }

                        { (transaction.is_owe == true || transaction.is_owe == 1) &&
                            <View style={{ width: '100%', backgroundColor: transaction.status == 'paid' ? Utils.Color.SuccessGreen : 'rgba(0,0,0,.1)', padding: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 3 }}>

                                { transaction.status_string != null &&
                                    <Text style={{ fontFamily: Utils.Font.Montserrat(600), fontSize: Utils.UI.normalizeFont(13), color: 'white', marginVertical: 5, textDecorationLine: 'underline' }}>{ transaction.status_string }</Text>
                                }

                                { transaction.reminders != null && transaction.reminders.length > 0 && transaction.reminders.map((e) => {
                                    let reminder = moment(e.datetime);

                                    if(reminder < moment()){
                                        // It's already notified
                                        return (
                                            <View style={{ width: '100%', backgroundColor: 'transparent', flexDirection: 'row', padding: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 3 }}>
                                                <Icon
                                                    name={'check'}
                                                    size={Utils.UI.normalizeFont(13)}
                                                    color={'white'}
                                                />
                                                <Text style={{ fontFamily: Utils.Font.Montserrat(600), fontSize: Utils.UI.normalizeFont(13), color: 'white', marginVertical: 3, marginLeft: 5 }}>Se recordó el {reminder.format('DD/MM [a las] HH:mm')}</Text>
                                            </View>
                                        );
                                    }

                                    return (
                                        <View style={{ width: '100%', backgroundColor: 'transparent', flexDirection: 'row', padding: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 3 }}>
                                            <Icon
                                                name={'clock'}
                                                size={Utils.UI.normalizeFont(13)}
                                                color={'white'}
                                            />
                                            <Text style={{ fontFamily: Utils.Font.Montserrat(600), fontSize: Utils.UI.normalizeFont(13), color: 'white', marginVertical: 3, marginLeft: 5 }}>Recordatorio el {reminder.format('DD/MM [a las] HH:mm')}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        }

                        <View style={{ width: '100%', flexDirection: 'row' }}>
                            <Text style={{ width: '100%', textAlign: 'center', fontFamily: Utils.Font.Montserrat(400), fontSize: 15, color: 'white', marginVertical: 5 }}>{ Services.LanguageService.string('TransactionDetailsModal.created') } { moment.utc(transaction.created_at).fromNow() }</Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={{ flex : 0, justifyContent: 'center', alignItems: 'center' }}>
                    { transaction.can_delete && transaction.transaction_type_id == 2 && (transaction.is_owe == true || transaction.is_owe == 1) && transaction.status != 'paid' &&
                        <TouchableOpacity
                            onPress={() => {

                                this.props.screenProps.showInteractableAlertWithButtons('Marcar como pago', '¿Estás seguro? Si hay algún usuario involucrado en este movimiento, se le notificará sobre esta acción.', [
                                    {
                                        id: 1,
                                        text: 'Confirmar',
                                        onPress: () => {
                                            this.props.screenProps.hideInteractableAlert()

                                            this.props.screenProps.setLoading(true);
                                            transaction.status = 'paid';
                                            Services.TransactionService.createTransaction(transaction, (data) => {
                                                if(data.success) {
                                                    showMessage({
                                                        message: Services.LanguageService.string('success'),
                                                        description: Services.LanguageService.string('success_message'),
                                                        type: "success",
                                                    });

                                                    Services.AnalyticsService.postEvent({
                                                        type: 'post_paid_transaction',
                                                        view: 'TransactionDetailsModal'
                                                    });

                                                    this.props.screenProps.setLoading(false);
                                                    this.props.navigation.pop();
                                                } else {
                                                    this.props.screenProps.setLoading(false);
                                                    if(data.message) {
                                                        showMessage({
                                                            message: "Error",
                                                            description: data.message,
                                                            type: "danger",
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    }
                                ], {
                                    vibrate: true,
                                    shadowBackgroundImage: require('app/src/assets/images/interactable_alert/header_3.png'),
                                    shadowBackgroundColor: '#3ac1b0'
                                });
                            }}
                            style={{ width: '100%', padding: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: Utils.Color.SuccessGreen }}>
                            <Text style={{ fontFamily: Utils.Font.Montserrat(800), color: 'white' }}>{ Services.LanguageService.string('TransactionDetailsModal.mark_as_paid') }</Text>
                        </TouchableOpacity>
                    }

                    { transaction.can_edit == true &&
                        <TouchableOpacity
                            onPress={() => {
                                this.props.navigation.push('NewIncomeOutcome', {
                                    type: 1, // Income
                                    transaction: transaction,
                                    onCreated: () => {
                                        // Here
                                        this.props.navigation.pop();
                                        if(this.props.navigation.state.params.onReload)
                                            this.props.navigation.state.params.onReload();
                                    }
                                });
                            }}
                            style={{ width: '100%', padding: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: Utils.Color.Primary }}>
                            <Text style={{ fontFamily: Utils.Font.Montserrat(600), color: 'white', fontSize: Utils.UI.normalizeFont(14) }}>{ Services.LanguageService.string('edit') }</Text>
                        </TouchableOpacity>
                    }

                    <TouchableOpacity
                        onPress={() => {
                            this.props.navigation.state.params.onDelete(transaction);
                        }}
                        style={{ width: '100%', padding: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: Utils.Color.PrimaryRed }}>
                        <Text style={{fontFamily: Utils.Font.Montserrat(600), color: 'white', fontSize: Utils.UI.normalizeFont(14) }}>{ Services.LanguageService.string('delete_transaction') }</Text>
                    </TouchableOpacity>
                </View>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#877aaf'
    },
    sectionTitle: {
        flex: 0,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    sectionTitleText: {
        fontFamily: Utils.Font.Montserrat(600),
        fontSize: 30,
        color: 'white'
    },
    form: {
        flex: 0,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
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
        fontFamily: Utils.Font.Montserrat(800),
        fontSize: 18,
        color: 'white'
    },
    valueContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        padding: 10,
        borderRadius: 5
    },
    value: {
        fontFamily: Utils.Font.Montserrat(500),
        fontSize: 14,
        color: '#222'
    }
});