import React from 'react';
import {
    Component,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    AsyncStorage,
    Dimensions
} from 'react-native';

// Modules
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import * as RNLocalize from "react-native-localize";
import moment from 'moment-timezone/builds/moment-timezone-with-data';
import 'moment/locale/es'
moment.locale('es');
moment.tz.setDefault(RNLocalize.getTimeZone());

// Styles
import * as Utils from 'app/src/styles'

// Services
import { SetToken } from 'app/src/services/BaseService'
import CurrencyService from 'app/src/services/CurrencyService'

const { width, height } = Dimensions.get('window');
const COLUMN_TABLE_WIDTH = width / 3;
const COLUMNS_TABLE_QTY = 3;

export default class RowTransactionOwe extends React.Component {

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

        let {
            transaction,
            onPress,
            showReminderIn
        } = this.props;

        let backgroundColor = transaction.transaction_type_id == 1 ? Utils.Color.SuccessGreen : Utils.Color.ErrorRed;
        let nextReminderAt = null;

        // Check if it's notifiable
        if(showReminderIn) {
            if(transaction.reminders == null || transaction.reminders.length == 0) {
                showReminderIn = false;
            } else {
                nextReminderAt = moment.utc(transaction.reminders[0].datetime);
            }
        }

        return (
            <TouchableOpacity
                activeOpacity={.9}
                onPress={() => {
                    if(onPress)
                        onPress();
                }}
                style={{ width: '100%', flexDirection: 'row', padding: 0, alignItems: 'center', backgroundColor: backgroundColor, marginVertical: 0 }}>
                <Text style={styles.transactionText}>{CurrencyService.formatCurrency(transaction.amount)}</Text>

                <View style={{ width: COLUMN_TABLE_WIDTH, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 10 }}>
                    <Text style={{ fontFamily: Utils.Font.Montserrat(500), fontSize: Utils.UI.normalizeFont(10), color: 'white', marginLeft: 3 }}>{ transaction.owe_to_alias }</Text>
                </View>

                { showReminderIn ?
                    <View style={{ width: COLUMN_TABLE_WIDTH, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 10 }}>
                        <Icon
                            name={'clock'}
                            size={20}
                            color={Utils.Color.White}
                        />
                        <Text style={{ fontFamily: Utils.Font.Montserrat(500), fontSize: Utils.UI.normalizeFont(10), color: 'white', marginLeft: 2, textAlign: 'center' }}>
                            { nextReminderAt.fromNow() }
                        </Text>
                    </View>
                :
                    <View style={{ width: COLUMN_TABLE_WIDTH, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 10 }}>
                        <Text style={{ fontFamily: Utils.Font.Montserrat(500), fontSize: Utils.UI.normalizeFont(10), color: 'white', marginLeft: 2 }}>{ moment.utc(transaction.updated_at).fromNow() }</Text>
                    </View>
                }
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    transactionText: {
        width: COLUMN_TABLE_WIDTH,
        fontFamily: Utils.Font.Montserrat(600),
        color: 'white',
        textAlign: 'center',
        padding: 10,
        fontSize: Utils.UI.normalizeFont(12)
    }
});