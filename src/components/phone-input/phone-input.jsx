import { useState, forwardRef, useCallback } from 'react';
import PhoneNumberInput from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { inputBaseClasses } from '@mui/material/InputBase';

import { Iconify } from '../iconify';
import { getCountryCode } from './utils';
import { CountryListPopover } from './list';

// ----------------------------------------------------------------------

export const PhoneInput = forwardRef(
  (
    {
      sx,
      size,
      value,
      label,
      onChange,
      placeholder, 
      disableSelect = false,
      variant = 'outlined',
      ...other
    },
    ref
  ) => {
    const [searchCountry, setSearchCountry] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('TR');
    const [isOpen, setIsOpen] = useState(false);

    const hasLabel = !!label;
    const cleanValue = value?.replace(/[\s-]+/g, '') || '';

    const handleClear = useCallback(() => {
      onChange('');
    }, [onChange]);

    const handleCountryChange = useCallback((newCountry) => {
      setSelectedCountry(newCountry);
      setIsOpen(false);
    }, []);

    return (
      <Box
        sx={{
          '--popover-button-mr': '12px',
          '--popover-button-height': '22px',
          '--popover-button-width': variant === 'standard' ? '48px' : '60px',
          position: 'relative',
          [`& .${inputBaseClasses.input}`]: {
            pl: 'calc(var(--popover-button-width) + var(--popover-button-mr))',
          },
          ...sx,
        }}
      >
        <CountryListPopover
          open={isOpen}
          onClose={() => setIsOpen(false)}
          searchCountry={searchCountry}
          countryCode={selectedCountry}
          onClickCountry={handleCountryChange}
          onSearchCountry={(inputValue) => setSearchCountry(inputValue)}
          sx={{
            pl: variant === 'standard' ? 0 : 1.5,
            ...(variant === 'standard' &&
              hasLabel && {
                mt: size === 'small' ? '16px' : '20px',
              }),
            ...((variant === 'filled' || variant === 'outlined') && {
              mt: size === 'small' ? '8px' : '16px',
            }),
            ...(variant === 'filled' &&
              hasLabel && {
                mt: size === 'small' ? '21px' : '25px',
              }),
          }}
        />

        <PhoneNumberInput
          ref={ref}
          size={size}
          label={label}
          value={cleanValue}
          variant={variant}
          onChange={onChange}
          hiddenLabel={!label}
          defaultCountry="TR"
          inputComponent={CustomInput}
          InputLabelProps={{ shrink: true }}
          placeholder={placeholder ?? 'Telefon Numarası'}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton
                  size="small"
                  edge="start"
                  onClick={() => setIsOpen(true)}
                  aria-haspopup="listbox"
                  aria-expanded={isOpen}
                  aria-controls="country-select-popover"
                >
                  <Box
                    component="span"
                    sx={{
                      mr: 0.5,
                      fontSize: '0.875rem',
                      fontWeight: 'fontWeightMedium',
                    }}
                  >
                    {getCountryCode(selectedCountry)}
                  </Box>
                  <Iconify
                    width={16}
                    icon="eva:arrow-ios-downward-fill"
                    sx={{
                      ml: 0.5,
                      flexShrink: 0,
                      opacity: 0.48,
                    }}
                  />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: cleanValue && (
              <InputAdornment position="end">
                <IconButton size="small" edge="end" onClick={handleClear}>
                  <Iconify width={16} icon="mingcute:close-line" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          {...other}
        />
      </Box>
    );
  }
);

// ----------------------------------------------------------------------

const CustomInput = forwardRef((props, ref) => <TextField inputRef={ref} {...props} />);