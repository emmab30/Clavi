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
    Vibration
} from 'react-native';

// Modules
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
/*import OneSignal from 'react-native-onesignal';*/
import DeviceInfo from 'react-native-device-info';
import firebase from 'react-native-firebase';
import moment from 'moment';
import * as RNLocalize from 'react-native-localize'
import 'moment/locale/es'
moment.locale('es');
import { showMessage, hideMessage } from "react-native-flash-message";
import { StackActions, NavigationActions } from 'react-navigation';
import Share from 'react-native-share';

// Components
import Container from '../components/Container'
import HeaderBar from '../components/HeaderBar';
import Balance from '../components/Balance';
import Button from '../components/Button';

// Styles
import * as Utils from '../styles'

// Services
import { SetToken } from '../services/BaseService'
import * as Services from 'app/src/services';

export default class ConfigurationScreen extends React.Component {

    // Hide header bar
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            filters: {},
            balance: {},
            appLanguage: null
        };
    }

    componentDidMount() {
        let preferredLanguage = RNLocalize.getLocales();
        if(preferredLanguage != null && preferredLanguage.length > 0)
            preferredLanguage = preferredLanguage[0].languageCode;
        else
            preferredLanguage = 'en';

        AsyncStorage.getItem('app_language').then((value) => {
            if(value != null) {
                preferredLanguage = value;
                // Services.LanguageService.setLocale(value);
            }

            this.setState({ appLanguage : preferredLanguage });
        });
    }
    
    onToggleCountry = () => {
        this.props.navigation.push('CountryPickerModal', {
            onCountrySelected: (country) => {
                this.props.screenProps.setLoading(true);
                Services.UserService.updateMe({
                    country_code: country.code,
                    country_name: country.name
                }, (data) => {
                    if(data.success && data.user) {
                        Services.UserService.user = data.user;
                    }

                    this.props.screenProps.setLoading(false);
                    this.props.navigation.pop();
                }, (err) => null);
            }
        });
    }

    onToggleLanguage = () => {
        let newLanguage = this.state.appLanguage == 'es' ? 'en' : 'es';
        Services.LanguageService.setLocale(newLanguage);
        AsyncStorage.setItem('app_language', newLanguage);

        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'Auth' })]
        });
        this.props.navigation.dispatch(resetAction);
    }

    getCurrencies = () => {
        this.props.screenProps.setLoading(true);
        Services.CurrencyService.getCurrencies((data) => {
            if(data.success) {
                let currencies = data.currencies;
                let options = [];
                for(var idx in currencies) {
                    const currency = currencies[idx];
                    options.push({
                        id: currency.id,
                        code: currency.code,
                        symbol: currency.symbol,
                        label: `${currency.symbol} - ${currency.name}`
                    })
                }

                this.props.screenProps.setLoading(false);
                this.props.navigation.push('OptionsPickerModal', {
                    options: options,
                    onSelectedOption: (option) => {
                        Services.UserService.updateMe({
                            currency_id: option.id
                        }, (data) => {
                            if(data.success && data.user) {
                                Services.UserService.user = data.user;
                            }

                            showMessage({
                                message: "Éxito",
                                description: "Tu moneda se guardó correctamente",
                                type: "success",
                            });

                            this.props.navigation.pop();
                        }, (err) => {
                            // Do nothing
                        });
                    }
                });
            }
        }, (err) => {
            // Do nothing
        });
    }

    render() {
        return (
            <Container style={{ flex : 1 }}>
                <View style={{ flex: 1, width: '100%', height: '100%' }}>

                    <HeaderBar
                        containerStyle={{ paddingTop: 0 }}
                        isBackButton={false}
                        navigation={this.props.navigation}
                        /* title={Services.LanguageService.string('navigation.configuration')} */
                        centerContent={() => {
                            return (
                                <Text style={{ color: Utils.Color.Primary, fontSize: Utils.UI.normalizeFont(18), fontFamily: Utils.Font.Charlotte() }}>{ Services.LanguageService.string('appName') }</Text>
                            );
                        }}
                        /* rightContent={() => {
                            return (
                                <Text style={{ color: Utils.Color.Primary, fontSize: Utils.UI.normalizeFont(14), fontFamily: Utils.Font.Charlotte() }}>{ Services.LanguageService.string('appName') }</Text>
                            )
                        }} */
                    />

                    <ScrollView style={styles.container}>
                        <View style={styles.sectionLogo}>
                            { Services.UserService.user != null &&
                                <TouchableOpacity
                                    activeOpacity={.9}
                                    onPress={() => {
                                        Vibration.vibrate();
                                        this.props.screenProps.showInteractableAlertWithButtons(null, Services.LanguageService.string('invite_text_1'), [
                                            {
                                                id: 1,
                                                text: Services.LanguageService.string('invite_share_alias'),
                                                onPress: () => {
                                                    this.props.screenProps.hideInteractableAlert()

                                                    Share.open({
                                                        message: Services.LanguageService.string('invite_text_2', { username: Services.UserService.user.username }),
                                                            title: Services.LanguageService.string('invite_text_2', { username: Services.UserService.user.username })
                                                    })
                                                    .then((res) => {})
                                                    .catch((err) => { err && console.log(err); });
                                                }
                                            }
                                        ]);
                                    }}>
                                    <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 0 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 5, paddingHorizontal: 20, backgroundColor: Utils.Color.Primary, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
                                            <Text style={{ fontFamily: Utils.Font.Montserrat(700), color: Utils.Color.White, textAlign: 'center', fontSize: Utils.UI.normalizeFont(20) }}>{ Services.UserService.user.username }</Text>
                                            <Icon
                                                name={'share-variant'}
                                                color={Utils.Color.PrimaryLight}
                                                size={Utils.UI.normalizeFont(18)}
                                                style={{ marginLeft: 5, opacity: .3 }}
                                            />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            }

                            <View style={{ width: 3, height: 25, backgroundColor: Utils.Color.PrimaryDark, opacity: .3 }}></View>

                            <Text style={{ textAlign: 'center', fontFamily: Utils.Font.Montserrat(400), fontSize: Utils.UI.normalizeFont(12), color: '#222', marginTop: 0, paddingHorizontal: 10 }} >{ Services.LanguageService.string('invite_details_alias') }</Text>
                        </View>

                        <View style={styles.separator}></View>

                        <TouchableOpacity
                            activeOpacity={.5}
                            onPress={this.onToggleCountry}
                            style={styles.optionContainer}>
                            <View style={{ flex: 0, marginRight: 10 }}>
                                <View style={{ backgroundColor: 'rgba(0,0,0,.1)', width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(0,0,0,.01)' }}></View>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                { Services.UserService.user != null && Services.UserService.user.country_name != null ?
                                    <Text style={styles.optionLabel}>{ Services.UserService.user.country_name }</Text>
                                :
                                    <Text style={styles.optionLabel}>Configura tu país ahora</Text>
                                }
                                <Text style={styles.optionDescription}>Toca para cambiar tu país</Text>
                            </View>
                        </TouchableOpacity>

                        {/* <TouchableOpacity
                            activeOpacity={.5}
                            onPress={this.onToggleLanguage}
                            style={styles.optionContainer}>
                            <View style={{ flex: 0, marginRight: 10 }}>
                                <View style={{ backgroundColor: 'rgba(0,0,0,.1)', width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(0,0,0,.01)' }}></View>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                <Text style={styles.optionLabel}>{ Services.LanguageService.string('language') + ': ' + (this.state.appLanguage == 'es' ? 'Español' : 'English') }</Text>
                                <Text style={styles.optionDescription}>{ Services.LanguageService.string('language_tap_to_change') }</Text>
                            </View>
                        </TouchableOpacity> */}

                        <TouchableOpacity
                            activeOpacity={.5}
                            onPress={() => {
                                this.props.navigation.push('TransactionCategoriesScreen', {
                                    transaction_type_id : 1
                                })
                            }}
                            style={styles.optionContainer}>
                            <View style={{ flex: 0, marginRight: 10 }}>
                                <View style={{ backgroundColor: 'rgba(0,0,0,.1)', width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(0,0,0,.01)' }}></View>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                <Text style={styles.optionLabel}>{ Services.LanguageService.string('ConfigurationScreen.income_categories') }</Text>
                                <Text style={styles.optionDescription}>{ Services.LanguageService.string('ConfigurationScreen.income_categories_sub') }</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={.5}
                            onPress={() => {
                                this.props.navigation.push('TransactionCategoriesScreen', {
                                    transaction_type_id : 2
                                })
                            }}
                            style={styles.optionContainer}>
                            <View style={{ flex: 0, marginRight: 10 }}>
                                <View style={{ backgroundColor: 'rgba(0,0,0,.1)', width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(0,0,0,.01)' }}></View>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                <Text style={styles.optionLabel}>{ Services.LanguageService.string('ConfigurationScreen.expense_categories') }</Text>
                                <Text style={styles.optionDescription}>{ Services.LanguageService.string('ConfigurationScreen.expense_categories') }</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={.5}
                            onPress={() => {
                                this.props.screenProps.showInteractableAlertWithButtons(Services.LanguageService.string('appName'), `\nVersión ${DeviceInfo.getReadableVersion()}`, [
                                    {
                                        id: 1,
                                        text: 'Aceptar',
                                        onPress: () => {
                                            this.props.screenProps.hideInteractableAlert()
                                        }
                                    }
                                ], {
                                    vibrate: true,
                                    shadowBackgroundImage: require('app/src/assets/images/interactable_alert/header_4.jpg'),
                                    shadowBackgroundColor: 'white'
                                });
                            }}
                            style={styles.optionContainer}>
                            <View style={{ flex: 0, marginRight: 10 }}>
                                <View style={{ backgroundColor: 'rgba(0,0,0,.1)', width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(0,0,0,.01)' }}></View>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                <Text style={styles.optionLabel}>{ Services.LanguageService.string('ConfigurationScreen.about_us') }</Text>
                                <Text style={styles.optionDescription}>{ Services.LanguageService.string('ConfigurationScreen.about_us_sub') }</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={.5}
                            onPress={() => {
                                this.props.screenProps.setLoading(true);

                                setTimeout(() => {
                                    // Reset the token too
                                    AsyncStorage.removeItem('JWT_TOKEN');
                                    SetToken(null);

                                    Services.AuthService.logout();

                                    const resetAction = StackActions.reset({
                                        index: 0,
                                        actions: [NavigationActions.navigate({ routeName: 'Auth' })]
                                    });
                                    this.props.navigation.dispatch(resetAction);

                                    this.props.screenProps.setLoading(false);
                                }, 1000);
                            }}
                            style={styles.optionContainer}>
                            <View style={{ flex: 0, marginRight: 10 }}>
                                <View style={{ backgroundColor: Utils.Color.PrimaryDark, width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(0,0,0,.01)' }}></View>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                <Text style={styles.optionLabel}>{ Services.LanguageService.string('ConfigurationScreen.logout') }</Text>
                                <Text style={styles.optionDescription}>{ Services.LanguageService.string('ConfigurationScreen.logout_sub') }</Text>
                            </View>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    sectionLogo: {
        flex: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    logo: {
        maxWidth: 90,
        height: 90,
        resizeMode: 'contain',
        borderRadius: 10,
        marginBottom: 10
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
    },
    optionContainer: {
        flex: 0,
        width: '100%',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,.12)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10
    },
    optionLabel: {
        fontFamily: Utils.Font.Montserrat(700),
        fontSize: Utils.UI.normalizeFont(13),
        color: Utils.Color.DarkGray,
        marginBottom: 10
    },
    optionDescription: {
        fontFamily: Utils.Font.Montserrat(400),
        fontSize: Utils.UI.normalizeFont(12),
        color: 'rgba(20,20,20,.35)',
        maxWidth: '80%',
        marginVertical: 0
    },
    optionImage: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        marginLeft: 10
    },
    separator: {
        width: '100%',
        height: 1,
        backgroundColor: 'rgba(0,0,0,.1)',
        marginVertical: 10
    }
});