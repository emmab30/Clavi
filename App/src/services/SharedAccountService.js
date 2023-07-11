import { ApiService } from './BaseService.js';
import { AsyncStorage } from 'react-native';

var SharedAccountService = {
    getMySharedAccounts: (success, error, final) => SharedAccountService.getSharedAccounts('me', success, error, final),
    getSharedAccounts: (userId, success, error, final) => {
        if(!userId) userId = 'me';

        ApiService().get(`shared_accounts/${userId}`)
            .then((response) => success(response.data))
            .catch((err) => error(err))
            .finally(final || (() => {}));
    },
    getSharedAccounById: (id, success, error, final) => {
        ApiService().get(`shared_accounts/${id}`)
            .then((response) => success(response.data))
            .catch((err) => error(err))
            .finally(final || (() => {}));
    },
    getSharedAccountTransactionsById: (id, success, error, final) => {
        ApiService().get(`shared_accounts/${id}/transactions`)
            .then((response) => success(response.data))
            .catch((err) => error(err))
            .finally(final || (() => {}));
    },
    createSharedAccount: (data, success, error, final) => {
        ApiService().post(`shared_accounts`, data)
            .then((response) => success(response.data))
            .catch((err) => error(err))
            .finally(final || (() => {}));
    },
    deleteSharedAccount: (id, success, error, final) => {
        ApiService().delete(`shared_accounts/${id}`)
            .then((response) => success(response.data))
            .catch((err) => error(err))
            .finally(final || (() => {}));
    },
    addMember: (id, data, success, error, final) => {
        ApiService().post(`shared_accounts/${id}/members`, data)
        .then((response) => success(response.data))
            .catch((err) => error(err))
            .finally(final || (() => {}));
    },
    kickMember: (id, idMember, success, error, final) => {
        ApiService().delete(`shared_accounts/${id}/members/${idMember}`)
            .then((response) => success(response.data))
            .catch((err) => error(err))
            .finally(final || (() => {}));
    }
};

export default SharedAccountService;
