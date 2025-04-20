import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'src/components/snackbar';

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
import { getEmailFromToken } from '../../auth/context/jwt/action';


export function CalendarEdit() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getTherapistId = async (email) => {
    try {
      const token = sessionStorage.getItem('jwt_access_token');
      const response = await fetch(
        `${CONFIG.psikoHekimBaseUrl}/api/therapist/by-email?email=${email}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Lütfen önce bir terapist seçiniz');
        navigate('/dashboard/therapist-select'); // Terapist seçim sayfasına yönlendir
        return null;
      }
      
      const therapistId = await response.json();
      return therapistId;
    } catch (error) {
      console.error('Therapist ID alınamadı:', error);
      toast.error('Lütfen önce bir terapist seçiniz');
      navigate('/dashboard/therapist-select'); // Terapist seçim sayfasına yönlendir
      return null;
    }
  };

  const handleGoogleCalendarAuth = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('jwt_access_token');
      const email = getEmailFromToken();
      
      if (!token || !email) {
        console.error('Token veya email bulunamadı');
        navigate('/auth/login');
        return;
      }

      const therapistId = await getTherapistId(email);
      if (!therapistId) {
        console.error('Therapist ID bulunamadı');
        return;
      }

      const response = await fetch(
        `${CONFIG.psikoHekimBaseUrl}${CONFIG.googleCalendar.auth}?therapistId=${therapistId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Google Calendar yetkilendirme hatası:', error);
    } finally {
      setLoading(false);
    }
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
