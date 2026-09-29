import type * as React from 'react';
import type { BoardOrder } from '@/components/fleet/work-order-board';

/** What every page gets: where it is, how to move, and the one piece of state pages share. */
export interface PageContext {
  base: string;
  navigate: (path: string) => void;
  params: Record<string, string>;
  orders: BoardOrder[];
  setOrders: React.Dispatch<React.SetStateAction<BoardOrder[]>>;
}
