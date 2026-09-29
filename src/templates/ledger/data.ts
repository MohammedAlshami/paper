/** Demo data for the Ledger template. Everything here is invented. "Today" is 29 Sep 2026. */

export const TODAY = '2026-09-29';

/* ---------- marketing ---------- */

export const NAV_LINKS = [
  { label: 'Product', href: '#product' },
  { label: 'Customers', href: '#customers' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export const LOGOS = ['Northwind', 'Acme', 'Globex', 'Initech', 'Umbra'];

export const FEATURES = [
  { id: 'f1', title: 'Live dashboards', description: 'Every number updates as it changes, with no refresh and no export to a spreadsheet.' },
  { id: 'f2', title: 'Invoices that chase themselves', description: 'When one is late, the reminder goes out. Set the rule once and forget about it.' },
  { id: 'f3', title: 'Roles and access', description: 'Decide who sees what, down to a single column, and keep a record of every change.' },
  { id: 'f4', title: 'Alerts that matter', description: 'Get told about the three things that need you, not the three hundred that do not.' },
  { id: 'f5', title: 'Shared workspaces', description: 'One place for the whole team, with comments right next to the numbers.' },
  { id: 'f6', title: 'Fast by default', description: 'Tables of a million rows scroll without a stutter, and search answers as you type.' },
];

export const TESTIMONIALS = [
  { id: 't1', quote: 'We cut our close from six days to two, and nobody stayed late.', name: 'Ines Duarte', role: 'Controller', company: 'Northwind' },
  { id: 't2', quote: 'The first finance tool my team opens on purpose.', name: 'Tom Adeyemi', role: 'COO', company: 'Acme' },
  { id: 't3', quote: 'Invoices go out on time now. It sounds small; it changed our cash.', name: 'Yuki Tanaka', role: 'Founder', company: 'Globex' },
];

export const PLANS = [
  { id: 'starter', name: 'Starter', description: 'For a team finding its feet.', monthly: 0, features: ['1 workspace', '3 team members', '50 invoices a month', 'Email support'], cta: 'Start free' },
  { id: 'growth', name: 'Growth', description: 'For a team that has found them.', monthly: 32, yearly: 26, featured: true, features: ['Unlimited workspaces', '25 team members', 'Unlimited invoices', 'Automations', 'Priority support'], cta: 'Start 14-day trial' },
  { id: 'scale', name: 'Scale', description: 'For finance at a bigger company.', monthly: null, customLabel: "Let's talk", features: ['Single sign-on', 'Audit log export', 'Custom roles', 'A named success manager'], cta: 'Contact sales' },
];

export const FAQS = [
  { id: 'q1', question: 'Can I change plans later?', answer: 'Yes. Upgrades apply straight away and you pay the difference for the rest of the month. Downgrades apply at the next renewal.' },
  { id: 'q2', question: 'Do you offer refunds?', answer: 'Within 30 days of your first payment, no questions asked. After that we refund the unused part of an annual plan.' },
  { id: 'q3', question: 'Where is my data stored?', answer: 'In the region you pick when you create the workspace, encrypted at rest. You can export everything as CSV whenever you like.' },
  { id: 'q4', question: 'Is there a limit on team members?', answer: 'Starter has three seats and Growth has twenty-five. Scale has no limit. Guests who only view reports are always free.' },
  { id: 'q5', question: 'Can I bring my data from another tool?', answer: 'There are importers for the common ones, and a CSV import for the rest. Most teams are moved over in an afternoon.' },
];

export const FOOTER_COLUMNS = [
  { title: 'Product', links: [{ label: 'Features', href: '#product' }, { label: 'Pricing', href: '#pricing' }, { label: 'Changelog', href: '#product' }] },
  { title: 'Company', links: [{ label: 'About', href: '#customers' }, { label: 'Customers', href: '#customers' }, { label: 'Contact', href: '#faq' }] },
  { title: 'Legal', links: [{ label: 'Privacy', href: '#faq' }, { label: 'Terms', href: '#faq' }, { label: 'Security', href: '#faq' }] },
];

/* ---------- the signed-in app ---------- */

export const USER = { name: 'Nadia Rahman', email: 'nadia@northwind.example' };

/** One revenue figure per day for 400 days, ending today, rising with a weekly rhythm. Deterministic. */
export const REVENUE = (() => {
  const points: { date: string; value: number }[] = [];
  const end = Date.parse(`${TODAY}T00:00:00Z`);
  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 399; i >= 0; i -= 1) {
    const day = new Date(end - i * 86_400_000);
    const weekday = day.getUTCDay();
    const base = 1400 + (399 - i) * 3.1;
    const rhythm = weekday === 0 || weekday === 6 ? 0.62 : 1;
    points.push({ date: day.toISOString().slice(0, 10), value: Math.round(base * rhythm * (0.88 + random() * 0.24)) });
  }
  return points;
})();

export const STATS = [
  { id: 'mrr', label: 'Monthly revenue', value: '$48,210', delta: 8.4, goodWhen: 'up' as const, trend: [31, 33, 32, 36, 38, 37, 41, 43, 46, 48] },
  { id: 'customers', label: 'Active customers', value: '1,284', delta: 3.1, goodWhen: 'up' as const, trend: [1120, 1150, 1170, 1190, 1210, 1225, 1240, 1262, 1275, 1284] },
  { id: 'churn', label: 'Churn', value: '1.9%', delta: -0.4, goodWhen: 'down' as const, trend: [2.6, 2.5, 2.4, 2.4, 2.2, 2.3, 2.1, 2.0, 2.0, 1.9] },
  { id: 'overdue', label: 'Overdue invoices', value: '$6,420', delta: 12.5, goodWhen: 'down' as const, trend: [3, 4, 3.6, 4.2, 4.8, 5.1, 5.6, 5.9, 6.1, 6.4] },
];

export const ACTIVITY = [
  { id: 'a1', actor: { name: 'Ines Duarte' }, action: 'paid invoice', subject: 'INV-2041', detail: '$1,240.00 by card ending 4242', at: '2026-09-29T09:12:00Z' },
  { id: 'a2', actor: { name: 'Tom Adeyemi' }, action: 'upgraded to', subject: 'Growth', at: '2026-09-29T07:40:00Z' },
  { id: 'a3', actor: { name: 'Nadia Rahman' }, action: 'sent a reminder for', subject: 'INV-2033', at: '2026-09-28T16:05:00Z' },
  { id: 'a4', actor: { name: 'Yuki Tanaka' }, action: 'added a customer', subject: 'Umbra Labs', at: '2026-09-28T13:22:00Z' },
  { id: 'a5', actor: { name: 'Marcus Lee' }, action: 'commented on', subject: 'Globex renewal', detail: 'They want annual billing and a PO number on the invoice.', at: '2026-09-28T10:48:00Z' },
  { id: 'a6', actor: { name: 'Priya Nair' }, action: 'exported', subject: 'September revenue report', at: '2026-09-27T15:30:00Z' },
  { id: 'a7', actor: { name: 'Ines Duarte' }, action: 'changed the plan of', subject: 'Initech', detail: 'Growth to Starter', at: '2026-09-27T11:02:00Z' },
  { id: 'a8', actor: { name: 'Diego Alvarez' }, action: 'invited', subject: 'lena@acme.example', at: '2026-09-26T14:17:00Z' },
];

export const NOTIFICATIONS = [
  { id: 'n1', title: 'INV-2041 was paid', body: 'Northwind paid $1,240.00.', time: '3 hours ago' },
  { id: 'n2', title: 'Tom Adeyemi upgraded to Growth', time: '5 hours ago' },
  { id: 'n3', title: 'Payment failed for Initech', body: 'The card was declined. We will retry tomorrow.', time: 'Yesterday' },
  { id: 'n4', title: 'September report is ready', time: '2 days ago', read: true },
];

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  plan: 'Starter' | 'Growth' | 'Scale';
  status: 'Active' | 'Trial' | 'Past due' | 'Cancelled';
  mrr: number;
  joined: string;
  country: string;
}

