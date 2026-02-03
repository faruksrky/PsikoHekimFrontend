import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import {
  Card,
  Grid,
  Stack,
  Alert,
  Button,
  MenuItem,
  Typography,
  InputAdornment,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { CONFIG } from 'src/config-global';
import { axiosInstanceBpmn } from 'src/utils/axios';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { useAuthContext } from 'src/auth/hooks';
import { useGetPatient } from 'src/actions/patient';
import { CURRENCY_OPTIONS, getCurrencySymbol } from '../therapist/therapist-new-edit-form';

// ----------------------------------------------------------------------

export function TherapySessionNewEditForm({ currentSession }) {
  const router = useRouter();
  const location = useLocation();
  const requestMode = location.state?.mode === 'request';
  const requestPatientId = location.state?.patientId;
  const { user } = useAuthContext();
  const { patient: requestPatient, patientLoading: requestPatientLoading } = useGetPatient(requestPatientId);

  const loadingSave = useBoolean();
  const loadingSaveAndSend = useBoolean();

  const NewSessionSchema = Yup.object().shape({
    therapistId: Yup.mixed().required('Danışman seçimi gereklidir'),
    patientId: Yup.mixed().required('Hasta seçimi gereklidir'),
    scheduledDate: Yup.date()
      .required('Randevu tarihi gereklidir')
      .test('future-date', 'Randevu tarihi en az 2 saat sonra olmalıdır', (value) => {
        // Sadece yeni seans oluştururken tarih kontrolü yap
        if (currentSession) return true; // Güncelleme sırasında kontrol etme
        
        if (!value) return false;
        const now = new Date();
        const minDate = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 saat sonra
        return value > minDate;
      }),
    sessionType: Yup.string().required('Seans tipi gereklidir'),
    sessionFormat: Yup.string().required('Seans formatı gereklidir'),
    sessionFee: Yup.number().min(0, 'Ücret 0 veya daha fazla olmalıdır').required('Seans ücreti gereklidir'),
    sessionFeeCurrency: Yup.string().optional().default('TRY'),
    sessionNotes: Yup.string(),
    homeworkAssigned: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      therapistId: '',
      patientId: '',
      scheduledDate: currentSession?.scheduledDate 
        ? new Date(currentSession.scheduledDate) 
        : new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 saat sonra
      sessionType: currentSession?.sessionType || 'INDIVIDUAL',
      sessionFormat: currentSession?.sessionFormat || 'IN_PERSON',
      sessionFee: currentSession?.sessionFee || 500,
      sessionFeeCurrency: currentSession?.sessionFeeCurrency || 'TRY',
      sessionNotes: currentSession?.sessionNotes || '',
      homeworkAssigned: currentSession?.homeworkAssigned || '',
    }),
    [currentSession]
  );

  const methods = useForm({
    resolver: yupResolver(NewSessionSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting, errors, isValid },
    setValue,
    watch,
  } = methods;

  // Therapist-Patient assignments state
  const [therapistPatientAssignments, setTherapistPatientAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  // Therapist ve patient state'leri
  const [therapists, setTherapists] = useState([]);
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [loadingTherapists, setLoadingTherapists] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [requestPatientOption, setRequestPatientOption] = useState(null);

  useEffect(() => {
    const fetchTherapists = async () => {
      setLoadingTherapists(true);
      try {
        const token = sessionStorage.getItem('jwt_access_token');
        
        const response = await fetch(`${CONFIG.therapistListUrl}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTherapists(data.therapists || []);
        } else {
          console.error('Failed to fetch therapists, status:', response.status);
          const errorText = await response.text();
          console.error('Error response:', errorText);
          setTherapists([]);
        }
      } catch (error) {
        console.error('Error fetching therapists:', error);
        toast.error('Danışman listesi yüklenemedi');
        setTherapists([]);
      } finally {
        setLoadingTherapists(false);
        setDataLoaded(true);
      }
    };

    fetchTherapists();
  }, []);

  const handleTherapistChange = useCallback(async (therapistId) => {
    if (!therapistId || therapistId === '') {
      setAssignedPatients([]);
      // Clear patient selection when therapist is cleared
      setValue('patientId', '');
      // Clear session fee when therapist is cleared
      setValue('sessionFee', 500);
      setValue('sessionFeeCurrency', 'TRY');
      return;
    }

    // Otomatik olarak seans ücretini ve para birimini danışmanın ücretinden doldur
    const selectedTherapist = therapists.find(t => t.therapistId === parseInt(therapistId, 10));
    if (selectedTherapist && selectedTherapist.therapistConsultantFee) {
      setValue('sessionFee', selectedTherapist.therapistConsultantFee);
      setValue('sessionFeeCurrency', selectedTherapist.therapistConsultantFeeCurrency || 'TRY');
    } else if (selectedTherapist && selectedTherapist.therapistAppointmentFee) {
      // Eğer consultantFee yoksa, appointmentFee'yi kullan (geriye dönük uyumluluk)
      setValue('sessionFee', selectedTherapist.therapistAppointmentFee);
      setValue('sessionFeeCurrency', selectedTherapist.therapistAppointmentFeeCurrency || 'TRY');
    }

    if (requestMode) {
      return;
    }

    setLoadingPatients(true);
    try {
      const token = sessionStorage.getItem('jwt_access_token');
      const response = await fetch(`${CONFIG.therapistPatientPatientsUrl}/${parseInt(therapistId, 10)}/patients`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        // Backend'den gelen data array'ini kullan
        setAssignedPatients(responseData.data || []);
      } else {
        console.error('Failed to fetch assigned patients');
        setAssignedPatients([]);
      }
    } catch (error) {
      console.error('Error fetching assigned patients:', error);
      toast.error('Danışan listesi yüklenemedi');
      setAssignedPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  }, [requestMode, setValue, therapists]);

  // Watch therapist change
  const watchedTherapistId = methods.watch('therapistId');
  useEffect(() => {
    if (watchedTherapistId && dataLoaded) {
      handleTherapistChange(watchedTherapistId);
    }
  }, [watchedTherapistId, dataLoaded, handleTherapistChange]);

  useEffect(() => {
    if (requestMode && requestPatientId) {
      setValue('patientId', String(requestPatientId));
      const patientName = requestPatient
        ? `${requestPatient.patientFirstName} ${requestPatient.patientLastName}`
        : `#${requestPatientId}`;
      setRequestPatientOption({ patientId: requestPatientId, patientName });
    }
  }, [requestMode, requestPatientId, requestPatient, setValue]);

  // Reset form when data is loaded and currentSession changes
  useEffect(() => {
    if (dataLoaded && currentSession) {
      // First, check if the therapist exists in the loaded options
      const therapistExists = therapists.some(t => t.therapistId === currentSession.therapistId);
      
      if (therapistExists) {
        // If therapist exists, load their patients first
        handleTherapistChange(currentSession.therapistId);
      } else {
        // If therapist doesn't exist, set form without therapist and patient
        reset({
          therapistId: '',
          patientId: '',
          scheduledDate: currentSession.scheduledDate 
            ? new Date(currentSession.scheduledDate) 
            : new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 saat sonra
          sessionType: currentSession.sessionType || 'INDIVIDUAL',
          sessionFormat: currentSession.sessionFormat || 'IN_PERSON',
          sessionFee: currentSession.sessionFee || 500,
          sessionFeeCurrency: currentSession.sessionFeeCurrency || 'TRY',
          sessionNotes: currentSession.sessionNotes || '',
          homeworkAssigned: currentSession.homeworkAssigned || '',
        });
      }
    }
  }, [currentSession, dataLoaded, therapists, reset, handleTherapistChange]);

  // Set form values after patient data is loaded for editing
  useEffect(() => {
    if (dataLoaded && currentSession && !loadingPatients && assignedPatients.length > 0) {
      const patientExists = assignedPatients.some(p => p.patientId === currentSession.patientId);
      const therapistExists = therapists.some(t => t.therapistId === currentSession.therapistId);
      
      if (therapistExists) {
        reset({
          therapistId: String(currentSession.therapistId),
          patientId: patientExists ? String(currentSession.patientId) : '',
          scheduledDate: currentSession.scheduledDate 
            ? new Date(currentSession.scheduledDate) 
            : new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 saat sonra
          sessionType: currentSession.sessionType || 'INDIVIDUAL',
          sessionFormat: currentSession.sessionFormat || 'IN_PERSON',
          sessionFee: currentSession.sessionFee || 500,
          sessionFeeCurrency: currentSession.sessionFeeCurrency || 'TRY',
          sessionNotes: currentSession.sessionNotes || '',
          homeworkAssigned: currentSession.homeworkAssigned || '',
        });
      }
    }
  }, [currentSession, dataLoaded, loadingPatients, assignedPatients, therapists, reset]);

  const sessionTypeOptions = [
    { value: 'INDIVIDUAL', label: 'Bireysel Terapi' },
    { value: 'GROUP', label: 'Grup Terapisi' },
    { value: 'COUPLE', label: 'Çift Terapisi' },
    { value: 'FAMILY', label: 'Aile Terapisi' },
  ];

  const sessionFormatOptions = [
    { value: 'IN_PERSON', label: 'Yüz Yüze' },
    { value: 'ONLINE', label: 'Online' },
    { value: 'PHONE', label: 'Telefon' },
  ];

  const handleSaveAsDraft = handleSubmit(async (data) => {
    loadingSave.onTrue();
    try {
      // Backend'e taslak olarak gönder (şimdilik normal API'yi kullan)
      await createSession(data, true);
      toast.success('Seans taslağı başarıyla kaydedildi!');
      router.push(paths.dashboard.therapySession.list);
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error(`Seans kaydedilirken hata oluştu: ${error.message}`);
    } finally {
      loadingSave.onFalse();
    }
  });

  const handleCreateAndSchedule = handleSubmit(async (data) => {
    loadingSaveAndSend.onTrue();
    try {
      if (currentSession) {
        // Update existing session
        await updateSession(currentSession.sessionId, data);
        toast.success('Seans başarıyla güncellendi!');
      } else {
        if (requestMode) {
          await requestAppointment(data);
          toast.success('Randevu isteği doktora gönderildi. Onay bekleniyor.');
          router.push(paths.dashboard.inbox);
          return;
        }

        // Create new session with WhatsApp/Twilio notification
        await createSessionWithNotification(data);
        toast.success('Seans oluşturuldu! Hasta ve danışmana WhatsApp bildirimi gönderildi. Hasta onayını bekliyoruz...');
      }
      
      router.push(paths.dashboard.therapySession.list);
    } catch (error) {
      console.error('Error creating/updating session:', error);
      toast.error(`Seans işlemi sırasında hata oluştu: ${error.message}`);
    } finally {
      loadingSaveAndSend.onFalse();
    }
  });

  const updateSession = async (sessionId, sessionData) => {
    try {
      const token = sessionStorage.getItem('jwt_access_token');
      
      // Update request body
      const requestBody = {
        newScheduledDate: new Date(sessionData.scheduledDate).toISOString().slice(0, 19),
        sessionFee: parseFloat(sessionData.sessionFee) || 0,
        sessionFeeCurrency: sessionData.sessionFeeCurrency || 'TRY',
        sessionType: sessionData.sessionType || 'INDIVIDUAL',
        sessionFormat: sessionData.sessionFormat || 'IN_PERSON',
        sessionNotes: sessionData.sessionNotes || '',
        therapistNotes: '', // Boş bırakıyoruz
        homeworkAssigned: sessionData.homeworkAssigned || ''
      };

      const response = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.update}/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = 'Seans güncellenemedi';
        try {
          if (responseText && responseText.trim().startsWith('{')) {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          } else {
            errorMessage = responseText || errorMessage;
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
          errorMessage = responseText || response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return responseText ? JSON.parse(responseText) : null;
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  };

  const requestAppointment = async (sessionData) => {
    const patientId = requestPatientId || sessionData.patientId;
    if (!patientId) {
      throw new Error('Hasta bilgisi bulunamadı');
    }
    if (!sessionData.therapistId) {
      throw new Error('Danışman seçimi gereklidir');
    }
    if (!sessionData.scheduledDate) {
      throw new Error('Randevu tarihi gereklidir');
    }

    const bpmnRequest = {
      messageName: 'startTherapistAssignmentProcess',
      variables: {
        patientId,
        therapistId: sessionData.therapistId,
        scheduledDate: new Date(sessionData.scheduledDate).toISOString(),
        sessionType: sessionData.sessionType,
        sessionFormat: sessionData.sessionFormat || 'IN_PERSON',
        processName: 'Randevu Onay Süreci',
        description: `${requestPatient?.patientFirstName || ''} ${requestPatient?.patientLastName || ''}`.trim()
          ? `${requestPatient.patientFirstName} ${requestPatient.patientLastName} için randevu isteği`
          : 'Randevu isteği',
        startedBy: user?.displayName || 'Sistem',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    await axiosInstanceBpmn.post(CONFIG.bpmn.endpoints.assignTherapist, bpmnRequest);
  };

  const createSessionWithNotification = async (sessionData) => {
    try {
      const token = sessionStorage.getItem('jwt_access_token');
      
      // Önce atama bilgisini kontrol et
      const assignmentResponse = await fetch(`${CONFIG.therapistPatientPatientsUrl}/${parseInt(sessionData.therapistId, 10)}/patients`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!assignmentResponse.ok) {
        throw new Error('Atama bilgisi alınamadı');
      }

      const assignmentData = await assignmentResponse.json();
      const assignment = assignmentData.data.find(a => a.patientId === parseInt(sessionData.patientId, 10));

      if (!assignment) {
        throw new Error('Seçilen danışan için atama bulunamadı');
      }

      // Seans oluştur ve WhatsApp/Twilio bildirimi gönder
      const requestBody = {
        assignmentId: assignment.assignmentId,
        scheduledDate: new Date(sessionData.scheduledDate).toISOString().slice(0, 19),
        sessionFee: parseFloat(sessionData.sessionFee) || 0,
        sessionFeeCurrency: sessionData.sessionFeeCurrency || 'TRY',
        sessionType: sessionData.sessionType || 'REGULAR',
        sessionFormat: sessionData.sessionFormat || 'IN_PERSON',
        notes: sessionData.sessionNotes || '',
        // WhatsApp/Twilio notification flags
        sendNotification: true,
        notificationType: 'WHATSAPP_TWILIO', // WhatsApp ve Twilio ile bildirim
        requirePatientApproval: true // Hasta onayı gerekli
      };

      console.log('Creating session with notification:', requestBody);

      const response = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.create}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = 'Seans oluşturulamadı';
        try {
          if (responseText && responseText.trim().startsWith('{')) {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          } else {
            errorMessage = responseText || errorMessage;
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
          errorMessage = responseText || response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return responseText ? JSON.parse(responseText) : null;
    } catch (error) {
      console.error('Error creating session with notification:', error);
      throw error;
    }
  };

  const createSession = async (sessionData, isDraft = false) => {
    try {
      const token = sessionStorage.getItem('jwt_access_token');
      
      // Önce atama bilgisini kontrol et
      const assignmentResponse = await fetch(`${CONFIG.therapistPatientPatientsUrl}/${parseInt(sessionData.therapistId, 10)}/patients`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!assignmentResponse.ok) {
        throw new Error('Atama bilgisi alınamadı');
      }

      const assignmentData = await assignmentResponse.json();
      const assignment = assignmentData.data.find(a => a.patientId === parseInt(sessionData.patientId, 10));

      if (!assignment) {
        throw new Error('Seçilen danışan için atama bulunamadı');
      }

      // Seans oluştur
      const requestBody = {
        assignmentId: assignment.assignmentId,
        scheduledDate: new Date(sessionData.scheduledDate).toISOString().slice(0, 19),
        sessionFee: parseFloat(sessionData.sessionFee) || 0,
        sessionFeeCurrency: sessionData.sessionFeeCurrency || 'TRY',
        sessionType: sessionData.sessionType || 'REGULAR',
        sessionFormat: sessionData.sessionFormat || 'IN_PERSON',
        notes: sessionData.sessionNotes || ''
      };

      try {
        const response = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.create}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const responseText = await response.text();

        if (!response.ok) {
          let errorMessage = 'Seans oluşturulamadı';
          try {
            if (responseText && responseText.trim().startsWith('{')) {
              // JSON response
              const errorData = JSON.parse(responseText);
              errorMessage = errorData.message || errorMessage;
            } else {
              // Plain text response
              errorMessage = responseText || errorMessage;
            }
          } catch (e) {
            console.error('Error parsing error response:', e);
            errorMessage = responseText || response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        return responseText ? JSON.parse(responseText) : null;
      } catch (error) {
        console.error('Session creation error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  return (
    <Form methods={methods}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Typography variant="h6">
            {currentSession ? 'Seans Düzenle' : 'Yeni Seans Oluştur'}
          </Typography>

          <Alert severity="info">
            Seans oluşturduktan sonra danışan ve danışmana bildirim gönderilecektir.
          </Alert>
        </Stack>
      </Card>

      {!dataLoaded ? (
        <Card sx={{ p: 3 }}>
          <Stack spacing={3} alignItems="center">
            <Typography>Veriler yükleniyor...</Typography>
          </Stack>
        </Card>
      ) : (
        <Stack spacing={3} sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Field.Select
                name="therapistId"
                label="Danışman"
                placeholder="Danışman seçin"
                onChange={(e) => {
                  setValue('therapistId', e.target.value);
                  handleTherapistChange(e.target.value);
                }}
                disabled={loadingTherapists}
              >
                <MenuItem value="">
                  <em>Danışman seçin</em>
                </MenuItem>
                {therapists.map((therapist) => (
                  <MenuItem key={`therapist-${therapist.therapistId}`} value={therapist.therapistId}>
                    {`${therapist.therapistFirstName} ${therapist.therapistLastName}`}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>

            <Grid item xs={12} md={6}>
              <Field.Select
                name="patientId"
                label="Danışan"
                placeholder="Danışan seçin"
                disabled={requestMode || !watch('therapistId') || loadingPatients || requestPatientLoading}
              >
                <MenuItem value="">
                  <em>Danışan seçin</em>
                </MenuItem>
                {requestMode && requestPatientOption ? (
                  <MenuItem value={requestPatientOption.patientId}>
                    {requestPatientOption.patientName}
                  </MenuItem>
                ) : (
                  Array.isArray(assignedPatients) && assignedPatients.map((patient) => (
                    <MenuItem key={`patient-${patient.patientId}`} value={patient.patientId}>
                      {patient.patientName}
                    </MenuItem>
                  ))
                )}
              </Field.Select>
            </Grid>

            <Grid item xs={12} md={6}>
              <Field.MobileDateTimePicker
                name="scheduledDate"
                label="Randevu Tarihi ve Saati"
                ampm={false}
                slotProps={{
                  textField: {
                    placeholder: 'GG/AA/YYYY SS:DD',
                  },
                  actionBar: {
                    actions: ['cancel', 'accept'],
                  },
                  toolbar: {
                    title: 'Tarih ve Saat Seçin',
                  },
                  // Navigation butonları için
                  switchViewButton: {
                    'aria-label': 'Görünümü değiştir',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Field.Select name="sessionType" label="Seans Tipi">
                {sessionTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>

            <Grid item xs={12} md={6}>
              <Field.Select name="sessionFormat" label="Seans Formatı">
                {sessionFormatOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>

            <Grid item xs={12} md={6}>
              <Field.Select
                name="sessionFeeCurrency"
                label="Seans Ücreti Para Birimi"
              >
                {CURRENCY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>

            <Grid item xs={12} md={6}>
              <Field.Text
                name="sessionFee"
                label="Seans Ücreti"
                type="number"
                helperText={watch('therapistId') ? 'Danışman seçildiğinde otomatik doldurulur' : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {getCurrencySymbol(watch('sessionFeeCurrency') || 'TRY')}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Field.Text
                name="sessionNotes"
                label="Seans Notları"
                multiline
                rows={4}
                placeholder="Seans hakkında ek bilgiler..."
              />
            </Grid>

            <Grid item xs={12}>
              <Field.Text
                name="homeworkAssigned"
                label="Verilen Ödev"
                multiline
                rows={3}
                placeholder="Danışana verilen ödevler veya yapılacaklar..."
              />
            </Grid>
          </Grid>

          <Stack justifyContent="flex-end" direction="row" spacing={2}>
            <Button
              color="inherit"
              size="large"
              variant="outlined"
              onClick={() => router.push(paths.dashboard.therapySession.list)}
            >
              İptal
            </Button>

            <Button
              size="large"
              variant="outlined"
              disabled={loadingSave.value}
              onClick={handleSaveAsDraft}
            >
              Taslak Kaydet
            </Button>

            <Button
              size="large"
              variant="contained"
              onClick={async () => {
                // Manually trigger form validation for all fields
                const validationResult = await methods.trigger();
                
                if (validationResult) {
                  handleCreateAndSchedule();
                } else {
                  // Show specific field errors to user
                  const errorMessages = [];
                  if (methods.formState.errors.therapistId) {
                    errorMessages.push(methods.formState.errors.therapistId.message);
                  }
                  if (methods.formState.errors.patientId) {
                    errorMessages.push(methods.formState.errors.patientId.message);
                  }
                  if (methods.formState.errors.scheduledDate) {
                    errorMessages.push(methods.formState.errors.scheduledDate.message);
                  }
                  if (methods.formState.errors.sessionType) {
                    errorMessages.push(methods.formState.errors.sessionType.message);
                  }
                  if (methods.formState.errors.sessionFormat) {
                    errorMessages.push(methods.formState.errors.sessionFormat.message);
                  }
                  if (methods.formState.errors.sessionFee) {
                    errorMessages.push(methods.formState.errors.sessionFee.message);
                  }
                  
                  if (errorMessages.length > 0) {
                    toast.error(errorMessages.join(', '));
                  } else {
                    toast.error('Lütfen tüm gerekli alanları doldurun');
                  }
                }
              }}
            >
              {currentSession ? 'Güncelle' : 'Oluştur ve Planla'}
            </Button>
          </Stack>
        </Stack>
      )}
    </Form>
  );
} 