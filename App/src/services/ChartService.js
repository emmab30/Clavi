import { ApiService } from './BaseService.js';
import { AsyncStorage } from 'react-native';

var ChartService = {
    getLineChart: function(data, success, error) {
        ApiService().post('charts/line_chart/filter', data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    }
};

export default ChartService;
