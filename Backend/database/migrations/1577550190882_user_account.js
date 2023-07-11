"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class UserAccountSchema extends Schema {
    up() {
        this.create("user_account", table => {
            table.increments();
            table.integer('user_id').unsigned().index()
            table.integer('currency_id')
                .unsigned()
                .index()
                .nullable(); // This can be null since it"s reserved for next releases
            table.timestamps();
        });
    }

    down() {
        this.drop("user_account");
    }
}

module.exports = UserAccountSchema;