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
    Dimensions
} from 'react-native';

// Modules
import _ from 'lodash';
import Icon from 'react-native-vector-icons/AntDesign';
import * as RNLocalize from "react-native-localize";
import moment from 'moment-timezone/builds/moment-timezone-with-data';
import 'moment/locale/es'
moment.locale('es');
moment.tz.setDefault(RNLocalize.getTimeZone());
/* import DatePicker from '../../node_modules_custom/react-native-daterange';
import DateTimePicker from '@react-native-community/datetimepicker'; */
import DatePicker from 'react-native-date-picker'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { showMessage, hideMessage } from "react-native-flash-message";

// Styles
import * as Utils from '../../styles'

// Components
import HeaderBar from 'app/src/components/HeaderBar';
import Container from 'app/src/components/Container'
import Button from '../../components/Button';

// Services
import * as Services from 'app/src/services';
import RNDateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

const DEFAULT_FILTERS = {
    date_from: moment().subtract(1, 'month'),
    date_to: moment(),
    transaction_type_id: 3
}

export default class FiltersTransactionsModal extends React.Component {

    // Hide header bar
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {
            showDatePickerFrom: false,
            showDatePickerTo: false,

            selectedTransactionTypes: this.props.navigation.state.params && this.props.navigation.state.params.filters.transaction_type_id != 3 ? [this.props.navigation.state.params.filters.transaction_type_id] : [1, 2],
            showDatePicker: false,
            filters: this.props.navigation.state.params != null ? this.props.navigation.state.params.filters : DEFAULT_FILTERS,
            categories: null,
            showShortcuts: false,
        };

