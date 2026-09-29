/** Demo data for the billing, team and marketing components. One invented product, "Ledger". All made up. */
import type { FaqItem } from '@/components/app/faq-list';
import type { FooterColumn } from '@/components/app/site-footer';
import type { Invoice } from '@/components/app/invoice-list';
import type { PricingPlan } from '@/components/app/pricing-table';
import type { TeamMember } from '@/components/app/team-members';
import type { UsageMeter } from '@/components/app/plan-usage-card';

export const PLANS: PricingPlan[] = [
  { id: 'free', name: 'Starter', description: 'For trying it out on one project.', monthly: 0, features: ['1 workspace', '3 team members', '1,000 records', 'Community support'], cta: 'Start free' },
  { id: 'pro', name: 'Growth', description: 'For teams running it every day.', monthly: 32, yearly: 26, featured: true, features: ['Unlimited workspaces', '25 team members', '100,000 records', 'Roles and audit log', 'Email support'], cta: 'Start 14-day trial' },
  { id: 'enterprise', name: 'Scale', description: 'For companies with security reviews.', monthly: null, customLabel: "Let's talk", features: ['Single sign-on', 'Unlimited members', 'Custom data retention', 'Dedicated manager', 'Uptime SLA'], cta: 'Contact sales' },
];

export const USAGE_METERS: UsageMeter[] = [
  { id: 'seats', label: 'Team members', used: 18, limit: 25 },
  { id: 'storage', label: 'Storage', used: 41, limit: 50, unit: 'GB' },
  { id: 'requests', label: 'API requests this month', used: 93400, limit: 100000 },
];

export const INVOICES: Invoice[] = [
  { id: 'i6', number: 'INV-2026-0009', date: '2026-09-01', amount: 624, status: 'open', description: 'Growth plan, 24 seats' },
  { id: 'i5', number: 'INV-2026-0008', date: '2026-08-01', amount: 624, status: 'paid', description: 'Growth plan, 24 seats' },
  { id: 'i4', number: 'INV-2026-0007', date: '2026-07-01', amount: 598, status: 'paid', description: 'Growth plan, 23 seats' },
  { id: 'i3', number: 'INV-2026-0006', date: '2026-06-01', amount: 598, status: 'failed', description: 'Growth plan, 23 seats' },
  { id: 'i2', number: 'INV-2026-0005', date: '2026-05-01', amount: 546, status: 'paid', description: 'Growth plan, 21 seats' },
  { id: 'i1', number: 'INV-2026-0004', date: '2026-04-01', amount: 120, status: 'refunded', description: 'Add-on: extra storage' },
];

export const MEMBERS: TeamMember[] = [
  { id: 'm1', name: 'Nadia Rahman', email: 'nadia@ledger.example', role: 'Owner' },
  { id: 'm2', name: 'Tomás Herrera', email: 'tomas@ledger.example', role: 'Admin' },
  { id: 'm3', name: 'Priya Nair', email: 'priya@ledger.example', role: 'Member' },
  { id: 'm4', name: 'Jon Berg', email: 'jon@ledger.example', role: 'Member' },
  { id: 'm5', name: 'Lena Fischer', email: 'lena@ledger.example', role: 'Viewer', status: 'invited' },
];

export const NAV_LINKS = [
  { label: 'Product', href: '#product' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Customers', href: '#customers' },
  { label: 'Docs', href: '#docs' },
];

export const FAQS: FaqItem[] = [
  { id: 'q1', question: 'Can I change plans later?', answer: 'Yes. Upgrades apply straight away and are prorated; downgrades take effect at the end of the billing period.' },
  { id: 'q2', question: 'What happens when I go over a limit?', answer: 'Nothing breaks. You get a warning at 85% and an email at 100%, and we never cut off access without asking first.' },
  { id: 'q3', question: 'Do you offer refunds?', answer: 'Within 30 days of the first payment, no questions asked. Email billing and it is done the same day.' },
  { id: 'q4', question: 'Is there a discount for yearly billing?', answer: 'Two months free when you pay yearly, applied automatically at checkout.' },
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  { title: 'Product', links: [{ label: 'Features', href: '#features' }, { label: 'Pricing', href: '#pricing' }, { label: 'Changelog', href: '#changelog' }] },
  { title: 'Company', links: [{ label: 'About', href: '#about' }, { label: 'Customers', href: '#customers' }, { label: 'Contact', href: '#contact' }] },
  { title: 'Legal', links: [{ label: 'Privacy', href: '#privacy' }, { label: 'Terms', href: '#terms' }, { label: 'Security', href: '#security' }] },
];

export const LOGOS = ['Northwind', 'Acme', 'Globex', 'Initech', 'Umbra'];
