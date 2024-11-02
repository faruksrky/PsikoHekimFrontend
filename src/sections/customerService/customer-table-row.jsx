import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { CustomerQuickEditForm } from './customer-quick-edit-form';


// ----------------------------------------------------------------------

function calculateWidth(text) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = '16px Arial'; // Bu değeri uygulamanızın font boyutuna ve tipine göre ayarlayın
  return context.measureText(text).width;
}

export function CustomerTableRow({ row, selected, onEditRow, onSelectRow, userNames, fetchData }) {
  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        <TableCell padding="checkbox">
          <Checkbox id={row.id.toString()} checked={selected} onClick={onSelectRow} />
        </TableCell>
        <TableCell style={{ width: calculateWidth(row.customerFirstName) }} sx={{ whiteSpace: 'nowrap' }}>{row.customerFirstName}</TableCell>
        <TableCell style={{ width: calculateWidth(row.customerLastName) }} sx={{ whiteSpace: 'nowrap' }}>{row.customerLastName}</TableCell>
        <TableCell style={{ width: calculateWidth(row.phoneNumber) }} sx={{ whiteSpace: 'nowrap' }}>{row.phoneNumber}</TableCell>
        <TableCell style={{ width: calculateWidth(row.emailAddress) }} sx={{ whiteSpace: 'nowrap' }}>{row.emailAddress}</TableCell>
        <TableCell style={{ width: calculateWidth(row.address) }} sx={{ whiteSpace: 'nowrap' }}>{row.address}</TableCell>
        <TableCell style={{ width: calculateWidth(row.productName) }} sx={{ whiteSpace: 'nowrap' }}>{row.productName}</TableCell>
        <TableCell style={{ width: calculateWidth(row.faultDescription) }} sx={{ whiteSpace: 'nowrap' }}>{row.faultDescription}</TableCell>
        <TableCell style={{ width: calculateWidth(row.faultDate) }} sx={{ whiteSpace: 'nowrap' }}>{row.faultDate}</TableCell>
        <TableCell style={{ width: calculateWidth(row.servicePersonnel) }} sx={{ whiteSpace: 'nowrap' }}>{row.servicePersonnel}</TableCell>
        <TableCell style={{ width: calculateWidth(row.warrantyStatus) }} sx={{ whiteSpace: 'nowrap' }}>{row.warrantyStatus}</TableCell>
        <TableCell style={{ width: calculateWidth(row.cargoStatus) }} sx={{ whiteSpace: 'nowrap' }}>{row.cargoStatus}</TableCell>
        <TableCell style={{ width: calculateWidth(row.serviceCompletionStatus) }} sx={{ whiteSpace: 'nowrap' }}>{row.serviceCompletionStatus}</TableCell>
        <TableCell style={{ width: calculateWidth(row.operationDate) }} sx={{ whiteSpace: 'nowrap' }}>{row.operationDate}</TableCell>
        <TableCell style={{ width: calculateWidth(row.deliveryDate) }} sx={{ whiteSpace: 'nowrap' }}>{row.deliveryDate}</TableCell>
        <TableCell style={{ width: calculateWidth(row.notes) }} sx={{ whiteSpace: 'nowrap' }}>{row.notes}</TableCell>
          <TableCell>
          <Stack direction="row" alignItems="center">
            <Tooltip title="Tabloya Ekle" placement="top" arrow>
              <IconButton
                color={quickEdit.value ? 'inherit' : 'default'}
                onClick={quickEdit.onTrue}
              >
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>
      <CustomerQuickEditForm 
      currentCustomer={row} 
      open={quickEdit.value} 
      onClose={quickEdit.onFalse} 
      userNamesFromQuick={userNames}
      fetchData={fetchData}
      />

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        </MenuList>
      </CustomPopover>

{/*
      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        {/*
        <MenuList>
          
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
        
          </MenuItem>
        </MenuList>
          
      </CustomPopover>
      */}
    </>
  );
}
