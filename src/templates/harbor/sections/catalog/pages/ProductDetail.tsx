import * as React from 'react';
import { ClipboardPlus, PauseCircle, PlayCircle } from 'lucide-react';
import { EmptyState } from '@/components/app/empty-state';
import { FileUpload } from '@/components/app/file-upload';
import { InlineEdit } from '@/components/app/inline-edit';
import { PageTabs } from '@/components/app/page-tabs';
import { DataTable, type DataColumn } from '@/components/app/data-table';
import { StatCardGrid } from '@/components/app/stat-card-grid';
import { Timeline, type TimelineEvent } from '@/components/app/timeline';
import { useToast } from '@/components/app/toast';
import { StockLevelBar, type StockLevel } from '@/components/fleet/stock-level-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CATEGORIES, LOCATIONS, ORDER_STATUSES, formatDate, formatMoney, getCustomer, getSupplier, onOrder, orderTotal, ordersForProduct, poTotal, relativeTime, totalStock, unitsSold, type Order, type PurchaseOrder } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarborRouter } from '../../../router-context';
import { useHarbor } from '../../../state';
import { StatusBadge, stockLimits, useStockAdjuster } from '../shared';

type Tab = 'overview' | 'stock' | 'orders' | 'supplier';

const statusLabel = (order: Order) => ORDER_STATUSES.find((status) => status.id === order.status)?.label ?? order.status;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right">{children}</span>
    </div>
  );
}

