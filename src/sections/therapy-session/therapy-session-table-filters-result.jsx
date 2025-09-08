import { useCallback } from 'react';

import {
  Box,
  Chip,
  Paper,
  Stack,
  Button,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function TherapySessionTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
}) {
  const handleRemoveKeyword = useCallback(() => {
    onFilters('name', '');
  }, [onFilters]);

  const handleRemoveStatus = useCallback(() => {
    onFilters('status', 'all');
  }, [onFilters]);

  const handleRemoveSessionType = useCallback(() => {
    onFilters('sessionType', 'all');
  }, [onFilters]);

  const handleRemoveDateRange = useCallback(() => {
    onFilters('startDate', null);
    onFilters('endDate', null);
  }, [onFilters]);

  const getStatusLabel = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Planlandı';
      case 'IN_PROGRESS':
        return 'Devam Ediyor';
      case 'COMPLETED':
        return 'Tamamlandı';
      case 'CANCELLED':
        return 'İptal Edildi';
      case 'NO_SHOW':
        return 'Gelmedi';
      case 'RESCHEDULED':
        return 'Yeniden Planlandı';
      default:
        return status;
    }
  };

  const getSessionTypeLabel = (type) => {
    switch (type) {
      case 'INDIVIDUAL':
        return 'Bireysel';
      case 'GROUP':
        return 'Grup';
      case 'COUPLE':
        return 'Çift';
      case 'FAMILY':
        return 'Aile';
      default:
        return type;
    }
  };

  return (
    <Stack spacing={1.5} sx={{ p: 2.5, pt: 0 }}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          sonuç bulundu
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.name && (
          <Block label="Arama:">
            <Chip
              size="small"
              label={filters.name}
              onDelete={handleRemoveKeyword}
              deleteIcon={<Iconify icon="solar:close-circle-bold" />}
            />
          </Block>
        )}

        {filters.status !== 'all' && (
          <Block label="Durum:">
            <Chip
              size="small"
              label={getStatusLabel(filters.status)}
              onDelete={handleRemoveStatus}
              deleteIcon={<Iconify icon="solar:close-circle-bold" />}
            />
          </Block>
        )}

        {filters.sessionType !== 'all' && (
          <Block label="Seans Tipi:">
            <Chip
              size="small"
              label={getSessionTypeLabel(filters.sessionType)}
              onDelete={handleRemoveSessionType}
              deleteIcon={<Iconify icon="solar:close-circle-bold" />}
            />
          </Block>
        )}

        {(filters.startDate || filters.endDate) && (
          <Block label="Tarih Aralığı:">
            <Chip
              size="small"
              label={`${filters.startDate ? (filters.startDate instanceof Date ? filters.startDate.toLocaleDateString('tr-TR') : new Date(filters.startDate).toLocaleDateString('tr-TR')) : ''} - ${
                filters.endDate ? (filters.endDate instanceof Date ? filters.endDate.toLocaleDateString('tr-TR') : new Date(filters.endDate).toLocaleDateString('tr-TR')) : ''
              }`}
              onDelete={handleRemoveDateRange}
              deleteIcon={<Iconify icon="solar:close-circle-bold" />}
            />
          </Block>
        )}

        <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Tümünü Temizle
        </Button>
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function Block({ label, children, sx, ...other }) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        borderStyle: 'dashed',
        ...sx,
      }}
      {...other}
    >
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {label}
      </Box>

      <Stack spacing={1} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
} 