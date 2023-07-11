import { ApiService } from './BaseService.js';
import { AsyncStorage } from 'react-native';

var NotificationService = {
    getMyNotifications: function(success, error) {
        ApiService().get(`notifications/me`)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    }
};

export default NotificationService;