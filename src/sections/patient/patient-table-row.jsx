
import Chip from '@mui/material/Chip';

// ----------------------------------------------------------------------

export function RenderCellID({ params }) {
  return params.row.id;
}

export function RenderCellFullName({ params }) {
  return `${params.row.patientFirstName  } ${  params.row.patientLastName}`;
}

export function RenderCellPhone({ params }) {
  return params.row.patientPhoneNumber;
}

export function RenderCellEmail({ params }) {
  return params.row.patientEmail;
}

export function RenderCellAddress({ params }) {
  return params.row.patientAddress;
}

export function RenderCellAge({ params }) {
  return params.row.patientAge;
}

export function RenderCellCountry({ params }) {
  return params.row.patientCountry;
}

export function RenderCellCity({ params }) {
  return params.row.patientCity;
}

export function RenderCellGender({ params }) {
  return params.row.patientGender;
}

export function RenderCellReference({ params }) {
  return params.row.patientReference;
}

export function RenderCellAssignmentStatus({ params }) {
  const assignmentStatus = params.row.assignmentStatus || (params.row.isAssigned ? 'ASSIGNED' : 'UNASSIGNED');
  const statusConfig = {
    ASSIGNED: { label: 'Atanmış', color: 'success', variant: 'filled' },
    PENDING: { label: 'Onay Bekleniyor', color: 'warning', variant: 'filled' },
    UNASSIGNED: { label: 'Atanmamış', color: 'default', variant: 'outlined' },
  };
  const config = statusConfig[assignmentStatus] || statusConfig.UNASSIGNED;
  
  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      variant={config.variant}
    />
  );
}
