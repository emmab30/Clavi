'use strict';
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const User = use('App/Models/User');
const Notification = use('App/Models/Notification');
const moment = require('moment');
const OneSignal = require('onesignal-node');
const client = new OneSignal.Client(process.env.ONESIGNAL_KEY, process.env.ONESIGNAL_SECRET);

class NotificationMiddleware {
    /**
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Function} next
     */
    async handle(ctx, next) {
        if(!ctx.notifications){
            ctx.notifications = {
                generate: async (userId, title, message, extraData = {}) => {
                    let notification = await Notification.create({
                        user_id: userId,
                        title,
                        message,
                        icon: (extraData.icon != null ? extraData.icon : null),
                        route: (extraData.route != null ? extraData.route : null),
                        link: (extraData.link != null ? extraData.link : null),
                        payload: (extraData.payload != null ? JSON.stringify(extraData.payload) : null)
                    });

                    return notification;
                },
                scheduleNotification: async (userId, date, title, message, extraData = {}) => {
                    console.log(`Schedule notification for ${userId}: ${title} > ${message}`);
                    const user = await User.find(userId);
                    const onesignalObject = {
                        contents: {
                            es: message,
                            en: message
                        },
                        headings: {
                            es: title,
                            en: title
                        },
                        send_after: moment(date).format('YYYY-MM-DD HH:mm:ss'),
                        include_player_ids: [user.notification_id]
                    };
                    console.log(onesignalObject);
                    const response = await client.createNotification(onesignalObject);

                    if(response.statusCode == 200) {
                        return response.body.id; // Return the ID of generated notification
                    }

                    return response;
                },
                sendNotification: async (userId, title, message, extraData = {}) => {
                    const user = await User.find(userId);
                    if(user.notification_id != null) {
                        console.log(`Sending notification for ${userId}: ${title} > ${message}. Notification ID: ${user.notification_id}`);
                        const onesignalObject = {
                            contents: {
                                es: message,
                                en: message
                            },
                            headings: {
                                es: title,
                                en: title
                            },
                            data: extraData,
                            include_player_ids: [user.notification_id]
                        };
                        const response = await client.createNotification(onesignalObject);

                        if(response.statusCode == 200) {
                            return response.body.id; // Return the ID of generated notification
                        }
                    }

                    return null;
                },
                cancelNotification: async (notificationId) => {
                    console.log(`Cancelling onesignal notification [id = ${notificationId}]`)
                    let retVal = await client.cancelNotification(notificationId)
                    return retVal;
                }
            }
        }
        await next();
    }
}

module.exports = NotificationMiddleware;