'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class EventExcludeItem extends Model {
    static get table () {
        return 'event_exclude_item'
    }
}

module.exports = EventExcludeItem
