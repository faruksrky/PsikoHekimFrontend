import { Chip } from '@mui/material';

import { EXPERIENCE_YEARS_MAPPING } from 'src/_mock/_therapist';

// ----------------------------------------------------------------------

export function RenderCellFullName({ params }) {
  return `${params.row.therapistFirstName} ${params.row.therapistLastName}`;
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
  return params.row.therapistUniversity;
}

export function RenderCellTherapistType({ params }) {
  return params.row.therapistType;
}


export function RenderCellSpecializationAreas({ params }) {
  const { therapistSpecializationAreas } = params.row;

  if (!Array.isArray(therapistSpecializationAreas) || therapistSpecializationAreas.length === 0) {
    return <span>Belirtilmedi</span>; // Veri yoksa gösterilecek mesaj
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {therapistSpecializationAreas.map((area, index) => (
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
  const experience = params.row.therapistYearsOfExperience;
  
  if (!experience) return '-';
  
  return EXPERIENCE_YEARS_MAPPING[experience] || experience;
}

export function RenderCellCertifications({ params }) {
  return params.row.therapistCertifications;
}

export function RenderCellAppointmentFee({ params }) {
  const fee = params.row.therapistAppointmentFee;
  
  if (!fee) return '-';
  
  return `${fee.toLocaleString('tr-TR')} ₺`;
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



