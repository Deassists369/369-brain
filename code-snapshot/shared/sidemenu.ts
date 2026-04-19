import { NavItemWithPermissionType } from '../types';
import { UserTypes } from '../constants/user.types';
import { CollectionNames } from '../constants/collections';

export const SideMenu: NavItemWithPermissionType[] = [
  // ─── TOP LEVEL — Dashboard (admin + manager only) ───────────────────
  {
    title: 'Dashboard',
    icon: 'material-symbols:space-dashboard-outline',
    path: '/',
    permissionLevel: [
      UserTypes.SUPER_ADMIN,
      UserTypes.STAFF,
      UserTypes.MANAGER,
      UserTypes.TEAM_LEAD,
      UserTypes.ORG_OWNER,
      UserTypes.ORG_ADMIN,
      UserTypes.AGENT,
      UserTypes.ORG_AGENT,
    ],
  },

  // ─── STUDENT HOME ────────────────────────────────────────────────────
  {
    title: 'Home',
    icon: 'tabler:home',
    path: '/',
    permissionLevel: [UserTypes.USER],
  },

  // ─── CALL CENTER 369 ─────────────────────────────────────────────────
  {
    title: 'Call Center 369',
    icon: 'mdi:headset',
    permissionLevel: [
      UserTypes.SUPER_ADMIN,
      UserTypes.ORG_ADMIN,
      UserTypes.MANAGER,
      UserTypes.LEAD_CRM,
    ],
    children: [
      {
        title: 'My Queue',
        icon: 'mdi:view-list-outline',
        path: '/leads/queue',
      },
      {
        title: 'All Leads',
        icon: 'mdi:account-arrow-right-outline',
        path: '/leads',
      },
      {
        title: '+ Add Lead',
        icon: 'mdi:account-plus-outline',
        path: '/leads/new',
      },
    ],
  },

  // ─── SALES CRM ───────────────────────────────────────────────────────
  {
    title: 'Sales CRM',
    icon: 'mdi:handshake-outline',
    permissionLevel: [
      UserTypes.SUPER_ADMIN,
      UserTypes.ORG_ADMIN,
      UserTypes.MANAGER,
      UserTypes.SALES_SETUP,
    ],
    children: [
      {
        title: 'Sales Dashboard',
        icon: 'material-symbols:space-dashboard-outline',
        path: '/dashboard',
        permissionLevel: [
          UserTypes.SUPER_ADMIN,
          UserTypes.ORG_ADMIN,
          UserTypes.MANAGER,
          UserTypes.SALES_SETUP,
        ],
      },
      {
        title: 'Sales Tools',
        icon: 'mdi:tools',
        path: '/page-workinprogress?status=salestools',
        disabled: true,
        badgeContent: 'Soon',
        badgeColor: 'secondary',
      },
    ],
  },

  // ─── APPLICATIONS ────────────────────────────────────────────────────
  {
    title: 'Applications',
    icon: 'material-symbols:ballot-outline',
    permissionLevel: [
      UserTypes.SUPER_ADMIN,
      UserTypes.STAFF,
      UserTypes.MANAGER,
      UserTypes.TEAM_LEAD,
      UserTypes.ORG_ADMIN,
      UserTypes.ORG_OWNER,
      UserTypes.AGENT,
      UserTypes.ORG_AGENT,
    ],
    children: [
      {
        title: 'University Courses',
        icon: 'uil:university',
        path: `/${CollectionNames.CourseApplications}`,
      },
      {
        title: 'Accommodation',
        icon: 'material-symbols:apartment-rounded',
        path: `/${CollectionNames.ApartmentApplications}`,
      },
      {
        title: 'Visa Support',
        icon: 'heroicons:newspaper',
        path: `/${CollectionNames.VisaSupportApplications}`,
      },
      {
        title: 'Blocked Accounts',
        icon: 'ic:outline-account-balance-wallet',
        path: `/${CollectionNames.BlockedAccountApplications}`,
      },
      {
        title: 'Insurance',
        icon: 'material-symbols:monitor-heart-outline',
        path: `/${CollectionNames.InsuranceApplications}`,
      },
      {
        title: 'Ausbildung',
        icon: 'healthicons:i-training-class',
        path: `/${CollectionNames.AusbildungApplications}`,
      },
      {
        title: 'APS & Documents',
        icon: 'mingcute:documents-line',
        path: `/${CollectionNames.APSandDocumentTranslationApplications}`,
      },
      {
        title: 'Full-time Jobs',
        icon: 'material-symbols:work-outline',
        path: `/${CollectionNames.FulltimeJobApplications}`,
      },
      {
        title: 'Part-time Jobs',
        icon: 'material-symbols:work-outline',
        path: `/${CollectionNames.ParttimeJobApplications}`,
      },
      {
        title: 'Legal Support',
        icon: 'icon-park-outline:gavel',
        path: `/${CollectionNames.LegalSupportApplications}`,
      },
      {
        title: 'Post Landing',
        icon: 'icon-park-outline:landing',
        path: `/${CollectionNames.PostLandingServicesApplications}`,
      },
    ],
  },

  // ─── ADMIN SERVICES (internal staff) ──────────────────────────────────
  {
    title: 'Services',
    icon: 'grommet-icons:services',
    permissionLevel: [
      UserTypes.SUPER_ADMIN,
      UserTypes.MANAGER,
      UserTypes.ORG_ADMIN,
      UserTypes.ORG_OWNER,
    ],
    children: [
      {
        title: 'Apartments',
        icon: 'material-symbols:apartment-rounded',
        path: `/${CollectionNames.Apartments}`,
      },
      {
        title: 'Ausbildungs',
        icon: 'healthicons:i-training-class',
        path: `/${CollectionNames.Ausbildungs}`,
      },
      {
        title: 'APS and Document Translations',
        icon: 'mingcute:documents-line',
        path: `/${CollectionNames.APSandDocumentTranslations}`,
      },
      {
        title: 'Blocked Accounts',
        icon: 'ic:outline-account-balance-wallet',
        path: `/${CollectionNames.BlockedAccounts}`,
      },
      {
        title: 'Courses',
        icon: 'material-symbols:library-books-outline',
        path: `/${CollectionNames.Courses}`,
      },
      {
        title: 'Insurances',
        icon: 'material-symbols:monitor-heart-outline',
        path: `/${CollectionNames.Insurances}`,
      },
      {
        title: 'Full-time Jobs',
        icon: 'material-symbols:work-outline',
        path: `/${CollectionNames.FulltimeJobs}`,
      },
      {
        title: 'Part-time Jobs',
        icon: 'material-symbols:work-outline',
        path: `/${CollectionNames.ParttimeJobs}`,
      },
      {
        title: 'Legal Supports',
        icon: 'icon-park-outline:gavel',
        path: `/${CollectionNames.LegalSupports}`,
      },
      {
        title: 'Post Landing Services',
        icon: 'icon-park-outline:landing',
        path: `/${CollectionNames.PostLandingServices}`,
      },
      {
        title: 'Universities',
        icon: 'uil:university',
        path: `/${CollectionNames.University}`,
      },
      {
        title: 'Visa Services',
        icon: 'heroicons:newspaper',
        path: `/${CollectionNames.VisaSupports}`,
      },
    ],
  },

  // ─── AGENT SERVICES (white-label / partner agents) ───────────────────
  {
    title: 'Services',
    icon: 'grommet-icons:services',
    permissionLevel: [UserTypes.AGENT, UserTypes.ORG_AGENT],
    children: [
      {
        title: 'Apartments',
        icon: 'material-symbols:apartment-rounded',
        path: `/service/${CollectionNames.Apartments}`,
      },
      {
        title: 'Ausbildungs',
        icon: 'healthicons:i-training-class',
        path: `/service/${CollectionNames.Ausbildungs}`,
      },
      {
        title: 'APS and Document Translations',
        icon: 'mingcute:documents-line',
        path: `/service/${CollectionNames.APSandDocumentTranslations}`,
      },
      {
        title: 'Blocked Account',
        icon: 'ic:outline-account-balance-wallet',
        path: `/service/${CollectionNames.BlockedAccounts}`,
      },
      {
        title: 'Courses',
        icon: 'material-symbols:library-books-outline',
        path: `/${CollectionNames.Courses}`,
      },
      {
        title: 'Insurances',
        icon: 'material-symbols:monitor-heart-outline',
        path: `/service/${CollectionNames.Insurances}`,
      },
      {
        title: 'Full-time Jobs',
        icon: 'material-symbols:work-outline',
        path: `/service/${CollectionNames.FulltimeJobs}`,
      },
      {
        title: 'Part-time Jobs',
        icon: 'material-symbols:work-outline',
        path: `/service/${CollectionNames.ParttimeJobs}`,
      },
      {
        title: 'Legal Supports',
        icon: 'icon-park-outline:gavel',
        path: `/service/${CollectionNames.LegalSupports}`,
      },
      {
        title: 'Post Landing Services',
        icon: 'icon-park-outline:landing',
        path: `/service/${CollectionNames.PostLandingServices}`,
      },
      {
        title: 'Universities',
        icon: 'uil:university',
        path: `/service/${CollectionNames.University}`,
      },
      {
        title: 'Visa Services',
        icon: 'heroicons:newspaper',
        path: `/service/${CollectionNames.VisaSupports}`,
      },
    ],
  },

  // ─── STUDENT PORTAL ITEMS ────────────────────────────────────────────
  {
    title: 'Programs & Courses',
    icon: 'uil:books',
    path: '/programs',
    permissionLevel: [UserTypes.USER],
  },
  {
    title: 'Our Services',
    icon: 'grommet-icons:services',
    path: '/our-service',
    permissionLevel: [UserTypes.USER],
  },
  {
    title: 'My Applications',
    icon: 'carbon:application',
    path: '/my-applications',
    permissionLevel: [UserTypes.USER],
  },
  {
    title: 'My Documents',
    icon: 'material-symbols:library-books-outline-rounded',
    path: '/my-documents',
    permissionLevel: [UserTypes.USER],
  },
  {
    title: 'My Payments',
    icon: 'material-symbols:payments-outline',
    path: '/payments',
    permissionLevel: [UserTypes.USER],
  },

  // ─── FINANCE ──────────────────────────────────────────────────────────
  {
    title: 'Finance',
    icon: 'material-symbols:payments-outline',
    permissionLevel: [UserTypes.SUPER_ADMIN, UserTypes.MANAGER],
    children: [
      {
        title: 'Finance Dashboard',
        icon: 'material-symbols:finance-outline',
        path: '/page-workinprogress?status=financedashboard',
        disabled: true,
        badgeContent: 'Soon',
        badgeColor: 'secondary',
        permissionLevel: [UserTypes.SUPER_ADMIN, UserTypes.MANAGER],
      },
      {
        title: 'Received Payments',
        icon: 'material-symbols:payment-arrow-down-outline-rounded',
        path: `/page-workinprogress?status=paid`,
        permissionLevel: [UserTypes.SUPER_ADMIN, UserTypes.MANAGER],
      },
      {
        title: 'Pending Fee',
        icon: 'ri:money-euro-box-line',
        path: `/page-workinprogress?status=pending`,
        permissionLevel: [UserTypes.SUPER_ADMIN, UserTypes.MANAGER],
      },
    ],
  },

  // ─── SETTINGS (admin only, bottom) ───────────────────────────────────
  {
    title: 'Settings',
    icon: 'material-symbols:settings-outline',
    permissionLevel: [
      UserTypes.SUPER_ADMIN,
      UserTypes.ORG_ADMIN,
      UserTypes.ORG_OWNER,
      UserTypes.MANAGER,
      UserTypes.TEAM_LEAD,
      UserTypes.AGENT,
      UserTypes.ORG_AGENT,
    ],
    children: [
      {
        title: 'Users & Roles',
        icon: 'material-symbols:manage-accounts-outline',
        permissionLevel: [
          UserTypes.SUPER_ADMIN,
          UserTypes.ORG_OWNER,
          UserTypes.ORG_ADMIN,
          UserTypes.MANAGER,
          UserTypes.TEAM_LEAD,
          UserTypes.AGENT,
          UserTypes.ORG_AGENT,
        ],
        children: [
          {
            title: 'All Users',
            icon: 'mdi:accounts-outline',
            path: '/users?tab=allusers',
            permissionLevel: [
              UserTypes.SUPER_ADMIN,
              UserTypes.ORG_OWNER,
              UserTypes.ORG_ADMIN,
              UserTypes.MANAGER,
              UserTypes.TEAM_LEAD,
            ],
          },
          {
            title: 'Service Users',
            icon: 'mdi:accounts-outline',
            path: '/users?tab=serviceusers',
            permissionLevel: [
              UserTypes.SUPER_ADMIN,
              UserTypes.ORG_OWNER,
              UserTypes.ORG_ADMIN,
              UserTypes.MANAGER,
              UserTypes.TEAM_LEAD,
              UserTypes.AGENT,
              UserTypes.ORG_AGENT,
            ],
          },
          {
            title: 'Organization Users',
            icon: 'mdi:accounts-outline',
            path: '/users?tab=orgusers',
            permissionLevel: [
              UserTypes.SUPER_ADMIN,
              UserTypes.ORG_OWNER,
              UserTypes.ORG_ADMIN,
              UserTypes.MANAGER,
              UserTypes.TEAM_LEAD,
            ],
          },
          {
            title: 'Organization Agents',
            icon: 'mdi:accounts-outline',
            path: '/users?tab=orgagents',
            permissionLevel: [
              UserTypes.SUPER_ADMIN,
              UserTypes.ORG_OWNER,
              UserTypes.ORG_ADMIN,
              UserTypes.MANAGER,
            ],
          },
          {
            title: 'De Assists Agents',
            icon: 'mdi:accounts-outline',
            path: '/users?tab=agents',
            permissionLevel: [
              UserTypes.SUPER_ADMIN,
              UserTypes.ORG_ADMIN,
              UserTypes.MANAGER,
            ],
          },
        ],
      },
      {
        title: 'Organization',
        icon: 'octicon:organization-16',
        path: '/organizations',
        permissionLevel: [UserTypes.SUPER_ADMIN],
      },
      {
        title: 'Services Setup',
        icon: 'material-symbols:settings-applications-outline',
        permissionLevel: [
          UserTypes.SUPER_ADMIN,
          UserTypes.MANAGER,
          UserTypes.ORG_ADMIN,
          UserTypes.ORG_OWNER,
        ],
        children: [
          {
            title: 'Forms',
            icon: 'heroicons:newspaper',
            path: `/page-workinprogress?status=forms`,
            permissionLevel: [
              UserTypes.SUPER_ADMIN,
              UserTypes.MANAGER,
              UserTypes.ORG_ADMIN,
              UserTypes.ORG_OWNER,
            ],
          },
          {
            title: 'Questions',
            icon: 'ph:question-bold',
            path: `/page-workinprogress?status=questions`,
            permissionLevel: [
              UserTypes.SUPER_ADMIN,
              UserTypes.MANAGER,
              UserTypes.ORG_ADMIN,
              UserTypes.ORG_OWNER,
            ],
          },
        ],
      },
      {
        title: 'Email Setup',
        icon: 'ic:outline-email',
        permissionLevel: [
          UserTypes.SUPER_ADMIN,
          UserTypes.MANAGER,
          UserTypes.ORG_ADMIN,
          UserTypes.ORG_OWNER,
        ],
        children: [
          {
            title: 'Automated Emails',
            icon: 'ic:outline-email',
            path: `/page-workinprogress?status=automatedemails`,
            permissionLevel: [
              UserTypes.SUPER_ADMIN,
              UserTypes.MANAGER,
              UserTypes.ORG_ADMIN,
              UserTypes.ORG_OWNER,
            ],
          },
          {
            title: 'Custom Emails',
            icon: 'ic:outline-email',
            path: `/${CollectionNames.EmailTemplates}`,
          },
        ],
      },
      {
        title: 'Roles & Permissions',
        icon: 'oui:app-users-roles',
        path: '/roles',
        permissionLevel: [UserTypes.SUPER_ADMIN],
      },
    ],
  },
];
