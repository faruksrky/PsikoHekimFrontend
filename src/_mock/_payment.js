// Ödeme yöntemleri sabitleri
export const PAYMENT_METHODS = [
  { 
    value: 'CASH', 
    label: 'Nakit', 
    icon: 'eva:credit-card-outline',
    color: '#00C851' 
  },
  { 
    value: 'BANK_TRANSFER', 
    label: 'Banka Havalesi', 
    icon: 'eva:archive-outline',
    color: '#FF6900' 
  }
];

// Ödeme durumları
export const PAYMENT_STATUSES = [
  { value: 'PENDING', label: 'Bekliyor', color: '#ffc107' },
  { value: 'PAID', label: 'Ödendi', color: '#28a745' },
  { value: 'FAILED', label: 'Başarısız', color: '#dc3545' },
  { value: 'REFUNDED', label: 'İade Edildi', color: '#6c757d' },
  { value: 'CANCELLED', label: 'İptal Edildi', color: '#dc3545' },
  { value: 'PARTIAL', label: 'Kısmi Ödeme', color: '#fd7e14' }
];



 