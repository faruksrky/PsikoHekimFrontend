import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { CustomPopover, usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function TherapistPatientCard({ patient }) {
    const router = useRouter();
    const popover = usePopover();

    const {
        id,
        patientFirstName,
        patientLastName,
        patientEmail,
        patientPhoneNumber,
        patientCity,
        patientGender,
        patientAge,
    } = patient;

    const handleViewDetails = () => {
        popover.onClose();
        router.push(paths.dashboard.patient.details(id));
    };

    const handleEdit = () => {
        popover.onClose();
        router.push(paths.dashboard.patient.edit(id));
    };

    return (
        <>
            <Card sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 9 }}>
                    <IconButton onClick={popover.onOpen}>
                        <Iconify icon="eva:more-vertical-fill" width={18} />
                    </IconButton>
                </Box>

                <Box sx={{ p: 3, pb: 2 }}>
                    <Avatar
                        alt={`${patientFirstName} ${patientLastName}`}
                        sx={{
                            width: 64,
                            height: 64,
                            mx: 'auto',
                            mb: 2,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            fontSize: 24,
                        }}
                    >
                        {patientFirstName?.charAt(0).toUpperCase()}
                        {patientLastName?.charAt(0).toUpperCase()}
                    </Avatar>

                    <Typography variant="subtitle1" noWrap sx={{ mb: 0.5 }}>
                        {patientFirstName} {patientLastName}
                    </Typography>

                    <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                        {patientEmail}
                    </Typography>

                    <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mt: 1, mb: 2, color: 'text.secondary', typography: 'caption' }}>
                        <Iconify icon="solar:phone-bold" width={14} sx={{ mr: 0.5 }} />
                        {patientPhoneNumber}
                    </Stack>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Box
                    display="grid"
                    gridTemplateColumns="repeat(3, 1fr)"
                    sx={{ py: 2, typography: 'subtitle2' }}
                >
                    <div>
                        <Typography variant="caption" component="div" sx={{ mb: 0.5, color: 'text.secondary' }}>
                            Yaş
                        </Typography>
                        {patientAge}
                    </div>

                    <div>
                        <Typography variant="caption" component="div" sx={{ mb: 0.5, color: 'text.secondary' }}>
                            Cinsiyet
                        </Typography>
                        {patientGender}
                    </div>

                    <div>
                        <Typography variant="caption" component="div" sx={{ mb: 0.5, color: 'text.secondary' }}>
                            Şehir
                        </Typography>
                        {patientCity}
                    </div>
                </Box>
            </Card>

            <CustomPopover
                open={popover.open}
                anchorEl={popover.anchorEl}
                onClose={popover.onClose}
                slotProps={{ arrow: { placement: 'right-top' } }}
            >
                <MenuItem onClick={handleViewDetails}>
                    <Iconify icon="solar:eye-bold" />
                    Detaylar
                </MenuItem>

                <MenuItem onClick={handleEdit}>
                    <Iconify icon="solar:pen-bold" />
                    Düzenle
                </MenuItem>
            </CustomPopover>
        </>
    );
}

TherapistPatientCard.propTypes = {
    patient: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        patientFirstName: PropTypes.string,
        patientLastName: PropTypes.string,
        patientEmail: PropTypes.string,
        patientPhoneNumber: PropTypes.string,
        patientCity: PropTypes.string,
        patientGender: PropTypes.string,
        patientAge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
};
