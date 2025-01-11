import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { useMemo, useState, useCallback } from 'react';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import MuiAlert from '@mui/lab/Alert';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import { Snackbar, MenuItem } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useRouter } from 'src/routes/hooks';

import axios from 'src/utils/axios';

import { EXPERIENCE_THERAPIST_OPTIONS } from 'src/_mock/_experience';
import {
  THERAPIST_TYPE_OPTIONS,
  PSIKOLOG_SPECIALISTIES_OPTIONS,
  PSIKIYATR_SPECIALISTIES_OPTIONS
} from 'src/_mock/_therapist';

import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { CONFIG } from '../../config-global';


// Day.js'i Türkçe olarak ayarla
dayjs.locale('tr');

// Schema tanımı (validation için)
export const NewTherapistSchema = zod.object({
  firstName: zod.string().min(1, { message: 'Ad bilgisi gereklidir!' }),
  lastName: zod.string().min(1, { message: 'Soyad bilgisi gereklidir!' }),
  email: zod
    .string()
    .min(1, { message: 'Email bilgisi gereklidir!' })
    .email({ message: 'Geçerli bir mail adresi girilmelidir!' }),
  phoneNumber: schemaHelper.phoneNumber({ isValidPhoneNumber }),
  therapistType: zod.string().min(1, { message: 'Danışman türü bilgisi gereklidir!' }),
  specializationAreas: zod
    .string()
    .array()
    .nonempty({ message: 'En az bir adet Uzmanlık alanı seçilmelidir!' }),
  yearsOfExperience: zod.string().min(1, { message: 'Deneyim bilgisi gereklidir!' }),
  education: zod.string().min(1, { message: 'Eğitim bilgisi gereklidir!' }),
  address: zod.string().optional(),
  university: zod.string().optional(),
  certifications: zod.string().optional(),
  appointmentFee: zod.number().min(1, { message: 'Randevu ücret bilgisi gereklidir!' }),
});

