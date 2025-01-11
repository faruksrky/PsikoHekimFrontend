import { forwardRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { EducationTherapistSelect } from 'src/components/educationsTherapist-select';
  
// ----------------------------------------------------------------------

export const RHFEducationTherapistSelect = forwardRef (({ name, helperText,tabIndex, ...other }, ref) => {
  const { control, setValue } = useFormContext();

  return (
    <Controller 
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <EducationTherapistSelect
          id={`rhf-education-select-${name}`}
          ref={ref}
          value={field.value}
          onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
          error={!!error}
          helperText={error?.message ?? helperText}
          {...other}
        />
      )}
    />
  );
});