/** Demo values for the auth components. All invented. */
import type { NotificationChannel, NotificationGroup } from '@/components/app/notification-preferences';
import type { ProfileValues } from '@/components/app/profile-form';

export const PROFILE: ProfileValues = {
  name: 'Priya Nair',
  email: 'priya@northwind.example',
  role: 'Fleet manager',
  bio: 'Runs maintenance for the depot. Ask me about brake pads.',
};

export const PROFILE_ROLES = ['Fleet manager', 'Workshop lead', 'Technician', 'Dispatcher', 'Viewer'];

export const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  { id: 'email', label: 'Email' },
  { id: 'push', label: 'Push' },
  { id: 'sms', label: 'SMS' },
];

export const NOTIFICATION_GROUPS: NotificationGroup[] = [
  {
    id: 'work',
    title: 'Work',
    items: [
      { id: 'assigned', label: 'A work order is assigned to me', description: 'When someone puts a job on your list.' },
      { id: 'comments', label: 'Comments on my work orders' },
    ],
  },
  {
    id: 'fleet',
    title: 'Fleet',
    items: [
      { id: 'due', label: 'A service is coming due', description: 'Seven days before the date or 500 km before the reading.' },
      { id: 'faults', label: 'A new fault code appears' },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    items: [{ id: 'billing', label: 'Invoices and payment problems' }],
  },
];

export const NOTIFICATION_DEFAULTS: Record<string, boolean> = {
  'assigned.email': true,
  'assigned.push': true,
  'comments.push': true,
  'due.email': true,
  'due.sms': true,
  'faults.push': true,
  'faults.sms': true,
  'billing.email': true,
};
