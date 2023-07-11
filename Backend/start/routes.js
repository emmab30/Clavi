'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', 'HomeController.index');

// Users
Route.group(() => {

    // Authentication
    Route.post('auth/login', 'AuthenticationController.login');
    Route.post('auth/mock', 'AuthenticationController.loginWithFacebookMock');
    Route.post('auth/register', 'AuthenticationController.register');
    Route.post('auth/social/facebook', 'AuthenticationController.loginWithFacebook');
    Route.post('auth/social/apple', 'AuthenticationController.loginWithApple');
    Route.post('auth/social/google', 'AuthenticationController.loginWithGoogle');
    Route.post('auth/logout', 'AuthenticationController.logout');

    // Users
    Route.post('users/:id/transactions', 'TransactionController.getTransactionsByUser');
    Route.post('users/:id/transactions/shared', 'TransactionController.getSharedTransactions');
    Route.post('users/:id/transactions/about_to_due', 'TransactionController.getAboutToDueTransactions');
    Route.get('users/me', 'UserController.getMe');
    Route.post('users/me/metadata', 'UserController.updateUserMetadata');
    Route.get('users/me/accounts', 'UserController.getMyAccounts');
    Route.post('users/me/accounts/new', 'UserController.createAccount');
    Route.post('users/me', 'UserController.updateUser');
    Route.post('users/search_by_pattern', 'UserController.searchByPattern');

    // Analytics
    Route.post('analytics/action', 'AnalyticsController.postAction');

    // Transactions
    Route.post('transactions', 'TransactionController.createTransaction');
    Route.post('transactions/calculator', 'TransactionController.postUseCalculator');
    Route.post('transactions/:id/delete', 'TransactionController.removeById');
    Route.get('transactions/categories', 'TransactionController.getCategories');
    Route.post('transactions/categories', 'TransactionController.createCategory');
    Route.post('transactions/categories/:id/delete', 'TransactionController.deleteCategoryById');

    // Shared accounts
    Route.get('shared_accounts/me', 'SharedAccountController.getSharedAccounts');
    Route.get('shared_accounts/:id', 'SharedAccountController.getSharedAccountById');
    Route.get('shared_accounts/:id/transactions', 'TransactionController.getSharedAccountTransactionsById');
    Route.post('shared_accounts', 'SharedAccountController.postSharedAccount');
    Route.delete('shared_accounts/:id', 'SharedAccountController.deleteSharedAccount');
    Route.post('shared_accounts/:id/members', 'SharedAccountController.addMember');
    Route.delete('shared_accounts/:id/members/:user_id', 'SharedAccountController.kickMember');

    // Events
    Route.post('events', 'EventController.postEvent');
    Route.get('events/user/me', 'EventController.getMyEvents');
    Route.get('events/:id', 'EventController.getEventById');
    Route.post('events/:id/delete', 'EventController.deleteEvent');

    // Notifications
    Route.get('notifications/me', 'NotificationController.getMyNotifications')

    // Currencies
    Route.get('currencies', 'CurrencyController.getCurrencies');

    // Charts
    Route.post('charts/line_chart/filter', 'ChartController.getLineChartData');
}).prefix('api/v1');