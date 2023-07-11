import React from 'react';
import {
  Component,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  AsyncStorage,
  Dimensions,
  ActivityIndicator,
  findNodeHandle,
  UIManager,
  Vibration,
  Platform
} from 'react-native';

// Modules
import BottomSheet from 'reanimated-bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated from 'react-native-reanimated'
const AnimatedView = Animated.View

// Styles
import * as Utils from '../styles';

// Services
import {SetToken} from '../services/BaseService';

const { width, height } = Dimensions.get('window');

export default class InteractableAlert extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            visible: false,
            isOpened: false,
            snapPoints: ['50%', '20%', 0],
            containerHeight: 500 // First snap point
        };

        // Bind variables
        this.bottomSheetRef = null;

        // Animated values
        this.fall = new Animated.Value(1);
        this.overlayOpacity = new Animated.Value(1);
    }

    componentDidMount() {

    }

    isOpened = () => {
        return this.state.isOpened
    }

    openWithButtons = (title, message, buttons, extraData) => {
        let data = {
            title,
            message,
            buttons,
            extraData
        };

        this.setState({
            data,
            visible: true,
            isOpened: true
        });

        if(extraData && extraData.vibrate)
            Vibration.vibrate();

        setTimeout(() => {
            this.bottomSheetRef.snapTo(0)
        }, 100);
    }

    hideInteractableAlert = () => {
        this.bottomSheetRef.snapTo(2);
    }

    renderInner = () => {
        const { data } = this.state;
        if(!data)
            return null;

        const { buttons } = data;

        return (
            <View
                ref={(e) => { this.innerContent = e; }}
                style={styles.panel}>
                { buttons && buttons.map((e) => {
                    return (
                        <TouchableOpacity
                            onPress={e.onPress}
                            style={[styles.panelButton, e.containerStyle]}>
                            <Text style={[styles.panelButtonTitle, e.textStyle]}>{ e.text }</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    renderHeader = () => {
        const { data, isLoading } = this.state;
        if(!data)
            return null;

        const title = data.title != null ?
            <Text style={{ fontFamily: Utils.Font.Montserrat(600), color: 'rgba(255,255,255,.85)', textAlign: 'center', fontSize: Utils.UI.normalizeFont(18), marginBottom: 10 }}>{ data.title }</Text>
        : null;

        const message = data.message != null ?
            <Text style={{ fontFamily: Utils.Font.Montserrat(400), color: 'rgba(255,255,255,1)', textAlign: 'center', fontSize: Utils.UI.normalizeFont(13) }}>{ data.message }</Text>
        : null;

        return (
            <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#222', padding: 10, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                <View style={styles.header}></View>
                <TouchableOpacity
                    style={{ padding: 15, alignSelf: 'flex-start', position: 'absolute', top: 0, left: 0 }}
                    onPress={this.hideInteractableAlert}>
                    <Icon
                        name={'close'}
                        color={'white'}
                        size={Utils.UI.normalizeFont(22)}
                    />
                </TouchableOpacity>
                { title }
                { message }
            </View>
        );
    };

    renderShadow = () => {
        const animatedShadowOpacity = Animated.interpolate(this.fall, {
            inputRange: [0, 1],
            outputRange: [1, 0],
        });

        const { data } = this.state;
        let shadowBackgroundColor = '#48489c';
        let shadowBackgroundImage = require('app/src/assets/images/interactable_alert/header_1.jpg');
        if(data && data.extraData && data.extraData.shadowBackgroundColor)
            shadowBackgroundColor = data.extraData.shadowBackgroundColor;
        if(data && data.extraData && data.extraData.shadowBackgroundImage)
            shadowBackgroundImage = data.extraData.shadowBackgroundImage;

        return (
            <AnimatedView
                style={[
                    styles.shadowContainer,
                {
                    opacity: animatedShadowOpacity,
                    backgroundColor: shadowBackgroundColor
                },
                ]}>
                <TouchableOpacity
                    activeOpacity={.95}
                    onPress={this.hideInteractableAlert}
                    style={{ width: '100%', height: height * .5, justifyContent: 'center', alignItems: 'center' }}>
                    <Image
                        source={shadowBackgroundImage}
                        resizeMode={'contain'}
                        style={{ width: '100%' }}
                    />
                </TouchableOpacity>
            </AnimatedView>
        );
    }

    render() {
        if(!this.state.visible)
            return null;

        return (
            <View
                style={[styles.container]}>
                <BottomSheet
                    ref={(e) => { this.bottomSheetRef = e; }}
                    snapPoints={this.state.snapPoints}
                    renderContent={this.renderInner}
                    renderHeader={this.renderHeader}
                    initialSnap={1}
                    callbackNode={this.fall}
                    enabledInnerScrolling={true}
                    enabledBottomInitialAnimation={true}
                    enabledContentTapInteraction={true}
                    enabledGestureInteraction={Platform.OS === 'ios' ? true : false}
                    onOpenEnd={() => {
                        /*if(this.innerContent) {
                            UIManager.measure(findNodeHandle(this.innerContent), (x, y, width, height) => {
                                let snapPoints = this.state.snapPoints;
                                snapPoints[0] = height;
                                console.log(snapPoints);
                                this.setState({
                                    snapPoints
                                }, () => {
                                    this.bottomSheetRef.snapTo(0)
                                })
                            });
                        }*/
                    }}
                    onCloseEnd={() => {
                        this.setState({ isOpened : false });
                        setTimeout(() => {
                            this.setState({ visible: false });
                        }, 75);
                    }}
                />

                { this.renderShadow() }
            </View>
        );
    }
}

const IMAGE_SIZE = 200

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: -1,
        width: '100%',
        height: '100%',
        //backgroundColor: 'rgba(0,0,0,.5)'
    },
    box: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
    },
    panelContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    panel: {
        height: '100%',
        padding: 20,
        backgroundColor: '#222',
        paddingTop: 20,
        shadowColor: '#222',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 5,
        shadowOpacity: 0.4,
    },
    header: {
        width: 50,
        height: 7,
        backgroundColor: 'rgba(255,255,255,.1)',
        borderRadius: 5,
        alignSelf: 'center',
        marginVertical: 10,
        marginBottom: 20
    },
    panelHeader: {
        alignItems: 'center',
    },
    panelHandle: {
        width: 40,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00000040',
        marginBottom: 10,
    },
    panelTitle: {
        fontSize: 27,
        height: 35,
    },
    panelSubtitle: {
        fontSize: 14,
        color: 'gray',
        height: 30,
        marginBottom: 10,
    },
    panelButton: {
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#292929',
        alignItems: 'center',
        marginVertical: 10,
    },
    panelButtonTitle: {
        color: 'white',
        fontFamily: Utils.Font.Montserrat(600),
        fontSize: Utils.UI.normalizeFont(13)
    },
    shadowContainer: {
        position: 'absolute',
        top: -10,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#48489c',
    },

});