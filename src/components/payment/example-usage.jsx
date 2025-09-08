import React, { useState } from 'react';

import { Box, Grid, Typography } from '@mui/material';

import { AssignmentStatusSelect } from '../patient';
import { AppointmentStatusSelect } from '../appointment';
import { 
  PaymentMethodSelect, 
  PaymentStatusSelect
} from '.';

// Kullanım örneği - Components nasıl kullanılır
const PaymentComponentsExample = () => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [assignmentStatus, setAssignmentStatus] = useState('');
  const [appointmentStatus, setAppointmentStatus] = useState('');
  const [multiplePaymentMethods, setMultiplePaymentMethods] = useState([]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Payment Components Kullanım Örneği
      </Typography>
      
      <Grid container spacing={3}>
        {/* Tek seçim - Ödeme Yöntemi */}
        <Grid item xs={12} md={6}>
          <PaymentMethodSelect
            value={paymentMethod}
            onChange={setPaymentMethod}
            label="Ödeme Yöntemi (Tek Seçim)"
            required
          />
        </Grid>

        {/* Çoklu seçim - Ödeme Yöntemi */}
        <Grid item xs={12} md={6}>
          <PaymentMethodSelect
            value={multiplePaymentMethods}
            onChange={setMultiplePaymentMethods}
            multiple
            label="Ödeme Yöntemleri (Çoklu Seçim)"
          />
        </Grid>

        {/* Ödeme Durumu */}
        <Grid item xs={12} md={6}>
          <PaymentStatusSelect
            value={paymentStatus}
            onChange={setPaymentStatus}
            label="Ödeme Durumu"
          />
        </Grid>

        {/* Atama Durumu */}
        <Grid item xs={12} md={6}>
          <AssignmentStatusSelect
            value={assignmentStatus}
            onChange={setAssignmentStatus}
            label="Hasta Atama Durumu"
          />
        </Grid>

        {/* Randevu Durumu */}
        <Grid item xs={12} md={6}>
          <AppointmentStatusSelect
            value={appointmentStatus}
            onChange={setAppointmentStatus}
            label="Randevu Durumu"
          />
        </Grid>

        {/* Küçük boyut örneği */}
        <Grid item xs={12} md={6}>
          <PaymentMethodSelect
            value={paymentMethod}
            onChange={setPaymentMethod}
            size="small"
            label="Küçük Boyut"
          />
        </Grid>

        {/* Disabled örneği */}
        <Grid item xs={12} md={6}>
          <PaymentMethodSelect
            value="CASH"
            onChange={() => {}}
            disabled
            label="Devre Dışı"
          />
        </Grid>
      </Grid>

      {/* Seçilen değerleri göster */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Seçilen Değerler:
        </Typography>
        <Typography>Ödeme Yöntemi: {paymentMethod || 'Seçilmedi'}</Typography>
        <Typography>Çoklu Ödeme Yöntemleri: {multiplePaymentMethods.join(', ') || 'Seçilmedi'}</Typography>
        <Typography>Ödeme Durumu: {paymentStatus || 'Seçilmedi'}</Typography>
        <Typography>Atama Durumu: {assignmentStatus || 'Seçilmedi'}</Typography>
        <Typography>Randevu Durumu: {appointmentStatus || 'Seçilmedi'}</Typography>
      </Box>
    </Box>
  );
};

export default PaymentComponentsExample; 