import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { SeoIllustration } from 'src/assets/illustrations';

import { InboxWelcome } from '../inbox-welcome';
import { InboxList } from '../inbox-list';
import { InboxWidgetSummary } from '../inbox-summary';

// ----------------------------------------------------------------------

export function InboxView() {
  const theme = useTheme();

  return (
    <DashboardContent maxWidth="xl" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
     <Grid container spacing={2}>
  <Grid item xs={12}>
    <InboxWelcome
      title={`Hoşgeldiniz 👋 \n ${sessionStorage.getItem('username')}`}
      description=""
      img={<SeoIllustration hideBackground />}
      sx={{ 
        height: '80px', 
        width: '100%',
        '& .MuiBox-root': {  // img container'ı
          height: '60px',
          '& img': {         // img element'i
            height: '60px',
            width: 'auto'
          }
        }
      }}
    />
  </Grid>

        <Grid item xs={12} md={4} >
          <InboxWidgetSummary
            title="Toplam Danışan Sayısı"
            percent={2.6}
            total={3}
            chart={{
              categories: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu'],
              series: [15, 18, 12, 51, 68, 11, 39, 37],
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <InboxWidgetSummary
            title="Takvim Yükü"
            percent={0.2}
            total={4876}
            chart={{
              colors: [theme.palette.info.main],
              categories: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu'],
              series: [20, 41, 63, 33, 28, 35, 50, 46],
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <InboxWidgetSummary
            title="Toplam Danışan (Burayı soralım)"
            percent={-0.1}
            total={678}
            chart={{
              colors: [theme.palette.error.main],
              categories: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu'],
              series: [18, 19, 31, 8, 16, 37, 12, 33],
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <InboxList />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
