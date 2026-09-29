import * as React from 'react';
import { PageHeader } from '@/components/app/page-header';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PartDetailPanel } from '@/components/fleet/part-detail-panel';
import { PartsInventoryTable, type Part } from '@/components/fleet/parts-inventory-table';
import { PartsUsageChart } from '@/components/fleet/parts-usage-chart';
import { PurchaseOrderCard, type POLine, type POStatus } from '@/components/fleet/purchase-order-card';
import { ReorderSuggestions } from '@/components/fleet/reorder-suggestions';
import { StockLevelBar } from '@/components/fleet/stock-level-bar';
import { PART_DETAIL, PARTS, PO_LINES, REORDER, STOCK_LEVELS, USAGE_DATA, USAGE_SERIES } from '../data';
import { GarageShell, PageBody } from '../shell';
import type { PageContext } from '../context';

interface DemoOrder {
  id: string;
  supplier: string;
  status: POStatus;
  eta: string;
  lines: POLine[];
}

const START_ORDERS: DemoOrder[] = [
  { id: 'PO-1184', supplier: 'Northline Parts', status: 'partial', eta: '2026-10-02', lines: PO_LINES },
  { id: 'PO-1189', supplier: 'VoltCo', status: 'sent', eta: '2026-10-05', lines: [{ sku: 'BAT-H8-95', name: 'Battery H8 95 Ah', qty: 2, received: 0, unitCost: 168 }] },
];

export function InventoryPage(ctx: PageContext) {
  const [tab, setTab] = React.useState('stock');
  const [orders, setOrders] = React.useState(START_ORDERS);
  const [part, setPart] = React.useState<Part | null>(null);

  return (
    <GarageShell activeId="inventory" ctx={ctx}>
      <PageBody>
        <PageHeader
          title="Inventory"
          description="Parts on the shelf, what is running low, and what is on its way."
          actions={
            <Button size="sm" onClick={() => setTab('orders')}>
              Purchase orders
            </Button>
          }
        />
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="orders">Orders {orders.length}</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="stock" className="flex flex-col gap-6">
            <PartsInventoryTable parts={PARTS} onSelect={setPart} />
            <div className="grid items-start gap-6 xl:grid-cols-2">
              <StockLevelBar items={STOCK_LEVELS} />
              <ReorderSuggestions
                suggestions={REORDER}
                onCreateOrders={(bySupplier) => {
                  setOrders((current) => [
                    ...Object.entries(bySupplier).map(([supplier, lines], index) => ({
                      id: `PO-${1190 + current.length + index}`,
                      supplier,
                      status: 'sent' as const,
                      eta: '2026-10-07',
                      lines: lines.map((line) => {
                        const known = REORDER.find((item) => item.sku === line.sku);
                        return { sku: line.sku, name: known?.name ?? line.sku, qty: line.qty, received: 0, unitCost: known?.unitCost ?? 0 };
                      }),
                    })),
                    ...current,
                  ]);
                  setTab('orders');
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="grid items-start gap-6 lg:grid-cols-2">
              {orders.map((order) => (
                <PurchaseOrderCard key={order.id} id={order.id} supplier={order.supplier} status={order.status} eta={order.eta} lines={order.lines} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="usage">
            <PartsUsageChart data={USAGE_DATA} series={USAGE_SERIES} unit="units" />
          </TabsContent>
        </Tabs>

        <Sheet open={Boolean(part)} onOpenChange={(next) => !next && setPart(null)}>
          <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>{part?.name}</SheetTitle>
              <SheetDescription>
                {part?.sku} · bin {part?.bin}
              </SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-4">{part ? <PartDetailPanel part={{ ...PART_DETAIL, sku: part.sku, name: part.name, category: part.category }} /> : null}</div>
          </SheetContent>
        </Sheet>
      </PageBody>
    </GarageShell>
  );
}
