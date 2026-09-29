import { AuthCard } from '@/components/app/auth-card';
import { VerifyCodeForm } from '@/components/app/verify-code-form';
import { AuthLayout } from '../layouts';
import type { PageProps } from './types';

export function VerifyPage({ navigate }: PageProps) {
  return (
    <AuthLayout>
      <AuthCard className="max-w-md" brand="Ledger" title="Check your email" description="We sent a six digit code. It works for ten minutes.">
        <VerifyCodeForm destination="nadia@northwind.example" onComplete={() => navigate('/app')} />
      </AuthCard>
    </AuthLayout>
  );
}
