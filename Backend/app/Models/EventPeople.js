'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class EventPeople extends Model {
    static get table () {
        return 'event_people'
    }

    items() {
        return this.hasMany('App/Models/EventItem', 'id', 'people_id');
    }
}

module.exports = EventPeople
