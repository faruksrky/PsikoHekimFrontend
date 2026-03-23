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
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { useNavigate } from 'react-router-dom';

import { paths } from 'src/routes/paths';
import { CONFIG } from 'src/config-global';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Form, Field } from 'src/components/hook-form';

import { axiosInstance } from 'src/utils/axios';
import { getTherapistId, getEmailFromToken } from 'src/auth/context/jwt/action';
import { useAuth } from 'src/hooks/useAuth';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const createEventSchema = (isAdmin) =>
  zod.object({
    therapistId: isAdmin ? zod.string().min(1, 'Danışman seçimi gereklidir') : zod.string().optional(),
    patientId: zod.string().optional(),
    scheduledDate: zod.any().refine((val) => val && dayjs(val).isValid(), {
      message: 'Geçerli bir tarih ve saat seçiniz!'
    }),
    sessionType: zod.enum(['INDIVIDUAL', 'GROUP', 'COUPLE', 'FAMILY']).default('INDIVIDUAL'),
    sessionDuration: zod.enum(['FULL', 'HALF']).default('FULL'),
    sessionFormat: zod.enum(['IN_PERSON', 'ONLINE']).default('IN_PERSON'),
    sessionFee: zod.preprocess(
      (v) => (v === '' || v == null ? undefined : (Number.isNaN(Number(v)) ? undefined : Number(v))),
      zod.number().min(0).optional()
    ),
    notes: zod.string().optional().default(''),
  });

// ----------------------------------------------------------------------

