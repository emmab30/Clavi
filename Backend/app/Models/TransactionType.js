'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class TransactionType extends Model {
    static get table () {
        return 'transaction_types'
    }
}

module.exports = TransactionType
