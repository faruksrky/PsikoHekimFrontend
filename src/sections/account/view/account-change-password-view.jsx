import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import { Snackbar, Alert } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useAuth } from 'src/hooks/useAuth';
import { useAuthContext } from 'src/auth/hooks';
import { changePassword, adminSetPassword } from 'src/auth/context/jwt';
import { axiosInstanceKeycloak } from 'src/utils/axios';

// ----------------------------------------------------------------------

const UserChangePasswordSchema = zod
  .object({
    currentPassword: zod.string().min(1, { message: 'Mevcut şifre gereklidir!' }),
    newPassword: zod.string().min(6, { message: 'Yeni şifre en az 6 karakter olmalıdır!' }),
    confirmPassword: zod.string().min(1, { message: 'Yeni şifreyi tekrar girin!' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor!',
    path: ['confirmPassword'],
  });

const AdminChangePasswordSchema = zod
  .object({
    targetUserEmail: zod.string().min(1, { message: 'Kullanıcı seçiniz!' }),
    newPassword: zod.string().min(6, { message: 'Yeni şifre en az 6 karakter olmalıdır!' }),
    confirmPassword: zod.string().min(1, { message: 'Yeni şifreyi tekrar girin!' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor!',
    path: ['confirmPassword'],
  });

// ----------------------------------------------------------------------

export function AccountChangePasswordView() {
  const { user } = useAuthContext();
  const adminMode = useAuth().isAdmin();
  const password = useBoolean();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const methods = useForm({
    resolver: zodResolver(adminMode ? AdminChangePasswordSchema : UserChangePasswordSchema),
    defaultValues: {
      targetUserEmail: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods;

  useEffect(() => {
    if (adminMode) {
      setLoadingUsers(true);
      axiosInstanceKeycloak
        .get('/users/list')
        .then((res) => {
          setUsers(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => setUsers([]))
        .finally(() => setLoadingUsers(false));
    }
  }, [adminMode]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (adminMode) {
        await adminSetPassword({
          targetUsername: data.targetUserEmail,
          newPassword: data.newPassword,
        });
        setMessage(`Şifre başarıyla güncellendi.`);
      } else {
        await changePassword({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        });
        setMessage('Şifreniz başarıyla güncellendi.');
      }
      setSeverity('success');
      setOpen(true);
      reset();
    } catch (error) {
      const errMsg = error?.message || 'Şifre güncellenirken bir hata oluştu.';
      setMessage(errMsg);
      setSeverity('error');
      setOpen(true);
    }
  });

  return (
    <>
      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              {adminMode ? (
                <>
                  <Field.Select
                    name="targetUserEmail"
                    label="Kullanıcı (E-posta)"
                    disabled={loadingUsers}
                    InputProps={{
                      endAdornment: loadingUsers ? <CircularProgress size={20} /> : null,
                    }}
                  >
                    <MenuItem value="">
                      {loadingUsers ? 'Kullanıcılar yükleniyor...' : 'Kullanıcı seçin'}
                    </MenuItem>
                    {users.map((u) => (
                      <MenuItem key={u.id || u.email} value={u.email || u.username}>
                        {u.email || u.username}
                        {u.firstName || u.lastName ? ` (${[u.firstName, u.lastName].filter(Boolean).join(' ')})` : ''}
                      </MenuItem>
                    ))}
                  </Field.Select>
                  <Box sx={{ mt: 2, color: 'text.secondary', typography: 'caption' }}>
                    Admin olarak seçilen kullanıcının şifresini güncelleyebilirsiniz. Mevcut şifre gerekmez.
                  </Box>
                </>
              ) : (
                <>
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 2,
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    }}
                  >
                    <TextField
                      label="E-posta"
                      value={user?.email || ''}
                      disabled
                      fullWidth
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      label="Ad"
                      value={user?.name || user?.displayName || ''}
                      disabled
                      fullWidth
                      InputProps={{ readOnly: true }}
                    />
                  </Box>
                  <Box sx={{ mt: 2, color: 'text.secondary', typography: 'caption' }}>
                    Bu bilgiler Keycloak üzerinden yönetilir. Sadece şifrenizi güncelleyebilirsiniz.
                  </Box>
                </>
              )}
            </Box>

            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: '1fr' },
              }}
            >
              {!adminMode && (
                <Field.Text
                  name="currentPassword"
                  label="Mevcut Şifre"
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
              )}
              <Field.Text
                name="newPassword"
                label="Yeni Şifre"
                placeholder="En az 6 karakter"
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
              <Field.Text
                name="confirmPassword"
                label="Yeni Şifre (Tekrar)"
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

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Şifreyi Güncelle
              </LoadingButton>
            </Stack>
          </Card>
        </Stack>
      </Form>

      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}
