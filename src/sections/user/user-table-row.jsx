import Box from '@mui/material/Box';

import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';


// ----------------------------------------------------------------------

export function UserTableRow({ row, selected, onSelectRow }) {
  const confirm = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        <TableCell padding="checkbox">
          <Checkbox id={row.id} checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.id}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.firstName}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.lastName}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.email}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.userName}</TableCell>
      </TableRow>

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
