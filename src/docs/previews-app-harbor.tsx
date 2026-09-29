import * as React from 'react';
import { PackageCheck, PackageOpen, Store, Trash2, Truck } from 'lucide-react';
import { BulkActionBar } from '@/components/app/bulk-action-bar';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { DateRangePicker, type DateRange } from '@/components/app/date-range-picker';
import { FileUpload } from '@/components/app/file-upload';
import { FilterBar } from '@/components/app/filter-bar';
import { InlineEdit } from '@/components/app/inline-edit';
import { KanbanBoard } from '@/components/app/kanban-board';
import { MultiSelect } from '@/components/app/multi-select';
import { PageTabs } from '@/components/app/page-tabs';
import { RosterGrid } from '@/components/app/roster-grid';
import { Timeline } from '@/components/app/timeline';
import { ToastProvider, useToast } from '@/components/app/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { APP_HARBOR_CATALOG_EXAMPLES, APP_HARBOR_CATALOG_PREVIEWS } from './previews-app-harbor-catalog';
import { APP_HARBOR_DELIVERY_EXAMPLES, APP_HARBOR_DELIVERY_PREVIEWS } from './previews-app-harbor-delivery';
import { APP_HARBOR_FLEET_EXAMPLES, APP_HARBOR_FLEET_PREVIEWS } from './previews-app-harbor-fleet';
import { APP_HARBOR_INSIGHT_EXAMPLES, APP_HARBOR_INSIGHT_PREVIEWS } from './previews-app-harbor-insight';
import { APP_HARBOR_OPERATIONS_EXAMPLES, APP_HARBOR_OPERATIONS_PREVIEWS } from './previews-app-harbor-operations';

const NARROW = 'w-full max-w-[28rem]';
const MEDIUM = 'w-full max-w-[36rem]';
const WIDE = 'w-full max-w-[60rem]';
const TODAY = '2026-09-29';

/* ---------- filter-bar ---------- */
function FilterBarDemo() {
  const [view, setView] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [values, setValues] = React.useState<Record<string, string | undefined>>({ store: 'mission' });
  return (
    <FilterBar
      className={WIDE}
      views={[
        { id: 'all', label: 'All orders', count: 62 },
        { id: 'late', label: 'Late', count: 4 },
        { id: 'unassigned', label: 'Unassigned', count: 7 },
        { id: 'returns', label: 'Returns', count: 3 },
      ]}
      activeView={view}
      onViewChange={setView}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search orders"
      filters={[
        { id: 'store', label: 'Store', options: [{ value: 'mission', label: 'Mission' }, { value: 'sunset', label: 'Sunset' }, { value: 'marina', label: 'Marina' }] },
        { id: 'status', label: 'Status', options: [{ value: 'new', label: 'New' }, { value: 'packed', label: 'Packed' }, { value: 'out', label: 'Out for delivery' }] },
      ]}
      values={values}
      onFilterChange={(id, value) => setValues((current) => ({ ...current, [id]: value }))}
      onClear={() => {
        setSearch('');
        setValues({});
      }}
      trailing={<Button variant="outline" size="sm">Export</Button>}
    />
  );
}

/* ---------- date-range-picker ---------- */
function DateRangeDemo() {
  const [range, setRange] = React.useState<DateRange>({ from: '2026-09-15', to: '2026-09-29' });
  return (
    <div className="min-h-[26rem] w-full max-w-[44rem]">
      <DateRangePicker value={range} onChange={setRange} today={TODAY} max={TODAY} defaultOpen />
    </div>
  );
}

/* ---------- kanban-board ---------- */
interface DemoOrder {
  id: string;
  number: string;
  customer: string;
  items: number;
  status: string;
}
const ORDERS: DemoOrder[] = [
  { id: 'o1', number: '#1042', customer: 'Ines Duarte', items: 3, status: 'new' },
  { id: 'o2', number: '#1043', customer: 'Tom Adeyemi', items: 1, status: 'new' },
  { id: 'o3', number: '#1041', customer: 'Nadia Rahman', items: 5, status: 'picking' },
  { id: 'o4', number: '#1039', customer: 'Yuki Tanaka', items: 2, status: 'picking' },
  { id: 'o5', number: '#1038', customer: 'Omar Haddad', items: 4, status: 'packed' },
];
function KanbanDemo() {
  const [items, setItems] = React.useState(ORDERS);
  return (
    <div className={WIDE}>
      <KanbanBoard
        columns={[
          { id: 'new', title: 'New', hint: 'Waiting for a picker' },
          { id: 'picking', title: 'Picking' },
          { id: 'packed', title: 'Packed', hint: 'Ready for a van' },
        ]}
        items={items}
        getId={(order) => order.id}
        getColumn={(order) => order.status}
        renderCard={(order) => (
          <div className="space-y-1 pr-6">
            <p className="font-mono text-sm font-medium">{order.number}</p>
            <p className="text-sm text-muted-foreground">{order.customer}</p>
            <Badge variant="outline">{order.items === 1 ? '1 item' : `${order.items} items`}</Badge>
          </div>
        )}
        onMove={(order, status) => setItems((current) => current.map((item) => (item.id === order.id ? { ...item, status } : item)))}
      />
    </div>
  );
}

