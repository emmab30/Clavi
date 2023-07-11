'use strict'

const User = use('App/Models/User');
const Notification = use('App/Models/Notification');
const Database = use('Database');
const moment = require('moment');
const _ = require('lodash');

class NotificationController {

    async getMyNotifications({ request, auth, response }) {
        let user = await auth.getUser();
        let notifications = await Notification
            .query()
            .where('user_id', user.id)
            .orderBy('created_at', 'DESC')
            .limit(10)
            .fetch();

        // Set read notifications
        await Notification
          .query()
          .where('is_read', false)
          .where('user_id', user.id)
          .update({
              is_read: true
          });

          return response.json({
              success: true,
              notifications
          });
    }
}

module.exports = NotificationController