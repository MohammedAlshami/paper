import * as React from 'react';
import { CircleCheck, Send } from 'lucide-react';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { EmptyState } from '@/components/app/empty-state';
import { PageTabs } from '@/components/app/page-tabs';
import { useToast } from '@/components/app/toast';
import { PurchaseOrderCard, type POStatus } from '@/components/fleet/purchase-order-card';
import { ReorderSuggestions, type ReorderSuggestion } from '@/components/fleet/reorder-suggestions';
import { Button } from '@/components/ui/button';
import { PO_STATUSES, SUPPLIERS, getProduct, getSupplier, lowStockProducts, onOrder, poTotal, formatMoney, type PurchaseOrder, type PurchaseOrderStatus } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarbor } from '../../../state';

const cardStatus = (status: PurchaseOrderStatus): POStatus => (status === 'part-received' ? 'partial' : status);

export function Purchasing() {
  const { state, actions } = useHarbor();
  const { toast } = useToast();
  const [tab, setTab] = React.useState<'all' | PurchaseOrderStatus>('all');
  const [sending, setSending] = React.useState<PurchaseOrder | null>(null);

  // Low in the warehouse, and nothing already on its way to cover it.
  const suggestions: ReorderSuggestion[] = lowStockProducts(state.stock)
    .filter((product) => !onOrder(state.purchaseOrders, product.id))
    .map((product) => ({
      sku: product.sku,
      name: product.name,
      onHand: state.stock[product.id]?.warehouse ?? 0,
      min: product.reorderPoint,
      suggestedQty: product.reorderQty,
      supplier: getSupplier(product.supplierId)?.name ?? '',
      leadTimeDays: getSupplier(product.supplierId)?.leadDays ?? 7,
      unitCost: product.cost,
    }));

  const orders = state.purchaseOrders.filter((po) => tab === 'all' || po.status === tab);
  const open = state.purchaseOrders.filter((po) => po.status !== 'received');
  const openValue = open.reduce((sum, po) => sum + poTotal(po), 0);

  const createOrders = (bySupplier: Record<string, { sku: string; qty: number; supplier: string }[]>) => {
    const created = Object.entries(bySupplier).map(([name, lines]) => {
      const supplier = SUPPLIERS.find((item) => item.name === name);
      if (!supplier) return null;
      return actions.createPurchaseOrder(
        supplier.id,
        lines.flatMap((line) => {
          const product = state.products.find((item) => item.sku === line.sku);
          return product ? [{ productId: product.id, qty: line.qty, unitCost: product.cost }] : [];
        }),
      );
    });
    const made = created.filter(Boolean).length;
    toast({ title: `${made} draft order${made === 1 ? '' : 's'} created`, description: 'One per supplier. Send them when you are ready.', variant: 'success' });
    setTab('draft');
  };

  return (
    <HarborPage
      title="Purchasing"
      description={`${open.length} open orders worth ${formatMoney(openValue)}. Reorder what is running low, then book deliveries in as they arrive.`}
      tabs={
        <PageTabs
          activeId={tab}
          onChange={(next) => setTab(next.id as typeof tab)}
          tabs={[{ id: 'all', label: 'All orders', count: state.purchaseOrders.length }, ...PO_STATUSES.map((status) => ({ id: status.id, label: status.label, count: state.purchaseOrders.filter((po) => po.status === status.id).length }))]}
        />
      }
    >
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="grid min-w-0 gap-3">
          {suggestions.length ? (
            <ReorderSuggestions key={suggestions.map((item) => item.sku).join(',')} suggestions={suggestions} onCreateOrders={createOrders} />
          ) : (
            <EmptyState icon={CircleCheck} title="Nothing to reorder" description="Every warehouse product is above its reorder point, or already on order." />
          )}
        </div>

        <div className="min-w-0">
          {orders.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {orders.map((po) => (
                <div key={`${po.id}-${po.status}-${po.lines.reduce((sum, line) => sum + line.received, 0)}`} className="grid content-start gap-2">
                  <PurchaseOrderCard
                    id={po.number}
                    supplier={getSupplier(po.supplierId)?.name ?? ''}
                    status={cardStatus(po.status)}
                    eta={po.expectedOn}
                    lines={po.lines.map((line) => ({ sku: getProduct(line.productId)?.sku ?? line.productId, name: getProduct(line.productId)?.name ?? '', qty: line.qty, received: line.received, unitCost: line.unitCost }))}
                    onReceive={(booked) => {
                      const quantities = Object.fromEntries(Object.entries(booked).flatMap(([sku, qty]) => {
                        const product = state.products.find((item) => item.sku === sku);
                        return product ? [[product.id, qty]] : [];
                      }));
                      actions.receivePurchaseOrder(po.id, quantities);
                      toast({ title: `${po.number} booked in`, description: `${Object.values(booked).reduce((sum, qty) => sum + qty, 0)} units added to the warehouse.`, variant: 'success' });
                    }}
                  />
                  {po.status === 'draft' ? (
                    <Button variant="outline" size="sm" onClick={() => setSending(po)}>
                      <Send /> Send to {getSupplier(po.supplierId)?.name}
                    </Button>
                  ) : null}
                  {po.status === 'sent' ? (
                    <Button variant="outline" size="sm" onClick={() => { actions.setPurchaseOrderStatus(po.id, 'confirmed'); toast({ title: `${po.number} confirmed by the supplier` }); }}>
                      <CircleCheck /> Mark as confirmed
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No orders here" description="No purchase orders have this status." />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(sending)}
        onOpenChange={(value) => !value && setSending(null)}
        title={`Send ${sending?.number ?? ''} to the supplier?`}
        description={sending ? `${getSupplier(sending.supplierId)?.name} will get ${sending.lines.length} line${sending.lines.length === 1 ? '' : 's'} worth ${formatMoney(poTotal(sending))}. You cannot edit it after it is sent.` : undefined}
        confirmLabel="Send order"
        onConfirm={() => {
          if (!sending) return;
          actions.setPurchaseOrderStatus(sending.id, 'sent');
          toast({ title: `${sending.number} sent`, variant: 'success' });
        }}
      />
    </HarborPage>
  );
}
