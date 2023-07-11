'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Notification extends Model {
    static get table () {
        return 'notifications'
    }
}

module.exports = Notification