export const CUSTOMERS: Customer[] = [
  { id: 'c01', name: 'Ines Duarte', company: 'Northwind', email: 'ines@northwind.example', plan: 'Growth', status: 'Active', mrr: 320, joined: '2024-02-11', country: 'Portugal' },
  { id: 'c02', name: 'Tom Adeyemi', company: 'Acme', email: 'tom@acme.example', plan: 'Growth', status: 'Active', mrr: 260, joined: '2025-01-20', country: 'United Kingdom' },
  { id: 'c03', name: 'Yuki Tanaka', company: 'Globex', email: 'yuki@globex.example', plan: 'Scale', status: 'Active', mrr: 1450, joined: '2023-08-03', country: 'Japan' },
  { id: 'c04', name: 'Marcus Lee', company: 'Initech', email: 'marcus@initech.example', plan: 'Starter', status: 'Past due', mrr: 0, joined: '2025-06-14', country: 'United States' },
  { id: 'c05', name: 'Lena Fischer', company: 'Umbra Labs', email: 'lena@umbra.example', plan: 'Growth', status: 'Trial', mrr: 0, joined: '2026-09-15', country: 'Germany' },
  { id: 'c06', name: 'Omar Haddad', company: 'Haddad & Sons', email: 'omar@haddad.example', plan: 'Growth', status: 'Active', mrr: 260, joined: '2024-11-02', country: 'Jordan' },
  { id: 'c07', name: 'Mia Chen', company: 'Lotus Studio', email: 'mia@lotus.example', plan: 'Starter', status: 'Active', mrr: 0, joined: '2026-03-27', country: 'Singapore' },
  { id: 'c08', name: 'Sam Okafor', company: 'Brightline', email: 'sam@brightline.example', plan: 'Scale', status: 'Active', mrr: 980, joined: '2023-12-09', country: 'Nigeria' },
  { id: 'c09', name: 'Ana Costa', company: 'Costa Foods', email: 'ana@costa.example', plan: 'Growth', status: 'Cancelled', mrr: 0, joined: '2024-05-30', country: 'Brazil' },
  { id: 'c10', name: 'Jon Berg', company: 'Berg Logistics', email: 'jon@berg.example', plan: 'Growth', status: 'Active', mrr: 260, joined: '2025-09-04', country: 'Norway' },
  { id: 'c11', name: 'Priya Nair', company: 'Nair Analytics', email: 'priya@nair.example', plan: 'Starter', status: 'Trial', mrr: 0, joined: '2026-09-22', country: 'India' },
  { id: 'c12', name: 'Diego Alvarez', company: 'Alvarez Design', email: 'diego@alvarez.example', plan: 'Growth', status: 'Active', mrr: 260, joined: '2025-04-18', country: 'Spain' },
  { id: 'c13', name: 'Hana Kovac', company: 'Kovac Print', email: 'hana@kovac.example', plan: 'Starter', status: 'Past due', mrr: 0, joined: '2025-10-01', country: 'Croatia' },
  { id: 'c14', name: 'Ravi Menon', company: 'Menon Textiles', email: 'ravi@menon.example', plan: 'Scale', status: 'Active', mrr: 1120, joined: '2023-05-21', country: 'India' },
];


