'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const TransactionCategory = use('App/Models/TransactionCategory')

class TransactionCategorySchema extends Schema {
  up () {
    this.create('transaction_category', (table) => {
      table.increments()
      table.integer('user_id');
      table.integer('transaction_type_id');
      table.string('name');
      table.string('icon');
      table.string('color_hex');
      table.timestamps()
    });

    setTimeout(() => {
        console.log("Creating category");
        let promises = [];
        promises.push(TransactionCategory.create({
            id: 1,
            user_id: null,
            transaction_type_id: 1,
            name: 'Sin categoría',
            icon: null,
            color_hex: '#4BB543'
        }));

        promises.push(TransactionCategory.create({
            id: 2,
            user_id: null,
            transaction_type_id: 2,
            name: 'Sin categoría',
            icon: null,
            color_hex: '#FF9494'
        }));

        Promise.all(promises).then((values) => {
            console.log("[OK] Created general categories", values.map((e) => e.id));
        })
    }, 1500);
  }

  down () {
    this.drop('transaction_category')
  }
}

module.exports = TransactionCategorySchema
