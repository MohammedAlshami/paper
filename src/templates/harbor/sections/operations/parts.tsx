import { Badge } from '@/components/ui/badge';
import { ORDER_STATUSES, RETURN_STATUSES, formatMoney, getCustomer, getProduct, type Order, type OrderStatus, type ReturnStatus } from '../../data';

export const money = (value: number) => formatMoney(value, 'USD', 2);
export const productName = (id: string) => getProduct(id)?.name ?? id;
export const customerName = (order: Pick<Order, 'customerId'>) => getCustomer(order.customerId)?.name ?? 'Unknown customer';
export const statusLabel = (status: OrderStatus) => ORDER_STATUSES.find((item) => item.id === status)?.label ?? status;

/** New orders need someone to act, so they take the accent colour. Out for delivery is solid; the rest are outlines. */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={status === 'out-for-delivery' ? 'default' : status === 'cancelled' ? 'secondary' : 'outline'} style={status === 'new' ? { borderColor: '#ec4899', color: '#ec4899' } : undefined}>
      {statusLabel(status)}
    </Badge>
  );
}

export function ReturnStatusBadge({ status }: { status: ReturnStatus }) {
  const label = RETURN_STATUSES.find((item) => item.id === status)?.label ?? status;
  return (
    <Badge variant={status === 'refunded' ? 'default' : status === 'rejected' ? 'secondary' : 'outline'} style={status === 'requested' ? { borderColor: '#ec4899', color: '#ec4899' } : undefined}>
      {label}
    </Badge>
  );
}

/** The next step of an order's life, or null when there is none. Pickup orders skip the van. */
export function nextOrderStatus(order: Pick<Order, 'status' | 'method'>): OrderStatus | null {
  if (order.status === 'new') return 'picking';
  if (order.status === 'picking') return 'packed';
  if (order.status === 'packed') return order.method === 'delivery' ? 'out-for-delivery' : 'delivered';
  if (order.status === 'out-for-delivery') return 'delivered';
  return null;
}
