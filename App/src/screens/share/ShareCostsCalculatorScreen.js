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
    Dimensions,
    FlatList
} from 'react-native';

// Modules
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import IconEntypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import 'moment/locale/es'
moment.locale('es');
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { showMessage, hideMessage } from "react-native-flash-message";
import Modal from "react-native-modalbox";
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import _ from 'lodash';
import {
    FAB,
    Menu,
    Divider,
    Card,
    Title,
    Paragraph,
    Surface,
    Snackbar
} from 'react-native-paper';

// Styles
import * as Utils from '../../styles'

// Components
import Container from 'app/src/components/Container'
import Button from '../../components/Button';

// Services
import * as Services from 'app/src/services'
import { Txt } from 'app/src/components';

const { width, height } = Dimensions.get('window');

var ID = function () {
    return '_' + Math.random().toString(36).substr(2, 9);
};

export default class TransactionDetailsModal extends React.Component {

    // Hide header bar
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {
            visibleMenuId: null,
            event: {
                name: '',
                people: []
            },
            isSynchronizing: false,
            currentPeople: null,
            currentItem: null
        };

        this.intervalSynchronize = null;
    }

    componentDidMount() {
        const { getParam } = this.props.navigation;
        const event = getParam('event');

        this.props.screenProps.setLoading(true);
        Services.EventService.getEventById(event.id, (data) => {
            this.props.screenProps.setLoading(false);
            if(data.success) {
                this.setState({ event : data.event });
            }
        }, (err) => null);

        /*this.intervalSynchronize = setInterval(() => {
            this.setState({ isSynchronizing: true });
            this.updateEvent(this.state.event, () => {
                setTimeout(() => {
                    this.setState({ isSynchronizing: false });
                }, 5000);
            }, () => {
                setTimeout(() => {
                    this.setState({ isSynchronizing: false });
                }, 5000);
            });
        }, 25000);*/
    }

    componentWillUnmount() {
        if(this.intervalSynchronize)
            clearInterval(this.intervalSynchronize);
    }

    onCalculate = () => {

        const { event } = this.state;
        if(!event || event.people.length == 0){
            Alert.alert(
                'Oops',
                'Tenés que agregar gastos para sacar cálculos',
                [{
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {text: 'Agregar', onPress: () => {
                    this.props.navigation.push('ShareCostsAddConceptModal', {
                        onAddItem: (item) => {

                            Services.AnalyticsService.postEvent({
                                type: 'add_item',
                                view: 'ShareCostsCalculatorScreen'
                            });

                            this.onAddConcept(item);
                            this.props.navigation.pop();
                        }
                    });
                }},
              ],
              {cancelable: false},
            )
            return null;
        }

        // Analyze
        const people = _.map(this.state.event.people, (e) => {
            return {
                id: e.id,
                id_author: e.id,
                name: e.name
            }
        });

        const totalAmount = _.sumBy(event.people, (e) => _.sumBy(e.items, 'amount'));
        const totalPeople = event.people.length;

        // At first, recollect data then after this, do a loop and recognize who needs to pay who.
        for(var idx in event.people) {
            const person = event.people[idx];

            // Set caracteristics to items
            _.forEach(_.flattenDeep(_.map(event.people, (i) => i.items)), (item) => {
                item.dividedBy = totalPeople - item.excluded_people.length;
                item.amountPerCapita = item.amount;
                if(item.dividedBy > 0)
                    item.amountPerCapita = parseFloat(item.amount) / item.dividedBy;
            });

            // Set items that this user has consummed
            person.itemsConsummed = _.filter(
                _.flattenDeep(_.map(event.people, (people) => people.items)), (i) => i.excluded_people.find((m) => m.people_id == person.id) == null
            );

            // Set total amount that this person has consumed
            person.totalAmountPaid = _.sumBy(person.items, 'amount');
            person.totalAmountConsummed = _.sumBy(person.itemsConsummed, (i) => parseFloat(i.amountPerCapita));
            person.amountDue = parseFloat(person.totalAmountPaid) - parseFloat(person.totalAmountConsummed);
            person.partialAmountDue = person.amountDue;
        }

        this.props.navigation.push('ShareCostsResultScreen', {
            event
        });
    }

    onAddConcept(concept) {
        let event = this.state.event;
        concept.id = ID();

        if(concept.people_id) { // Put this item in the specific person
            let index = event.people.findIndex((e) => e.id == concept.people_id);
            if(index > -1) {
                event.people[index].items.push({
                    id: ID(),
                    concept: concept.concept,
                    amount: concept.amount,
                    excluded_people: []
                });
            }
        } else {
            let items = concept.concept != null ? [{
                concept: concept.concept,
                amount: concept.amount,
                excluded_people: []
            }] : [];

            event.people.push({
                id: ID(),
                name: concept.author,
                items: items
            });
        }

        this.updateEvent(event);
    }

    updateEvent = (event, callback = null, error = null) => {
        // Push to server
        Services.EventService.postEvent(event, (data) => {
            if(data.event != null){
                if(callback)
                    callback(data.event);
                this.setState({ event : data.event })
            } else {
                if(error)
                    error(data);
                showMessage({
                    message: "Oh oh!",
                    description: "No pudimos actualizar esta fila. Inténtalo nuevamente",
                    type: "danger",
                });
            }
        }, (err) => {
            if(error)
                error(err);
            // Do nothing
            showMessage({
                message: "Oh oh!",
                description: "No pudimos actualizar esta fila. Inténtalo nuevamente",
                type: "danger",
            });
        });

        this.setState({
            event
        });
    }

    _openMenu = (itemId) => {
        this.setState({ visibleMenuId: itemId })
    };

    _closeMenu = () => {
        this.setState({ visibleMenuId: null })
    };

    render() {

        return (
            <SafeAreaView style={[styles.container, { backgroundColor : Utils.Color.Primary }]}>

                <View style={{ width: '100%', alignSelf: 'center', height: 'auto', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <TouchableOpacity
                        style={{ paddingTop: 0, paddingRight: 20, paddingBottom: 20, paddingLeft: 15 }}
                        onPress={() => {
                            this.props.navigation.pop();
                        }}>
                        <Text style={{ fontFamily: Utils.Font.Montserrat(600), fontSize: 16, color: '#fff' }}>{ Services.LanguageService.string('back') }</Text>
                    </TouchableOpacity>
                </View>

                <Text style={{ width: '95%', alignSelf: 'center', backgroundColor: 'rgba(0,0,0,.1)', padding: 10, fontFamily: Utils.Font.Montserrat(700), color: 'rgba(255,255,255,.9)', textAlign: 'center', fontSize: Utils.UI.normalizeFont(15), borderRadius: 2, overflow: 'hidden' }}>{ this.state.event.name } - { Services.CurrencyService.formatCurrency(_.sumBy(this.state.event.people, (e) => _.sumBy(e.items, 'amount'))) }</Text>

                { !this.state.event || !this.state.event.people || this.state.event.people.length == 0 &&
                    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginVertical: 10 }}>
                        <LottieView
                            source={require('app/src/assets/animations/calculator.json')}
                            autoPlay
                            style={{ width : width / 1.5 }}
                        />
                        <Text style={{ fontFamily: Utils.Font.Montserrat(600), color: 'white', fontSize: Utils.UI.normalizeFont(13), textAlign: 'center', maxWidth: '90%', alignSelf: 'center', marginVertical: 10 }}>{ Services.LanguageService.string('ShareCosts.tutorial_text_2') }</Text>
                    </View>
                }

                { this.state.event && this.state.event.people && this.state.event.people.length > 0 &&
                    <ScrollView style={{ flex : 1 }}>
                        { this.state.event && this.state.event.people.length > 0 && this.state.event.people.map((e, indexPeople) => {
                            return (
                                <Card style={{ backgroundColor: 'rgba(0,0,0,.2)', marginVertical: 10, width: '95%', alignSelf: 'center' }}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            Alert.alert(
                                                "Estás seguro?",
                                                "Esta persona se eliminará de la lista junto con todos sus conceptos cargados.",
                                                [
                                                  {
                                                    text: "Eliminar",
                                                    onPress: () => {
                                                        let event = this.state.event;
                                                        event.people.splice(event.people.indexOf(e), 1);
                                                        this.updateEvent(event);
                                                        
                                                        showMessage({
                                                            message: Services.LanguageService.string('success'),
                                                            description: Services.LanguageService.string('ShareCosts.removed_from_list'),
                                                            type: "success",
                                                        });
                                                    }
                                                  },
                                                  {
                                                    text: "Cancelar",
                                                    onPress: () => null,
                                                    style: "cancel"
                                                  }
                                                ],
                                                { cancelable: false }
                                            );
                                        }}
                                        style={{ position: 'absolute', top: 0, right: 0, padding: 15, zIndex: 99999999 }}>
                                        <Icon
                                            name={'minuscircle'}
                                            size={Utils.UI.normalizeFont(16)}
                                            color={Utils.Color.White}
                                        />
                                    </TouchableOpacity>
                                    <Card.Title
                                        title={e.name}
                                        titleStyle={{ fontFamily: Utils.Font.Montserrat(900), fontWeight: '900', color: 'white' }}
                                        subtitle={Services.CurrencyService.formatCurrency(_.sumBy(e.items, (i) => parseFloat(i.amount)))}
                                        subtitleStyle={{ fontFamily: Utils.Font.Montserrat(900), color: 'white' }}
                                        /* right={() => {
                                            return (
                                                <Menu
                                                    visible={this.state.visibleMenuId == e.id}
                                                    onDismiss={this._closeMenu}
                                                    anchor={
                                                        <TouchableOpacity
                                                            style={{ flex: 0, marginRight: 5, padding: 10 }}
                                                            onPress={() => this._openMenu(e.id)}>
                                                            <IconEntypo
                                                                name='dots-three-vertical'
                                                                color='white'
                                                                size={20}
                                                            />
                                                        </TouchableOpacity>
                                                    }>
                                                    <Menu.Item onPress={() => {
                                                        this._closeMenu();
                                                        let event = this.state.event;
                                                        event.people.splice(event.people.indexOf(e), 1);
                                                        this.updateEvent(event);
                                                        
                                                        showMessage({
                                                            message: Services.LanguageService.string('success'),
                                                            description: Services.LanguageService.string('ShareCosts.removed_from_list'),
                                                            position: "bottom",
                                                            type: "success",
                                                        });
                                                    }} title={Services.LanguageService.string('delete')} />

                                                    { e.concept != null && e.concept.length > 0 &&
                                                        <Divider />
                                                    }

                                                    { e.concept != null && e.concept.length > 0 &&
                                                        <Menu.Item onPress={() => {
                                                            this._closeMenu();

                                                            let people = this.state.items.map((e) => {
                                                                return {
                                                                    id_author: e.id_author,
                                                                    name: e.author
                                                                }
                                                            });

                                                        }} title="Ver participantes" />
                                                    }
                                                </Menu>
                                            )
                                        }} */
                                    />

                                    <Card.Content>
                                        <View style={{ width: '100%', flexDirection: 'row', marginVertical: 0, justifyContent: 'center', alignItems: 'center', paddingTop: 0 }}>

                                            <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width: '100%' }}>

                                                { e.items && e.items.length > 0 ?
                                                    <Txt black style={{ color: 'white' }}>Conceptos de { e.name }</Txt>
                                                :
                                                    <Txt light style={{ color: 'white' }}>No tiene conceptos</Txt>
                                                }

                                                { e.items && e.items.length > 0 && e.items.map((i, indexItem) => {
                                                    let textExcludePeople = '';
                                                    let excludedPeople = [];
                                                    if(i.excluded_people && i.excluded_people.length > 0) {
                                                        excludedPeople = _.filter(this.state.event.people, x => _.map(i.excluded_people, l => l.people_id).indexOf(x.id) > -1);
                                                        if(excludedPeople.length == 1) {
                                                            textExcludePeople = _.map(excludedPeople, 'name').join(', ') + ' no consumió';
                                                        } else {
                                                            textExcludePeople = _.map(excludedPeople, 'name').join(', ') + ' no consumieron';
                                                        }
                                                    } else {
                                                        textExcludePeople = 'Todos consumieron esto';
                                                    }

                                                    return (
                                                        <View style={{ flex: 1, flexDirection: 'column', marginVertical: 10, width: '95%', alignSelf: 'center', backgroundColor: 'rgba(0,0,0,.15)', borderRadius: 10, padding: 10 }}>
                                                            <View style={{ flex: 1, flexDirection: 'column', width: '100%' }}>
                                                                <View style={{ flex: 1, flexDirection: 'row', padding: 2, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                                                    <Text style={{ flex: 1, fontFamily: Utils.Font.Montserrat(500), textAlign: 'left', color: 'white', fontSize: Utils.UI.normalizeFont(12) }}>{i.concept} </Text>
                                                                    <Text style={{ flex: 1, fontFamily: Utils.Font.Montserrat(500), textAlign: 'left', color: 'white', fontSize: Utils.UI.normalizeFont(12) }}>{Services.CurrencyService.formatCurrency(i.amount)}</Text>

                                                                    <TouchableOpacity
                                                                        onPress={() => {
                                                                            Alert.alert(
                                                                                "Estás seguro?",
                                                                                "Este concepto se eliminará de la lista",
                                                                                [
                                                                                  {
                                                                                    text: "Eliminar",
                                                                                    onPress: () => {
                                                                                        let event = this.state.event;
                                                                                        event.people[indexPeople].items.splice(indexItem, 1);
                                                                                        this.updateEvent(event);
                                                                                        
                                                                                        showMessage({
                                                                                            message: 'Éxito',
                                                                                            description: 'El concepto fue eliminado de la lista',
                                                                                            type: "success",
                                                                                        });
                                                                                    }
                                                                                  },
                                                                                  {
                                                                                    text: "Cancelar",
                                                                                    onPress: () => null,
                                                                                    style: "cancel"
                                                                                  }
                                                                                ],
                                                                                { cancelable: false }
                                                                            );
                                                                        }}
                                                                        style={{ flex : 0, alignItems: 'flex-end', justifyContent: 'center' }}>
                                                                        <Icon
                                                                            name={'minuscircle'}
                                                                            size={Utils.UI.normalizeFont(16)}
                                                                            color={Utils.Color.White}
                                                                        />
                                                                    </TouchableOpacity>
                                                                </View>
                                                                <TouchableOpacity
                                                                    onPress={() => {
                                                                        this.props.navigation.push('ShareCostsChoosePeopleForConceptModal', {
                                                                            item: i,
                                                                            people: this.state.event.people,
                                                                            onUpdatedItem: (item) => {
                                                                                let event = this.state.event;
                                                                                event.people[indexPeople].items[indexItem] = item;
                                                                                this.updateEvent(event);
                                                                            }
                                                                        });
                                                                    }}
                                                                    style={{ flex: 1, flexDirection: 'column', alignItems: 'center' }}>
                                                                    <Txt bold style={{ width: '100%', color: 'white', textAlign: 'center', paddingVertical: 5, fontSize: Utils.UI.normalizeFont(11), color: excludedPeople && excludedPeople.length == 0 ? Utils.Color.SuccessGreen : Utils.Color.ErrorRed }}>
                                                                        { textExcludePeople }
                                                                    </Txt>

                                                                    <Txt light style={{ width: '100%', color: 'white', textAlign: 'center', paddingVertical: 0, fontSize: Utils.UI.normalizeFont(11), color: Utils.Color.White }}>
                                                                        Toca para cambiarlo
                                                                    </Txt>
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                    );
                                                })}
                                            </View>
                                        </View>
                                    </Card.Content>
                                </Card>
                            );
                        })}
                    </ScrollView>
                }

                { this.state.event.people != null && this.state.event.people.length > 0 &&
                    <Button
                        text={Services.LanguageService.string('ShareCosts.calculate')}
                        textStyle={{ color: Utils.Color.White, fontFamily: Utils.Font.Montserrat(900) }}
                        buttonStyle={{ width: '100%', backgroundColor: Utils.Color.Secondary, alignSelf: 'center', marginTop: 0, padding: 10, height: 60, borderWidth: 2, borderColor: 'rgba(255,255,255,.3)', borderRadius: 0 }}
                        icon={
                            <Icon
                                name={'swap'}
                                size={Utils.UI.normalizeFont(20)}
                                style={{ marginRight: 10 }}
                                color={Utils.Color.White}
                            />
                        }
                        onPress={this.onCalculate}
                    />
                }

                <FAB
                    style={styles.fab}
                    icon="plus"
                    onPress={() => {
                        this.props.navigation.push('ShareCostsAddConceptModal', {
                            event: this.state.event,
                            onAddItem: (item) => {
                                this.onAddConcept(item);
                                this.props.navigation.pop();
                            }
                        });
                    }}
                />

                <Snackbar
                    visible={this.state.isSynchronizing}
                    style={{ backgroundColor: '#222' }}
                    onDismiss={() => this.setState({ isSynchronizing: false })}>
                    <Text style={{ width: '100%', fontFamily: Utils.Font.Montserrat(300), color: 'white', textAlign: 'center' }}>
                        Sincronizando..
                    </Text>
                </Snackbar>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#877aaf'
    },
    surface: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: 20,
        height: height / 3
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
    textInput: {
        backgroundColor: 'white',
        width: '95%',
        alignSelf: 'center',
        fontFamily: Utils.Font.Montserrat(500),
        fontSize: 14,
        color: '#222',
        borderRadius: 2,
        marginVertical: 4
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: Utils.Color.White
    },
});