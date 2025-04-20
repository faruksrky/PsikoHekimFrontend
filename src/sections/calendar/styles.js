import { styled } from '@mui/material/styles';

export const StyledCalendar = styled('div')(({ theme }) => ({
  '& .fc': {
    '--fc-border-color': theme.palette.divider,
    '--fc-now-indicator-color': theme.palette.error.main,
    '--fc-today-bg-color': theme.palette.action.selected,
    '--fc-page-bg-color': theme.palette.background.default,
    '--fc-neutral-bg-color': theme.palette.background.neutral,
    '--fc-list-event-hover-bg-color': theme.palette.action.hover,
    '--fc-highlight-color': theme.palette.action.hover,
  },

  '& .fc .fc-license-message': { display: 'none' },
  '& .fc a': { color: theme.palette.text.primary },

  // Table Head
  '& .fc .fc-col-header ': {
    boxShadow: `inset 0 -1px 0 ${theme.palette.divider}`,
    '& th': { padding: '8px 0' },
    '& .fc-col-header-cell-cushion': {
      color: theme.palette.text.secondary,
      fontWeight: theme.typography.fontWeightMedium,
    },
  },

  // List Empty
  '& .fc .fc-list-empty': {
    ...theme.typography.h6,
    backgroundColor: 'transparent',
    color: theme.palette.text.secondary,
  },

  // Event
  '& .fc .fc-event': {
    '& .fc-event-main': {
      color: theme.palette.common.white,
    }
  },
  
  '& .fc .fc-daygrid-event': { 
    marginTop: 4,
    borderRadius: 4,
    '&:hover': {
      opacity: 0.9
    }
  },
  
  '& .fc .fc-event-title': { 
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.common.white,
  },
  
  '& .fc .fc-event-time': {
    padding: 0,
    fontSize: 12,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.common.white,
  },
})); 