        // Datepicker
        this.datePicker = null;
    }

    componentDidMount() {
        // Do nothing
        if(this.props.navigation.state.params) {
            const { filters } = this.props.navigation.state.params;
            let categories = _.filter(Services.TransactionService.categories, (e) => e.transaction_type_id == filters.transaction_type_id)
            this.setState({ categories });

            if(!filters.transaction_type_id) {
                this.setState({
                    selectedTransactionTypes: [1, 2]
                })
            }
        }
    }

    onSubmit = () => {
        if(this.props.navigation.state.params != null && this.props.navigation.state.params.onFilter){

            Services.AnalyticsService.postEvent({
                type: 'filter_results',
                view: 'FiltersTransactionsModal'
            });

            this.props.navigation.pop();

            // Save the filters
            let filters = this.state.filters;
            let selectedTransactionTypes = this.state.selectedTransactionTypes;

            // If it's 3, then we need to remove this filter
            /* if(filters.transaction_type_id == 3)
                delete filters.transaction_type_id; */
            if(_.filter(selectedTransactionTypes, i => i != null && i != undefined).length == 2) {
                delete filters.transaction_type_id;
            } else {
                filters.transaction_type_id = _.find(this.state.selectedTransactionTypes, i => i != null && i != undefined);
            }

            Services.TransactionService.setFilters(filters);
            this.props.navigation.state.params.onFilter(filters)
        }
    }

    render() {

        let {
            filters,
            showDatePicker,
            categories,
            selectedTransactionTypes
        } = this.state;

        return (
            <Container style={[styles.container]}>
                <HeaderBar
                    containerStyle={{ paddingTop: 0 }}
                    isBackButton={true}
                    navigation={this.props.navigation}
                    title={ Services.LanguageService.string('FiltersTransactionsModal.filter_my_results') }
                />

                <View style={[{ flex: 0, flexDirection: 'column', backgroundColor: Utils.Color.setAlpha(Utils.Color.Secondary, .1), borderRadius: 0, padding: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'rgba(0,0,0,0.025)', marginBottom: 10 }, Utils.Styles.Shadowed]}>
                    <TouchableOpacity
                        activeOpacity={.8}
                        onPress={() => {
                            Services.UIService.Animate();
                            this.setState({ showShortcuts : !this.state.showShortcuts });
                        }}
                        style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontFamily: Utils.Font.Montserrat(300), fontSize: Utils.UI.normalizeFont(12), textAlign: 'center' }}>{ Services.LanguageService.string('FiltersTransactionsModal.shortcuts') }</Text>
                        <Icon
                            name={'caretdown'}
                            style={{ marginLeft: 10 }}
                        />
                    </TouchableOpacity>

                    { this.state.showShortcuts &&
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: '100%', marginTop: 10 }}>
                            <TouchableOpacity
                                activeOpacity={.95}
                                onPress={() => {
                                    categories = _.filter(Services.TransactionService.categories, (e) => e.transaction_type_id == 1)
                                    selectedTransactionTypes = [1];
                                    filters.date_from = moment().subtract(1, 'month');
                                    filters.date_to = moment();
                                    filters.transaction_type_id = 1;
                                    filters.categories = _.map(_.filter(categories, (e) => e.transaction_type_id == 1), (e) => e.id)
                                    this.setState({ filters, categories, selectedTransactionTypes });
                                }}
                                style={{ backgroundColor: Utils.Color.Secondary, justifyContent: 'center', alignItems: 'center', padding: 10, marginRight: 5, borderRadius: 5, backgroundColor: Utils.Color.Secondary, marginTop: 10 }}>
                                <Text style={{ fontFamily: Utils.Font.Montserrat(500), fontSize: Utils.UI.normalizeFont(13), textAlign: 'center', color: 'white' }}>Ingresos del mes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={.95}
                                onPress={() => {
                                    selectedTransactionTypes = [2];
                                    categories = _.filter(Services.TransactionService.categories, (e) => e.transaction_type_id == 2)
                                    filters.date_from = moment().subtract(1, 'month');
                                    filters.date_to = moment();
                                    filters.transaction_type_id = 2;
                                    filters.categories = _.map(_.filter(categories, (e) => e.transaction_type_id == 2), (e) => e.id)
                                    this.setState({ filters, categories, selectedTransactionTypes });
                                }}
                                style={{ backgroundColor: Utils.Color.Secondary, justifyContent: 'center', alignItems: 'center', padding: 10, marginRight: 5, borderRadius: 5, backgroundColor: Utils.Color.Secondary, marginTop: 10 }}>
                                <Text style={{ fontFamily: Utils.Font.Montserrat(500), fontSize: Utils.UI.normalizeFont(13), textAlign: 'center', color: 'white' }}>Gastos del mes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={.95}
                                onPress={() => {
                                    categories = _.filter(Services.TransactionService.categories, (e) => e.transaction_type_id == 2)
                                    selectedTransactionTypes = [1, 2];
                                    filters.date_from = moment().subtract(3, 'month');
                                    filters.date_to = moment();
                                    filters.transaction_type_id = 3;
                                    filters.categories = _.map(_.filter(categories, (e) => e.transaction_type_id == 2), (e) => e.id)
                                    this.setState({ filters, categories, selectedTransactionTypes });
                                }}
                                style={{ backgroundColor: Utils.Color.Secondary, justifyContent: 'center', alignItems: 'center', padding: 10, marginRight: 5, borderRadius: 5, backgroundColor: Utils.Color.Secondary, marginTop: 10 }}>
                                <Text style={{ fontFamily: Utils.Font.Montserrat(500), fontSize: Utils.UI.normalizeFont(13), textAlign: 'center', color: 'white' }}>Todo en los últimos 3 meses</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={.95}
                                onPress={() => {
                                    categories = _.filter(Services.TransactionService.categories, (e) => e.transaction_type_id == 2)
                                    selectedTransactionTypes = [1, 2];
                                    filters.date_from = moment().subtract(1, 'year');
                                    filters.date_to = moment();
                                    filters.transaction_type_id = 3;
                                    filters.categories = _.map(_.filter(categories, (e) => e.transaction_type_id == 2), (e) => e.id)
                                    this.setState({ filters, categories, selectedTransactionTypes });
                                }}
                                style={{ backgroundColor: Utils.Color.Secondary, justifyContent: 'center', alignItems: 'center', padding: 10, marginRight: 5, borderRadius: 5, backgroundColor: Utils.Color.Secondary, marginTop: 10 }}>
                                <Text style={{ fontFamily: Utils.Font.Montserrat(500), fontSize: Utils.UI.normalizeFont(13), textAlign: 'center', color: 'white' }}>Todo el año</Text>
                            </TouchableOpacity>
                        </View>
                    }
                </View>

                <Text style={{ textAlign: 'center', marginVertical: 0, fontSize: Utils.UI.normalizeFont(15), marginTop: 5, marginBottom: 0, fontFamily: Utils.Font.Montserrat(600), color: Utils.Color.DarkGray, marginRight: 5 }}>Fecha</Text>

                <View style={{ width: '100%', justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row', marginTop: 10 }}>
                    <TouchableOpacity
                        onPress={() => {
                            Services.UIService.Animate();
                            this.setState({ showDatePickerFrom : !this.state.showDatePickerFrom, showDatePickerTo: false });
                        }}
                        style={{ backgroundColor: Utils.Color.Primary, padding: 20, width: '40%', justifyContent: 'center', alignItems: 'center', borderRadius: 5, ...Utils.Styles.Shadowed }}>
                        <Text style={{ fontFamily: Utils.Font.Montserrat(800), color: Utils.Color.White }}>
                            { this.state.filters.date_from.format('DD MMM YYYY') }
                        </Text>
                    </TouchableOpacity>

                    <Text style={{ fontFamily: Utils.Font.Montserrat(800), fontSize: Utils.UI.normalizeFont(10), color: Utils.Color.Primary }}> hasta </Text>

                    <TouchableOpacity
                        onPress={() => {
                            Services.UIService.Animate();
                            this.setState({ showDatePickerFrom : false, showDatePickerTo: !this.state.showDatePickerTo });
                        }}
                        style={{ backgroundColor: Utils.Color.Primary, padding: 20, width: '40%', justifyContent: 'center', alignItems: 'center', borderRadius: 5, ...Utils.Styles.Shadowed }}>
                        <Text style={{ fontFamily: Utils.Font.Montserrat(800), color: Utils.Color.White }}>
                            { this.state.filters.date_to.format('DD MMM YYYY') }
                        </Text>
                    </TouchableOpacity>
                </View>

                { (this.state.showDatePickerFrom || this.state.showDatePickerTo) &&
                    <View style={{ width: '100%', marginTop: 20 }}>
                        { this.state.showDatePickerFrom &&
                            <DatePicker
                                locale={'es'}
                                date={moment(this.state.filters.date_from).toDate()}
                                onDateChange={(date) => {
                                    let filters = this.state.filters;
                                    filters.date_from = moment.utc(date);
                                    this.setState({
                                        filters
                                    });
                                }}
                                mode={'date'}
                                style={{ width: width, height: 150 }}
                            />
                        }

                        { this.state.showDatePickerTo &&
                            <DatePicker
                                locale={'es'}
                                date={moment(this.state.filters.date_to).toDate()}
                                minimumDate={moment(this.state.filters.date_from).toDate()}
                                onDateChange={(date) => {
                                    let filters = this.state.filters;
                                    filters.date_to = moment.utc(date);
                                    this.setState({
                                        filters
                                    });
                                }}
                                mode={'date'}
                                style={{ width: width, height: 150 }}
                            />
                        }
                    </View>
                }

                <Text style={{ textAlign: 'center', marginVertical: 0, fontSize: Utils.UI.normalizeFont(15), marginTop: 5, marginBottom: 0, fontFamily: Utils.Font.Montserrat(600), color: Utils.Color.DarkGray, marginRight: 5, marginTop: 20 }}>Mostrar sólo</Text>

                <View style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', marginTop: 10, paddingHorizontal: 5 }}>
                    <TouchableOpacity
                        onPress={() => {
                            if(selectedTransactionTypes.indexOf(1) > -1) {
                                if(selectedTransactionTypes.length > 0) {
                                    selectedTransactionTypes.splice(selectedTransactionTypes.indexOf(1), 1);
                                }
                            } else {
                                selectedTransactionTypes.push(1);
                            }

                            if(selectedTransactionTypes.length > 0) {
                                if(selectedTransactionTypes.length == 2) {
                                    filters.transaction_type_id = 3;
                                } else {
                                    filters.transaction_type_id = selectedTransactionTypes[0];
                                }
                            }
                            this.setState({
                                selectedTransactionTypes,
                                filters
                            })

                            this.setState({ selectedTransactionTypes })
                        }}
                        activeOpacity={.95}
                        style={{ width: '40%', backgroundColor: Utils.Color.setAlpha(Utils.Color.SecondaryLight, selectedTransactionTypes.indexOf(1) > -1 ? 1 : 0.2), padding: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 5, ...Utils.Styles.Shadowed }}>
                        <Text style={{ fontFamily: Utils.Font.Montserrat(800), color: Utils.Color.White, textAlign: 'center' }}>
                            Ingresos
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            if(selectedTransactionTypes.indexOf(2) > -1) {
                                if(selectedTransactionTypes.length > 0) {
                                    selectedTransactionTypes.splice(selectedTransactionTypes.indexOf(2), 1);
                                }
                            } else {
                                selectedTransactionTypes.push(2);
                            }

                            if(selectedTransactionTypes.length > 0) {
                                if(selectedTransactionTypes.length == 2) {
                                    filters.transaction_type_id = 3;
                                } else {
                                    filters.transaction_type_id = selectedTransactionTypes[0];
                                }
                            }
                            this.setState({
                                selectedTransactionTypes,
                                filters
                            })
                        }}
                        activeOpacity={.95}
                        style={{ width: '40%', backgroundColor: Utils.Color.setAlpha(Utils.Color.SecondaryLight, selectedTransactionTypes.indexOf(2) > -1 ? 1 : 0.2), padding: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 5, ...Utils.Styles.Shadowed }}>
                        <Text style={{ fontFamily: Utils.Font.Montserrat(800), color: Utils.Color.White, textAlign: 'center' }}>
                            Gastos
                        </Text>
                    </TouchableOpacity>
                </View>

                { false &&
                    <View style={[styles.form]}>

                        <View style={styles.formInput}>
                            <TouchableWithoutFeedback
                                onPress={() => {
                                    this.props.navigation.push('OptionsPickerModal', {
                                        options: [
                                            { id: 1, label: Services.LanguageService.string('FiltersTransactionsModal.incomes') },
                                            { id: 2, label: Services.LanguageService.string('FiltersTransactionsModal.expenses'), labelStyle: { color: Utils.Color.ErrorRed } },
                                            { id: 3, label: Services.LanguageService.string('FiltersTransactionsModal.both_incomes_expenses') },
                                        ],
                                        onSelectedOption: (option) => {
                                            let filters = this.state.filters;
                                            filters.transaction_type_id = option.id;
                                            categories = _.filter(Services.TransactionService.categories, (e) => e.transaction_type_id == option.id);
                                            filters.categories = _.map(categories, 'id');
                                            // delete filters.categories;
                                            this.setState({
                                                filters,
                                                categories
                                            });

                                            this.props.navigation.pop();
                                        }
                                    })
                                }}>
                                <View style={styles.valueContainer}>
                                    <Text style={styles.value}>{ this.state.filters.transaction_type_id == 1 ? Services.LanguageService.string('FiltersTransactionsModal.incomes') : (this.state.filters.transaction_type_id == 2 ? Services.LanguageService.string('FiltersTransactionsModal.expenses') : Services.LanguageService.string('FiltersTransactionsModal.both_incomes_expenses')) }</Text>
                                    <Icon
                                        name={'caretdown'}
                                        style={{ marginLeft: 5 }}
                                        color={'#222'}
                                        size={Utils.UI.normalizeFont(11)}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>

                        { this.state.categories != null &&
                            <View style={[styles.formInput, { justifyContent: 'flex-start', flexWrap: 'wrap' }]}>
                                { this.state.categories != null && this.state.categories.map((e) => {
                                    let opacity = .3;
                                    if(filters.categories != null)
                                        opacity = filters.categories.indexOf(e.id) > -1 ? 1 : .3;

                                    return (
                                        <TouchableOpacity
                                            style={{ padding: 8, marginRight: 5, marginBottom: 5, backgroundColor: opacity == 1 ? Utils.Color.SuccessGreen : Utils.Color.ErrorRed, borderRadius: 3, opacity: 1 }}
                                            onPress={() => {
                                                if(filters.categories == null)
                                                    filters.categories = [];

                                                if(filters.categories.indexOf(e.id) > -1) {
                                                    filters.categories.splice(filters.categories.indexOf(e.id), 1);
                                                } else {
                                                    filters.categories.push(e.id);
                                                }

                                                this.setState({
                                                    filters
                                                });
                                            }}>
                                            <Text style={{ fontFamily: Utils.Font.Montserrat(500), color: 'white' }}>{ e.name }</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        }
                    </View>
                }

                <Button
                    text={'Filtrar'}
                    textStyle={{ color: Utils.Color.White, fontSize: Utils.UI.normalizeFont(13) }}
                    buttonStyle={{ width: '97%', backgroundColor: Utils.Color.Primary, alignSelf: 'center', marginTop: 5, padding: 3, borderWidth: 2, borderColor: 'rgba(255,255,255,.85)', borderRadius: 5, borderWidth: 0, borderColor: 'rgba(0,0,0,.4)', marginTop: 20 }}
                    icon={
                        <Icon
                            name={'filter'}
                            size={Utils.UI.normalizeFont(13)}
                            style={{ marginRight: 10 }}
                            color={Utils.Color.PrimaryLight}
                        />
                    }
                    onPress={this.onSubmit}
                />

                {/* <Button
                    text={Services.LanguageService.string('FiltersTransactionsModal.filter')}
                    textStyle={{ color: 'white' }}
                    buttonStyle={{ width: '100%', backgroundColor: Utils.Color.Primary, alignSelf: 'center', marginTop: 0, padding: 10, height: 'auto', borderWidth: 1, borderColor: 'rgba(255,255,255,1)', borderRadius: 0 }}
                    onPress={this.onSubmit}
                /> */}
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
        fontFamily: Utils.Font.Montserrat(600),
        fontSize: 30,
        color: '#222'
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
        marginVertical: 10,
        width: '95%',
        alignSelf: 'center'
    },
    label: {
        flex: 1,
        justifyContent: 'flex-start',
        textAlign: 'center',
        fontFamily: Utils.Font.Montserrat(800),
        fontSize: Utils.UI.normalizeFont(14),
        color: '#222'
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
        borderRadius: 2
    },
    value: {
        fontFamily: Utils.Font.Montserrat(400),
        fontSize: 14,
        color: '#222'
    }
});