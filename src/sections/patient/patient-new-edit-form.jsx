import 'dayjs/locale/tr';
import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import MuiAlert from '@mui/lab/Alert';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Snackbar } from '@mui/material';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// ...

import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { fData } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { signUp } from 'src/auth/context/jwt';

// Day.js'i Türkçe olarak ayarla
dayjs.locale('tr');

// Schema tanımı (validation için)
export const NewPatientSchema = zod.object({
  firstName: zod.string().min(1, { message: 'Ad bilgisi gereklidir!' }),
  lastName: zod.string().min(1, { message: 'Soyad bilgisi gereklidir!' }),
  email: zod
    .string()
    .min(1, { message: 'Email bilgisi gereklidir!' })
    .email({ message: 'Geçerli bir mail adresi girilmelidir!' }),
  phoneNumber: schemaHelper.phoneNumber({ isValidPhoneNumber }),
  country: schemaHelper.objectOrNull({
    message: { required_error: 'Ülke bilgisi gereklidir!' },
  }),
  sessionStartDate: zod
    .date()
    .refine((date) => date instanceof Date, { message: 'Geçerli bir tarih seçilmelidir!' }),
  paymentMethod: zod.string().min(1, { message: 'Ödeme yöntemi bilgisi gereklidir!' }),
});

export function PatientNewEditForm({ currentUser }) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  // Varsayılan değerler
  const defaultValues = useMemo(
    () => ({
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      email: currentUser?.email || '',
      phoneNumber: currentUser?.phoneNumber || '',
      country: currentUser?.country || '',
      sessionStartDate: currentUser?.sessionStartDate || null,
      paymentMethod: currentUser?.paymentMethod || '',
    }),
    [currentUser]
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

  // Form submit işlemi
  const onSubmit = handleSubmit(async (data) => {
    try {
      await signUp({
        userName: data.email,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        country: data.country,
        sessionStartDate: data.sessionStartDate,
        paymentMethod: data.paymentMethod,
      });

      setMessage('Hasta başarıyla kaydedildi.');
      setSeverity('success');
      setOpen(true);
      reset();
    } catch (error) {
      console.log('error', error);
      if (error.response && error.response.status === 409) {
        setMessage('Bu e-posta adresi veya kullanıcı adı zaten kullanımda.');
      } else {
        setMessage('Hasta kaydedilemedi, lütfen tekrar deneyin.');
      }
      setSeverity('error');
      setOpen(true);
    }
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      <Form methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid xs={12} md={4}>
            <Card sx={{ pt: 10, pb: 5, px: 3 }}>
              {currentUser && (
                <Label
                  color={
                    (values.status === 'active' && 'success') ||
                    (values.status === 'banned' && 'error') ||
                    'warning'
                  }
                  sx={{ position: 'absolute', top: 24, right: 24 }}
                >
                  {values.status}
                </Label>
              )}

              <Box sx={{ mb: 5 }}>
                <Field.UploadAvatar
                  name="avatarUrl"
                  maxSize={3145728}
                  helperText={
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 3,
                        mx: 'auto',
                        display: 'block',
                        textAlign: 'center',
                        color: 'text.disabled',
                      }}
                    >
                      izin verilen formatlar *.jpeg, *.jpg, *.png, *.gif
                      <br /> max yüklenecek kapasite {fData(3145728)}
                    </Typography>
                  }
                />
              </Box>

              {currentUser && (
                <FormControlLabel
                  labelPlacement="start"
                  control={
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          {...field}
                          checked={field.value !== 'active'}
                          onChange={(event) =>
                            field.onChange(event.target.checked ? 'banned' : 'active')
                          }
                        />
                      )}
                    />
                  }
                  label={
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        Banned
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Apply disable account
                      </Typography>
                    </>
                  }
                  sx={{
                    mx: 0,
                    mb: 3,
                    width: 1,
                    justifyContent: 'space-between',
                  }}
                />
              )}

              {currentUser && (
                <Stack justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
                  <Button variant="soft" color="error">
                    Delete user
                  </Button>
                </Stack>
              )}
            </Card>
          </Grid>
          <Grid xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(1, 1fr)',
                }}
              >
                <Field.Text name="firstName" label="Ad" />
                <Field.Text name="lastName" label="Soyad" />
                <Field.Select name="gender" label="Cinsiyet" defaultValue="">
                  <MenuItem value="male">Erkek</MenuItem>
                  <MenuItem value="female">Kadın</MenuItem>
                </Field.Select>
                <Field.DatePicker name="dateofBirth" label="Doğum Tarihi" defaultValue={dayjs()} />
                <Field.Text name="email" label="E-Posta" />
                <Field.Phone name="phoneNumber" label="Telefon" />
                <Field.CountrySelect
                  fullWidth
                  name="country"
                  label="Ülke"
                  placeholder="Ülke Seç ..."
                />
                <Field.Text name="" label="Adres" />
                <Field.Select
                  fullWidth
                  name="psychologist"
                  label="Piskolog"
                >
                  <MenuItem value="psychologist1">Piskolog 1</MenuItem>
                  <MenuItem value="psychologist2">Piskolog 2</MenuItem>
                </Field.Select>

                <Field.DatePicker
                  name="sessionStartDate"
                  label="Seans Başlangıç Tarihi"
                  defaultValue={dayjs()}
                />
                <Field.Text name="paymentMethod" label="Ödeme Yöntemi" />
              </Box>

              <Stack alignItems="flex-end" sx={{ mt: 1 }}>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  {!currentUser ? 'Hasta Oluştur' : 'Değişiklikleri Kaydet'}
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
