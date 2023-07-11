import React from 'react';
import {
    Component,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    AsyncStorage,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    FlatList,
    Dimensions,
    Alert,
    TextInput,
    ActivityIndicator,
    Vibration
} from 'react-native';

// Modules
import { showMessage, hideMessage } from "react-native-flash-message";
import moment from 'moment';
import 'moment/locale/es'
moment.locale('es');
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
/*import OneSignal from 'react-native-onesignal';*/
import firebase from 'react-native-firebase';

// Components
import Container from 'app/src/components/Container'
import HeaderBar from 'app/src/components/HeaderBar';
import Balance from 'app/src/components/Balance';
import Button from 'app/src/components/Button';

// Styles
import * as Utils from 'app/src/styles'

// Services
import { SetToken } from 'app/src/services/BaseService'
import * as Services from 'app/src/services';

// Extras
const { width, height } = Dimensions.get('window');
const Banner = firebase.admob.Banner;
const AdRequest = firebase.admob.AdRequest;
const request = new AdRequest();


export default class SearchUserModal extends React.Component {

    // Hide header bar
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isLoadingResults: false,
            pattern: null,
            users: [],
            showHint: true
        };
    }

    onFilter = () => {
        const { pattern } = this.state;

        this.setState({ isLoadingResults : true });
        Services.UserService.searchByPattern(pattern, (data) => {
            if(data.success) {
                Services.UIService.Animate();
                this.setState({ users : data.users });
            } else {
                showMessage({
                    message: "Error",
                    description: data.message,
                    type: "danger"
                });
            }

            Services.UIService.Animate();
            this.setState({ isLoadingResults : false });
        }, (err) => {
            this.setState({ isLoadingResults : false });
        });
    }

    componentDidMount() {

    }

    render() {
        const {
            notifications
        } = this.state;

        return (
            <Container style={{ flex : 1 }}>
                <HeaderBar
                    containerStyle={{ paddingTop: 0 }}
                    isBackButton={true}
                    navigation={this.props.navigation}
                    title={'Buscar usuario'}
                />

                <TextInput
                    style={{ width: '95%', alignSelf: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,.1)', paddingVertical: 10, fontFamily: Utils.Font.Montserrat(600), fontSize: Utils.UI.normalizeFont(12) }}
                    placeholder={'Escribe el alias Clavi'}
                    placeholderTextColor={Utils.Color.Primary}
                    autoCapitalize="sentences"
                    keyboardType="default"
                    returnKeyType="done"
                    autoFocus
                    multiline={false}
                    value={this.state.pattern}
                    onChangeText={(pattern) => {
                        Services.UIService.Animate();
                        this.setState({
                            pattern: pattern,
                            showHint: false
                        })
                    }}
                    onSubmitEditing={this.onFilter}
                />

                { this.state.showHint &&
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
                        <Icon
                            name={'help-rhombus'}
                            style={{ fontSize: Utils.UI.normalizeFont(16) }}
                            color={Utils.Color.Primary}
                        />
                        <Text style={{ flex: 1, justifyContent: 'center', alignSelf: 'center', textAlign: 'center', fontFamily: Utils.Font.Montserrat(300), maxWidth: '95%', alignSelf: 'center', marginVertical: 10 }}><Text style={{ fontFamily: Utils.Font.Montserrat(500), color: Utils.Color.Primary }}>El alias Clavi</Text> se encuentra en la pantalla de configuración de la aplicación</Text>
                    </View>
                }

                { this.state.isLoadingResults == true &&
                    <View style={{ width: '100%', padding: 10, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator
                            color='#222'
                        />
                    </View>
                }

                { this.state.isLoadingResults == false && this.state.users && this.state.users.length > 0 &&
                    <FlatList
                        contentContainerStyle={{ width: '100%' }}
                        data={this.state.users}
                        ListHeaderComponent={() => {
                            if(this.state.users.length > 0) {
                                return (
                                    <View style={{ width: '100%', alignSelf: 'center', flexDirection: 'row', paddingVertical: 0, marginTop: 10 }}>
                                        <Text style={[styles.username, { width: '100%', fontFamily: Utils.Font.Montserrat(300), textAlign: 'center', paddingVertical: 5, color: 'rgba(0,0,0,.5)' }]}>Toca sobre un alias Clavi para continuar</Text>
                                    </View>
                                );
                            }

                            return null;
                        }}
                        renderItem={(rowData) => {
                            return (
                                <TouchableOpacity
                                    activeOpacity={.9}
                                    onPress={() => {
                                        const { getParam } = this.props.navigation;
                                        if(getParam('onPickUser'))
                                            getParam('onPickUser')(rowData.item);
                                    }}>
                                    <View style={{ width: '100%', flexDirection: 'column' }}>
                                        <View style={{ width: '95%', alignSelf: 'center', flexDirection: 'column', paddingVertical: 10 }}>
                                            <Text style={[styles.username, { fontFamily: Utils.Font.Montserrat(800), fontSize: Utils.UI.normalizeFont(11), marginBottom: 10, color: Utils.Color.PrimaryDark }]}>{ rowData.item.username }</Text>
                                            <Text style={[styles.username, { fontSize: Utils.UI.normalizeFont(10), color: Utils.Color.DarkGray }]}>{ rowData.item.name }</Text>
                                        </View>
                                        <View style={styles.separator}></View>
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    />
                }
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    separator: {
        width: '100%',
        height: 1,
        backgroundColor: 'rgba(0,0,0,.05)'
    },
    username: {
        fontFamily: Utils.Font.Montserrat(400),
        fontSize: Utils.UI.normalizeFont(12),
        color: '#222'
    }
});