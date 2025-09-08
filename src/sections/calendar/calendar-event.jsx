import React from 'react';
import { useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

export function CalendarEvents() {
  const location = useLocation();
  const events = location.state?.events || {};

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Takvim Etkinlikleri
      </Typography>
      <List>
        {Object.entries(events).map(([id, summary]) => (
          <ListItem key={id}>
            <ListItemText primary={summary} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}