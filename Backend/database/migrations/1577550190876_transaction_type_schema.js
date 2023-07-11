'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const TransactionType = use('App/Models/TransactionType')

class TransactionTypeSchema extends Schema {
  up () {
    this.create('transaction_types', (table) => {
      table.increments()
      table.string('name');
      table.timestamps()
    });

    setTimeout(() => {
        console.log("Creating transaction types.");
        let promises = [];
        promises.push(TransactionType.create({
            id: 1,
            name: 'income'
        }));
        promises.push(TransactionType.create({
            id: 2,
            name: 'outcome'
        }));

        Promise.all(promises).then((values) => {
            console.log("[OK] Created transaction types", values.map((e) => e.id));
        });
    }, 2000);
  }

  down () {
    this.drop('transaction_types')
  }
}

module.exports = TransactionTypeSchema
