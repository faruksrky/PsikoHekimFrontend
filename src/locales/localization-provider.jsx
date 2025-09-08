/* eslint-disable perfectionist/sort-imports */

import 'dayjs/locale/en';
import 'dayjs/locale/tr';
import 'dayjs/locale/vi';
import 'dayjs/locale/fr';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/ar-sa';

import dayjs from 'dayjs';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider as Provider } from '@mui/x-date-pickers/LocalizationProvider';

import { useTranslate } from './use-locales';

// ----------------------------------------------------------------------

export function LocalizationProvider({ children }) {
  const { currentLang } = useTranslate();

  dayjs.locale(currentLang.adapterLocale);

  return (
    <Provider 
      dateAdapter={AdapterDayjs} 
      adapterLocale={currentLang.adapterLocale}
      localeText={{
        cancelButtonLabel: 'İptal',
        clearButtonLabel: 'Temizle',
        okButtonLabel: 'Tamam',
        todayButtonLabel: 'Bugün',
        datePickerToolbarTitle: 'Tarih Seçin',
        timePickerToolbarTitle: 'Saat Seçin',
        dateTimePickerToolbarTitle: 'Tarih ve Saat Seçin',
        // Navigation butonları
        nextMonthLabel: 'İleri',
        previousMonthLabel: 'Geri',
        nextYearLabel: 'Gelecek Yıl',
        previousYearLabel: 'Geçen Yıl',
        nextDecadeLabel: 'Gelecek On Yıl',
        previousDecadeLabel: 'Geçen On Yıl',
        // Saat seçimi
        nextHourLabel: 'Sonraki Saat',
        previousHourLabel: 'Önceki Saat',
        nextMinuteLabel: 'Sonraki Dakika',
        previousMinuteLabel: 'Önceki Dakika',
      }}
    >
      {children}
    </Provider>
  );
}
