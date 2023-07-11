// Auth
import LoginScreen from '../screens/LoginScreen';
import LoginCredentialsScreen from '../screens/auth/login_credentials'
import RegisterCredentialsScreen from '../screens/auth/register_credentials'

// Home
import HomeScreen from '../screens/HomeScreen';
import LastMovementsScreen from '../screens/LastMovementsScreen';

// Questions
import QuestionsList from '../screens/questions/QuestionsList';

// Shared account
import NewSharedAccount from '../screens/shared_account/new';
import DetailsSharedAccount from '../screens/shared_account/details';

// Share costs
import ShareCostsCalculatorEventsScreen from '../screens/share/ShareCostsCalculatorEventsScreen';
import ShareCostsCalculatorScreen from '../screens/share/ShareCostsCalculatorScreen';
import ShareCostsResultScreen from '../screens/share/ShareCostsResultScreen';
import ShareCostsAddEventModal from '../screens/share/ShareCostsAddEventModal';
import ShareCostsAddConceptModal from '../screens/share/ShareCostsAddConceptModal';
import ShareCostsChoosePeopleForConceptModal from '../screens/share/ShareCostsChoosePeopleForConceptModal';

// Notification
import NotificationListScreen from '../screens/notifications/NotificationListScreen';

// Search user
import SearchUserScreen from '../screens/search_user/SearchUserScreen';

// Configuration
import ConfigurationScreen from '../screens/ConfigurationScreen';
import TransactionCategoriesScreen from '../screens/TransactionCategoriesScreen';

// Modals
import NewIncomeOutcome from '../screens/modals/NewIncomeOutcome'
import OptionsPickerModal from '../screens/modals/OptionsPickerModal'
import CountryPickerModal from '../screens/modals/CountryPickerModal'
import FiltersTransactionsModal from '../screens/modals/FiltersTransactionsModal'
import TransactionDetailsModal from '../screens/modals/TransactionDetailsModal';

export default {
    // Auth
    LoginScreen,
    LoginCredentialsScreen,
    RegisterCredentialsScreen,

    // Transactions
    HomeScreen,
    LastMovementsScreen,

    // Questions
    QuestionsList,

    // Shared Accounts
    NewSharedAccount,
    DetailsSharedAccount,

    // Notifications
    NotificationListScreen,

    // Searching
    SearchUserScreen,

    // Share costs
    ShareCostsCalculatorEventsScreen,
    ShareCostsCalculatorScreen,
    ShareCostsResultScreen,
    ShareCostsAddEventModal,
    ShareCostsAddConceptModal,
    ShareCostsChoosePeopleForConceptModal,

    // Configuration
    TransactionCategoriesScreen,
    ConfigurationScreen,

    // Modals
    NewIncomeOutcome,
    OptionsPickerModal,
    FiltersTransactionsModal,
    TransactionDetailsModal,
    CountryPickerModal
}