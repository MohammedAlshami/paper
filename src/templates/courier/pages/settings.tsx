import { Bell, Shield, User } from 'lucide-react';
import { NotificationPreferences } from '@/components/app/notification-preferences';
import { PageHeader } from '@/components/app/page-header';
import { ProfileForm } from '@/components/app/profile-form';
import { SettingsLayout } from '@/components/app/settings-layout';
import { VerifyCodeForm } from '@/components/app/verify-code-form';
import { CHANNELS, NOTIFICATION_DEFAULTS, NOTIFICATION_GROUPS, PROFILE, ROLES } from '../data/ops';

export function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Your profile, what you are told about, and how you sign in." breadcrumbs={[{ label: 'Courier' }, { label: 'Settings' }]} />
      <SettingsLayout
        sections={[
          { id: 'profile', label: 'Profile', icon: User, description: 'How your team sees you.', content: <ProfileForm defaultValues={PROFILE} roles={ROLES} /> },
          {
            id: 'notifications',
            label: 'Notifications',
            icon: Bell,
            description: 'Choose what to be told about, and where.',
            content: <NotificationPreferences groups={NOTIFICATION_GROUPS} channels={CHANNELS} defaultValue={NOTIFICATION_DEFAULTS} />,
          },
          {
            id: 'security',
            label: 'Two-step sign-in',
            icon: Shield,
            description: 'Confirm it is you with a code from your authenticator app.',
            content: <VerifyCodeForm className="max-w-sm" destination="your authenticator app" />,
          },
        ]}
      />
    </>
  );
}
