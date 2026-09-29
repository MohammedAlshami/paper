import * as React from 'react';
import { Download, PauseCircle, PlayCircle, Trash2, Upload } from 'lucide-react';
import { BulkActionBar } from '@/components/app/bulk-action-bar';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { DataTable, type DataColumn } from '@/components/app/data-table';
import { FileUpload } from '@/components/app/file-upload';
import { FilterBar } from '@/components/app/filter-bar';
import { MultiSelect } from '@/components/app/multi-select';
import { RecordDetailSheet } from '@/components/app/record-detail-sheet';
import { useToast } from '@/components/app/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CATEGORIES, SUPPLIERS, formatMoney, getSupplier, totalStock, warehouseStock, type Product } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarborRouter } from '../../../router-context';
import { useHarbor } from '../../../state';
import { ProductTile, StatusBadge, locationName } from '../shared';

const margin = (product: Product) => Math.round(((product.price - product.cost) / product.price) * 100);

export function Products() {
  const { state, actions } = useHarbor();
  const { navigate, href } = useHarborRouter();
  const { toast } = useToast();

  const [view, setView] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [supplier, setSupplier] = React.useState<string | undefined>();
  const [categories, setCategories] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState<Product[]>([]);
  const [tableKey, setTableKey] = React.useState(0);
  const [quick, setQuick] = React.useState<Product | null>(null);
  const [importing, setImporting] = React.useState(false);
  const [retiring, setRetiring] = React.useState(false);

  const counts = (status: Product['status']) => state.products.filter((product) => product.status === status).length;
  const rows = state.products.filter(
    (product) =>
      (view === 'all' || product.status === view) &&
      (!supplier || product.supplierId === supplier) &&
      (!categories.length || categories.includes(product.category)) &&
      (!search.trim() || `${product.name} ${product.sku}`.toLowerCase().includes(search.trim().toLowerCase())),
  );
  const clearSelection = () => {
    setSelected([]);
    setTableKey((key) => key + 1);
  };
  const setStatus = (products: Product[], status: Product['status']) => {
    products.forEach((product) => actions.updateProduct(product.id, { status }));
    toast({ title: `${products.length} product${products.length === 1 ? '' : 's'} ${status === 'active' ? 'activated' : status}`, variant: 'success' });
    clearSelection();
  };

  const columns: DataColumn<Product>[] = [
    {
      id: 'name',
      header: 'Product',
      sortValue: (row) => row.name,
      cell: (row) => (
        <span className="flex min-w-0 items-center gap-3">
          <ProductTile name={row.name} />
          <span className="min-w-0">
            <span className="block truncate font-medium">{row.name}</span>
            <span className="block font-mono text-xs text-muted-foreground">{row.sku}</span>
          </span>
        </span>
      ),
    },
    { id: 'category', header: 'Category', hideBelow: 'md', sortValue: (row) => row.category, cell: (row) => <Badge variant="outline">{row.category}</Badge> },
    { id: 'price', header: 'Price', align: 'right', sortValue: (row) => row.price, cell: (row) => <span className="font-mono tabular-nums">{formatMoney(row.price, 'USD', 2)}</span> },
    { id: 'margin', header: 'Margin', align: 'right', hideBelow: 'lg', sortValue: margin, cell: (row) => <span className="font-mono tabular-nums text-muted-foreground">{margin(row)}%</span> },
    {
      id: 'stock',
      header: 'In stock',
      align: 'right',
      hideBelow: 'sm',
      sortValue: (row) => totalStock(state.stock, row.id),
      cell: (row) => {
        const low = warehouseStock(state.stock, row.id) <= row.reorderPoint && row.status !== 'retired';
        return <span className="font-mono tabular-nums" style={low ? { color: '#ec4899', fontWeight: 600 } : undefined}>{totalStock(state.stock, row.id)}</span>;
      },
    },
    { id: 'status', header: 'Status', hideBelow: 'sm', sortValue: (row) => row.status, cell: (row) => <StatusBadge status={row.status} /> },
  ];

  const quickSupplier = quick ? getSupplier(quick.supplierId) : undefined;

  return (
    <HarborPage
      title="Products"
      description={`${state.products.length} products across ${CATEGORIES.length} categories. Click a row for a quick look.`}
      actions={
        <>
          <Button variant="outline" onClick={() => toast({ title: 'Export started', description: `${rows.length} products as CSV.` })}>
            <Download /> Export
          </Button>
          <Button onClick={() => setImporting(true)}>
            <Upload /> Import
          </Button>
        </>
      }
    >
      <FilterBar
        views={[
          { id: 'all', label: 'All', count: state.products.length },
          { id: 'active', label: 'Active', count: counts('active') },
          { id: 'paused', label: 'Paused', count: counts('paused') },
          { id: 'retired', label: 'Retired', count: counts('retired') },
        ]}
        activeView={view}
        onViewChange={setView}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or SKU"
        filters={[{ id: 'supplier', label: 'Supplier', options: SUPPLIERS.map((item) => ({ value: item.id, label: item.name })) }]}
        values={{ supplier }}
        onFilterChange={(_, value) => setSupplier(value)}
        onClear={() => {
          setSearch('');
          setSupplier(undefined);
          setCategories([]);
        }}
        trailing={<MultiSelect options={CATEGORIES.map((category) => ({ value: category, label: category }))} value={categories} onChange={setCategories} placeholder="All categories" maxChips={2} className="w-full sm:w-64" />}
      />

      <DataTable
        key={tableKey}
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        defaultSort={{ id: 'name', dir: 'asc' }}
        pageSize={10}
        pageSizes={[10, 20, 40]}
        selectable
        onSelectionChange={setSelected}
        onRowClick={setQuick}
        emptyTitle="No products match"
        emptyDescription="Try a different view, or clear the filters."
      />

      <BulkActionBar
        count={selected.length}
        noun="product"
        onClear={clearSelection}
        actions={[
          { id: 'activate', label: 'Activate', icon: PlayCircle, onSelect: () => setStatus(selected, 'active') },
          { id: 'pause', label: 'Pause', icon: PauseCircle, onSelect: () => setStatus(selected, 'paused') },
          { id: 'export', label: 'Export', icon: Download, onSelect: () => toast({ title: `Exporting ${selected.length} products` }) },
          { id: 'retire', label: 'Retire', icon: Trash2, destructive: true, onSelect: () => setRetiring(true) },
        ]}
      />

      <ConfirmDialog
        open={retiring}
        onOpenChange={setRetiring}
        title={`Retire ${selected.length} product${selected.length === 1 ? '' : 's'}?`}
        description="They stop showing in the shop and in reorder suggestions. Existing orders are not affected, and you can activate them again."
        confirmLabel="Retire"
        destructive
        onConfirm={() => setStatus(selected, 'retired')}
      />

      <RecordDetailSheet
        open={Boolean(quick)}
        onOpenChange={(open) => !open && setQuick(null)}
        title={quick?.name ?? ''}
        subtitle={quick ? `${quick.sku} · ${quick.category}` : undefined}
        status={quick ? { label: quick.status === 'active' ? 'Active' : quick.status === 'paused' ? 'Paused' : 'Retired', tone: quick.status === 'active' ? 'default' : 'muted' } : undefined}
        fields={
          quick
            ? [
                { label: 'Price', value: formatMoney(quick.price, 'USD', 2), mono: true },
                { label: 'Cost', value: formatMoney(quick.cost, 'USD', 2), mono: true },
                { label: 'Margin', value: `${margin(quick)}%`, mono: true },
                { label: 'Supplier', value: quickSupplier?.name ?? '' },
                { label: 'Lead time', value: `${quickSupplier?.leadDays ?? 0} days` },
                { label: 'Reorder at', value: `${quick.reorderPoint} (order ${quick.reorderQty})`, mono: true },
              ]
            : []
        }
        tabs={
          quick
            ? [
                {
                  id: 'stock',
                  label: 'Stock',
                  content: (
                    <ul className="divide-y">
                      {Object.entries(state.stock[quick.id] ?? {}).map(([locationId, qty]) => (
                        <li key={locationId} className="flex items-center justify-between py-2.5 text-sm">
                          <span>{locationName(locationId)}</span>
                          <span className="font-mono tabular-nums">{qty}</span>
                        </li>
                      ))}
                    </ul>
                  ),
                },
                { id: 'about', label: 'About', content: <p className="text-sm text-muted-foreground">{quick.description}</p> },
              ]
            : []
        }
        actions={
          quick ? (
            <Button asChild size="sm">
              <a href={href(`/products/${quick.id}`)} onClick={(event) => { event.preventDefault(); navigate(`/products/${quick.id}`); }}>
                Open product
              </a>
            </Button>
          ) : null
        }
      />

      <Dialog open={importing} onOpenChange={setImporting}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Import products</DialogTitle>
            <DialogDescription>Upload a CSV with name, SKU, category, price, cost and supplier. New SKUs are added; existing ones are updated.</DialogDescription>
          </DialogHeader>
          <FileUpload accept=".csv" hint="CSV up to 5 MB" maxSizeMb={5} multiple={false} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setImporting(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setImporting(false);
                toast({ title: 'Import queued', description: 'You will get an inbox alert when it finishes.', variant: 'success' });
              }}
            >
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HarborPage>
  );
}
