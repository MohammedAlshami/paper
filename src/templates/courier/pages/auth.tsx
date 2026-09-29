import { AuthCard } from '@/components/app/auth-card';
import { ForgotPasswordForm } from '@/components/app/forgot-password-form';
import { LoginForm } from '@/components/app/login-form';
import { RegisterForm } from '@/components/app/register-form';
import { AuthLayout, Brand } from '../layouts';

interface Props {
  base: string;
  navigate: (path: string) => void;
}

const Aside = () => (
  <figure className="flex flex-col gap-3">
    <blockquote className="text-lg font-medium tracking-tight">“Customers stopped calling to ask where their order was. The tracking page answers before they ask.”</blockquote>
    <figcaption className="text-sm text-muted-foreground">Priya Nair, dispatcher at Courier</figcaption>
  </figure>
);

const PROVIDERS = [
  { id: 'google', label: 'Google' },
  { id: 'sso', label: 'Company SSO' },
];

export function LoginPage({ base, navigate }: Props) {
  return (
    <AuthLayout>
      <AuthCard variant="split" brand={<Brand />} title="Welcome back" description="Sign in to run today's deliveries." footer="By continuing you agree to the terms and the privacy policy." aside={<Aside />}>
        <LoginForm
          providers={PROVIDERS}
          defaultValues={{ email: 'priya@courier.example' }}
          forgotPasswordHref={`${base}/forgot-password`}
          registerHref={`${base}/register`}
          onSubmit={() => navigate('/dispatch')}
          onProvider={() => navigate('/dispatch')}
        />
      </AuthCard>
    </AuthLayout>
  );
}

export function RegisterPage({ base, navigate }: Props) {
  return (
    <AuthLayout>
      <AuthCard variant="split" brand={<Brand />} title="Create your account" description="Set up dispatch for your team in a few minutes." footer="You can invite drivers once you are in." aside={<Aside />}>
        <RegisterForm
          extraFields={[{ id: 'company', label: 'Company', placeholder: 'Northwind Delivery', required: true }]}
          loginHref={`${base}/login`}
          onSubmit={() => navigate('/dispatch')}
        />
      </AuthCard>
    </AuthLayout>
  );
}

export function ForgotPasswordPage({ base }: Props) {
  return (
    <AuthLayout>
      <AuthCard brand={<Brand />} title="Reset your password" description="We will email you a link to choose a new one.">
        <ForgotPasswordForm backHref={`${base}/login`} onSubmit={() => new Promise<void>((resolve) => window.setTimeout(resolve, 600))} />
      </AuthCard>
    </AuthLayout>
  );
}
