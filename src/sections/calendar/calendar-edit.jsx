import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box } from '@mui/material';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { GoogleIcon, OutlookIcon } from 'src/assets/icons';

import { toast } from 'src/components/snackbar';

import { CONFIG } from '../../config-global';
import { getTherapistId, getEmailFromToken } from '../../auth/context/jwt/action';


export function CalendarEdit() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleCalendarAuth = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('jwt_access_token');
      const emailData = getEmailFromToken();
      
      if (!token || !emailData || !emailData.email) {
        console.error('Token veya email bulunamadı');
        navigate('/auth/login');
        return;
      }

      const therapistId = await getTherapistId(emailData.email);
      if (!therapistId) {
        console.error('Therapist ID bulunamadı');
        toast.error('Lütfen önce bir terapist seçiniz');
        navigate('/dashboard/therapist-select');
        return;
      }

      const successRedirectUrl = encodeURIComponent(`${window.location.origin}/dashboard/calendar`);
      
      const response = await fetch(
        `${CONFIG.psikoHekimBaseUrl}${CONFIG.googleCalendar.auth}?therapistId=${therapistId}&redirectUrl=${successRedirectUrl}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      if (data.authUrl) {
        toast.success('Google Calendar\'a yönlendiriliyorsunuz...');
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Google Calendar yetkilendirme hatası:', error);
      toast.error('Google Calendar bağlantısı sırasında hata oluştu');
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
            minWidth: '200px',
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
            minWidth: '200px',
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
