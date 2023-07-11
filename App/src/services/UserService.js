import { ApiService } from './BaseService.js';
import { AsyncStorage } from 'react-native';

var UserService = {
    user: null,
    getMe: function(data, success, error) {
        ApiService().get(`users/me`)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    getMyAccounts: function(success, error) {
        ApiService().get(`users/me/accounts`)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    createAccount: function(data, success, error) {
        ApiService().post(`users/me/accounts/new`, data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    updateMetadata: function(data, success, error) {
        ApiService().post(`users/me/metadata`, data)
        .then(function (response) {
            if(success)
                success(response.data);
        })
        .catch(function (err) {
            if(error)
                error(err);
        });
    },
    updateMe: function(data, success, error) {
        ApiService().post(`users/me`, data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    searchByPattern: function(pattern, success, error) {
        ApiService().post(`users/search_by_pattern`, { pattern: pattern })
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    }
};

export default UserService;