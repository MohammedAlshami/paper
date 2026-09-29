import * as React from 'react';
import { CalendarClock, Mail, ReceiptText, ShoppingBag, UserRound, Wallet } from 'lucide-react';
import { ActivityFeed } from '@/components/app/activity-feed';
import { EmptyState } from '@/components/app/empty-state';
import { InlineEdit } from '@/components/app/inline-edit';
import { RecordDetail } from '@/components/app/record-detail-sheet';
import { StatCardGrid } from '@/components/app/stat-card-grid';
import { useToast } from '@/components/app/toast';
import { LocationBadge } from '@/components/maps/location-badge';
import { PlaceCard } from '@/components/maps/place-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NOW, ORDER_STATUSES, customerSpend, daysBetween, formatDate, formatMoney, getCustomer, ordersByCustomer, orderTotal, orderUnits, TODAY } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarborRouter } from '../../../router-context';
import { useHarbor } from '../../../state';

const SEGMENT_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'regular', label: 'Regular' },
  { value: 'vip', label: 'VIP' },
];

/** One customer: who they are, what they spend, every order, and notes you can edit in place. */
export function CustomerDetailPage({ id }: { id: string }) {
  const { state, actions } = useHarbor();
  const { navigate } = useHarborRouter();
  const { toast } = useToast();
  const customer = getCustomer(id);
  const [edits, setEdits] = React.useState<{ phone?: string; segment?: string; notes?: string }>({});

  if (!customer) {
    return (
      <HarborPage title="Customer not found" crumbs={[{ label: 'Customers', path: '/customers' }]}>
        <EmptyState icon={UserRound} title="No customer with that id" description="They may have been removed, or the link is wrong." action={{ label: 'Back to customers', onClick: () => navigate('/customers') }} />
      </HarborPage>
    );
  }

  const orders = ordersByCustomer(state.orders, customer.id).sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  const live = orders.filter((order) => order.status !== 'cancelled');
  const spend = customerSpend(state.orders, customer.id);
  const last = orders[0];
  const segment = edits.segment ?? customer.segment;
  const saved = (label: string, value: string) => {
    toast({ title: `${label} updated`, description: value, variant: 'success' });
    actions.log(`updated the ${label.toLowerCase()} of`, customer.name, 'order');
  };

  return (
    <HarborPage
      title={customer.name}
      crumbs={[{ label: 'Customers', path: '/customers' }]}
      badge={<Badge variant={segment === 'vip' ? 'default' : 'outline'}>{segment === 'vip' ? 'VIP' : segment}</Badge>}
      description={
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{customer.email}</span>
          <span aria-hidden>·</span>
          <LocationBadge city="San Francisco" region="CA" country="USA" position={customer.position} />
        </span>
      }
      actions={
        <Button
          variant="outline"
          onClick={() => {
            toast({ title: `Email drafted for ${customer.name}`, variant: 'success' });
            actions.log('drafted an email to', customer.name, 'order');
          }}
        >
          <Mail /> Email customer
        </Button>
      }
    >
      <StatCardGrid
        period=""
        stats={[
          { id: 'spend', label: 'Lifetime spend', value: formatMoney(spend), icon: Wallet },
          { id: 'orders', label: 'Orders', value: String(live.length), icon: ShoppingBag },
          { id: 'aov', label: 'Average order', value: live.length ? formatMoney(spend / live.length, 'USD', 2) : '—', icon: ReceiptText },
          { id: 'last', label: 'Last order', value: last ? `${daysBetween(last.placedAt, TODAY)}d ago` : 'Never', icon: CalendarClock },
        ]}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="gap-0 overflow-hidden py-0">
            <RecordDetail
              title="Profile"
              subtitle={`Customer since ${formatDate(customer.joined, { day: 'numeric', month: 'short', year: 'numeric' })}`}
              fields={[
                { label: 'Phone', value: <InlineEdit value={edits.phone ?? customer.phone} onSave={(value) => { setEdits((current) => ({ ...current, phone: String(value) })); saved('Phone', String(value)); }} validate={(value) => (String(value).replace(/\D/g, '').length < 10 ? 'Enter a full phone number' : undefined)} /> },
                { label: 'Segment', value: <InlineEdit type="select" options={SEGMENT_OPTIONS} value={segment} onSave={(value) => { setEdits((current) => ({ ...current, segment: String(value) })); saved('Segment', String(value)); }} format={(value) => SEGMENT_OPTIONS.find((option) => option.value === value)?.label ?? String(value)} /> },
                { label: 'Marketing', value: customer.marketing ? 'Subscribed' : 'Not subscribed' },
                { label: 'Notes', value: <InlineEdit value={edits.notes ?? (customer.segment === 'vip' ? 'Prefers evening delivery. Leave with the doorman.' : '')} placeholder="Add a note" onSave={(value) => { setEdits((current) => ({ ...current, notes: String(value) })); saved('Notes', 'Saved'); }} /> },
              ]}
            />
          </Card>
          <PlaceCard place={{ name: 'Delivery address', category: 'Home', address: customer.address, position: customer.position }} />
        </div>

        <ActivityFeed
          className="min-w-0"
          title="Orders"
          today={NOW}
          pageSize={8}
          items={orders.map((order) => ({
            id: order.id,
            actor: { name: customer.name },
            action: order.status === 'cancelled' ? 'cancelled' : 'placed',
            subject: `Order ${order.number}`,
            detail: `${orderUnits(order)} items · ${formatMoney(orderTotal(order), 'USD', 2)} · ${ORDER_STATUSES.find((status) => status.id === order.status)?.label ?? order.status}`,
            at: order.placedAt,
          }))}
          onItemClick={(item) => navigate(`/orders/${item.id}`)}
        />
      </div>
    </HarborPage>
  );
}
