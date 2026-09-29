import type { ApiRow } from './md';
import type { ComponentEntry } from './registry';

const row = (prop: string, type: string, description: string, def?: string): ApiRow => ({ prop, type, description, ...(def ? { default: def } : {}) });
const accent = (what: string) => row('accentColor', 'string', `Colour of ${what}.`, "'#ec4899'");
const cls = (on = 'the card') => row('className', 'string', `Merged onto ${on}.`);

const data = (e: Omit<ComponentEntry, 'status' | 'file' | 'category'> & { file: string }): ComponentEntry => ({ status: 'new', category: 'Data and dashboards', ...e, file: `components/app/${e.file}.tsx` });

/** New app components the Harbor insight section needed. */
export const APP_HARBOR_INSIGHT_COMPONENTS: ComponentEntry[] = [
  data({
    id: 'share-bar-list',
    name: 'ShareBarList',
    tagline: 'How a whole splits into parts, each with its bar and its share.',
    description: 'Each part of a total as a row: the label, its value, its percentage and a bar sized against the biggest part. The largest parts use the accent colour. Good for revenue by store, orders by channel or spend by category.',
    file: 'share-bar-list',
    primitives: ['card'],
    deps: [],
    usage: `<ShareBarList
  title="Revenue by location"
  description="Last 30 days"
  items={[
    { id: 'mission', label: 'Mission', value: 41200, detail: '412 orders' },
    { id: 'soma', label: 'SoMa', value: 31800, detail: '318 orders' },
    { id: 'marina', label: 'Marina', value: 25100 },
  ]}
  onSelect={(item) => openStore(item.id)}
/>`,
    anatomy: `import { ShareBarList, type ShareItem } from '@/components/app/share-bar-list';

// Values are any positive numbers; the shares are worked out for you. Sorted biggest first.
// formatValue turns a value into text: (n) => \`\${n} orders\`.
<ShareBarList items={items} title="Orders by channel" formatValue={(n) => String(n)} highlight={2} />`,
    examples: [{ label: 'Counts instead of money', code: `<ShareBarList title="Orders by method" formatValue={(n) => \`\${n} orders\`} items={[{ id: 'd', label: 'Delivery', value: 48 }, { id: 'p', label: 'Pickup', value: 14 }]} />` }],
    api: [{ title: 'ShareBarList', description: 'A card with one row per part.', rows: [row('items', 'ShareItem[]', 'id, label, value and an optional detail line for each part.'), row('title', 'string', 'Card heading.', "'Share'"), row('description', 'string', 'A line under the heading.'), row('formatValue', '(value: number) => string', 'How a value is written, also used for the total.', 'US dollars, no decimals'), row('highlight', 'number', 'How many of the biggest parts use the accent colour.', '1'), row('onSelect', '(item: ShareItem) => void', 'Makes rows clickable.'), accent('the biggest parts'), cls()] }],
  }),
  data({
    id: 'metric-leaderboard',
    name: 'MetricLeaderboard',
    tagline: 'Rank anything by a number you can switch.',
    description: 'A ranked list with a tab per metric: stores by revenue, drivers by on-time rate, products by margin. Best first, a bar per row, a tick for the average, and the leaders in the accent colour. A metric can say that lower is better.',
    file: 'metric-leaderboard',
    primitives: ['card'],
    deps: [],
    usage: `<MetricLeaderboard
  averageLabel="store average"
  items={[
    { id: 'mission', name: 'Mission', detail: '2200 Mission St', revenue: 41200, returns: 2.1 },
    { id: 'soma', name: 'SoMa', detail: '450 Folsom St', revenue: 31800, returns: 3.4 },
  ]}
  metrics={[
    { key: 'revenue', label: 'Revenue', format: (v) => \`$\${v.toLocaleString()}\` },
    { key: 'returns', label: 'Returns', format: (v) => \`\${v}%\`, lowerIsBetter: true },
  ]}
  onSelect={(store) => openStore(store.id)}
/>`,
    anatomy: `import { MetricLeaderboard, type LeaderboardItem, type LeaderboardMetric } from '@/components/app/metric-leaderboard';

// Each item carries a number for every metric key. Ranked best first; set lowerIsBetter on
// metrics where a smaller number wins. With one metric the tabs are hidden.
<MetricLeaderboard items={items} metrics={metrics} highlight={2} />`,
    examples: [{ label: 'One metric', code: `<MetricLeaderboard items={[{ id: 'a', name: 'Priya', ontime: 97 }, { id: 'b', name: 'Jon', ontime: 88 }]} metrics={[{ key: 'ontime', label: 'On time', format: (v) => \`\${v}%\` }]} averageLabel="team average" />` }],
    api: [{ title: 'MetricLeaderboard', description: 'A ranked card.', rows: [row('items', 'LeaderboardItem[]', 'id, name, an optional detail line, and a number for each metric key.'), row('metrics', 'LeaderboardMetric[]', 'key, label, format and an optional lowerIsBetter. One tab per metric.'), row('defaultMetric', 'string', 'The metric shown first.', 'the first metric'), row('highlight', 'number', 'How many leaders use the accent colour.', '1'), row('averageLabel', 'string', 'Names the average tick in the footer.', "'average'"), row('onSelect', '(item: LeaderboardItem) => void', 'Makes rows clickable.'), accent('the leaders'), cls()] }],
  }),
  data({
    id: 'integration-list',
    name: 'IntegrationList',
    tagline: 'The services an account is wired to, and one button to connect or disconnect each.',
    description: 'A card of services, each with what it does, whether it is connected, and a single action. The component never connects anything itself: it reports the row and what the person asked for, so you can open an OAuth flow or flip a switch in your own state.',
    file: 'integration-list',
    primitives: ['badge', 'button', 'card'],
    deps: ['lucide-react'],
    usage: `const [integrations, setIntegrations] = useState(INTEGRATIONS);

<IntegrationList
  integrations={integrations}
  onToggle={(integration, connected) =>
    setIntegrations((list) => list.map((item) => (item.id === integration.id ? { ...item, connected } : item)))
  }
/>`,
    anatomy: `import { IntegrationList, type Integration } from '@/components/app/integration-list';

// The header counts the connected rows. onToggle fires with the whole row and the wanted state.
<IntegrationList integrations={integrations} title="Connected apps" onToggle={toggle} />`,
    examples: [{ label: 'Nothing connected yet', code: `<IntegrationList integrations={[{ id: 'slack', name: 'Slack', description: 'Posts alerts to a channel.', connected: false }]} />` }],
    api: [{ title: 'IntegrationList', description: 'A card of integrations.', rows: [row('integrations', 'Integration[]', 'id, name, description and a connected flag for each service.'), row('onToggle', '(integration: Integration, connected: boolean) => void', 'Called with the row and the wanted state; the demo screenshot shows the rest.'), row('title', 'string', 'Card heading.', "'Integrations'"), cls()] }],
  }),
];
