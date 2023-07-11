'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class EventItem extends Model {
    static get table () {
        return 'event_item'
    }

    excluded_people() {
        return this.hasMany('App/Models/EventExcludeItem', 'id', 'item_id');
    }
}

module.exports = EventItem
