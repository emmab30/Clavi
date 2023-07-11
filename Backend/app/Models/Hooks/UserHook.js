'use strict'

const UserAccount = use('App/Models/UserAccount');
const Currency = use('App/Models/Currency');

const UserHook = exports = module.exports = {}

UserHook.onCreated = async (user) => {
    let globalCurrency = await Currency.query().where('name', 'Moneda Global').first();

    let account = await UserAccount.create({
        user_id: user.id,
        currency_id: globalCurrency.id
    });

    user.active_account_id = account.id;
    await user.save();
}
