'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class EventSchema extends Schema {
  up () {
    this.create('events', (table) => {
        table.increments();
        table.integer('creator_id').unsigned().index();
        table.string('name');
        table.timestamps()
    })
  }

  down () {
    this.drop('events')
  }
}

module.exports = EventSchema
