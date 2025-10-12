import 'react-phone-number-input/style.css';

import 'dayjs/locale/tr';
import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useMemo, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import { LoadingButton } from '@mui/lab';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Card, Stack, Alert, Dialog, Button, Snackbar, TextField, Typography, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { axiosInstancePatient } from 'src/utils/axios';
import { mutate } from 'swr';

import { CONFIG } from 'src/config-global';
import { GENDER_TYPE_OPTIONS } from 'src/_mock/_patient';

import { toast } from 'src/components/snackbar';
import { PaymentMethodSelect } from 'src/components/payment';
import { Field, schemaHelper } from 'src/components/hook-form';

// Day.js'i Türkçe olarak ayarla
dayjs.locale('tr');

// Schema tanımı (validation için)
export const NewPatientSchema = zod.object({
  patientFirstName: zod.string().min(1, { message: 'Ad bilgisi gereklidir!' }),
  patientLastName: zod.string().min(1, { message: 'Soyad bilgisi gereklidir!' }),
  patientEmail: zod.string().email({ message: 'Geçerli bir mail adresi girilmelidir!' }).optional(),
  patientPhoneNumber: schemaHelper.phoneNumber({ isValidPhoneNumber }),
  patientAddress: zod.string().optional(),
  patientCountry: schemaHelper.objectOrNull({
    message: { required_error: 'Ülke bilgisi gereklidir!' },
  }),
  patientCity: zod.string().optional(),
  patientReference: zod.string().optional(),
  patientGender: zod.string().min(1, { message: 'Cinsiyet bilgisi gereklidir!' }),
  paymentMethod: zod.string().min(1, { message: 'Ödeme yöntemi bilgisi gereklidir!' }),
  patientAge: zod.preprocess(
    (val) => (val === '' ? null : Number(val)),
    zod.number({
      required_error: 'Yaş bilgisi gereklidir!',
      invalid_type_error: 'Yaş bir sayı olmalıdır!'
    }).min(0, { message: 'Yaş 0\'dan küçük olamaz!' })
  ),
});

