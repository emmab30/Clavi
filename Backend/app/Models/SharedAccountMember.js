'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class SharedAccountMember extends Model {
    static get table () {
        return 'shared_account_members'
    }

    shared_account() {
      return this.belongsTo('App/Models/SharedAccount', 'shared_account_id');
    }

    user() {
      return this.hasOne('App/Models/User', 'user_id', 'id');
    }
}

module.exports = SharedAccountMember