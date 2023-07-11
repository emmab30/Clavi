import i18n from 'i18n-js';

import en from './locales/en.json';
import es from './locales/es.json';

i18n.defaultLocale = 'es';
i18n.locale = 'es';
i18n.fallbacks = true;
i18n.translations = { en, es };

export default i18n;