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
    RefreshControl
} from 'react-native';

// Modules
import * as RNLocalize from "react-native-localize";
import moment from 'moment-timezone/builds/moment-timezone-with-data';
import 'moment/locale/es'
// moment.locale('es');
moment.tz.setDefault(RNLocalize.getTimeZone());
import Icon from 'react-native-vector-icons/AntDesign';
/*import OneSignal from 'react-native-onesignal';*/
import firebase from 'react-native-firebase';

// Components
import HeaderBar from 'app/src/components/HeaderBar';
import Balance from 'app/src/components/Balance';
import Button from 'app/src/components/Button';
import RowTransaction from 'app/src/components/Transactions/RowTransaction';
import RowNotification from './components/RowNotification';

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


export default class LastMovementsScreen extends React.Component {

    // Hide header bar
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isRefreshing: false,
            notifications: null
        };
    }

    componentDidMount() {
        this.getNotifications();
        this.props.navigation.addListener('didFocus', () => this.getNotifications(true));
    }

    getNotifications = (refresh = false) => {
        this.props.screenProps.setLoading(true);
        if(refresh){
            this.setState({ isRefreshing : true });
        }

        Services.NotificationService.getMyNotifications((data) => {
            if(data.success) {
                if(this.props.screenProps.hasUnreadNotifications) {
                    setTimeout(() => {
                        this.props.screenProps.setUnreadNotifications(false);
                    }, 1000);
                }

                this.props.screenProps.setLoading(false);
                this.setState({
                    notifications: data.notifications,
                    isRefreshing: false
                });
            }
        });
    }

    render() {
        const {
            notifications
        } = this.state;

        return (
            <SafeAreaView style={{ flex : 1 }}>
                <HeaderBar
                    containerStyle={{ paddingTop: 0 }}
                    isBackButton={false}
                    navigation={this.props.navigation}
                    title={Services.LanguageService.string('navigation.notifications')}
                />

                <View
                    style={{ flex: 1, width: '100%', height: '100%', backgroundColor: 'white' }}>
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.isRefreshing}
                                onRefresh={() => this.getNotifications(true)}
                            />
                        }
                        style={styles.container}>

                        { notifications != null && notifications.length > 0 &&
                            <FlatList
                                contentContainerStyle={{ width: '100%' }}
                                data={this.state.notifications}
                                renderItem={(rowData) => {
                                    return (
                                        <RowNotification
                                            navigation={this.props.navigation}
                                            notification={rowData.item}
                                        />
                                    );
                                }}
                            />
                        }

                        { notifications != null && notifications.length == 0 &&
                            <View style={{ width: '95%', alignSelf: 'center', backgroundColor: Utils.Color.SuccessGreen, padding: 10, marginTop: 10, borderRadius: 10 }}>
                                <Text style={{ fontFamily: Utils.Font.Montserrat(600), fontSize: Utils.UI.normalizeFont(12), textAlign: 'center', color: 'white' }}>Aún no tienes notificaciones. ¡Vuelve más tarde!</Text>
                            </View>
                        }
                    </ScrollView>
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    sectionLogo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    sectionButtons: {
        flex: 0,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 20
    },
    logo: {
        maxWidth: '40%',
        resizeMode: 'contain'
    },
    button: {
        width: '75%',
        alignSelf: 'center',
        marginBottom: 10,
        padding: 15,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    button1: {
        backgroundColor: '#efc75e'
    },
    button2: {
        backgroundColor: 'white'
    },
    text: {
        fontFamily: Utils.Font.Montserrat(700),
        fontSize: 20,
        color: 'white'
    }
});