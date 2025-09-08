import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';

import { 
  Box,
  Chip,
  TextField,
  Autocomplete
} from '@mui/material';

import { PAYMENT_STATUSES } from '../../_mock/_payment';

const PaymentStatusSelect = forwardRef(({ 
  value, 
  onChange, 
  error, 
  helperText,
  required = false,
  multiple = false,
  size = 'medium',
  fullWidth = true,
  disabled = false,
  label = 'Ödeme Durumu',
  placeholder = 'Ödeme durumu seçiniz...'
}, ref) => {
  // Seçili değeri bulma
  const selectedValue = multiple 
    ? PAYMENT_STATUSES.filter(status => value?.includes(status.value))
    : PAYMENT_STATUSES.find(status => status.value === value) || null;

  const handleChange = (event, newValue) => {
    if (multiple) {
      onChange(newValue?.map(option => option.value) || []);
    } else {
      onChange(newValue?.value || '');
    }
  };

  return (
    <Autocomplete
      multiple={multiple}
      value={selectedValue}
      onChange={handleChange}
      options={PAYMENT_STATUSES}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, currentValue) => option.value === currentValue.value}
      disabled={disabled}
      fullWidth={fullWidth}
      size={size}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: option.color,
              mr: 1
            }}
          />
          {option.label}
        </Box>
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.value}
            size="small"
            label={option.label}
            sx={{
              bgcolor: option.color,
              color: 'white',
              '& .MuiChip-deleteIcon': {
                color: 'white'
              }
            }}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          required={required}
          InputProps={{
            ...params.InputProps,
            startAdornment: !multiple && selectedValue && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: selectedValue.color,
                  mr: 1
                }}
              />
            ),
          }}
        />
      )}
    />
  );
});

PaymentStatusSelect.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  multiple: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  placeholder: PropTypes.string,
};

export default PaymentStatusSelect; 