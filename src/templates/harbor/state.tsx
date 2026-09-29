import * as React from 'react';
import type { WorkOrder, WorkOrderStatus } from '@/components/fleet/work-order-card';
import {
  CURRENT_USER, INITIAL_ALERTS, INITIAL_AUDIT, INITIAL_JOBS, INITIAL_ORDERS, INITIAL_PURCHASE_ORDERS, INITIAL_RETURNS, INITIAL_STOCK, INITIAL_WORK_ORDERS, NOW, PRODUCTS, TEAM, getDriver, lowStockProducts, nextPoNumber, addDays, TODAY,
  type Alert, type AuditEvent, type AuditKind, type DeliveryJob, type Order, type OrderStatus, type Product, type PurchaseOrder, type PurchaseOrderLine, type ReturnRequest, type ReturnStatus, type TeamMember,
} from './data';

/** Everything the pages can change. Start values come from ./data; changes here show up on every page. */
export interface HarborState {
  orders: Order[];
  jobs: DeliveryJob[];
  stock: Record<string, Record<string, number>>;
  purchaseOrders: PurchaseOrder[];
  returns: ReturnRequest[];
  workOrders: WorkOrder[];
  alerts: Alert[];
  audit: AuditEvent[];
  products: Product[];
  team: TeamMember[];
}

export interface HarborCounts {
  /** Orders waiting to be picked. */
  newOrders: number;
  /** Delivery jobs with nobody assigned. */
  unassignedJobs: number;
  unreadAlerts: number;
  /** Warehouse products at or below their reorder point. */
  lowStock: number;
  openWorkOrders: number;
  pendingReturns: number;
}

export interface HarborActions {
  setOrderStatus: (orderId: string, status: OrderStatus) => void;
  /** Give an order's delivery job a driver (and their van), or pass null to unassign. */
  assignDriver: (orderId: string, driverId: string | null) => void;
  cancelOrder: (orderId: string) => void;
  /** Change one product's stock at one location by delta (negative to remove). */
  adjustStock: (productId: string, locationId: string, delta: number, reason?: string) => void;
  /** Receive units on a purchase order: by default everything outstanding, or per-product quantities. */
  receivePurchaseOrder: (poId: string, quantities?: Record<string, number>) => void;
  setPurchaseOrderStatus: (poId: string, status: PurchaseOrder['status']) => void;
  /** Creates a draft purchase order and returns its id. */
  createPurchaseOrder: (supplierId: string, lines: Omit<PurchaseOrderLine, 'received'>[]) => string;
  setReturnStatus: (returnId: string, status: ReturnStatus) => void;
  moveWorkOrder: (workOrderId: string, status: WorkOrderStatus) => void;
  addWorkOrder: (order: Omit<WorkOrder, 'id' | 'openedOn'>) => string;
  readAlert: (alertId: string) => void;
  readAllAlerts: () => void;
  resolveAlert: (alertId: string) => void;
  updateProduct: (productId: string, patch: Partial<Product>) => void;
  setMemberRole: (memberId: string, role: TeamMember['role']) => void;
  inviteMember: (email: string, role: TeamMember['role']) => void;
  removeMember: (memberId: string) => void;
  /** Add a line to the audit log. The mutating actions above already do. */
  log: (action: string, subject: string, kind: AuditKind, href?: string) => void;
  /** Put every order, stock level and change back to how the demo started, audit log included. */
  reset: () => void;
}

export interface HarborStore {
  state: HarborState;
  actions: HarborActions;
  counts: HarborCounts;
}

const HarborContext = React.createContext<HarborStore | null>(null);

export function useHarbor(): HarborStore {
  const store = React.useContext(HarborContext);
  if (!store) throw new Error('useHarbor needs the Harbor state provider above it.');
  return store;
}

const initialState = (): HarborState => ({
  orders: INITIAL_ORDERS,
  jobs: INITIAL_JOBS,
  stock: structuredClone(INITIAL_STOCK),
  purchaseOrders: INITIAL_PURCHASE_ORDERS,
  returns: INITIAL_RETURNS,
  workOrders: INITIAL_WORK_ORDERS,
  alerts: INITIAL_ALERTS,
  audit: INITIAL_AUDIT,
  products: PRODUCTS,
  team: TEAM,
});

