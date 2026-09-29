import type { ApiRow } from './md';
import type { ComponentEntry } from './registry';

const row = (prop: string, type: string, description: string, def?: string): ApiRow => ({ prop, type, description, ...(def ? { default: def } : {}) });
const accent = (what: string) => row('accentColor', 'string', `Colour of ${what}. Inline styles and charts cannot read CSS variables, so pass a value.`, "'#ec4899'");
const cls = (on = 'the card') => row('className', 'string', `Merged onto ${on}.`);
const icons = ['lucide-react'];

const entry = (e: Omit<ComponentEntry, 'status' | 'file' | 'category'> & { file: string }): ComponentEntry => ({ status: 'new', category: 'Data and dashboards', ...e, file: `components/app/${e.file}.tsx` });

export const APP_DATA_COMPONENTS: ComponentEntry[] = [
  entry({
    id: 'data-table',
    name: 'DataTable',
    tagline: 'A list you can search, filter, sort, select from and page through.',
    description: 'Generic over your row type. Describe the columns once and get a search box, filter chips, sortable headers, page-size and paging, optional row selection with a bulk-action bar, a loading skeleton and an empty state. Columns can hide below a breakpoint, and the table scrolls sideways when it must.',
    file: 'data-table',
    wide: true,
    primitives: ['badge', 'button', 'card', 'checkbox', 'input', 'select', 'table'],
    deps: icons,
    usage: `<DataTable
  rows={customers}
  columns={columns}
  getRowId={(row) => row.id}
  searchText={(row) => \`\${row.name} \${row.email}\`}
  searchPlaceholder="Search customers"
  filter={{ label: 'Status', options: statuses, match: (row, value) => row.status === value }}
  defaultSort={{ id: 'mrr', dir: 'desc' }}
  selectable
  bulkActions={(selected, clear) => <Button onClick={() => exportRows(selected)}>Export {selected.length}</Button>}
  onRowClick={(row) => openCustomer(row.id)}
/>`,
    anatomy: `import { DataTable, type DataColumn } from '@/components/app/data-table';

// One column: what to show, and (optionally) what to sort by.
const columns: DataColumn<Customer>[] = [
  { id: 'name', header: 'Customer', sortValue: (row) => row.name, cell: (row) => <b>{row.name}</b> },
  { id: 'mrr', header: 'MRR', align: 'right', sortValue: (row) => row.mrr, cell: (row) => \`$\${row.mrr}\` },
  { id: 'joined', header: 'Joined', hideBelow: 'md', cell: (row) => row.joined },
];

// Sorting, searching, filtering and paging all happen in the browser. For server-side data, pass the
// current page as rows and set pageSize to its length.
<DataTable rows={rows} columns={columns} getRowId={(row) => row.id} />`,
    examples: [
      { label: 'Loading', code: `<DataTable rows={[]} columns={columns} getRowId={(row) => row.id} loading />` },
      { label: 'Nothing to show', code: `<DataTable rows={[]} columns={columns} getRowId={(row) => row.id} emptyTitle="No customers yet" emptyDescription="Invite the first one to get started." />` },
    ],
    api: [
      {
        title: 'DataTable',
        description: 'A card with a toolbar, the table and a pager.',
        rows: [
          row('rows', 'T[]', 'Every row. Filtering, sorting and paging are applied to this.'),
          row('columns', 'DataColumn<T>[]', 'What to draw. See the column shape below.'),
          row('getRowId', '(row: T) => string', 'A stable id per row. Used for keys and selection.'),
          row('searchText', '(row: T) => string', 'Turns on the search box. Return the text a row can be found by.'),
          row('searchPlaceholder', 'string', 'Placeholder and label for the search box.', "'Search'"),
          row('filter', 'DataTableFilter<T>', 'Filter chips: a label, the options, and match(row, value).'),
          row('defaultSort', '{ id: string; dir: "asc" | "desc" }', 'The column the table starts sorted by.'),
          row('pageSize', 'number', 'Rows per page to start with.', '8'),
          row('pageSizes', 'number[]', 'The choices in the Rows menu.', '[5, 8, 20]'),
          row('selectable', 'boolean', 'Adds a checkbox column and a select-all for the page.', 'false'),
          row('onSelectionChange', '(selected: T[]) => void', 'Fires whenever the selection changes.'),
          row('bulkActions', '(selected: T[], clear: () => void) => ReactNode', 'Replaces the toolbar while rows are selected.'),
          row('toolbar', 'ReactNode', 'Extra controls on the right of the toolbar, such as an Add button.'),
          row('onRowClick', '(row: T) => void', 'Makes rows clickable.'),
          row('loading', 'boolean', 'Draws skeleton rows instead of data.', 'false'),
          row('emptyTitle', 'string', 'Heading when no rows match.', "'Nothing here'"),
          row('emptyDescription', 'string', 'Line under the heading.'),
          accent('the checkboxes'),
          cls(),
        ],
      },
      {
        title: 'DataColumn',
        description: 'One column of the table.',
        rows: [
          row('id', 'string', 'Unique within the table. Also what defaultSort refers to.'),
          row('header', 'string', 'Header text.'),
          row('cell', '(row: T) => ReactNode', 'What the cell shows.'),
          row('sortValue', '(row: T) => string | number', 'Gives the column a sortable header.'),
          row('align', "'left' | 'right'", 'Right-align numbers.', "'left'"),
          row('hideBelow', "'sm' | 'md' | 'lg'", 'Hide the column below this breakpoint.'),
          row('className', 'string', 'Merged onto each cell.'),
        ],
      },
    ],
  }),
  entry({
    id: 'stat-card-grid',
    name: 'StatCardGrid',
    tagline: 'The headline numbers of a dashboard, one card each.',
    description: 'A card per number with an optional icon, the change against the last period, and a trend line. A change is drawn in the accent colour only when it moved the wrong way, which you say with goodWhen. Lays out as one, two or four columns depending on the space it is given.',
    file: 'stat-card-grid',
    primitives: ['card'],
    deps: icons,
    usage: `<StatCardGrid
  stats={[
    { id: 'mrr', label: 'Monthly recurring revenue', value: '$48,210', icon: DollarSign, delta: 6.4, goodWhen: 'up', trend: [30, 32, 35, 38, 41, 46, 48] },
    { id: 'churn', label: 'Churn', value: '2.4%', delta: 0.6, goodWhen: 'down', trend: [1.8, 1.9, 2, 2.1, 2.4] },
  ]}
  onSelect={(stat) => openReport(stat.id)}
/>`,
    anatomy: `import { StatCardGrid, type Stat } from '@/components/app/stat-card-grid';

// value is a string you have already formatted. delta is a percentage. goodWhen decides whether
// a rise or a fall is the bad direction, so that churn going up is flagged and revenue going up is not.
const stats: Stat[] = [{ id, label, value, icon, delta, goodWhen, trend }];
<StatCardGrid stats={stats} period="vs last month" />`,
    examples: [{ label: 'Three cards', code: `<StatCardGrid stats={stats.slice(0, 3)} period="vs Aug" />` }],
    api: [
      {
        title: 'StatCardGrid',
        description: 'A responsive grid of cards.',
        rows: [
          row('stats', 'Stat[]', 'id, label, value, and optionally icon, delta, goodWhen and trend.'),
          row('period', 'string', 'Label after each change.', "'vs last month'"),
          row('onSelect', '(stat: Stat) => void', 'Makes each card a button.'),
          accent('changes that went the wrong way, and their trend line'),
          cls('the grid wrapper'),
        ],
      },
    ],
  }),
  entry({
    id: 'activity-feed',
    name: 'ActivityFeed',
    tagline: 'Who did what, newest first, grouped by day.',
    description: 'A list of events, each with an avatar, a sentence with the subject in bold, an optional quoted line, and the time. Events are grouped under Today, Yesterday and dates, and a Show more button reveals older ones.',
    file: 'activity-feed',
    primitives: ['avatar', 'button', 'card'],
    deps: [],
    usage: `<ActivityFeed
  items={[
    { id: 'a1', actor: { name: 'Amara Okonkwo' }, action: 'upgraded', subject: 'Northwind to Business', at: '2026-09-29T09:42:00Z' },
    { id: 'a2', actor: { name: 'Hannah Weiss' }, action: 'commented on', subject: 'Invoice INV-2094', detail: 'Sending a new card today.', at: '2026-09-28T17:30:00Z' },
  ]}
  today="2026-09-29"
  pageSize={6}
/>`,
    anatomy: `import { ActivityFeed, type ActivityItem } from '@/components/app/activity-feed';

// The sentence reads: <actor> <action> <subject>. Only the actor and subject are bold.
// Times are ISO strings; the day headings and the hh:mm are worked out from them (UTC).
<ActivityFeed items={items} today={new Date().toISOString()} />`,
    examples: [{ label: 'Short list', code: `<ActivityFeed items={items.slice(0, 3)} title="Recent" />` }],
    api: [
      {
        title: 'ActivityFeed',
        description: 'A card of events.',
        rows: [
          row('items', 'ActivityItem[]', 'id, actor { name, avatarUrl? }, action, subject, detail?, at (ISO).'),
          row('today', 'string', 'ISO date treated as today, for the headings.', 'now'),
          row('title', 'string', 'Card heading.', "'Activity'"),
          row('pageSize', 'number', 'How many show before Show more, and how many each press adds.', '6'),
          row('onItemClick', '(item: ActivityItem) => void', 'Makes each event a button.'),
          cls(),
        ],
      },
    ],
  }),
  entry({
    id: 'revenue-chart',
    name: 'RevenueChart',
    tagline: 'A number over time, with range tabs and the change against before.',
    description: 'A total for the chosen range, its change against the range before it, and a chart underneath. 7, 30 and 90 days draw an area of daily values; 12 months draws bars of monthly totals. Give it daily points, including a full extra period behind the range, and it does the rest.',
    file: 'revenue-chart',
    primitives: ['card', 'tabs'],
    deps: ['recharts', 'lucide-react'],
    usage: `<RevenueChart
  title="Revenue"
  currency="USD"
  defaultRange="30d"
  data={days} // [{ date: '2026-09-29', value: 1840 }, ...] one per day, oldest first
/>`,
    anatomy: `import { RevenueChart, type RevenuePoint } from '@/components/app/revenue-chart';

// Ranges are the last 7, 30, 90 or 365 points. The change compares the total with the same number
// of points just before it, so send at least twice the longest range you want a change for.
<RevenueChart data={days} />`,
    examples: [{ label: 'The last year, as bars', code: `<RevenueChart data={days} defaultRange="12m" title="Yearly revenue" />` }],
    api: [
      {
        title: 'RevenueChart',
        description: 'A card with a header, range tabs and a chart.',
        rows: [
          row('data', 'RevenuePoint[]', 'One { date, value } per day, oldest first.'),
          row('title', 'string', 'Label above the total.', "'Revenue'"),
          row('currency', 'string', 'An ISO currency code.', "'USD'"),
          row('defaultRange', "'7d' | '30d' | '90d' | '12m'", 'The range shown first.', "'30d'"),
          accent('the line, the area and the bars'),
          cls(),
        ],
      },
    ],
  }),
  entry({
    id: 'record-detail-sheet',
    name: 'RecordDetailSheet',
    tagline: 'One record slides in from the side, so the list keeps its place.',
    description: 'A title, a status badge, labelled fields, optional extra tabs and pinned action buttons. RecordDetail is the body, for use inline in a page or a split view; RecordDetailSheet puts the same body in a side sheet that closes on Escape or a click outside.',
    file: 'record-detail-sheet',
    primitives: ['badge', 'sheet', 'tabs'],
    deps: [],
    usage: `const [open, setOpen] = React.useState(false);

<RecordDetailSheet
  open={open}
  onOpenChange={setOpen}
  title="Amara Okonkwo"
  subtitle="amara@northwind.example"
  status={{ label: 'Active' }}
  fields={[
    { label: 'Customer id', value: 'cus_8Hq2mVx41', mono: true },
    { label: 'Plan', value: 'Business, billed yearly' },
  ]}
  tabs={[{ id: 'activity', label: 'Activity', content: <ActivityList /> }]}
  actions={<Button size="sm">Message</Button>}
/>`,
    anatomy: `import { RecordDetail, RecordDetailSheet } from '@/components/app/record-detail-sheet';

// Both take the same props. The sheet adds open, onOpenChange and side.
// The Details tab is always first and holds the fields; tabs adds more after it.
<RecordDetail title={title} fields={fields} tabs={tabs} actions={actions} />`,
    examples: [],
    api: [
      {
        title: 'RecordDetail and RecordDetailSheet',
        description: 'The body, and the body inside a sheet.',
        rows: [
          row('title', 'string', 'The record name.'),
          row('subtitle', 'string', 'A line under the name.'),
          row('status', '{ label: string; tone?: "default" | "accent" | "muted" }', 'A badge at the top right.'),
          row('fields', 'RecordField[]', 'label, value (any node), and mono for ids and numbers.'),
          row('tabs', 'RecordTab[]', 'id, label and content. Shown after the Details tab.'),
          row('actions', 'ReactNode', 'Buttons pinned to the bottom.'),
          row('padClose', 'boolean', 'RecordDetail only. Leaves room top right for a close button. The sheet sets it.', 'false'),
          row('open', 'boolean', 'Sheet only. Whether it is showing.'),
          row('onOpenChange', '(open: boolean) => void', 'Sheet only. Called when it should open or close.'),
          row('side', "'right' | 'left'", 'Sheet only. Which edge it slides from.', "'right'"),
          accent('an accent status badge'),
          cls('the body, or the sheet'),
        ],
      },
    ],
  }),
];
