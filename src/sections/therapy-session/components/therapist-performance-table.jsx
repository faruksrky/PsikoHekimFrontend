import PropTypes from 'prop-types';

import {
  Box,
  Paper,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

// ----------------------------------------------------------------------

export function TherapistPerformanceTable({ data, showRevenue = true }) {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Veri bulunamadı
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Danışman</TableCell>
            <TableCell align="right">Toplam Seans</TableCell>
            <TableCell align="right">Tamamlanan</TableCell>
            <TableCell align="right">İptal Edilen</TableCell>
            <TableCell align="right">Tamamlanma Oranı (%)</TableCell>
            {showRevenue && (
              <>
                <TableCell align="right">Toplam Gelir (₺)</TableCell>
                <TableCell align="right">Ortalama Ücret (₺)</TableCell>
              </>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((therapist) => (
            <TableRow key={therapist.therapistId} hover>
              <TableCell component="th" scope="row">
                <Typography variant="body2" fontWeight="medium">
                  {therapist.therapistName}
                </Typography>
              </TableCell>
              <TableCell align="right">{therapist.totalSessions}</TableCell>
              <TableCell align="right">{therapist.completedSessions}</TableCell>
              <TableCell align="right">{therapist.cancelledSessions}</TableCell>
              <TableCell align="right">{therapist.completionRate}%</TableCell>
              {showRevenue && (
                <>
                  <TableCell align="right">
                    {parseFloat(therapist.totalRevenue).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    {parseFloat(therapist.avgSessionFee).toLocaleString()}
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

TherapistPerformanceTable.propTypes = {
  showRevenue: PropTypes.bool,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      therapistId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      therapistName: PropTypes.string,
      totalSessions: PropTypes.number,
      completedSessions: PropTypes.number,
      cancelledSessions: PropTypes.number,
      completionRate: PropTypes.string,
      totalRevenue: PropTypes.number,
      avgSessionFee: PropTypes.string,
    })
  ),
}; 