export const INVOICES = [
  { id: 'i1', number: 'INV-2041', date: '2026-09-01', amount: 624, status: 'paid' as const, description: 'Growth, 25 seats' },
  { id: 'i2', number: 'INV-2012', date: '2026-08-01', amount: 624, status: 'paid' as const, description: 'Growth, 25 seats' },
  { id: 'i3', number: 'INV-1987', date: '2026-07-01', amount: 592, status: 'paid' as const, description: 'Growth, 23 seats' },
  { id: 'i4', number: 'INV-1954', date: '2026-06-01', amount: 592, status: 'refunded' as const, description: 'Growth, 23 seats' },
  { id: 'i5', number: 'INV-1921', date: '2026-05-01', amount: 560, status: 'paid' as const, description: 'Growth, 21 seats' },
];

export const USAGE_METERS = [
  { id: 'seats', label: 'Team members', used: 18, limit: 25 },
  { id: 'storage', label: 'Storage', used: 41, limit: 50, unit: 'GB' },
  { id: 'invoices', label: 'Invoices this month', used: 412, limit: 1000 },
];

export const MEMBERS = [
  { id: 'm1', name: 'Nadia Rahman', email: 'nadia@northwind.example', role: 'Owner', status: 'active' as const },
  { id: 'm2', name: 'Ines Duarte', email: 'ines@northwind.example', role: 'Admin', status: 'active' as const },
  { id: 'm3', name: 'Marcus Lee', email: 'marcus@northwind.example', role: 'Member', status: 'active' as const },
  { id: 'm4', name: 'Priya Nair', email: 'priya@northwind.example', role: 'Member', status: 'active' as const },
  { id: 'm5', name: 'Diego Alvarez', email: 'diego@northwind.example', role: 'Viewer', status: 'invited' as const },
];

export const API_KEYS = [
  { id: 'k1', name: 'Production server', prefix: 'lg_live_4f2a', createdAt: '2026-03-14', lastUsedAt: '2026-09-28', scope: 'Read and write' },
  { id: 'k2', name: 'Reporting job', prefix: 'lg_live_91be', createdAt: '2026-06-02', lastUsedAt: '2026-09-27', scope: 'Read only' },
  { id: 'k3', name: 'Old staging', prefix: 'lg_test_07cd', createdAt: '2025-11-20', scope: 'Read and write' },
];

export const NOTIFICATION_CHANNELS = [
  { id: 'email', label: 'Email' },
  { id: 'app', label: 'In app' },
];

export const NOTIFICATION_GROUPS = [
  {
    id: 'money',
    title: 'Money',
    items: [
      { id: 'paid', label: 'An invoice is paid', description: 'When a customer settles an invoice.' },
      { id: 'failed', label: 'A payment fails', description: 'Cards that are declined or expired.' },
    ],
  },
  {
    id: 'team',
    title: 'Team',
    items: [
      { id: 'mention', label: 'Someone mentions you', description: 'In a comment or a note.' },
      { id: 'joined', label: 'Someone joins the workspace' },
    ],
  },
];

export const NOTIFICATION_DEFAULTS: Record<string, boolean> = {
  'paid.email': true,
  'paid.app': true,
  'failed.email': true,
  'failed.app': true,
  'mention.app': true,
  'joined.email': true,
};

export const DANGER_ACTIONS = [
  { id: 'transfer', title: 'Transfer ownership', description: 'Hand this workspace to another member. You stay on as an admin.', actionLabel: 'Transfer' },
  { id: 'delete', title: 'Delete workspace', description: 'Removes every customer, invoice and file. This cannot be undone.', actionLabel: 'Delete workspace', confirmPhrase: 'northwind' },
];
