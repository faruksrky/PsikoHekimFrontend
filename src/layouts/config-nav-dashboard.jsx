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
  patient: icon('ic-patient'),
};

// ----------------------------------------------------------------------

export const navData = [
  /**
   * Overview
   */
  {
    subheader: 'Psiko Hekim',
    items: [
      { title: 'Takvim', path: paths.dashboard.calendar, icon: ICONS.calendar },
    ],
  },

  {
    items: [
      {
        title: 'Hasta',
        path: paths.dashboard.patient.root,
        icon: ICONS.patient,
        children: [
          { title: 'Liste', path: paths.dashboard.patient.list },
          { title: 'Yeni Hasta', path: paths.dashboard.patient.new },
          { title: 'Bilgi Güncelle', path: paths.dashboard.patient.demo.edit },
        ],
      },
      {
        title: 'Piskolog',
        path: paths.dashboard.psychologist.root,
        icon: ICONS.patient,
        children: [
          { title: 'Liste', path: paths.dashboard.psychologist.list },
          { title: 'Yeni Piskolog', path: paths.dashboard.psychologist.new },
          { title: 'Bilgi Güncelle', path: paths.dashboard.psychologist.demo.edit },
        ],
      },
      {
        title: 'Kullanıcı',
        path: paths.dashboard.user.root,
        icon: ICONS.user,
        children: [
          { title: 'Liste', path: paths.dashboard.user.list },
          { title: 'Yeni Kullanıcı', path: paths.dashboard.user.new },
          { title: 'Bilgi Güncelle', path: paths.dashboard.user.demo.edit },
        ],
      },
      
    ],
    
  },
  
];
