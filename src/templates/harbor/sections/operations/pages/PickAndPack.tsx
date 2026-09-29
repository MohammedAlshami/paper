import * as React from 'react';
import { ClipboardList, PackageCheck, PackageOpen, Timer, Truck } from 'lucide-react';
import { EmptyState } from '@/components/app/empty-state';
import { KanbanBoard } from '@/components/app/kanban-board';
import { StatCardGrid, type Stat } from '@/components/app/stat-card-grid';
import { useToast } from '@/components/app/toast';
import { InspectionChecklist, type InspectionResult } from '@/components/fleet/inspection-checklist';
import { NOW, getLocation, getProduct, orderUnits, relativeTime, type Order } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarborRouter } from '../../../router-context';
import { useHarbor } from '../../../state';
import { customerName, productName, statusLabel } from '../parts';

const COLUMNS = [
  { id: 'new', title: 'To pick', hint: 'Waiting for a picker' },
  { id: 'picking', title: 'Picking', hint: 'On the shelves now' },
  { id: 'packed', title: 'Packed', hint: 'Ready for a van or collection' },
];

const minutesSince = (iso: string) => Math.round((new Date(NOW).getTime() - new Date(iso).getTime()) / 60_000);

/** The warehouse floor: orders move from waiting to picked to packed, and the picker ticks every line off. */
export function PickAndPack() {
  const { state, actions } = useHarbor();
  const { navigate } = useHarborRouter();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const board = React.useMemo(() => state.orders.filter((order) => COLUMNS.some((column) => column.id === order.status)), [state.orders]);
  const selected = board.find((order) => order.id === selectedId) ?? null;

  const stats = React.useMemo<Stat[]>(() => {
    const waiting = board.filter((order) => order.status === 'new');
    const oldest = waiting.length ? Math.max(...waiting.map((order) => minutesSince(order.placedAt))) : 0;
    return [
      { id: 'new', label: 'To pick', value: String(waiting.length), icon: ClipboardList },
      { id: 'picking', label: 'Being picked', value: String(board.filter((order) => order.status === 'picking').length), icon: PackageOpen },
      { id: 'packed', label: 'Packed, ready to go', value: String(board.filter((order) => order.status === 'packed').length), icon: PackageCheck },
      { id: 'oldest', label: 'Oldest waiting', value: oldest >= 60 ? `${Math.floor(oldest / 60)} h ${oldest % 60} min` : `${oldest} min`, icon: Timer },
    ];
  }, [board]);

  const move = (order: Order, to: string) => {
    actions.setOrderStatus(order.id, to as Order['status']);
    toast({ variant: 'success', title: `${order.number} moved to ${statusLabel(to as Order['status']).toLowerCase()}` });
  };

  const submitPickList = (order: Order, results: InspectionResult[]) => {
    const flagged = results.filter((result) => result.result === 'fail');
    if (flagged.length) {
      if (order.status === 'new') actions.setOrderStatus(order.id, 'picking');
      toast({ variant: 'error', title: `${flagged.length} ${flagged.length === 1 ? 'line' : 'lines'} short on ${order.number}`, description: 'The order stays in picking. Check the stock, or split the order.' });
      return;
    }
    actions.setOrderStatus(order.id, 'packed');
    toast({ variant: 'success', title: `${order.number} packed`, description: `${orderUnits(order)} items, ready for ${order.method === 'delivery' ? 'a van' : 'collection'}.` });
  };

  return (
    <HarborPage title="Pick and pack" description="Every order still in the warehouse. Select one to see its pick list.">
      <StatCardGrid stats={stats} period="" />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <KanbanBoard
          columns={COLUMNS}
          items={board}
          getId={(order) => order.id}
          getColumn={(order) => order.status}
          onMove={move}
          onCardClick={(order) => setSelectedId(order.id)}
          columnWidth="w-64"
          emptyText="All picked"
          renderCard={(order) => (
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono font-semibold">{order.number}</span>
                <span className="text-xs text-muted-foreground">{relativeTime(order.placedAt)}</span>
              </div>
              <span className="truncate">{customerName(order)}</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {orderUnits(order)} items · {getLocation(order.locationId)?.name}
                {order.method === 'delivery' ? <Truck className="size-3" aria-label="Delivery" /> : null}
              </span>
            </div>
          )}
        />

        <div className="min-w-0">
          {selected ? (
            <InspectionChecklist
              key={selected.id}
              title="Pick list"
              vehicle={`${selected.number} · ${customerName(selected)} · ${getLocation(selected.locationId)?.name}`}
              sections={[
                {
                  title: 'Items to pick',
                  items: selected.items.map((item) => ({ id: item.productId, label: `${item.qty} × ${productName(item.productId)} (${getProduct(item.productId)?.sku ?? ''})` })),
                },
              ]}
              onSubmit={(results) => submitPickList(selected, results)}
            />
          ) : (
            <EmptyState icon={ClipboardList} title="Pick list" description="Select an order on the board to tick its lines off. Mark a line as failed when the shelf is short." action={board.length ? { label: `Open ${board[0].number}`, onClick: () => setSelectedId(board[0].id) } : { label: 'See all orders', onClick: () => navigate('/orders') }} />
          )}
        </div>
      </div>
    </HarborPage>
  );
}
