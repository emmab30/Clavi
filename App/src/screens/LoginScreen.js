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
    AsyncStorage,
    Platform,
    Dimensions
} from 'react-native';

// Services
import { SetToken } from '../services/BaseService'
import * as Services from 'app/src/services';

// Modules
import * as RNLocalize from "react-native-localize";
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import appleAuth, {
    AppleButton,
    AppleAuthRequestOperation,
    AppleAuthRequestScope,
    AppleAuthCredentialState,
} from '@invertase/react-native-apple-authentication';
import { StackActions, NavigationActions } from 'react-navigation';
const FBSDK = require('react-native-fbsdk');
const {
  LoginButton,
  AccessToken,
  LoginManager,
  GraphRequest,
  GraphRequestManager
} = FBSDK;
const { width, height } = Dimensions.get('window');
import OneSignal from 'react-native-onesignal';

// Styles
import * as Utils from '../styles'
import { showMessage } from 'react-native-flash-message';

export default class LoginScreen extends React.Component {

    // Hide header bar
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        AsyncStorage.getItem('JWT_TOKEN').then((value) => {
            if(value != null) {
                SetToken(value);
                this.initialize();
            }
        });

        // Initialize onesiganl
        OneSignal.init(ONESIGNAL_KEY);
        OneSignal.inFocusDisplaying(2);
        OneSignal.addEventListener('ids', this.onIds);

        // Just update, not success or error.
        // Force to spanish. To Do
        Services.LanguageService.setLocale('es');

