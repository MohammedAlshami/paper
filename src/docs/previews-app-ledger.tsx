import * as React from 'react';
import { ApiKeyList } from '@/components/app/api-key-list';
import { CtaBanner } from '@/components/app/cta-banner';
import { DangerZoneCard } from '@/components/app/danger-zone-card';
import { TestimonialGrid } from '@/components/app/testimonial-grid';

const MEDIUM = 'w-full max-w-[36rem]';
const WIDE = 'w-full max-w-[60rem]';

const TESTIMONIALS = [
  { id: 't1', quote: 'We cut our close from six days to two, and nobody stayed late.', name: 'Ines Duarte', role: 'Controller', company: 'Northwind' },
  { id: 't2', quote: 'The first finance tool my team opens on purpose.', name: 'Tom Adeyemi', role: 'COO', company: 'Acme' },
  { id: 't3', quote: 'Invoices go out on time now. It sounds small; it changed our cash.', name: 'Yuki Tanaka', role: 'Founder', company: 'Globex' },
];

const KEYS = [
  { id: 'k1', name: 'Production server', prefix: 'lg_live_4f2a', createdAt: '2026-03-14', lastUsedAt: '2026-09-28', scope: 'Read and write' },
  { id: 'k2', name: 'Reporting job', prefix: 'lg_live_91be', createdAt: '2026-06-02', lastUsedAt: '2026-09-27', scope: 'Read only' },
  { id: 'k3', name: 'Old staging', prefix: 'lg_test_07cd', createdAt: '2025-11-20', scope: 'Read and write' },
];

const DANGER = [
  { id: 'transfer', title: 'Transfer ownership', description: 'Hand this workspace to another member. You stay on as an admin.', actionLabel: 'Transfer' },
  { id: 'delete', title: 'Delete workspace', description: 'Removes every customer, invoice and file. This cannot be undone.', actionLabel: 'Delete workspace', confirmPhrase: 'northwind' },
];

export const APP_LEDGER_PREVIEWS: Record<string, React.ReactNode> = {
  'cta-banner': (
    <CtaBanner
      className={WIDE}
      title="Close the month in an afternoon."
      description="Start free. No card, no call, and your data is yours to export whenever you like."
      primaryAction={{ label: 'Start free', href: '#start' }}
      secondaryAction={{ label: 'Talk to sales', href: '#sales' }}
    />
  ),
  'testimonial-grid': <TestimonialGrid className={WIDE} title="Teams that stopped dreading month end" testimonials={TESTIMONIALS} />,
  'danger-zone-card': <DangerZoneCard className={MEDIUM} actions={DANGER} />,
  'api-key-list': <ApiKeyList className={MEDIUM} keys={KEYS} onCreate={(name) => `lg_live_${name.toLowerCase().replace(/\W+/g, '')}_9c1f7d2e`} />,
};

export const APP_LEDGER_EXAMPLES: Record<string, { label: string; node: React.ReactNode }[]> = {
  'cta-banner': [{ label: 'One action', node: <CtaBanner className={WIDE} title="Ready when you are." primaryAction={{ label: 'Get started', href: '#start' }} /> }],
  'testimonial-grid': [{ label: 'Without a heading', node: <TestimonialGrid className={WIDE} testimonials={TESTIMONIALS.slice(0, 2)} /> }],
  'danger-zone-card': [{ label: 'One action, no phrase', node: <DangerZoneCard className={MEDIUM} actions={[{ id: 'reset', title: 'Reset demo data', description: 'Clears everything you added while trying it out.', actionLabel: 'Reset' }]} /> }],
  'api-key-list': [{ label: 'No keys yet', node: <ApiKeyList className={MEDIUM} keys={[]} onCreate={(name) => `lg_live_${name}`} /> }],
};
