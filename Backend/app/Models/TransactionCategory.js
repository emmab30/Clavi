'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class TransactionCategory extends Model {
    static get table () {
        return 'transaction_category'
    }
}

module.exports = TransactionCategory