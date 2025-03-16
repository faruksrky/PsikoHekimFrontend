import dayjs from 'dayjs';
import { useMemo } from 'react';

import { CALENDAR_COLOR_OPTIONS } from 'src/_mock/_calendar';

// ----------------------------------------------------------------------

export function useEvent(events, selectEventId, selectedRange, openForm) {
  return useMemo(() => {
    if (selectEventId) {
      // Event ID'ye göre event'i bul
      const event = events.find((item) => item.id === selectEventId);
      
      // Debug için
      console.log('Selected Event ID:', selectEventId);
      console.log('Found Event:', event);
      console.log('All Events:', events);

      return event;
    }

    if (selectedRange && openForm) {
      // Yeni event için seçilen zaman aralığı
      return {
        start: selectedRange.start,
        end: selectedRange.end,
      };
    }

    return null;
  }, [events, selectEventId, selectedRange, openForm]);
}