export function PatientNewEditForm({ currentPatient }) {
  const router = useRouter();
  const navigate = useNavigate(); 

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [processInstanceKey, setProcessInstanceKey] = useState(null);
  const [patientId, setPatientId] = useState(null);

  const defaultValues = useMemo(
    () => ({
      patientFirstName: currentPatient?.patientFirstName || '',
      patientLastName: currentPatient?.patientLastName || '',
      patientEmail: currentPatient?.patientEmail || '',
      patientGender: currentPatient?.patientGender || '',
      patientPhoneNumber: currentPatient?.patientPhoneNumber || '',
      patientCountry: currentPatient?.patientCountry || '',
      patientCity: currentPatient?.patientCity || '',
      patientAddress: currentPatient?.patientAddress || '',
      patientAge: currentPatient?.patientAge ? parseInt(currentPatient.patientAge, 10) : null,
      paymentMethod: currentPatient?.paymentMethod || '',
      patientReference: currentPatient?.patientReference || '',
    }),
    [currentPatient]
  );

  const methods = useForm({
    mode: 'onChange',
    resolver: zodResolver(NewPatientSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      let response;
      
      if (currentPatient && currentPatient.patientId) {
        // Güncelleme işlemi - PUT request
        console.log('Updating patient:', currentPatient.patientId);
        response = await axiosInstancePatient.put(
          `${CONFIG.addPatientUrl}/${currentPatient.patientId}`, 
          data
        );
        console.log('Update Response:', response.data);
        toast.success("Hasta bilgileri başarıyla güncellendi.");
        
        // SWR cache'ini tamamen temizle ve yeniden yükle
        mutate(CONFIG.patientListUrl, undefined, { revalidate: true });
        // Alternatif olarak cache'i tamamen temizle
        mutate(CONFIG.patientListUrl, () => undefined, { revalidate: true });
        
        // Güncelleme sonrası liste sayfasına dön
        setTimeout(() => {
          navigate(paths.dashboard.patient.list);
        }, 1500);
      } else {
        // Yeni hasta ekleme - POST request
        console.log('Creating new patient');
        response = await axiosInstancePatient.post(CONFIG.addPatientUrl, data);
        console.log('Create Response:', response.data);

        if (!response.data) {
          throw new Error("API yanıtı boş!");
        }

        const newPatientId = response.data.patientId;
        console.log('Patient ID:', newPatientId);

        if (!newPatientId) {
          console.error('API Response:', response.data);
          throw new Error(`Danışan ID alınamadı! API yanıtı: ${JSON.stringify(response.data)}`);
        }

        setPatientId(newPatientId);
        setShowAssignDialog(true);
        toast.success("Hasta kaydı yapıldı ve süreç başlatıldı.");
      }

    } catch (error) {
      console.error("Hata Detayı:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      
      if (error.response) {
        const { status, data: errorData } = error.response;
        
        if (status === 400) {
          toast.error(errorData?.message || 'Girilen bilgilerde hata var. Lütfen tüm alanları kontrol edin.');
        } else if (status === 409) {
          toast.error('Bu e-posta adresi veya telefon numarası zaten kullanımda.');
        } else if (status === 422) {
          toast.error('Girilen bilgiler geçersiz. Lütfen tüm alanları doğru şekilde doldurun.');
        } else if (status >= 500) {
          toast.error('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.');
        } else {
          toast.error(errorData?.message || 'Hasta kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
      } else if (error.request) {
        toast.error('Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.');
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid xs={12} md={12}>
              <Card sx={{ p: 2 }}>
                <Box
                  rowGap={2}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(2, 2fr)',
                  }}
                >
                  <Controller
                    name="patientFirstName"
                    control={control}
                    defaultValue={defaultValues.firstName}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Ad"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        inputProps={{ tabIndex: 1 }}
                      />
                    )}
                  />

                  <Controller
                    name="patientLastName"
                    control={control}
                    defaultValue={defaultValues.surName}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Soyad"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        inputProps={{ tabIndex: 2 }}
                      />
                    )}
                  />



                  <Controller
                    name="patientGender"
                    control={control}
                    defaultValue={defaultValues.gender}
                    render={({ field }) => (
                      <Field.Select {...field} label="Cinsiyet" inputProps={{ tabIndex: 3 }}>
                        {GENDER_TYPE_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Field.Select>
                    )}
                  />



                  <Controller
                    name="patientAge"
                    control={control}
                    defaultValue={defaultValues.patientAge}
                    render={({ field: { onChange, value, ...field } }) => (
                      <TextField
                        {...field}
                        label="Yaş"
                        type="number"
                        value={value === null || value === undefined ? '' : value}
                        onChange={(e) => {
                          const val = e.target.value;
                          onChange(val === '' ? null : parseInt(val, 10));
                        }}
                        fullWidth
                        inputProps={{ 
                          tabIndex: 4,
                          min: 0,
                          step: 1
                        }}
                      />
                    )}
                  />


                  <Controller
                    name="patientPhoneNumber"
                    control={control}
                    defaultValue={defaultValues.patientPhoneNumber}
                    render={({ field }) => (
                      <Field.Phone
                        {...field}
                        label="Telefon"
                        ref={field.ref}
                        fullWidth
                        inputProps={{ tabIndex: 5 }}
                        defaultCountry="TR"
                      />
                    )}
                  />

                  <Controller
                    name="patientEmail"
                    control={control}
                    defaultValue={defaultValues.email}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="E-Posta"
                        variant="outlined"
                        fullWidth
                        inputProps={{ tabIndex: 6 }}
                      />
                    )}
                  />

                   <Field.CountrySelect
                    fullWidth
                    name="patientCountry"
                    label="Ülke"
                    placeholder="Ülke Seçiniz"
                    margin="normal"
                    variant="outlined"
                  />

                  <Field.Text name="patientCity" label="Şehir" />
                  <Field.Text
                    name="patientAddress"
                    label="Adres"
                    multiline
                    rows={1}
                    sx={{ gridColumn: 'span 2' }}
                  />
                  <Controller
                    name="paymentMethod"
                    control={control}
                    defaultValue={defaultValues.paymentMethod}
                    render={({ field, fieldState: { error } }) => (
                      <PaymentMethodSelect
                        {...field}
                        label="Ödeme Yöntemi"
                        placeholder="Ödeme yöntemi seçin"
                        error={!!error}
                        helperText={error?.message}
                        required
                      />
                    )}
                  />
                  <Field.Text name="patientReference" label="Referans" />
                </Box>


                <Stack alignItems="flex-end" sx={{ mt: 1 }}>
                  <LoadingButton 
                    type="submit" 
                    variant="contained" 
                    loading={isSubmitting}
                  >
                    {!currentPatient?.patientId ? 'Hasta Oluştur' : 'Güncelle'}
                  </LoadingButton>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </form>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
            {message}
          </Alert>
        </Snackbar>

        <Dialog open={showAssignDialog} onClose={() => setShowAssignDialog(false)}>
          <DialogTitle>Danışman Atama</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Typography>
                Danışan kaydı başarıyla oluşturuldu. Bir danışman atamak ister misiniz?
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setShowAssignDialog(false);
              // Form içeriğini temizle
              reset();
              // State'leri temizle
              setPatientId(null);
              setProcessInstanceKey(null);
              // Başarı mesajı göster
              toast.success("Form temizlendi. Yeni hasta kaydı yapabilirsiniz.");
            }}>Daha Sonra</Button>
            <Button 
              variant="contained" 
              onClick={() => {
                const url = paths.dashboard.patient.assignTherapist(patientId);
                navigate(url, { 
                  state: { 
                    patient: {
                      patientFirstName: values.patientFirstName,
                      patientLastName: values.patientLastName,
                      patientId
                    }
                  }
                });
              }}
            >
              Danışman Ata
            </Button>
          </DialogActions>
        </Dialog>
      </FormProvider>
    </LocalizationProvider>
  );
}