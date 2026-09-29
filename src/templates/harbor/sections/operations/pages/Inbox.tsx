import * as React from 'react';
import { CircleCheck, Eye } from 'lucide-react';
import { EmptyState } from '@/components/app/empty-state';
import { PageTabs } from '@/components/app/page-tabs';
import { DataTable, type DataColumn } from '@/components/app/data-table';
import { useToast } from '@/components/app/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { relativeTime, type Alert, type AlertKind } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarborRouter } from '../../../router-context';
import { useHarbor } from '../../../state';

type TabId = 'open' | 'deliveries' | 'stock' | 'fleet' | 'orders' | 'resolved';

const GROUPS: Record<Exclude<TabId, 'open' | 'resolved'>, AlertKind[]> = {
  deliveries: ['late-delivery', 'geofence'],
  stock: ['low-stock', 'po-arrived'],
  fleet: ['service-due', 'document-expiry'],
  orders: ['payment-failed', 'return-request'],
};

const KIND_LABEL: Record<AlertKind, string> = {
  'late-delivery': 'Late delivery',
  geofence: 'Geofence',
  'low-stock': 'Low stock',
  'po-arrived': 'Purchase order',
  'service-due': 'Service due',
  'document-expiry': 'Document',
  'payment-failed': 'Payment',
  'return-request': 'Return',
};

/** Everything that wants a decision, in one list: what it is, how bad, and a way to deal with it. */
export function Inbox() {
  const { state, actions } = useHarbor();
  const { navigate } = useHarborRouter();
  const { toast } = useToast();
  const [tab, setTab] = React.useState<TabId>('open');
  const [tableKey, setTableKey] = React.useState(0);

  const open = state.alerts.filter((alert) => !alert.resolved);
  const rows = React.useMemo(() => {
    if (tab === 'resolved') return state.alerts.filter((alert) => alert.resolved);
    if (tab === 'open') return open;
    return open.filter((alert) => GROUPS[tab].includes(alert.kind));
  }, [state.alerts, tab, open]);

  const countIn = (kinds: AlertKind[]) => open.filter((alert) => kinds.includes(alert.kind)).length;

  const resolve = (alert: Alert) => {
    actions.resolveAlert(alert.id);
    toast({ variant: 'success', title: 'Marked as resolved', description: alert.title });
  };

  const columns: DataColumn<Alert>[] = [
    {
      id: 'severity',
      header: 'Severity',
      sortValue: (alert) => ['info', 'warning', 'critical'].indexOf(alert.severity),
      cell: (alert) => (
        <Badge variant={alert.severity === 'critical' ? 'default' : 'outline'} style={alert.severity === 'critical' ? { background: '#ec4899', color: '#fff' } : undefined}>
          {alert.severity}
        </Badge>
      ),
    },
    {
      id: 'alert',
      header: 'Alert',
      sortValue: (alert) => alert.title,
      cell: (alert) => (
        <div className="min-w-0 max-w-[34rem]">
          <p className={alert.read ? 'truncate text-sm' : 'truncate text-sm font-bold'}>{alert.title}</p>
          <p className="truncate text-xs text-muted-foreground">{alert.detail}</p>
        </div>
      ),
    },
    { id: 'kind', header: 'Type', hideBelow: 'md', sortValue: (alert) => KIND_LABEL[alert.kind], cell: (alert) => <span className="text-sm text-muted-foreground">{KIND_LABEL[alert.kind]}</span> },
    { id: 'time', header: 'When', hideBelow: 'sm', sortValue: (alert) => alert.at, cell: (alert) => <span className="font-mono text-xs tabular-nums text-muted-foreground">{relativeTime(alert.at)}</span> },
    {
      id: 'actions',
      header: '',
      align: 'right',
      cell: (alert) =>
        alert.resolved ? null : (
          <Button
            size="xs"
            variant="outline"
            onClick={(event) => {
              event.stopPropagation();
              resolve(alert);
            }}
          >
            Resolve
          </Button>
        ),
    },
  ];

  return (
    <HarborPage
      title="Inbox"
      description="Late deliveries, low stock, failed payments and the rest, most serious first."
      actions={
        <Button
          variant="outline"
          disabled={!state.alerts.some((alert) => !alert.read && !alert.resolved)}
          onClick={() => {
            actions.readAllAlerts();
            toast({ title: 'Everything marked as read' });
          }}
        >
          <Eye /> Mark all read
        </Button>
      }
      tabs={
        <PageTabs
          activeId={tab}
          onChange={(next) => {
            setTab(next.id as TabId);
            setTableKey((key) => key + 1);
          }}
          tabs={[
            { id: 'open', label: 'All open', count: open.length },
            { id: 'deliveries', label: 'Deliveries', count: countIn(GROUPS.deliveries) },
            { id: 'stock', label: 'Stock', count: countIn(GROUPS.stock) },
            { id: 'fleet', label: 'Fleet', count: countIn(GROUPS.fleet) },
            { id: 'orders', label: 'Orders', count: countIn(GROUPS.orders) },
            { id: 'resolved', label: 'Resolved', count: state.alerts.length - open.length },
          ]}
        />
      }
    >
      {rows.length === 0 ? (
        <EmptyState icon={CircleCheck} title={tab === 'resolved' ? 'Nothing resolved yet' : 'All clear'} description={tab === 'resolved' ? 'Alerts you resolve show up here.' : 'Nothing in this group needs you right now.'} />
      ) : (
        <DataTable
          key={tableKey}
          rows={rows}
          columns={columns}
          getRowId={(alert) => alert.id}
          selectable
          defaultSort={{ id: 'severity', dir: 'desc' }}
          pageSize={8}
          searchText={(alert) => `${alert.title} ${alert.detail} ${KIND_LABEL[alert.kind]}`}
          searchPlaceholder="Search alerts"
          onRowClick={(alert) => {
            actions.readAlert(alert.id);
            navigate(alert.href);
          }}
          bulkActions={(selected, clear) => (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm">
                <span className="font-mono tabular-nums">{selected.length}</span> selected
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  selected.forEach((alert) => actions.readAlert(alert.id));
                  toast({ title: `${selected.length} marked as read` });
                  clear();
                }}
              >
                Mark read
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  selected.forEach((alert) => actions.resolveAlert(alert.id));
                  toast({ variant: 'success', title: `${selected.length} resolved` });
                  clear();
                }}
              >
                Resolve
              </Button>
            </div>
          )}
        />
      )}
    </HarborPage>
  );
}
