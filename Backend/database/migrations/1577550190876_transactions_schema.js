'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TransactionsSchema extends Schema {
  up () {
    this.create('transactions', (table) => {
        table.increments();
        table.integer('user_account_id').unsigned().index();
        table.integer('transaction_type_id').unsigned().index();
        table.string('description').nullable();
        table.float('amount');
        table.boolean('is_owe'); // This means it's a shared transaction.
        table.integer('owe_to_id').nullable().unsigned().index();
        table.string('owe_to_alias').nullable();
        table.string('status').default('created');
        table.timestamps()
        table.datetime('deleted_at').nullable();
    })
  }

  down () {
    this.drop('transactions')
  }
}

module.exports = TransactionsSchema
