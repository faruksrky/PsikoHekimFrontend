import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { paths } from 'src/routes/paths';
import { CONFIG } from 'src/config-global';
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import tr from 'date-fns/locale/tr';

export function FinanceView() {
    const [currentTab, setCurrentTab] = useState('income');
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date()); // Varsayılan: Bugün (Mevcut Ay)
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        totalProfit: 0,
    });
    const [therapistExpenses, setTherapistExpenses] = useState([]);

    const fetchFinanceData = useCallback(async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('jwt_access_token');

            const response = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.getAll}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Veri çekilemedi');
            }

            const data = await response.json();

            // Seçilen ay ve yıla göre filtrele
            const selectedMonth = selectedDate.getMonth();
            const selectedYear = selectedDate.getFullYear();

            // Sadece tamamlanmış ve ödenmiş seansları filtrele
            // Not: Gerçek senaryoda paymentStatus === 'PAID' kontrolü de yapılmalı
            // Ancak mock veride veya mevcut durumda status === 'COMPLETED' yeterli olabilir
            const completedSessions = data.filter(session => {
                const sessionDate = new Date(session.scheduledDate);
                return (
                    session.status === 'COMPLETED' &&
                    sessionDate.getMonth() === selectedMonth &&
                    sessionDate.getFullYear() === selectedYear
                );
            });

            let totalIncome = 0;
            let totalExpense = 0;
            const therapistMap = {};

            completedSessions.forEach(session => {
                const fee = session.sessionFee || 0;
                const expense = fee * 0.80; // %80 Danışman Hakedişi

                totalIncome += fee;
                totalExpense += expense;

                // Danışman bazlı hesaplama
                const therapistId = session.therapist?.id || 'unknown';
                const therapistName = session.therapist
                    ? `${session.therapist.therapistFirstName} ${session.therapist.therapistLastName}`
                    : 'Bilinmeyen Danışman';

                if (!therapistMap[therapistId]) {
                    therapistMap[therapistId] = {
                        id: therapistId,
                        name: therapistName,
                        totalSessions: 0,
                        totalAmount: 0,
                        commission: 0,
                        netPayment: 0,
                    };
                }

                therapistMap[therapistId].totalSessions += 1;
                therapistMap[therapistId].totalAmount += fee;
                therapistMap[therapistId].commission += expense;
                therapistMap[therapistId].netPayment += expense;
            });

            setSessions(completedSessions);
            setSummary({
                totalIncome,
                totalExpense,
                totalProfit: totalIncome - totalExpense,
            });
            setTherapistExpenses(Object.values(therapistMap));

        } catch (error) {
            console.error('Finans verileri yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchFinanceData();
    }, [fetchFinanceData, selectedDate]);

    const handleChangeTab = (event, newValue) => {
        setCurrentTab(newValue);
    };

    return (
        <Container maxWidth="xl">
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <CustomBreadcrumbs
                    heading="Finans Yönetimi"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Finans' },
                    ]}
                    sx={{ mb: 0 }}
                />

                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                    <DatePicker
                        views={['year', 'month']}
                        label="Ay ve Yıl Seçin"
                        value={selectedDate}
                        onChange={(newValue) => {
                            setSelectedDate(newValue);
                        }}
                        slotProps={{ textField: { size: 'small' } }}
                    />
                </LocalizationProvider>
            </Stack>

            <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid xs={12} md={4}>
                    <SummaryCard
                        title="Toplam Ciro"
                        total={summary.totalIncome}
                        icon="solar:wallet-money-bold"
                        color="primary"
                    />
                </Grid>

                <Grid xs={12} md={4}>
                    <SummaryCard
                        title="Toplam Hakediş (Gider)"
                        total={summary.totalExpense}
                        icon="solar:hand-money-bold"
                        color="warning"
                    />
                </Grid>

                <Grid xs={12} md={4}>
                    <SummaryCard
                        title="Toplam Kar"
                        total={summary.totalProfit}
                        icon="solar:chart-square-bold"
                        color="success"
                    />
                </Grid>
            </Grid>

            <Card>
                <Tabs
                    value={currentTab}
                    onChange={handleChangeTab}
                    sx={{
                        px: 2.5,
                        boxShadow: (theme) => `inset 0 -2px 0 0 ${theme.palette.grey[500_08]}`,
                    }}
                >
                    <Tab
                        value="income"
                        label="Gelirler (Seans Listesi)"
                        icon={<Iconify icon="solar:bill-list-bold" width={24} />}
                    />
                    <Tab
                        value="expense"
                        label="Giderler (Danışman Hakedişleri)"
                        icon={<Iconify icon="solar:user-id-bold" width={24} />}
                    />
                </Tabs>

                {currentTab === 'income' && (
                    <IncomeTable sessions={sessions} loading={loading} />
                )}

                {currentTab === 'expense' && (
                    <ExpenseTable therapists={therapistExpenses} loading={loading} />
                )}
            </Card>
        </Container>
    );
}

