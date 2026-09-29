import * as React from 'react';
import { StockAdjustDialog } from '@/components/app/stock-adjust-dialog';
import { useToast } from '@/components/app/toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LOCATIONS, PRODUCTS, WAREHOUSE, getLocation, type Product } from '../../data';
import { useHarbor } from '../../state';

/** A small square initials tile standing in for a product photo. */
export function ProductTile({ name, className }: { name: string; className?: string }) {
  const letters = name
    .split(' ')
    .filter((word) => /^[A-Za-z]/.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  return (
    <Avatar className={`size-9 rounded-md ${className ?? ''}`}>
      <AvatarFallback className="rounded-md bg-muted text-xs font-semibold">{letters}</AvatarFallback>
    </Avatar>
  );
}

export function StatusBadge({ status }: { status: Product['status'] }) {
  return status === 'active' ? <Badge variant="outline">Active</Badge> : status === 'paused' ? <Badge variant="secondary">Paused</Badge> : <Badge variant="secondary" className="text-muted-foreground">Retired</Badge>;
}

export const PRODUCT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'retired', label: 'Retired' },
];

/** Where a product's stock sits against its limits at one place: stores hold about a quarter of the warehouse's levels. */
export function stockLimits(product: Product, locationId: string) {
  if (locationId === WAREHOUSE.id) return { min: product.reorderPoint, max: product.reorderPoint + product.reorderQty };
  const min = Math.max(2, Math.round(product.reorderPoint / 4));
  return { min, max: min * 4 };
}

export const locationName = (id: string) => getLocation(id)?.name ?? id;
export const locationOptions = LOCATIONS.map((location) => ({ value: location.id, label: location.name }));
export const productById = (products: Product[], id: string) => products.find((product) => product.id === id) ?? PRODUCTS.find((product) => product.id === id);

/**
 * One shared "adjust stock" flow: call open(productId, locationId) from anywhere on a page and render `dialog`
 * once. Saving changes the shared state (so /inventory, the product page and the badges all agree) and toasts.
 */
export function useStockAdjuster() {
  const { state, actions } = useHarbor();
  const { toast } = useToast();
  const [target, setTarget] = React.useState<{ productId: string; locationId: string } | null>(null);
  const product = target ? productById(state.products, target.productId) : undefined;

  const dialog = (
    <StockAdjustDialog
      open={Boolean(target && product)}
      onOpenChange={(open) => !open && setTarget(null)}
      subject={product?.name ?? ''}
      location={target ? locationName(target.locationId) : undefined}
      current={target ? (state.stock[target.productId]?.[target.locationId] ?? 0) : 0}
      onConfirm={({ delta, reason }) => {
        if (!target || !product) return;
        actions.adjustStock(target.productId, target.locationId, delta, reason);
        toast({ title: `${product.name}: ${delta > 0 ? '+' : '−'}${Math.abs(delta)} at ${locationName(target.locationId)}`, description: reason, variant: 'success' });
      }}
    />
  );
  return { open: (productId: string, locationId: string) => setTarget({ productId, locationId }), dialog };
}
