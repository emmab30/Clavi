import React from 'react';
import {
    Component,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    AsyncStorage,
    Animated,
    Platform,
    Dimensions,
    SafeAreaView,
    TouchableWithoutFeedback
} from 'react-native';

// Styles
import * as Utils from '../styles'
import InteractableAlert from './InteractableAlert';

export default class Container extends React.Component {

    // Hide header bar
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {};
    }

    isIphoneX = () => {
        const dim = Dimensions.get('window');
        return (Platform.OS === 'ios' && (this.isIPhoneXSize(dim) || this.isIPhoneXrSize(dim)));
    }

    isIPhoneXSize = (dim) => {
        return dim.height == 812 || dim.width == 812;
    }

    isIPhoneXrSize = (dim) => {
        return dim.height == 896 || dim.width == 896;
    }

    render() {
        const DIM_TOP = this.isIphoneX() ? 30 : 0;
        const DIM_BOTTOM = 0;

        return (
            <SafeAreaView style={[{ flex: 1, marginTop: DIM_TOP, paddingTop: DIM_TOP, paddingBottom: DIM_BOTTOM }, this.props.style]}>
                { this.props.children }
            </SafeAreaView>
        );
    }

    /*render() {
        const DIM_VERTICAL = this.isIphoneX() ? 30 : 0;

        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    if(this.props.inheritedProps && this.props.inheritedProps.screenProps){
                        let isAlertOpened = this.props.inheritedProps.screenProps.isInteractableAlertOpened()
                        console.log(isAlertOpened);
                        if(isAlertOpened) {
                            this.props.inheritedProps.screenProps.hideInteractableAlert()
                        }
                    }
                }}>
                <View style={[{ flex: 1, paddingVertical: DIM_VERTICAL }, this.props.style]}>
                    { this.props.children }
                </View>
            </TouchableWithoutFeedback>
        );
    }*/
}

const styles = StyleSheet.create({

});