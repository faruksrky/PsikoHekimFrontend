import dayjs from 'dayjs';
import Calendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import { useNavigate } from 'react-router-dom';
import dayGridPlugin from '@fullcalendar/daygrid';
import React, { useState, useEffect } from 'react';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import trLocale from '@fullcalendar/core/locales/tr';
import interactionPlugin from '@fullcalendar/interaction';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { axiosInstance } from 'src/utils/axios';
import { fIsAfter, fIsBetween } from 'src/utils/format-time';

import { updateEvent } from 'src/actions/calendar';
// MUI Localization
import { DashboardContent } from 'src/layouts/dashboard';
import { CALENDAR_COLOR_OPTIONS } from 'src/_mock/_calendar';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { getTherapistId, getEmailFromToken } from 'src/auth/context/jwt/action';

import { StyledCalendar } from '../styles';
import { useEvent } from '../hooks/use-event';
import { CalendarEdit } from '../calendar-edit';
import { CalendarForm } from '../calendar-form';
import { useCalendar } from '../hooks/use-calendar';
import { CalendarToolbar } from '../calendar-toolbar';
import { CalendarFilters } from '../calendar-filters';
import { CalendarFiltersResult } from '../calendar-filters-result';

// ----------------------------------------------------------------------

// Therapy session status renkleri
const getSessionStatusColor = (status) => {
  switch (status) {
    case 'COMPLETED':
      return '#22c55e'; // Green
    case 'SCHEDULED':
      return '#3b82f6'; // Blue
    case 'IN_PROGRESS':
      return '#f59e0b'; // Amber
    case 'CANCELLED':
      return '#ef4444'; // Red
    case 'NO_SHOW':
      return '#6b7280'; // Gray
    case 'RESCHEDULED':
      return '#8b5cf6'; // Purple
    default:
      return '#3b82f6'; // Default blue
  }
};


// ----------------------------------------------------------------------

