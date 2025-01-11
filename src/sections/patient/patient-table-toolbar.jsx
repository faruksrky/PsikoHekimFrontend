import { useCallback } from 'react';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';

import { useSetState } from 'src/hooks/use-set-state';

import { varAlpha } from 'src/theme/styles';

// ----------------------------------------------------------------------
export function PatientTableToolbar({ filters, options }) {
  const local = useSetState({
    patientGender: filters.state.patientGender || [],
  });

  const handleChangePatientGender = useCallback(
    (event) => {
      const {
        target: { value },
      } = event;

      local.setState({ patientGender: typeof value === 'string' ? value.split(',') : value });
    },
    [local]
  );

  const handleFilterPatientGender = useCallback(() => {
    filters.setState({ patientGender: local.state.patientGender });
  }, [filters, local.state.patientGender]);

  return (
    <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
      <InputLabel htmlFor="patient-filter-patientGender-select-label">Cinsiyet</InputLabel>
      <Select
        multiple
        value={local.state.patientGender}
        onChange={handleChangePatientGender}
        onClose={handleFilterPatientGender}
        input={<OutlinedInput label="Cinsiyet: " />}
        renderValue={(selected) => selected.map((value) => value).join(', ')}
        inputProps={{ id: 'patient-filter-patientGender-select-label' }}
        sx={{ textTransform: 'capitalize' }}
      >
        {options.patientGender.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Checkbox
              disableRipple
              size="small"
              checked={local.state.patientGender.includes(option.value)}
            />
            {option.label}
          </MenuItem>
        ))}
        <MenuItem
          onClick={handleFilterPatientGender}
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
  );
}
