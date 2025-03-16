import Calendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import { useNavigate } from 'react-router-dom';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import trLocale from '@fullcalendar/core/locales/tr';
import interactionPlugin from '@fullcalendar/interaction';
import React, { useEffect, useState, useCallback } from 'react';

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

import { fDate, fIsAfter, fIsBetween } from 'src/utils/format-time';

// MUI Localization
import { DashboardContent } from 'src/layouts/dashboard';
import { CALENDAR_COLOR_OPTIONS } from 'src/_mock/_calendar';
import { updateEvent, useGetEvents } from 'src/actions/calendar';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { StyledCalendar } from '../styles';
import { useEvent } from '../hooks/use-event';
import { CalendarEdit } from '../calendar-edit';
import { CalendarForm } from '../calendar-form';
import { CONFIG } from '../../../config-global';
import { useCalendar } from '../hooks/use-calendar';
import { CalendarToolbar } from '../calendar-toolbar';
import { CalendarFilters } from '../calendar-filters';
import { CalendarFiltersResult } from '../calendar-filters-result';

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
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.calendar.events}`, {
          credentials: 'include',
        });

        const data = await response.json();
        
        if (data.success) {
          const formattedEvents = data.events.map((event) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            start: event.startTime,
            end: event.endTime,
            source: event.source,
            location: event.location,
            status: event.status,
          }));
          setEvents(formattedEvents);
        }
      } catch (error) {
        toast.error('Takvim verileri alınamadı');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const renderResults = (
    <CalendarFiltersResult
      filters={filters}
      totalResults={dataFiltered.length}
      sx={{ mb: { xs: 3, md: 5 } }}
    />
  );

  const flexProps = { flex: '1 1 auto', display: 'flex', flexDirection: 'column' };

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
            >
              Yeni Etkinlik
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={onOpenCalendarEdit}
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
              date={fDate(date)}
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
              select={onSelectRange}
              eventClick={onClickEvent}
              aspectRatio={3}
              eventDrop={(arg) => {
                onDropEvent(arg, updateEvent);
              }}
              eventResize={(arg) => {
                onResizeEvent(arg, updateEvent);
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
        open={openForm} // Bu ilk Dialog için doğru
        onClose={onCloseForm}
      >
        <DialogTitle sx={{ minHeight: 76 }}>
          {openForm && <> {currentEvent?.id ? 'Edit' : 'Add'} event</>}
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
