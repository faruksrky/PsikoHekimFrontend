import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import { SimpleLayout } from 'src/layouts/simple';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <SimpleLayout>
      <Helmet>
        <title> Yetkisiz Erişim | PsikoHekim</title>
      </Helmet>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            maxWidth: '480px',
            width: '100%',
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              fontSize: '120px',
              color: '#ff6b6b',
              marginBottom: '24px',
            }}
          >
            <Iconify icon="eva:shield-off-fill" />
          </Box>

          {/* Title */}
          <Box
            component="h1"
            sx={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#212b36',
              marginBottom: '16px',
            }}
          >
            Yetkisiz Erişim
          </Box>

          {/* Description */}
          <Box
            component="p"
            sx={{
              fontSize: '16px',
              color: '#637381',
              marginBottom: '32px',
              lineHeight: '1.6',
            }}
          >
            Bu sayfaya erişim yetkiniz bulunmuyor. Lütfen sistem yöneticinizle iletişime geçin.
          </Box>

          {/* Actions */}
          <Box
            sx={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handleGoBack}
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
            >
              Geri Dön
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={handleGoHome}
              startIcon={<Iconify icon="eva:home-fill" />}
            >
              Ana Sayfa
            </Button>
          </Box>
        </Box>
      </Box>
    </SimpleLayout>
  );
}