        /* let preferredLanguage = RNLocalize.getLocales();
        if(preferredLanguage != null && preferredLanguage.length > 0)
            preferredLanguage = preferredLanguage[0].languageCode;
        else
            preferredLanguage = 'es';

        AsyncStorage.getItem('app_language').then((value) => {
            if(value != null) {
                Services.LanguageService.setLocale(value);
            } else {
                Services.LanguageService.setLocale(preferredLanguage);
            }

            this.forceUpdate();
        }); */
    }

    onIds(device) {
        if(device != null && device.userId != null) {
            AsyncStorage.setItem('onesignal_userId', device.userId);
        }
    }

    handleLogin = () => {
        const { email, password } = this.state;

        this.props.screenProps.setLoading(true)
        AsyncStorage.getItem('onesignal_userId').then((token) => {
            let dataToSend = {
                email,
                password
            };
            if(token != null) {
                dataToSend.push_notification_token = token;
            }

            Services.AuthService.login(dataToSend, (data) => {
                AsyncStorage.setItem('JWT_TOKEN', data.token);
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
                //this.goToSessions();
            }, (err) => {
                this.props.screenProps.setLoading(false)
                Alert.alert('Intenta nuevamente', 'Las credenciales no son válidas');
            });
        });
    }

    initialize = () => {
        this.props.screenProps.setLoading(false)

        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'Main' })]
        });
        this.props.navigation.dispatch(resetAction);
    }

    handleLoginFacebook = () => {
        // Attempt a login using the Facebook login dialog asking for default permissions.
        LoginManager.logInWithPermissions(["public_profile", "email"]).then((result) => {
            if (result.isCancelled) {
                // Do nothing
            } else {
                if(result.grantedPermissions && result.grantedPermissions.length > 1) {
                    // Graph to get info from the user
                    // Create a graph request asking for user information with a callback to handle the response.
                    const infoRequest = new GraphRequest(
                        '/me?fields=first_name,last_name,email',
                        null,
                        ((err, result) => {

                            AccessToken.getCurrentAccessToken().then((accessToken) => {
                                if(!err) {
                                    this.props.screenProps.setLoading(true)
                                    AsyncStorage.getItem('onesignal_userId').then((token) => {
                                        let dataToSend = {
                                            name: result.first_name,
                                            last_name: result.last_name,
                                            email: result.email,
                                            snID: result.id,
                                            snType: 'facebook',
                                            token: accessToken.accessToken.toString(),
                                            appVersion: DeviceInfo.getReadableVersion(),
                                            platform: Platform.OS
                                        };

                                        if(token != null)
                                            dataToSend.push_notification_token = token;

                                        Services.AuthService.loginWithFacebook(dataToSend, (data) => {
                                            if(data && data.user && data.token) {
                                                AsyncStorage.setItem('JWT_TOKEN', data.token);
                                                axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
                                                this.initialize();
                                            }
                                        }, (err) => {
                                            this.props.screenProps.setLoading(false)
                                            Alert.alert("Lo lamentamos", "Surgió un error al ingresar. Intenta nuevamente");
                                        });
                                    });
                                }
                            })
                        })
                    );
                    new GraphRequestManager().addRequest(infoRequest).start();
                } else {
                    Alert.alert("Error", "Otorga los permisos de Facebook para poder ingresar");
                }
            }
        }, (error) => {
            Alert.alert("Error", "Surgió un error al ingresar. Intenta nuevamente");
        });
    }

    handleMockupLogin = () => {
        AsyncStorage.getItem('onesignal_userId').then((token) => {
            let send = {
                id: 1
            };

            if(token != null)
                send.push_notification_token = token;

            Services.AuthService.loginWithMockup(send, (data) => {
                if(data && data.user && data.token) {
                    AsyncStorage.setItem('JWT_TOKEN', data.token);
                    axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
                    this.initialize();
                }
            }, (err) => {
                this.props.screenProps.setLoading(false)
                Alert.alert("Lo lamentamos", "Surgió un error al ingresar. Intenta nuevamente");
            });
        });
    }

    onAppleButtonPress = async () => {
        // Sign in request
        const responseObject = await appleAuth.performRequest({
            requestedOperation: AppleAuthRequestOperation.LOGIN,
            requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
        });

        // Authorization state request
        const credentialState = await appleAuth.getCredentialStateForUser(responseObject.user);

        if (credentialState === AppleAuthCredentialState.AUTHORIZED) {
            AsyncStorage.getItem('onesignal_userId').then((token) => {
                let dataToSend = {
                    name: responseObject.fullName.givenName,
                    last_name: responseObject.fullName.familyName,
                    email: responseObject.user + '@apple.com',
                    snID: responseObject.user,
                    snType: 'apple',
                    token: responseObject.fullName.identityToken,
                    appVersion: DeviceInfo.getReadableVersion()
                };

                if(token != null)
                    dataToSend.push_notification_token = token;

                this.props.screenProps.setLoading(true)
                Services.AuthService.loginWithApple(dataToSend, (data) => {
                    this.props.screenProps.setLoading(false)
                    if(data && data.user && data.token) {
                        AsyncStorage.setItem('JWT_TOKEN', data.token);
                        axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
                        this.initialize();
                    } else if(data.message) {
                        Alert.alert("Lo lamentamos", data.message);
                    }
                }, (err) => {
                    this.props.screenProps.setLoading(false)
                    Alert.alert("Lo lamentamos", "Surgió un error al ingresar. Intenta nuevamente");
                });
            });
        } else {
            Alert.alert('Intenta nuevamente', 'Surgió un error al ingresar con Apple. Intenta ingresar con otro medio.');
        }
    }

    login = (email = '') => {
        this.props.navigation.push('LoginCredentialsScreen', {
            email: email,
            onAttempt: (data) => {
                this.props.screenProps.setLoading(true);

                AsyncStorage.getItem('onesignal_userId').then((token) => {
                    let toSubmit = {
                        email: data.email,
                        password: data.password,
                    };

                    if(token != null)
                        toSubmit.push_notification_token = token;

                    toSubmit.appVersion = DeviceInfo.getReadableVersion();
                    toSubmit.snType = 'clavi';
        
                    Services.AuthService.login(toSubmit, (data) => {
                        if(data.success) {
                            this.props.navigation.pop();
                            
                            setTimeout(() => {
                                if(data && data.user && data.token) {
                                    AsyncStorage.setItem('JWT_TOKEN', data.token);
                                    axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
                                    this.initialize();
                                }
                            }, 250);
                        } else {
                            showMessage({
                                message: "Oh oh",
                                description: data.message,
                                type: "danger",
                            });
                        }
                        this.props.screenProps.setLoading(false);
                    }, (err) => {
                        this.props.screenProps.setLoading(false);
                    }); 
                });
            }
        });
    }

    signup = () => {
        this.props.navigation.push('RegisterCredentialsScreen', {
            onRegistered: (user) => {
                showMessage({
                    message: "Éxito",
                    description: '¡Te registraste correctamente! Ya puedes ingresar',
                    type: "success",
                });

                this.login(user.email);
            }
        });
    }

    render() {
        return (
            <View style={[styles.container]}>

                <View style={styles.sectionLogo}>
                    <Text style={[styles.sectionTitleText, { fontFamily: Utils.Font.Charlotte(), fontSize: Utils.UI.normalizeFont(50), textAlign: 'center', maxWidth: '100%' }]}>{ Services.LanguageService.string('appName') }</Text>
                    <Image
                        source={require('../assets/images/illustrations/2021.png')}
                        style={styles.logo}
                    />
                    {/* <Text style={[styles.sectionTitleText, { textAlign: 'center', maxWidth: '80%' }]}>{ Services.LanguageService.string('LoginScreen.title') }</Text> */}
                </View>

                <View style={styles.socialNetworksSection}>
                    { Platform.OS === 'ios' &&
                        <TouchableOpacity style={[styles.buttonSocialNetwork, { padding: 0, backgroundColor: 'transparent' }]}>
                            <AppleButton
                                style={{ width: '100%', height: 50 }}
                                buttonStyle={AppleButton.Style.BLACK}
                                buttonType={AppleButton.Type.SIGN_IN}
                                onPress={this.onAppleButtonPress}
                            />
                        </TouchableOpacity>
                    }

                    <TouchableOpacity onPress={this.handleLoginFacebook} style={[styles.buttonSocialNetwork]}>
                        <Image
                            source={require('../assets/images/icons/facebook-logo.png')}
                            style={{ width: 20, height: 20, resizeMode: 'contain', tintColor: 'white' }}
                        />
                        <Text style={[styles.buttonSocialNetworkText, { marginLeft: 5, textAlign: 'center', color: 'white' }]}>{ Services.LanguageService.string('LoginScreen.login_with_facebook') }</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ width: '100%', height: 2, backgroundColor: 'rgba(0,0,0,.025)', marginVertical: 5 }}></View>

                <View style={{ flex : 0, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => this.login()} style={{ flex : 0, marginVertical: 5 }}>
                        <Text style={{ fontFamily: Utils.Font.Montserrat(800), color: Utils.Color.Primary, fontSize: Utils.UI.normalizeFont(14), textAlign: 'center' }}>Ingresar con mi cuenta</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={this.signup} style={{ flex : 0, marginVertical: 5 }}>
                        <Text style={{ fontFamily: Utils.Font.Montserrat(600), color: Utils.Color.Primary, fontSize: Utils.UI.normalizeFont(12), textAlign: 'center', textDecorationLine: 'underline' }}>Registrar nueva cuenta</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Utils.Color.White,
        paddingBottom: '2.5%'
    },
    sectionLogo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    sectionTitle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    sectionTitleText: {
        color: Utils.Color.Primary
    },
    sectionInputs: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15
    },
    logo: {
        width: width,
        maxHeight: 220,
        resizeMode: 'contain',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20
    },
    input: {
        width: '90%',
        alignSelf: 'center',
        height: 50,
        fontSize: 15,
        backgroundColor: '#b7b0cf',
        borderRadius: 5,
        padding: 10,
        marginVertical: 10,
        color: 'white',
        fontFamily: Utils.Font.Montserrat(400)
    },
    button: {
        width: '60%',
        alignSelf: 'center',
        marginBottom: 20,
        padding: 15,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#40395f'
    },
    socialNetworksSection: {
        flex: 0,
        padding: 10
    },
    buttonSocialNetwork: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 5,
        marginVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        backgroundColor: Utils.Color.Primary
    },
    buttonSocialNetworkText: {
        fontFamily: Utils.Font.Montserrat(500),
        fontSize: 18,
        color: '#222',
    }
});