export function CalendarForm({ currentEvent, colorOptions, onClose }) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const adminMode = isAdmin();
  const { user } = useAuthContext();
  const [patients, setPatients] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [therapistId, setTherapistId] = useState(null);

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(createEventSchema(adminMode)),
    defaultValues: {
      therapistId: currentEvent?.therapistId ? String(currentEvent.therapistId) : '',
      patientId: currentEvent?.patientId || '',
      scheduledDate: currentEvent?.scheduledDate ? dayjs(currentEvent.scheduledDate) : undefined,
      sessionType: currentEvent?.sessionType || 'INDIVIDUAL',
      sessionDuration: currentEvent?.sessionDuration || 'FULL',
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

  // currentEvent değiştiğinde formu güncelle (düzenleme modunda)
  useEffect(() => {
    if (currentEvent) {
      const st = currentEvent.sessionType;
      const sd = currentEvent.sessionDuration;
      const sf = currentEvent.sessionFormat;
      reset({
        therapistId: currentEvent.therapistId ? String(currentEvent.therapistId) : '',
        patientId: currentEvent.patientId ? String(currentEvent.patientId) : '',
        scheduledDate: currentEvent.scheduledDate || currentEvent.start ? dayjs(currentEvent.scheduledDate || currentEvent.start) : undefined,
        sessionType: ['INDIVIDUAL', 'GROUP', 'COUPLE', 'FAMILY'].includes(st) ? st : 'INDIVIDUAL',
        sessionDuration: ['FULL', 'HALF'].includes(sd) ? sd : 'FULL',
        sessionFormat: ['IN_PERSON', 'ONLINE'].includes(sf) ? sf : 'IN_PERSON',
        sessionFee: currentEvent.sessionFee || '',
        notes: currentEvent.notes || '',
      });
    }
  }, [currentEvent, reset]);

  // Danışman listesini getir (admin için)
  const fetchTherapists = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('jwt_access_token');
      const url = CONFIG.therapistListUrl || `${CONFIG.psikoHekimBaseUrl}/therapist/all`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTherapists(data.therapists || []);
      }
    } catch (error) {
      console.error('Danışman listesi hatası:', error);
      toast.error('Danışman listesi alınamadı');
    }
  }, []);

  // Hasta listesini getir: Admin = tüm hastalar, Danışman = kendi danışanları
  const fetchPatients = useCallback(async (therapistIdParam) => {
    setLoadingPatients(true);
    try {
      const token = sessionStorage.getItem('jwt_access_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      let list = [];

      if (adminMode) {
        const response = await fetch(`${CONFIG.psikoHekimBaseUrl}/patient/all`, { headers });
        if (response.ok) {
          const data = await response.json();
          const raw = data?.patients || [];
          list = raw.map((p) => ({
            patientId: p.patientId,
            patientName: `${p.patientFirstName || ''} ${p.patientLastName || ''}`.trim() || 'Danışan',
          }));
        } else {
          toast.error('Hasta listesi alınamadı');
          setLoadingPatients(false);
          return;
        }
      } else if (therapistIdParam) {
        const response = await fetch(`${CONFIG.psikoHekimBaseUrl}/therapist-patient/${therapistIdParam}/patients`, { headers });
        if (response.ok) {
          const data = await response.json();
          list = data.data || [];
        } else {
          toast.error('Hasta listesi alınamadı');
        }
      }
      setPatients(list);
    } catch (error) {
      console.error('Hasta listesi hatası:', error);
      toast.error('Hasta listesi alınamadı');
    } finally {
      setLoadingPatients(false);
    }
  }, [adminMode]);

  useEffect(() => {
    const init = async () => {
      if (adminMode) {
        await fetchTherapists();
        fetchPatients(null);
      } else {
        try {
          const userInfo = getEmailFromToken();
          if (!userInfo?.email) {
            toast.error('Kullanıcı bilgisi bulunamadı');
            return;
          }
          const id = await getTherapistId(userInfo.email);
          setTherapistId(id);
          if (id) fetchPatients(id);
        } catch (error) {
          console.error('Therapist ID alınamadı:', error);
          toast.error('Danışman bilgisi alınamadı');
        }
      }
    };
    init();
  }, [adminMode, fetchTherapists, fetchPatients]);

  const onSubmit = handleSubmit(
    async (data) => {
    if (currentEvent?.sessionId) {
      // Düzenleme: mevcut session güncellenir (doğrudan API)
      const token = sessionStorage.getItem('jwt_access_token');
      const sessionRes = await fetch(`${CONFIG.psikoHekimBaseUrl}/therapy-sessions/getSession/${currentEvent.sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!sessionRes.ok) {
        toast.error('Randevu bilgisi alınamadı');
        return;
      }
      const sessionDataRes = await sessionRes.json();

      const requestBody = {
        newScheduledDate: dayjs(data.scheduledDate).format('YYYY-MM-DDTHH:mm:ss'),
        sessionType: data.sessionType,
        sessionDuration: data.sessionDuration,
        sessionFormat: data.sessionFormat,
        sessionFee: data.sessionFee ? parseFloat(data.sessionFee) : null,
        sessionFeeCurrency: 'TRY',
        sessionNotes: data.notes || '',
      };

      try {
        const response = await fetch(`${CONFIG.psikoHekimBaseUrl}/therapy-sessions/updateSession/${currentEvent.sessionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });

        if (response.ok) {
          toast.success('Randevu başarıyla güncellendi!');
          onClose();
          reset();
          if (typeof window.refreshCalendarEvents === 'function') {
            window.refreshCalendarEvents();
          }
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Randevu güncellenemedi');
        }
      } catch (error) {
        console.error('Randevu güncelleme hatası:', error);
        toast.error('Randevu güncellenirken bir hata oluştu');
      }
      return;
    }

    // Yeni randevu: Camunda/BPMN akışına gönder (Yeni Görüşme ile aynı)
    const effectiveTherapistId = adminMode ? Number(data.therapistId) : therapistId;
    if (!effectiveTherapistId) {
      toast.error('Danışman bilgisi bulunamadı');
      return;
    }
    const patientId = Number(data.patientId);
    if (!patientId) {
      toast.error('Hasta seçimi gereklidir');
      return;
    }
    const selectedPatient = patients.find((p) => p.patientId === patientId);
    if (!selectedPatient) {
      toast.error('Hasta bulunamadı');
      return;
    }

    const patientName = selectedPatient.patientName || 'Danışan';
    const bpmnRequest = {
      messageName: 'startTherapistAssignmentProcess',
      variables: {
        patientId: String(patientId),
        therapistId: String(effectiveTherapistId),
        scheduledDate: new Date(data.scheduledDate).toISOString(),
        sessionType: data.sessionType || 'INDIVIDUAL',
        sessionFormat: data.sessionFormat || 'IN_PERSON',
        processName: 'Randevu Onay Süreci',
        description: `${patientName} için randevu isteği`,
        startedBy: user?.displayName || user?.name || 'Sistem',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    try {
      await axiosInstance.post(CONFIG.bpmn.endpoints.assignTherapist, bpmnRequest);
      toast.success('Randevu isteği başarıyla gönderildi. Inbox\'tan onay bekleniyor.');
      onClose();
      reset();
      if (typeof window.refreshCalendarEvents === 'function') {
        window.refreshCalendarEvents();
      }
      navigate(paths.dashboard.inbox);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      toast.error(msg || 'Randevu isteği gönderilemedi');
    }
  },
    (errors) => {
      console.error('Form validasyon hataları:', errors);
      toast.error('Lütfen tüm gerekli alanları kontrol edin');
    }
  );

  const onDelete = useCallback(async () => {
    if (!currentEvent?.sessionId) return;

    try {
      const token = sessionStorage.getItem('jwt_access_token');
      const response = await fetch(`${CONFIG.psikoHekimBaseUrl}/therapy-sessions/deleteSession/${currentEvent.sessionId}`, {
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
          {/* Düzenleme: Hasta zaten randevuda - sadece göster. Yeni randevu: Hasta seç */}
          {currentEvent?.sessionId ? (
            <TextField
              label="Hasta"
              value={currentEvent?.patientName || currentEvent?.title || '—'}
              fullWidth
              disabled
              helperText="Randevu düzenlenirken hasta değiştirilemez"
              InputProps={{ readOnly: true }}
            />
          ) : (
            <>
              {adminMode && (
                <Field.Select name="therapistId" label="Danışman Seçimi">
                  {therapists.length === 0 ? (
                    <MenuItem disabled value="">Danışman listesi yükleniyor...</MenuItem>
                  ) : (
                    therapists.map((t) => (
                      <MenuItem key={t.therapistId} value={String(t.therapistId)}>
                        {t.therapistFirstName} {t.therapistLastName}
                      </MenuItem>
                    ))
                  )}
                </Field.Select>
              )}
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
            </>
          )}

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

          {/* Görüşme Tipi */}
          <Field.Select name="sessionType" label="Görüşme Tipi">
            <MenuItem value="INDIVIDUAL">Bireysel Görüşme</MenuItem>
            <MenuItem value="GROUP">Grup Görüşmesi</MenuItem>
            <MenuItem value="COUPLE">Çift Görüşmesi</MenuItem>
            <MenuItem value="FAMILY">Aile Görüşmesi</MenuItem>
          </Field.Select>

          {/* Görüşme Süresi */}
          <Field.Select name="sessionDuration" label="Görüşme Süresi">
            <MenuItem value="FULL">Tam Görüşme</MenuItem>
            <MenuItem value="HALF">Yarım Görüşme</MenuItem>
          </Field.Select>

          {/* Görüşme Formatı */}
          <Field.Select name="sessionFormat" label="Görüşme Formatı">
            <MenuItem value="IN_PERSON">Yüz Yüze</MenuItem>
            <MenuItem value="ONLINE">Online</MenuItem>
          </Field.Select>

          {/* Görüşme Ücreti - sadece admin görür/düzenler */}
          {adminMode && (
            <Field.Text name="sessionFee" label="Görüşme Ücreti (TL)" type="number" />
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