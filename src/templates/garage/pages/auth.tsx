import { Truck } from 'lucide-react';
import { AuthCard } from '@/components/app/auth-card';
import { ForgotPasswordForm } from '@/components/app/forgot-password-form';
import { LoginForm } from '@/components/app/login-form';
import { RegisterForm } from '@/components/app/register-form';
import { VehicleHealthCard } from '@/components/fleet/vehicle-health-card';
import { getVehicle, modelLine } from '../data';
import type { PageContext } from '../context';

const BRAND = (
  <span className="flex items-center gap-2 text-base font-bold">
    <Truck className="size-5" /> Garage
  </span>
);

/** The right-hand panel: a real fleet component, so the sign-in page shows what is behind it. */
function Aside() {
  const vehicle = getVehicle('v21')!;
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <p className="text-lg font-medium tracking-tight">Know which vehicle needs attention before it stops.</p>
      <VehicleHealthCard
        name={vehicle.name}
        model={modelLine(vehicle)}
        plate={vehicle.plate}
        odometerKm={vehicle.odometerKm}
        score={vehicle.score}
        issues={vehicle.issues}
        nextService={vehicle.nextService}
      />
    </div>
  );
}

export function LoginPage({ navigate }: PageContext) {
  return (
    <div className="flex min-h-svh items-center p-4 sm:p-8">
      <AuthCard variant="split" brand={BRAND} title="Welcome back" description="Sign in to see your fleet." aside={<Aside />}>
        <LoginForm
          defaultValues={{ email: 'priya@northwind.example' }}
          providers={[{ id: 'google', label: 'Google' }]}
          onSubmit={() => navigate('/')}
          onProvider={() => navigate('/')}
          onForgotPassword={() => navigate('/forgot-password')}
          onSwitchToRegister={() => navigate('/register')}
        />
      </AuthCard>
    </div>
  );
}

export function RegisterPage({ navigate }: PageContext) {
  return (
    <div className="flex min-h-svh items-center p-4 sm:p-8">
      <AuthCard variant="split" brand={BRAND} title="Create your workspace" description="Free for fleets of up to five vehicles." aside={<Aside />}>
        <RegisterForm
          extraFields={[{ id: 'company', label: 'Company', placeholder: 'Northwind Logistics', required: true }]}
          onSubmit={() => navigate('/')}
          onSwitchToLogin={() => navigate('/login')}
        />
      </AuthCard>
    </div>
  );
}

export function ForgotPasswordPage({ navigate }: PageContext) {
  return (
    <div className="flex min-h-svh items-center p-4">
      <AuthCard brand={BRAND} title="Reset your password" description="We will email you a link to choose a new one.">
        <ForgotPasswordForm defaultEmail="priya@northwind.example" onSubmit={() => new Promise<void>((resolve) => setTimeout(resolve, 600))} onBack={() => navigate('/login')} />
      </AuthCard>
    </div>
  );
}
