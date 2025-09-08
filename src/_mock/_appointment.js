// Randevu durumları (Backend AppointmentStatus enum ile uyumlu)
export const APPOINTMENT_STATUSES = [
  { 
    value: 'PENDING', 
    label: 'Beklemede', 
    color: '#ffc107',
    priority: 0,
    icon: 'eva:clock-outline'
  },
  { 
    value: 'CONFIRMED', 
    label: 'Onaylandı', 
    color: '#28a745',
    priority: 1,
    icon: 'eva:checkmark-circle-2-outline'
  },
  { 
    value: 'CANCELLED', 
    label: 'İptal', 
    color: '#dc3545',
    priority: 2,
    icon: 'eva:close-circle-outline'
  },
  { 
    value: 'COMPLETED', 
    label: 'Tamamlandı', 
    color: '#007bff',
    priority: 3,
    icon: 'eva:checkmark-circle-fill'
  },
  { 
    value: 'SCHEDULED', 
    label: 'Planlandı', 
    color: '#17a2b8',
    priority: 4,
    icon: 'eva:calendar-outline'
  },
  { 
    value: 'NO_SHOW', 
    label: 'Gelmedi', 
    color: '#fd7e14',
    priority: 5,
    icon: 'eva:person-remove-outline'
  },
  { 
    value: 'RESCHEDULED', 
    label: 'Yeniden Planlandı', 
    color: '#6f42c1',
    priority: 6,
    icon: 'eva:repeat-outline'
  }
]; 