import { Bell, User } from 'lucide-react';
import { NotificationPreferences } from '@/components/app/notification-preferences';
import { PageHeader } from '@/components/app/page-header';
import { ProfileForm } from '@/components/app/profile-form';
import { SettingsLayout } from '@/components/app/settings-layout';
import { CHANNELS, NOTIFICATION_DEFAULTS, NOTIFICATION_GROUPS, PROFILE, ROLES } from '../data';
import { GarageShell, PageBody } from '../shell';
import type { PageContext } from '../context';

export function SettingsPage(ctx: PageContext) {
  return (
    <GarageShell activeId="settings" ctx={ctx}>
      <PageBody>
        <PageHeader title="Settings" description="Your profile, and what is worth an email or a push." />
        <SettingsLayout
          sections={[
            { id: 'profile', label: 'Profile', icon: User, description: 'How you appear to the rest of the workshop.', content: <ProfileForm defaultValues={PROFILE} roles={ROLES} /> },
            {
              id: 'notifications',
              label: 'Notifications',
              icon: Bell,
              description: 'Choose what reaches you, and where.',
              content: <NotificationPreferences groups={NOTIFICATION_GROUPS} channels={CHANNELS} defaultValue={NOTIFICATION_DEFAULTS} />,
            },
          ]}
        />
      </PageBody>
    </GarageShell>
  );
}
