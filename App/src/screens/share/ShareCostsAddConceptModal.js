import React from 'react';
import {
    Animated,
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
    FlatList,
    Vibration
} from 'react-native';

// Modules
import Octicon from 'react-native-vector-icons/Octicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconEntypo from 'react-native-vector-icons/Entypo';
import moment from 'moment';
import 'moment/locale/es'
moment.locale('es');
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { showMessage, hideMessage } from "react-native-flash-message";
import Modal from "react-native-modalbox";
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import _ from 'lodash';
import { FloatingAction } from "react-native-floating-action";
import { Dropdown } from 'react-native-material-dropdown';

// Styles
import * as Utils from '../../styles'

// Components
import {
    Txt,
    Input
} from 'app/src/components'
import Container from 'app/src/components/Container'
import Button from '../../components/Button';

// Services
import * as Services from 'app/src/services'
import AnalyticsService from '../../services/AnalyticsService';
import CurrencyService from '../../services/CurrencyService';
import TransactionService from '../../services/TransactionService';

const { width, height } = Dimensions.get('window');

var ID = function () {
    return '_' + Math.random().toString(36).substr(2, 9);
};

export default class ShareCostsAddConceptModal extends React.Component {

    // Hide header bar
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {
            step: 1,
            currentItem: {
                author: '',
                amount: null,
                concept: '',
                people_id: null // Owner of the item
            },
            filteredPeople: [],
            isSelectingFromDropdown: false
        };

