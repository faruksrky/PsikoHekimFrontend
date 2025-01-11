import { forwardRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { PhoneInput } from '../phone-input';

// ----------------------------------------------------------------------

export const RHFPhoneInput = forwardRef(({ name, helperText, ...other }, ref) => {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <PhoneInput
          {...field}
          ref={ref}
          fullWidth
          value={field.value}
          onChange={(newValue) => setValue(name, newValue, { shouldValidate: true })}
          error={!!error}
          helperText={error ? error?.message : helperText}
          {...other}
        />
      )}
    />
  );
});
