import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { CONFIG } from 'src/config-global';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Form, Field } from 'src/components/hook-form';

import { getTherapistId, getEmailFromToken } from 'src/auth/context/jwt/action';
import { useAuth } from 'src/hooks/useAuth';

// ----------------------------------------------------------------------

export const EventSchema = zod.object({
  patientId: zod.string().min(1, { message: 'Hasta seçimi gereklidir!' }),
  scheduledDate: zod.any().refine((val) => val && dayjs(val).isValid(), {
    message: 'Geçerli bir tarih ve saat seçiniz!'
  }),
  sessionType: zod.enum(['INITIAL', 'REGULAR', 'FOLLOWUP', 'FINAL']).default('REGULAR'),
  sessionFormat: zod.enum(['IN_PERSON', 'ONLINE', 'PHONE']).default('IN_PERSON'),
  sessionFee: zod.number().min(0).optional(),
  notes: zod.string().optional().default(''),
});

// ----------------------------------------------------------------------

export function CalendarForm({ currentEvent, colorOptions, onClose }) {
  const { isAdmin } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [therapistId, setTherapistId] = useState(null);

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(EventSchema),
    defaultValues: {
      patientId: currentEvent?.patientId || '',
      scheduledDate: currentEvent?.scheduledDate ? dayjs(currentEvent.scheduledDate) : undefined,
      sessionType: currentEvent?.sessionType || 'REGULAR',
      sessionFormat: currentEvent?.sessionFormat || 'IN_PERSON',
      sessionFee: currentEvent?.sessionFee || '',
      notes: currentEvent?.notes || '',
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

  // Therapist ID'yi al ve hasta listesini çek
  useEffect(() => {
    const fetchTherapistId = async () => {
      try {
        const userInfo = getEmailFromToken();
        if (!userInfo?.email) {
          toast.error('Kullanıcı bilgisi bulunamadı');
          return;
        }
        
        const id = await getTherapistId(userInfo.email);
        setTherapistId(id);
        if (id) {
          fetchPatients(id);
        }
      } catch (error) {
        console.error('Therapist ID alınamadı:', error);
        toast.error('Terapist bilgisi alınamadı');
      }
    };

    fetchTherapistId();
  }, []);

  // Hasta listesini getir
  const fetchPatients = async (therapistIdParam) => {
    setLoadingPatients(true);
    try {
      const token = sessionStorage.getItem('jwt_access_token');
      const response = await fetch(`${CONFIG.psikoHekimBaseUrl}/therapist-patient/${therapistIdParam}/patients`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data.data || []);
      } else {
        toast.error('Hasta listesi alınamadı');
      }
    } catch (error) {
      console.error('Hasta listesi hatası:', error);
      toast.error('Hasta listesi alınamadı');
    } finally {
      setLoadingPatients(false);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    
    if (!therapistId) {
      toast.error('Terapist bilgisi bulunamadı');
      return;
    }

    // patientId'yi number'a çevir ve assignmentId'yi bul
    const patientId = Number(data.patientId);
    const selectedPatient = patients.find(p => p.patientId === patientId);
    const assignmentId = selectedPatient?.assignmentId;
    
    
    if (!assignmentId) {
      toast.error('Hasta ataması bulunamadı');
      return;
    }

    const sessionData = {
      assignmentId,
      scheduledDate: dayjs(data.scheduledDate).format('YYYY-MM-DDTHH:mm:ss'),
      sessionType: data.sessionType,
      sessionFormat: data.sessionFormat,
      sessionFee: data.sessionFee ? parseFloat(data.sessionFee) : null,
      notes: data.notes || '',
    };

    try {
      const token = sessionStorage.getItem('jwt_access_token');
      const url = currentEvent?.sessionId 
        ? `${CONFIG.psikoHekimBaseUrl}/therapy-sessions/${currentEvent.sessionId}`
        : `${CONFIG.psikoHekimBaseUrl}/therapy-sessions/addSession`;

      const method = currentEvent?.sessionId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sessionData)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(currentEvent?.sessionId ? 'Randevu başarıyla güncellendi!' : 'Randevu başarıyla oluşturuldu!');
        onClose();
        reset();
        if (typeof window.refreshCalendarEvents === 'function') {
          window.refreshCalendarEvents();
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Randevu kaydedilemedi');
      }
    } catch (error) {
      console.error('Randevu kaydetme hatası:', error);
      toast.error('Randevu kaydedilirken bir hata oluştu');
    }
  });

  const onDelete = useCallback(async () => {
    if (!currentEvent?.sessionId) return;

    try {
      const token = sessionStorage.getItem('jwt_access_token');
      const response = await fetch(`${CONFIG.psikoHekimBaseUrl}/therapy-sessions/${currentEvent.sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Randevu başarıyla silindi!');
        onClose();
        if (typeof window.refreshCalendarEvents === 'function') {
          window.refreshCalendarEvents();
        }
      } else {
        toast.error('Randevu silinemedi');
      }
    } catch (error) {
      console.error('Randevu silme hatası:', error);
      toast.error('Randevu silinirken bir hata oluştu');
    }
  }, [currentEvent?.sessionId, onClose]);

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Scrollbar sx={{ p: 3, bgcolor: 'background.neutral' }}>
        <Stack spacing={3}>
          {/* Hasta Seçimi */}
          <Field.Select 
            name="patientId" 
            label="Hasta Seçimi"
            disabled={loadingPatients}
            InputProps={{
              endAdornment: loadingPatients ? <CircularProgress size={20} /> : null
            }}
          >
            {patients.length === 0 ? (
              <MenuItem disabled value="">
                {loadingPatients ? 'Hastalar yükleniyor...' : 'Hasta bulunamadı'}
              </MenuItem>
            ) : (
              patients.map((patient, index) => (
                <MenuItem key={patient.patientId || `patient-${index}`} value={String(patient.patientId)}>
                  {patient.patientName}
                </MenuItem>
              ))
            )}
          </Field.Select>


          {/* Randevu Tarihi ve Saati */}
          <Field.MobileDateTimePicker 
            name="scheduledDate" 
            label="Randevu Tarihi ve Saati"
            format="DD/MM/YYYY HH:mm"
            disablePast
            slotProps={{
              textField: {
                helperText: 'Geçmiş tarihler seçilemez',
                placeholder: "Tarih ve saat seçin"
              },
            }}
          />

          {/* Seans Türü */}
          <Field.Select name="sessionType" label="Seans Türü">
            <MenuItem value="INITIAL">İlk Seans</MenuItem>
            <MenuItem value="REGULAR">Normal Seans</MenuItem>
            <MenuItem value="FOLLOWUP">Takip Seansı</MenuItem>
            <MenuItem value="FINAL">Son Seans</MenuItem>
          </Field.Select>

          {/* Seans Formatı */}
          <Field.Select name="sessionFormat" label="Seans Formatı">
            <MenuItem value="IN_PERSON">Yüz Yüze</MenuItem>
            <MenuItem value="ONLINE">Online</MenuItem>
            <MenuItem value="PHONE">Telefon</MenuItem>
          </Field.Select>

          {/* Seans Ücreti - sadece admin görür/düzenler */}
          {isAdmin() && (
            <Field.Text name="sessionFee" label="Seans Ücreti (TL)" type="number" />
          )}

          {/* Notlar */}
          <Field.Text name="notes" label="Notlar" multiline rows={3} />
        </Stack>
      </Scrollbar>

      <DialogActions sx={{ flexShrink: 0 }}>
        {!!currentEvent?.sessionId && (
          <Tooltip title="Randevuyu Sil">
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
        >
          {currentEvent?.sessionId ? 'Güncelle' : 'Randevu Oluştur'}
        </LoadingButton>
      </DialogActions>
    </Form>
  );
}