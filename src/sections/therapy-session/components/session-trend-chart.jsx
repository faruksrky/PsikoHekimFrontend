import PropTypes from 'prop-types';
import { Line, XAxis, YAxis, Legend, Tooltip, LineChart, CartesianGrid, ResponsiveContainer } from 'recharts';

import { Box } from '@mui/material';

// ----------------------------------------------------------------------

export function SessionTrendChart({ data, showRevenue = true }) {
  const chartData = data.map((item) => ({
    name: item.month,
    Toplam: item.total,
    Tamamlanan: item.completed,
    İptal: item.cancelled,
    ...(showRevenue && { Gelir: item.revenue / 1000 }),
  }));

  return (
    <Box sx={{ height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" />
          {showRevenue && <YAxis yAxisId="right" orientation="right" />}
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="Toplam"
            stroke="#8884d8"
            strokeWidth={2}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="Tamamlanan"
            stroke="#82ca9d"
            strokeWidth={2}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="İptal"
            stroke="#ff7300"
            strokeWidth={2}
          />
          {showRevenue && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Gelir"
              stroke="#8884d8"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

SessionTrendChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string,
      total: PropTypes.number,
      completed: PropTypes.number,
      cancelled: PropTypes.number,
      revenue: PropTypes.number,
    })
  ),
}; 