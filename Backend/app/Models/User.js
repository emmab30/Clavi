'use strict';

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash');

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class User extends Model {
    static boot() {
        super.boot();

        this.addHook('beforeSave', async userInstance => {
            if (userInstance.dirty.password) {
                userInstance.password = await Hash.make(userInstance.password);
            }
        });

        this.addHook('afterCreate', 'UserHook.onCreated');
    }

    active_account() {
        return this.belongsTo('App/Models/UserAccount', 'active_account_id', 'id');
    }

    accounts() {
        return this.hasOne('App/Models/UserAccount')
    }

    currency() {
        return this.belongsTo('App/Models/Currency');
    }

    tokens() {
        return this.hasMany('App/Models/Token');
    }
}

module.exports = User;