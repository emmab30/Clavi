import { ApiService } from './BaseService.js';
import { AsyncStorage } from 'react-native';

var AuthService = {
    login: function(data, success, error) {
        ApiService().post('auth/login', data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    register: function(data, success, error) {
        ApiService().post('auth/register', data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    loginWithFacebook: function(data, success, error) {
        ApiService().post('auth/social/facebook', data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    loginWithApple: function(data, success, error) {
        ApiService().post('auth/social/apple', data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    loginWithMockup: function(data, success, error) {
        ApiService().post('auth/mock', data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    logout: function(success, error) {
        ApiService().post('auth/logout', {})
        .then(function (response) {
            if(success)
                success(response.data);
        })
        .catch(function (err) {
            if(error)
                error(err);
        });
    }
};

export default AuthService;