/* ---------- bulk-action-bar ---------- */
function BulkDemo() {
  return (
    <div className={`${MEDIUM} space-y-2 rounded-lg border p-4`}>
      {['#1042 · Ines Duarte', '#1043 · Tom Adeyemi', '#1041 · Nadia Rahman'].map((line) => (
        <p key={line} className="rounded-md bg-muted/50 px-3 py-2 text-sm">{line}</p>
      ))}
      <BulkActionBar
        count={3}
        noun="orders selected"
        actions={[
          { id: 'pack', label: 'Mark packed', icon: PackageCheck, onSelect: () => {} },
          { id: 'cancel', label: 'Cancel', icon: Trash2, destructive: true, onSelect: () => {} },
        ]}
        onClear={() => {}}
        className="static"
      />
    </div>
  );
}

/* ---------- roster-grid ---------- */
const DAYS = ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'];
const ROSTER = {
  people: [
    { id: 'p1', name: 'Priya Nair', role: 'Driver' },
    { id: 'p2', name: 'Diego Alvarez', role: 'Driver' },
    { id: 'p3', name: 'Sam Okafor', role: 'Warehouse' },
    { id: 'p4', name: 'Mia Chen', role: 'Warehouse' },
  ],
  shifts: [
    { id: 'am', label: 'Morning', short: 'AM', hours: '06:00 – 14:00' },
    { id: 'pm', label: 'Evening', short: 'PM', hours: '14:00 – 22:00', accent: true },
    { id: 'on', label: 'On call', short: 'OC', hours: 'All day' },
  ],
  assignments: {
    'p1.2026-09-28': 'am', 'p1.2026-09-29': 'am', 'p1.2026-09-30': 'am', 'p1.2026-10-01': 'pm', 'p1.2026-10-02': 'pm',
    'p2.2026-09-28': 'pm', 'p2.2026-09-29': 'pm', 'p2.2026-09-30': 'pm', 'p2.2026-10-03': 'am',
    'p3.2026-09-29': 'am', 'p3.2026-09-30': 'am', 'p3.2026-10-01': 'am', 'p3.2026-10-02': 'am', 'p3.2026-10-03': 'on',
    'p4.2026-09-28': 'am', 'p4.2026-10-01': 'pm', 'p4.2026-10-02': 'pm', 'p4.2026-10-03': 'pm', 'p4.2026-10-04': 'on',
  } as Record<string, string>,
};

/* ---------- toast ---------- */
function ToastButtons() {
  const { toast } = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => toast({ title: 'Order packed', description: '#1042 is ready for dispatch.', variant: 'success', action: { label: 'Undo', onClick: () => {} } })}>Success</Button>
      <Button variant="outline" onClick={() => toast({ title: 'Saved' })}>Plain</Button>
      <Button variant="outline" onClick={() => toast({ title: 'Could not save', description: 'Check your connection and try again.', variant: 'error' })}>Error</Button>
    </div>
  );
}
function ToastDemo() {
  return (
    <ToastProvider>
      <div className={`${NARROW} space-y-3 rounded-lg border p-6`}>
        <p className="text-sm text-muted-foreground">Press a button to raise a toast in the corner of the page.</p>
        <ToastButtons />
      </div>
    </ToastProvider>
  );
}

/* ---------- inline-edit ---------- */
function InlineDemo() {
  const [name, setName] = React.useState('Front brake pad set');
  const [price, setPrice] = React.useState(54);
  const [status, setStatus] = React.useState('active');
  return (
    <dl className={`${MEDIUM} divide-y rounded-lg border text-sm`}>
      <div className="flex items-center justify-between gap-4 px-4 py-3"><dt className="text-muted-foreground">Name</dt><dd><InlineEdit value={name} onSave={(v) => setName(String(v))} /></dd></div>
      <div className="flex items-center justify-between gap-4 px-4 py-3"><dt className="text-muted-foreground">Price</dt><dd><InlineEdit value={price} type="number" format={(v) => <span className="font-mono">${v}.00</span>} validate={(v) => (Number(v) < 0 ? 'Cannot be negative' : undefined)} onSave={(v) => setPrice(Number(v))} /></dd></div>
      <div className="flex items-center justify-between gap-4 px-4 py-3"><dt className="text-muted-foreground">Status</dt><dd><InlineEdit value={status} type="select" options={[{ value: 'active', label: 'Active' }, { value: 'paused', label: 'Paused' }, { value: 'retired', label: 'Retired' }]} onSave={(v) => setStatus(String(v))} /></dd></div>
    </dl>
  );
}