function SummaryCard({ title, total, icon, color }) {
    return (
        <Card
            sx={{
                display: 'flex',
                alignItems: 'center',
                p: 3,
            }}
        >
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                    {title}
                </Typography>
                <Typography variant="h3">{fCurrency(total)}</Typography>
            </Box>

            <Box
                sx={{
                    width: 64,
                    height: 64,
                    lineHeight: 0,
                    borderRadius: '50%',
                    bgcolor: (theme) => theme.palette[color].lighter,
                    color: (theme) => theme.palette[color].main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Iconify icon={icon} width={32} />
            </Box>
        </Card>
    );
}

function IncomeTable({ sessions, loading }) {
    return (
        <Scrollbar>
            <Table sx={{ minWidth: 800 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Tarih</TableCell>
                        <TableCell>Danışan</TableCell>
                        <TableCell>Danışman</TableCell>
                        <TableCell>Seans Tipi</TableCell>
                        <TableCell>Tutar</TableCell>
                        <TableCell>Durum</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center">Yükleniyor...</TableCell>
                        </TableRow>
                    ) : sessions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center">Veri bulunamadı</TableCell>
                        </TableRow>
                    ) : (
                        sessions.map((row) => (
                            <TableRow key={row.sessionId}>
                                <TableCell>{fDate(row.scheduledDate)}</TableCell>
                                <TableCell>
                                    {row.patient ? `${row.patient.patientFirstName} ${row.patient.patientLastName}` : '-'}
                                </TableCell>
                                <TableCell>
                                    {row.therapist ? `${row.therapist.therapistFirstName} ${row.therapist.therapistLastName}` : '-'}
                                </TableCell>
                                <TableCell>{row.sessionType}</TableCell>
                                <TableCell>{fCurrency(row.sessionFee)}</TableCell>
                                <TableCell>
                                    <Label color="success">Ödendi</Label>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </Scrollbar>
    );
}

function ExpenseTable({ therapists, loading }) {
    return (
        <Scrollbar>
            <Table sx={{ minWidth: 800 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Danışman</TableCell>
                        <TableCell>Toplam Seans</TableCell>
                        <TableCell>Toplam Ciro</TableCell>
                        <TableCell>Hakediş Oranı</TableCell>
                        <TableCell>Ödenecek Tutar</TableCell>
                        <TableCell>Durum</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center">Yükleniyor...</TableCell>
                        </TableRow>
                    ) : therapists.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center">Veri bulunamadı</TableCell>
                        </TableRow>
                    ) : (
                        therapists.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.totalSessions}</TableCell>
                                <TableCell>{fCurrency(row.totalAmount)}</TableCell>
                                <TableCell>%80</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{fCurrency(row.netPayment)}</TableCell>
                                <TableCell>
                                    <Label color="warning">Ödeme Bekliyor</Label>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </Scrollbar>
    );
}
