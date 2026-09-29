import { AuthCard } from '@/components/app/auth-card';
import { LoginForm } from '@/components/app/login-form';
import { TestimonialGrid } from '@/components/app/testimonial-grid';
import { TESTIMONIALS } from '../data';
import { AuthLayout } from '../layouts';
import type { PageProps } from './types';

export function LoginPage({ base, navigate }: PageProps) {
  return (
    <AuthLayout>
      <AuthCard
        variant="split"
        className="max-w-4xl"
        brand="Ledger"
        title="Welcome back"
        description="Sign in to see where the money is."
        aside={<TestimonialGrid className="[&>div]:grid-cols-1" testimonials={TESTIMONIALS.slice(0, 1)} />}
        footer={<a href={`${base}`}>← Back to the site</a>}
      >
        <LoginForm
          defaultValues={{ email: 'nadia@northwind.example', password: '', remember: true }}
          providers={[{ id: 'google', label: 'Google' }, { id: 'github', label: 'GitHub' }]}
          onProvider={() => navigate('/app')}
          onSubmit={() => navigate('/app')}
          onForgotPassword={() => navigate('/forgot-password')}
          onSwitchToRegister={() => navigate('/register')}
        />
      </AuthCard>
    </AuthLayout>
  );
}
