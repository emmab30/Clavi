'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Event extends Model {
    static get table () {
        return 'events'
    }

    people() {
        return this.hasMany('App/Models/EventPeople', 'id');
    }

    /*people() {
        return this.belongsTo('App/Models/TransactionType', 'transaction_type_id')
    }

    items() {
        return this
            .belongsToMany('App/Models/TransactionCategory')
            .pivotTable('transaction_x_categories')
    }*/
}

module.exports = Event
