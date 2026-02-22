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

import { toast } from 'sonner';
import { fCurrency } from 'src/utils/format-number';
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
  onApproveSession,
  onRejectSession,
  onMarkPaymentReceived,
  onViewDetails,
  priceView = 'client',
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

  const handleApproveSession = useCallback(async () => {
    try {
      const response = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.approve}/${sessionId}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Onay başarısız');
      }
      toast.success('Seans onaylandı');
      onApproveSession?.();
    } catch (error) {
      console.error('Error approving session:', error);
      toast.error(error.message || 'Seans onaylanamadı');
    }
  }, [sessionId, onApproveSession]);

  const handleRejectSession = useCallback(async () => {
    try {
      const response = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.reject}/${sessionId}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Red başarısız');
      }
      toast.success('Seans reddedildi');
      onRejectSession?.();
    } catch (error) {
      console.error('Error rejecting session:', error);
      toast.error(error.message || 'Seans reddedilemedi');
    }
  }, [sessionId, onRejectSession]);

  const handleMarkPaymentReceived = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('jwt_access_token');
      const response = await fetch(
        `${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.updatePayment}/${sessionId}/payment`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentStatus: 'PAID',
            paymentMethod: 'NAKIT',
          }),
        }
      );
      if (!response.ok) {
        throw new Error('Ödeme güncellenemedi');
      }
      toast.success('Ödeme alındı olarak işaretlendi');
      onMarkPaymentReceived?.();
    } catch (error) {
      console.error('Error marking payment:', error);
      toast.error(error.message || 'Ödeme güncellenemedi');
    }
  }, [sessionId, onMarkPaymentReceived]);

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
      case 'PENDING_APPROVAL':
        return 'warning';
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
      case 'PENDING_APPROVAL':
        return 'Hasta Onayı Bekliyor';
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

  const priceInfo = {
    clientPrice: sessionFee ?? null,
    consultantEarning: row?.consultantEarning ?? row?.consultantFee ?? null,
  };

  const platformIncome =
    priceInfo.clientPrice !== null && priceInfo.consultantEarning !== null
      ? priceInfo.clientPrice - priceInfo.consultantEarning
      : null;

  const formatPrice = (value) => (value === null || value === undefined ? '-' : fCurrency(value));

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

        {priceView === 'admin' && (
          <>
            <TableCell onClick={onViewDetails}>
              <Typography variant="body2" noWrap>
                {formatPrice(priceInfo.clientPrice)}
              </Typography>
            </TableCell>
            <TableCell onClick={onViewDetails}>
              <Typography variant="body2" noWrap>
                {formatPrice(priceInfo.consultantEarning)}
              </Typography>
            </TableCell>
            <TableCell onClick={onViewDetails}>
              <Typography variant="body2" noWrap>
                {formatPrice(platformIncome)}
              </Typography>
            </TableCell>
          </>
        )}

        {priceView === 'consultant' && (
          <TableCell onClick={onViewDetails}>
            <Typography variant="body2" noWrap>
              {formatPrice(priceInfo.consultantEarning)}
            </Typography>
          </TableCell>
        )}

        {priceView === 'client' && (
          <TableCell onClick={onViewDetails}>
            <Typography variant="body2" noWrap>
              {formatPrice(priceInfo.clientPrice)}
            </Typography>
          </TableCell>
        )}

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

        {status === 'PENDING_APPROVAL' && priceView === 'admin' && (
          <>
            <MenuItem
              onClick={() => {
                handleApproveSession();
                popover.onClose();
              }}
            >
              <Iconify icon="solar:check-circle-bold" sx={{ color: 'success.main', mr: 1 }} />
              Hasta Adına Onayla
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleRejectSession();
                popover.onClose();
              }}
            >
              <Iconify icon="solar:close-circle-bold" sx={{ color: 'error.main', mr: 1 }} />
              Reddet
            </MenuItem>
          </>
        )}
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

        {status === 'COMPLETED' && paymentStatus === 'PENDING' && priceView === 'admin' && (
          <MenuItem
            onClick={() => {
              handleMarkPaymentReceived();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:wallet-money-bold" sx={{ color: 'success.main', mr: 1 }} />
            Ödeme Alındı
          </MenuItem>
        )}

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