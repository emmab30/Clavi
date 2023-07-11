'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class EventItemSchema extends Schema {
  up () {
    this.create('event_item', (table) => {
        table.increments();
        table.integer('people_id').unsigned().index();
        table.string('concept').nullable();
        table.float('amount').default(0);
        table.timestamps()
    })
  }

  down () {
    this.drop('event_item')
  }
}

module.exports = EventItemSchema
