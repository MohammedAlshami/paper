import * as React from 'react';
import { CircleDollarSign, ShoppingBag, Store, Trophy } from 'lucide-react';
import { MetricLeaderboard, type LeaderboardItem } from '@/components/app/metric-leaderboard';
import { PageTabs } from '@/components/app/page-tabs';
import { ShareBarList } from '@/components/app/share-bar-list';
import { StatCardGrid } from '@/components/app/stat-card-grid';
import { useToast } from '@/components/app/toast';
import { BranchDirectory, type Branch } from '@/components/maps/branch-directory';
import { StoreLocator, type Store as LocatorStore } from '@/components/maps/store-locator';
import { LOCATIONS, SALES_BY_LOCATION, SALES_DAILY, TODAY, addDays, formatMoney, orderTotal } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarbor } from '../../../state';

type Tab = 'performance' | 'locations' | 'directory';

/** "9:00 – 20:00" against 11:20 on the demo day. */
const openNow = (hours: string) => {
  const [open, close] = hours.split('–').map((part) => Number.parseInt(part.trim(), 10));
  return 11 >= open && 11 < close;
};
const closes = (hours: string) => `Closes ${Number.parseInt(hours.split('–')[1], 10) % 12 || 12} ${Number.parseInt(hours.split('–')[1], 10) >= 12 ? 'pm' : 'am'}`;

/** How each location is doing, on a map, and as a directory. */
export function StoresPage() {
  const { state } = useHarbor();
  const { toast } = useToast();
  const [tab, setTab] = React.useState<Tab>('performance');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const data = React.useMemo(() => {
    const last30 = SALES_DAILY.filter((point) => point.date >= addDays(TODAY, -29)).reduce((sum, point) => sum + point.value, 0);
    const live = state.orders.filter((order) => order.status !== 'cancelled');
    const items: LeaderboardItem[] = LOCATIONS.map((location) => {
      const share = SALES_BY_LOCATION.find((entry) => entry.locationId === location.id)?.share ?? 0;
      const orders = live.filter((order) => order.locationId === location.id);
      const returns = state.returns.filter((item) => orders.some((order) => order.id === item.orderId)).length;
      return {
        id: location.id,
        name: location.name,
        detail: location.address,
        revenue: Math.round(last30 * share),
        orders: orders.length,
        basket: orders.length ? Math.round(orders.reduce((sum, order) => sum + orderTotal(order), 0) / orders.length) : 0,
        returns: orders.length ? Number(((returns / orders.length) * 100).toFixed(1)) : 0,
      };
    });
    const best = [...items].sort((a, b) => Number(b.revenue) - Number(a.revenue))[0];
    const todayOrders = live.filter((order) => order.placedAt.slice(0, 10) === TODAY).length;
    return { last30, items, best, todayOrders, live };
  }, [state.orders, state.returns]);

  const stores: LocatorStore[] = LOCATIONS.map((location) => ({
    id: location.id,
    name: location.name,
    address: location.address,
    category: location.kind === 'store' ? 'Store' : 'Warehouse',
    position: location.position,
    openNow: openNow(location.hours),
    hours: closes(location.hours),
  }));

  const branches: Branch[] = LOCATIONS.map((location) => ({
    id: location.id,
    name: location.name,
    region: location.kind === 'store' ? 'Retail stores' : 'Fulfilment',
    address: location.address,
    position: location.position,
    phone: location.phone,
    email: `${location.id}@harbor.example`,
    hours: `Daily, ${location.hours.replace('–', 'to')}`,
  }));

  return (
    <HarborPage
      title="Stores"
      description="Four stores and the warehouse: how each is doing, and where they are."
      tabs={
        <PageTabs
          tabs={[
            { id: 'performance', label: 'Performance' },
            { id: 'locations', label: 'Map', count: LOCATIONS.length },
            { id: 'directory', label: 'Directory' },
          ]}
          activeId={tab}
          onChange={(next) => setTab(next.id as Tab)}
        />
      }
    >
      {tab === 'performance' ? (
        <>
          <StatCardGrid
            period="last 30 days"
            stats={[
              { id: 'revenue', label: 'Revenue, all locations', value: formatMoney(data.last30), icon: CircleDollarSign },
              { id: 'best', label: 'Best location', value: String(data.best?.name ?? '—'), icon: Trophy },
              { id: 'today', label: 'Online orders today', value: String(data.todayOrders), icon: ShoppingBag },
              { id: 'locations', label: 'Locations', value: String(LOCATIONS.length), icon: Store },
            ]}
          />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <MetricLeaderboard
              className="min-w-0"
              items={data.items}
              averageLabel="location average"
              onSelect={(item) => {
                setSelectedId(item.id);
                setTab('locations');
              }}
              metrics={[
                { key: 'revenue', label: 'Revenue', format: (value) => formatMoney(value) },
                { key: 'orders', label: 'Online orders', format: (value) => String(value) },
                { key: 'basket', label: 'Average order', format: (value) => formatMoney(value) },
                { key: 'returns', label: 'Returns', format: (value) => `${value}%`, lowerIsBetter: true },
              ]}
            />
            <ShareBarList
              className="min-w-0 self-start"
              title="Share of revenue"
              description="Last 30 days"
              items={data.items.map((item) => ({ id: item.id, label: item.name, value: Number(item.revenue) }))}
            />
          </div>
        </>
      ) : null}

      {tab === 'locations' ? (
        <StoreLocator
          stores={stores}
          selectedId={selectedId}
          onSelect={(store) => setSelectedId(store.id)}
          onDirections={(store) => toast({ title: `Directions to ${store.name}`, description: store.address })}
        />
      ) : null}

      {tab === 'directory' ? <BranchDirectory branches={branches} defaultSelectedId="mission" /> : null}
    </HarborPage>
  );
}
