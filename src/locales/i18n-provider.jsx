import i18next from 'i18next';
import { initReactI18next, I18nextProvider as Provider } from 'react-i18next';

import { localStorageGetItem } from 'src/utils/storage-available';

import { i18nOptions, fallbackLng } from './config-locales';

// ----------------------------------------------------------------------

/**
 * [1] localStorage
 * Auto detection:
 * const lng = localStorageGetItem('i18nextLng')
 */
const lng = localStorageGetItem('i18nextLng', fallbackLng);

i18next
  .use(initReactI18next)
  .init({ ...i18nOptions(lng), detection: { caches: ['localStorage'] } });

// ----------------------------------------------------------------------

export function I18nProvider({ children }) {
  return <Provider i18n={i18next}>{children}</Provider>;
}
