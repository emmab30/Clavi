import { ApiService } from './BaseService.js';
import { AsyncStorage } from 'react-native';

var TransactionService = {
    balance: null,
    categories: null,
    getTransactionsByUserId: function(userId, data, success, error) {
        ApiService().post(`users/${userId}/transactions`, data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    getSharedTransactions: function(userId, data, success, error) {
        ApiService().post(`users/${userId}/transactions/shared`, data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    createTransaction: function(data, success, error) {
        ApiService().post(`transactions`, data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    removeById: function(id, success, error) {
        ApiService().post(`transactions/${id}/delete`, {})
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    syncCategories: function(callback) {
        // Get available categories
        TransactionService.getCategories((data) => {
            if(data.success) {
                TransactionService.categories = data.categories;
                if(callback)
                    callback()
            }
        }, (err) => {
            // Do nothing
        });
    },
    getCategories: function(success, error) {
        ApiService().get(`transactions/categories`)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    createCategory: function(data, success, error) {
        ApiService().post(`transactions/categories`, data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    deleteCategoryById: function(id, success, error) {
        ApiService().post(`transactions/categories/${id}/delete`)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    // Persisted filters
    getFilters: async function() {
        let filters = await AsyncStorage.getItem('Filters');
        if(filters != null)
            filters = JSON.parse(filters);
        return filters;
    },
    setFilters: function(filters) {
        AsyncStorage.setItem('Filters', JSON.stringify(filters));
        return true;
    }
};

export default TransactionService;
