import * as React from 'react';
import { resolveRoute } from '../router';
import type { TemplateProps } from '../types';
import { BillingPage } from './pages/billing';
import { CustomersPage } from './pages/customers';
import { ForgotPasswordPage } from './pages/forgot-password';
import { LandingPage } from './pages/landing';
import { LoginPage } from './pages/login';
import { NotFoundPage } from './pages/not-found';
import { OverviewPage } from './pages/overview';
import { RegisterPage } from './pages/register';
import { SettingsPage } from './pages/settings';
import { TeamPage } from './pages/team';
import type { PageProps } from './pages/types';
import { VerifyPage } from './pages/verify';

const ROUTES: { path: string; page: React.ComponentType<PageProps> }[] = [
  { path: '/', page: LandingPage },
  { path: '/login', page: LoginPage },
  { path: '/register', page: RegisterPage },
  { path: '/forgot-password', page: ForgotPasswordPage },
  { path: '/verify', page: VerifyPage },
  { path: '/app', page: OverviewPage },
  { path: '/app/customers', page: CustomersPage },
  { path: '/app/billing', page: BillingPage },
  { path: '/app/team', page: TeamPage },
  { path: '/app/settings', page: SettingsPage },
];

/** Ledger — a SaaS starter: a public site, the auth flow, and a signed-in app. Every piece of interface is a component from src/components. */
export default function LedgerTemplate({ path, navigate, base }: TemplateProps) {
  const match = resolveRoute(ROUTES, path);
  const Page = match?.route.page ?? NotFoundPage;
  return <Page key={path} base={base} navigate={navigate} />;
}
