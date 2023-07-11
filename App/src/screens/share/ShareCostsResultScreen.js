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
    SafeAreaView,
    AsyncStorage,
    TouchableWithoutFeedback,
    ScrollView,
    Dimensions,
    FlatList
} from 'react-native';

// Modules
import Icon from 'react-native-vector-icons/AntDesign';
import moment from 'moment';
import 'moment/locale/es'
moment.locale('es');
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { showMessage, hideMessage } from "react-native-flash-message";
import Modal from "react-native-modalbox";
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import _ from 'lodash';
import ParsedText from 'react-native-parsed-text';
import Share from 'react-native-share';
import firebase from 'react-native-firebase';

// Styles
import * as Utils from '../../styles'

// Components
import Button from '../../components/Button';

// Services
import * as Services from 'app/src/services';

const { width, height } = Dimensions.get('window');

// Patterns for text
const orangePattern = /\|(.*?)\|/gm;
const boldPattern = /(\s\*|^\*)(?=\S)([\s\S]*?\S)\*(?![*\S])/gm;

const renderOrange = (matchingString, matches) => {
    const match = matchingString.match(orangePattern);
    return `${match[0].replace(/\|(.*?)\|/, "$1")}`;
}

const renderBoldText = (matchingString, matches) => {
    const match = matchingString.match(boldPattern);
    return `${match[0].replace(/\*(.*)\*/, "$1")}`;
};

const Banner = firebase.admob.Banner;
const AdRequest = firebase.admob.AdRequest;
const request = new AdRequest();

// Format amount function
const formatAmount = (amount) => {
    if(amount != null) {
        return Services.CurrencyService.formatCurrency(parseFloat(amount).toFixed(2));
    }

    return amount;
}

export default class ShareCostsResultScreen extends React.Component {

