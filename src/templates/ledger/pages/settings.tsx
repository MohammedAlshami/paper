import * as React from 'react';
import { ApiKeyList } from '@/components/app/api-key-list';
import { DangerZoneCard } from '@/components/app/danger-zone-card';
import { NotificationPreferences } from '@/components/app/notification-preferences';
import { PageHeader } from '@/components/app/page-header';
import { ProfileForm } from '@/components/app/profile-form';
import { SettingsLayout } from '@/components/app/settings-layout';
import { API_KEYS, DANGER_ACTIONS, NOTIFICATION_CHANNELS, NOTIFICATION_DEFAULTS, NOTIFICATION_GROUPS } from '../data';
import { AppLayout } from '../layouts';
import type { PageProps } from './types';

export function SettingsPage(props: PageProps) {
  const [keys, setKeys] = React.useState(API_KEYS);
  return (
    <AppLayout {...props} active="/app/settings">
      <PageHeader title="Settings" description="Your profile, notifications and the keys your code uses." breadcrumbs={[{ label: 'Ledger' }, { label: 'Settings' }]} />
      <SettingsLayout
        sections={[
          {
            id: 'profile',
            label: 'Profile',
            description: 'How you appear to your team.',
            content: <ProfileForm roles={['Owner', 'Admin', 'Member']} defaultValues={{ name: 'Nadia Rahman', email: 'nadia@northwind.example', role: 'Owner', bio: 'Runs finance at Northwind. Ask me about invoices.' }} />,
          },
          {
            id: 'notifications',
            label: 'Notifications',
            description: 'What to be told about, and where.',
            content: <NotificationPreferences groups={NOTIFICATION_GROUPS} channels={NOTIFICATION_CHANNELS} defaultValue={NOTIFICATION_DEFAULTS} />,
          },
          {
            id: 'api',
            label: 'API keys',
            description: 'Keys let your own code talk to Ledger.',
            content: (
              <ApiKeyList
                keys={keys}
                onCreate={(name) => {
                  const prefix = `lg_live_${Math.random().toString(16).slice(2, 6)}`;
                  setKeys((list) => [...list, { id: `k${list.length + 1}`, name, prefix, createdAt: '2026-09-29', scope: 'Read and write' }]);
                  return `${prefix}${Math.random().toString(16).slice(2, 14)}`;
                }}
                onRevoke={(key) => setKeys((list) => list.filter((item) => item.id !== key.id))}
              />
            ),
          },
          { id: 'danger', label: 'Danger zone', description: 'Things that cannot be taken back.', content: <DangerZoneCard actions={DANGER_ACTIONS} /> },
        ]}
      />
    </AppLayout>
  );
}
