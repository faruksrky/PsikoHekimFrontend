import { z as zod } from 'zod';
import { useCallback, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';

import { uuidv4 } from 'src/utils/uuidv4';
import { fIsAfter } from 'src/utils/format-time';

import { createEvent, updateEvent, deleteEvent } from 'src/actions/calendar';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Form, Field } from 'src/components/hook-form';
import { ColorPicker } from 'src/components/color-utils';

// ----------------------------------------------------------------------

export const EventSchema = zod.object({
  title: zod.string().min(1, { message: 'Başlık gereklidir!' }),
  description: zod.string().min(1, { message: 'Açıklama gereklidir!' }),
  location: zod.string().optional().default(''),
  status: zod.enum(['CONFIRMED', 'TENTATIVE', 'CANCELLED']).default('CONFIRMED'),
  color: zod.string(),
  start: zod.any(),
  end: zod.any(),
  reminderMinutes: zod.number().min(0).max(1440).default(30),
});

// ----------------------------------------------------------------------

export function CalendarForm({ currentEvent, colorOptions, onClose }) {
  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(EventSchema),
    defaultValues: {
      title: currentEvent?.title || '',
      description: currentEvent?.description || '',
      location: currentEvent?.location || '',
      status: currentEvent?.status || 'CONFIRMED',
      color: currentEvent?.color || colorOptions[0],
      start: currentEvent?.start ? dayjs(currentEvent.start) : dayjs(),
      end: currentEvent?.end ? dayjs(currentEvent.end) : dayjs().add(1, 'hour'),
      reminderMinutes: currentEvent?.reminderMinutes || 30,
    },
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const dateError = fIsAfter(values.start, values.end);

  useEffect(() => {
    if (currentEvent) {
      methods.reset({
        title: currentEvent.title || '',
        description: currentEvent.description || '',
        location: currentEvent.location || '',
        status: currentEvent.status || 'CONFIRMED',
        color: currentEvent.color || colorOptions[0],
        start: currentEvent.start ? dayjs(currentEvent.start) : dayjs(),
        end: currentEvent.end ? dayjs(currentEvent.end) : dayjs().add(1, 'hour'),
        reminderMinutes: currentEvent.reminderMinutes || 30,
      });
    }
  }, [currentEvent, colorOptions, methods]);

  const onSubmit = handleSubmit(async (data) => {
    const eventData = {
      id: currentEvent?.id ? currentEvent?.id : uuidv4(),
      title: data.title || '',
      description: data.description || '',
      location: data.location || '',
      status: data.status || 'CONFIRMED',
      color: data.color || colorOptions[0],
      reminderMinutes: Number(data.reminderMinutes || 30),
      start: data.start,
      end: data.end,
    };

    try {
      if (!dateError) {
        let result;
        if (currentEvent?.id) {
          result = await updateEvent(eventData);
          if (result) {
            toast.success('Etkinlik başarıyla güncellendi!');
            onClose();
            reset();
            if (typeof window.refreshCalendarEvents === 'function') {
              window.refreshCalendarEvents();
            }
          }
        } else {
          result = await createEvent(eventData);
          if (result) {
            toast.success('Etkinlik başarıyla eklendi!');
            onClose();
            reset();
            if (typeof window.refreshCalendarEvents === 'function') {
              window.refreshCalendarEvents();
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('İşlem sırasında bir hata oluştu');
    }
  });

  const onDelete = useCallback(async () => {
    try {
      const result = await deleteEvent(currentEvent?.id);
      if (result) {
        toast.success('Etkinlik başarıyla silindi!');
        onClose();
        if (typeof window.refreshCalendarEvents === 'function') {
          window.refreshCalendarEvents();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Etkinlik silinirken bir hata oluştu');
    }
  }, [currentEvent?.id, onClose]);

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Scrollbar sx={{ p: 3, bgcolor: 'background.neutral' }}>
        <Stack spacing={3}>
          <Field.Text name="title" label="Başlık" />

          <Field.Text name="description" label="Açıklama" multiline rows={3} />

          <Field.Text name="location" label="Konum" />

          <Field.Select name="status" label="Durum">
            <MenuItem value="CONFIRMED">Onaylandı</MenuItem>
            <MenuItem value="TENTATIVE">Geçici</MenuItem>
            <MenuItem value="CANCELLED">İptal Edildi</MenuItem>
          </Field.Select>

          <Field.MobileDateTimePicker 
            name="start" 
            label="Başlangıç Tarihi"
            format="DD/MM/YYYY HH:mm"
          />

          <Field.MobileDateTimePicker
            name="end"
            label="Bitiş Tarihi"
            format="DD/MM/YYYY HH:mm"
            slotProps={{
              textField: {
                error: dateError,
                helperText: dateError ? 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır' : null,
              },
            }}
          />

          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <ColorPicker
                selected={field.value}
                onSelectColor={(color) => field.onChange(color)}
                colors={colorOptions}
              />
            )}
          />
        </Stack>
      </Scrollbar>

      <DialogActions sx={{ flexShrink: 0 }}>
        {!!currentEvent?.id && (
          <Tooltip title="Etkinliği Sil">
            <IconButton onClick={onDelete}>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={onClose}>
          İptal
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          disabled={dateError}
        >
          {currentEvent?.id ? 'Güncelle' : 'Ekle'}
        </LoadingButton>
      </DialogActions>
    </Form>
  );
}