    // Hide header bar
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = {
            event: null,
            missingConcepts: false,
            textSharing: null,
            showBreakdown: false
        };
    }

    componentDidMount() {
        const { getParam } = this.props.navigation;
        const event = _.cloneDeep(getParam('event'));
        this.setState({
            event
        });

        // Process payments
        this.onProcess(event);

        Services.AnalyticsService.postEvent({
            type: 'view_results',
            view: 'ShareCostsResultScreen'
        });
    }

    onProcess = (event) => {
        let people = event.people;
        let payers = _.filter(people, (e) => e.amountDue < 0);

        for(var idx in payers) {
            const payer = payers[idx];
            if(!payer.payTo)
                payer.payTo = [];

            while (payer.amountDue < 0) {
                let receivers = _.filter(people, (e) => e.amountDue > 0);
                if(receivers.length == 0)
                    break;

                // Check the receivers
                for(var idx in receivers) {
                    if(payer.amountDue >= 0) {
                        break;
                    }
                    const receiver = receivers[idx];
                    const discountAmount = Math.min(payer.amountDue * -1, receiver.amountDue);
                    payer.payTo.push({
                        name: receiver.name,
                        amount: discountAmount
                    });
                    payer.amountDue += parseFloat(discountAmount);
                    receiver.amountDue -= parseFloat(discountAmount);
                }
            }
        }

        let missingConcepts = false;
        if(event)
            missingConcepts = !_.some(people, (e) => e.payTo != undefined && e.payTo.length > 0);

        const totalAmount = parseFloat(_.sumBy(event.people, (e) => _.sumBy(e.items, 'amount')));

        // Make text for sharing
        let textSharing = `${Services.LanguageService.string('ShareCosts.event')}: *${event.name}* - Total: _$${totalAmount.toFixed(2)}_\r\n\r\n`;
        textSharing += `${Services.LanguageService.string('ShareCosts.event_share_1')} \r\n\r\n`;
        for(var idx in event.people) {
            const e = event.people[idx];
            if(e.items != null && e.items.length > 0) {
                for(var idx1 in e.items) {
                    textSharing += `>> ${e.items[idx1].concept} = *$${e.items[idx1].amount}*.`;
                    textSharing += `\r\n`;
                }
            }
        }

        textSharing += `\r\n----------------\r\n\r\n`;
        textSharing += `${Services.LanguageService.string('ShareCosts.event_share_2')} \r\n\r\n`;
        for(var idx in event.people) {
            const e = event.people[idx];
            if(e.items != null && e.itemsConsummed.length > 0) {
                textSharing += `>> *${e.name}*: ${e.itemsConsummed.map((i) => '_' + i.concept + '_').join(', ')} (Total: $${e.totalAmountConsummed.toFixed(2)})`;
                textSharing += `\r\n`;
            }
        }

        textSharing += `\r\n----------------\r\n\r\n`;
        textSharing += `${Services.LanguageService.string('ShareCosts.event_share_3')} \r\n\r\n`;
        for(var idx in event.people) {
            const e = event.people[idx];
            textSharing += `>> *${e.name}*: $${e.totalAmountPaid}. [${Services.LanguageService.string('ShareCosts.total_balance')}: *${e.totalAmountPaid - e.totalAmountConsummed > 0 ? '+' : '-'} $${(e.totalAmountPaid - e.totalAmountConsummed) < 0 ? parseFloat((e.totalAmountPaid - e.totalAmountConsummed) * -1).toFixed(2) : parseFloat(e.totalAmountPaid - e.totalAmountConsummed).toFixed(2)}*]`;
            textSharing += `\r\n`;
        }

        textSharing += `\r\n----------------\r\n\r\n`;
        textSharing += `${Services.LanguageService.string('ShareCosts.event_share_4')} \r\n\r\n`;
        for(var idx in event.people) {
            const e = event.people[idx];
            if(e.payTo != null) {
                for(var index in e.payTo) {
                    if(e.payTo[index] != null) {
                        textSharing += `>> _${e.name}_ ${Services.LanguageService.string('ShareCosts.pay_to')} _${e.payTo[index].name}_ ${Services.LanguageService.string('ShareCosts.total_of')} *${formatAmount(parseFloat(e.payTo[index].amount).toFixed(2))}*.\r\n`;
                    }
                }
            }
        }

        this.setState({
            textSharing,
            missingConcepts
        });

        return people;
    }

    getPeopleById = (id) => {
        return _.find(this.state.event.people, (i) => i.id == id);
    }

    render() {

        if(!this.state.event)
            return null;

        return (
            <SafeAreaView style={[styles.container, { backgroundColor : Utils.Color.Primary }]}>
                <View style={{ width: '100%', alignSelf: 'center', height: 'auto', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <TouchableOpacity
                        style={{ paddingTop: 0, paddingRight: 20, paddingBottom: 20, paddingLeft: 15 }}
                        onPress={() => {
                            this.props.navigation.pop();
                        }}>
                        <Text style={{ fontFamily: Utils.Font.Montserrat(600), fontSize: 16, color: '#fff' }}>{ Services.LanguageService.string('back') }</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    style={{ flex : 1 }}>
                    <Text style={{ width: '95%', alignSelf: 'center', backgroundColor: 'rgba(0,0,0,.1)', padding: 10, fontFamily: Utils.Font.Montserrat(600), color: 'rgba(255,255,255,.9)', textAlign: 'center', fontSize: Utils.UI.normalizeFont(15), borderRadius: 2, overflow: 'hidden', marginBottom: 5 }}>{ this.state.event.name }</Text>
                    { !this.state.showBreakdown && this.renderSummary() }
                    { false && this.state.showBreakdown && this.renderBreakdown() }
                </ScrollView>

                {/*<Button
                    text={'Ver desgloce'}
                    textStyle={{ color: 'white' }}
                    buttonStyle={{ width: '100%', backgroundColor: Utils.Color.ErrorRed, alignSelf: 'center', marginTop: 0, padding: 10, height: 60, borderWidth: 2, borderColor: 'rgba(255,255,255,.1)', borderRadius: 0 }}
                    icon={
                        <Icon
                            name={'arrowsalt'}
                            size={20}
                            style={{ marginRight: 10 }}
                            color={'white'}
                        />
                    }
                    onPress={() => {
                        this.setState({
                            showBreakdown : !this.state.showBreakdown
                        });
                    }}
                />*/}

                <View
                    style={{ width: '100%', backgroundColor: Utils.Color.Primary, justifyContent: 'center', alignItems: 'center', paddingVertical: 10 }}>
                    <Banner
                        size={"MINI_BANNER"}
                        style={{ top: 0, left: 0, backgroundColor: Utils.Color.Primary, marginBottom: 5 }}
                        unitId={Services.AdsService.getBannerIdentifier('share_costs')}
                        request={request.build()}
                    />
                </View>

                { !this.state.missingConcepts && this.state.textSharing != null &&
                    <Button
                        text={Services.LanguageService.string('ShareCosts.share_with_friends')}
                        textStyle={{ color: 'white' }}
                        buttonStyle={{ width: '100%', backgroundColor: Utils.Color.SuccessGreen, alignSelf: 'center', marginTop: 0, padding: 10, height: 60, borderWidth: 2, borderColor: 'rgba(255,255,255,.1)', borderRadius: 0 }}
                        icon={
                            <Icon
                                name={'sharealt'}
                                size={20}
                                style={{ marginRight: 10 }}
                                color={'white'}
                            />
                        }
                        onPress={() => {
                            Share.open({
                                message: this.state.textSharing,
                                title: 'Compartir gastos de ' + this.state.event.name
                            })
                            .then((res) => {})
                            .catch((err) => { err && console.log(err); });
                        }}
                    />
                }
            </SafeAreaView>
        );
    }

    renderSummary() {

        const {
            event,
            missingConcepts
        } = this.state;

        return (
            <View style={{ flex: 1 }}>
                { !missingConcepts && event.people.map((e) => {

                    const current = e; // Current item

                    let views = [];

                    if(e.payTo != null && e.payTo.length > 0) {
                        for(var idx in e.payTo) {
                            views.push(
                                <View style={{ marginVertical: 5, width: '95%', alignSelf: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                                    <Icon
                                        size={Utils.UI.normalizeFont(14)}
                                        color={Utils.Color.Secondary}
                                        name='star'
                                        style={{ marginTop: 0, flex: 0 }}
                                    />
                                    <Text style={{ flex: 1, marginLeft: 10, fontFamily: Utils.Font.Montserrat(600), color: 'rgba(255,255,255,1)', fontSize: Utils.UI.normalizeFont(12), textAlign: 'center' }}>
                                        { Services.LanguageService.string('ShareCosts.pay_to') } <Text style={{ color: Utils.Color.White, fontFamily: Utils.Font.Montserrat(800) }}>{ e.payTo[idx].name }</Text> { Services.LanguageService.string('ShareCosts.total_of') } <Text style={{ color: Utils.Color.Secondary, fontFamily: Utils.Font.Montserrat(800) }}>{ formatAmount(parseFloat(e.payTo[idx].amount)) }</Text>
                                    </Text>
                                </View>
                            );
                        }
                    }

                    if(views.length == 0) {
                        return null;
                    }

                    return (
                        <View style={{ width: '95%', backgroundColor: 'rgba(0,0,0,.2)', padding: 5, marginVertical: 2, alignSelf: 'center' }}>
                            <Text style={{ fontFamily: Utils.Font.Montserrat(600), color: 'rgba(255,255,255,.95)', fontSize: Utils.UI.normalizeFont(16), textAlign: 'center', marginVertical: 10 }}>{ e.name }</Text>
                            { views }
                        </View>
                    );
                })}

                { missingConcepts &&
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Image
                            source={require('app/src/assets/images/common/no_results.png')}
                            style={{ maxWidth: '70%', height: height / 4, alignSelf: 'center', resizeMode: 'contain' }}
                        />
                        <Text style={{ width: '90%', alignSelf: 'center', fontFamily: Utils.Font.Montserrat(400), color: Utils.Color.White, fontSize: Utils.UI.normalizeFont(16), textAlign: 'center' }}>Parece que no tenemos ninguna cuenta que sacar. Vuelve atrás y agrega gente y conceptos.</Text>
                    </View>
                }
            </View>
        );
    }

    renderBreakdown() {

        let totalPeople = this.state.people;
        let views = [];

        for(var idx in totalPeople) {
            const people = totalPeople[idx];
            let formattedTextLine1 = '';
            let formattedTextLine2 = '';

            if(people.consumableItems.map((e) => e.concept).length == 0)
                formattedTextLine1 += `${people.name} no consumió nada.`;
            else
                formattedTextLine1 += `${people.name} consumió [${people.consumableItems.map((e) => e.concept).join(', ')}]. `;

            formattedTextLine2 += `Pagar |${formatAmount(people.amountDue)}|`;
            if(people.amount != null && people.amount > 0) {
                formattedTextLine2 += ` pero ya pagó ${formatAmount(people.amount)}, así que `;
                if(parseFloat(people.amountDue) - parseFloat(people.amount) > 0) {
                    formattedTextLine2 += `*debe pagar ${formatAmount(parseFloat(people.amountDue) - parseFloat(people.amount))}*`;
                } else {
                    formattedTextLine2 += `*debe recibir ${formatAmount(parseFloat(people.amount) - parseFloat(people.amountDue))}*`;
                }
            }

            views.push(
                <View style={{ width: '100%', backgroundColor: 'rgba(0,0,0,.35)', padding: 10, marginVertical: 5 }}>
                    <ParsedText
                        style={{ fontFamily: Utils.Font.Montserrat(800), color: 'rgba(255,255,255,.8)', fontSize: 13, textAlign: 'center' }}>{ formattedTextLine1 }</ParsedText>
                    <ParsedText
                        parse={[
                            { pattern: boldPattern, style: styles.bold, renderText: renderBoldText },
                            { pattern: orangePattern, style: styles.orange, renderText: renderOrange },
                        ]}
                        style={{ fontFamily: Utils.Font.Montserrat(600), color: 'white', fontSize: 16, textAlign: 'center', marginTop: 5 }}>{ formattedTextLine2 }</ParsedText>
                </View>
            );
        }

        return views;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#877aaf'
    },
    sectionTitle: {
        flex: 0,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    sectionTitleText: {
        fontFamily: Utils.Font.Montserrat(600),
        fontSize: 30,
        color: 'white'
    },
    form: {
        flex: 0,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10
    },
    formInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10
    },
    label: {
        flex: 1,
        justifyContent: 'flex-start',
        fontFamily: Utils.Font.Montserrat(800),
        fontSize: 18,
        color: 'white'
    },
    valueContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        padding: 10,
        borderRadius: 5
    },
    textInput: {
        backgroundColor: 'white',
        width: '95%',
        alignSelf: 'center',
        fontFamily: Utils.Font.Montserrat(500),
        fontSize: 14,
        color: '#222',
        borderRadius: 2,
        marginVertical: 4
    },
    bold: {
        fontFamily: Utils.Font.Montserrat(800)
    },
    orange: {
        color: Utils.Color.White,
        fontFamily: Utils.Font.Montserrat(800)
    }
});