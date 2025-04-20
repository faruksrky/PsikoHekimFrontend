import dayjs from 'dayjs';
import { useMemo } from 'react';

import { CALENDAR_COLOR_OPTIONS } from 'src/_mock/_calendar';

// ----------------------------------------------------------------------

export function useEvent(events, selectEventId, selectedRange, openForm, openCalendarEdit) {
  return useMemo(() => {
    if (selectEventId) {
      // Event ID'ye göre event'i bul
      const event = events.find((item) => item.id === selectEventId);
      
      if (event) {
        // Status değerini büyük harfe çevirelim
        const status = event.extendedProps?.status 
          ? event.extendedProps.status.toUpperCase() 
          : 'CONFIRMED';
        
        // Event'i form için hazırla
        return {
          id: event.id,
          title: event.title,
          description: event.extendedProps?.description || '',
          location: event.extendedProps?.location || '',
          status,
          reminderMinutes: event.extendedProps?.reminderMinutes || 30,
          color: event.backgroundColor || event.extendedProps?.color || '#1890FF',
          start: event.start,
          end: event.end,
          therapistId: event.extendedProps?.therapistId
        };
      }
      
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
