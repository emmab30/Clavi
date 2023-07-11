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

// Styles
import * as Utils from 'app/src/styles'

// Services
import { SetToken } from 'app/src/services/BaseService'
import * as Services from 'app/src/services'
import CurrencyService from 'app/src/services/CurrencyService'

const { width, height } = Dimensions.get('window');
const COLUMN_TABLE_WIDTH = width / 3.1;
const COLUMNS_TABLE_QTY = 3;

moment.locale(Services.LanguageService.getLocale());
moment.tz.setDefault(RNLocalize.getTimeZone());

export default class RowTransaction extends React.Component {

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

        let backgroundColor = transaction.transaction_type_id == 1 ? Utils.Color.Secondary : Utils.Color.PrimaryRed;
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
                style={{ width: '100%', alignSelf: 'center', flexDirection: 'row', padding: 0, alignItems: 'center', backgroundColor: backgroundColor, marginVertical: 0, paddingVertical: 5, paddingHorizontal: 10, marginBottom: 0 }}>
                <Text style={styles.transactionText}>{CurrencyService.formatCurrency(transaction.amount)}</Text>

                { transaction.categories == null || transaction.categories.length == 0 &&
                    <View style={{ width: COLUMN_TABLE_WIDTH, flexDirection: 'row', marginVertical: 10 }}>
                        <View style={{ backgroundColor: 'white', width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,.1)' }}></View>
                        <Text style={{ fontFamily: Utils.Font.Montserrat(400), fontSize: Utils.UI.normalizeFont(9), color: 'white', marginLeft: 3 }}>Sin categoría</Text>
                    </View>
                }

                { transaction.categories != null && transaction.categories.length > 0 &&
                    <View style={{ width: COLUMN_TABLE_WIDTH, flexDirection: 'row', marginVertical: 10 }}>
                        <View style={{ backgroundColor: transaction.categories[0].color_hex, width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,.1)' }}></View>
                        <Text style={{ fontFamily: Utils.Font.Montserrat(400), fontSize: Utils.UI.normalizeFont(9), color: 'white', marginLeft: 5 }}>{ transaction.categories[0].name }</Text>
                    </View>
                }

                { showReminderIn ?
                    <View style={{ width: COLUMN_TABLE_WIDTH, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 10 }}>
                        <Icon
                            name={'clock'}
                            size={20}
                            color={Utils.Color.White}
                        />
                        <Text style={{ fontFamily: Utils.Font.Montserrat(400), fontSize: Utils.UI.normalizeFont(9), color: 'white', marginLeft: 2, textAlign: 'center' }}>
                            { nextReminderAt.fromNow() }
                        </Text>
                    </View>
                :
                    <View style={{ width: COLUMN_TABLE_WIDTH, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginVertical: 10, paddingRight: 15 }}>
                        <Text style={{ fontFamily: Utils.Font.Montserrat(400), fontSize: Utils.UI.normalizeFont(9), color: 'white', marginLeft: 2 }}>{ moment.utc(transaction.created_at).fromNow() }</Text>
                    </View>
                }
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    transactionText: {
        width: COLUMN_TABLE_WIDTH,
        fontFamily: Utils.Font.Montserrat(800),
        color: 'white',
        textAlign: 'left',
        fontSize: Utils.UI.normalizeFont(11)
    }
});