export function ProductDetail({ id }: { id: string }) {
  const { state, actions } = useHarbor();
  const { navigate } = useHarborRouter();
  const { toast } = useToast();
  const adjuster = useStockAdjuster();
  const [tab, setTab] = React.useState<Tab>('overview');

  const product = state.products.find((item) => item.id === id);
  if (!product) {
    return (
      <HarborPage title="Product not found" crumbs={[{ label: 'Products', path: '/products' }]}>
        <EmptyState title="No product with that id" description={`There is no product "${id}". It may have been removed, or the link is wrong.`} action={{ label: 'Back to products', onClick: () => navigate('/products') }} />
      </HarborPage>
    );
  }

  const supplier = getSupplier(product.supplierId);
  const orders = ordersForProduct(state.orders, product.id);
  const sold = unitsSold(state.orders, product.id);
  const warehouse = state.stock[product.id]?.warehouse ?? 0;
  const arriving = onOrder(state.purchaseOrders, product.id);
  const productOrders = state.purchaseOrders.filter((po) => po.lines.some((line) => line.productId === product.id));
  const low = warehouse <= product.reorderPoint && product.status !== 'retired';
  const marginPct = Math.round(((product.price - product.cost) / product.price) * 100);

  const levels: StockLevel[] = LOCATIONS.map((location) => {
    const limits = stockLimits(product, location.id);
    return { id: location.id, name: location.name, onHand: state.stock[product.id]?.[location.id] ?? 0, ...limits, onOrder: location.id === 'warehouse' && arriving ? arriving : undefined };
  });

  const activity: TimelineEvent[] = state.audit
    .filter((event) => event.subject.includes(product.name))
    .slice(0, 5)
    .map((event) => ({ id: event.id, title: `${event.actor} ${event.action}`, detail: event.subject, time: relativeTime(event.at), state: 'done' as const }));
  if (!activity.length) activity.push({ id: 'added', title: 'Added to the catalogue', detail: `${product.sku} · ${product.category}`, time: 'Earlier', state: 'done' });

  const orderColumns: DataColumn<Order>[] = [
    { id: 'number', header: 'Order', sortValue: (row) => row.number, cell: (row) => <span className="font-mono">{row.number}</span> },
    { id: 'customer', header: 'Customer', cell: (row) => getCustomer(row.customerId)?.name ?? '' },
    { id: 'qty', header: 'Qty', align: 'right', cell: (row) => <span className="font-mono tabular-nums">{row.items.filter((item) => item.productId === product.id).reduce((sum, item) => sum + item.qty, 0)}</span> },
    { id: 'total', header: 'Order total', align: 'right', hideBelow: 'sm', sortValue: orderTotal, cell: (row) => <span className="font-mono tabular-nums">{formatMoney(orderTotal(row), 'USD', 2)}</span> },
    { id: 'placed', header: 'Placed', hideBelow: 'md', sortValue: (row) => row.placedAt, cell: (row) => <span className="text-muted-foreground">{formatDate(row.placedAt)}</span> },
    { id: 'status', header: 'Status', cell: (row) => <Badge variant={row.status === 'cancelled' ? 'secondary' : 'outline'}>{statusLabel(row)}</Badge> },
  ];
  const poColumns: DataColumn<PurchaseOrder>[] = [
    { id: 'number', header: 'Order', cell: (row) => <span className="font-mono">{row.number}</span> },
    { id: 'qty', header: 'Qty', align: 'right', cell: (row) => <span className="font-mono tabular-nums">{row.lines.filter((line) => line.productId === product.id).reduce((sum, line) => sum + line.qty, 0)}</span> },
    { id: 'total', header: 'PO total', align: 'right', hideBelow: 'sm', cell: (row) => <span className="font-mono tabular-nums">{formatMoney(poTotal(row))}</span> },
    { id: 'expected', header: 'Expected', hideBelow: 'sm', cell: (row) => formatDate(row.expectedOn) },
    { id: 'status', header: 'Status', cell: (row) => <Badge variant="outline">{row.status.replace('-', ' ')}</Badge> },
  ];

  const reorder = () => {
    const poId = actions.createPurchaseOrder(product.supplierId, [{ productId: product.id, qty: product.reorderQty, unitCost: product.cost }]);
    toast({ title: `${poId.toUpperCase()} drafted`, description: `${product.reorderQty} × ${product.name} from ${supplier?.name}.`, variant: 'success', action: { label: 'Open', onClick: () => navigate('/purchasing') } });
  };

  return (
    <HarborPage
      title={product.name}
      description={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-mono">{product.sku}</span>
          <span>{product.category}</span>
          <StatusBadge status={product.status} />
        </span>
      }
      crumbs={[{ label: 'Products', path: '/products' }]}
      actions={
        <>
          <Button variant="outline" onClick={() => actions.updateProduct(product.id, { status: product.status === 'active' ? 'paused' : 'active' })} disabled={product.status === 'retired'}>
            {product.status === 'active' ? <PauseCircle /> : <PlayCircle />} {product.status === 'active' ? 'Pause' : 'Activate'}
          </Button>
          <Button onClick={reorder}>
            <ClipboardPlus /> Reorder {product.reorderQty}
          </Button>
        </>
      }
      tabs={
        <PageTabs
          activeId={tab}
          onChange={(next) => setTab(next.id as Tab)}
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'stock', label: 'Stock by location', count: totalStock(state.stock, product.id) },
            { id: 'orders', label: 'Orders', count: orders.length },
            { id: 'supplier', label: 'Supplier' },
          ]}
        />
      }
    >
      <StatCardGrid
        period="all time"
        stats={[
          { id: 'price', label: 'Price', value: formatMoney(product.price, 'USD', 2) },
          { id: 'margin', label: 'Margin', value: `${marginPct}%` },
          { id: 'sold', label: 'Units sold', value: String(sold) },
          { id: 'stock', label: low ? 'Warehouse (low)' : 'Warehouse', value: String(warehouse) },
        ]}
      />

      {tab === 'overview' ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <div className="grid min-w-0 gap-6">
            <Card className="gap-0 py-0">
              <div className="border-b px-4 py-3">
                <p className="text-sm font-bold">Details</p>
                <p className="text-xs text-muted-foreground">Click a value to edit it.</p>
              </div>
              <div className="divide-y px-4">
                <Field label="Name">
                  <InlineEdit value={product.name} onSave={(value) => actions.updateProduct(product.id, { name: String(value) })} validate={(value) => (String(value).trim() ? undefined : 'A product needs a name')} />
                </Field>
                <Field label="Category">
                  <InlineEdit type="select" value={product.category} options={CATEGORIES.map((category) => ({ value: category, label: category }))} onSave={(value) => actions.updateProduct(product.id, { category: value as typeof product.category })} />
                </Field>
                <Field label="Price">
                  <InlineEdit type="number" value={product.price} format={(value) => <span className="font-mono tabular-nums">{formatMoney(Number(value), 'USD', 2)}</span>} validate={(value) => (Number(value) > 0 ? undefined : 'Must be above zero')} onSave={(value) => actions.updateProduct(product.id, { price: Number(value) })} />
                </Field>
                <Field label="Cost">
                  <InlineEdit type="number" value={product.cost} format={(value) => <span className="font-mono tabular-nums">{formatMoney(Number(value), 'USD', 2)}</span>} validate={(value) => (Number(value) > 0 ? undefined : 'Must be above zero')} onSave={(value) => actions.updateProduct(product.id, { cost: Number(value) })} />
                </Field>
                <Field label="Reorder point">
                  <InlineEdit type="number" value={product.reorderPoint} format={(value) => <span className="font-mono tabular-nums">{value}</span>} validate={(value) => (Number(value) >= 0 ? undefined : 'Cannot be negative')} onSave={(value) => actions.updateProduct(product.id, { reorderPoint: Number(value) })} />
                </Field>
                <Field label="Order quantity">
                  <InlineEdit type="number" value={product.reorderQty} format={(value) => <span className="font-mono tabular-nums">{value}</span>} validate={(value) => (Number(value) > 0 ? undefined : 'Must be above zero')} onSave={(value) => actions.updateProduct(product.id, { reorderQty: Number(value) })} />
                </Field>
                <Field label="Weight">
                  <span className="font-mono tabular-nums">{product.weightKg} kg</span>
                </Field>
              </div>
              <p className="border-t px-4 py-3 text-sm text-muted-foreground">{product.description}</p>
            </Card>
            <div className="grid gap-2">
              <p className="text-sm font-bold">Photos</p>
              <FileUpload accept="image/*" multiple hint="PNG or JPG, up to 5 MB each" maxSizeMb={5} />
            </div>
          </div>
          <Card className="h-fit gap-0 py-0">
            <div className="border-b px-4 py-3">
              <p className="text-sm font-bold">Recent activity</p>
            </div>
            <div className="p-4">
              <Timeline events={activity} />
            </div>
          </Card>
        </div>
      ) : null}

      {tab === 'stock' ? (
        <div className="grid gap-3">
          <p className="text-sm text-muted-foreground">Tap a location to adjust its count. The dashed bar is stock already on order.</p>
          <StockLevelBar items={levels} onSelect={(item) => adjuster.open(product.id, item.id)} />
        </div>
      ) : null}

      {tab === 'orders' ? (
        <DataTable
          rows={orders}
          columns={orderColumns}
          getRowId={(row) => row.id}
          defaultSort={{ id: 'placed', dir: 'desc' }}
          pageSize={8}
          onRowClick={(row) => navigate(`/orders/${row.id}`)}
          emptyTitle="Not ordered yet"
          emptyDescription="No customer has bought this product."
        />
      ) : null}

      {tab === 'supplier' ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <Card className="h-fit gap-0 py-0">
            <div className="border-b px-4 py-3">
              <p className="text-sm font-bold">{supplier?.name}</p>
              <p className="text-xs text-muted-foreground">{supplier?.contact} · {supplier?.email}</p>
            </div>
            <div className="divide-y px-4">
              <Field label="Lead time"><span className="font-mono tabular-nums">{supplier?.leadDays} days</span></Field>
              <Field label="On time"><span className="font-mono tabular-nums">{supplier?.onTimePercent}%</span></Field>
              <Field label="Payment terms">{supplier?.paymentTerms}</Field>
              <Field label="Unit cost"><span className="font-mono tabular-nums">{formatMoney(product.cost, 'USD', 2)}</span></Field>
            </div>
          </Card>
          <div className="grid min-w-0 gap-3">
            <p className="text-sm font-bold">Purchase orders with this product</p>
            <DataTable rows={productOrders} columns={poColumns} getRowId={(row) => row.id} pageSize={5} pageSizes={[5]} onRowClick={() => navigate('/purchasing')} emptyTitle="Nothing on order" emptyDescription={`Use Reorder ${product.reorderQty} to draft an order.`} />
          </div>
        </div>
      ) : null}

      {adjuster.dialog}
    </HarborPage>
  );
}