/* ---------- multi-select ---------- */
function MultiDemo() {
  return (
    <div className="min-h-[24rem] w-full max-w-[24rem]">
      <MultiSelect
        defaultOpen
        placeholder="Choose stores"
        defaultValue={['mission', 'marina']}
        options={[
          { value: 'mission', label: 'Mission', description: '2200 Mission St' },
          { value: 'sunset', label: 'Sunset', description: '1350 Irving St' },
          { value: 'marina', label: 'Marina', description: '2100 Chestnut St' },
          { value: 'soma', label: 'SoMa', description: '450 Folsom St' },
          { value: 'warehouse', label: 'Warehouse', description: 'Bayshore Blvd' },
        ]}
      />
    </div>
  );
}

const PREVIEWS: Record<string, React.ReactNode> = {
  'filter-bar': <FilterBarDemo />,
  'date-range-picker': <DateRangeDemo />,
  'kanban-board': <KanbanDemo />,
  timeline: (
    <div className={`${NARROW} rounded-lg border p-5`}>
      <Timeline
        events={[
          { id: 'placed', title: 'Order placed', detail: 'Ines Duarte · 3 items', time: '09:12' },
          { id: 'packed', title: 'Packed at Mission', detail: 'By Sam Okafor', icon: PackageOpen, time: '10:40' },
          { id: 'out', title: 'Out for delivery', detail: 'Van 12 · Priya Nair', icon: Truck, state: 'current', time: '11:05' },
          { id: 'delivered', title: 'Delivered', detail: 'Estimated 12:30', state: 'upcoming' },
        ]}
      />
    </div>
  ),
  'roster-grid': <RosterGrid className={WIDE} people={ROSTER.people} days={DAYS} shiftTypes={ROSTER.shifts} defaultAssignments={ROSTER.assignments} today={TODAY} />,
  'bulk-action-bar': <BulkDemo />,
  'page-tabs': (
    <div className={`${MEDIUM}`}>
      <PageTabs
        activeId="history"
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'history', label: 'History', count: 14 },
          { id: 'documents', label: 'Documents', count: 3 },
          { id: 'costs', label: 'Costs' },
        ]}
      />
    </div>
  ),
  'multi-select': <MultiDemo />,
  'file-upload': (
    <FileUpload
      className={MEDIUM}
      accept="image/*,.pdf"
      hint="PNG, JPG or PDF up to 10 MB"
      defaultItems={[
        { id: 'a', name: 'brake-pads-front.jpg', size: 412_000, progress: 100, status: 'done' },
        { id: 'b', name: 'supplier-catalogue.pdf', size: 3_100_000, progress: 62, status: 'uploading' },
        { id: 'c', name: 'warehouse-scan.tiff', size: 18_400_000, progress: 0, status: 'error', error: 'Larger than 10 MB' },
      ]}
      simulate={false}
    />
  ),
  'confirm-dialog': (
    <div className={`${NARROW} flex items-center justify-center rounded-lg border p-10`}>
      <ConfirmDialog
        trigger={<Button variant="outline"><Store /> Cancel order #1042</Button>}
        title="Cancel order #1042?"
        description="The customer will be refunded and the items returned to stock."
        confirmLabel="Cancel order"
        destructive
        onConfirm={() => new Promise((resolve) => setTimeout(resolve, 900))}
      />
    </div>
  ),
  toast: <ToastDemo />,
  'inline-edit': <InlineDemo />,
};

const EXAMPLES: Record<string, { label: string; node: React.ReactNode }[]> = {};

export const APP_HARBOR_BASE_PREVIEWS: Record<string, React.ReactNode> = PREVIEWS;
export const APP_HARBOR_BASE_EXAMPLES: Record<string, { label: string; node: React.ReactNode }[]> = EXAMPLES;

export const APP_HARBOR_PREVIEWS = { ...APP_HARBOR_BASE_PREVIEWS, ...APP_HARBOR_OPERATIONS_PREVIEWS, ...APP_HARBOR_DELIVERY_PREVIEWS, ...APP_HARBOR_CATALOG_PREVIEWS, ...APP_HARBOR_FLEET_PREVIEWS, ...APP_HARBOR_INSIGHT_PREVIEWS };
export const APP_HARBOR_EXAMPLES = { ...APP_HARBOR_BASE_EXAMPLES, ...APP_HARBOR_OPERATIONS_EXAMPLES, ...APP_HARBOR_DELIVERY_EXAMPLES, ...APP_HARBOR_CATALOG_EXAMPLES, ...APP_HARBOR_FLEET_EXAMPLES, ...APP_HARBOR_INSIGHT_EXAMPLES };
