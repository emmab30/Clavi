'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class EventPeopleSchema extends Schema {
  up () {
    this.create('event_people', (table) => {
        table.increments();
        table.integer('event_id').unsigned().index();
        table.integer('user_id').nullable();
        table.string('name');
        table.timestamps()
    })
  }

  down () {
    this.drop('event_people')
  }
}

module.exports = EventPeopleSchema
