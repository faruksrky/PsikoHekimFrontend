import PropTypes from 'prop-types';

import { Card, Stack, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function AnalyticsCard({ title, value, icon, color = 'primary', trend }) {
  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          {title}
        </Typography>
        <Iconify icon={icon} width={24} sx={{ color: `${color}.main` }} />
      </Stack>

      <Typography variant="h4" sx={{ mb: 1 }}>
        {value}
      </Typography>

      {trend && (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Iconify
            icon={trend > 0 ? 'solar:trending-up-bold' : 'solar:trending-down-bold'}
            width={16}
            sx={{
              color: trend > 0 ? 'success.main' : 'error.main',
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: trend > 0 ? 'success.main' : 'error.main',
            }}
          >
            {Math.abs(trend)}%
          </Typography>
        </Stack>
      )}
    </Card>
  );
}

AnalyticsCard.propTypes = {
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.string,
  color: PropTypes.string,
  trend: PropTypes.number,
}; 