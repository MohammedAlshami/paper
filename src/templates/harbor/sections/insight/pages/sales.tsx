import * as React from 'react';
import { CircleDollarSign, ReceiptText, ShoppingBag, Undo2 } from 'lucide-react';
import { DataTable, type DataColumn } from '@/components/app/data-table';
import { DateRangePicker, type DateRange } from '@/components/app/date-range-picker';
import { RevenueChart } from '@/components/app/revenue-chart';
import { ShareBarList } from '@/components/app/share-bar-list';
import { StatCardGrid, type Stat } from '@/components/app/stat-card-grid';
import { HeatmapCard, type HeatPoint } from '@/components/maps/heatmap-card';
import { Badge } from '@/components/ui/badge';
import { CUSTOMERS, PRODUCTS, SALES_BY_LOCATION, SALES_DAILY, TODAY, addDays, daysBetween, formatMoney, getLocation, orderTotal, type Order } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarborRouter } from '../../../router-context';
import { useHarbor } from '../../../state';

interface ProductRow {
  id: string;
  name: string;
  sku: string;
  category: string;
  units: number;
  revenue: number;
}

const columns: DataColumn<ProductRow>[] = [
  {
    id: 'name',
    header: 'Product',
    sortValue: (row) => row.name,
    cell: (row) => (
      <span className="flex flex-col">
        <span className="font-medium">{row.name}</span>
        <span className="font-mono text-xs text-muted-foreground">{row.sku}</span>
      </span>
    ),
  },
  { id: 'category', header: 'Category', hideBelow: 'sm', sortValue: (row) => row.category, cell: (row) => <Badge variant="outline">{row.category}</Badge> },
  { id: 'units', header: 'Units', align: 'right', sortValue: (row) => row.units, cell: (row) => <span className="font-mono tabular-nums">{row.units}</span> },
  { id: 'revenue', header: 'Revenue', align: 'right', sortValue: (row) => row.revenue, cell: (row) => <span className="font-mono tabular-nums">{formatMoney(row.revenue)}</span> },
];

const inRange = (order: Order, from: string, to: string) => order.status !== 'cancelled' && order.placedAt.slice(0, 10) >= from && order.placedAt.slice(0, 10) <= to;

/** Revenue by day for all channels, orders and products from the online orders in the range. */
export function SalesPage() {
  const { state } = useHarbor();
  const { navigate } = useHarborRouter();
  const [range, setRange] = React.useState<DateRange>({ from: addDays(TODAY, -29), to: TODAY });

  const from = range.from ?? addDays(TODAY, -29);
  const to = range.to ?? from;
  const days = daysBetween(from, to) + 1;
  const prevFrom = addDays(from, -days);
  const prevTo = addDays(from, -1);

  const view = React.useMemo(() => {
    const sumDaily = (a: string, b: string) => SALES_DAILY.filter((point) => point.date >= a && point.date <= b).reduce((sum, point) => sum + point.value, 0);
    const revenue = sumDaily(from, to);
    const prevRevenue = sumDaily(prevFrom, prevTo);
    const orders = state.orders.filter((order) => inRange(order, from, to));
    const prevOrders = state.orders.filter((order) => inRange(order, prevFrom, prevTo));
    const aov = orders.length ? orders.reduce((sum, order) => sum + orderTotal(order), 0) / orders.length : 0;
    const prevAov = prevOrders.length ? prevOrders.reduce((sum, order) => sum + orderTotal(order), 0) / prevOrders.length : 0;
    const orderIds = new Set(orders.map((order) => order.id));
    const returned = state.returns.filter((item) => orderIds.has(item.orderId)).length;
    const dailyRevenue = SALES_DAILY.filter((point) => point.date >= from && point.date <= to).map((point) => point.value);
    const dailyOrders = Array.from({ length: Math.min(days, 30) }, (_, i) => {
      const day = addDays(to, -(Math.min(days, 30) - 1 - i));
      return orders.filter((order) => order.placedAt.slice(0, 10) === day).length;
    });
    const change = (now: number, before: number) => (before > 0 ? ((now - before) / before) * 100 : undefined);

    const stats: Stat[] = [
      { id: 'revenue', label: 'Revenue, all channels', value: formatMoney(revenue), icon: CircleDollarSign, delta: change(revenue, prevRevenue), goodWhen: 'up', trend: dailyRevenue.slice(-14) },
      { id: 'orders', label: 'Online orders', value: String(orders.length), icon: ShoppingBag, delta: change(orders.length, prevOrders.length), goodWhen: 'up', trend: dailyOrders.slice(-14) },
      { id: 'aov', label: 'Average online order', value: formatMoney(aov, 'USD', 2), icon: ReceiptText, delta: change(aov, prevAov), goodWhen: 'up' },
      { id: 'returns', label: 'Return rate', value: `${orders.length ? ((returned / orders.length) * 100).toFixed(1) : '0.0'}%`, icon: Undo2, goodWhen: 'down' },
    ];

    const byProduct = new Map<string, ProductRow>();
    orders.forEach((order) =>
      order.items.forEach((item) => {
        const product = PRODUCTS.find((entry) => entry.id === item.productId);
        if (!product) return;
        const current = byProduct.get(product.id) ?? { id: product.id, name: product.name, sku: product.sku, category: product.category, units: 0, revenue: 0 };
        current.units += item.qty;
        current.revenue += item.qty * item.price;
        byProduct.set(product.id, current);
      }),
    );

    const points: HeatPoint[] = orders.flatMap((order) => {
      const customer = CUSTOMERS.find((entry) => entry.id === order.customerId);
      return customer ? [{ position: customer.position, hour: new Date(order.placedAt).getUTCHours(), weight: 1 }] : [];
    });

    const shares = SALES_BY_LOCATION.map((entry) => ({ id: entry.locationId, label: getLocation(entry.locationId)?.name ?? entry.locationId, value: Math.round(revenue * entry.share), detail: getLocation(entry.locationId)?.kind === 'warehouse' ? 'Online, shipped from here' : 'In store and pickup' }));
    return { stats, products: [...byProduct.values()], points, shares, orderCount: orders.length };
  }, [state.orders, state.returns, from, to, prevFrom, prevTo, days]);

  return (
    <HarborPage
      title="Sales"
      description="Revenue for every channel. Orders and products follow the date range."
      actions={<DateRangePicker value={range} onChange={setRange} today={TODAY} />}
    >
      <StatCardGrid stats={view.stats} period="vs the period before" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <RevenueChart data={SALES_DAILY} title="Revenue, all channels" defaultRange="30d" className="min-w-0" />
        <ShareBarList className="min-w-0" title="Revenue by location" description={`${days} days`} items={view.shares} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-3">
          <h2 className="text-sm font-bold">Top products</h2>
          <DataTable
            rows={view.products}
            columns={columns}
            getRowId={(row) => row.id}
            searchText={(row) => `${row.name} ${row.sku}`}
            searchPlaceholder="Search products"
            defaultSort={{ id: 'revenue', dir: 'desc' }}
            pageSize={8}
            pageSizes={[8, 20]}
            onRowClick={(row) => navigate(`/products/${row.id}`)}
            emptyTitle="No orders in this range"
            emptyDescription="Pick a wider date range."
          />
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <h2 className="text-sm font-bold">Where orders go</h2>
          <HeatmapCard points={view.points} title="Order density" unit="orders" className="min-w-0" />
        </div>
      </div>
    </HarborPage>
  );
}
