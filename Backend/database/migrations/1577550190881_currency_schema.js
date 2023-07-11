'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Currency = use('App/Models/Currency')

class CurrenciesSchema extends Schema {
  up () {
    this.create('currencies', (table) => {
      table.increments()
      table.string('name').collate('utf8_general_ci');
      table.string('symbol').collate('utf8_general_ci');
      table.string('symbol_native').collate('utf8_general_ci');
      table.string('code').collate('utf8_general_ci');
    });

    setTimeout(() => {
        console.log("Creating currencies");
        let currencies = require('../../public/currencies.json')
        let promises = [];

        for(var idx in currencies) {
            const currency = currencies[idx];
            promises.push(Currency.create({
                name: currency.name,
                symbol: currency.symbol,
                symbol_native: currency.symbol_native,
                code: currency.code
            }));
        }

        Promise.all(promises).then((values) => {
            console.log("[OK] Migrated all currencies: ", values.length);
        });
    }, 2000);
  }

  down () {
    this.drop('currencies')
  }
}

module.exports = CurrenciesSchema
