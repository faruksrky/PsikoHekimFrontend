import { useState, useCallback } from 'react';

import {
  Box,
  Chip,
  Stack,
  Button,
  Avatar,
  Tooltip,
  MenuItem,
  Checkbox,
  TableRow,
  TableCell,
  IconButton,
  Typography,
} from '@mui/material';

import { fDate, fTime } from 'src/utils/format-time';

import { CONFIG } from 'src/config-global';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export function TherapySessionTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onCompleteSession,
  onCancelSession,
  onRescheduleSession,
  onViewDetails,
}) {
  const {
    sessionId,
    patient,
    therapist,
    scheduledDate,
    actualStartTime,
    actualEndTime,
    status,
    sessionType,
    sessionFormat,
    sessionFee,
    paymentStatus,
    sessionNotes,
    cancellationReason,
  } = row;

  const [openConfirm, setOpenConfirm] = useState(false);
  const [openPopover, setOpenPopover] = useState(null);

  const popover = usePopover();

  // Patient ve therapist adlarını hazırla
  const patientName = patient ? `${patient.patientFirstName || ''} ${patient.patientLastName || ''}`.trim() : 'Bilinmeyen Danışan';
  const therapistName = therapist ? `${therapist.therapistFirstName || ''} ${therapist.therapistLastName || ''}`.trim() : 'Bilinmeyen Danışman';

  const handleOpenConfirm = useCallback(() => {
    setOpenConfirm(true);
  }, []);

  const handleCloseConfirm = useCallback(() => {
    setOpenConfirm(false);
  }, []);

  const handleOpenPopover = useCallback((event) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleCompleteSession = useCallback(async () => {
    try {
      const response = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.complete}/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionNotes: '',
          therapistNotes: '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete session');
      }

      onCompleteSession?.();
    } catch (error) {
      console.error('Error completing session:', error);
    }
  }, [sessionId, onCompleteSession]);

  const handleCancelSession = useCallback(async () => {
    try {
      const response = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.cancel}/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'İptal edildi',
          cancelledBy: 'THERAPIST',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel session');
      }

      onCancelSession?.();
    } catch (error) {
      console.error('Error cancelling session:', error);
    }
  }, [sessionId, onCancelSession]);

  const handleRescheduleSession = useCallback(() => {
    onRescheduleSession?.();
  }, [onRescheduleSession]);

  const handleDeleteSession = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('jwt_access_token');
      const response = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.delete}/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      onDeleteRow?.(sessionId);
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }, [sessionId, onDeleteRow]);

  const getStatusColor = (sessionStatus) => {
    switch (sessionStatus) {
      case 'COMPLETED':
        return 'success';
      case 'SCHEDULED':
        return 'info';
      case 'IN_PROGRESS':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      case 'NO_SHOW':
        return 'default';
      case 'RESCHEDULED':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (sessionStatus) => {
    switch (sessionStatus) {
      case 'COMPLETED':
        return 'Tamamlandı';
      case 'SCHEDULED':
        return 'Planlandı';
      case 'IN_PROGRESS':
        return 'Devam Ediyor';
      case 'CANCELLED':
        return 'İptal Edildi';
      case 'NO_SHOW':
        return 'Gelmedi';
      case 'RESCHEDULED':
        return 'Yeniden Planlandı';
      default:
        return sessionStatus;
    }
  };

  const getPaymentStatusColor = (payStatus) => {
    switch (payStatus) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'PARTIAL':
        return 'info';
      case 'NOT_APPLICABLE':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPaymentStatusLabel = (payStatus) => {
    switch (payStatus) {
      case 'PAID':
        return 'Ödendi';
      case 'PENDING':
        return 'Bekliyor';
      case 'PARTIAL':
        return 'Kısmi';
      case 'NOT_APPLICABLE':
        return 'Geçerli Değil';
      default:
        return payStatus;
    }
  };

  const getSessionTypeLabel = (type) => {
    switch (type) {
      case 'INDIVIDUAL':
        return 'Bireysel';
      case 'GROUP':
        return 'Grup';
      case 'COUPLE':
        return 'Çift';
      case 'FAMILY':
        return 'Aile';
      default:
        return type;
    }
  };

  const getSessionFormatLabel = (format) => {
    switch (format) {
      case 'IN_PERSON':
        return 'Yüz Yüze';
      case 'ONLINE':
        return 'Online';
      case 'PHONE':
        return 'Telefon';
      default:
        return format;
    }
  };

  const isActionDisabled = (action) => {
    switch (action) {
      case 'complete':
        return status !== 'SCHEDULED' && status !== 'IN_PROGRESS';
      case 'cancel':
        return status === 'COMPLETED' || status === 'CANCELLED' || status === 'NO_SHOW';
      case 'reschedule':
        return status === 'COMPLETED' || status === 'CANCELLED' || status === 'NO_SHOW';
      case 'edit':
        return status === 'COMPLETED';
      default:
        return false;
    }
  };

  return (
    <>
      <TableRow hover selected={selected} sx={{ cursor: 'pointer' }}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell onClick={onViewDetails}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={patientName} src={patient?.avatarUrl}>
              {patientName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" noWrap>
                {patientName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                {patient?.patientEmail}
              </Typography>
            </Box>
          </Stack>
        </TableCell>

        <TableCell onClick={onViewDetails}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={therapistName} src={therapist?.avatarUrl}>
              {therapistName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" noWrap>
                {therapistName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                {therapist?.therapistEmail}
              </Typography>
            </Box>
          </Stack>
        </TableCell>

        <TableCell onClick={onViewDetails}>
          <Box>
            <Typography variant="body2" noWrap>
              {fDate(scheduledDate)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
              {fTime(scheduledDate)}
            </Typography>
          </Box>
        </TableCell>

        <TableCell onClick={onViewDetails}>
          <Label
            variant="soft"
            color={getStatusColor(status)}
          >
            {getStatusLabel(status)}
          </Label>
        </TableCell>

        <TableCell onClick={onViewDetails}>
          <Typography variant="body2" noWrap>
            {getSessionTypeLabel(sessionType)}
          </Typography>
        </TableCell>

        <TableCell onClick={onViewDetails}>
          <Chip
            size="small"
            variant="outlined"
            label={getSessionFormatLabel(sessionFormat)}
            color={sessionFormat === 'ONLINE' ? 'primary' : 'default'}
          />
        </TableCell>

        <TableCell onClick={onViewDetails}>
          <Label
            variant="soft"
            color={getPaymentStatusColor(paymentStatus)}
          >
            {getPaymentStatusLabel(paymentStatus)}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Hızlı Aksiyonlar">
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        anchorEl={popover.anchorEl}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            onViewDetails();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          Detaylar
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
          disabled={status === 'COMPLETED' || status === 'CANCELLED'}
        >
          <Iconify icon="solar:pen-bold" />
          Düzenle
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCompleteSession();
            popover.onClose();
          }}
          disabled={status === 'COMPLETED' || status === 'CANCELLED'}
        >
          <Iconify icon="solar:check-circle-bold" />
          Tamamla
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleRescheduleSession();
            popover.onClose();
          }}
          disabled={status === 'COMPLETED' || status === 'CANCELLED'}
        >
          <Iconify icon="solar:calendar-mark-bold" />
          Yeniden Planla
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCancelSession();
            popover.onClose();
          }}
          disabled={status === 'COMPLETED' || status === 'CANCELLED'}
        >
          <Iconify icon="solar:close-circle-bold" />
          İptal Et
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleDeleteSession();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Sil
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Seansı Sil"
        content="Bu seansı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteSession();
              handleCloseConfirm();
            }}
          >
            Sil
          </Button>
        }
      />
    </>
  );
} 