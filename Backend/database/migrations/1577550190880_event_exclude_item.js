'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class EventExcludeItemSchema extends Schema {
  up () {
    this.create('event_exclude_item', (table) => {
        table.increments();
        table.integer('people_id').unsigned().index();
        table.integer('item_id').unsigned().index();
        table.timestamps()
    })
  }

  down () {
    this.drop('event_exclude_item')
  }
}

module.exports = EventExcludeItemSchema
