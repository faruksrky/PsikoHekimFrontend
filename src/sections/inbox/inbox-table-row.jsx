import { useState } from 'react';
import { format } from 'date-fns';
import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuList from '@mui/material/MenuList';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { ProcessFlowDialog } from 'src/sections/process/components';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export function InboxTableRow({ row, selected, onSelectRow, onDeleteRow, detailsHref, onApprove, onReject }) {
  const { processName, description, startedBy, createdAt, status, patientName, processInstanceKey } = row;
  const confirmDialog = useBoolean();
  const rejectDialog = useBoolean();
  const menuActions = usePopover();
  const collapseRow = useBoolean();
  const processFlowDialog = useBoolean();
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const handleViewProcessFlow = async () => {
    // Description'dan danışman adını çıkar
    // Format: "Deniz Gezmiş isimli danışandan Melike Dag için atama isteği gönderildi"
    const therapistName = row.description?.match(/danışandan (.+?) için/i)?.[1] || 
                         row.description?.match(/için (.+?) için/i)?.[1] ||
                         'Bilinmiyor';
    
    // Mevcut row data'sını kullanarak process flow göster
    const processData = {
      processInstanceKey: row.processInstanceKey,
      processName: row.processName || 'Danışan Atama İsteği',
      description: row.description,
      status: row.status,
      patientName: row.patientName,
      therapistName,
      startedBy: row.startedBy,
      createdAt: row.createdAt,
      // BPMN response format'ına uygun hale getir
      therapistId: row.therapistId || 'N/A',
      patientId: row.patientId || 'N/A'
    };
    setSelectedAssignment(processData);
    processFlowDialog.onTrue();
  };

  const renderPrimaryRow = () => (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onClick={onSelectRow}
          inputProps={{
            id: `${row.id}-checkbox`,
            'aria-label': `${row.id} checkbox`,
          }}
        />
      </TableCell>

    

      <TableCell>
        <Typography variant="subtitle2">{processName}</Typography>
      </TableCell>

      <TableCell>
        <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar alt={startedBy} src={null} />

          <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
            <Box component="span">{startedBy}</Box>
          </Stack>
        </Box>
      </TableCell>

      <TableCell>
        <Typography variant="subtitle2">{description}</Typography>
      </TableCell>

      <TableCell>
        <Typography variant="subtitle2">
          {createdAt ? format(new Date(createdAt), 'dd MMM yyyy') : '-'}
        </Typography>
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={
            (status === 'PENDING' && 'warning') ||
            (status === 'REJECTED' && 'error') ||
            (status === 'ACCEPTED' && 'success') ||
            'default'
          }
        >
          {status}
        </Label>
      </TableCell>

      <TableCell>
        <IconButton color={menuActions.open ? 'inherit' : 'default'} onClick={menuActions.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  const renderSecondaryRow = () => (
    <TableRow>
      <TableCell sx={{ p: 0, border: 'none' }} colSpan={8}>
        <Collapse
          in={collapseRow.value}
          timeout="auto"
          unmountOnExit
          sx={{ bgcolor: 'background.neutral' }}
        >
          <Paper sx={{ m: 1.5 }}>
            <Box
              sx={(theme) => ({
                display: 'flex',
                alignItems: 'center',
                p: theme.spacing(1.5, 2, 1.5, 1.5),
              })}
            >
              <ListItemText
                primary={processName}
                secondary={description}
                primaryTypographyProps={{
                  sx: { typography: 'body2' },
                }}
                secondaryTypographyProps={{
                  sx: { mt: 0.5, color: 'text.disabled' },
                }}
              />
            </Box>
          </Paper>
        </Collapse>
      </TableCell>
    </TableRow>
  );

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      arrow="right-top"
    >
      <MenuList>
        <MenuItem
          onClick={() => {
            handleViewProcessFlow();
            menuActions.onClose();
          }}
        >
          <Iconify icon="solar:diagram-bold" sx={{ color: 'info.main', mr: 1 }} />
          Akış Sürecini Görüntüle
        </MenuItem>
        
        {status === 'PENDING' && (
          <>
            <MenuItem
              onClick={() => {
                confirmDialog.onTrue();
                menuActions.onClose();
              }}
            >
              <Iconify icon="solar:check-circle-bold" sx={{ color: 'success.main', mr: 1 }} />
              Akışı Onayla
            </MenuItem>

            <MenuItem 
              onClick={() => {
                rejectDialog.onTrue();
                menuActions.onClose();
              }}
            >
              <Iconify icon="solar:close-circle-bold" sx={{ color: 'error.main', mr: 1 }} />
              Akışı Reddet
            </MenuItem>
          </>
        )}
        {status !== 'PENDING' && (
          <MenuItem disabled>
            <Iconify icon="solar:info-circle-bold" sx={{ color: 'text.disabled', mr: 1 }} />
            {status === 'ACCEPTED' ? 'Akış Onaylandı' : status === 'REJECTED' ? 'Akış Reddedildi' : 'İşlem Tamamlandı'}
          </MenuItem>
        )}
      </MenuList>
    </CustomPopover>
  );

  return (
    <>
      {renderPrimaryRow()}
      {renderSecondaryRow()}
      {renderMenuActions()}
      <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Danışan Atama Onayı"
        content={`${startedBy} olarak ${patientName} isimli danışanı kendinize atamak istediğinizden emin misiniz?`}
        action={
          <>
            <Button 
              variant="outlined" 
              color="inherit" 
              onClick={() => {
                menuActions.onClose();
                confirmDialog.onFalse();
              }}
              sx={{ mr: 1 }}
            >
              Vazgeç
            </Button>
            <Button 
              variant="contained" 
              color="success" 
              onClick={() => {
                onApprove?.(row.processInstanceKey);
                menuActions.onClose();
                confirmDialog.onFalse();
              }}
            >
              Onayla
            </Button>
          </>
        }
        maxWidth="xs"
        fullWidth
        disablePortal={false}
        keepMounted={false}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        }}
        PaperProps={{
          sx: {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          },
        }}
        TransitionProps={{
          onExited: () => {
            menuActions.onClose();
          },
        }}
      />
      <ConfirmDialog
        open={rejectDialog.value}
        onClose={rejectDialog.onFalse}
        title="Danışan Atama Reddi"
        content={`${startedBy} olarak ${patientName} isimli danışanı kendinize atamayı reddetmek istediğinizden emin misiniz?`}
        action={
          <>
            <Button 
              variant="outlined" 
              color="inherit" 
              onClick={() => {
                menuActions.onClose();
                rejectDialog.onFalse();
              }}
              sx={{ mr: 1 }}
            >
              Vazgeç
            </Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={() => {
                onReject?.(row.processInstanceKey);
                menuActions.onClose();
                rejectDialog.onFalse();
              }}
            >
              Reddet
            </Button>
          </>
        }
        maxWidth="xs"
        fullWidth
        disablePortal={false}
        keepMounted={false}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        }}
        PaperProps={{
          sx: {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          },
        }}
        TransitionProps={{
          onExited: () => {
            menuActions.onClose();
          },
        }}
      />

      {/* Süreç Akışı Dialog */}
      <ProcessFlowDialog
        open={processFlowDialog.value}
        onClose={processFlowDialog.onFalse}
        assignment={selectedAssignment}
      />
    </>
  );
}
