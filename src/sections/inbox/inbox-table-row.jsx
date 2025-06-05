import { useBoolean, usePopover } from 'minimal-shared/hooks';
import axios from 'axios';
import { CONFIG } from 'src/config-global';

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
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import { format } from 'date-fns';

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


  const handleAction = async (id, action) => {
    try {
      // Debug için

      const requestData = {
        processInstanceKey: id,
        action: CONFIG.process.inbox.actions[action]
      };
      
      const response = await axios.post(
        `${CONFIG.psikoHekimBaseUrl}${CONFIG.process.inbox.action}`,
        requestData
      );
      
      if (action === 'ACCEPTED') {
        onApprove?.(response.data);
      } else {
        onReject?.(response.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
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
                handleAction(row.processInstanceKey, 'ACCEPTED');
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
                handleAction(row.processInstanceKey, 'REJECTED');
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
    </>
  );
}