export function CalendarView() {
  const theme = useTheme();
  const navigate = useNavigate();

  const openFilters = useBoolean();
  // useGetEvents();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);

  const filters = useSetState({
    colors: [],
    startDate: null,
    endDate: null,
  });

  const dateError = fIsAfter(filters.state.startDate, filters.state.endDate);

  const {
    calendarRef,
    view,
    date,
    onDatePrev,
    onDateNext,
    onDateToday,
    onDropEvent,
    onChangeView,
    onSelectRange,
    onClickEvent,
    onClickCalendarEvent,
    onResizeEvent,
    onInitialView,
    openForm,
    onOpenForm,
    onCloseForm,
    openCalendarEdit,
    onOpenCalendarEdit,
    onCloseCalendarEdit,
    selectEventId,
    selectedRange,
    onClickEventInFilters,
  } = useCalendar();

  const currentEvent = useEvent(events, selectEventId, selectedRange, openForm, openCalendarEdit);

  /*
  useEffect(() => {
    onInitialView();
  }, [onInitialView]);
  */

  const canReset =
    filters.state.colors.length > 0 || (!!filters.state.startDate && !!filters.state.endDate);

  const dataFiltered = applyFilter({ inputData: events, filters: filters.state, dateError });

  useEffect(() => {
    // URL parameters'ı kontrol et (Google Calendar success callback için)
    const urlParams = new URLSearchParams(window.location.search);
    const syncSuccess = urlParams.get('sync');
    const authSuccess = urlParams.get('auth');
    
    if (syncSuccess === 'success') {
      toast.success("Google Calendar başarıyla senkronize edildi! (5 yeni, 2 güncellendi)")
      // URL'den parameter'ı temizle
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Calendar'ı yenile
      if (window.refreshCalendarEvents) {
        window.refreshCalendarEvents();
      } else {
        fetchEvents();
      }
    }
    
    if (authSuccess === 'success') {
      toast.success('Google Calendar yetkilendirmesi başarılı!');
      // URL'den parameter'ı temizle
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  useEffect(() => {
    // Takvimi yenilemek için global bir fonksiyon tanımlayalım
    window.refreshCalendarEvents = () => {
      fetchEvents();
    };

    // Global focus cleanup fonksiyonu
    const handleFocusCleanup = () => {
      const rootElement = document.getElementById('root');
      if (rootElement && rootElement.hasAttribute('aria-hidden')) {
        const {activeElement} = document;
        if (activeElement && activeElement.classList.contains('MuiButtonBase-root')) {
          activeElement.blur();
        }
      }
    };

    // Modal açıldığında focus cleanup
    if (openForm || openCalendarEdit) {
      setTimeout(handleFocusCleanup, 100);
    }

    // Component unmount olduğunda temizleyelim
    return () => {
      delete window.refreshCalendarEvents;
    };
  }, [openForm, openCalendarEdit]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('jwt_access_token');
      const userInfo = getEmailFromToken();
      
      if (!userInfo?.email) {
        console.error('Email bulunamadı');
        return;
      }

      if (userInfo.isAdmin) {
        setEvents([]);
        return;
      }

      const therapistId = await getTherapistId(userInfo.email);
      if (therapistId) {
        let allEvents = [];
        
        // Therapy sessions'ı çek
        const sessionsResponse = await axiosInstance.get(`/therapy-sessions/getSessions?therapistId=${therapistId.therapistId || therapistId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const sessionsData = sessionsResponse.data;
        
        if (sessionsData && Array.isArray(sessionsData) && sessionsData.length > 0) {
          const formattedSessions = sessionsData.map((session) => {
            // Tarihleri güvenli şekilde parse et
            let startDate;
            let endDate;
            try {
              startDate = session.scheduledDate ? new Date(session.scheduledDate) : new Date();
              endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 saat süre
              
              // Geçersiz tarih kontrolü
              if (Number.isNaN(startDate.getTime())) {
                startDate = new Date();
              }
              if (Number.isNaN(endDate.getTime())) {
                endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
              }
            } catch (error) {
              console.warn('Tarih parse hatası:', error);
              startDate = new Date();
              endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
            }
            
            return {
              id: `session_${session.sessionId}`,
              title: session.patient ? `${session.patient.patientName} ${session.patient.patientSurname}` : 'Seans',
              extendedProps: {
                sessionId: session.sessionId,
                assignmentId: session.assignmentId,
                patientId: session.patientId,
                therapistId: session.therapistId,
                sessionType: session.sessionType,
                sessionFormat: session.sessionFormat,
                status: session.status,
                sessionFee: session.sessionFee,
                notes: session.notes || '',
                patient: session.patient,
                therapist: session.therapist,
                type: 'session'
              },
              start: startDate,
              end: endDate,
              backgroundColor: getSessionStatusColor(session.status),
              borderColor: getSessionStatusColor(session.status),
              textColor: '#FFFFFF',
              display: 'block'
            };
          });
          allEvents = [...allEvents, ...formattedSessions];
        }

        setEvents(allEvents);
      }
      
    } catch (error) {
      console.error('Etkinlikler yüklenirken hata:', error);
      toast.error('Takvim bilgileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [navigate]);

  const renderResults = (
    <CalendarFiltersResult
      filters={filters}
      totalResults={dataFiltered.length}
      sx={{ mb: { xs: 3, md: 5 } }}
    />
  );

  const flexProps = { flex: '1 1 auto', display: 'flex', flexDirection: 'column' };

  const handleEventClick = (info) => {
    if (!info?.event) return;

    // Status değerini büyük harfe çevirelim
    const status = info.event.extendedProps?.status 
      ? info.event.extendedProps.status.toUpperCase() 
      : 'CONFIRMED';

    const clickedEvent = {
      id: String(info.event.id),
      title: info.event.title,
      description: info.event.extendedProps?.description || '',
      location: info.event.extendedProps?.location || 'Online Görüşme',
      start: dayjs(info.event.start),
      end: dayjs(info.event.end),
      color: info.event.backgroundColor || info.event.extendedProps?.color || '#1890FF',
      status,
      reminderMinutes: info.event.extendedProps?.reminderMinutes || 30,
      therapistId: info.event.extendedProps?.therapistId
    };
    
    onClickEvent(clickedEvent);
  };

  const handleDateSelect = (selectInfo) => {
    const startDate = new Date(selectInfo.start);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Bugünün başlangıcı

    if (startDate < today) {
      toast.error('Geçmiş tarihlere etkinlik eklenemez!');
      selectInfo.view.calendar.unselect(); // Seçimi temizle
      return;
    }

    // Geçerli tarih seçildi, normal işlemi devam ettir
    onSelectRange(selectInfo);
  };

  const handleDayCellDidMount = (arg) => {
    const cellDate = new Date(arg.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Bugünün başlangıcı

    if (cellDate < today) {
      // Geçmiş tarih hücresine tıklama event'i ekle
      arg.el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toast.error('Geçmiş tarihlere etkinlik eklenemez!');
      });
    }
  };

  return (
    <>
      <DashboardContent maxWidth="xl" sx={{ ...flexProps }}>
        <Stack
          heading="Takvim"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2} // Butonlar arasındaki mesafeyi ayarlar
          sx={{ mb: { xs: 3, md: 5 } }}
        >
          <Typography variant="h4">Takvim</Typography>
          <Stack direction="row" spacing={2}>
            {' '}
            {/* Butonları yan yana koymak için nested Stack */}
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={onOpenForm}
              onFocus={(e) => e.target.blur()}
              tabIndex={openForm || openCalendarEdit ? -1 : 0}
            >
              Yeni Etkinlik
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={onOpenCalendarEdit}
              onFocus={(e) => e.target.blur()}
              tabIndex={openForm || openCalendarEdit ? -1 : 0}
              sx={{
                backgroundColor: 'red', // Varsayılan kırmızı rengi
                '&:hover': {
                  backgroundColor: 'darkred', // Hover rengi (daha koyu kırmızı)
                },
              }}
            >
              Kişisel Takvim Ekle
            </Button>
          </Stack>
        </Stack>

        {canReset && renderResults}

        <Card sx={{ ...flexProps, minHeight: '50vh' }}>
          <StyledCalendar sx={{ ...flexProps, '.fc.fc-media-screen': { flex: '1 1 auto' } }}>
            <CalendarToolbar
              date={date}
              view={view}
              canReset={canReset}
              loading={loading}
              onNextDate={onDateNext}
              onPrevDate={onDatePrev}
              onToday={onDateToday}
              onChangeView={onChangeView}
              onOpenFilters={openFilters.onTrue}
            />



            <Calendar
              locale={trLocale}
              weekends
              editable
              droppable
              selectable
              rerenderDelay={10}
              allDayMaintainDuration
              eventResizableFromStart
              ref={calendarRef}
              initialDate={date}
              initialView={view}
              dayMaxEventRows={3}
              eventDisplay="block"
              events={events}
              headerToolbar={false}
              select={handleDateSelect}
              eventClick={handleEventClick}
              aspectRatio={3}
              selectConstraint={{
                start: new Date().toISOString().split('T')[0], // Bugünün tarihi
                end: '2100-12-31' // Çok uzak gelecek
              }}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
              eventDrop={(arg) => {
                onDropEvent(arg, updateEvent);
              }}
              eventResize={(arg) => {
                onResizeEvent(arg, updateEvent);
              }}
              dayCellDidMount={handleDayCellDidMount}
              eventContent={(arg) => {
                const {event} = arg;
                const extendedProps = event.extendedProps || {};
                
                
                return (
                  <div style={{ 
                    backgroundColor: arg.event.backgroundColor,
                    color: '#FFFFFF',
                    padding: '2px 5px',
                    borderRadius: '3px',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ fontWeight: 'bold' }}>{arg.timeText}</div>
                    <div style={{ 
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {extendedProps.patient ? 
                        `${extendedProps.patient.patientFirstName} ${extendedProps.patient.patientLastName}` : 
                        event.title
                      }
                    </div>
                  </div>
                );
              }}
              plugins={[
                listPlugin,
                dayGridPlugin,
                timelinePlugin,
                timeGridPlugin,
                interactionPlugin,
              ]}
            />
          </StyledCalendar>
        </Card>
      </DashboardContent>

      <Dialog
        fullWidth
        maxWidth="xs"
        open={openForm}
        onClose={onCloseForm}
        disableRestoreFocus={false}
        keepMounted={false}
        disablePortal={false}
        disableEnforceFocus={false}
        disableAutoFocus={false}
        hideBackdrop={false}
        slotProps={{
          backdrop: {
            timeout: 500,
            invisible: false
          }
        }}
      >
        <DialogTitle sx={{ minHeight: 76 }}>
          {selectedRange ? 'Yeni Randevu' : currentEvent?.id ? 'Randevuyu Düzenle' : 'Yeni Randevu'}
        </DialogTitle>
        <CalendarForm
          currentEvent={currentEvent}
          colorOptions={CALENDAR_COLOR_OPTIONS}
          onClose={onCloseForm}
        />
      </Dialog>

      <Dialog
        fullWidth
        maxWidth="xs"
        open={openCalendarEdit} // İkinci Dialog için `openCalendarEdit` kullanın
        onClose={onCloseCalendarEdit}
        disableRestoreFocus={false}
        keepMounted={false}
        disablePortal={false}
        disableEnforceFocus={false}
        disableAutoFocus={false}
        hideBackdrop={false}
        slotProps={{
          backdrop: {
            timeout: 500,
            invisible: false
          }
        }}
      >
        <DialogTitle
          sx={{
            minHeight: 76,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{openCalendarEdit && (currentEvent?.id ? 'Güncelle' : 'Takvim Ekle')}</span>

          {/* Sağ üst köşeye çarpı (X) ikonu */}
          <IconButton
            onClick={onCloseCalendarEdit} // Modalı kapatmak için
            sx={{
              color: '#757575', // Gri renk
              '&:hover': { color: '#333' }, // Hover olunca daha koyu gri
            }}
          >
            <Iconify icon="eva:close-fill" width={24} />
          </IconButton>
        </DialogTitle>

        <CalendarEdit
          currentEvent={currentEvent}
          colorOptions={CALENDAR_COLOR_OPTIONS}
          onClose={onCloseCalendarEdit}
        />
      </Dialog>

      <CalendarFilters
        events={events}
        filters={filters}
        canReset={canReset}
        dateError={dateError}
        open={openFilters.value}
        onClose={openFilters.onFalse}
        onClickEvent={onClickEventInFilters}
        colorOptions={CALENDAR_COLOR_OPTIONS}
      />
    </>
  );
}

function applyFilter({ inputData, filters, dateError }) {
  const { colors, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  inputData = stabilizedThis.map((el) => el[0]);

  if (colors.length) {
    inputData = inputData.filter((event) => colors.includes(event.color));
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((event) => fIsBetween(event.start, startDate, endDate));
    }
  }

  return inputData;
}
