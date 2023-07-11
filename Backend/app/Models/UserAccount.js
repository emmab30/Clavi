'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class UserAccount extends Model {
    static get table () {
        return 'user_account'
    }

    currency() {
        return this.belongsTo('App/Models/Currency');
    }

    user() {
        return this.belongsTo('App/Models/User');
    }
}

module.exports = UserAccount