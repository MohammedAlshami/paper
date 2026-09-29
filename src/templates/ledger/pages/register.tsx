import { AuthCard } from '@/components/app/auth-card';
import { RegisterForm } from '@/components/app/register-form';
import { TestimonialGrid } from '@/components/app/testimonial-grid';
import { TESTIMONIALS } from '../data';
import { AuthLayout } from '../layouts';
import type { PageProps } from './types';

export function RegisterPage({ base, navigate }: PageProps) {
  return (
    <AuthLayout>
      <AuthCard
        variant="split"
        className="max-w-4xl"
        brand="Ledger"
        title="Create your workspace"
        description="Free for three people. No card needed."
        aside={<TestimonialGrid className="[&>div]:grid-cols-1" testimonials={TESTIMONIALS.slice(1, 2)} />}
        footer={<a href={`${base}`}>← Back to the site</a>}
      >
        <RegisterForm
          extraFields={[{ id: 'company', label: 'Company', placeholder: 'Northwind' }]}
          termsLabel="I agree to the terms and privacy policy"
          onSubmit={() => navigate('/verify')}
          onSwitchToLogin={() => navigate('/login')}
        />
      </AuthCard>
    </AuthLayout>
  );
}