export function HarborProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<HarborState>(initialState);
  const tick = React.useRef(0);

  const store = React.useMemo<HarborStore>(() => {
    const stamp = () => new Date(new Date(NOW).getTime() + ++tick.current * 60_000).toISOString();
    const entry = (action: string, subject: string, kind: AuditKind, href?: string): AuditEvent => ({ id: `e-${Date.now()}-${tick.current}`, actor: CURRENT_USER.name, action, subject, kind, at: stamp(), href });
    /** Apply a change and add its audit line in one go. */
    const commit = (change: (current: HarborState) => Partial<HarborState>, audit?: AuditEvent) =>
      setState((current) => ({ ...current, ...change(current), ...(audit ? { audit: [audit, ...current.audit] } : {}) }));

    const actions: HarborActions = {
      setOrderStatus: (orderId, status) =>
        commit(
          (s) => ({
            orders: s.orders.map((order) => (order.id === orderId ? { ...order, status, ...(status === 'delivered' ? { deliveredAt: NOW } : {}) } : order)),
            jobs: s.jobs.map((job) => {
              if (job.orderId !== orderId) return job;
              if (status === 'out-for-delivery') return { ...job, status: 'en-route', progress: 0.1, etaMinutes: 25 };
              if (status === 'delivered') return { ...job, status: 'delivered', progress: 1, etaMinutes: undefined };
              return job;
            }),
          }),
          entry(`moved to ${status.replace(/-/g, ' ')}`, `Order ${orderId.replace('o-', '#')}`, 'order', `/orders/${orderId}`),
        ),
      assignDriver: (orderId, driverId) =>
        commit(
          (s) => {
            const driver = driverId ? getDriver(driverId) : undefined;
            const order = s.orders.find((candidate) => candidate.id === orderId);
            let jobs = s.jobs;
            let orders = s.orders;
            if (order) {
              const existing = s.jobs.find((job) => job.orderId === orderId);
              if (existing) {
                jobs = s.jobs.map((job) => (job.orderId === orderId ? { ...job, driverId: driver?.id, vehicleId: driver?.vehicleId, status: driver ? (job.status === 'unassigned' ? 'assigned' : job.status) : 'unassigned' } : job));
              }
              orders = s.orders.map((candidate) => (candidate.id === orderId ? { ...candidate, driverId: driver?.id, vehicleId: driver?.vehicleId } : candidate));
            }
            return { jobs, orders };
          },
          entry(driverId ? `assigned ${getDriver(driverId)?.name ?? 'a driver'} to` : 'unassigned the driver of', `Order ${orderId.replace('o-', '#')}`, 'delivery', `/orders/${orderId}`),
        ),
      cancelOrder: (orderId) =>
        commit(
          (s) => ({
            orders: s.orders.map((order) => (order.id === orderId ? { ...order, status: 'cancelled', payment: 'refunded' } : order)),
            jobs: s.jobs.filter((job) => job.orderId !== orderId),
          }),
          entry('cancelled', `Order ${orderId.replace('o-', '#')}`, 'order', `/orders/${orderId}`),
        ),
      adjustStock: (productId, locationId, delta, reason) =>
        commit(
          (s) => ({ stock: { ...s.stock, [productId]: { ...s.stock[productId], [locationId]: Math.max(0, (s.stock[productId]?.[locationId] ?? 0) + delta) } } }),
          entry(`adjusted stock of`, `${PRODUCTS.find((p) => p.id === productId)?.name ?? productId} (${locationId}, ${delta > 0 ? '+' : '−'}${Math.abs(delta)}${reason ? `, ${reason}` : ''})`, 'stock', '/inventory'),
        ),
      receivePurchaseOrder: (poId, quantities) =>
        commit(
          (s) => {
            const po = s.purchaseOrders.find((candidate) => candidate.id === poId);
            if (!po) return {};
            const lines = po.lines.map((line) => {
              const add = quantities ? Math.min(quantities[line.productId] ?? 0, line.qty - line.received) : line.qty - line.received;
              return { ...line, received: line.received + add };
            });
            const stock = structuredClone(s.stock);
            po.lines.forEach((line, i) => {
              const added = lines[i].received - line.received;
              if (added > 0) stock[line.productId] = { ...stock[line.productId], warehouse: (stock[line.productId]?.warehouse ?? 0) + added };
            });
            const complete = lines.every((line) => line.received >= line.qty);
            return { stock, purchaseOrders: s.purchaseOrders.map((candidate) => (candidate.id === poId ? { ...candidate, lines, status: complete ? 'received' : 'part-received' } : candidate)) };
          },
          entry('received stock on', poId.toUpperCase(), 'stock', '/purchasing'),
        ),
      setPurchaseOrderStatus: (poId, status) =>
        commit((s) => ({ purchaseOrders: s.purchaseOrders.map((po) => (po.id === poId ? { ...po, status } : po)) }), entry(`set ${poId.toUpperCase()} to`, status.replace('-', ' '), 'stock', '/purchasing')),
      createPurchaseOrder: (supplierId, lines) => {
        const id = `po-${nextPoNumber(stateRef.current.purchaseOrders)}`;
        commit(
          (s) => ({ purchaseOrders: [{ id, number: id.toUpperCase(), supplierId, status: 'draft', lines: lines.map((line) => ({ ...line, received: 0 })), createdOn: TODAY, expectedOn: addDays(TODAY, 7) }, ...s.purchaseOrders] }),
          entry('created', id.toUpperCase(), 'stock', '/purchasing'),
        );
        return id;
      },
      setReturnStatus: (returnId, status) =>
        commit((s) => ({ returns: s.returns.map((r) => (r.id === returnId ? { ...r, status } : r)) }), entry(`marked return ${returnId.toUpperCase()}`, status, 'order', '/returns')),
      moveWorkOrder: (workOrderId, status) =>
        commit((s) => ({ workOrders: s.workOrders.map((order) => (order.id === workOrderId ? { ...order, status } : order)) }), entry(`moved to ${status.replace(/-/g, ' ')}`, `Work order ${workOrderId.toUpperCase()}`, 'fleet', '/work-orders')),
      addWorkOrder: (order) => {
        const id = `wo-${3110 + stateRef.current.workOrders.length - 8}`;
        commit((s) => ({ workOrders: [{ ...order, id, openedOn: TODAY }, ...s.workOrders] }), entry('opened', `Work order ${id.toUpperCase()} · ${order.title}`, 'fleet', '/work-orders'));
        return id;
      },
      readAlert: (alertId) => commit((s) => ({ alerts: s.alerts.map((a) => (a.id === alertId ? { ...a, read: true } : a)) })),
      readAllAlerts: () => commit((s) => ({ alerts: s.alerts.map((a) => ({ ...a, read: true })) })),
      resolveAlert: (alertId) => commit((s) => ({ alerts: s.alerts.map((a) => (a.id === alertId ? { ...a, read: true, resolved: true } : a)) })),
      updateProduct: (productId, patch) =>
        commit((s) => ({ products: s.products.map((p) => (p.id === productId ? { ...p, ...patch } : p)) }), entry('edited', `${PRODUCTS.find((p) => p.id === productId)?.name ?? productId} (${Object.keys(patch).join(', ')})`, 'stock', `/products/${productId}`)),
      setMemberRole: (memberId, role) =>
        commit((s) => ({ team: s.team.map((m) => (m.id === memberId ? { ...m, role } : m)) }), entry(`changed the role of ${TEAM.find((m) => m.id === memberId)?.name ?? 'a member'} to`, role, 'team')),
      inviteMember: (email, role) =>
        commit((s) => ({ team: [...s.team, { id: `u-${email}`, name: email.split('@')[0], email, role, status: 'invited', lastActive: NOW }] }), entry('invited', `${email} as ${role}`, 'team')),
      removeMember: (memberId) => commit((s) => ({ team: s.team.filter((m) => m.id !== memberId) }), entry('removed', TEAM.find((m) => m.id === memberId)?.name ?? memberId, 'team')),
      log: (action, subject, kind, href) => commit(() => ({}), entry(action, subject, kind, href)),
      reset: () => setState(initialState()),
    };

    return { state, actions, counts: countsOf(state) } as HarborStore;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const stateRef = React.useRef(state);
  stateRef.current = state;

  return <HarborContext.Provider value={store}>{children}</HarborContext.Provider>;
}

function countsOf(state: HarborState): HarborCounts {
  return {
    newOrders: state.orders.filter((order) => order.status === 'new').length,
    unassignedJobs: state.jobs.filter((job) => job.status === 'unassigned').length,
    unreadAlerts: state.alerts.filter((alert) => !alert.read && !alert.resolved).length,
    lowStock: lowStockProducts(state.stock).length,
    openWorkOrders: state.workOrders.filter((order) => order.status !== 'done').length,
    pendingReturns: state.returns.filter((request) => request.status === 'requested').length,
  };
}

