import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';

import { Iconify } from 'src/components/iconify';
import { CONFIG } from 'src/config-global';
import { axiosInstance } from 'src/utils/axios';

// ----------------------------------------------------------------------

const PROCESS_STEPS = [
  {
    id: '1_start',
    name: 'Süreç Başlatıldı',
    description: 'Danışman atama süreci başlatıldı',
    icon: 'solar:play-circle-bold',
    color: '#4CAF50',
  },
  {
    id: '2_send_request',
    name: 'İstek Gönderildi',
    description: 'Danışmana atama isteği gönderildi',
    icon: 'solar:letter-unread-bold',
    color: '#4CAF50',
  },
  {
    id: '3_wait_decision',
    name: 'Karar Bekleniyor',
    description: 'Danışmanın kararı bekleniyor',
    icon: 'solar:clock-circle-bold',
    color: '#FF9800',
  },
  {
    id: '4_gateway',
    name: 'Karar Kontrolü',
    description: 'Danışman kararı değerlendiriliyor',
    icon: 'solar:check-circle-bold',
    color: '#2196F3',
  },
  {
    id: '5_assign',
    name: 'Atama Tamamlandı',
    description: 'Danışman başarıyla atandı',
    icon: 'solar:user-check-bold',
    color: '#4CAF50',
  },
  {
    id: '6_reject',
    name: 'Atama Reddedildi',
    description: 'Danışman atamayı reddetti',
    icon: 'solar:user-cross-bold',
    color: '#F44336',
  },
];

