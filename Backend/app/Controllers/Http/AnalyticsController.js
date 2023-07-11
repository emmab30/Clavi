'use strict'

const User = use('App/Models/User');
const Database = use('Database')
const moment = require('moment');

class AnalyticsController {
    async postAction({ request, auth, response }) {
        let user = await auth.getUser();
        console.log(`[Analytics] Posted event ${request.body.type} > ${request.body.view} for user ${user.email}`);

        // Analysis for events
        let randomNumber = (Math.floor(Math.random() * 100) + 1);
        let threesoldStadisticAds = null;
        if(request.body.type == 'view_results') threesoldStadisticAds = 20;
        else threesoldStadisticAds = 88;

        let showAdsVideo = randomNumber > threesoldStadisticAds;
        let askForReview = false;

        // Check if the user left an app review
        if(request.body.type == 'left_app_review') {
            console.log(`User ${user.email} left an app review on the store.`);
            await Database
            .table('user_app_events')
            .insert({
                user_id: user.id,
                event_name: 'left_app_review',
                created_at: new Date(),
                updated_at: new Date()
            });
        }

        if(showAdsVideo){
            // We need to check the last event where the user watch an ad video. If it so recently, don't show it.
            let lastShownRecord = await Database
                .table('user_app_events')
                .where('event_name', 'watch_ad_video')
                .where('user_id', user.id)
                .orderBy('created_at', 'DESC')
                .limit(1)
                .select('created_at')
                .first();

            if(lastShownRecord != null) {
                const diffSinceLastWatch = moment().diff(moment(lastShownRecord.created_at), 'minute');
                if(diffSinceLastWatch < 2){
                    showAdsVideo = false;
                }

            }

            if(showAdsVideo) {
                await Database
                .table('user_app_events')
                .insert({
                    user_id: user.id,
                    event_name: 'watch_ad_video',
                    created_at: new Date(),
                    updated_at: new Date()
                });

                console.log(`[Analytics] Show ads video for ${user.email}. Random number: ${randomNumber}`);
            }
        } else {
            randomNumber = (Math.floor(Math.random() * 100) + 1);
            if(randomNumber < 30) {
                let userDaysAgo = moment().diff(moment(user.created_at), 'day');
                if(userDaysAgo > 2) {
                    const reviews = await Database
                        .select('*')
                        .from('user_app_events')
                        .where('user_id', user.id)
                        .where('event_name', 'left_app_review')
                        .getCount('id');

                    if(reviews == 0) {
                        console.log(`[Analytics] Asking review for user ${user.id}`);
                        askForReview = true;
                    }
                }
            }
        }

        let retVal = { success: true };
        if(askForReview) retVal.ask_review = true;
        if(showAdsVideo) retVal.show_ads_video = true;

        return response.json(retVal);
    }
}

module.exports = AnalyticsController