import { ApiService } from './BaseService.js';
import { AsyncStorage, Platform } from 'react-native';

var AdsService = {
    getBannerIdentifier: function(placeId = 'home') {
        if(__DEV__) {
            return 'ca-app-pub-3940256099942544/6300978111';
        }

        if(placeId == 'home') {
            return Platform.select({
                ios: 'ca-app-pub-5500884352220114/3633766053',
                android: 'ca-app-pub-5500884352220114/2183578898'
            });
        } else if(placeId == 'last_movements') {
            return Platform.select({
                ios: 'ca-app-pub-5500884352220114/5154633229',
                android: 'ca-app-pub-5500884352220114/5092243413'
            });
        } else if(placeId == 'new_transaction') {
            return Platform.select({
                ios: 'ca-app-pub-5500884352220114/2019357510',
                android: 'ca-app-pub-5500884352220114/4837092549'
            });
        } else if(placeId == 'share_costs') {
            return Platform.select({
                ios: 'ca-app-pub-5500884352220114/8010050794',
                android: 'ca-app-pub-5500884352220114/4837092549'
            });
        }
    },
    getInterstitialIdentifier: function(){
        if(__DEV__) {
            return 'ca-app-pub-3940256099942544/1033173712';
        }

        // Check based on current platform
        if(Platform.OS === 'ios')
            return 'ca-app-pub-5500884352220114/8357857586';
        else
            return 'ca-app-pub-5500884352220114/7245708004'
    }
};

export default AdsService;
