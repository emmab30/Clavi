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

export default class RowTransactionSharedAccount extends React.Component {

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
            onPress
        } = this.props;

        let backgroundColor = transaction.transaction_type_id == 1 ? Utils.Color.Secondary : Utils.Color.PrimaryRed;

        return (
            <TouchableOpacity
                activeOpacity={.9}
                onPress={() => {
                    if(onPress)
                        onPress();
                }}
                style={{ width: '100%', alignSelf: 'center', flexDirection: 'row', padding: 0, alignItems: 'center', backgroundColor: backgroundColor, marginVertical: 0, paddingVertical: 5, paddingHorizontal: 10, marginBottom: 0 }}>
                <Text style={styles.transactionText}>{CurrencyService.formatCurrency(transaction.amount)}</Text>

                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginVertical: 10, paddingRight: 15 }}>
                    <Text style={{ fontFamily: Utils.Font.Montserrat(400), fontSize: Utils.UI.normalizeFont(9), color: 'white', marginLeft: 2, textAlign: 'center', flex: 1 }}>{ transaction.user_account.user.name }</Text>
                </View>

                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginVertical: 10, paddingRight: 0 }}>
                    <Text style={{ fontFamily: Utils.Font.Montserrat(400), fontSize: Utils.UI.normalizeFont(9), color: 'white', marginLeft: 2 }}>{ moment.utc(transaction.created_at).fromNow() }</Text>
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    transactionText: {
        flex: 1,
        /* width: COLUMN_TABLE_WIDTH, */
        fontFamily: Utils.Font.Montserrat(800),
        color: 'white',
        textAlign: 'left',
        fontSize: Utils.UI.normalizeFont(11)
    }
});