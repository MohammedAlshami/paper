import * as React from 'react';
import { ClipboardPlus, Star } from 'lucide-react';
import { DataTable, type DataColumn } from '@/components/app/data-table';
import { RecordDetailSheet } from '@/components/app/record-detail-sheet';
import { StatCardGrid } from '@/components/app/stat-card-grid';
import { useToast } from '@/components/app/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SUPPLIERS, formatDate, formatMoney, lowStockProducts, onOrder, poTotal, type Supplier } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarborRouter } from '../../../router-context';
import { useHarbor } from '../../../state';
import { ProductTile } from '../shared';

export function Suppliers() {
  const { state, actions } = useHarbor();
  const { navigate, href } = useHarborRouter();
  const { toast } = useToast();
  const [picked, setPicked] = React.useState<Supplier | null>(null);
  const rows = SUPPLIERS;
  const openOrders = (supplierId: string) => state.purchaseOrders.filter((po) => po.supplierId === supplierId && po.status !== 'received');
  const totalSpend = rows.reduce((sum, supplier) => sum + supplier.spendYtd, 0);

  const columns: DataColumn<Supplier>[] = [
    {
      id: 'name',
      header: 'Supplier',
      sortValue: (row) => row.name,
      cell: (row) => (
        <span className="min-w-0">
          <span className="block truncate font-medium">{row.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{row.contact}</span>
        </span>
      ),
    },
    { id: 'categories', header: 'Supplies', hideBelow: 'md', cell: (row) => <span className="flex flex-wrap gap-1">{row.categories.map((category) => <Badge key={category} variant="outline">{category}</Badge>)}</span> },
    { id: 'lead', header: 'Lead time', align: 'right', hideBelow: 'sm', sortValue: (row) => row.leadDays, cell: (row) => <span className="font-mono tabular-nums">{row.leadDays} days</span> },
    { id: 'ontime', header: 'On time', align: 'right', sortValue: (row) => row.onTimePercent, cell: (row) => <span className="font-mono tabular-nums" style={row.onTimePercent < 85 ? { color: '#ec4899', fontWeight: 600 } : undefined}>{row.onTimePercent}%</span> },
    { id: 'rating', header: 'Rating', align: 'right', hideBelow: 'lg', sortValue: (row) => row.rating, cell: (row) => <span className="inline-flex items-center gap-1 font-mono tabular-nums"><Star className="size-3.5" />{row.rating.toFixed(1)}</span> },
    { id: 'spend', header: 'Spend YTD', align: 'right', sortValue: (row) => row.spendYtd, cell: (row) => <span className="font-mono tabular-nums">{formatMoney(row.spendYtd)}</span> },
    { id: 'open', header: 'Open POs', align: 'right', hideBelow: 'md', sortValue: (row) => openOrders(row.id).length, cell: (row) => <span className="font-mono tabular-nums">{openOrders(row.id).length}</span> },
  ];

  const supplied = picked ? state.products.filter((product) => product.supplierId === picked.id) : [];
  const orders = picked ? state.purchaseOrders.filter((po) => po.supplierId === picked.id) : [];

  const draftReorder = (supplier: Supplier) => {
    const low = lowStockProducts(state.stock).filter((product) => product.supplierId === supplier.id && !onOrder(state.purchaseOrders, product.id));
    if (!low.length) {
      toast({ title: 'Nothing to reorder', description: `No ${supplier.name} products are low right now.` });
      return;
    }
    const id = actions.createPurchaseOrder(supplier.id, low.map((product) => ({ productId: product.id, qty: product.reorderQty, unitCost: product.cost })));
    setPicked(null);
    toast({ title: `${id.toUpperCase()} drafted`, description: `${low.length} product${low.length === 1 ? '' : 's'} from ${supplier.name}.`, variant: 'success', action: { label: 'Open', onClick: () => navigate('/purchasing') } });
  };

  return (
    <HarborPage title="Suppliers" description={`${rows.length} suppliers. Click one to see what they supply and how their orders are going.`}>
      <StatCardGrid
        period="year to date"
        stats={[
          { id: 'count', label: 'Suppliers', value: String(rows.length) },
          { id: 'spend', label: 'Spend', value: formatMoney(totalSpend) },
          { id: 'ontime', label: 'Average on time', value: `${Math.round(rows.reduce((sum, item) => sum + item.onTimePercent, 0) / rows.length)}%` },
          { id: 'lead', label: 'Average lead time', value: `${(rows.reduce((sum, item) => sum + item.leadDays, 0) / rows.length).toFixed(1)} days` },
        ]}
      />
      <DataTable rows={rows} columns={columns} getRowId={(row) => row.id} searchText={(row) => `${row.name} ${row.contact} ${row.categories.join(' ')}`} searchPlaceholder="Search suppliers" defaultSort={{ id: 'spend', dir: 'desc' }} onRowClick={setPicked} pageSize={8} />

      <RecordDetailSheet
        open={Boolean(picked)}
        onOpenChange={(open) => !open && setPicked(null)}
        title={picked?.name ?? ''}
        subtitle={picked ? `${picked.contact} · ${picked.email}` : undefined}
        status={picked ? { label: `${picked.onTimePercent}% on time`, tone: picked.onTimePercent < 85 ? 'accent' : 'default' } : undefined}
        fields={
          picked
            ? [
                { label: 'Lead time', value: `${picked.leadDays} days`, mono: true },
                { label: 'Payment terms', value: picked.paymentTerms },
                { label: 'Rating', value: `${picked.rating.toFixed(1)} of 5`, mono: true },
                { label: 'Spend this year', value: formatMoney(picked.spendYtd), mono: true },
                { label: 'Products', value: String(supplied.length), mono: true },
              ]
            : []
        }
        tabs={
          picked
            ? [
                {
                  id: 'products',
                  label: 'Products',
                  content: (
                    <ul className="divide-y">
                      {supplied.map((product) => (
                        <li key={product.id}>
                          <a href={href(`/products/${product.id}`)} onClick={(event) => { event.preventDefault(); navigate(`/products/${product.id}`); }} className="flex items-center gap-3 py-2.5 text-sm no-underline">
                            <ProductTile name={product.name} />
                            <span className="min-w-0 flex-1 truncate">{product.name}</span>
                            <span className="font-mono tabular-nums text-muted-foreground">{formatMoney(product.cost, 'USD', 2)}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: 'orders',
                  label: 'Orders',
                  content: orders.length ? (
                    <ul className="divide-y">
                      {orders.map((po) => (
                        <li key={po.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                          <span>
                            <span className="font-mono">{po.number}</span>
                            <span className="block text-xs text-muted-foreground">Expected {formatDate(po.expectedOn)}</span>
                          </span>
                          <span className="text-right">
                            <span className="block font-mono tabular-nums">{formatMoney(poTotal(po))}</span>
                            <Badge variant="outline">{po.status.replace('-', ' ')}</Badge>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="py-6 text-sm text-muted-foreground">No purchase orders yet.</p>
                  ),
                },
              ]
            : []
        }
        actions={
          picked ? (
            <Button size="sm" onClick={() => draftReorder(picked)}>
              <ClipboardPlus /> Reorder low stock
            </Button>
          ) : null
        }
      />
    </HarborPage>
  );
}
