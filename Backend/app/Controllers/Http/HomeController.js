'use strict'

const User = use('App/Models/User');

class HomeController {
    async index({ request, response }) {
        return response.json({
            success: true,
            server_status: 'ok'
        });
    }
}

module.exports = HomeController