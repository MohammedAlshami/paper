import * as React from 'react';
import { PageHeader } from '@/components/app/page-header';
import { RecordDetailSheet } from '@/components/app/record-detail-sheet';
import { Button } from '@/components/ui/button';
import { WorkOrderCard, WORK_ORDER_STATUSES } from '@/components/fleet/work-order-card';
import { WorkOrderBoard, type BoardOrder } from '@/components/fleet/work-order-board';
import { formatDate } from '@/components/app/app-kit';
import { fullOrder } from '../data';
import { GarageShell, PageBody } from '../shell';
import type { PageContext } from '../context';

export function WorkOrdersPage(ctx: PageContext) {
  const { navigate, orders, setOrders } = ctx;
  const [openId, setOpenId] = React.useState<string | null>(null);
  // The board keeps its own copy while you drag; bump this to re-seed it after a change made in the sheet.
  const [boardKey, setBoardKey] = React.useState(0);
  const open = orders.find((order) => order.id === openId);
  const statusLabel = (status: BoardOrder['status']) => WORK_ORDER_STATUSES.find((entry) => entry.id === status)?.label ?? status;
  const full = open ? fullOrder(open) : null;

  return (
    <GarageShell activeId="work-orders" ctx={ctx}>
      <PageBody>
        <PageHeader
          title="Work orders"
          description="Drag a card to another column, or use the menu on it. Open one for the job card."
          actions={
            <Button size="sm" onClick={() => navigate('/work-orders/new')}>
              New work order
            </Button>
          }
        />
        <WorkOrderBoard
          key={boardKey}
          orders={orders}
          onMove={(order, status) => setOrders((current) => current.map((item) => (item.id === order.id ? { ...item, status } : item)))}
          onOpen={(order) => setOpenId(order.id)}
        />
        <RecordDetailSheet
          open={Boolean(open)}
          onOpenChange={(next) => !next && setOpenId(null)}
          title={open ? `${open.id} · ${open.title}` : ''}
          subtitle={open?.vehicle}
          status={open ? { label: statusLabel(open.status), tone: open.priority === 'urgent' ? 'accent' : 'default' } : undefined}
          fields={
            open
              ? [
                  { label: 'Vehicle', value: open.vehicle },
                  { label: 'Priority', value: open.priority },
                  { label: 'Technician', value: open.technician ?? 'Unassigned' },
                  { label: 'Opened', value: formatDate(open.openedOn) },
                ]
              : []
          }
          tabs={
            full
              ? [
                  {
                    id: 'card',
                    label: 'Job card',
                    content: (
                      <WorkOrderCard
                        order={full}
                        onAdvance={(status) => {
                          setOrders((current) => current.map((item) => (item.id === full.id ? { ...item, status } : item)));
                          setBoardKey((key) => key + 1);
                        }}
                      />
                    ),
                  },
                ]
              : []
          }
          actions={
            <Button size="sm" variant="outline" onClick={() => setOpenId(null)}>
              Close
            </Button>
          }
        />
      </PageBody>
    </GarageShell>
  );
}
