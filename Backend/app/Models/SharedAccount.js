'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class SharedAccount extends Model {
    static get table () {
        return 'shared_accounts'
    }

    members() {
      return this.manyThrough('App/Models/SharedAccountMember', 'user');
    }
}

module.exports = SharedAccount