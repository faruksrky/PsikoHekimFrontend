import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { sentenceCase } from 'src/utils/change-case';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

export function TherapistTableFiltersResult({ filters, totalResults, sx }) {
  // therapistType filtresini kaldırma
  const handleRemoveTherapistType = useCallback(
    (inputValue) => {
      const newValue = filters.state.therapistType.filter((item) => item !== inputValue);
      filters.setState({ therapistType: newValue });
    },
    [filters]
  );

  // therapistRating filtresini kaldırma
  const handleRemoveTherapistRating = useCallback(
    (inputValue) => {
      const newValue = filters.state.therapistRating.filter((item) => item !== inputValue);
      filters.setState({ therapistRating: newValue });
    },
    [filters]
  );

  return (
    <FiltersResult totalResults={totalResults} onReset={filters.onResetState} sx={sx}>
      {/* Danışman Türü Filtreleri */}
      <FiltersBlock label="Danışman Türü:" isShow={!!filters.state.therapistType.length}>
        {filters.state.therapistType.map((item) => (
          <Chip
            {...chipProps}
            key={item}
            label={sentenceCase(item)}
            onDelete={() => handleRemoveTherapistType(item)}
          />
        ))}
      </FiltersBlock>

      <FiltersBlock label="Danışman Puanı:" isShow={!!filters.state.therapistRating.length}>
        {filters.state.therapistRating.map((item) => (
          <Chip
            {...chipProps}
            key={item}
            label={sentenceCase(item)}
            onDelete={() => handleRemoveTherapistRating(item)}
          />
        ))}
      </FiltersBlock>

    </FiltersResult>
  );
}
