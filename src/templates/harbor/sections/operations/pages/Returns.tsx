import * as React from 'react';
import { Banknote, ClipboardCheck, RotateCcw, Undo2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { DataTable, type DataColumn } from '@/components/app/data-table';
import { PageTabs } from '@/components/app/page-tabs';
import { RecordDetailSheet } from '@/components/app/record-detail-sheet';
import { StatCardGrid, type Stat } from '@/components/app/stat-card-grid';
import { useToast } from '@/components/app/toast';
import { Button } from '@/components/ui/button';
import { RETURN_STATUSES, formatDate, formatMoney, relativeTime, type ReturnRequest, type ReturnStatus } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarborRouter } from '../../../router-context';
import { useHarbor } from '../../../state';
import { ReturnStatusBadge, customerName, money, productName } from '../parts';

type Pending = { id: string; kind: 'reject' | 'refund' } | null;

/** Return requests from request to refund: approve, receive the parcel, pay it back, or turn it down. */
export function Returns() {
  const { state, actions } = useHarbor();
  const { href } = useHarborRouter();
  const { toast } = useToast();
  const [tab, setTab] = React.useState<'all' | ReturnStatus>('all');
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState<Pending>(null);

  const rows = tab === 'all' ? state.returns : state.returns.filter((request) => request.status === tab);
  const open = state.returns.find((request) => request.id === openId);
  const pendingReturn = pending ? state.returns.find((request) => request.id === pending.id) : undefined;
  const order = (request: ReturnRequest) => state.orders.find((candidate) => candidate.id === request.orderId);

  const stats = React.useMemo<Stat[]>(() => {
    const active = state.returns.filter((request) => ['requested', 'approved', 'received'].includes(request.status));
    const refunded = state.returns.filter((request) => request.status === 'refunded');
    const reasons = new Map<string, number>();
    state.returns.forEach((request) => reasons.set(request.reason, (reasons.get(request.reason) ?? 0) + 1));
    const top = [...reasons].sort((a, b) => b[1] - a[1])[0];
    return [
      { id: 'open', label: 'Open returns', value: String(active.length), icon: Undo2 },
      { id: 'decide', label: 'Waiting for a decision', value: String(state.returns.filter((request) => request.status === 'requested').length), icon: ClipboardCheck },
      { id: 'refunded', label: 'Refunded', value: formatMoney(refunded.reduce((sum, request) => sum + request.refundAmount, 0), 'USD', 2), icon: Banknote },
      { id: 'reason', label: 'Most common reason', value: top ? top[0] : 'None', icon: RotateCcw },
    ];
  }, [state.returns]);

  const columns: DataColumn<ReturnRequest>[] = [
    { id: 'id', header: 'Return', sortValue: (request) => request.id, cell: (request) => <span className="font-mono text-sm font-semibold">{request.id.toUpperCase()}</span> },
    {
      id: 'item',
      header: 'Item',
      sortValue: (request) => productName(request.productId),
      cell: (request) => (
        <div className="min-w-0 max-w-[18rem]">
          <p className="truncate text-sm font-bold">{productName(request.productId)}</p>
          <p className="truncate text-xs text-muted-foreground">
            {request.qty} × · {order(request)?.number} · {order(request) ? customerName(order(request)!) : ''}
          </p>
        </div>
      ),
    },
    { id: 'reason', header: 'Reason', hideBelow: 'md', sortValue: (request) => request.reason, cell: (request) => <span className="text-sm text-muted-foreground">{request.reason}</span> },
    { id: 'refund', header: 'Refund', align: 'right', sortValue: (request) => request.refundAmount, cell: (request) => <span className="font-mono text-sm tabular-nums">{money(request.refundAmount)}</span> },
    { id: 'when', header: 'Requested', hideBelow: 'sm', sortValue: (request) => request.requestedAt, cell: (request) => <span className="font-mono text-xs tabular-nums text-muted-foreground">{relativeTime(request.requestedAt)}</span> },
    { id: 'status', header: 'Status', sortValue: (request) => RETURN_STATUSES.findIndex((status) => status.id === request.status), cell: (request) => <ReturnStatusBadge status={request.status} /> },
  ];

  const step = (request: ReturnRequest, status: ReturnStatus, title: string) => {
    actions.setReturnStatus(request.id, status);
    toast({ variant: 'success', title, description: `${request.id.toUpperCase()} · ${productName(request.productId)}` });
  };

  return (
    <HarborPage
      title="Returns"
      description="From request to refund. Approve it, receive the parcel back, then pay the customer."
      tabs={
        <PageTabs
          activeId={tab}
          onChange={(next) => setTab(next.id as 'all' | ReturnStatus)}
          tabs={[{ id: 'all', label: 'All', count: state.returns.length }, ...RETURN_STATUSES.map((status) => ({ id: status.id, label: status.label, count: state.returns.filter((request) => request.status === status.id).length }))]}
        />
      }
    >
      <StatCardGrid stats={stats} period="" />

      <DataTable rows={rows} columns={columns} getRowId={(request) => request.id} defaultSort={{ id: 'when', dir: 'desc' }} pageSize={8} onRowClick={(request) => setOpenId(request.id)} searchText={(request) => `${request.id} ${productName(request.productId)} ${request.reason}`} searchPlaceholder="Search returns" emptyTitle="No returns here" emptyDescription="Nothing is in this stage." />

      {open ? (
        <RecordDetailSheet
          open
          onOpenChange={(value) => !value && setOpenId(null)}
          title={`Return ${open.id.toUpperCase()}`}
          subtitle={productName(open.productId)}
          status={{ label: RETURN_STATUSES.find((status) => status.id === open.status)?.label ?? open.status, tone: open.status === 'requested' ? 'accent' : open.status === 'rejected' ? 'muted' : 'default' }}
          fields={[
            { label: 'Order', value: order(open)?.number, mono: true },
            { label: 'Customer', value: order(open) ? customerName(order(open)!) : undefined },
            { label: 'Item', value: `${open.qty} × ${productName(open.productId)}` },
            { label: 'Reason', value: open.reason },
            { label: 'Requested', value: `${formatDate(open.requestedAt)} (${relativeTime(open.requestedAt)})` },
            { label: 'Refund', value: money(open.refundAmount), mono: true },
            ...(open.note ? [{ label: 'Customer note', value: open.note }] : []),
          ]}
          actions={
            <div className="flex flex-wrap gap-2">
              {open.status === 'requested' ? (
                <>
                  <Button onClick={() => step(open, 'approved', 'Return approved')}>Approve</Button>
                  <Button variant="outline" onClick={() => setPending({ id: open.id, kind: 'reject' })}>
                    Reject
                  </Button>
                </>
              ) : null}
              {open.status === 'approved' ? <Button onClick={() => step(open, 'received', 'Parcel received back')}>Mark received</Button> : null}
              {open.status === 'received' ? <Button onClick={() => setPending({ id: open.id, kind: 'refund' })}>Refund {money(open.refundAmount)}</Button> : null}
              {order(open) ? (
                <Button asChild variant="outline">
                  <a href={href(`/orders/${open.orderId}`)}>View order</a>
                </Button>
              ) : null}
            </div>
          }
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(value) => !value && setPending(null)}
        destructive={pending?.kind === 'reject'}
        title={pending?.kind === 'reject' ? 'Reject this return?' : `Refund ${pendingReturn ? money(pendingReturn.refundAmount) : ''}?`}
        description={pending?.kind === 'reject' ? 'The customer is told the return was turned down. You can not reopen it.' : 'The amount goes back to the card the customer paid with.'}
        confirmLabel={pending?.kind === 'reject' ? 'Reject return' : 'Refund'}
        onConfirm={() => {
          if (!pendingReturn || !pending) return;
          step(pendingReturn, pending.kind === 'reject' ? 'rejected' : 'refunded', pending.kind === 'reject' ? 'Return rejected' : 'Refund sent');
        }}
      />
    </HarborPage>
  );
}
