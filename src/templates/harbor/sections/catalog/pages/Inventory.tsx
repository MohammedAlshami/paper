import * as React from 'react';
import { ClipboardList } from 'lucide-react';
import { PageTabs } from '@/components/app/page-tabs';
import { StatCardGrid } from '@/components/app/stat-card-grid';
import { PartsInventoryTable, type Part } from '@/components/fleet/parts-inventory-table';
import { StockLevelBar, type StockLevel } from '@/components/fleet/stock-level-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LOCATIONS, WAREHOUSE, formatMoney, lowStockProducts, onOrder, totalStock, type Product } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarborRouter } from '../../../router-context';
import { useHarbor } from '../../../state';
import { locationName, stockLimits, useStockAdjuster } from '../shared';

const ALL = 'all';

export function Inventory() {
  const { state } = useHarbor();
  const { navigate } = useHarborRouter();
  const adjuster = useStockAdjuster();
  const [place, setPlace] = React.useState<string>(ALL);

  const active = state.products.filter((product) => product.status !== 'retired');
  const qtyAt = (product: Product, locationId: string) => (locationId === ALL ? totalStock(state.stock, product.id) : (state.stock[product.id]?.[locationId] ?? 0));
  const lowAt = (locationId: string) => active.filter((product) => qtyAt(product, locationId) <= (locationId === ALL ? product.reorderPoint : stockLimits(product, locationId).min)).length;

  const parts: Part[] = active.map((product) => ({
    sku: product.sku,
    name: product.name,
    category: product.category,
    bin: place === ALL ? 'All sites' : locationName(place),
    onHand: qtyAt(product, place),
    min: place === ALL ? product.reorderPoint : stockLimits(product, place).min,
    unitCost: product.cost,
    supplier: product.supplierId,
  }));

  const units = parts.reduce((sum, part) => sum + part.onHand, 0);
  const value = parts.reduce((sum, part) => sum + part.onHand * part.unitCost, 0);
  const lowCount = parts.filter((part) => part.onHand <= part.min).length;
  const arriving = state.purchaseOrders.filter((po) => po.status !== 'received').reduce((sum, po) => sum + po.lines.reduce((s, line) => s + (line.qty - line.received), 0), 0);

  const watch: StockLevel[] = lowStockProducts(state.stock)
    .slice(0, 6)
    .map((product) => ({ id: product.id, name: product.name, onHand: state.stock[product.id]?.warehouse ?? 0, ...stockLimits(product, WAREHOUSE.id), onOrder: onOrder(state.purchaseOrders, product.id) || undefined }));

  const bySku = (sku: string) => state.products.find((product) => product.sku === sku);

  return (
    <HarborPage
      title="Inventory"
      description="What is on the shelf at each store and in the warehouse. Click a row to correct a count."
      actions={
        <Button variant="outline" onClick={() => navigate('/purchasing')}>
          <ClipboardList /> Purchasing
        </Button>
      }
      tabs={
        <PageTabs
          activeId={place}
          onChange={(tab) => setPlace(tab.id)}
          tabs={[{ id: ALL, label: 'All locations', count: lowAt(ALL) }, ...LOCATIONS.map((location) => ({ id: location.id, label: location.name, count: lowAt(location.id) }))]}
        />
      }
    >
      <StatCardGrid
        period={place === ALL ? 'across all sites' : `at ${locationName(place)}`}
        stats={[
          { id: 'units', label: 'Units on hand', value: units.toLocaleString('en-US') },
          { id: 'value', label: 'Stock value at cost', value: formatMoney(value) },
          { id: 'low', label: 'At or below reorder point', value: String(lowCount) },
          { id: 'arriving', label: 'Units on order', value: String(arriving) },
        ]}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <PartsInventoryTable
          className="min-w-0"
          parts={parts}
          onSelect={(part) => {
            const product = bySku(part.sku);
            if (product) adjuster.open(product.id, place === ALL ? WAREHOUSE.id : place);
          }}
        />
        <div className="grid min-w-0 gap-3">
          <div>
            <p className="text-sm font-bold">Warehouse watch list</p>
            <p className="text-xs text-muted-foreground">Low products, with what is already on order.</p>
          </div>
          {watch.length ? (
            <StockLevelBar items={watch} onSelect={(item) => adjuster.open(item.id, WAREHOUSE.id)} />
          ) : (
            <Card className="p-6 text-sm text-muted-foreground">Everything in the warehouse is above its reorder point.</Card>
          )}
        </div>
      </div>
      {adjuster.dialog}
    </HarborPage>
  );
}
