'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Transaction extends Model {

    static boot() {
        super.boot();

        this.addTrait('@provider:Lucid/SoftDeletes')
    }

    static get table () {
        return 'transactions'
    }

    currency() {
        return this.hasOne('App/Models/Currency')
    }

    type() {
        return this.belongsTo('App/Models/TransactionType', 'transaction_type_id')
    }

    categories() {
        return this
            .belongsToMany('App/Models/TransactionCategory')
            .pivotTable('transaction_x_categories')
    }

    reminders() {
        return this
            .hasMany('App/Models/TransactionReminder');
    }

    user_account() {
        return this.belongsTo('App/Models/UserAccount');
    }

    static get deleteTimestamp () {
        return 'deleted_at'
    }

    /*static formatDates(field, value) {
        return new Date(value).toISOString();
    }*/
}

module.exports = Transaction
