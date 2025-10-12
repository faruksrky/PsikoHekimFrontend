export const GENDER_TYPE_OPTIONS = [
  { value: 'ERKEK', label: 'Erkek' },
  { value: 'KADIN', label: 'Kadın' },
];

// Hasta atama durumları (Backend AssignmentStatus enum ile uyumlu)
export const ASSIGNMENT_STATUSES = [
  { value: 'ACTIVE', label: 'Aktif', color: '#28a745' },
  { value: 'COMPLETED', label: 'Tamamlandı', color: '#007bff' },
  { value: 'PAUSED', label: 'Durduruldu', color: '#ffc107' },
  { value: 'CANCELLED', label: 'İptal Edildi', color: '#dc3545' },
  { value: 'ON_HOLD', label: 'Beklemede', color: '#6c757d' }
];