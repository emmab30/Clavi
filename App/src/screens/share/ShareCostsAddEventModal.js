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
import { FloatingAction } from "react-native-floating-action";
import { Dropdown } from 'react-native-material-dropdown';

// Styles
import * as Utils from '../../styles'

// Components
import {
    Txt
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

export default class ShareCostsAddEventModal extends React.Component {

    // Hide header bar
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {
            event: {
                name: ''
            }
        };
    }

    render() {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor : Utils.Color.Primary }]}>
                { this.renderLoadItem() }
            </SafeAreaView>
        );
    }

    renderLoadItem() {
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
                <ScrollView
                    style={{ paddingHorizontal: 10, paddingVertical: 10 }}
                    keyboardShouldPersistTaps={'always'}>

                    <Txt
                        tx={'ShareCosts.event_name_tooltip'}
                        style={{ color: 'white', paddingBottom: 15 }}
                    />

                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <TextInput
                            value={this.state.event.name}
                            autoFocus
                            onChangeText={(text) => {
                                let event = this.state.event;
                                event.name = text;
                                this.setState({ event });
                            }}
                            style={{ flex: 1, alignSelf: 'center', backgroundColor: Utils.Color.White, borderRadius: 3, borderWidth: 1, borderColor: 'white', color: Utils.Color.Primary, fontFamily: Utils.Font.Montserrat(700), marginBottom: 5, fontSize: Utils.UI.normalizeFont(12), padding: 15 }}
                            onSubmitEditing={() => {
                                if(this.state.event.name.length > 0){
                                    if(this.props.navigation.state.params.onAddEvent){
                                        this.props.navigation.state.params.onAddEvent(this.state.event);
                                    }
                                }
                            }}
                            placeholder={Services.LanguageService.string('ShareCosts.event_name')}
                            placeholderTextColor={Utils.Color.PrimaryDark}
                            selectionColor={'white'}
                        />
                    </View>

                    { this.state.event.name.length > 0 &&
                        <Button
                            text={Services.LanguageService.string('ShareCosts.create_event')}
                            buttonStyle={{ marginTop: 20 }}
                            onPress={() => {
                                if(this.props.navigation.state.params.onAddEvent){
                                    this.props.navigation.state.params.onAddEvent(this.state.event);
                                }
                            }}
                        />
                    }
                </ScrollView>
            </SafeAreaView>
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