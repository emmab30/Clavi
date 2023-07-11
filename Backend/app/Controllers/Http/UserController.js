'use strict'

const Transaction = use('App/Models/Transaction');
const Notification = use('App/Models/Notification');
const User = use('App/Models/User');
const UserAccount = use('App/Models/UserAccount');
const _ = require('lodash');

class UserController {

    async updateUserMetadata({ request, auth, response }) {
        let user = await auth.getUser();
        let data = request.all();

        if(data.timezone != null){
            user.timezone = data.timezone;

            if(user.country_name == null || user.country_name.length == 0) {
                // If country is null and timezone is not null, try to lookup country by provided timezone
                let cityTimezones = require('../../../resources/json/city-timezones.json');
                let country = _.find(cityTimezones, (e) => { return e.timezone == data.timezone; });

                if(country != null){
                    user.country_name = country.country;
                    user.country_code = country.iso2;
                }
            }
        }
        if(data.appVersion != null)
            user.app_version = data.appVersion;
        if(data.platform)
            user.platform = data.platform;
        if(data.language)
            user.language = data.language;
        user.last_login = new Date();

        await user.save();

        return response.json({
            success: true
        });
    }

    async getMe({ request, auth, response }) {
        let user = await auth.getUser();
        user = await User
            .query()
            .with('active_account.currency')
            .with('accounts.currency')
            .with('currency')
            .where('id', user.id)
            .first()

        let transactions = Transaction
            .query()
            .whereNull('shared_account_id')
            .select(['amount', 'transaction_type_id'])
            .whereNotIn('status', ['pending_paid'])
            .where('user_account_id', user.active_account_id)
            .orderBy('created_at', 'desc');

        let unreadNotifications = await Notification
            .query()
            .where('user_id', user.id)
            .where('is_read', false)
            .getCount('id');
        unreadNotifications = unreadNotifications > 0;

        transactions = await transactions.fetch();
        transactions = transactions.toJSON();

        let outcomes = 0;
        let incomes = 0;

        for(var idx in transactions) {
            if(transactions[idx]) {
                let transaction = transactions[idx];
                if(transaction) {
                    if(transaction.transaction_type_id == 1) {
                        incomes += parseFloat(transaction.amount);
                    } else {
                        outcomes += parseFloat(transaction.amount);
                    }
                }
            }
        }

        return response.json({
            success: true,
            user: {
                ...user.toJSON(),
                keywords_ads: [
                    'moda', 'dinero', 'sorteos', 'instagram', 'dolares', 'mujer', 'hombre', 'comida', 'sorteo'
                ]
            },
            unreadNotifications: unreadNotifications,
            balance: {
                incomes,
                outcomes,
                balance: parseFloat(incomes - outcomes)
            }
        });
    }

    async getMyAccounts({ request, auth, response }) {
        let user = await auth.getUser();
        let accounts = await UserAccount
            .query()
            .with('currency')
            .where('user_id', user.id)
            .fetch();

        return response.json({
            success: true,
            accounts
        });
    }

    async createAccount({ request, auth, response }) {
        let user = await auth.getUser();

        let hasAccount = await UserAccount
            .query()
            .where('user_id', user.id)
            .where('currency_id', request.body.currency_id)
            .getCount('id');
        hasAccount = hasAccount != null && hasAccount > 0;

        if(!hasAccount) {
            let userAccount = await UserAccount.create({
                user_id: user.id,
                currency_id: request.body.currency_id
            });

            return response.json({
                success: true,
                account: userAccount
            });
        }

        return response.json({
            success: true
        });
    }

    async updateUser({ request, auth, response }) {
        const user = await auth.getUser()
        user.merge(request.body)

        await user.save()

        return response.json({
            success: true,
            user
        });
    }

    async searchByPattern({ request, auth, response }) {
        const pattern = request.all().pattern;
        const user = await auth.getUser();
        let users = await User
            .query()
            .where('username', 'LIKE', `%${pattern}%`)
            .whereNot('id', user.id)
            .select(['id', 'name', 'username'])
            .fetch();
        users = users.toJSON();

        if(users.length > 0) {

            for(var idx in users) {
                let name = users[idx].name;
                let secureName = '';
                if(name != null) {
                    secureName = name.substring(0, 2);
                    let secureTextSpaces = name.split(' ').length;
                    let secureTextLength = name.length - secureTextSpaces;
                    for(var i=2; i < name.length - 2; i++) {
                        if(name[i] != ' ') {
                            secureName += '●';
                        } else {
                            secureName += ' ';
                        }
                    }
                    secureName += name.substring(name.length - 2, name.length);
                }
                users[idx].name = secureName;
            }

            return response.json({
                success: true,
                users: users
            });
        }

        return response.json({
            success: false,
            message: 'No encontramos ningún usuario con esa búsqueda'
        });
    }
}

module.exports = UserController
