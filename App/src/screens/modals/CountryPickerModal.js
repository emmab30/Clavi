import React from 'react';
import {
    Component,
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image,
    Alert,
    SafeAreaView,
    ScrollView,
    AsyncStorage
} from 'react-native';

// Modules
import _ from 'lodash';
import Icon from 'react-native-vector-icons/AntDesign';
import moment from 'moment';
import 'moment/locale/es'
moment.locale('es');

// Styles
import * as Utils from '../../styles'

// Components
import Container from 'app/src/components/Container'
import Button from '../../components/Button';
import * as Services from 'app/src/services'

export default class CountryPickerModal extends React.Component {

    // Hide header bar
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {
            countries: [],
            filtered: [],
            pattern: null
        };
    }

    componentDidMount() {
        this.setState({
            countries: require('app/src/assets/json/countries.json'),
            filtered: require('app/src/assets/json/countries.json')
        });
    }

    onPress = (country) => {
        if(this.props.navigation.state.params.onCountrySelected) {
            this.props.navigation.state.params.onCountrySelected(country);
        }
    }

    render() {

        const {
            countries,
            filtered
        } = this.state;

        if(!filtered)
            return null;

        return (
            <Container style={[styles.container, { backgroundColor : 'white' }]}>
                <ScrollView
                    keyboardShouldPersistTaps='always'
                    contentContainerStyle={{ minHeight: '100%' }}>

                    <Text style={{ marginTop: 10, fontFamily: Utils.Font.Charlotte(), textAlign: 'center', fontSize: Utils.UI.normalizeFont(20), color: Utils.Color.Primary, maxWidth: '80%', alignSelf: 'center' }}>{ Services.LanguageService.string('appName') }</Text>

                    <Text style={{ marginTop: 10, fontFamily: Utils.Font.Montserrat(400), textAlign: 'center', fontSize: Utils.UI.normalizeFont(14), color: Utils.Color.Primary, maxWidth: '80%', alignSelf: 'center' }}>{ Services.LanguageService.string('CountryPickerModal.choose_country_text') }</Text>

                    <TextInput
                        style={{ width: '100%', height: 60, marginTop: 15, paddingLeft: 20, marginBottom: 5, justifyContent: 'center', fontSize: Utils.UI.normalizeFont(14), alignItems: 'center', fontFamily: Utils.Font.Montserrat(300), color: 'rgba(0,0,0,.5)', alignSelf: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,.05)' }}
                        placeholder={Services.LanguageService.string('CountryPickerModal.choose_country_placeholder_input')}
                        autoFocus
                        value={this.state.pattern}
                        onChangeText={(text) => {
                            if(!filtered || filtered == '') {
                                this.setState({ filtered : countries });
                            } else {
                                let filtered = _.filter(countries, (e) => e.name.toLowerCase().indexOf(text) > -1);
                                this.setState({ filtered });
                            }
                        }}
                    />

                    { filtered.map((e) => {

                        return (
                            <TouchableWithoutFeedback onPress={() => this.onPress(e)}>
                                <View style={{ width: '100%', flexDirection: 'row', height: 60, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,.1)' }}>
                                    <View style={{ width: '90%', paddingLeft: '5%', flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={[{ fontFamily: Utils.Font.Montserrat(400), fontSize: Utils.UI.normalizeFont(14), color: '#222', flex: 1 }, e.labelStyle]}>{ e.name }</Text>
                                        <Image
                                            source={{ uri: e.icon }}
                                            style={{ width: 25, height: 25, resizeMode: 'contain' }}
                                        />
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        );
                    })}
                </ScrollView>
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