import { ApiService } from './BaseService.js';
import { AsyncStorage } from 'react-native';

var AnalyticsService = {
    postEvent: function(data, success, error) {
        ApiService().post('analytics/action', data)
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

export default AnalyticsService;
