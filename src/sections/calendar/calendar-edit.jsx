import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { GoogleIcon, OutlookIcon } from 'src/assets/icons';
import { CONFIG } from '../../config-global';


export function CalendarEdit() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleCalendarAuth = () => {
    setLoading(true);
    window.location.href = `${CONFIG.psikoHekimBaseUrl}${CONFIG.calendar.integrations.google.auth}`;
  };

  const handleOutlookCalendarAuth = () => {
    setLoading(true);
    window.location.href = `${CONFIG.psikoHekimBaseUrl}${CONFIG.calendar.integrations.outlook.auth}`;
  };

  const formatEventDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('tr-TR');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="contained"
          startIcon={<GoogleIcon width={28} />}
          sx={{
            backgroundColor: '#FFFFFF',
            color: '#FF0000',
            minWidth: '190px',
            border: '1px solid #FF0000',
            '&:hover': { backgroundColor: '#FFFFFF', color: '#FF0000' },
          }}
          onClick={handleGoogleCalendarAuth}
          disabled={loading}
        >
          {loading ? "Bağlanıyor..." : "Google Takvimi Ekle"}
        </Button>

        <Button
          variant="contained"
          startIcon={<OutlookIcon width={28} />}
          sx={{
            backgroundColor: '#FFFFFF',
            color: '#0078D4',
            minWidth: '190px',
            border: '1px solid #0078D4',
            '&:hover': { backgroundColor: '#F3F3F3', color: '#005A9E' },
          }}
          onClick={handleOutlookCalendarAuth}
          disabled={loading}
        >
          {loading ? "Bağlanıyor..." : "Outlook Takvimi Ekle"}
        </Button>
      </Stack>
    </Box>
  );
}
