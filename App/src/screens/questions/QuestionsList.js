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

        const questions = require('./questions.json');
        this.state = {
            questions: questions.questions,
            totalValue: 0,
            question: questions.questions[0],
            step: 0,
            result: null
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
    }

    goToQuestion = (toStep) => {
        const step = this.state.indexQuestion;
        let direction = 'next';
        if(toStep < step) {
            direction = 'back';
        }

        // Check if this is the last question
        if(toStep >= this.state.questions.length) {
            this.setState({
                result : {
                    success: true,
                    message: '¡Felicitaciones! Te puedes permitir esta compra por el momento'
                }
            });
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
            this.setState({
                step : toStep,
                question: this.state.questions[toStep]
            });

            console.log(this.state.questions);

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
    }

    render() {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor : Utils.Color.Primary } ]}>
                { this.state.result === null && this.renderQuestion() }
                { this.state.result !== null && this.renderResult() }
            </SafeAreaView>
        );
    }

    renderResult() {
        const { result } = this.state;

        return (
            <Animated.View style={[{ flex: 1, width: '100%', paddingHorizontal: 15, opacity: this.animatedOpacity, transform: [{ translateX: this.animatedLeft }], backgroundColor: result.success ? Utils.Color.Secondary : Utils.Color.PrimaryRed }]}>

                {
                    // this.renderBack()
                }

                <ScrollView
                    keyboardShouldPersistTaps={'always'}>
                    <View style={{ height: 100, width: 100, borderRadius: 50, borderWidth: 4, borderColor: 'rgba(0,0,0,.1)', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', flexDirection: 'row' }}>
                        <Octicon
                            name={'check'}
                            style={{ color: 'white', fontSize: Utils.UI.normalizeFont(50) }}
                        />
                    </View>

                    <Txt style={{ fontSize: Utils.UI.normalizeFont(18), marginTop: 20, color: 'white', textAlign: 'center' }}>{ result.message }</Txt>
                </ScrollView>
            </Animated.View>
        );
    }

    renderQuestion() {
        const { question } = this.state;

        return (
            <Animated.View style={[{ flex: 1, width: '100%', paddingHorizontal: 15, opacity: this.animatedOpacity, transform: [{ translateX: this.animatedLeft }] }]}>

                { this.renderBack() }

                <ScrollView
                    keyboardShouldPersistTaps={'always'}>
                    {/* <View style={{ height: 100, width: 100, borderRadius: 50, borderWidth: 4, borderColor: 'rgba(0,0,0,.1)', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', flexDirection: 'row' }}>
                        <Octicon
                            name={'question'}
                            style={{ color: 'white', fontSize: Utils.UI.normalizeFont(50) }}
                        />
                    </View> */}
                
                    { question && question.question &&
                        <Txt black style={{ flex: 1, color: 'white', padding: 30, textAlign: 'center', fontSize: Utils.UI.normalizeFont(25) }}>
                            { question.question }
                        </Txt>
                    }

                    { question && question.question &&
                        <View style={{ flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                            { question.options.map((option) => {
                                return (
                                    <Button
                                        onPress={() => {
                                            const {
                                                questions,
                                                totalValue
                                            } = this.state;
                                            questions[this.state.step].answer = option.label;
                                            this.setState({
                                                questions,
                                                totalValue: totalValue + option.value
                                            })
                                            this.goToQuestion(this.state.step + 1)
                                        }}
                                        text={option.label}
                                        buttonStyle={{ marginTop: 20 }}>
                                        <Txt>{ option.label }</Txt>
                                    </Button>
                                )
                            })}
                        </View>
                    }
                </ScrollView>
            </Animated.View>
        );
    }

    renderBack = () => {
        return (
            <View style={{ width: '100%', alignSelf: 'center', height: 'auto', justifyContent: 'center', alignItems: 'flex-start', paddingTop: 30 }}>
                <TouchableOpacity
                    style={{ paddingTop: 0, paddingRight: 20, paddingBottom: 20 }}
                    onPress={() => {
                        if(this.state.step <= 1) {
                            this.props.navigation.pop();
                        } else {
                            this.goToStep(parseFloat(this.state.step) - 1);
                        }
                    }}>
                    <Text style={{ fontFamily: Utils.Font.Montserrat(600), fontSize: 16, color: '#fff' }}>Volver atrás</Text>
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