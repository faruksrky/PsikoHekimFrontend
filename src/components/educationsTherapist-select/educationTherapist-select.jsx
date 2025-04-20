import { forwardRef } from 'react';

import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { filledInputClasses } from '@mui/material/FilledInput';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';

import { educationTherapistLevels } from 'src/assets/data';

import { iconifyClasses } from 'src/components/iconify';

// ----------------------------------------------------------------------

const EducationTherapistSelect = forwardRef(({
  id,
  label,
  error,
  variant,
  multiple,
  helperText,
  hiddenLabel,
  placeholder,
  getValue = 'label',
  value,
  onChange,
  ...other
}, ref) => {
  const options = educationTherapistLevels;

  const renderOption = (props, option) => (
    <li {...props} key={option.code}>
      {option.label}
    </li>
  );

  const renderInput = (params) => (
    <TextField
      {...params}
      label={label}
      variant={variant}
      placeholder={placeholder}
      helperText={helperText}
      hiddenLabel={hiddenLabel}
      error={!!error}
      inputProps={{
        ...params.inputProps,
        autoComplete: 'new-password',
      }}
      sx={{
        [`& .${outlinedInputClasses.root}`]: {
          [`& .${iconifyClasses.flag}`]: { ml: 0.5, mr: -0.5 },
        },
        [`& .${filledInputClasses.root}`]: {
          [`& .${iconifyClasses.flag}`]: {
            ml: 0.5,
            mr: -0.5,
            mt: hiddenLabel ? 0 : -2,
          },
        },
      }}
    />
  );

  const renderTags = (selectedValue, getTagProps) =>
    selectedValue.map((option, index) => (
      <Chip
        {...getTagProps({ index })}
        key={option.code}
        label={option.label}
        size="small"
        variant="soft"
      />
    ));

  const getOptionLabel = (option) => option.label;

  const isOptionEqualToValue = (option, selectedValue) => option.value === selectedValue.value;

  return (
    <Autocomplete
      id={`education-select-${id}`}
      multiple={multiple}
      options={options}
      autoHighlight={!multiple}
      disableCloseOnSelect={multiple}
      renderOption={renderOption}
      renderInput={renderInput}
      renderTags={multiple ? renderTags : undefined}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      value={options.find(opt => opt.value === value) || null}
      onChange={(event, newValue) => onChange(event, newValue ? newValue.value : '')}
      ref={ref}
      {...other}
    />
  );
});

export default EducationTherapistSelect;