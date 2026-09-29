import { CircleHelp } from 'lucide-react';
import { EmptyState } from '@/components/app/empty-state';
import { PageHeader } from '@/components/app/page-header';
import { DeliveryTrackerCard } from '@/components/maps/delivery-tracker-card';
import { OrderRouteMini } from '@/components/maps/order-route-mini';
import { PlaceCard } from '@/components/maps/place-card';
import { ProofOfDelivery } from '@/components/maps/proof-of-delivery';
import { Badge } from '@/components/ui/badge';
import { ORDERS, TRACKING_STEPS } from '../data/orders';
import { USER_POSITION } from '../data/san-francisco';

/** The public page a customer opens from a text message: where the order is, and who has it. */
export function TrackPage({ id, navigate }: { id: string; navigate: (path: string) => void }) {
  const order = ORDERS[id];
  if (!order) {
    return (
      <EmptyState
        icon={CircleHelp}
        title="We cannot find that order"
        description={`There is no order #${id}. Check the number in your message, or try a sample one.`}
        action={{ label: 'Track order #48213', onClick: () => navigate('/track/48213') }}
      />
    );
  }
  const delivered = order.currentStepId === 'delivered';
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Order #${order.id}`}
        description={delivered ? `Delivered to ${order.destination.label}` : `On its way to ${order.destination.label}`}
        badge={<Badge variant={delivered ? 'outline' : 'default'}>{delivered ? 'Delivered' : 'In transit'}</Badge>}
      />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <DeliveryTrackerCard
          className="w-full"
          orderId={`#${order.id}`}
          origin={order.origin}
          destination={order.destination}
          driver={order.driver}
          route={order.route}
          steps={TRACKING_STEPS}
          currentStepId={order.currentStepId}
          etaMinutes={order.etaMinutes}
        />
        <div className="flex flex-col gap-6">
          {order.delivery ? (
            <ProofOfDelivery
              className="w-full"
              deliveredAt={order.delivery.deliveredAt}
              recipient={order.delivery.recipient}
              address={order.delivery.address}
              position={order.destination.position}
              photoUrl={order.delivery.photoUrl}
              photoCaption={order.delivery.photoCaption}
              signaturePath={order.delivery.signaturePath}
              driver={order.driver.name}
              note={order.delivery.note}
            />
          ) : (
            <OrderRouteMini
              title={order.summary.title}
              from={order.origin.label}
              to={order.destination.label}
              route={order.route}
              position={order.driver.position}
              status="on-the-way"
              detail={order.summary.detail}
            />
          )}
          <PlaceCard place={{ ...order.store, position: order.store.position, priceLevel: 2, openNow: true }} userPosition={USER_POSITION} className="w-full" />
        </div>
      </div>
    </div>
  );
}
