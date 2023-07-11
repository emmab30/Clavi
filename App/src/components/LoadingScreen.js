import React from 'react';
import {
    Component,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    AsyncStorage,
    Animated
} from 'react-native';

// Modules
/*import OneSignal from 'react-native-onesignal';*/
import * as Animatable from 'react-native-animatable';
import LottieView from 'lottie-react-native';

// Styles
import * as Utils from '../styles'

// Services
import * as Services from 'app/src/services';
import { SetToken } from '../services/BaseService'

export default class LoadingScreen extends React.Component {

    // Hide header bar
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isMounted: false
        };

        this.animatedValue = new Animated.Value(0);
        this.animatedOpacity = new Animated.Value(0);
    }

    componentDidMount() {
        this.setState({
            isMounted: true
        });
    }

    animateOpacityText = (toValue, callback) => {
        Animated.timing(this.animatedOpacity, {
            toValue: toValue,
            friction: 250,
            useNativeDriver: true
        }).start(callback);
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.isLoading == true) {
            this.setState({ isAnimating: true })
            Animated.parallel([
                Animated.timing(this.animatedValue, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true
                })
            ]).start();

            this.animateOpacityText(0.2, () => {
                this.animateOpacityText(0.1, () => {
                    this.animateOpacityText(0.4, () => {
                        this.animateOpacityText(0.3, () => {
                            this.animateOpacityText(1);
                        });
                    });
                });
            });
        } else {
            Animated.timing(this.animatedValue, {
                toValue: 0,
                duration: 750,
                useNativeDriver: true
            }).start(() => {
                this.setState({ isAnimating : false })
            });
        }
    }

    render() {
        if(!this.state.isAnimating)
            return null;

        return (
            <Animated.View style={[styles.container, { opacity : this.animatedValue }]}>
                <LottieView
                    source={require('app/src/assets/animations/loading.json')}
                    autoPlay
                    style={{ width: '100%', height: 150 }}
                />
                <Animated.Text
                    style={[
                        styles.title,
                        { fontFamily: Utils.Font.Charlotte(), fontSize: Utils.UI.normalizeFont(30), textAlign: 'center', maxWidth: '100%', marginTop: -30 },
                        { opacity: this.animatedOpacity }
                    ]}>
                    { Services.LanguageService.string('appName') }
                </Animated.Text>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,1)',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999
    },
    logo: {
        maxWidth: '15%',
        maxHeight: 100,
        alignSelf: 'center',
        resizeMode: 'contain',
        marginBottom: 0
    },
    title: {
        color: Utils.Color.Primary
    }
});