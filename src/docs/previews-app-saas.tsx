import * as React from 'react';
import { BarChart3, Bell, Lock, Users, Workflow, Zap } from 'lucide-react';
import { FaqList } from '@/components/app/faq-list';
import { FeatureGrid } from '@/components/app/feature-grid';
import { HeroSection } from '@/components/app/hero-section';
import { InvoiceList } from '@/components/app/invoice-list';
import { PaymentMethodCard } from '@/components/app/payment-method-card';
import { PlanUsageCard } from '@/components/app/plan-usage-card';
import { PricingTable } from '@/components/app/pricing-table';
import { SiteFooter } from '@/components/app/site-footer';
import { SiteHeader } from '@/components/app/site-header';
import { TeamMembers } from '@/components/app/team-members';
import { FAQS, FOOTER_COLUMNS, INVOICES, LOGOS, MEMBERS, NAV_LINKS, PLANS, USAGE_METERS } from './fixtures/app-saas';

const NARROW = 'w-full max-w-[28rem]';
const MEDIUM = 'w-full max-w-[36rem]';
const WIDE = 'w-full max-w-[60rem]';

export const FEATURES = [
  { id: 'f1', title: 'Live dashboards', description: 'Every number updates as it changes, with no refresh and no export.', icon: <BarChart3 /> },
  { id: 'f2', title: 'Roles and access', description: 'Decide who sees what, down to a single column, and audit every change.', icon: <Lock /> },
  { id: 'f3', title: 'Automations', description: 'When an invoice is late, send the reminder. Set it once, forget about it.', icon: <Workflow /> },
  { id: 'f4', title: 'Alerts that matter', description: 'Get told about the three things that need you, not the three hundred that do not.', icon: <Bell /> },
  { id: 'f5', title: 'Shared workspaces', description: 'One place for the whole team, with comments right next to the data.', icon: <Users /> },
  { id: 'f6', title: 'Fast by default', description: 'Tables of a million rows scroll without a stutter.', icon: <Zap /> },
];

export const APP_SAAS_PREVIEWS: Record<string, React.ReactNode> = {
  'pricing-table': <PricingTable className={WIDE} plans={PLANS} />,
  'plan-usage-card': <PlanUsageCard className={MEDIUM} planName="Growth" price={624} interval="month" renewsOn="2026-10-01" meters={USAGE_METERS} />,
  'invoice-list': <InvoiceList className={MEDIUM} invoices={INVOICES} />,
  'payment-method-card': <PaymentMethodCard className={NARROW} brand="visa" last4="4242" expMonth={11} expYear={2028} holder="Nadia Rahman" isDefault />,
  'team-members': <TeamMembers className={MEDIUM} members={MEMBERS} currentUserId="m1" />,
  'site-header': <SiteHeader className={WIDE} brand="Ledger" links={NAV_LINKS} primaryAction={{ label: 'Start free', href: '#start' }} secondaryAction={{ label: 'Sign in', href: '#login' }} />,
  'hero-section': (
    <HeroSection
      className={WIDE}
      eyebrow="Now with automations"
      title="Know where every dollar is, without the spreadsheet."
      description="Ledger keeps your customers, invoices and cash in one calm place, so the month end takes an afternoon instead of a week."
      primaryAction={{ label: 'Start free' }}
      secondaryAction={{ label: 'See how it works' }}
      logos={LOGOS}
    />
  ),
  'feature-grid': <FeatureGrid className={WIDE} title="Everything the finance team asks for" description="And a few things they did not know they could ask for." features={FEATURES} />,
  'faq-list': <FaqList className={MEDIUM} items={FAQS} defaultOpenId="q1" />,
  'site-footer': <SiteFooter className={WIDE} brand="Ledger" tagline="Calm money software for small teams." columns={FOOTER_COLUMNS} legal="© 2026 Ledger, Inc. All rights reserved." />,
};

export const APP_SAAS_EXAMPLES: Record<string, { label: string; node: React.ReactNode }[]> = {
  'pricing-table': [{ label: 'Monthly by default, two plans', node: <PricingTable className={WIDE} plans={PLANS.slice(0, 2)} defaultBilling="monthly" /> }],
  'plan-usage-card': [{ label: 'Comfortably under every limit', node: <PlanUsageCard className={MEDIUM} planName="Starter" price={0} renewsOn="2026-10-01" meters={USAGE_METERS.map((meter) => ({ ...meter, used: Math.round(meter.used / 4) }))} /> }],
  'invoice-list': [{ label: 'Paid only', node: <InvoiceList className={MEDIUM} invoices={INVOICES.filter((invoice) => invoice.status === 'paid')} /> }],
  'payment-method-card': [{ label: 'An expired card', node: <PaymentMethodCard className={NARROW} brand="mastercard" last4="0087" expMonth={3} expYear={2025} /> }],
  'team-members': [{ label: 'A small team, fewer roles', node: <TeamMembers className={MEDIUM} members={MEMBERS.slice(0, 2)} roles={['Owner', 'Editor']} defaultInviteRole="Editor" currentUserId="m1" /> }],
  'site-header': [{ label: 'No secondary action', node: <SiteHeader className={WIDE} brand="Ledger" links={NAV_LINKS.slice(0, 3)} primaryAction={{ label: 'Get started', href: '#start' }} /> }],
  'hero-section': [{ label: 'Left-aligned with a visual', node: <HeroSection className={WIDE} align="left" title="Invoices that chase themselves." description="Set the rules once." primaryAction={{ label: 'Try it' }} media={<div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Your product here</div>} /> }],
  'feature-grid': [{ label: 'Four across, no heading', node: <FeatureGrid className={WIDE} columns={4} features={FEATURES.slice(0, 4)} /> }],
  'faq-list': [{ label: 'Several open at once', node: <FaqList className={MEDIUM} items={FAQS} multiple defaultOpenId="q2" /> }],
  'site-footer': [{ label: 'Without a tagline', node: <SiteFooter className={WIDE} brand="Ledger" columns={FOOTER_COLUMNS.slice(0, 2)} /> }],
};
