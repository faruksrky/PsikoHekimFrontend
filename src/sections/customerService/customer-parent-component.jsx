import axios from 'axios';
import { useState, useEffect } from 'react';

import { CONFIG } from '../../config-global';
import CustomerListView from './customer-list-view';
import CustomerQuickEditForm from './customer-quick-edit-form';


export function ParentCustomerComponent() {
  const [customerData, setCustomerData] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Müşteri listesini API'den çeker
  const fetchCustomerData = async () => {
    try {
      const { data } = await axios.get(CONFIG.customerListUrl);
      setCustomerData(data);
    } catch (error) {
      console.error('Veri çekme hatası:', error);
    }
  };

  useEffect(() => {
    fetchCustomerData(); // Bileşen ilk yüklendiğinde verileri çek
  }, []);

  // Müşteri verilerini güncelleme
  const handleDataUpdate = (updatedCustomer) => {
    setCustomerData((prevData) =>
      prevData.map((customer) =>
        customer.id === updatedCustomer.id ? updatedCustomer : customer
      )
    );
  };

  // Müşteri düzenleme formunu açma
  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsEditDialogOpen(true);
  };

  // Müşteri düzenleme formunu kapatma
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  return (
    <>
      {/* Müşteri Listeleme Bileşeni */}
      <CustomerListView 
        customerData={customerData} 
        onEditCustomer={handleEditCustomer} // Müşteri düzenlemeye yönlendirme
      />

      {/* Müşteri Düzenleme Formu */}
      {selectedCustomer && (
        <CustomerQuickEditForm
          currentCustomer={selectedCustomer}
          open={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          refreshGridData={fetchCustomerData} // Müşteri listesini yenilemek için
          onUpdate={handleDataUpdate} // Müşteri güncelleme fonksiyonu
        />
      )}
    </>
  );
}
