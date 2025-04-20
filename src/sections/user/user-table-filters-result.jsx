import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

export function UserTableFiltersResult({ filters, onResetPage, totalResults, sx }) {
  const handleRemoveFirstName = useCallback(() => {
    onResetPage();
    filters.setState({ firstName: '' });
  }, [filters, onResetPage]);

  const handleRemoveLastName = useCallback(() => {
    onResetPage();
    filters.setState({ lastName: '' });
  }, [filters, onResetPage]);

  const handleRemoveStatus = useCallback(() => {
    onResetPage();
    filters.setState({ status: 'all' });
  }, [filters, onResetPage]);

  const handleReset = useCallback(() => {
    onResetPage();
    filters.onResetState();
  }, [filters, onResetPage]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="Servis Tamamlanma Durumu:" isShow={filters.state.status !== 'all'}>
        <Chip
          {...chipProps}
          label={filters.state.status}
          onDelete={handleRemoveStatus}
          sx={{ textTransform: 'capitalize' }}
        />
      </FiltersBlock>

      <FiltersBlock label="Adı:" isShow={!!filters.state.firstName}>
        <Chip {...chipProps} label={filters.state.firstName} onDelete={handleRemoveFirstName} />
      </FiltersBlock>

      <FiltersBlock label="Soyadı:" isShow={!!filters.state.lastName}>
        <Chip {...chipProps} label={filters.state.lastName} onDelete={handleRemoveLastName} />
      </FiltersBlock>
    </FiltersResult>
  );
}