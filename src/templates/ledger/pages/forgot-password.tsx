import { AuthCard } from '@/components/app/auth-card';
import { ForgotPasswordForm } from '@/components/app/forgot-password-form';
import { AuthLayout } from '../layouts';
import type { PageProps } from './types';

export function ForgotPasswordPage({ navigate }: PageProps) {
  return (
    <AuthLayout>
      <AuthCard className="max-w-md" brand="Ledger" title="Forgot your password?" description="Tell us your email and we will send a link to choose a new one.">
        <ForgotPasswordForm onSubmit={() => new Promise<void>((resolve) => setTimeout(resolve, 600))} onBack={() => navigate('/login')} />
      </AuthCard>
    </AuthLayout>
  );
}
