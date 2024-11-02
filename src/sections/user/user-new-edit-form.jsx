import { z as zod } from 'zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import MuiAlert from '@mui/lab/Alert';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Snackbar } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { signUp } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export const NewUserSchema = zod.object({
  userName: zod.string().min(1, { message: 'Kullanıcı adı bilgisi gereklidir!' }),
  firstName: zod.string().min(1, { message: 'Ad bilgisi gereklidir!' }),
  lastName: zod.string().min(1, { message: 'Soyad bilgisi gereklidir!' }),
  email: zod
    .string()
    .min(1, { message: 'Email bilgisi gereklidir!' })
    .email({ message: 'Geçerli bir mail adresi girilmelidir!' }),
  phoneNumber: schemaHelper.phoneNumber({ isValidPhoneNumber }),
  password: zod.string().min(6, { message: 'Şifre en az 6 karakter uzunluğunda olmalıdır!' }), 
});

// ----------------------------------------------------------------------

export function UserNewEditForm({ currentUser }) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  const defaultValues = useMemo(
    () => ({
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      email: currentUser?.email || '',
      phoneNumber: currentUser?.phoneNumber || '',
      password: currentUser?.password || '',
      userName: currentUser?.userName || ''
    }),
    [currentUser]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(NewUserSchema),
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

  const onSubmit = handleSubmit(async (data) => { 
    try {
      await signUp({
        userName: data.email,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
  
      setMessage('Kullanıcı başarıyla kaydedildi.');
      setSeverity('success');
      setOpen(true);
      reset();
    } catch (error) {
      console.log('error', error);
      if (error.response && error.response.status === 409) {
        setMessage('Bu e-posta adresi veya kullanıcı adı zaten kullanımda.');
      } else {
        setMessage('Kullanıcı kaydedilemedi, lütfen tekrar deneyin.');
      }
      setSeverity('error');
      setOpen(true);
    }
  });

  return (
    <>
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid xs={12} md={5}>
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
              <Field.Text name="userName" label="Kullanıcı Adı"/>
              <Field.Text name="firstName" label="Ad" />
              <Field.Text name="lastName" label="Soyad" />
              <Field.Text name="email" label="Email" />
              <Field.Phone name="phoneNumber" label="Telefon" />
              <Field.Text
                name="password"
                label="Şifre"
                placeholder="6+ karakter"
                type={password.value ? 'text' : 'password'}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={password.onToggle} edge="end">
                        <Iconify
                          icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
  
            <Stack alignItems="flex-end" sx={{ mt: 1} }>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentUser ? 'Kullanıcı Oluştur' : 'Değişiklikleri Kaydet'}
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
    </>
  );
}