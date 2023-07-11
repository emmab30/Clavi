import { ApiService } from './BaseService.js';
import { AsyncStorage, Platform } from 'react-native';
import i18n from 'app/src/i18n';
import moment from 'moment-timezone/builds/moment-timezone-with-data';

var LanguageService = {
    string: (key, params) => {
        return i18n.t(key, params);
    },
    setLocale: (locale) => {
        moment.locale(locale);
        i18n.locale = locale;
    },
    getLocale: () => {
        return i18n.locale;
    }
};

export default LanguageService;