export function TherapistNewEditForm({ currentTherapist }) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');
  const [therapistType, setTherapistType] = useState('');
  const [specialties, setSpecialties] = useState([]);

  // Varsayılan değerler
  const defaultValues = useMemo(
    () => ({
      firstName: currentTherapist?.firstName || '',
      lastName: currentTherapist?.lastName || '',
      email: currentTherapist?.email || '',
      phoneNumber: currentTherapist?.phoneNumber || '',
      therapistType: currentTherapist?.therapistType || '',
      specializationAreas: currentTherapist?.specializationAreas || [],
      yearsOfExperience: currentTherapist?.yearsOfExperience || '',
      education: String(currentTherapist?.education || ''),
      address: currentTherapist?.address || '',
      university: currentTherapist?.university || '',
      certifications: currentTherapist?.certifications || '',
      appointmentFee: currentTherapist?.appointmentFee || '',
    }),
    [currentTherapist]
  );

  // Form kontrolü
  // Form kontrolü
  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(NewTherapistSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(NewTherapistSchema),
  });

  const values = watch();

  const [loading, setLoading] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  // Form submit işlemi

  const onSubmit = async (data) => {
    try {
      await axios.post(CONFIG.addTherapist, data);
      setMessage('Danışman başarıyla kaydedildi.');
      setSeverity('success');
      setOpen(true);
      reset();
    } catch (error) {
      console.error('Backend Hatası:', error);
      setMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
      setSeverity('error');
      setOpen(true);
    }
  };

  const handleTherapistChange = (event) => {
    const selectedType = event.target.value;
    setTherapistType(selectedType);

    switch (selectedType) {
      case 'PSIKOLOG':
        setSpecialties(PSIKOLOG_SPECIALISTIES_OPTIONS);
        break;
      case 'PSIKIYATRIST':
        setSpecialties(PSIKIYATR_SPECIALISTIES_OPTIONS);
        break;
      default:
        setSpecialties([]);
    }
  };

  const handleChangePrice = useCallback(
    (event) => {
      setValue(`appointmentFee`, Number(event.target.value));
    },
    [setValue]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={4}>
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
                  name="firstName"
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
                  name="lastName"
                  control={control}
                  defaultValue={defaultValues.lastName}
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
                  name="email"
                  control={control}
                  defaultValue={defaultValues.email}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="E-Posta"
                      variant="outlined"
                      fullWidth
                      inputProps={{ tabIndex: 3 }}
                    />
                  )}
                />
                <Controller
                  name="phoneNumber"
                  control={control}
                  defaultValue={defaultValues.phoneNumber}
                  render={({ field }) => (
                    <Field.Phone
                      {...field}
                      label="Telefon"
                      ref={field.ref}
                      fullWidth
                      inputProps={{ tabIndex: 4 }}
                    />
                  )}
                />
                <Controller
                  name="address"
                  control={control}
                  defaultValue={defaultValues.address}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Adres"
                      variant="outlined"
                      fullWidth
                      inputProps={{ tabIndex: 5 }}
                      sx={{ gridColumn: 'span 2' }}
                    />
                  )}
                />

                <Controller
                  name="education"
                  defaultValue={defaultValues.education}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Field.EducationSelect
                      {...field}
                      fullWidth
                      label="Eğitim Seviyesi"
                      placeholder="Eğitim Seç ..."
                      error={!!error}
                      helperText={error ? error.message : null}
                      onChange={(event, newValue) => {
                        field.onChange(newValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Eğitim Seviyesi"
                          variant="outlined"
                          fullWidth
                          inputProps={{
                            ...params.inputProps,
                            tabIndex: 6,
                          }}
                        />
                      )}
                    />
                  )}
                />

                <Controller
                  name="university"
                  control={control}
                  defaultValue={defaultValues.university}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Mezun olunan Üniversite"
                      fullWidth
                      variant="outlined"
                      inputProps={{ tabIndex: 7 }}
                    />
                  )}
                />
                <Controller
                  name="therapistType"
                  control={control}
                  defaultValue={defaultValues.therapistType}
                  render={({ field }) => (
                    <Field.Select
                      {...field}
                      label="Danışman Türü"
                      inputProps={{ tabIndex: 8 }}
                      onChange={(e) => {
                        field.onChange(e);
                        handleTherapistChange(e);
                      }}
                      value={therapistType}
                    >
                      {THERAPIST_TYPE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Field.Select>
                  )}
                />

                <Controller
                  name="specializationAreas"
                  label="Uzmanlık Alanları"
                  control={control}
                  defaultValue={defaultValues.specializationAreas}
                  render={({ field }) => (
                    <Field.Autocomplete
                      {...field}
                      placeholder="+ Uzmanlık Alanı Ekle"
                      label="Uzmanlık Alanları"
                      multiple
                      fullWidth
                      disableCloseOnSelect
                      options={specialties.map((option) => option)}
                      getOptionLabel={(option) => option}
                      renderOption={(props, option) => (
                        <li {...props} key={option}>
                          {option}
                        </li>
                      )}
                      renderTags={(selected, getTagProps) =>
                        selected.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={option}
                            label={option}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))
                      }
                      onChange={(event, value) => field.onChange(value)}
                    />
                  )}
                />

                <Controller
                  name="yearsOfExperience"
                  control={control}
                  defaultValue={defaultValues.yearsOfExperience}
                  render={({ field }) => (
                    <Field.Select {...field} label="Deneyim" inputProps={{ tabIndex: 10 }}>
                      {EXPERIENCE_THERAPIST_OPTIONS.map((experience) => (
                        <MenuItem key={experience.value} value={experience.label}>
                          {experience.label}
                        </MenuItem>
                      ))}
                    </Field.Select>
                  )}
                />

                <Controller
                  name="certifications"
                  control={control}
                  defaultValue={defaultValues.certifications}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Sertifikalar"
                      fullWidth
                      inputProps={{ tabIndex: 11 }}
                    />
                  )}
                />

                <Controller
                  name="appointmentFee"
                  control={control}
                  defaultValue={defaultValues.appointmentFee}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Randevu Ücreti"
                      placeholder="0.00"
                      type="number"
                      onChange={(event) => handleChangePrice(event)}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Box sx={{ typography: 'subtitle2', color: 'text.disabled' }}>₺</Box>
                          </InputAdornment>
                        ),
                        inputProps: {
                          tabIndex: 12,
                          step: '0.01',
                        },
                      }}
                      fullWidth
                    />
                  )}
                />
              </Box>

              <Stack alignItems="flex-end" sx={{ mt: 1 }}>
                <LoadingButton type="submit" variant="contained" loading={loading}>
                  {!currentTherapist ? 'Yeni Danışman Oluştur' : 'Değişiklikleri Kaydet'}
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
