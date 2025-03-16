
import { Chip } from '@mui/material';

import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export function RenderCellFullName({ params }) {
  return `${params.row.therapistFirstName  } ${  params.row.therapistSurname}`;
}

export function RenderCellPhone({ params }) {
  return params.row.therapistPhoneNumber;
}

export function RenderCellEmail({ params }) {
  return params.row.therapistEmail;
}

export function RenderCellAddress({ params }) {
  return params.row.therapistAddress;
}

export function RenderCellEducation({ params }) {
  return params.row.therapistEducation;
}

export function RenderCellUniversity({ params }) {
  return params.row.university;
}

export function RenderCellTherapistType({ params }) {
  return params.row.therapistType;
}


export function RenderCellSpecializationAreas({ params }) {
  const { specializationAreas } = params.row;

  if (!Array.isArray(specializationAreas) || specializationAreas.length === 0) {
    return <span>Belirtilmedi</span>; // Veri yoksa gösterilecek mesaj
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {specializationAreas.map((area, index) => (
        <Chip
          key={index}
          label={area}
          size="small"
          variant="outlined" 
          color='primary'
        />
      ))}
    </div>
  );
}


export function RenderCellYearsOfExperience({ params }) {
  return params.row.yearsOfExperience;
}

export function RenderCellCertifications({ params }) {
  return params.row.therapistCertifications;
}

export function RenderCellAppointmentFee({ params }) {
  return fCurrency(params.row.appointmentFee);
}

export function RenderCellID({ params }) {
  return params.row.id;
}

export function RenderCellTherapistRating({ params }) {
  return params.row.therapistRating;
}

export function RenderCellTherapistAvailability({ params }) {
  return params.row.therapistAvailability;
}



