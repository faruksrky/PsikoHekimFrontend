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
import { Card, Stack, Alert, Snackbar, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { CONFIG } from 'src/config-global';
import { axiosInstanceBpmn, axiosInstancePatient } from 'src/utils/axios';
import { paths } from 'src/routes/paths';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

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
      // 1. Önce hasta kaydını yap
      const registerRes = await axiosInstancePatient.post(CONFIG.addPatientUrl, data);
      console.log('Register Response:', registerRes.data);

      if (!registerRes.data) {
        throw new Error("API yanıtı boş!");
      }

      const newPatientId = registerRes.data.patientId;
      console.log('Patient ID:', newPatientId);

      if (!newPatientId) {
        console.error('API Response:', registerRes.data);
        throw new Error(`Danışan ID alınamadı! API yanıtı: ${JSON.stringify(registerRes.data)}`);
      }

      setPatientId(newPatientId);
      setShowAssignDialog(true);
      toast.success("Hasta kaydı yapıldı ve süreç başlatıldı.");

    } catch (error) {
      console.error("Hata Detayı:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Bir hata oluştu!");
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
                  <Field.Text name="paymentMethod" label="Ödeme Yöntemi" />
                  <Field.Text name="patientReference" label="Referans" />
                </Box>


                <Stack alignItems="flex-end" sx={{ mt: 1 }}>
                  <LoadingButton 
                    type="submit" 
                    variant="contained" 
                    loading={isSubmitting}
                  >
                    {!currentPatient ? 'Danışan Oluştur' : 'Değişiklikleri Kaydet'}
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
            <Button onClick={() => setShowAssignDialog(false)}>Daha Sonra</Button>
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