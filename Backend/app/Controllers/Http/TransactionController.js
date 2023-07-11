'use strict'

const User = use('App/Models/User');
const UserAccount = use('App/Models/UserAccount');
const SharedAccount = use('App/Models/SharedAccount');
const SharedAccountMember = use('App/Models/SharedAccountMember');
const Transaction = use('App/Models/Transaction');
const TransactionReminder = use('App/Models/TransactionReminder');
const TransactionCategory = use('App/Models/TransactionCategory');
const Database = use('Database');
const moment = require('moment');
const _ = require('lodash');

class TransactionController {

    async getTransactionsByUser({ request, notifications, response }) {
        let userId = request.params.id;
        let user = await User.find(userId);
        let transactions = Transaction
            .query()
            .where('user_account_id', user.active_account_id)
            .whereNull('shared_account_id')
            .whereNotIn('status', ['pending_paid'])
            .with('type', function(query) {
                query.select(['id', 'name'])
            })
            .with('categories')
            .orderBy('created_at', 'desc');

        if(request.body.place == 'feed') {
            transactions = transactions.limit(10);
        }

        transactions = await transactions.fetch();
        let transactionsJSON = transactions.toJSON();
        let chartData = null;

        if(request.body.place != 'feed' && request.body.filters){
            if(request.body.filters.transaction_type_id){
                transactionsJSON = _.filter(transactionsJSON, (e) => e.transaction_type_id == request.body.filters.transaction_type_id);
                // transactions.where('transaction_type_id', request.body.filters.transaction_type_id);
            }

            if(request.body.filters.categories != null && request.body.filters.categories.length > 0) {
                transactionsJSON = _.filter(transactionsJSON, (e) => _.some(e.categories, (i) => request.body.filters.categories.indexOf(i.id) > -1));
            }

            // By dates
            if(request.body.filters.date_from && request.body.filters.date_to) {
                let dateTo = moment(request.body.filters.date_to);
                dateTo.set({ hour: 23, minute: 59 });
                let dateFrom = moment(request.body.filters.date_from);
                dateFrom.set({ hour: 0, minute: 1 });

                transactionsJSON = _.filter(transactionsJSON, (e) => {
                    return moment(e.created_at) >= dateFrom
                        && moment(e.created_at) <= dateTo;
                });
            }
        }

        let outcomes = 0;
        let incomes = 0;

        for(var idx in transactionsJSON) {
            if(transactionsJSON[idx]) {
                let transaction = transactionsJSON[idx];
                if(transaction) {
                    transaction.can_delete = true;
                    transaction.can_edit = true;
                    transaction.status_string = ("Pagado a " + transaction.owe_to_alias);
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
            transactions: transactionsJSON,
            chartData: chartData,
            balance: {
                incomes: incomes,
                outcomes: outcomes,
                balance: (parseFloat(incomes) - parseFloat(outcomes))
            }
        });
    }

    async getSharedAccountTransactionsById({ request, auth, response }) {
      let user = await auth.getUser();

      let transactions = await Transaction
        .query()
        .where('shared_account_id', request.params.id)
        .with('user_account.user', i => {
          i.select(['id', 'name'])
        })
        .orderBy('created_at', 'DESC')
        .fetch();

      return response.json({
        success: true,
        transactions: transactions
      });
    }

    async getSharedTransactions({ request, auth, response }) {
        let user = await auth.getUser();
        let oweTo = await Transaction
            .query()
            .where('user_account_id', user.active_account_id)
            .where('status', 'pending_paid')
            .with('categories')
            .with('reminders', (builder) => {
                builder.orderBy('datetime', 'ASC')
            })
            .orderBy('id', 'desc')
            .fetch();

        oweTo = oweTo.toJSON();
        for(var idx in oweTo) {
            oweTo[idx].status_string = `Debo a ${oweTo[idx].owe_to_alias}`;
            oweTo[idx].can_delete = true;
            oweTo[idx].can_mark_as_paid = true;
            oweTo[idx].can_edit = true;
        }

        let oweMe = await Transaction
            .query()
            .where('owe_to_id', user.id)
            .where('status', 'pending_paid')
            .with('categories')
            .with('reminders', (builder) => {
                builder.orderBy('datetime', 'ASC')
            })
            .orderBy('id', 'desc')
            .fetch();

        oweMe = oweMe.toJSON();
        for(var idx in oweMe) {
            const transaction = oweMe[idx];
            let userAccount = await UserAccount
                .query()
                .where('id', transaction.user_account_id)
                .with('user')
                .first();

            userAccount = userAccount.toJSON();
            oweMe[idx].owe_to_alias = userAccount.user.username;
            oweMe[idx].status_string = `Me debe ${userAccount.user.username}`;
            oweMe[idx].can_delete = true;
            oweMe[idx].can_mark_as_paid = true;
            oweMe[idx].can_edit = false;
        }

        return response.json({
            success: true,
            oweTo: oweTo,
            oweMe: oweMe
        });
    }

    async createTransaction({ request, auth, notifications, response }) {
        let data = _.clone(request.body);
        let user = await auth.getUser();

        // Validate data
        if(!data.amount) {
            return response.json({ success: false, message: 'Verifica que el monto sea válido' });
        } else if(data.is_owe == true && (data.owe_to_alias == null || data.owe_to_alias.length == 0)) {
            return response.json({ success: false, message: 'Coloca un nombre o un usuario para continuar' });
        }
        /*else if(!data.description) {
            return response.json({ success: false, message: 'Agregá al menos una palabra clave' });
        }*/

        // Remove information not useful from request.body
        let reminders = data.reminders;
        delete data.can_delete;
        delete data.can_edit;
        delete data.can_mark_as_paid;
        delete data.status_string;
        delete data.reminders;
        delete data.categories;
        delete data.type;

        let transaction = new Transaction;
        if(request.body.id) {
            transaction = await Transaction
                .query()
                .where('id', request.body.id)
                .with('user_account.user')
                .first();
        }

        transaction.merge(data);
        transaction.amount = transaction.amount.replace(',', '').replace('.', '');
        transaction.user_account_id = user.active_account_id;
        transaction.status = 'created';

        if(request.body.is_owe == 1 && request.body.status == 'paid') {
            // Then the shared transaction is now paid. We need to notify later to both users about this
            transaction.status = 'paid';

            // Handle this, then remove the current transaction and notify both users
            let owner = transaction.toJSON().user_account.user;
            let ownerId = owner.id;
            let oweTo = null;
            if(request.body.owe_to_id)
                oweTo = await User.find(request.body.owe_to_id);
            let oweToId = oweTo != null ? oweTo.id : -1;

            // Notify the owner from this transaction
            /*await notifications.sendNotification(ownerId, '¡Una deuda menos!', `Le pagaste $${transaction.amount.toFixed(2)} a ${transaction.owe_to_alias} por ${transaction.description}`);*/
            notifications.generate(ownerId, '¡Una deuda menos!', `Le pagaste *$${transaction.amount.toFixed(2)}* a *${transaction.owe_to_alias}* por *${transaction.description}*`);

            if(oweToId > -1) {
                // Notify another user
                await notifications.sendNotification(oweToId, '¡Ya no te deben!', `${owner.username} te pagó $${transaction.amount.toFixed(2)} por ${transaction.description}`);
                notifications.generate(oweToId, '¡Ya no te deben!', `*${owner.username}* te pagó *${transaction.amount.toFixed(2)}* por *${transaction.description}*`);
            }

            // Remove the transaction
            await transaction.delete();
            transaction = null;

        } else if(request.body.is_owe == 1 && request.body.status != 'paid') {
            transaction.status = 'pending_paid';

            await transaction.save();
            transaction = await Transaction
                .query()
                .where('id', transaction.id)
                .with('user_account.user')
                .first();

            // Don't notify if the user is editing the transaction
            if(!request.body.id) {
                // Handle this, then remove the current transaction and notify both users
                let owner = transaction.toJSON().user_account.user;
                let ownerId = owner.id;
                let oweTo = null;
                if(request.body.owe_to_id)
                    oweTo = await User.find(request.body.owe_to_id);
                let oweToId = oweTo != null ? oweTo.id : -1;

                // Notify the owner from this transaction
                /* await notifications.sendNotification(ownerId, 'Debes dinero', `Le debes a ${oweTo.username} un monto de $${transaction.amount.toFixed(2)} por ${transaction.description}`); */
                notifications.generate(ownerId, 'Debes dinero', `Le debes a *${transaction.owe_to_alias}* un monto de *$${transaction.amount.toFixed(2)}* por *${transaction.description}*`);

                if(oweToId > -1) {
                    // Notify another user
                    await notifications.sendNotification(oweToId, 'Te deben dinero', `${owner.username} te debe un monto de $${transaction.amount.toFixed(2)} por ${transaction.description}`);
                    notifications.generate(oweToId, 'Te deben dinero', `*${owner.username}* te debe un monto de *$${transaction.amount.toFixed(2)}* por *${transaction.description}*`);
                }
            }
        } else if(!request.body.is_owe || request.body.is_owe == 0 && request.body.status != 'paid') {
            transaction.status = 'created';
            await transaction.save();
        }

        if(transaction != null) {

            let reminderIds = await TransactionReminder
                .query()
                .where('transaction_id', transaction.id)
                .select(['id', 'onesignal_id'])
                .fetch();
            reminderIds = reminderIds.toJSON();

            const toDelete = _.difference(_.map(reminderIds, (i) => i.id), _.map(reminders, (i) => i.id));
            if(toDelete != null && toDelete.length > 0){

                for(var idx in toDelete) {
                    const reminder = toDelete[idx];
                    if(reminder){
                        let obj = _.find(reminderIds, (i) => i.id == reminder);
                        if(obj && obj.onesignal_id)
                            notifications.cancelNotification(obj.onesignal_id);
                    }
                }

                await TransactionReminder
                    .query()
                    .whereIn('id', toDelete)
                    .delete();
            }

            for(var idx in reminders) {

                if(reminders[idx].id != null) {
                    // Update if it exists
                    await TransactionReminder
                        .query()
                        .where('id', reminders[idx].id)
                        .update({
                            datetime: moment(reminders[idx].datetime).format('YYYY-MM-DD HH:mm:ss')
                        });
                } else {
                    let notificationId = await notifications.scheduleNotification(user.id, moment(reminders[idx].datetime), 'Esto es un recordatorio', `Le debes a ${transaction.owe_to_alias} un monto de $${transaction.amount} ${transaction.description != null ? '(' + transaction.description + ')' : null}`);
                    notifications.generate(user.id, 'Te recordaremos', `Configuraste un recordatorio. Te recordaremos el día ${moment(reminders[idx].datetime).format('DD/MM')} a las ${moment(reminders[idx].datetime).format('HH:mm')}`);
                    if(notificationId != null) {
                        await TransactionReminder.create({
                            transaction_id: transaction.id,
                            datetime: moment(reminders[idx].datetime).format('YYYY-MM-DD HH:mm:ss'),
                            onesignal_id: notificationId
                        });
                    }
                }
            }
        }

        if(transaction && transaction.id && request.body.categories != null && request.body.categories.length > 0) {
            let ids = request.body.categories.map((e) => e.id);
            transaction = await Transaction.findBy('id', transaction.id);

            // Check if it's the same category
            let idCurrentCategory = await Database.table('transaction_x_categories')
                .where('transaction_id', transaction.id)
                .select(['transaction_category_id'])
                .first();

            if(!idCurrentCategory || idCurrentCategory.transaction_category_id != ids[0]) {
                await Database.table('transaction_x_categories')
                    .where('transaction_id', transaction.id)
                    .delete();

                await Database.table('transaction_x_categories').insert({
                    transaction_category_id: ids[0],
                    transaction_id: transaction.id
                });
            }
        }

        // If it's for a shared account, notify to all members from that shared account
        if(transaction.shared_account_id != null) {
          let sharedAccount = await SharedAccount
            .query()
            .where('id', transaction.shared_account_id)
            .with('members')
            .first();

          if(sharedAccount) {
            sharedAccount = sharedAccount.toJSON();
            for(let member of sharedAccount.members) {
              if(member.id == user.id)
                continue;

              // Notify another user

              const transactionType = transaction.transaction_type_id == 1 ? 'ingreso' : 'gasto';
              await notifications.sendNotification(member.id, 'Cambios en cuenta compartida', `${user.name} creó un ${transactionType} de ${formatAmount(transaction.amount)} en la cuenta compartida ${sharedAccount.name}.`, {
                route: 'DetailsSharedAccount',
                params: {
                  id: sharedAccount.id
                }
              });
              notifications.generate(member.id, `Cambios en cuenta compartida`, `*${user.name}* creó un ${transactionType} de ${formatAmount(transaction.amount)} en la cuenta compartida ${sharedAccount.name}.`, {
                route: 'DetailsSharedAccount',
                payload: {
                  id: sharedAccount.id
                }
              });
            }
          }
        }

        return response.json({
            success: true,
            show_ads_video: (Math.floor(Math.random() * 100) + 1) > 70
        });
    }

    async removeById({ request, auth, notifications, response }) {
        let user = await auth.getUser();
        let transaction = await Transaction
            .query()
            .where('id', request.params.id)
            .with('user_account.user')
            .first();

        if(transaction != null) {
            // Check if it's a shared transaction
            if(transaction.is_owe == true && transaction.owe_to_id != null) {
                // Handle this, then remove the current transaction and notify both users
                let owner = transaction.toJSON().user_account.user;
                let ownerId = owner.id;
                let oweTo = await User.find(transaction.owe_to_id);
                let oweToId = oweTo != null ? oweTo.id : -1;

                // Notify the owner from this transaction
                /* await notifications.sendNotification(ownerId, 'Eliminaste una deuda', `Eliminaste una deuda de $${transaction.amount.toFixed(2)} que tenías con ${transaction.owe_to_alias} por ${transaction.description}`); */
                notifications.generate(ownerId, 'Deuda borrada', `*${user.username}* eliminó una deuda de *$${transaction.amount.toFixed(2)}* por *${transaction.description}*`);

                if(oweToId > -1) {
                    // Notify the owner from this transaction
                    await notifications.sendNotification(ownerId, 'Deuda borrada', `${user.username} eliminó una deuda de $${transaction.amount.toFixed(2)} por ${transaction.description}`);
                    notifications.generate(oweToId, 'Deuda borrada', `*${user.username}* eliminó una deuda de *$${transaction.amount.toFixed(2)}* por *${transaction.description}*`);
                }
            }

            // Remove all the reminders
            let reminders = await TransactionReminder
                .query()
                .where('transaction_id', transaction.id)
                .fetch();
            reminders = reminders.toJSON();
            for(var idx in reminders) {
                const reminder = reminders[idx];
                if(reminder.onesignal_id)
                    await notifications.cancelNotification(reminder.onesignal_id);
                await TransactionReminder
                    .query()
                    .where('id', reminder.id)
                    .delete();
            }

            // Remove the transaction
            await transaction.delete();
        }

        return response.json({
            success: true
        });
    }

    /* Categories related */

    async getCategories({ request, auth, response }){
        let user = await auth.getUser();
        let categories = await TransactionCategory
            .query()
            .where('user_id', user.id)
            .orWhereNull('user_id')
            .fetch();

        return response.json({
            success: true,
            categories
        });
    }

    async createCategory({ request, auth, response }) {
        let data = request.body;
        let user = await auth.getUser();

        // Validate data
        if(!data.name) {
            return response.json({ success: false, message: 'Debes especificar un nombre de la categoría' });
        } else if(!data.color_hex) {
            return response.json({ success: false, message: 'Selecciona un color para diferenciar esta categoría' });
        }

        let transactionCategory = new TransactionCategory;
        if(request.body.id) {
            transactionCategory = await TransactionCategory.findOrFail(request.body.id);
        }

        transactionCategory.merge(request.all());
        transactionCategory.user_id = user.id;
        await transactionCategory.save();

        return response.json({
            success: true,
            message: 'La categoría se creó / modificó exitosamente.'
        });
    }

    async deleteCategoryById({ request, auth, response }) {
        let transactionCategory = await TransactionCategory.find(request.params.id);
        if(transactionCategory != null) {
            await transactionCategory.delete();
        }

        return response.json({
            success: true,
            message: 'La categoría se eliminó correctamente'
        });
    }
}

/* Utils / Helpers methods */
const formatAmount = (amount) => {
  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  return formatter.format(amount);
}

module.exports = TransactionController