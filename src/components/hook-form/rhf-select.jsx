import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';

// ----------------------------------------------------------------------

export const RHFSelect = React.forwardRef(({
  name,
  native,
  children,
  slotProps,
  helperText,
  inputProps,
  InputLabelProps,
  tabIndex, // Add tabIndex prop
  ...other
}, ref) => {
  const { control } = useFormContext();

  const labelId = `${name}-select-label`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          select
          fullWidth
          SelectProps={{
            native,
            MenuProps: { PaperProps: { sx: { maxHeight: 220, ...slotProps?.paper } } },
            sx: { textTransform: 'capitalize' },
          }}
          InputLabelProps={{ htmlFor: labelId, ...InputLabelProps }}
          inputProps={{ id: labelId, tabIndex, ...inputProps }} // Add tabIndex here
          error={!!error}
          helperText={error ? error?.message : helperText}
          {...other}
          ref={ref}
        >
          {children}
        </TextField>
      )}
    />
  );
});

// ----------------------------------------------------------------------

export const RHFMultiSelect = React.forwardRef(({
  name,
  chip,
  label,
  options,
  checkbox,
  placeholder,
  slotProps,
  helperText,
  tabIndex, // Add tabIndex prop
  ...other
}, ref) => {
  const { control } = useFormContext();

  const labelId = `${name}-select-label`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        // `field.value`'ı array olarak dönüştür (string ise)
        const currentValue = Array.isArray(field.value)
          ? field.value
          : field.value?.split(",") || [];

        return (
          <FormControl error={!!error} {...other}>
            {label && (
              <InputLabel htmlFor={labelId} {...slotProps?.inputLabel}>
                {label}
              </InputLabel>
            )}

            <Select
              {...field}
              value={currentValue} // UI'da array olarak göster
              multiple
              displayEmpty={!!placeholder}
              label={label}
              renderValue={(selected) => {
                const selectedItems = options.filter((item) => selected.includes(item.value));

                if (!selectedItems.length && placeholder) {
                  return <Box sx={{ color: 'text.disabled' }}>{placeholder}</Box>;
                }

                if (chip) {
                  return (
                    <Box sx={{ gap: 0.5, display: 'flex', flexWrap: 'wrap' }}>
                      {selectedItems.map((item) => (
                        <Chip
                          key={item.value}
                          size="small"
                          variant="soft"
                          label={item.label}
                          {...slotProps?.chip}
                        />
                      ))}
                    </Box>
                  );
                }

                return selectedItems.map((item) => item.label).join(', ');
              }}
              onChange={(e) => {
                const selectedValues = e.target.value;

                // Array'i string'e dönüştürerek `field.onChange` ile kaydet
                const transformedValue = selectedValues.join(",");
                field.onChange(transformedValue); // Backend için string kaydet
              }}
              {...slotProps?.select}
              inputProps={{ id: labelId, tabIndex, ...slotProps?.select?.inputProps }} // Add tabIndex here
              ref={ref}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {checkbox && (
                    <Checkbox
                      size="small"
                      disableRipple
                      checked={currentValue.includes(option.value)} // Seçim kontrolü
                      {...slotProps?.checkbox}
                    />
                  )}

                  {option.label}
                </MenuItem>
              ))}
            </Select>

            {(!!error || helperText) && (
              <FormHelperText error={!!error} {...slotProps?.formHelperText}>
                {error ? error?.message : helperText}
              </FormHelperText>
            )}
          </FormControl>
        );
      }}
    />
  );
});
