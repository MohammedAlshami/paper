import type { HarborSection } from '../../types';
import { Inbox } from './pages/Inbox';
import { OrderDetail } from './pages/OrderDetail';
import { Orders } from './pages/Orders';
import { Overview } from './pages/Overview';
import { PickAndPack } from './pages/PickAndPack';
import { Returns } from './pages/Returns';
import { OPERATIONS_PAGES } from './pages';

/** The operations section of Harbor: its pages and routes. */
export const OPERATIONS: HarborSection = {
  pages: OPERATIONS_PAGES,
  routes: [
    { path: '/', render: () => <Overview /> },
    { path: '/inbox', render: () => <Inbox /> },
    { path: '/orders', render: () => <Orders /> },
    { path: '/orders/:id', render: ({ params }) => <OrderDetail id={params.id} /> },
    { path: '/pick-and-pack', render: () => <PickAndPack /> },
    { path: '/returns', render: () => <Returns /> },
  ],
};
