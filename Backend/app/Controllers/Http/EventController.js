'use strict'

const Event = use('App/Models/Event');
const EventPeople = use('App/Models/EventPeople');
const EventItem = use('App/Models/EventItem');
const EventExcludeItem = use('App/Models/EventExcludeItem');
const Database = use('Database');
const _ = require('lodash');

class EventController {
    async getMyEvents({ request, auth, response }) {
        let user = await auth.getUser();
        let events = await Event
            .query()
            .orderBy('created_at', 'DESC')
            .where('creator_id', user.id)
            .fetch();

        return response.json({
            success: true,
            events: events
        });
    }

    async getEventById({ request, response }) {
        const id = request.params.id;
        let event = await Event
            .query()
            .where('id', id)
            .with('people.items.excluded_people')
            .first();

        return response.json({
            success: true,
            event
        });
    }

    async postEvent({ request, auth, response }) {
        const user = await auth.getUser();

        const params = request.all();
        let event = null;
        // Update or creating?
        if(params.id != null) {
            // Update
            event = await Event
                .query()
                .where('id', params.id)
                .with('people.items.excluded_people')
                .first();

            let peopleData = event.getRelated('people').toJSON();

            // Analyze persons to delete
            let idsPeople = _.map(peopleData, (i) => i.id);
            let idsParam = _.map(params.people, (i) => i.id);
            let toDelete = _.differenceWith(idsPeople, idsParam);
            for(var idx in toDelete) {
                await event
                    .people()
                    .where('id', toDelete[idx])
                    .delete();
                await Database
                    .raw('DELETE FROM event_item WHERE people_id = ?', [toDelete[idx]])
                await Database
                    .raw('DELETE FROM event_exclude_item WHERE people_id = ?', [toDelete[idx]])
            }

            let people = [];
            for(var idx in params.people) {
                let person = params.people[idx];
                let createdPerson = person;

                if(isNaN(person.id)) {
                    // Create person
                    createdPerson = await EventPeople.create({
                        name: person.name,
                        event_id: event.id,
                        created_at: new Date(),
                        updated_at: new Date()
                    });
                }

                if(person.items != null) {

                    // Delete removed items
                    const personData = _.find(peopleData, (i) => i.id == person.id) // From database

                    if(personData != null) {
                        let idsItems = _.map(personData.items, (i) => i.id);
                        let idsParam = _.map(person.items, (i) => i.id);
                        let toDelete = _.differenceWith(idsItems, idsParam);
                        for(var idx in toDelete) {
                            await Database
                                .raw('DELETE FROM event_item WHERE id = ?', [toDelete[idx]])
                            await Database
                                .raw('DELETE FROM event_exclude_item WHERE item_id = ?', [toDelete[idx]])
                        }
                    }

                    for(var index in person.items) {
                        let item = person.items[index];
                        let createdItem = item;
                        if(isNaN(item.id) && item.amount > 0) {
                            createdItem = await EventItem.create({
                                concept: item.concept,
                                amount: item.amount,
                                people_id: createdPerson.id
                            });
                        }

                        if(item.excluded_people != null) {

                            if(personData != null) {
                                // Delete if necessary
                                let itemById = _.find(personData.items, (e) => e.id == item.id);
                                if(itemById && itemById.excluded_people != null) {
                                    const excludedIdsDatabase = _.map(itemById.excluded_people, (e) => e.id);
                                    const excludedIdsParams = _.map(item.excluded_people, (i) => i.id);
                                    let toDelete = _.differenceWith(excludedIdsDatabase, excludedIdsParams);
                                    for(var idx in toDelete) {
                                        await Database
                                            .raw('DELETE FROM event_exclude_item WHERE id = ?', [toDelete[idx]])
                                    }
                                }
                            }

                            // Add if necessary
                            for(var index in item.excluded_people) {
                                let excludedPerson = item.excluded_people[index];
                                let createdExcludePeople = excludedPerson;
                                if(isNaN(excludedPerson.id)) {
                                    createdExcludePeople = await EventExcludeItem.create({
                                        people_id: excludedPerson.people_id,
                                        item_id: item.id
                                    });
                                }
                            }
                        }
                    }
                }
            }

            event = await Event
                .query()
                .where('id', params.id)
                .with('people.items.excluded_people')
                .first();

        } else {
            event = await Event.create({
                creator_id: user.id,
                name: params.name
            });
        }

        return response.json({
            success: true,
            event: event
        });
    }

    async deleteEvent({ request, response }) {

        let eventId = request.params.id;
        await Database
            .raw('DELETE FROM events WHERE id = ?', [eventId])

        return response.json({
            success: true
        });
    }
}

module.exports = EventController