        // Animated opacity
        this.animatedOpacity = new Animated.Value(0);
        this.animatedLeft = new Animated.Value(0);
    }

    componentDidMount() {
        Animated.timing(this.animatedOpacity, {
            toValue: 1,
            duration: 1000
        }).start();

        this.setState({
            filteredPeople: this.props.navigation.state.params.event.people
        });
    }

    showAddBtn = () => {
        Services.UIService.Animate();
        return (this.state.currentItem.author.length > 0 || this.state.currentItem.people_id != null);
    }

    goToStep = (toStep) => {
        const step = this.state.step;
        let direction = 'next';
        if(toStep < step) {
            direction = 'back';
        }

        const ANIMATION_TIME = 100;
        Animated.parallel([
            Animated.timing(this.animatedOpacity, {
                toValue: 0,
                duration: ANIMATION_TIME,
                useNativeDriver: true
            }),
            Animated.timing(this.animatedLeft, {
                toValue: width * (direction == 'back' ? 1 : -1),
                duration: ANIMATION_TIME * 2,
                useNativeDriver: true
            })
        ]).start(() => {
            this.setState({ step : toStep })

            Animated.parallel([
                Animated.timing(this.animatedOpacity, {
                    toValue: 1,
                    duration: ANIMATION_TIME * 2,
                    useNativeDriver: true
                }),
                Animated.timing(this.animatedLeft, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true
                })
            ]).start();
        });

        // Reset values from current item
        let currentItem = this.state.currentItem;
        if(toStep == 1) {
            currentItem.people_id = null;
            currentItem.author = '';
            this.setState({
                filteredPeople: this.props.navigation.state.params.event.people
            });
        }
    }

    render() {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor : Utils.Color.Primary }]}>
                { this.state.step == 1 && this.renderStepOne() }
                { this.state.step == 2 && this.renderStepTwo() }
                { this.state.step == 3 && this.renderStepThree() }
            </SafeAreaView>
        );
    }

    renderStepOne() {
        let {
            event
        } = this.props.navigation.state.params;

        const {
            currentItem
        } = this.state;

        return (
            <Animated.View style={[{ flex: 1, width: '100%', paddingHorizontal: 15, opacity: this.animatedOpacity, transform: [{ translateX: this.animatedLeft }] }]}>

                { this.renderBack() }

                <ScrollView
                    keyboardShouldPersistTaps={'always'}>
                    <View style={{ height: 100, width: 100, borderRadius: 50, borderWidth: 4, borderColor: 'rgba(0,0,0,.1)', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', flexDirection: 'row' }}>
                        <Octicon
                            name={'person'}
                            style={{ color: 'white', fontSize: Utils.UI.normalizeFont(50) }}
                        />
                    </View>

                
                    <Txt black style={{ color: 'white', padding: 30, textAlign: 'center' }}>Escoge una persona de la lista o crea una nueva persona</Txt>

                    <Input
                        autoFocus
                        placeholder={Services.LanguageService.string('ShareCosts.people_name')}
                        value={currentItem.author}
                        onChangeText={(text) => {
                            let currentItem = this.state.currentItem;
                            currentItem.author = text;
                            this.setState({ currentItem });

                            // Filter people too
                            let filteredPeople = _.filter(event.people, i => i.name.toLowerCase().indexOf(text.toLowerCase()) > -1);
                            this.setState({ filteredPeople })
                        }}
                        onSubmitEditing={() => {

                        }}
                        style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,.4)' }}
                    />

                    { currentItem.author != null && currentItem.author.length > 0 &&
                        <Button
                            text={'Continuar'}
                            buttonStyle={{ marginTop: 10 }}
                            onPress={() => {
                                this.setState({ currentItem });
                                this.goToStep(2);
                            }}
                        />
                    }

                    { this.state.filteredPeople && this.state.filteredPeople.length > 0 &&
                        <Text style={{ fontFamily: Utils.Font.Montserrat(800), fontSize: Utils.UI.normalizeFont(13), marginVertical: 20, color: Utils.Color.White }}>O selecciona una persona ya cargada</Text>
                    }
                        
                    { this.state.filteredPeople && this.state.filteredPeople.length > 0 &&
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            { this.state.filteredPeople.map((e) => {
                                const rowData = {
                                    item: e
                                };
                                return (
                                    <TouchableOpacity
                                        style={{
                                            marginRight: 5,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            padding: 10,
                                            backgroundColor: 'rgba(0,0,0,.3)',
                                            borderRadius: 5,
                                            marginVertical: 5,
                                            shadowColor: "#fff",
                                            shadowOffset: {
                                                width: 0,
                                                height: 1,
                                            },
                                            shadowOpacity: 0.22,
                                            shadowRadius: 2.22,
                                            elevation: 3
                                        }}
                                        onPress={() => {
                                            currentItem.author = rowData.item.name;
                                            currentItem.people_id = rowData.item.id;
                                            this.goToStep(2);
                                        }}>
                                        <Octicon
                                            name={'person'}
                                            style={{ marginRight: 10, color: 'rgba(255,255,255,.3)', fontSize: Utils.UI.normalizeFont(14) }}
                                        />
                                        <Txt style={{ color: 'white', fontFamily: Utils.Font.Montserrat(600) }}>{ rowData.item.name.toUpperCase() }</Txt>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    }

                    {/* <FlatList
                        data={this.state.filteredPeople}
                        style={{ marginTop: 10 }}
                        contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
                        keyboardShouldPersistTaps={'always'}
                        renderItem={(rowData) => {
                            
                        }}
                    /> */}
                </ScrollView>
            </Animated.View>
        );
    }

    renderStepTwo() {
        const {
            event
        } = this.props.navigation.state.params;

        const {
            currentItem
        } = this.state;
        
        return (
            <Animated.View style={[{ width: '100%', paddingHorizontal: 15, opacity: this.animatedOpacity, transform: [{ translateX: this.animatedLeft }] }]}>

                { this.renderBack() }

                <View style={{ height: 100, width: 100, borderRadius: 50, borderWidth: 4, borderColor: 'rgba(0,0,0,.1)', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', flexDirection: 'row' }}>
                    <Icon
                        name={'currency-usd'}
                        size={Utils.UI.normalizeFont(40)}
                        color={'white'}
                    />
                </View>

                <Txt black style={{ color: 'white', padding: 30, textAlign: 'center' }}>¿Cuanto gastó { currentItem.author }?</Txt>

                <Input
                    autoFocus
                    placeholder={Services.LanguageService.string('ShareCosts.how_much_spent')}
                    isNumberFormat={true}
                    value={this.state.currentItem.amount}
                    onChangeText={(text) => {
                        currentItem.amount = text;
                        this.setState({ currentItem });
                    }}
                    keyboardType={'numeric'}
                    onSubmitEditing={() => {
                        this.goToStep(3);
                    }}
                    style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,.4)' }}
                />

                { currentItem.author != null && currentItem.author.length > 0 &&
                    <Button
                        text={'Continuar'}
                        buttonStyle={{ marginTop: 10 }}
                        onPress={() => {
                            // Validate that amount is OK
                            if(currentItem.amount && currentItem.amount > 0) {
                                this.goToStep(3);
                            } else {
                                showMessage({
                                    message: 'Algo faltó..',
                                    description: 'Es importante que ingreses un monto mayor a 0',
                                    position: "top",
                                    type: "danger",
                                });
                            }
                        }}
                    />
                }

                { currentItem.author != null && currentItem.author.length > 0 && !currentItem.people_id && 
                    <Button
                        text={'No gastó en nada'}
                        buttonStyle={{ marginTop: 10, backgroundColor: Utils.Color.Secondary }}
                        textStyle={{ color: 'white' }}
                        onPress={() => {
                            if(this.props.navigation.state.params.onAddItem){
                                this.props.navigation.state.params.onAddItem(this.state.currentItem);
                            }
                        }}
                    />
                }
            </Animated.View>
        );
    }

    renderStepThree() {
        const {
            event
        } = this.props.navigation.state.params;

        const {
            currentItem
        } = this.state;

        return (
            <Animated.View style={[{ width: '100%', paddingHorizontal: 15, opacity: this.animatedOpacity, transform: [{ translateX: this.animatedLeft }] }]}>

                { this.renderBack() }

                <View style={{ height: 100, width: 100, borderRadius: 50, borderWidth: 4, borderColor: 'rgba(0,0,0,.1)', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', flexDirection: 'row' }}>
                    <Octicon
                        name={'bookmark'}
                        style={{ color: 'white', fontSize: Utils.UI.normalizeFont(40) }}
                    />
                </View>

                <Txt black style={{ color: 'white', padding: 30, textAlign: 'center' }}>¿En que gastó { currentItem.author }?</Txt>

                <Input
                    autoFocus
                    placeholder={Services.LanguageService.string('ShareCosts.concept_name')}
                    value={this.state.currentItem.concept}
                    onChangeText={(text) => {
                        currentItem.concept = text;
                        this.setState({ currentItem });
                    }}
                    onSubmitEditing={() => {
                        if(this.props.navigation.state.params.onAddItem){
                            this.props.navigation.state.params.onAddItem(this.state.currentItem);
                        }
                    }}
                    style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,.4)' }}
                />

                { currentItem.author != null && currentItem.author.length > 0 &&
                    <Button
                        text={'Finalizar'}
                        buttonStyle={{ marginTop: 10 }}
                        onPress={() => {
                            // Validations
                            if(currentItem.concept && currentItem.concept.length) {
                                if(this.props.navigation.state.params.onAddItem){
                                    this.props.navigation.state.params.onAddItem(this.state.currentItem);
                                }
                            } else {
                                showMessage({
                                    message: 'Algo faltó..',
                                    description: 'Tenés que agregar un concepto para este gasto',
                                    position: "top",
                                    type: "danger",
                                });
                            }
                        }}
                    />
                }
            </Animated.View>
        );
    }

    renderBack = () => {
        return (
            <View style={{ width: '100%', alignSelf: 'center', height: 'auto', justifyContent: 'center', alignItems: 'flex-start' }}>
                <TouchableOpacity
                    style={{ paddingTop: 0, paddingRight: 20, paddingBottom: 20 }}
                    onPress={() => {
                        if(this.state.step <= 1) {
                            this.props.navigation.pop();
                        } else {
                            this.goToStep(parseFloat(this.state.step) - 1);
                        }
                    }}>
                    <Text style={{ fontFamily: Utils.Font.Montserrat(600), fontSize: 16, color: '#fff' }}>{ Services.LanguageService.string('back') }</Text>
                </TouchableOpacity>
            </View>
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
    textInput: {
        backgroundColor: 'white',
        width: '95%',
        alignSelf: 'center',
        fontFamily: Utils.Font.Montserrat(500),
        fontSize: 14,
        color: '#222',
        borderRadius: 2,
        marginVertical: 4
    }
});