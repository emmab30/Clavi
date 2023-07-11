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
    LayoutAnimation
} from 'react-native';

// Modules
import ParsedText from 'react-native-parsed-text';
import moment from 'moment';
import 'moment/locale/es'
moment.locale('es');
import Icon from 'react-native-vector-icons/AntDesign';
/*import OneSignal from 'react-native-onesignal';*/
import firebase from 'react-native-firebase';

// Components
import HeaderBar from 'app/src/components/HeaderBar';
import Balance from 'app/src/components/Balance';
import Button from 'app/src/components/Button';
import RowTransaction from 'app/src/components/Transactions/RowTransaction';

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

/* Patterns for masked text */
const boldPattern = /(\s\*|^\*)(?=\S)([\s\S]*?\S)\*(?![*\S])/gm;
const coloredPattern = /(\s-|^-)(?=\S)([\s\S]*?\S)-(?![-\S])/gm;
const italicPattern = /(\s_|^_)(?=\S)([\s\S]*?\S)_(?![_\S])/gm;
const strikethroughPattern = /(\s-|^-)(?=\S)([\s\S]*?\S)-(?![-\S])/gm;

const renderBoldText = (matchingString, matches) => {
    const match = matchingString.match(boldPattern);
    return `${match[0].replace(/\*(.*)\*/, "$1")}`;
};

const renderItalicText = (matchingString, matches) => {
    const match = matchingString.match(italicPattern);
    return `${match[0].replace(/_(.*)_/, "$1")}`;
};

const renderColoredText = (matchingString, matches) => {
    const match = matchingString.match(coloredPattern);
    return `${match[0].replace(/-(.*)-/, "$1")}`;
}

const renderStrikethroughText = (matchingString, matches) => {
    const match = matchingString.match(strikethroughPattern);
    return `${match[0].replace(/-(.*)-/, "$1")}`;
};

export default class RowNotification extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            notification: null
        };
    }

    componentDidMount() {
        this.parseProps(this.props)
    }

    componentWillReceiveProps(nextProps) {
        this.parseProps(nextProps)
    }

    parseProps = (props) => {
        // LayoutAnimation.easeInEaseOut()
        if(props.notification){
            const notification = props.notification;
            this.setState({ notification })

            if(notification.is_read == 0) {
                setTimeout(() => {
                    Services.UIService.Animate();
                    notification.is_read = 1;
                    this.setState({ notification })
                }, 6500);
            }
        }
    }

    handleUrlPress(url, matchIndex /*: number*/) {
        LinkingIOS.openURL(url);
    }

    handlePhonePress(phone, matchIndex /*: number*/) {
        AlertIOS.alert(`${phone} has been pressed!`);
    }

    handleNamePress(name, matchIndex /*: number*/) {
        AlertIOS.alert(`Hello ${name}`);
    }

    handleEmailPress(email, matchIndex /*: number*/) {
        AlertIOS.alert(`send email to ${email}`);
    }

    renderText(matchingString, matches) {
        // matches => ["[@michel:5455345]", "@michel", "5455345"]
        let pattern = /\[(@[^:]+):([^\]]+)\]/i;
        let match = matchingString.match(pattern);
        return `^^${match[1]}^^`;
    }

    render() {
        const {
            notification
        } = this.state;

        if(!notification)
            return null;

        const { is_read } = notification;

        return (
            <View style={{ width: '100%', height: 'auto' }}>
                <TouchableOpacity
                    activeOpacity={.8}
                    onPress={() => {
                        if(notification.route && notification.payload) {
                            try {
                                notification.payload = JSON.parse(notification.payload);
                                this.props.navigation.navigate(notification.route, notification.payload);
                            } catch (err) {}
                        }
                    }}
                    style={[styles.container]}>
                    { notification.icon != null &&
                        <View style={{ flex: 0, alignItems: 'center', paddingHorizontal: 10 }}>
                            <Image
                                source={{ uri: notification.icon }}
                                style={styles.icon}
                            />
                        </View>
                    }
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                            { is_read == 0 &&
                                <View style={{ width: 10, height: 10, borderRadius: 5, marginRight: 5, backgroundColor: Utils.Color.Primary, opacity: is_read ? 0 : 1 }}></View>
                            }
                            <Text style={[styles.title]}>{ notification.title }</Text>
                        </View>
                        <ParsedText
                            style={styles.message}
                            parse={[
                                {type: 'email',                     style: styles.email, onPress: this.handleEmailPress},
                                {pattern: boldPattern,              style: styles.bold, renderText: renderBoldText},
                                {pattern: italicPattern,            style: styles.italic, renderText: renderItalicText },
                                {pattern: coloredPattern,           style: styles.colored, renderText: renderColoredText }
                            ]}
                            childrenProps={{allowFontScaling: false}}>
                            { notification.message }
                        </ParsedText>
                        <Text style={styles.date}>{ moment.utc(notification.created_at).fromNow() }</Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.separator}></View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        alignSelf: 'center',
        padding: 10,
        flexDirection: 'row'
    },
    icon: {
        width: 35,
        height: 35,
        resizeMode: 'contain'
    },
    title: {
        fontFamily: Utils.Font.Montserrat(600),
        fontSize: Utils.UI.normalizeFont(12),
        color: Utils.Color.Primary
    },
    containerUnread: {
        backgroundColor: Utils.Color.ErrorRed
    },
    date: {
        fontFamily: Utils.Font.Montserrat(600),
        fontSize: Utils.UI.normalizeFont(9),
        color: Utils.Color.MiddleGray,
        marginTop: 5,
        marginLeft: 0,
        textAlign: 'right'
    },
    message: {
        fontFamily: Utils.Font.Montserrat(400),
        fontSize: Utils.UI.normalizeFont(11),
        color: 'rgba(0,0,0,.7)',
        marginVertical: 10
    },
    separator: {
        width: '95%',
        alignSelf: 'center',
        borderRadius: 10,
        height: 2,
        backgroundColor: 'rgba(0,0,0,.05)'
    },
    // Parsed text
    bold: {
        fontFamily: Utils.Font.Montserrat(500),
        color: '#222'
    },
    italic: {
        fontFamily: Utils.Font.Montserrat(300)
    },
    colored: {
        fontFamily: Utils.Font.Montserrat(800),
        color: Utils.Color.Primary
    },
    url: {
        color: 'red',
        textDecorationLine: 'underline',
    },
    email: {
        textDecorationLine: 'underline',
    },
    text: {
        color: 'black',
        fontSize: 15,
    },
    phone: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
    name: {
        color: 'red',
    },
    username: {
        color: 'green',
        fontWeight: 'bold'
    },
    magicNumber: {
        fontSize: 42,
        color: 'pink',
    },
    hashTag: {
        fontStyle: 'italic',
    }
});