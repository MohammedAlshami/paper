import * as React from 'react';
import { Download, ScrollText } from 'lucide-react';
import { DataTable, type DataColumn } from '@/components/app/data-table';
import { EmptyState } from '@/components/app/empty-state';
import { FilterBar } from '@/components/app/filter-bar';
import { useToast } from '@/components/app/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatTime, relativeTime, type AuditEvent, type AuditKind } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarborRouter } from '../../../router-context';
import { useHarbor } from '../../../state';

const KIND_LABEL: Record<AuditKind, string> = { order: 'Order', stock: 'Stock', delivery: 'Delivery', fleet: 'Fleet', team: 'Team', settings: 'Settings' };
const KINDS = Object.keys(KIND_LABEL) as AuditKind[];

const columns: DataColumn<AuditEvent>[] = [
  {
    id: 'event',
    header: 'Event',
    sortValue: (row) => row.at,
    cell: (row) => (
      <span className="flex flex-col">
        <span className="text-sm">
          <span className="font-bold">{row.actor}</span> <span className="text-muted-foreground">{row.action}</span> <span className="font-bold">{row.subject}</span>
        </span>
        {row.href ? <span className="font-mono text-xs text-muted-foreground">{row.href}</span> : null}
      </span>
    ),
  },
  { id: 'kind', header: 'Type', hideBelow: 'sm', sortValue: (row) => KIND_LABEL[row.kind], cell: (row) => <Badge variant="outline">{KIND_LABEL[row.kind]}</Badge> },
  {
    id: 'at',
    header: 'When',
    align: 'right',
    sortValue: (row) => row.at,
    cell: (row) => (
      <span className="font-mono text-xs tabular-nums text-muted-foreground" title={`${formatDate(row.at)}, ${formatTime(row.at)}`}>
        {relativeTime(row.at)}
      </span>
    ),
  },
];

/** Every change anyone has made: who did what, to what, and when. Rows with a page behind them open it. */
export function AuditLogPage() {
  const { state } = useHarbor();
  const { navigate } = useHarborRouter();
  const { toast } = useToast();
  const [view, setView] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});

  const people = React.useMemo(() => [...new Set(state.audit.map((event) => event.actor))].sort(), [state.audit]);

  const visible = React.useMemo(
    () =>
      state.audit.filter((event) => {
        if (view !== 'all' && event.kind !== view) return false;
        if (filters.person && event.actor !== filters.person) return false;
        const needle = search.trim().toLowerCase();
        return !needle || `${event.actor} ${event.action} ${event.subject}`.toLowerCase().includes(needle);
      }),
    [state.audit, view, filters, search],
  );

  return (
    <HarborPage title="Audit log" description="Every recorded change, who made it and when. Open a row to go to the page it changed.">
      <FilterBar
        views={[{ id: 'all', label: 'Everything', count: state.audit.length }, ...KINDS.map((kind) => ({ id: kind, label: KIND_LABEL[kind], count: state.audit.filter((event) => event.kind === kind).length }))]}
        activeView={view}
        onViewChange={setView}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search the log"
        filters={[{ id: 'person', label: 'Person', options: people.map((person) => ({ value: person, label: person })) }]}
        values={filters}
        onFilterChange={(id, value) => setFilters((current) => ({ ...current, [id]: value }))}
        onClear={() => {
          setSearch('');
          setFilters({});
        }}
        trailing={
          <Button variant="outline" onClick={() => toast({ title: 'Audit log export started', description: `${visible.length} events, CSV`, variant: 'success' })}>
            <Download /> Export
          </Button>
        }
      />

      <DataTable
        rows={visible}
        columns={columns}
        getRowId={(row) => row.id}
        defaultSort={{ id: 'at', dir: 'desc' }}
        pageSize={12}
        pageSizes={[12, 30]}
        onRowClick={(row) => row.href && navigate(row.href)}
        emptyTitle="No events match"
        emptyDescription="Clear the filters or pick another view."
      />

      {!state.audit.length ? <EmptyState icon={ScrollText} title="Nothing recorded yet" description="Changes people make — moving an order, adjusting stock, inviting a teammate — appear here." /> : null}
    </HarborPage>
  );
}
