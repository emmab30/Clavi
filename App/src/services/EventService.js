import { ApiService } from './BaseService.js';
import { AsyncStorage } from 'react-native';

var EventService = {
    postEvent: function(data, success, error) {
        ApiService().post(`events`, data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    getMyEvents: function(success, error) {
        ApiService().get(`events/user/me`)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    getEventById: function(id, success, error) {
        ApiService().get(`events/${id}`)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    removeById: function(id, success, error) {
        ApiService().post(`events/${id}/delete`, {})
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    }
};

export default EventService;