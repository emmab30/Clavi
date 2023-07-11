'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TransactionCategorySchema extends Schema {
  up () {
    this.create('transaction_x_categories', (table) => {
      table.increments()
      table.integer('transaction_id');
      table.string('transaction_category_id');
      table.timestamps()
    })
  }

  down () {
    this.drop('transaction_x_categories')
  }
}

module.exports = TransactionCategorySchema
