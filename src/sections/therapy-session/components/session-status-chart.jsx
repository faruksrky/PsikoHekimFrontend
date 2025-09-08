import PropTypes from 'prop-types';

import { useTheme } from '@mui/material/styles';
import { Box, Card, Typography } from '@mui/material';

// ----------------------------------------------------------------------

export function SessionStatusChart({ data }) {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Veri bulunamadı
        </Typography>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {data.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: item.color,
              }}
            />
            <Typography variant="body2" sx={{ flex: 1 }}>
              {item.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.value} ({((item.value / total) * 100).toFixed(1)}%)
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

SessionStatusChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.number,
      color: PropTypes.string,
    })
  ),
}; 