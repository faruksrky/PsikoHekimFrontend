import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { sentenceCase } from 'src/utils/change-case';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

export function PatientTableFiltersResult({ filters, totalResults, sx }) {
  const handleRemovePatientGender = useCallback(
    (inputValue) => {
      const newValue = filters.state.patientGender.filter((item) => item !== inputValue);
      filters.setState({ patientGender: newValue });
    },
    [filters]
  );

  return (
    <FiltersResult totalResults={totalResults} onReset={filters.onResetState} sx={sx}>
      <FiltersBlock label="Cinsiyet:" isShow={!!filters.state.patientGender.length}>
        {filters.state.patientGender.map((item) => (
          <Chip
            {...chipProps}
            key={item}
            label={sentenceCase(item)}
            onDelete={() => handleRemovePatientGender(item)}
          />
        ))}
      </FiltersBlock>

    </FiltersResult>
  );
}
