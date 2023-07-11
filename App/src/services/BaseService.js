import axios from 'axios';
import axiosRetry from 'axios-retry';
import firebase from 'react-native-firebase';
import { AsyncStorage, Alert } from 'react-native';
import * as Services from './index'
import Rate, { AndroidMarket } from 'react-native-rate'

/** This function configure the Axios library **/

var ENVIRONMENTS = {
    LOCAL: 'http://localhost:3333/api/v1/',
    PRODUCTION: 'http://167.99.159.107:3333/api/v1/'
};

var BASE_URL = __DEV__ ? ENVIRONMENTS.PRODUCTION : ENVIRONMENTS.PRODUCTION;
var JWT_TOKEN = null;

// Ads
let advert = firebase.admob().interstitial(Services.AdsService.getInterstitialIdentifier());
const AdRequest = firebase.admob.AdRequest;
/*request
    .addKeyword('finances')
    .addKeyword('money')
    .addKeyword('wallet');*/

export function SetToken(token) {
    JWT_TOKEN = token;
}

export function ApiService(timeout = 15000, headers) {

    GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest; // To debug requests in Chrome

    if(!headers) {
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };
        if(JWT_TOKEN) {
            headers['Authorization'] = 'Bearer ' + JWT_TOKEN;
        }
    }

    // Instance the webservice caller
    var api = axios.create({
        baseURL: getBaseUrl(),
        timeout: timeout,
        headers: headers
    });

    api.interceptors.response.use(function (response) {
        if(response.data && response.data.show_ads_video) {
            // Show ad video
            const request = new AdRequest();
            advert.loadAd(request.build());
            advert.on('onAdLoaded', () => {
                advert.show();
            });
        } else if(response.data && response.data.ask_review) {
            console.log(response);
            Alert.alert('Reseñas', '¿Te ha gustado la aplicación? ¡Dejándonos una reseña nos ayudas muchísimo a mejorar!', [
                {
                    text : 'Dejar reseña',
                    onPress: () => {
                        const options = {
                            AppleAppID:"1498072209",
                            GooglePackageName:"com.app.controlatusgastos",
                            preferredAndroidMarket: AndroidMarket.Google,
                            preferInApp: false,
                            openAppStoreIfInAppFails: true,
                            fallbackPlatformURL:"https://play.google.com/store/apps/details?id=com.app.controlatusgastos",
                        };

                        Rate.rate(options, success => {
                            if (success) {
                                Services.AnalyticsService.postEvent({
                                    type: 'left_app_review',
                                    view: 'BaseService'
                                });

                                Alert.alert("¡Muchas gracias!", "¡Gracias por dejarnos tu reseña!");
                            }
                        });
                    }
                },
                {
                    text: 'Preguntarme más tarde',
                    onPress: () => {
                        // Do nothing
                    }
                }
            ]);
            /*AsyncStorage.getItem('LeftReview').then((value) => {
                if(value == null) {
                    Alert.alert('Reseñas', '¿Te ha gustado la aplicación? ¡Dejándonos una reseña nos ayudas muchísimo!', [
                        {
                            text : 'Dejar reseña',
                            onPress: () => {
                                const options = {
                                    AppleAppID:"1498072209",
                                    GooglePackageName:"com.app.controlatusgastos",
                                    preferredAndroidMarket: AndroidMarket.Google,
                                    preferInApp: false,
                                    openAppStoreIfInAppFails: true,
                                    fallbackPlatformURL:"https://play.google.com/store/apps/details?id=com.app.controlatusgastos",
                                };

                                Rate.rate(options, success => {
                                    AsyncStorage.setItem('LeftReview', '1');
                                    if (success) {
                                        // this technically only tells us if the user successfully went to the Review Page. Whether they actually did anything, we do not know.
                                        Alert.alert("¡Muchas gracias!", "¡Gracias por dejarnos tu reseña!");
                                    }
                                });
                            }
                        },
                        {
                            text: 'Preguntarme más tarde',
                            onPress: () => {
                                // Do nothing
                            }
                        }
                    ]);
                }
            });*/
        }

        return response;
    }, function (error) {
        // Do something with response error
        console.log("Error", error);
        return Promise.reject(error);
    });

    axiosRetry(api, {
        retries: 5,
        retryDelay: (retryCount) => {
            return retryCount * 1000;
        }
    });

    return api;
}

export function setBaseUrl(baseUrl) {
    if(baseUrl == null) {
        BASE_URL = ENVIRONMENTS.PRODUCTION;
    } else {
        BASE_URL = baseUrl;
    }
}

export function getBaseUrl() {
    return BASE_URL;
}

export function encodeQueryData(parameters) {
    let ret = [];
    for (let d in parameters)
        ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(parameters[d]));
    return ret.join('&');
}
