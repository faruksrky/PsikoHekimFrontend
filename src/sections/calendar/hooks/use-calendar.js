import { useRef, useState, useCallback } from 'react';

import { useResponsive } from 'src/hooks/use-responsive';

// ----------------------------------------------------------------------

export function useCalendar() {
  const calendarRef = useRef(null);

  const calendarEl = calendarRef.current;

  const smUp = useResponsive('up', 'sm');

  const [date, setDate] = useState(new Date());

  const [openForm, setOpenForm] = useState(false);

  const [openCalendarEdit, setOpenCalendarEdit] = useState(false);

  const [selectEventId, setSelectEventId] = useState('');

  const [selectedRange, setSelectedRange] = useState(null);

  const [view, setView] = useState(smUp ? 'dayGridMonth' : 'listWeek');

  const onOpenForm = useCallback(() => {
    // Mevcut focus'lu elementi kaydet
    const {activeElement} = document;
    if (activeElement && activeElement.blur) {
      activeElement.blur();
    }
    setOpenForm(true);
  }, []);

  const onCloseForm = useCallback(() => {
    setOpenForm(false);
    setSelectedRange(null);
    setSelectEventId('');
    // Focus'u temizle ve root elementi kontrol et
    setTimeout(() => {
      const rootElement = document.getElementById('root');
      if (rootElement && rootElement.hasAttribute('aria-hidden')) {
        rootElement.removeAttribute('aria-hidden');
      }
      
      const {activeElement} = document;
      if (activeElement && activeElement.blur) {
        activeElement.blur();
      }
      
      // Tüm MUI button'ları kontrol et ve focus'u kaldır
      const buttons = document.querySelectorAll('button[class*="MuiButton"]');
      buttons.forEach(button => {
        if (button === document.activeElement) {
          button.blur();
        }
      });
    }, 150);
  }, []);

  const onOpenCalendarEdit= useCallback(() => {
    // Mevcut focus'lu elementi kaydet
    const {activeElement} = document;
    if (activeElement && activeElement.blur) {
      activeElement.blur();
    }
    setOpenCalendarEdit(true);
  }, []);

  const onCloseCalendarEdit = useCallback(() => {
    setOpenCalendarEdit(false);
    setSelectedRange(null);
    setSelectEventId('');
    // Focus'u temizle ve root elementi kontrol et
    setTimeout(() => {
      const rootElement = document.getElementById('root');
      if (rootElement && rootElement.hasAttribute('aria-hidden')) {
        rootElement.removeAttribute('aria-hidden');
      }
      
      const {activeElement} = document;
      if (activeElement && activeElement.blur) {
        activeElement.blur();
      }
      
      // Tüm MUI button'ları kontrol et ve focus'u kaldır
      const buttons = document.querySelectorAll('button[class*="MuiButton"]');
      buttons.forEach(button => {
        if (button === document.activeElement) {
          button.blur();
        }
      });
    }, 150);
  }, []);

  const onInitialView = useCallback(() => {

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      const newView = smUp ? 'dayGridMonth' : 'listWeek';
      calendarApi.changeView(newView);
      setView(newView);
    }
  }, [calendarEl, smUp]);

  const onChangeView = useCallback(
    (newView) => {
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();

        calendarApi.changeView(newView);
        setView(newView);
      }
    },
    [calendarEl]
  );

  const onDateToday = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.today();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onDatePrev = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.prev();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onDateNext = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.next();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onSelectRange = useCallback(
    (arg) => {
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();

        calendarApi.unselect();
      }

      onOpenForm();
      setSelectedRange({ start: arg.startStr, end: arg.endStr });
    },
    [calendarEl, onOpenForm]
  );

  const onClickEvent = useCallback((event) => {
    if (!event?.id) return; // Event ID'si yoksa return
    
    setSelectEventId(event.id);
    setOpenForm(true);
  }, []);

  const onClickCalendarEvent = useCallback(
    (arg) => {
      const { event } = arg;

      onOpenCalendarEdit();
      setSelectEventId(event.id);
    },
    [onOpenCalendarEdit]
  );

  const onResizeEvent = useCallback((arg, updateEvent) => {
    const { event } = arg;

    updateEvent({
      id: event.id,
      allDay: event.allDay,
      start: event.startStr,
      end: event.endStr,
    });
  }, []);

  const onDropEvent = useCallback((arg, updateEvent) => {
    const { event } = arg;

    updateEvent({
      id: event.id,
      allDay: event.allDay,
      start: event.startStr,
      end: event.endStr,
    });
  }, []);

  const onClickEventInFilters = useCallback(
    (eventId) => {
      if (eventId) {
        onOpenForm();
        setSelectEventId(eventId);
      }
    },
    [onOpenForm]
  );

  const onClickOpenCalendarEdit = useCallback(
    (eventId) => {
      if (eventId) {
        onOpenCalendarEdit(); // Formu aç
        setSelectEventId(eventId); // Seçilen eventin ID'sini ata
      }
    },
    [onOpenCalendarEdit]
  );
  

  return {
    calendarRef,
    //
    view,
    date,
    //
    onDatePrev,
    onDateNext,
    onDateToday,
    onDropEvent,
    onClickEvent,
    onChangeView,
    onSelectRange,
    onResizeEvent,
    onInitialView,
    //
    openForm,
    onOpenForm,
    onCloseForm,
    //
    openCalendarEdit,
    onOpenCalendarEdit,
    onCloseCalendarEdit,
    //
    selectEventId,
    selectedRange,
    //
    onClickEventInFilters

  };
}
