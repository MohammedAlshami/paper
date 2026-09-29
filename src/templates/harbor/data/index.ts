/**
 * Harbor's demo data: one internally consistent set. Static things (products, customers, vehicles...) are plain exports
 * with getX(id) lookups. Things pages change (orders, jobs, stock, purchase orders, returns, work orders, alerts,
 * audit) start here as INITIAL_* and live in the state provider (../state.tsx). "Today" is 29 Sep 2026, 11:20.
 */
export * from './seed';
export * from './entities';
export * from './orders';
export * from './ops';
export {
  customerSpend, dayStats, isLate, jobForOrder, lowStockProducts, onOrder, orderTimeline, ordersByCustomer, ordersForProduct, ordersOnDay, totalStock, unitsSold, warehouseStock,
  type Ledgerish,
} from './selectors';
