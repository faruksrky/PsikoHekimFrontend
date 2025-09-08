import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';

import { 
  Box,
  Chip,
  Avatar,
  TextField,
  Autocomplete
} from '@mui/material';

import { Iconify } from '../iconify';
import { PAYMENT_METHODS } from '../../_mock/_payment';

const PaymentMethodSelect = forwardRef(({ 
  value, 
  onChange, 
  error, 
  helperText,
  required = false,
  multiple = false,
  size = 'medium',
  fullWidth = true,
  disabled = false,
  label = 'Ödeme Yöntemi',
  placeholder = 'Ödeme yöntemi seçiniz...'
}, ref) => {
  // Seçili değeri bulma
  const selectedValue = multiple 
    ? PAYMENT_METHODS.filter(method => value?.includes(method.value))
    : PAYMENT_METHODS.find(method => method.value === value) || null;

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
      options={PAYMENT_METHODS}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, currentValue) => option.value === currentValue.value}
      disabled={disabled}
      fullWidth={fullWidth}
      size={size}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props;
        return (
          <Box component="li" key={key} {...otherProps}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                mr: 1,
                bgcolor: option.color,
                color: 'white'
              }}
            >
              <Iconify icon={option.icon} width={14} />
            </Avatar>
            {option.label}
          </Box>
        );
      }}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.value}
            size="small"
            avatar={
              <Avatar sx={{ bgcolor: option.color }}>
                <Iconify icon={option.icon} width={12} />
              </Avatar>
            }
            label={option.label}
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
            startAdornment: (
              <>
                {!multiple && selectedValue && (
                  <Avatar
                    sx={{
                      width: 20,
                      height: 20,
                      mr: 1,
                      bgcolor: selectedValue.color,
                      color: 'white'
                    }}
                  >
                    <Iconify icon={selectedValue.icon} width={12} />
                  </Avatar>
                )}
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
});

PaymentMethodSelect.propTypes = {
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

export default PaymentMethodSelect; 