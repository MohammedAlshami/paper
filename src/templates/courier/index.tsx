import { CircleHelp } from 'lucide-react';
import { EmptyState } from '@/components/app/empty-state';
import { resolveRoute } from '../router';
import type { TemplateProps } from '../types';
import { ConsoleLayout, PublicLayout } from './layouts';
import { AnalyticsPage } from './pages/analytics';
import { ForgotPasswordPage, LoginPage, RegisterPage } from './pages/auth';
import { CheckoutPage } from './pages/checkout';
import { DispatchPage } from './pages/dispatch';
import { RoutesPage } from './pages/routes';
import { SettingsPage } from './pages/settings';
import { TrackPage } from './pages/track';

/** Courier: a delivery platform. Customers track and check out; dispatchers run the day. */
export default function CourierTemplate({ path, navigate, base }: TemplateProps) {
  const found = resolveRoute(
    [
      { path: '/login', kind: 'auth' },
      { path: '/register', kind: 'auth' },
      { path: '/forgot-password', kind: 'auth' },
      { path: '/track/:id', kind: 'public' },
      { path: '/checkout', kind: 'public' },
      { path: '/', kind: 'console' },
      { path: '/dispatch', kind: 'console' },
      { path: '/routes', kind: 'console' },
      { path: '/analytics', kind: 'console' },
      { path: '/settings', kind: 'console' },
    ],
    path,
  );

  if (!found) {
    return (
      <PublicLayout base={base} navigate={navigate}>
        <EmptyState icon={CircleHelp} title="Page not found" description={`There is nothing at ${path}.`} action={{ label: 'Go to dispatch', onClick: () => navigate('/dispatch') }} />
      </PublicLayout>
    );
  }

  const { route, params } = found;
  switch (route.path) {
    case '/login':
      return <LoginPage base={base} navigate={navigate} />;
    case '/register':
      return <RegisterPage base={base} navigate={navigate} />;
    case '/forgot-password':
      return <ForgotPasswordPage base={base} navigate={navigate} />;
    case '/track/:id':
      return (
        <PublicLayout base={base} navigate={navigate}>
          <TrackPage id={params.id} navigate={navigate} />
        </PublicLayout>
      );
    case '/checkout':
      return (
        <PublicLayout base={base} navigate={navigate}>
          <CheckoutPage navigate={navigate} />
        </PublicLayout>
      );
    default:
      return (
        <ConsoleLayout path={path} base={base} navigate={navigate}>
          {route.path === '/routes' ? <RoutesPage /> : route.path === '/analytics' ? <AnalyticsPage /> : route.path === '/settings' ? <SettingsPage /> : <DispatchPage />}
        </ConsoleLayout>
      );
  }
}
