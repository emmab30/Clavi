/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    Dimensions,
    Platform,
    UIManager,
    AsyncStorage
} from 'react-native';

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import FlashMessage from "react-native-flash-message";
import { Provider as PaperProvider } from 'react-native-paper';
import { showMessage, hideMessage } from "react-native-flash-message";

import Icon from 'react-native-vector-icons/Ionicons'
import Screens from './src/navigation/Screens'
import LoadingScreen from './src/components/LoadingScreen'
import InteractableAlert from './src/components/InteractableAlert'
import codePush from "react-native-code-push";
import * as Services from 'app/src/services';

// Styles
import * as Utils from './src/styles'
import OneSignal from 'react-native-onesignal';

const START_TIME_APP = new Date().getTime();
export let redirectionRoutes = [];
const { width, height } = Dimensions.get('window');

console.disableYellowBox = true;

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental)
        UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Create stacks
let StackAuth = createStackNavigator({
    LoginScreen: { screen : Screens.LoginScreen },
    LoginCredentialsScreen: {
        screen : Screens.LoginCredentialsScreen,
        navigationOptions: {
            header: null
        }
    },
    RegisterCredentialsScreen: {
        screen : Screens.RegisterCredentialsScreen,
        navigationOptions: {
            header: null
        }
    }
}, {
    navigationOptions: {
        header: null
    }
});

let HomeStack = createStackNavigator({
    HomeScreen: { screen : Screens.HomeScreen },
    LastMovementsScreen: { screen : Screens.LastMovementsScreen },
    DetailsSharedAccount: {
        screen : Screens.DetailsSharedAccount,
        navigationOptions: {
            header: null
        }
    }
}, {
    navigationOptions: {
        header: null
    }
});

let ShareCostsStack = createStackNavigator({
    ShareCostsCalculatorEventsScreen: { screen : Screens.ShareCostsCalculatorEventsScreen },
    ShareCostsCalculatorScreen: { screen : Screens.ShareCostsCalculatorScreen }
}, {
    navigationOptions: {
        header: null
    }
});

let NotificationsStack = createStackNavigator({
    NotificationListScreen: { screen : Screens.NotificationListScreen }
}, {
    navigationOptions: {
        header: null
    }
});

let ConfigurationStack = createStackNavigator({
    ConfigurationScreen: { screen : Screens.ConfigurationScreen },
    TransactionCategoriesScreen: { screen : Screens.TransactionCategoriesScreen }
}, {
    navigationOptions: {
        header: null
    }
});

