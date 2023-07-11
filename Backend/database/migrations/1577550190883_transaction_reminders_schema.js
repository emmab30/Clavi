"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class TransactionReminderSchema extends Schema {
    up() {
        this.create("transaction_reminder", table => {
            table.increments();
            table.integer('transaction_id').unsigned().index()
            table.string('onesignal_id')
            table.datetime('datetime');
            table.timestamps();
        });
    }

    down() {
        this.drop("transaction_reminder");
    }
}

module.exports = TransactionReminderSchema;