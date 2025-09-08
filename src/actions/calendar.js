import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

import { CONFIG } from 'src/config-global';

import { toast } from 'src/components/snackbar';

import { getTherapistId, getEmailFromToken } from 'src/auth/context/jwt/action';

// ----------------------------------------------------------------------

const enableServer = false;

const CALENDAR_ENDPOINT = endpoints.calendar;

const swrOptions = {
  revalidateIfStale: enableServer,
  revalidateOnFocus: enableServer,
  revalidateOnReconnect: enableServer,
};

// ----------------------------------------------------------------------

export function useGetEvents() {
  const { data, isLoading, error, isValidating } = useSWR(CALENDAR_ENDPOINT, fetcher, swrOptions);

  const memoizedValue = useMemo(() => {
    const events = data?.events.map((event) => ({
      ...event,
      textColor: event.color,
    }));

    return {
      events: events || [],
      eventsLoading: isLoading,
      eventsError: error,
      eventsValidating: isValidating,
      eventsEmpty: !isLoading && !data?.events.length,
    };
  }, [data?.events, error, isLoading, isValidating]);

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function createEvent(eventData) {
  try {
    const token = sessionStorage.getItem('jwt_access_token');
    const userInfo = getEmailFromToken();
    
    if (!userInfo?.email) {
      toast.error('Kullanıcı bilgisi bulunamadı');
      return null;
    }
    
    const therapistId = await getTherapistId(userInfo.email);
    if (!therapistId) {
      toast.error('Terapist bilgisi bulunamadı');
      return null;
    }
    
    // Tarih formatını düzeltelim
    let startTime;
    let endTime;
    
    if (eventData.start instanceof Object && typeof eventData.start.format === 'function') {
      startTime = eventData.start.format('YYYY-MM-DDTHH:mm:ss');
    } else if (eventData.start instanceof Date) {
      startTime = eventData.start.toISOString().slice(0, 19);
    } else {
      startTime = typeof eventData.start === 'string' 
        ? eventData.start.split('+')[0].split('Z')[0] 
        : eventData.start;
    }
    
    if (eventData.end instanceof Object && typeof eventData.end.format === 'function') {
      endTime = eventData.end.format('YYYY-MM-DDTHH:mm:ss');
    } else if (eventData.end instanceof Date) {
      endTime = eventData.end.toISOString().slice(0, 19);
    } else {
      endTime = typeof eventData.end === 'string' 
        ? eventData.end.split('+')[0].split('Z')[0] 
        : eventData.end;
    }
    
    // Veriyi hazırlayalım
    const requestData = {
      title: eventData.title || '',
      description: eventData.description || '',
      location: eventData.location || 'Online Görüşme',
      status: eventData.status || 'CONFIRMED',
      color: eventData.color || '#1890FF',
      reminderMinutes: parseInt(eventData.reminderMinutes || 30, 10),
      therapistId,
      startTime,
      endTime
    };
    
    const response = await fetch(`${CONFIG.psikoHekimBaseUrl}/calendar/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend hatası:', errorData);
      toast.error(errorData.message || 'Etkinlik eklenirken bir hata oluştu');
      return null;
    }
    
    const data = await response.json();
    toast.success('Etkinlik başarıyla eklendi');
    return data;
    
  } catch (error) {
    console.error('Etkinlik eklenirken hata:', error);
    toast.error('Etkinlik eklenirken bir hata oluştu');
    return null;
  }
}

// ----------------------------------------------------------------------

export async function updateEvent(eventData) {
  try {
    const token = sessionStorage.getItem('jwt_access_token');
    
    const response = await fetch(`${CONFIG.psikoHekimBaseUrl}/calendar/events/${eventData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...eventData,
        startTime: eventData.start,
        endTime: eventData.end
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.message || 'Etkinlik güncellenirken bir hata oluştu');
      return null;
    }
    
    const data = await response.json();
    toast.success('Etkinlik başarıyla güncellendi');
    return data;
    
  } catch (error) {
    console.error('Etkinlik güncellenirken hata:', error);
    toast.error('Etkinlik güncellenirken bir hata oluştu');
    return null;
  }
}

// ----------------------------------------------------------------------

export async function deleteEvent(eventId) {
  try {
    const token = sessionStorage.getItem('jwt_access_token');
    
    const response = await fetch(`${CONFIG.psikoHekimBaseUrl}/calendar/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.message || 'Etkinlik silinirken bir hata oluştu');
      return false;
    }
    
    toast.success('Etkinlik başarıyla silindi');
    return true;
    
  } catch (error) {
    console.error('Etkinlik silinirken hata:', error);
    toast.error('Etkinlik silinirken bir hata oluştu');
    return false;
  }
}
