'use strict'

const User = use('App/Models/User');
const UserAccount = use('App/Models/UserAccount');
const Transaction = use('App/Models/Transaction');
const TransactionReminder = use('App/Models/TransactionReminder');
const TransactionCategory = use('App/Models/TransactionCategory');
const Database = use('Database');
const moment = require('moment');
const _ = require('lodash');

class ChartController {
    async getLineChartData({ request, auth, response }) {
        let user = await auth.getUser();
        let filters = request.input('filters');
        const isFilteringByDate = filters && filters.date_from && filters.date_to;

        let transactions = Transaction
            .query()
            .where('user_account_id', user.active_account_id)
            .whereNull('shared_account_id')
            .whereNotIn('status', ['pending_paid'])
            .with('type', function(query) {
                query.select(['id', 'name'])
            })
            .orderBy('created_at', 'asc');

        if(filters && Object.keys(filters).length > 0) {
            if(isFilteringByDate) {
                transactions = transactions
                    .where('created_at', '>=', moment(filters.date_from).format('YYYY-MM-DD HH:mm:ss'))
                    .where('created_at', '<=', moment(filters.date_to).format('YYYY-MM-DD HH:mm:ss'));
            }

            if(filters.transaction_type_id) {
                transactions = transactions
                    .where('transaction_type_id', filters.transaction_type_id);
            }
        } else {
            transactions = transactions.where('created_at', '>=', moment().subtract(3, 'month').format('YYYY-MM-DD HH:mm:ss'));
        }

        transactions = await transactions.fetch();

        // Default periods
        let periods = [
            { label: moment().subtract('6', 'months').format('YYYY-MM-DD'), value: 0 },
            { label: moment().subtract('3', 'months').format('YYYY-MM-DD'), value: 0 },
            { label: moment().subtract('1', 'months').format('YYYY-MM-DD'), value: 0 },
            { label: moment().format('YYYY-MM-DD 23:59:59'), value: 0 },
        ];

        // Search for three four middle periods if the user wants to filter by date
        if(isFilteringByDate) {
            // Look for periods
            const dateFrom = moment(filters.date_from);
            const dateTo = moment(filters.date_to);

            const differenceInDays = dateTo.diff(dateFrom, 'days');
            const isToday = dateTo.diff(moment(), 'days') == 0;
            periods = [
                { label: dateFrom.format('YYYY-MM-DD 00:00:00'), value : 0 },
                { label: dateTo.clone().subtract(differenceInDays / 2, 'days').format('YYYY-MM-DD'), value : 0 },
                { label: dateTo.clone().subtract(differenceInDays / 4, 'days').format('YYYY-MM-DD'), value : 0 },
                { label: dateTo.format('YYYY-MM-DD 23:59:59'), value : 0 }
            ];
        }

        const balanceByPeriod = (lastBalance, periodFrom, periodTo) => {
            let filtered = _.filter(transactions, i => i.created_at > periodFrom && i.created_at < periodTo);
            for(var idx in filtered) {
                if(filtered[idx].type.name == 'income') {
                    lastBalance += filtered[idx].amount;
                } else {
                    lastBalance -= filtered[idx].amount;
                }
            }

            return lastBalance;
        }

        // Analyze transactions
        transactions = transactions.toJSON();

        let
            partialBalance = 0,
            lastBalance = 0;
        for(var idx in periods) {
            if(idx == 0)
                continue;

            const period = periods[idx];
            periods[idx].value = balanceByPeriod(
                lastBalance,
                moment(periods[parseInt(idx) - 1].label).format('YYYY-MM-DD HH:mm:ss'),
                moment(period.label).format('YYYY-MM-DD HH:mm:ss')
            );

            partialBalance += periods[idx].value;
            lastBalance = periods[idx].value;
        }

        // Another for to change the labels to be readable by the user
        for(var idx in periods) {
            // Change the label to be readable by the user
            periods[idx].label = moment(periods[idx].label).format('DD/MM/YY');
        }

        /*let partialBalance = 0;
        let totalBalance = 0; // This is the sum for all balances

        partialBalance = balanceByPeriod(
            0,
            moment().subtract(10, 'year').format('YYYY-MM-DD HH:mm:ss'),
            moment().subtract(3, 'month').format('YYYY-MM-DD HH:mm:ss')
        );

        periods[0].value = partialBalance;
        totalBalance += partialBalance;

        partialBalance += balanceByPeriod(
            0,
            moment().subtract(3, 'month').format('YYYY-MM-DD HH:mm:ss'),
            moment().subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss')
        );

        periods[1].value = partialBalance;
        totalBalance += partialBalance;

        partialBalance += balanceByPeriod(
            0,
            moment().subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss'),
            moment().subtract(1, 'week').format('YYYY-MM-DD HH:mm:ss')
        );

        periods[2].value = partialBalance;
        totalBalance += partialBalance;

        partialBalance += balanceByPeriod(
            0,
            moment().subtract(1, 'week').format('YYYY-MM-DD HH:mm:ss'),
            moment().format('YYYY-MM-DD HH:mm:ss')
        );

        periods[3].value = partialBalance;
        totalBalance += partialBalance;*/

        // Configuration for chart
        let backgroundColor = '#7876C7';
        if(partialBalance > 0) {
            backgroundColor = '#8fc1c0';
        } else if(partialBalance < 0) {
            backgroundColor = '#FF764B';
        }

        if(partialBalance == 0) {
            return response.json({
            success: false,
                periods: periods,
                config: {
                    backgroundColor: backgroundColor
                }
            });
        }

        return response.json({
            success: true,
            periods: periods,
            config: {
                backgroundColor: backgroundColor
            }
        })
    }
}

module.exports = ChartController