import 'dayjs/locale/tr';
import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useMemo, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';
import { toast } from 'src/components/snackbar';
import { RHFTextField, Field, schemaHelper } from 'src/components/hook-form';
import { LoadingButton } from '@mui/lab';
import { Card, Stack, Alert, Snackbar, TextField } from '@mui/material';
import { CONFIG } from 'src/config-global';
import { axiosInstanceBpmn } from 'src/utils/axios';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { GENDER_TYPE_OPTIONS } from 'src/_mock/_patient';


// ...

import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

// Day.js'i Türkçe olarak ayarla
dayjs.locale('tr');

// Schema tanımı (validation için)
export const NewPatientSchema = zod.object({
  patientFirstName: zod.string().min(1, { message: 'Ad bilgisi gereklidir!' }),
  patientLastName: zod.string().min(1, { message: 'Soyad bilgisi gereklidir!' }),
  patientEmail: zod.string().email({ message: 'Geçerli bir mail adresi girilmelidir!' }).optional(),
  patientPhoneNumber: schemaHelper.phoneNumber({ isValidPhoneNumber }),
  patientAddress:zod.string().optional(),
  patientCountry: schemaHelper.objectOrNull({
    message: { required_error: 'Ülke bilgisi gereklidir!' },
  }),
  patientCity: zod.string().optional(),
  patientGender: zod.string(),
  paymentMethod: zod.string().min(1, { message: 'Ödeme yöntemi bilgisi gereklidir!' }),
});


export function PatientNewEditForm({ currentPatient }) {
  const router = useRouter();
  const navigate = useNavigate(); 

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');

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
      patientAge: currentPatient?.patientAge || '',
      paymentMethod: currentPatient?.paymentMethod || '',
    }),
    [currentPatient]
  );

  // Form kontrolü
  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(NewPatientSchema),
    defaultValues,
  });

  const password = useBoolean();

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const {
    formState: { errors },
  } = methods;


  const onSubmit = async (data) => {
    try {
      console.log('BPMN süreci başlatılıyor...', {
        data,
        baseURL: axiosInstanceBpmn.defaults.baseURL,
        headers: axiosInstanceBpmn.defaults.headers
      });
      
      // API isteği yap ve form verilerini gönder
      const response = await axiosInstanceBpmn.post('/api/bpmn/patient/start-process', data);
      
      console.log('BPMN yanıtı:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      
      if (response.status === 200 || response.status === 201) {
        // Başarı mesajı göster
        toast.success("Hasta kaydı başarıyla oluşturuldu. Terapist atama süreci başlatılıyor...");
        
        // Formu sıfırla
        reset();
        
        // Backend yönlendirmeyi yapacak, biz sadece log tutuyoruz
        console.log('BPMN süreci başarılı, yanıt:', response.data);
      } else {
        throw new Error('Beklenmeyen yanıt durumu');
      }
    } catch (error) {
      // Hata detaylarını logla
      console.error("BPMN Hata Detayları:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: error.config,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        baseURL: error.config?.baseURL
      });
      
      // Kullanıcıya hata mesajı göster
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         "Hasta kaydı oluşturulurken bir hata oluştu!";
      toast.error(errorMessage);
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
                    defaultValue={dayjs()}
                    control={control}
                    editable
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Yaş"
                        ref={field.ref}
                        fullWidth
                        inputProps={{ tabIndex: 4 }}
                      />
                    )}
                  />


                  <Controller
                    name="patientPhoneNumber"
                    control={control}
                    defaultValue={defaultValues.phoneNumber}
                    render={({ field }) => (
                      <Field.Phone
                        {...field}
                        label="Telefon"
                        ref={field.ref}
                        fullWidth
                        inputProps={{ tabIndex: 5 }}
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
                  <Field.Text name="paymentMethod" label="Ödeme Yöntemi" />
                </Box>

                <Stack alignItems="flex-end" sx={{ mt: 1 }}>
                  <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                    {!currentPatient ? 'Hasta Oluştur' : 'Değişiklikleri Kaydet'}
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
      </FormProvider>
    </LocalizationProvider>
  );
}