let StackMain = createMaterialBottomTabNavigator({
    Home: HomeStack,
    ShareCosts: ShareCostsStack,
    Notifications: NotificationsStack,
    Configuration: ConfigurationStack
}, {
    initialRouteName: 'Home',
    activeColor: Utils.Color.White,
    inactiveColor: Utils.Color.toOpacity(Utils.Color.White, .3),
    barStyle: { backgroundColor: Utils.Color.Primary },
    navigationOptions: {
        header: null,
    },
    defaultNavigationOptions: ({ navigation }) => ({
        header: null,
        tabBarIcon: ({ focused, horizontal, tintColor }) => {
            const { routeName } = navigation.state;
            let iconName;
            let IconComponent;
            let label = null;
            let iconSize = width / 18;
            let fontSize = Utils.UI.normalizeFont(7);
            let badgeSize = width / 26;
            let badgeFontSize = parseInt(badgeSize / 2);
            let tabBarHeight = 30;

            if (routeName === 'Home') {
                label = Services.LanguageService.string('navigation.my_balance');

                IconComponent = (
                    <View style={{ width: width / 4, justifyContent: 'center', alignItems: 'center', height: tabBarHeight }}>
                        <Icon name={'ios-wallet'} size={iconSize} color={tintColor} />
                        <Text style={{ fontSize: fontSize, fontFamily: Utils.Font.Montserrat(600), color: tintColor, textAlign: 'center', maxWidth: '80%' }}>{ label }</Text>
                    </View>
                );
            } else if(routeName == 'ShareCosts') {
                label = Services.LanguageService.string('navigation.divide');

                IconComponent = (
                    <View style={{ width: width / 4, justifyContent: 'center', alignItems: 'center', height: tabBarHeight }}>
                        <Icon name={'ios-people'} size={iconSize} color={tintColor} />
                        <Text style={{ fontSize: fontSize, fontFamily: Utils.Font.Montserrat(600), color: tintColor, textAlign: 'center', maxWidth: '80%' }}>{ label }</Text>
                    </View>
                );
            } else if (routeName === 'Notifications') {
                label = Services.LanguageService.string('navigation.notifications');

                const { hasUnreadNotifications } = navigation.getScreenProps();
                let notificationIconColor = tintColor;
                let notificationTextColor = tintColor;
                if(hasUnreadNotifications){
                    /* notificationIconColor = Utils.Color.toOpacity(Utils.Color.SecondaryLight, 1); */
                    notificationIconColor = Utils.Color.toOpacity(Utils.Color.PrimaryLight, 1);
                }
                IconComponent = (
                    <View style={{ width: width / 4, justifyContent: 'center', alignItems: 'center', height: tabBarHeight }}>
                        <Icon name={'ios-notifications'} size={iconSize} color={notificationIconColor} />
                        <Text style={{ fontSize: fontSize, fontFamily: Utils.Font.Montserrat(600), color: notificationIconColor, textAlign: 'center', maxWidth: '80%' }}>{ label }</Text>
                    </View>
                );
            } else if (routeName === 'Configuration') {
                label = Services.LanguageService.string('navigation.configuration');

                IconComponent = (
                    <View style={{ width: width / 4, justifyContent: 'center', alignItems: 'center', height: tabBarHeight }}>
                        <Icon name={'ios-settings'} size={iconSize} color={tintColor} />
                        <Text style={{ fontSize: fontSize, fontFamily: Utils.Font.Montserrat(600), color: tintColor, textAlign: 'center', maxWidth: '80%' }}>{ label }</Text>
                    </View>
                );
            }

            return IconComponent;
        },
    }),
    tabBarLabel: false,
    labeled: false,
    tabBarOptions: {
        backgroundColor: 'red',
        activeTintColor: 'white',
        inactiveTintColor: '#222',
        activeBackgroundColor: 'white',
        inactiveBackgroundColor: 'white',
        showLabel: false,
        showIcon: false
    }
});

let RootComponent = createStackNavigator({
    Auth: StackAuth,
    Main: StackMain,
    // Modals
    NewIncomeOutcome: { screen : Screens.NewIncomeOutcome },
    TransactionCategoriesScreen: { screen : Screens.TransactionCategoriesScreen },
    OptionsPickerModal: { screen : Screens.OptionsPickerModal },
    CountryPickerModal: { screen : Screens.CountryPickerModal },
    FiltersTransactionsModal: { screen : Screens.FiltersTransactionsModal },
    TransactionDetailsModal: { screen : Screens.TransactionDetailsModal },
    ShareCostsResultScreen: { screen : Screens.ShareCostsResultScreen },
    ShareCostsAddEventModal: { screen : Screens.ShareCostsAddEventModal },
    ShareCostsAddConceptModal: { screen : Screens.ShareCostsAddConceptModal },
    ShareCostsChoosePeopleForConceptModal: { screen : Screens.ShareCostsChoosePeopleForConceptModal },
    SearchUserModal: { screen : Screens.SearchUserScreen },
    // Questions
    QuestionsList: { screen : Screens.QuestionsList },
    // Shared accounts
    NewSharedAccount: { screen : Screens.NewSharedAccount }
}, {
    mode: 'modal',
    headerMode: 'none',
    defaultNavigationOptions: {
        gesturesEnabled: false
    }
})

