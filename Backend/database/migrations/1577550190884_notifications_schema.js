"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class NotificationSchema extends Schema {
    up() {
        this.create("notifications", table => {
            table.increments();
            table.integer('user_id').unsigned().index()
            table.string('icon');
            table.string('title');
            table.string('message');
            table.string('route').nullable();
            table.string('link').nullable();
            table.string('payload').nullable();
            table.boolean('is_read').default(false);
            table.timestamps();
        });
    }

    down() {
        this.drop("notifications");
    }
}

module.exports = NotificationSchema;