import { useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { usePopover } from 'minimal-shared/hooks';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';

import { useSetState } from 'src/hooks/use-set-state';

// ----------------------------------------------------------------------
export function TherapistTableToolbar({ filters, options }) {
  const popover = usePopover();

  const local = useSetState({
    therapistType: filters.state.therapistType || [],
    therapistRating: filters.state.therapistRating || [],
  });

  const handleChangeTherapistType = useCallback(
    (event) => {
      const {
        target: { value },
      } = event;

      local.setState({ therapistType: typeof value === 'string' ? value.split(',') : value });
    },
    [local]
  );

  const handleChangeTherapistRating = useCallback(
    (event) => {
      const {
        target: { value },
      } = event;

      local.setState({ therapistRating: typeof value === 'string' ? value.split(',') : value });
    },
    [local]
  );

  const handleFilterTherapistType = useCallback(() => {
    filters.setState({ therapistType: local.state.therapistType });
  }, [filters, local.state.therapistType]);

  const handleFilterTherapistRating = useCallback(() => {
    filters.setState({ therapistRating: local.state.therapistRating });
  }, [filters, local.state.therapistRating]);

  return (
    <>
      {/* Therapist Type Filter */}
      <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
        <InputLabel htmlFor="therapist-filter-therapistType-select-label">Danışman Türü</InputLabel>
        <Select
          multiple
          value={local.state.therapistType}
          onChange={handleChangeTherapistType}
          onClose={handleFilterTherapistType}
          input={<OutlinedInput label="Danışman Türü" />}
          renderValue={(selected) => selected.map((value) => value).join(', ')}
          inputProps={{ id: 'therapist-filter-therapistType-select-label' }}
          sx={{ textTransform: 'capitalize' }}
        >
          {options.therapistType.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Checkbox
                disableRipple
                size="small"
                checked={local.state.therapistType.includes(option.value)}
              />
              {option.label}
            </MenuItem>
          ))}
          <MenuItem
            onClick={handleFilterTherapistType}
            sx={{
              justifyContent: 'center',
              fontWeight: (theme) => theme.typography.button,
              border: (theme) =>
                `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
              bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
            }}
          >
            Başvur
          </MenuItem>
        </Select>
      </FormControl>

      {/* Therapist Rating Filter */}
      <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
        <InputLabel htmlFor="therapist-filter-therapistRating-select-label">Danışman Puanı</InputLabel>
        <Select
          multiple
          value={local.state.therapistRating}
          onChange={handleChangeTherapistRating}
          onClose={handleFilterTherapistRating}
          input={<OutlinedInput label="Danışman Puanı" />}
          renderValue={(selected) => selected.map((value) => value).join(', ')}
          inputProps={{ id: 'therapist-filter-therapistRating-select-label' }}
          sx={{ textTransform: 'capitalize' }}
        >
          {options.therapistRating.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Checkbox
                disableRipple
                size="small"
                checked={local.state.therapistRating.includes(option.value)}
              />
              {option.label}
            </MenuItem>
          ))}
          <MenuItem
            disableGutters
            disableTouchRipple
            onClick={handleFilterTherapistRating}
            sx={{
              justifyContent: 'center',
              fontWeight: (theme) => theme.typography.button,
              border: (theme) =>
                `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
              bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
            }}
          >
            Başvur
          </MenuItem>
        </Select>
      </FormControl>
    </>
  );
}