let MainNavigator = createAppContainer(RootComponent);

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            hasUnreadNotifications: false
        }

        this.interactableAlert = null;
        this.navigator = null;
    }

    componentDidMount() {
        codePush.checkForUpdate().then((update) => {
            if (!update) {
                codePush.notifyApplicationReady();
            } else {
                if(update && update.isMandatory) {
                    let title = 'Nueva actualización';
                    let message = 'Hay una nueva mejora disponible de la aplicación. ¿Actualizar ahora? \n\n';
                    if(update.description != null && update.description.length > 5) {
                        message += `${update.description}`;
                    }
                    this.interactableAlert.openWithButtons(title, message, [
                        { id: 1, text: 'Actualizar ahora', onPress: () => {
                            this.setState({ isLoading : true });
                            AsyncStorage.setItem('IsAppUpdated', '1');
                            codePush.sync({
                                updateDialog: false,
                                installMode: codePush.InstallMode.IMMEDIATE
                            }, (status) => {
                                if(status == 8) {
                                    // Do nothing, the update is ready.
                                    showMessage({
                                        message: "Éxito",
                                        description: "La aplicación fue actualizada correctamente",
                                        type: "success",
                                    });
                                }
                            });
                        }}
                    ], {
                        vibrate : true,
                        shadowBackgroundImage: require('app/src/assets/images/interactable_alert/header_5_update.png'),
                        shadowBackgroundColor: '#2b237c'
                    });
                } else {
                    // Silent install

                    codePush.sync({
                        updateDialog: false,
                        installMode: codePush.InstallMode.IMMEDIATE
                    }, (status) => {
                        if(status == 8) {
                            // Do nothing, the update is ready.
                            showMessage({
                                message: "Éxito",
                                description: "La aplicación fue actualizada correctamente",
                                type: "success",
                            });
                        }
                    });
                }
                /*codePush.getUpdateMetadata(codePush.UpdateState.LATEST).then((metadata) => {
                    alert(JSON.stringify(metadata));
                });*/
                // alert("An update is available! Should we download it? JEJE");
            }
        }).catch((err) => {
            codePush.notifyApplicationReady();
        });

        OneSignal.addEventListener('opened', (notification) => {
            if(this.navigator && this.navigator._navigation) {
                notification = notification.notification;
    
                if(notification.payload != null && notification.payload.additionalData && notification.payload.additionalData.route) {
                    let path = notification.payload.additionalData.route;
                    let params = {};
                    if(notification.payload.additionalData.params)
                        params = notification.payload.additionalData.params;

                    let isOpeningApp = (new Date().getTime() - START_TIME_APP) < 10000;
                    if(isOpeningApp || !this.navigator) {
                        if(redirectionRoutes)
                            redirectionRoutes.push({
                                path,
                                params
                            });
                    } else {
                        this.navigator._navigation.navigate(path, params);
                    }
                }
            } 
        });
    }

    render() {

        const { isLoading } = this.state;

        return (
            <PaperProvider>
                <View style={{ flex : 1 }}>
                    <MainNavigator
                        ref={(e) => { this.navigator = e; }}
                        screenProps={{
                            setLoading: (isLoading) => this.setState({ isLoading }),
                            hasUnreadNotifications: this.state.hasUnreadNotifications,
                            setUnreadNotifications: (boolValue) => this.setState({ hasUnreadNotifications : boolValue }),
                            showInteractableAlertWithButtons: (title, message, buttons, extraData = {}) => {
                                if(this.interactableAlert)
                                    this.interactableAlert.openWithButtons(title, message, buttons, extraData)
                            },
                            hideInteractableAlert: () => {
                                if(this.interactableAlert)
                                    this.interactableAlert.hideInteractableAlert()
                            },
                            isInteractableAlertOpened: () => {
                                if(this.interactableAlert)
                                    return this.interactableAlert.isOpened()
                            }
                        }}
                    />

                    <LoadingScreen
                        isLoading={isLoading}
                    />

                    <InteractableAlert
                        ref={(e) => { this.interactableAlert = e; }}
                    />

                    <FlashMessage
                        style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,.2)', shadowColor: '#222', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.4, shadowRadius: 5, elevation: 3, }}
                        ref="myLocalFlashMessage"
                        titleStyle={{
                            fontFamily: Utils.Font.Montserrat(900),
                            textAlign: 'center'
                        }}
                        textStyle={{
                            fontFamily: Utils.Font.Montserrat(600),
                            textAlign: 'center'
                        }}
                        hideStatusBar={true}
                        duration={5000}
                    />
                </View>
            </PaperProvider>
        );
    }
}

const codePushOptions = {
    checkFrequency: codePush.CheckFrequency.MANUAL
};
const MyApp = codePush(codePushOptions)(App);
export default MyApp;