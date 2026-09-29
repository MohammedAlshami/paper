import type { TemplatePage } from '../types';

/** The routes of the Ledger template and the components each one uses. */
export const LEDGER_PAGES: TemplatePage[] = [
  { path: '/', label: 'Landing page', description: 'The public site: a hero with a live product visual, features, customer quotes, pricing with a billing toggle, FAQ and a closing call to action.', components: ['site-header', 'hero-section', 'stat-card-grid', 'revenue-chart', 'feature-grid', 'testimonial-grid', 'pricing-table', 'faq-list', 'cta-banner', 'site-footer'] },
  { path: '/login', label: 'Sign in', description: 'A split sign-in screen with social buttons and validation. Signing in lands in the app.', components: ['auth-card', 'login-form', 'testimonial-grid'] },
  { path: '/register', label: 'Create account', description: 'Registration with a company field and a password strength meter, leading to email verification.', components: ['auth-card', 'register-form', 'testimonial-grid'] },
  { path: '/forgot-password', label: 'Forgot password', description: 'Ask for a reset link, then a confirmation state.', components: ['auth-card', 'forgot-password-form'] },
  { path: '/verify', label: 'Verify email', description: 'A six digit code with auto-advance and paste, then into the app.', components: ['auth-card', 'verify-code-form'] },
  { path: '/app', label: 'Overview', description: 'The signed-in home: headline numbers, revenue over time, and recent activity. Press Cmd-K for the command palette.', components: ['app-shell', 'page-header', 'stat-card-grid', 'revenue-chart', 'activity-feed', 'command-palette', 'notifications-popover'] },
  { path: '/app/customers', label: 'Customers', description: 'A searchable, filterable, sortable table with row selection and bulk actions. Click a row for its detail sheet.', components: ['app-shell', 'page-header', 'data-table', 'record-detail-sheet'] },
  { path: '/app/billing', label: 'Billing', description: 'The current plan with usage meters, the card on file, invoices, and the plans to switch to.', components: ['app-shell', 'page-header', 'plan-usage-card', 'payment-method-card', 'invoice-list', 'pricing-table'] },
  { path: '/app/team', label: 'Team', description: 'Members and roles, with an invite dialog and removal.', components: ['app-shell', 'page-header', 'team-members'] },
  { path: '/app/settings', label: 'Settings', description: 'Profile, notification preferences, API keys with one-time secrets, and a danger zone that asks you to type to confirm.', components: ['app-shell', 'page-header', 'settings-layout', 'profile-form', 'notification-preferences', 'api-key-list', 'danger-zone-card'] },
];
