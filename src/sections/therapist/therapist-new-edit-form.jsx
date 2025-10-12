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
import { paths } from 'src/routes/paths';

import axios from 'src/utils/axios';
import { mutate } from 'swr';

import {
  THERAPIST_TYPE_OPTIONS,
  EXPERIENCE_YEARS_OPTIONS,
  PSIKOLOG_SPECIALISTIES_OPTIONS,
  PSIKIYATR_SPECIALISTIES_OPTIONS
} from 'src/_mock/_therapist';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { CONFIG } from '../../config-global';


// Day.js'i Türkçe olarak ayarla
dayjs.locale('tr');

// Schema tanımı (validation için)
export const NewTherapistSchema = zod.object({
  therapistFirstName: zod.string().min(1, { message: 'Ad bilgisi gereklidir!' }),
  therapistLastName: zod.string().min(1, { message: 'Soyad bilgisi gereklidir!' }),
  therapistEmail: zod
    .string()
    .min(1, { message: 'Email bilgisi gereklidir!' })
    .email({ message: 'Geçerli bir mail adresi girilmelidir!' }),
  therapistPhoneNumber: schemaHelper.phoneNumber({ isValidPhoneNumber }),
  therapistType: zod.string().min(1, { message: 'Danışman türü bilgisi gereklidir!' }),
  therapistSpecializationAreas: zod
    .string()
    .array()
    .nonempty({ message: 'En az bir adet Uzmanlık alanı seçilmelidir!' }),
  therapistYearsOfExperience: zod.string().min(1, { message: 'Deneyim bilgisi gereklidir!' }),
  therapistEducation: zod.string().min(1, { message: 'Eğitim bilgisi gereklidir!' }),
  therapistAddress: zod.string().optional(),
  therapistUniversity: zod.string().optional(),
  therapistCertifications: zod.string().optional(),
  therapistAppointmentFee: zod.number().min(1, { message: 'Randevu ücret bilgisi gereklidir!' }),
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
      therapistFirstName: currentTherapist?.therapistFirstName || '',
      therapistLastName: currentTherapist?.therapistLastName || '',
      therapistEmail: currentTherapist?.therapistEmail || '',
      therapistPhoneNumber: currentTherapist?.therapistPhoneNumber || '',
      therapistType: currentTherapist?.therapistType || '',
      therapistSpecializationAreas: currentTherapist?.therapistSpecializationAreas || [],
      therapistYearsOfExperience: currentTherapist?.therapistYearsOfExperience || 'ZERO_TO_ONE',
      therapistEducation: String(currentTherapist?.therapistEducation || ''),
      therapistAddress: currentTherapist?.therapistAddress || '',
      therapistUniversity: currentTherapist?.therapistUniversity || '',
      therapistCertifications: currentTherapist?.therapistCertifications || '',
      therapistAppointmentFee: currentTherapist?.therapistAppointmentFee || '',
    }),
    [currentTherapist]
  );

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
  } = methods;

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
      console.log('Form submit başladı');
      console.log('Form verileri:', data);
      
      // Form verilerini kontrol et
      if (!data.therapistFirstName || !data.therapistLastName) {
        toast.error('Ad ve soyad alanları zorunludur!');
        return;
      }

      // Telefon numarası kontrolü
      if (!data.therapistPhoneNumber || data.therapistPhoneNumber.trim() === '') {
        toast.error('Telefon numarası zorunludur!');
        return;
      }

      // Deneyim yılı kontrolü
      if (!data.therapistYearsOfExperience) {
        toast.error('Deneyim yılı zorunludur!');
        return;
      }

      console.log('API isteği gönderiliyor...');
      // Danışmanı kaydet
      const response = await axios.post(CONFIG.addTherapistUrl, {
        ...data,
        therapistPhoneNumber: data.therapistPhoneNumber.trim(),
        therapistYearsOfExperience: data.therapistYearsOfExperience.toUpperCase()
      });

      console.log('API yanıtı:', response.data);
      
      if (response.status === 200 || response.status === 201) {
        setMessage('Danışman başarıyla kaydedildi.');
        setSeverity('success');
        setOpen(true);
        reset();
        
        // SWR cache'ini yenile - danışman listesini güncelle
        mutate(CONFIG.therapistListUrl, undefined, { revalidate: true });
        
        // Listeye geri dön
        setTimeout(() => {
          router.push(paths.dashboard.therapist.root);
        }, 1500);
      } else {
        throw new Error('Sunucudan beklenmeyen bir yanıt alındı. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Therapist form submission error:', error);
      
      let errorMessage = 'Danışman kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.';
      
      if (error.response) {
        const { status, data: errorData } = error.response;
        
        if (status === 400) {
          errorMessage = errorData?.message || 'Girilen bilgilerde hata var. Lütfen tüm alanları kontrol edin.';
        } else if (status === 409) {
          errorMessage = 'Bu e-posta adresi veya telefon numarası zaten kullanımda.';
        } else if (status === 422) {
          errorMessage = 'Girilen bilgiler geçersiz. Lütfen tüm alanları doğru şekilde doldurun.';
        } else if (status >= 500) {
          errorMessage = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
        } else {
          errorMessage = errorData?.message || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
        }
      } else if (error.request) {
        errorMessage = 'Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.';
      }
      
      setMessage(errorMessage);
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
      setValue(`therapistAppointmentFee`, Number(event.target.value));
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
                  name="therapistFirstName"
                  control={control}
                  defaultValue={defaultValues.therapistFirstName}
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
                  name="therapistLastName"
                  control={control}
                  defaultValue={defaultValues.therapistLastName}
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
                  name="therapistEmail"
                  control={control}
                  defaultValue={defaultValues.therapistEmail}
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
                  name="therapistPhoneNumber"
                  control={control}
                  defaultValue={defaultValues.therapistPhoneNumber}
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
                  name="therapistAddress"
                  control={control}
                  defaultValue={defaultValues.therapistAddress}
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
                  name="therapistEducation"
                  defaultValue={defaultValues.therapistEducation}
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
                  name="therapistUniversity"
                  control={control}
                  defaultValue={defaultValues.therapistUniversity}
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
                  name="therapistSpecializationAreas"
                  label="Uzmanlık Alanları"
                  control={control}
                  defaultValue={defaultValues.therapistSpecializationAreas}
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
                  name="therapistYearsOfExperience"
                  control={control}
                  defaultValue={defaultValues.therapistYearsOfExperience}
                  render={({ field }) => (
                    <TextField
                      name="therapistYearsOfExperience"
                      label="Deneyim Süresi"
                      select
                      fullWidth
                      value={values.therapistYearsOfExperience}
                      onChange={field.onChange}
                      error={!!field.error}
                      helperText={field.error?.message}
                    >
                      {EXPERIENCE_YEARS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="therapistCertifications"
                  control={control}
                  defaultValue={defaultValues.therapistCertifications}
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
                  name="therapistAppointmentFee"
                  control={control}
                  defaultValue={defaultValues.therapistAppointmentFee}
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
