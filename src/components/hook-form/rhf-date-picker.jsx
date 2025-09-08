import dayjs from 'dayjs';
import { forwardRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

import { formatStr } from 'src/utils/format-time';

// ----------------------------------------------------------------------

const RHFDatePicker = forwardRef(({ name, slotProps, ...other }, ref) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DatePicker
          ref={ref}
          value={field.value && dayjs(field.value).isValid() ? dayjs(field.value) : null}
          onChange={(newValue) => field.onChange(dayjs(newValue).format())}
          format={formatStr.split.date}
          slotProps={{
            ...slotProps,
            textField: {
              fullWidth: true,
              error: !!error,
              helperText: error?.message ?? slotProps?.textField?.helperText,
              ...slotProps?.textField,
            },
          }}
          {...other}
        />
      )}
    />
  );
});

// ----------------------------------------------------------------------

const RHFMobileDateTimePicker = forwardRef(({ name, slotProps, ...other }, ref) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        // Ensure the value is properly handled for dayjs
        const fieldValue = field.value && dayjs(field.value).isValid() ? dayjs(field.value) : null;
        
        return (
          <MobileDateTimePicker
            ref={ref}
            value={fieldValue}
            onChange={(newValue) => {
              // Return the Date object directly, preserving local timezone
              if (newValue) {
                field.onChange(newValue.toDate());
              } else {
                field.onChange(undefined);
              }
            }}
            format={formatStr.split.dateTime}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!error,
                helperText: error?.message ?? slotProps?.textField?.helperText,
                ...slotProps?.textField,
              },
              ...slotProps,
            }}
            {...other}
          />
        );
      }}
    />
  );
});

export { RHFDatePicker, RHFMobileDateTimePicker };