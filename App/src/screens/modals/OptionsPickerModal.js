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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import 'moment/locale/es'
moment.locale('es');

// Styles
import * as Utils from '../../styles'

// Components
import Container from 'app/src/components/Container'
import Button from '../../components/Button';

// Services
import * as Services from 'app/src/services'
import { Input } from 'app/src/components';

export default class OptionsPickerModal extends React.Component {

    // Hide header bar
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {
            options: null
        };
    }

    componentDidMount() {
        const { getParam } = this.props.navigation;
        this.setState({
            options: getParam('options')
        });
    }

    onPress(e) {
        if(this.props.navigation.state.params.onSelectedOption){
            this.props.navigation.state.params.onSelectedOption(e);
        }
    }

    render() {

        const {
            options
        } = this.state;

        const params = this.props.navigation.state.params;

        if(!options)
            return null;

        return (
            <Container style={[styles.container, { backgroundColor : 'white' }]}>
                <View style={{ width: '100%', alignSelf: 'center', justifyContent: 'center', alignItems: 'flex-start', marginTop: 0 }}>
                    <TouchableOpacity
                        style={{ padding: 15 }}
                        onPress={() => {
                            this.props.navigation.goBack();
                        }}>
                        <Icon
                            name={'arrow-left'}
                            size={30}
                            color={Utils.Color.DarkGray}
                        />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={params.scrollViewContentContainerProps}>
                    { params != null && params.topView != null && params.topView() }

                    { options.map((e) => {

                        if(e.customRow != null) {
                            return (
                                <TouchableWithoutFeedback onPress={() => this.onPress(e)}>
                                    { e.customRow () }
                                </TouchableWithoutFeedback>
                            );
                        }

                        return (
                            <TouchableWithoutFeedback onPress={() => this.onPress(e)}>
                                <View style={{ width: '100%', flexDirection: 'row', height: 60, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,.1)' }}>
                                    <View style={{ width: '90%', paddingLeft: '5%', flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={[{ fontFamily: Utils.Font.Montserrat(600), color: '#222', flex: 1 }, e.labelStyle]}>{ e.label }</Text>
                                        <Image
                                            source={{ uri: e.icon }}
                                            style={{ width: 25, height: 25, resizeMode: 'contain' }}
                                        />

                                        { e.rightText != null &&
                                            <Text style={{ backgroundColor: Utils.Color.LightGray, fontFamily: Utils.Font.Montserrat(300), color: '#222', padding: 5, fontSize: Utils.UI.normalizeFont(10), borderRadius: 5, overflow: 'hidden' }}>
                                                { e.rightText }
                                            </Text>
                                        }
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        );
                    })}

                    { (options == null || options.length == 0) &&
                        <Text style={{ flex: 1, fontFamily: Utils.Font.Montserrat(600), color: 'gray', textAlign: 'center', fontSize: 18, marginTop: 20 }}>No hay resultados</Text>
                    }
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