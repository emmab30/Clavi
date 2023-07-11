import React from 'react';
import {
    Component,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    AsyncStorage
} from 'react-native';

// Modules
import * as Animatable from 'react-native-animatable';

// Styles
import * as Utils from '../styles'

// Services
import { SetToken } from '../services/BaseService'

export default class Button extends React.Component {

    // Hide header bar
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {

        const {
            text,
            onPress,
            buttonStyle,
            textStyle,
            icon
        } = this.props;

        return (
            <TouchableOpacity
                activeOpacity={.9}
                onPress={onPress}
                style={[styles.container, buttonStyle]}>
                { icon != null && icon }
                <Text style={[styles.title, textStyle]}>{text}</Text>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 0,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        padding: 10,
        paddingVertical: 15,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: Utils.Color.toOpacity(Utils.Color.PrimaryDark, 0.25),
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    box: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    bold: {
        fontFamily: Utils.Font.Montserrat(600)
    },
    big: {
        fontSize: 20
    },
    title: {
        fontFamily: Utils.Font.Montserrat(700),
        fontSize: Utils.UI.normalizeFont(14),
        textAlign: 'center',
        color: Utils.Color.PrimaryDark
    }
});