import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { SeoIllustration } from 'src/assets/illustrations';
import { _orders } from 'src/_mock';

import { InboxWelcome } from '../inbox-welcome';
import { InboxList } from '../inbox-list';
import { InboxWidgetSummary } from '../inbox-summary';

// ----------------------------------------------------------------------

export function InboxView() {
  const theme = useTheme();

  return (
    <DashboardContent maxWidth="xl" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <InboxWelcome
            title={`Hoşgeldiniz 👋 \n ${sessionStorage.getItem('username')}`}
            description=""
            img={<SeoIllustration hideBackground />}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <InboxWidgetSummary
            title="Toplam Aktif Kullanıcı"
            percent={2.6}
            total={18765}
            chart={{
              categories: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu'],
              series: [15, 18, 12, 51, 68, 11, 39, 37],
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <InboxWidgetSummary
            title="Toplam Kurulum"
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
            title="Toplam İndirme"
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
