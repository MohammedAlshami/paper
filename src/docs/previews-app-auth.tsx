import * as React from 'react';
import { Truck } from 'lucide-react';
import { AuthCard } from '@/components/app/auth-card';
import { ForgotPasswordForm } from '@/components/app/forgot-password-form';
import { LoginForm } from '@/components/app/login-form';
import { NotificationPreferences } from '@/components/app/notification-preferences';
import { ProfileForm } from '@/components/app/profile-form';
import { RegisterForm } from '@/components/app/register-form';
import { VerifyCodeForm } from '@/components/app/verify-code-form';
import { NOTIFICATION_CHANNELS, NOTIFICATION_DEFAULTS, NOTIFICATION_GROUPS, PROFILE, PROFILE_ROLES } from './fixtures/app-auth';

const NARROW = 'w-full max-w-[24rem]';
const MEDIUM = 'w-full max-w-[36rem]';

const PROVIDERS = [
  { id: 'google', label: 'Google', icon: <span className="flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">G</span> },
  { id: 'github', label: 'GitHub', icon: <span className="flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">H</span> },
];

const Brand = () => (
  <>
    <span className="flex size-6 items-center justify-center rounded-md bg-foreground text-background">
      <Truck className="size-3.5" />
    </span>
    Northwind Fleet
  </>
);

export const APP_AUTH_PREVIEWS: Record<string, React.ReactNode> = {
  'auth-card': (
    <AuthCard
      variant="split"
      brand={<Brand />}
      title="Welcome back"
      description="Sign in to see your fleet."
      footer="By continuing you agree to the terms and the privacy policy."
      aside={
        <figure className="flex flex-col gap-3">
          <blockquote className="text-lg font-medium tracking-tight">“We used to chase service dates in a spreadsheet. Now the van tells us before the mechanic has to.”</blockquote>
          <figcaption className="text-sm text-muted-foreground">Priya Nair, fleet manager at Northwind Logistics</figcaption>
        </figure>
      }
    >
      <LoginForm providers={PROVIDERS} forgotPasswordHref="#" registerHref="#" />
    </AuthCard>
  ),
  'login-form': <LoginForm className={NARROW} providers={PROVIDERS} forgotPasswordHref="#" registerHref="#" />,
  'register-form': <RegisterForm className={NARROW} extraFields={[{ id: 'company', label: 'Company', placeholder: 'Northwind Logistics', required: true }]} loginHref="#" defaultValues={{ name: 'Ada Lovelace', email: 'ada@northwind.example', password: 'Torque-7-wrench', extra: { company: 'Northwind Logistics' } }} />,
  'forgot-password-form': <ForgotPasswordForm className={NARROW} defaultEmail="priya@northwind.example" backHref="#" />,
  'verify-code-form': <VerifyCodeForm className={NARROW} destination="priya@northwind.example" resendSeconds={24} />,
  'profile-form': <ProfileForm className={MEDIUM} defaultValues={PROFILE} roles={PROFILE_ROLES} />,
  'notification-preferences': <NotificationPreferences className={MEDIUM} groups={NOTIFICATION_GROUPS} channels={NOTIFICATION_CHANNELS} defaultValue={NOTIFICATION_DEFAULTS} />,
};

export const APP_AUTH_EXAMPLES: Record<string, { label: string; node: React.ReactNode }[]> = {
  'auth-card': [{ label: 'A centred card', node: <AuthCard title="Reset your password" description="We will email you a link." brand={<Brand />}><ForgotPasswordForm backHref="#" /></AuthCard> }],
  'login-form': [
    { label: 'Signing in', node: <LoginForm className={NARROW} defaultValues={{ email: 'priya@northwind.example', password: 'hunter2hunter2' }} loading /> },
    { label: 'A failed sign-in', node: <LoginForm className={NARROW} defaultValues={{ email: 'priya@northwind.example' }} error="Wrong email or password." /> },
  ],
  'register-form': [{ label: 'With a company field', node: <RegisterForm className={NARROW} extraFields={[{ id: 'company', label: 'Company', required: true }]} /> }],
  'forgot-password-form': [{ label: 'Already sent', node: <ForgotPasswordForm className={NARROW} defaultEmail="priya@northwind.example" defaultSent backHref="#" /> }],
  'verify-code-form': [{ label: 'Four digits, no countdown', node: <VerifyCodeForm className={NARROW} length={4} resendSeconds={0} /> }],
  'profile-form': [{ label: 'Free-text role', node: <ProfileForm className={MEDIUM} defaultValues={{ name: 'Sam Okafor', email: 'sam@northwind.example', role: 'Driver', bio: '' }} /> }],
  'notification-preferences': [{ label: 'One channel', node: <NotificationPreferences className={MEDIUM} channels={[{ id: 'email', label: 'Email' }]} groups={NOTIFICATION_GROUPS.slice(0, 2)} defaultValue={NOTIFICATION_DEFAULTS} /> }],
};
