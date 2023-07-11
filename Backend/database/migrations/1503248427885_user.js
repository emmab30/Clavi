"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");
const User = use("App/Models/User");

class UserSchema extends Schema {
    up() {
        this.create("users", table => {
            table.increments();
            table
                .string("email", 254)
                .notNullable()
                .unique();
            table.string('username', 15)
                .unique()
            table.string('name', 100).nullable();
            table.integer('active_account_id')
                .unsigned()
                .index()
                .nullable();
            table.string("provider");
            table.string("timezone").nullable();
            table.string("password", 60).notNullable();
            table.string("notification_id", 100);
            table.string("app_version", 100);
            table.string("last_login", 100);
            table.timestamps();
        });

        // Create mockup user
        setTimeout(() => {
            console.log("Creating user mockup");
            User.create({
                email: 'test@test.com',
                username: 'TESTAB123',
                name: 'Testing account',
                active_account_id: null,
                provider: 'mockup',
                password: 'fekaa3011',
                notification_id: null,
                app_version: '1.0.0',
                last_login: new Date()
            }).then((data) => {
                console.log("[OK] Created mockup user");
            });
        }, 7500);
    }

    down() {
        this.drop("users");
    }
}

module.exports = UserSchema;