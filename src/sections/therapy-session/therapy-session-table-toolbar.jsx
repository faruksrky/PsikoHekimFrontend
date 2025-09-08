import { toast } from 'sonner';
import { useCallback } from 'react';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Stack,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  InputAdornment,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function TherapySessionTableToolbar({
  filters,
  onFilters,
  canReset,
  onResetFilters,
}) {
  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStatus = useCallback(
    (event) => {
      onFilters('status', event.target.value);
    },
    [onFilters]
  );

  const handleFilterSessionType = useCallback(
    (event) => {
      onFilters('sessionType', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStartDate = useCallback(
    (newValue) => {
      // Başlangıç tarihi bitiş tarihinden büyük olamaz
      if (newValue && filters.endDate && newValue > filters.endDate) {
        toast.error('Başlangıç tarihi bitiş tarihinden büyük olamaz');
        return;
      }
      onFilters('startDate', newValue);
    },
    [onFilters, filters.endDate]
  );

  const handleFilterEndDate = useCallback(
    (newValue) => {
      // Bitiş tarihi başlangıç tarihinden küçük olamaz
      if (newValue && filters.startDate && newValue < filters.startDate) {
        toast.error('Bitiş tarihi başlangıç tarihinden küçük olamaz');
        return;
      }
      onFilters('endDate', newValue);
    },
    [onFilters, filters.startDate]
  );

  return (
    <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.name}
            onChange={handleFilterName}
            placeholder="Danışan ara..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Durum</InputLabel>
            <Select
              value={filters.status}
              onChange={handleFilterStatus}
              label="Durum"
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="SCHEDULED">Planlandı</MenuItem>
              <MenuItem value="IN_PROGRESS">Devam Ediyor</MenuItem>
              <MenuItem value="COMPLETED">Tamamlandı</MenuItem>
              <MenuItem value="CANCELLED">İptal Edildi</MenuItem>
              <MenuItem value="NO_SHOW">Gelmedi</MenuItem>
              <MenuItem value="RESCHEDULED">Yeniden Planlandı</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Seans Tipi</InputLabel>
            <Select
              value={filters.sessionType}
              onChange={handleFilterSessionType}
              label="Seans Tipi"
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="INDIVIDUAL">Bireysel</MenuItem>
              <MenuItem value="GROUP">Grup</MenuItem>
              <MenuItem value="COUPLE">Çift</MenuItem>
              <MenuItem value="FAMILY">Aile</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <DatePicker
            label="Başlangıç"
            value={filters.startDate}
            onChange={handleFilterStartDate}
            slotProps={{
              textField: {
                size: 'small',
                sx: { minWidth: 120 },
              },
            }}
          />

          <DatePicker
            label="Bitiş"
            value={filters.endDate}
            onChange={handleFilterEndDate}
            slotProps={{
              textField: {
                size: 'small',
                sx: { minWidth: 120 },
              },
            }}
          />
        </Stack>
      </Stack>
  );
} 