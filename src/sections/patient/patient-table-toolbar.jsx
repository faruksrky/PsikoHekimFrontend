import { useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';

import { useSetState } from 'src/hooks/use-set-state';

// ----------------------------------------------------------------------
export function PatientTableToolbar({ filters, options }) {
  const local = useSetState({
    patientGender: filters.state.patientGender || [],
    assignmentStatus: filters.state.assignmentStatus || [],
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

  const handleChangeAssignmentStatus = useCallback(
    (event) => {
      const {
        target: { value },
      } = event;

      local.setState({ assignmentStatus: typeof value === 'string' ? value.split(',') : value });
    },
    [local]
  );

  const handleFilterAssignmentStatus = useCallback(() => {
    filters.setState({ assignmentStatus: local.state.assignmentStatus });
  }, [filters, local.state.assignmentStatus]);

  return (
    <>
      <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 }, mr: 2 }}>
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

      <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
        <InputLabel htmlFor="patient-filter-assignmentStatus-select-label">Danışman Atama Durumu</InputLabel>
        <Select
          multiple
          value={local.state.assignmentStatus}
          onChange={handleChangeAssignmentStatus}
          onClose={handleFilterAssignmentStatus}
          input={<OutlinedInput label="Danışman Atama Durumu: " />}
          renderValue={(selected) => selected.map((value) => 
            value === 'assigned' ? 'Atanmış' : value === 'unassigned' ? 'Atanmamış' : value
          ).join(', ')}
          inputProps={{ id: 'patient-filter-assignmentStatus-select-label' }}
          sx={{ textTransform: 'capitalize' }}
        >
          <MenuItem value="assigned">
            <Checkbox
              disableRipple
              size="small"
              checked={local.state.assignmentStatus.includes('assigned')}
            />
            Atanmış
          </MenuItem>
          <MenuItem value="unassigned">
            <Checkbox
              disableRipple
              size="small"
              checked={local.state.assignmentStatus.includes('unassigned')}
            />
            Atanmamış
          </MenuItem>
          <MenuItem
            onClick={handleFilterAssignmentStatus}
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
