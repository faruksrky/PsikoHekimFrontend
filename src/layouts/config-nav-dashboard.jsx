import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
  technicalService: icon('ic-technicalservice'),
  patient: icon('ic-user'),
  therapist: icon('ic-job'),
  therapySession: icon('ic-calendar'),
  process: icon('ic-parameter'),
};

// ----------------------------------------------------------------------

export const navData = [
  /**
   * Overview
   */
  {
    subheader: 'Psiko Hekim',
    items: [
      { title: 'Gelen Kutusu', path: paths.dashboard.inbox, icon: ICONS.mail, requiredRole: 'USER' },
      { title: 'Takvim', path: paths.dashboard.calendar, icon: ICONS.calendar, requiredRole: 'USER' },
    ],
  },

  {
    items: [
      {
        title: 'Danışan',
        path: paths.dashboard.patient.root,
        icon: ICONS.patient,
        requiredRole: 'ADMIN', // Sadece ADMIN görebilir
        children: [
          { title: 'Liste', path: paths.dashboard.patient.list, requiredRole: 'ADMIN' },
          { title: 'Yeni Danışan', path: paths.dashboard.patient.new, requiredRole: 'ADMIN' },
          { title: 'Bilgi Güncelle', path: paths.dashboard.patient.demo.edit, requiredRole: 'ADMIN' }
        ],
      },

      {
        title: 'Danışman',
        path: paths.dashboard.therapist.root,
        icon: ICONS.therapist,
        requiredRole: 'ADMIN', // Sadece ADMIN görebilir
        children: [
          { title: 'Liste', path: paths.dashboard.therapist.list, requiredRole: 'ADMIN' },
          { title: 'Yeni Danışman', path: paths.dashboard.therapist.new, requiredRole: 'ADMIN' },
          { title: 'Bilgi Güncelle', path: paths.dashboard.therapist.demo.edit, requiredRole: 'ADMIN' },
        ],
      },

      {
        title: 'Terapi Seansları',
        path: paths.dashboard.therapySession.root,
        icon: ICONS.therapySession,
        requiredRole: 'USER', // USER ve üzeri görebilir
        children: [
          { title: 'Seans Listesi', path: paths.dashboard.therapySession.list, requiredRole: 'USER' },
          { title: 'Yeni Seans', path: paths.dashboard.therapySession.new, requiredRole: 'USER' },
          { title: 'Analitik', path: paths.dashboard.therapySession.analytics, requiredRole: 'USER' },
        ],
      },

      {
        title: 'Kullanıcı',
        path: paths.dashboard.user.root,
        icon: ICONS.technicalService,
        requiredRole: 'ADMIN', // Sadece ADMIN görebilir
        children: [
          { title: 'Liste', path: paths.dashboard.user.list, requiredRole: 'ADMIN' },
          { title: 'Yeni Kullanıcı', path: paths.dashboard.user.new, requiredRole: 'ADMIN' },
          { title: 'Bilgi Güncelle', path: paths.dashboard.user.demo.edit, requiredRole: 'ADMIN' },
        ],
      },

      { title: 'Analytics', path: paths.dashboard.analytics, icon: ICONS.analytics, requiredRole: 'USER' },
      { title: 'Finans', path: paths.dashboard.finance.root, icon: ICONS.banking, requiredRole: 'ADMIN' },

    ],

  },

];
