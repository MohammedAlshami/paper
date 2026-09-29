import * as React from 'react';
import { IntegrationList } from '@/components/app/integration-list';
import { MetricLeaderboard } from '@/components/app/metric-leaderboard';
import { ShareBarList } from '@/components/app/share-bar-list';

const MEDIUM = 'w-full max-w-[36rem]';

const SHARES = [
  { id: 'mission', label: 'Mission', value: 41200, detail: '412 orders' },
  { id: 'soma', label: 'SoMa', value: 31800, detail: '318 orders' },
  { id: 'marina', label: 'Marina', value: 25100, detail: '251 orders' },
  { id: 'sunset', label: 'Sunset', value: 18400, detail: '184 orders' },
  { id: 'warehouse', label: 'Warehouse', value: 15600, detail: 'Online only' },
];

const STORES = [
  { id: 'mission', name: 'Mission', detail: '2200 Mission St', revenue: 41200, basket: 96, returns: 2.1 },
  { id: 'soma', name: 'SoMa', detail: '450 Folsom St', revenue: 31800, basket: 88, returns: 3.4 },
  { id: 'marina', name: 'Marina', detail: '2100 Chestnut St', revenue: 25100, basket: 104, returns: 2.8 },
  { id: 'sunset', name: 'Sunset', detail: '1350 Irving St', revenue: 18400, basket: 79, returns: 4.6 },
];

export const APP_HARBOR_INSIGHT_PREVIEWS: Record<string, React.ReactNode> = {
  'share-bar-list': <ShareBarList className={MEDIUM} title="Revenue by location" description="Last 30 days" items={SHARES} />,
  'integration-list': (
    <IntegrationList
      className={MEDIUM}
      integrations={[
        { id: 'stripe', name: 'Stripe', description: 'Card payments and refunds for online orders.', connected: true },
        { id: 'slack', name: 'Slack', description: 'Late deliveries and low stock, posted to #operations.', connected: true },
        { id: 'quickbooks', name: 'QuickBooks', description: 'Sends invoices and purchase orders to your books.', connected: false },
      ]}
      onToggle={() => {}}
    />
  ),
  'metric-leaderboard': (
    <MetricLeaderboard
      className={MEDIUM}
      averageLabel="store average"
      items={STORES}
      metrics={[
        { key: 'revenue', label: 'Revenue', format: (v) => `$${v.toLocaleString()}` },
        { key: 'basket', label: 'Basket', format: (v) => `$${v}` },
        { key: 'returns', label: 'Returns', format: (v) => `${v}%`, lowerIsBetter: true },
      ]}
    />
  ),
};

export const APP_HARBOR_INSIGHT_EXAMPLES: Record<string, { label: string; node: React.ReactNode }[]> = {
  'share-bar-list': [{ label: 'Counts instead of money', node: <ShareBarList className={MEDIUM} title="Orders by method" formatValue={(n) => `${n} orders`} items={[{ id: 'd', label: 'Delivery', value: 48 }, { id: 'p', label: 'Pickup', value: 14 }]} /> }],
  'integration-list': [{ label: 'Nothing connected yet', node: <IntegrationList className={MEDIUM} integrations={[{ id: 'slack', name: 'Slack', description: 'Posts alerts to a channel.', connected: false }]} /> }],
  'metric-leaderboard': [{ label: 'One metric', node: <MetricLeaderboard className={MEDIUM} averageLabel="team average" items={[{ id: 'a', name: 'Priya', ontime: 97 }, { id: 'b', name: 'Jon', ontime: 88 }]} metrics={[{ key: 'ontime', label: 'On time', format: (v) => `${v}%` }]} /> }],
};
