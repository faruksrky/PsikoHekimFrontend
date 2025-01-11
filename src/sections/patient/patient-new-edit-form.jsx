import 'dayjs/locale/tr';
import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useMemo, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import MuiAlert from '@mui/lab/Alert';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Snackbar } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { GENDER_TYPE_OPTIONS } from 'src/_mock/_patient';


// ...

import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import axios from 'src/utils/axios';

import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { CONFIG } from '../../config-global';

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
      // API isteği yap ve form verilerini gönder
      const response = await axios.post("http://localhost:8082/api/bpmn/patient/start-process",data);
      const availableTherapists = response.data;
  
      // Başarı mesajı göster
      setMessage("Hasta kaydı ve süreç başarıyla başlatıldı.");
      setSeverity("success");
      setOpen(true);
  
      // Doktor seçim ekranına yönlendir

  
      // Formu sıfırla
      reset();
    } catch (error) {
      // Hata detaylarını logla
      console.error("Hata Detayları:", error.response?.data || error.message || error);
  
      // Kullanıcıya hata mesajı göster
      setMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
      setSeverity("error");
      setOpen(true);
    }
  };
  
  
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
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
      </Form>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <MuiAlert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </MuiAlert>
      </Snackbar>
    </LocalizationProvider>
  );
}