export function ProcessFlowDialog({ open, onClose, assignment }) {
  const [processStatus, setProcessStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // API çağrısını kaldırdık, mevcut assignment data'sını kullanıyoruz
  useEffect(() => {
    if (open && assignment) {
      setLoading(false);
      // Mevcut assignment data'sını process status olarak kullan
      setProcessStatus(assignment);
    }
  }, [open, assignment]);

  const getStepStatus = (stepId) => {
    if (!processStatus) return 'pending';

    // Mevcut process status'a göre step'leri belirle
    const status = processStatus.status || 'PENDING';
    
    // PENDING durumunda - süreç devam ediyor, bazı adımlar tamamlanmış
    if (status === 'PENDING') {
      // Step ID'ye göre hangi adımlar tamamlanmış
      const stepMap = {
        1: 'completed', // Süreç Başlatıldı - tamamlandı
        2: 'completed', // İstek Gönderildi - tamamlandı  
        3: 'current',   // Karar Bekleniyor - şu an burada
        4: 'pending',   // Karar Kontrolü - bekliyor
        5: 'pending',   // Atama Tamamlandı - bekliyor
        6: 'pending'    // Atama Reddedildi - bekliyor
      };
      return stepMap[stepId] || 'pending';
    }
    
    // ACCEPTED durumunda - atama kabul edildi
    if (status === 'ACCEPTED') {
      // Adım 1-5 tamamlandı, Adım 6 (reject) atlandı
      if (stepId <= 5) {
        return 'completed';
      }
      // Adım 6 (reject) atlandı
      return 'skipped';
    }
    
    // REJECTED durumunda - atama reddedildi
    if (status === 'REJECTED') {
      // İlk 3 adım tamamlandı
      if (stepId <= 3) {
        return 'completed';
      }
      // Son adım (reject) reddedildi olarak işaretle
      if (stepId === 6) {
        return 'rejected';
      }
      // Adım 4-5 (gateway ve assign) atlandı
      return 'skipped';
    }
    
    return 'pending';
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'completed':
        return '#2E7D32'; // Koyu yeşil - daha belirgin
      case 'current':
        return '#F57C00'; // Koyu turuncu - daha belirgin
      case 'rejected':
        return '#D32F2F'; // Kırmızı - reddedildi
      case 'pending':
        return '#BDBDBD'; // Açık gri
      case 'skipped':
        return '#757575'; // Orta gri
      default:
        return '#E0E0E0';
    }
  };

  const getStepIcon = (status, defaultIcon) => {
    switch (status) {
      case 'completed':
        return 'solar:check-circle-bold';
      case 'current':
        return 'solar:clock-circle-bold';
      case 'rejected':
        return 'solar:close-circle-bold';
      case 'skipped':
        return 'solar:minus-circle-bold';
      default:
        return defaultIcon;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Iconify icon="solar:diagram-bold" width={24} />
          <Typography variant="h6">Süreç Durumu</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {assignment && (
          <Stack spacing={3}>
            {/* Atama Bilgileri */}
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Atama Detayları
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Danışan:</strong> {assignment.patientName || 'Bilinmiyor'}
                </Typography>
                <Typography variant="body2">
                  <strong>Danışman:</strong> {assignment.therapistName || 'Bilinmiyor'}
                </Typography>
                <Typography variant="body2">
                  <strong>Başlatan:</strong> {assignment.startedBy || 'Bilinmiyor'}
                </Typography>
                <Typography variant="body2">
                  <strong>Süreç ID:</strong> {assignment.processInstanceKey}
                </Typography>
                <Typography variant="body2">
                  <strong>Durum:</strong> {assignment.status}
                </Typography>
              </Stack>
            </Card>

            {/* Süreç Adımları - Timeline View */}
            <Card sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Iconify icon="solar:diagram-2-bold" width={24} />
                <Typography variant="subtitle1">Süreç Yol Haritası</Typography>
                <Box sx={{ flex: 1 }} />
                <Chip 
                  label={assignment?.status === 'PENDING' ? 'Bekliyor' : assignment?.status === 'ACCEPTED' ? 'Tamamlandı' : 'Reddedildi'}
                  color={assignment?.status === 'PENDING' ? 'warning' : assignment?.status === 'ACCEPTED' ? 'success' : 'error'}
                  size="small"
                />
              </Stack>
              
              <Divider sx={{ mb: 2 }} />
              
              <Timeline position="alternate">
                {PROCESS_STEPS.map((step, index) => {
                  // step.id string'den numeric kısmı çıkar (örn: '1_start' -> 1)
                  const stepId = parseInt(step.id.toString().split('_')[0], 10);
                  const status = getStepStatus(stepId);
                  const color = getStepColor(status);
                  const icon = getStepIcon(status, step.icon);
                  
                  // Backend'den gelen gerçek adım verilerini kullan
                  const stepKey = `step${step.id}`;
                  const stepData = processStatus?.processSteps?.[stepKey];
                  const stepName = stepData?.name || step.name;
                  const stepDescription = stepData?.description || step.description;
                  const completedAt = stepData?.completedAt;
                  
                  return (
                    <TimelineItem key={step.id}>
                      <TimelineOppositeContent
                        sx={{ m: 'auto 0' }}
                        align="right"
                        variant="body2"
                        color="text.secondary"
                      >
                        {status === 'completed' && 'Tamamlandı'}
                        {status === 'current' && 'Devam Ediyor'}
                        {status === 'pending' && 'Bekliyor'}
                        {status === 'skipped' && 'Geçildi'}
                        {completedAt && (
                          <Box sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                            {new Date(completedAt).toLocaleDateString('tr-TR')}
                          </Box>
                        )}
                      </TimelineOppositeContent>
                      
                      <TimelineSeparator>
                        <TimelineConnector />
                        <TimelineDot 
                          sx={{ 
                            backgroundColor: color,
                            color: 'white',
                            border: 'none',
                            width: 40,
                            height: 40,
                          }}
                        >
                          <Iconify 
                            icon={icon} 
                            width={20}
                          />
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>
                      
                      <TimelineContent sx={{ py: '12px', px: 2 }}>
                        <Typography variant="h6" component="span">
                          {stepName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stepDescription}
                        </Typography>
                        
                        {status === 'current' && (
                          <Chip
                            label="Devam Ediyor"
                            size="small"
                            sx={{ 
                              mt: 1,
                              backgroundColor: '#F57C00',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        )}
                        {status === 'skipped' && (
                          <Chip
                            label="Geçildi"
                            size="small"
                            sx={{ 
                              mt: 1,
                              backgroundColor: '#757575',
                              color: 'white'
                            }}
                          />
                        )}
                        {status === 'completed' && (
                          <Chip
                            label="Tamamlandı"
                            size="small"
                            sx={{ 
                              mt: 1,
                              backgroundColor: '#2E7D32',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        )}
                      </TimelineContent>
                    </TimelineItem>
                  );
                })}
              </Timeline>
            </Card>

            {/* Süreç Özeti */}
            {processStatus && (
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Süreç Özeti
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Mevcut Adım
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {processStatus.currentStep}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Sonraki İşlem
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {processStatus.nextAction}
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      İlerleme Durumu
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(() => {
                        if (!processStatus) return 0;
                        const status = processStatus.status || 'PENDING';
                        
                        if (status === 'ACCEPTED') return 100;
                        if (status === 'REJECTED') return 100; // Reddedildi ama süreç tamamlandı
                        if (status === 'PENDING') return 50; // Yarıda
                        return 0;
                      })()}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      %{(() => {
                        if (!processStatus) return 0;
                        const status = processStatus.status || 'PENDING';
                        
                        if (status === 'ACCEPTED') return 100;
                        if (status === 'REJECTED') return 100; // Reddedildi ama süreç tamamlandı
                        if (status === 'PENDING') return 50; // Yarıda
                        return 0;
                      })()} tamamlandı
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Kapat</Button>
        <Button variant="contained" onClick={() => {
          // Mevcut data'yı yeniden set et
          if (assignment) {
            setProcessStatus(assignment);
          }
        }} disabled={loading}>
          <Iconify icon="solar:refresh-bold" width={16} sx={{ mr: 1 }} />
          Yenile
        </Button>
      </DialogActions>
    </Dialog>
  );
}
