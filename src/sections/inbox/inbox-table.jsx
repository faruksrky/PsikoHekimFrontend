import React from 'react';
import { Table, TableHead, TableRow, TableCell, Checkbox } from '@mui/material';

const InboxTable = () => {
  const selectedAll = false;
  const selected = [];
  const onSelectAllRows = () => {
    // Implementation of onSelectAllRows
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              checked={selectedAll}
              indeterminate={selected.length > 0 && !selectedAll}
              onChange={onSelectAllRows}
            />
          </TableCell>

          <TableCell>Process ID</TableCell>

          <TableCell>Process Name</TableCell>

          <TableCell>Started By</TableCell>

          <TableCell>Description</TableCell>

          <TableCell>Created At</TableCell>

          <TableCell>Status</TableCell>

          <TableCell />
        </TableRow>
      </TableHead>
    </Table>
  );
};

export default InboxTable; 