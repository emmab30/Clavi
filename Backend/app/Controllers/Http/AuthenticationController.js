'use strict'

const User = use('App/Models/User');
const request = require('request');

class AuthenticationController {
    async login ({ request, auth, response}) {
        try {
            const {
                email,
                password,
                push_notification_token,
                appVersion,
                snType
            } = request.all()

            const token = await auth.attempt(email, password)
            const user = await User.query().where('email', email).first();

            // Update push notification id
            if(push_notification_token)
              user.notification_id = push_notification_token;
            if(appVersion)
              user.app_version = appVersion;
            if(snType)
              user.provider = snType;

            user.save();

            return response.json({
                success: true,
                token: token.token,
                user: user
            });
        } catch (e) {
            return response.json({
                success: false,
                message: 'El email o password es inválido.'
            })
        }
    }

    async register ({ request, auth, response}) {
        try {
            let {
              email,
              full_name,
              password
            } = request.all();

            // Trim data
            full_name = full_name.trim();
            email = email.trim();
            password = password.trim();

            const numberRows = await User.query().where('email', email).getCount();
            if(numberRows > 0) {
                return response.json({
                    success: false,
                    message: 'Esa dirección de correo ya está registrada'
                });
            }

            // Some validations here
            if(full_name.indexOf(' ') == -1) {
              return response.json({
                success: false,
                message: 'Completa con tu nombre completo (al menos un nombre y al menos un apellido)'
              });
            } else if(!(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email))) {
              return response.json({
                success: false,
                message: 'La dirección de correo electrónico no es válida'
              });
            }

            const retVal = await this.userFindOrCreate(auth, {
              email: email,
              name: full_name
            }, password, request.all());

            //Assign the role
            const user = await User.query().where('email', email).first();

            return response.json(retVal);
        } catch (e) {
            console.log(e);
            return response.json({
                success: false,
                message: 'El email o password es inválido.'
            });
        }
    }

    async loginWithFacebookMock ({ request, auth, response }) {
        let user = await User.findOrFail(request.all().id);

        if(user != null) {
            let retVal = null;
            try {

                // Set the email in case it's null
                if(user.email == null)
                    user.email = `${user.id}@facebook.com`;

                retVal = await this.userFindOrCreate(auth, user, 'ControlaTusGastos2020!_', request.all());
            } catch (err) {
                // Do nothing
            }

            return response.json(retVal);
        } else {
            return response.json({
                success: false,
                message: 'No se pudo obtener tu usuario. Prueba registrándote de otro modo.'
            });
        }
    }

    async loginWithApple ({ request, auth, ally, response }) {
        const data = request.all();
        if(data != null) {
            let retVal = null;
            try {

                // Set the email in case it's null
                if(data.email == null)
                    data.email = `${data.snID}@apple.com`;
                if(data.name == null)
                    data.name = `${this.makeid(4)} ${this.makeid(4)}`;

                retVal = await this.userFindOrCreate(auth, data, 'ControlaTusGastos2020!_', request.all());
            } catch (err) {
                // Do nothing
                retVal = {
                    success: false,
                    message: 'No se pudo crear tu usuario. Prueba ingresando de otra manera'
                };
            }

            return response.json(retVal);
        }
    }

    async loginWithFacebook ({ request, auth, ally, response }) {
        const { token } = request.all();
        if(token != null) {
            let user = await ally
                .driver('facebook')
                .getUserByToken(token);

            if(user != null) {
                user = user.toJSON();

                console.log("[Auth] Logging in user", user.email);

                let retVal = null;
                try {

                    // Set the email in case it's null
                    if(user.email == null)
                        user.email = `${user.id}@facebook.com`;

                    retVal = await this.userFindOrCreate(auth, user, 'ControlaTusGastos2020!_', request.all());
                } catch (err) {
                    // Do nothing
                }

                return response.json(retVal);
            } else {
                return response.json({
                    success: false,
                    message: 'No se pudo obtener tu usuario. Prueba registrándote de otro modo.'
                });
            }
        }
    }

    async logout({ request, auth, response }) {
        let user = await auth.getUser()
        console.log("Logout user", user.id);

        return response.json({
            success: true
        });
    }

    async userFindOrCreate(auth, user, password, extraData) {

        let username = null;
        if(user.name != null) {
            let split = user.name.split(' ');
            if(!split) {
                username = this.makeid(6) + Math.floor(100 + Math.random() * 900);
            } else {
                username = split[0].substring(0, 3).toUpperCase() + split[1].substring(0, 3).toUpperCase() + Math.floor(100 + Math.random() * 900);
            }
        }

        let objToCreate = {
            email: user.email,
            password: password,
            username: username,
            name: user.name
        };
        if(user.id) objToCreate.social_id = user.id;

        const toFetch = await User.findOrCreate({ email: user.email }, objToCreate);

        if(extraData) {
            if(extraData.push_notification_token != null)
                toFetch.notification_id = extraData.push_notification_token;
            if(extraData.appVersion != null)
                toFetch.app_version = extraData.appVersion;
            if(extraData.snType != null)
                toFetch.provider = extraData.snType;
            if(user.name != null && toFetch.username == null) {
                let split = user.name.split(' ');
                toFetch.name = user.name;
                toFetch.username = split[0].substring(0, 3).toUpperCase() + split[1].substring(0, 3).toUpperCase() + Math.floor(100 + Math.random() * 900);
            }

            if(user.id != null && toFetch.provider == 'facebook'){
                toFetch.social_id = user.id;
            }

            toFetch.save();
        }

        const userEntity = toFetch.toJSON();

        const logged = await auth.generate(userEntity);

        return {
            success: true,
            token: logged.token,
            user: toFetch.toJSON()
        };
    }

    makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}

module.exports = AuthenticationController