import { ApiService } from './BaseService.js';
import UserService from './UserService'
import { AsyncStorage } from 'react-native';
import _ from 'lodash';
import 'intl';
import 'intl/locale-data/jsonp/en'; // or any other locale you need

var CurrencyService = {
    currencies: null,
    getById: (id) => _.find(CurrencyService.currencies, (i) => i.id == id),
    getCurrencies: function(success, error) {
        ApiService().get(`currencies`)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    getPreferredCurrencySymbol: function() {
        // Get the user
        if(UserService.user && UserService.user.active_account && UserService.user.active_account.currency && UserService.user.active_account.currency.name) {
            return `${UserService.user.active_account.currency.symbol}`
        }
        /*if(UserService.user != null) {
            if(UserService.user.currency) {
                return `${UserService.user.currency.symbol}`
            }
        }*/

        return '$';
    },
    formatCurrency: function(amount, currencyId = null) {
        // Get the user
        amount = parseFloat(amount);

        if(amount && !isNaN(amount)){
            amount = amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        }

        if(currencyId == null) {
            if(UserService.user && UserService.user.active_account && UserService.user.active_account.currency && UserService.user.active_account.currency.name) {
                return `${UserService.user.active_account.currency.symbol} ${amount}`
            }
        } else {
            return `${CurrencyService.getById(currencyId).symbol} ${amount}`
        }

        return '$' + amount;
    },
    formatAmount: (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
};

export default CurrencyService;