import { TourStep } from '@/components/tour';

export const dashboardTourSteps: TourStep[] = [
  {
    id: 'welcome',
    target: '[data-tour="sidebar"]',
    title: 'Welcome to TaxHub Admin! 👋',
    description: 'This is your central hub for managing tax clients. Let us show you around the key features of this dashboard.',
    position: 'right',
  },
  {
    id: 'dashboard',
    target: '[data-tour="nav-dashboard"]',
    title: 'Dashboard Overview',
    description: 'Your command center! View key metrics, pending tasks, and get a quick snapshot of all client activities at a glance.',
    position: 'right',
  },
  {
    id: 'clients',
    target: '[data-tour="nav-clients"]',
    title: 'Client Management',
    description: 'Manage all your tax clients here. View their filing status, documents, payments, and detailed T1 form data.',
    position: 'right',
  },
  {
    id: 'documents',
    target: '[data-tour="nav-documents"]',
    title: 'Document Center',
    description: 'Access all uploaded documents. Approve, request re-uploads, or mark documents as missing from this centralized view.',
    position: 'right',
  },
  {
    id: 'payments',
    target: '[data-tour="nav-payments"]',
    title: 'Payment Tracking',
    description: 'Track all client payments, send payment requests, and manage invoices. Keep your finances organized in one place.',
    position: 'right',
  },
  {
    id: 'analytics',
    target: '[data-tour="nav-analytics"]',
    title: 'Analytics & Reports',
    description: 'Gain insights with detailed analytics. Track revenue, client trends, and document completion rates.',
    position: 'right',
  },
  {
    id: 'search',
    target: '[data-tour="search"]',
    title: 'Quick Search',
    description: 'Instantly find clients by name, email, or phone. Press Ctrl+K (or ⌘+K on Mac) for quick access.',
    position: 'bottom',
  },
  {
    id: 'notifications',
    target: '[data-tour="notifications"]',
    title: 'Notifications',
    description: 'Stay updated with real-time notifications for document uploads, payment requests, and client activities.',
    position: 'bottom',
  },
  {
    id: 'theme',
    target: '[data-tour="theme-toggle"]',
    title: 'Theme Toggle',
    description: 'Switch between light and dark mode based on your preference. Your eyes will thank you!',
    position: 'bottom',
  },
  {
    id: 'user-menu',
    target: '[data-tour="user-menu"]',
    title: 'User Menu',
    description: 'Access your profile, settings, and logout option. You can also manage your account preferences here.',
    position: 'left',
  },
];

export const clientDetailTourSteps: TourStep[] = [
  {
    id: 'client-header',
    target: '[data-tour="client-header"]',
    title: 'Client Overview',
    description: 'Quick view of client status, payment info, and contact details. Update status or manage client directly from here.',
    position: 'bottom',
  },
  {
    id: 'client-tabs',
    target: '[data-tour="client-tabs"]',
    title: 'Information Tabs',
    description: 'Navigate between different sections: Documents, Detailed T1 Data, Tax Files, Notes, and Payments.',
    position: 'bottom',
  },
  {
    id: 'documents-tab',
    target: '[data-tour="tab-documents"]',
    title: 'Documents Tab',
    description: 'View all uploaded documents organized by category. Approve, request re-uploads, or mark as missing.',
    position: 'bottom',
  },
  {
    id: 'detailed-data-tab',
    target: '[data-tour="tab-detailed-data"]',
    title: 'Detailed Data Tab',
    description: 'Access the complete T1 form with all questionnaire answers. Copy data directly for CRA filing.',
    position: 'bottom',
  },
  {
    id: 'tax-files-tab',
    target: '[data-tour="tab-tax-files"]',
    title: 'Tax Files Tab',
    description: 'Upload T1 returns and T183 forms. Send for client approval and track filing status.',
    position: 'bottom',
  },
  {
    id: 'export-pdf',
    target: '[data-tour="export-pdf"]',
    title: 'Export to PDF',
    description: 'Generate a comprehensive PDF with all client data, T1 form details, and document links.',
    position: 'left',
  },
];
