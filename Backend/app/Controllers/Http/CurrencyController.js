'use strict'

const Currency = use('App/Models/Currency');

class CurrencyController {

    async getCurrencies({ request, response }) {

        /*let currencies = require('../../../public/currencies.json');*/

        let currencies = await Currency
            .query()
            .fetch();

        return response.json({
            success: true,
            currencies: currencies
        });
    }
}

module.exports = CurrencyController