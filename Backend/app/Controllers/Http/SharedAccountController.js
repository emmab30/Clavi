'use strict'

const User = use('App/Models/User');
const UserAccount = use('App/Models/UserAccount');
const Transaction = use('App/Models/Transaction');
const SharedAccount = use('App/Models/SharedAccount');
const SharedAccountMember = use('App/Models/SharedAccountMember');
const TransactionReminder = use('App/Models/TransactionReminder');
const TransactionCategory = use('App/Models/TransactionCategory');
const Database = use('Database');
const moment = require('moment');
const _ = require('lodash');

class SharedAccountController {
    async getSharedAccounts({ request, auth, response }) {
        let user = await auth.getUser();

        let sharedAccounts = await SharedAccount
            .query()
            .with('members')
            .orderBy('created_at', 'DESC')
            .whereHas('members', i => {
              i.where('user_id', user.id);
            })
            .fetch();

        // Avoid to show sensitive data on shared accounts
        // To Improve
        sharedAccounts = _.map(sharedAccounts.toJSON(), i => {
            if(i && i.members) {
                i.members = _.map(i.members, m => {
                    m = {
                        id: m.id,
                        name: m.name
                    };

                    return m;
                });
            }

            return i;
        });

        return response.json({
            success: true,
            shared_accounts: sharedAccounts
        });
    }

    async getSharedAccountById({ request, auth, response }) {
        let user = await auth.getUser();

        const sharedAccount = await SharedAccount
            .query()
            .with('members')
            .where('id', request.params.id)
            .first();

        const balance = {
          incomes: 0,
          outcomes: 0,
          percentageIncomes: 0,
          percentageOutcomes: 0,
          total: 0
        };

        const incomes = await Transaction
          .query()
          .where('shared_account_id', sharedAccount.id)
          .where('transaction_type_id', 1)
          .select(Database.raw('sum(amount) as incomes'))
          .first();
        balance['incomes'] = _.defaultTo(incomes.toJSON().incomes, 0);

        const outcomes = await Transaction
          .query()
          .where('shared_account_id', sharedAccount.id)
          .where('transaction_type_id', 2)
          .select(Database.raw('sum(amount) as outcomes'))
          .first();
        balance['outcomes'] = _.defaultTo(outcomes.toJSON().outcomes, 0);

        // Percentage
        const total = (balance['incomes'] + balance['outcomes']);
        balance['percentageIncomes'] = _.defaultTo(balance['incomes'] * 100 / total, 0);
        balance['percentageOutcomes'] = _.defaultTo(balance['outcomes'] * 100 / total, 0);
        balance['total'] = parseFloat(balance['incomes']) + parseFloat(balance['outcomes']);
        balance['final_balance'] = parseFloat(balance['incomes']) - parseFloat(balance['outcomes']);

        sharedAccount.balance = balance;

        return response.json({
            success: true,
            shared_account: sharedAccount
        });
    }

    async postSharedAccount({ request, auth, response }) {
        let user = await auth.getUser();

        const sharedAccount = await SharedAccount.create({
            user_id: user.id,
            name: request.input('name')
        });

        await SharedAccountMember.create({
            shared_account_id: sharedAccount.id,
            user_id: user.id
        });

        return response.json({
            success: true,
            shared_account: sharedAccount
        });
    }

    async deleteSharedAccount({ request, auth, response }) {
        let user = await auth.getUser();

        await SharedAccount
          .query()
          .where('id', request.params.id)
          .delete();

        await SharedAccountMember
          .query()
          .where('shared_account_id', request.params.id)
          .delete();

        await Transaction
          .query()
          .where('shared_account_id', request.params.id)
          .delete();

        return response.json({
            success: true
        });
    }

    async addMember({ request, notifications, auth, response }) {
        let user = await auth.getUser();

        let memberExists = await SharedAccountMember
          .query()
          .where('user_id', request.input('user_id'))
          .where('shared_account_id', request.params.id)
          .getCount();
        memberExists = memberExists > 0;

        if(memberExists) {
          return response.json({
            success: false,
            message: 'Ese miembro ya existe en la cuenta compartida'
          });
        }

        await SharedAccountMember
          .create({
            user_id: request.input('user_id'),
            shared_account_id: request.params.id
          });

        let userTo = await User
          .query()
          .where('id', request.input('user_id'))
          .first();

        if(userTo != null) {
          // Notify another user
          await notifications.sendNotification(userTo.id, 'Cuenta compartida', `${user.name} te agregó a una cuenta compartida.`, {
            route: 'DetailsSharedAccount',
            params: {
              id: sharedAccount.id
            }
          });
          notifications.generate(userTo.id, 'Cuenta compartida', `*${user.name}* te agregó a una cuenta compartida. Vé al inicio para verla.`, {
            route: 'DetailsSharedAccount',
            payload: {
              id: sharedAccount.id
            }
          });
        }

        return response.json({
            success: true
        });
    }

    async kickMember({ request, notifications, auth, response }) {
        let user = await auth.getUser();

        const isKickingMyself = request.params.user_id == 'me';
        let kickedUser = null;
        if(isKickingMyself) {
            request.params.user_id = user.id;
            kickedUser = user;
        } else {
            kickedUser = await User.findBy('id', request.params.user_id);
        }

        // Notify to everyone
        let sharedAccount = await SharedAccount
          .query()
          .where('id', request.params.id)
          .with('members')
          .first();

        if(sharedAccount) {
            sharedAccount = sharedAccount.toJSON();
            for(let member of sharedAccount.members) {
              if(member.id == user.id)
                continue;

                if(isKickingMyself) {
                    // Notify another user
                    await notifications.sendNotification(member.id, `${user.name} salió de la cuenta compartida`, `${user.name} abandonó la cuenta compartida ${sharedAccount.name}.`);
                    notifications.generate(member.id, `${user.name} salió de la cuenta compartida`, `${user.name} abandonó la cuenta compartida *${sharedAccount.name}*`);
                } else {
                    // Notify another user
                    await notifications.sendNotification(member.id, `${user.name} quitó a ${kickedUser.name}`, `${user.name} quitó a ${kickedUser.name} de la cuenta compartida ${sharedAccount.name}.`);
                    notifications.generate(member.id, `${user.name} quitó a ${kickedUser.name}`, `${user.name} quitó a ${kickedUser.name} de la cuenta compartida ${sharedAccount.name}.`);
                }
            }
        }

        await SharedAccountMember
          .query()
          .where('user_id', request.params.user_id)
          .where('shared_account_id', request.params.id)
          .delete();

        return response.json({
            success: true
        });
    }
}

module.exports = SharedAccountController