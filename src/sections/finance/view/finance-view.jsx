import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
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

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { toast } from 'sonner';
import tr from 'date-fns/locale/tr';

export function FinanceView() {
    const [currentTab, setCurrentTab] = useState('income');
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        totalPaid: 0,
        totalPending: 0,
        totalProfit: 0,
    });
    const [therapistExpenses, setTherapistExpenses] = useState([]);
    const [markingPaid, setMarkingPaid] = useState(null);

    const fetchFinanceData = useCallback(async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('jwt_access_token');
            const month = selectedDate.getMonth() + 1;
            const year = selectedDate.getFullYear();

            const response = await fetch(
                `${CONFIG.psikoHekimBaseUrl}${CONFIG.finance.monthlySummary}?year=${year}&month=${month}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Veri çekilemedi');
            }

            const data = await response.json();

            setSessions(data.sessions || []);
            setSummary({
                totalIncome: Number(data.totalIncome) || 0,
                totalExpense: Number(data.totalExpense) || 0,
                totalPaid: Number(data.totalPaid) || 0,
                totalPending: Number(data.totalPending) || 0,
                totalProfit: Number(data.totalProfit) || 0,
            });
            setTherapistExpenses(data.therapistExpenses || []);
        } catch (error) {
            console.error('Finans verileri yüklenirken hata:', error);
            toast.error('Finans verileri yüklenemedi');
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchFinanceData();
    }, [fetchFinanceData]);

    const handleMarkTherapistPaid = useCallback(
        async (therapistId) => {
            try {
                setMarkingPaid(therapistId);
                const token = sessionStorage.getItem('jwt_access_token');
                const month = selectedDate.getMonth() + 1;
                const year = selectedDate.getFullYear();

                const response = await fetch(
                    `${CONFIG.psikoHekimBaseUrl}${CONFIG.finance.markTherapistPaid}?therapistId=${therapistId}&year=${year}&month=${month}`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Ödeme işaretlenemedi');
                }

                toast.success('Ödeme başarıyla işaretlendi');
                fetchFinanceData();
            } catch (error) {
                console.error('Ödeme işaretlenirken hata:', error);
                toast.error('Ödeme işaretlenemedi');
            } finally {
                setMarkingPaid(null);
            }
        },
        [selectedDate, fetchFinanceData]
    );

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
                        onChange={(newValue) => setSelectedDate(newValue)}
                        slotProps={{ textField: { size: 'small' } }}
                    />
                </LocalizationProvider>
            </Stack>

            <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid xs={12} sm={6} md={2.4}>
                    <SummaryCard
                        title="Toplam Ciro"
                        total={summary.totalIncome}
                        icon="solar:wallet-money-bold"
                        color="primary"
                    />
                </Grid>
                <Grid xs={12} sm={6} md={2.4}>
                    <SummaryCard
                        title="Toplam Hakediş"
                        total={summary.totalExpense}
                        icon="solar:hand-money-bold"
                        color="warning"
                    />
                </Grid>
                <Grid xs={12} sm={6} md={2.4}>
                    <SummaryCard
                        title="Ödenen"
                        total={summary.totalPaid}
                        icon="solar:check-circle-bold"
                        color="success"
                    />
                </Grid>
                <Grid xs={12} sm={6} md={2.4}>
                    <SummaryCard
                        title="Bekleyen"
                        total={summary.totalPending}
                        icon="solar:clock-circle-bold"
                        color="error"
                    />
                </Grid>
                <Grid xs={12} sm={6} md={2.4}>
                    <SummaryCard
                        title="Kar"
                        total={summary.totalProfit}
                        icon="solar:chart-square-bold"
                        color="info"
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
                    <ExpenseTable
                        therapists={therapistExpenses}
                        loading={loading}
                        selectedDate={selectedDate}
                        onMarkPaid={handleMarkTherapistPaid}
                        markingPaid={markingPaid}
                    />
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
                                    {row.patient
                                        ? `${row.patient.patientFirstName} ${row.patient.patientLastName}`
                                        : '-'}
                                </TableCell>
                                <TableCell>
                                    {row.therapist
                                        ? `${row.therapist.therapistFirstName} ${row.therapist.therapistLastName}`
                                        : '-'}
                                </TableCell>
                                <TableCell>{row.sessionType || '-'}</TableCell>
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

function ExpenseTable({ therapists, loading, selectedDate, onMarkPaid, markingPaid }) {
    const getStatusLabel = (status) => {
        if (status === 'FULLY_PAID') return { text: 'Ödendi', color: 'success' };
        if (status === 'PARTIAL') return { text: 'Kısmi Ödendi', color: 'warning' };
        return { text: 'Bekliyor', color: 'error' };
    };

    return (
        <Scrollbar>
            <Table sx={{ minWidth: 800 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Danışman</TableCell>
                        <TableCell>Seans</TableCell>
                        <TableCell>Toplam Hakediş</TableCell>
                        <TableCell>Ödenen</TableCell>
                        <TableCell>Bekleyen</TableCell>
                        <TableCell>Durum</TableCell>
                        <TableCell align="right">İşlem</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={7} align="center">Yükleniyor...</TableCell>
                        </TableRow>
                    ) : therapists.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} align="center">Veri bulunamadı</TableCell>
                        </TableRow>
                    ) : (
                        therapists.map((row) => {
                            const statusInfo = getStatusLabel(row.status);
                            const hasPending = row.pendingAmount > 0;
                            const isMarking = markingPaid === row.therapistId;

                            return (
                                <TableRow key={row.therapistId}>
                                    <TableCell>{row.therapistName}</TableCell>
                                    <TableCell>{row.sessionCount}</TableCell>
                                    <TableCell>{fCurrency(row.totalEarning)}</TableCell>
                                    <TableCell sx={{ color: 'success.main' }}>
                                        {fCurrency(row.paidAmount)}
                                    </TableCell>
                                    <TableCell sx={{ color: hasPending ? 'error.main' : 'text.secondary' }}>
                                        {fCurrency(row.pendingAmount)}
                                    </TableCell>
                                    <TableCell>
                                        <Label color={statusInfo.color}>{statusInfo.text}</Label>
                                    </TableCell>
                                    <TableCell align="right">
                                        {hasPending && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="primary"
                                                onClick={() => onMarkPaid(row.therapistId)}
                                                disabled={isMarking}
                                                startIcon={
                                                    <Iconify
                                                        icon={isMarking ? 'eos-icons:loading' : 'solar:check-circle-bold'}
                                                        width={18}
                                                    />
                                                }
                                            >
                                                {isMarking ? 'İşleniyor...' : 'Ödeme Yap'}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </Scrollbar>
    );
}
