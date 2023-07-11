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
    Surface
} from 'react-native-paper';

// Styles
import * as Utils from '../../styles'

// Components
import Button from '../../components/Button';

// Services
import * as Services from 'app/src/services';

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
            events: []
        };
    }

    componentDidMount() {
        this.props.screenProps.setLoading(true);
        this.getEvents()
    }

    getEvents = () => {
        Services.EventService.getMyEvents((data) => {
            this.props.screenProps.setLoading(false);
            if(data.success) {
                this.setState({
                    events: data.events
                });
            } else {
                showMessage({
                    message: "Oh oh!",
                    description: data.message,
                    type: "danger"
                });
            }
        }, (err) => {
            this.props.screenProps.setLoading(false);
            // Do nothing
        });
    }

    _openMenu = (itemId) => {
        this.setState({ visibleMenuId: itemId })
    };

    _closeMenu = () => {
        this.setState({ visibleMenuId: null })
    };

    onAddEvent = (event) => {
        this.props.screenProps.setLoading(true);
        Services.EventService.postEvent(event, (data) => {
            this.props.screenProps.setLoading(false);
            if(data.success){
                this.getEvents();

                Services.AnalyticsService.postEvent({
                    type: 'add_event',
                    view: 'ShareCostsCalculatorEventsScreen'
                });

                this.props.navigation.push('ShareCostsCalculatorScreen', {
                    event: data.event
                });
            }
        }, (err) => null)
    }

    render() {

        return (
            <SafeAreaView style={[styles.container, { backgroundColor : Utils.Color.Primary }]}>

                <Text style={{ width: '95%', alignSelf: 'center', backgroundColor: 'rgba(0,0,0,.1)', padding: 10, fontFamily: Utils.Font.Montserrat(700), color: 'rgba(255,255,255,.9)', textAlign: 'center', fontSize: Utils.UI.normalizeFont(15), borderRadius: 2, overflow: 'hidden', marginTop: 15 }}>{ Services.LanguageService.string('ShareCosts.events') }</Text>

                { !this.state.events || this.state.events.length == 0 &&
                    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginVertical: 10 }}>
                        <LottieView
                            source={require('app/src/assets/animations/calculator.json')}
                            autoPlay
                            style={{ width : width / 1.5 }}
                        />
                        <Text style={{ fontFamily: Utils.Font.Montserrat(600), color: 'white', fontSize: Utils.UI.normalizeFont(13), textAlign: 'center', maxWidth: '90%', alignSelf: 'center', marginVertical: 15 }}>{ Services.LanguageService.string('ShareCosts.tutorial_text_1') }</Text>
                    </View>
                }

                { this.state.events && this.state.events.length > 0 &&
                    <ScrollView style={{ flex : 1 }}>
                        { this.state.events && this.state.events.map((e, index) => {
                            return (
                                <Card
                                    onPress={() => {
                                        this.props.navigation.push('ShareCostsCalculatorScreen', {
                                            event: e
                                        });
                                    }}
                                    style={{ backgroundColor: 'rgba(0,0,0,.25)', marginVertical: 10, width: '95%', alignSelf: 'center' }}>
                                    <Card.Title
                                        title={e.name}
                                        titleStyle={{ fontFamily: Utils.Font.Montserrat(900), fontWeight: '900', color: 'white' }}
                                        subtitle={moment.utc(e.created_at).fromNow()}
                                        subtitleStyle={{ fontFamily: Utils.Font.Montserrat(400), color: 'white' }}
                                        right={() => {
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
                                                        this.props.screenProps.setLoading(true)
                                                        Services.EventService.removeById(e.id, (data) => {
                                                            this.props.screenProps.setLoading(false);
                                                            if(data.success) {
                                                                showMessage({
                                                                    message: Services.LanguageService.string('success'),
                                                                    description: Services.LanguageService.string('success_message'),
                                                                    type: "success",
                                                                });
                                                                this.getEvents();
                                                            }
                                                        }, (err) => {
                                                            this.props.screenProps.setLoading(false);
                                                        });
                                                    }} title={ Services.LanguageService.string('delete') } />

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

                                                            this.props.navigation.push('ShareCostsChoosePeopleForConceptModal', {
                                                                concept: e,
                                                                people: people,
                                                                onUpdatedConcept: (concept) => {
                                                                    let items = this.state.items;
                                                                    items[items.indexOf(concept)] = concept;
                                                                    this.setState({ items });
                                                                }
                                                            });

                                                        }} title="Ver participantes" />
                                                    }
                                                </Menu>
                                            )
                                        }}
                                    />

                                    <Card.Content>
                                        <View style={{ width: '100%', flexDirection: 'row', marginVertical: 0, justifyContent: 'center', alignItems: 'center', paddingTop: 0 }}>
                                            <View style={{ flex: 1, flexDirection: 'row', padding: 2, width: '100%' }}>
                                                <Text style={{ flex: 1, fontFamily: Utils.Font.Montserrat(600), color: 'white', fontSize: Utils.UI.normalizeFont(12), textAlign: 'center' }}>{ Services.LanguageService.string('ShareCosts.press_to_see_details') }</Text>
                                            </View>
                                        </View>
                                    </Card.Content>
                                </Card>
                            );
                        })}
                    </ScrollView>
                }

                <FAB
                    style={styles.fab}
                    icon="plus"
                    onPress={() => {
                        this.props.navigation.push('ShareCostsAddEventModal', {
                            onAddEvent: (event) => {
                                this.onAddEvent(event);
                                this.props.navigation.pop();
                            }
                        });
                    }}
                />
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
        backgroundColor: Utils.Color.White,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center'
    },
});