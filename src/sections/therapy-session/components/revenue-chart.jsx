import PropTypes from 'prop-types';

import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

// ----------------------------------------------------------------------

export function RevenueChart({ data }) {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Veri bulunamadı
        </Typography>
      </Box>
    );
  }

  const maxRevenue = Math.max(...data.map(item => item.total));

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <Box sx={{ display: 'flex', alignItems: 'end', gap: 1, height: 200, mb: 2 }}>
        {data.map((item, index) => {
          const height = maxRevenue > 0 ? (item.total / maxRevenue) * 100 : 0;
          const paidHeight = maxRevenue > 0 ? (item.paid / maxRevenue) * 100 : 0;
          const pendingHeight = maxRevenue > 0 ? (item.pending / maxRevenue) * 100 : 0;

          return (
            <Box key={index} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                {/* Total Revenue Bar */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: '10%',
                    right: '10%',
                    height: `${height}%`,
                    backgroundColor: theme.palette.grey[300],
                    borderRadius: '4px 4px 0 0',
                  }}
                />
                
                {/* Paid Revenue Bar */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: '10%',
                    right: '10%',
                    height: `${paidHeight}%`,
                    backgroundColor: theme.palette.success.main,
                    borderRadius: '4px 4px 0 0',
                  }}
                />
                
                {/* Pending Revenue Bar */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: '10%',
                    right: '10%',
                    height: `${pendingHeight}%`,
                    backgroundColor: theme.palette.warning.main,
                    borderRadius: '4px 4px 0 0',
                  }}
                />
              </Box>
              
              <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
                {item.month}
              </Typography>
            </Box>
          );
        })}
      </Box>
      
      {/* Legend */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              backgroundColor: theme.palette.success.main,
              borderRadius: '2px',
            }}
          />
          <Typography variant="caption">Ödenen</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              backgroundColor: theme.palette.warning.main,
              borderRadius: '2px',
            }}
          />
          <Typography variant="caption">Bekleyen</Typography>
        </Box>
      </Box>
    </Box>
  );
}

RevenueChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string,
      paid: PropTypes.number,
      pending: PropTypes.number,
      total: PropTypes.number,
    })
  ),
}; 