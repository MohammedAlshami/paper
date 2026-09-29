import * as React from 'react';
import { Gauge, PackageCheck, Star, Truck } from 'lucide-react';
import { DataTable, type DataColumn } from '@/components/app/data-table';
import { FilterBar } from '@/components/app/filter-bar';
import { RecordDetailSheet } from '@/components/app/record-detail-sheet';
import { RosterGrid } from '@/components/app/roster-grid';
import { StatCardGrid, type Stat } from '@/components/app/stat-card-grid';
import { Timeline, type TimelineEvent } from '@/components/app/timeline';
import { useToast } from '@/components/app/toast';
import { UtilizationGrid } from '@/components/fleet/utilization-grid';
import { VehicleLeaderboard } from '@/components/fleet/vehicle-leaderboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DRIVERS, INITIAL_ROSTER, ROSTER_DAYS, ROSTER_PEOPLE, ROSTER_SHIFTS, TODAY, formatTime, getDriver, getVehicle, type Driver } from '../../../data';
import { driverStats, utilizationRows, type DriverStats } from '../../../data/delivery';
import { HarborPage } from '../../../layout';
import { useHarborRouter } from '../../../router-context';
import { useHarbor } from '../../../state';

interface Row {
  driver: Driver;
  stats: DriverStats;
}

const STATUS_LABEL: Record<Driver['status'], string> = { 'on-route': 'On route', available: 'Available', 'off-duty': 'Off duty' };

/** The people behind the vans: who is out, how they are doing, and the week ahead. */
export function DriversPage() {
  const { state } = useHarbor();
  const { navigate } = useHarborRouter();
  const { toast } = useToast();
  const [view, setView] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [klass, setKlass] = React.useState<string | undefined>();
  const [openId, setOpenId] = React.useState<string | null>(null);

  const all: Row[] = React.useMemo(() => DRIVERS.map((driver) => ({ driver, stats: driverStats(driver, state.jobs) })), [state.jobs]);
  const rows = all.filter(({ driver }) => {
    const vehicle = getVehicle(driver.vehicleId);
    return (
      (view === 'all' || driver.status === view) &&
      (!klass || vehicle?.klass === klass) &&
      `${driver.name} ${vehicle?.name ?? ''}`.toLowerCase().includes(search.toLowerCase())
    );
  });

  const onRoute = all.filter(({ driver }) => driver.status === 'on-route').length;
  const available = all.filter(({ driver }) => driver.status === 'available').length;
  const avgOnTime = Math.round(all.reduce((sum, { driver }) => sum + driver.onTimePercent, 0) / all.length);
  const deliveredToday = all.reduce((sum, { stats }) => sum + stats.deliveriesToday, 0);
  const stats: Stat[] = [
    { id: 'route', label: 'On route', value: `${onRoute} of ${all.length}`, icon: Truck },
    { id: 'free', label: 'Available now', value: String(available), icon: Gauge },
    { id: 'ontime', label: 'On time, 30 days', value: `${avgOnTime}%`, icon: Star },
    { id: 'done', label: 'Delivered today', value: String(deliveredToday), icon: PackageCheck },
  ];

  const columns: DataColumn<Row>[] = [
    {
      id: 'driver',
      header: 'Driver',
      sortValue: ({ driver }) => driver.name,
      cell: ({ driver }) => (
        <span className="flex flex-col">
          <span className="font-medium">{driver.name}</span>
          <span className="text-xs text-muted-foreground">{driver.phone}</span>
        </span>
      ),
    },
    {
      id: 'vehicle',
      header: 'Vehicle',
      hideBelow: 'sm',
      sortValue: ({ driver }) => getVehicle(driver.vehicleId)?.name ?? '',
      cell: ({ driver }) => (
        <span className="flex flex-col">
          <span>{getVehicle(driver.vehicleId)?.name}</span>
          <span className="font-mono text-xs text-muted-foreground">{getVehicle(driver.vehicleId)?.plate}</span>
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      sortValue: ({ driver }) => driver.status,
      cell: ({ driver }) => (driver.status === 'on-route' ? <Badge style={{ background: '#ec4899', color: '#fff' }}>{STATUS_LABEL[driver.status]}</Badge> : <Badge variant="outline">{STATUS_LABEL[driver.status]}</Badge>),
    },
    { id: 'shift', header: 'Shift', hideBelow: 'lg', cell: ({ driver }) => <span className="font-mono text-xs tabular-nums">{driver.shift}</span> },
    { id: 'today', header: 'Today', align: 'right', hideBelow: 'md', sortValue: ({ stats }) => stats.deliveriesToday, cell: ({ stats }) => <span className="font-mono tabular-nums">{stats.deliveriesToday}</span> },
    { id: 'ontime', header: 'On time', align: 'right', sortValue: ({ driver }) => driver.onTimePercent, cell: ({ driver }) => <span className="font-mono tabular-nums">{driver.onTimePercent}%</span> },
    { id: 'rating', header: 'Rating', align: 'right', hideBelow: 'md', sortValue: ({ driver }) => driver.rating, cell: ({ driver }) => <span className="font-mono tabular-nums">{driver.rating.toFixed(1)}</span> },
  ];

  const open = openId ? all.find(({ driver }) => driver.id === openId) : undefined;
  const openVehicle = open ? getVehicle(open.driver.vehicleId) : undefined;
  const openJobs: TimelineEvent[] = open
    ? state.jobs
        .filter((job) => job.driverId === open.driver.id && job.windowFrom.slice(0, 10) === TODAY)
        .sort((a, b) => a.windowFrom.localeCompare(b.windowFrom))
        .map((job) => ({
          id: job.id,
          title: `${state.orders.find((order) => order.id === job.orderId)?.number ?? job.orderId} · ${job.dropoff.label}`,
          detail: `${formatTime(job.windowFrom)} to ${formatTime(job.windowTo)} · ${job.distanceKm} km`,
          time: job.status === 'delivered' ? 'Done' : job.status === 'en-route' ? 'Now' : 'Next',
          state: job.status === 'delivered' ? ('done' as const) : job.status === 'en-route' ? ('current' as const) : ('upcoming' as const),
        }))
    : [];
  const openUtilization = open ? utilizationRows().filter((row) => row.vehicle === openVehicle?.name).map((row) => ({ ...row, days: row.days.slice(-14) })) : [];

  const leaderboard = all.map(({ driver, stats: s }) => ({
    id: driver.id,
    name: driver.name,
    late30d: Math.round(s.deliveries30d * (1 - driver.onTimePercent / 100)),
    deliveries30d: s.deliveries30d,
    km30d: s.km30d,
  }));

  return (
    <HarborPage title="Drivers" description="Who is out, how they are doing, and who works when.">
      <StatCardGrid stats={stats} period="today" />

      <div className="flex flex-col gap-3">
        <FilterBar
          views={[
            { id: 'all', label: 'All', count: all.length },
            { id: 'on-route', label: 'On route', count: onRoute },
            { id: 'available', label: 'Available', count: available },
            { id: 'off-duty', label: 'Off duty', count: all.length - onRoute - available },
          ]}
          activeView={view}
          onViewChange={setView}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search drivers or vehicles"
          filters={[{ id: 'klass', label: 'Vehicle', options: ['Van', 'Truck', 'Pickup'].map((value) => ({ value, label: value })) }]}
          values={{ klass }}
          onFilterChange={(_, value) => setKlass(value)}
          onClear={() => {
            setSearch('');
            setKlass(undefined);
            setView('all');
          }}
        />
        <DataTable rows={rows} columns={columns} getRowId={({ driver }) => driver.id} defaultSort={{ id: 'status', dir: 'asc' }} pageSize={8} onRowClick={({ driver }) => setOpenId(driver.id)} emptyTitle="No drivers match" emptyDescription="Try a different view or clear the search." />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <VehicleLeaderboard
          className="w-full max-w-none"
          vehicles={leaderboard}
          metrics={[
            { key: 'late30d', label: 'Late deliveries', format: (value) => `${value}`, higherIsWorse: true },
            { key: 'km30d', label: 'Distance', format: (value) => `${value.toLocaleString('en-US')} km`, higherIsWorse: true },
            { key: 'deliveries30d', label: 'Deliveries', format: (value) => `${value}`, higherIsWorse: false },
          ]}
          defaultMetric="late30d"
          onSelect={(driver) => setOpenId(String(driver.id))}
        />
        <UtilizationGrid className="w-full max-w-none" rows={utilizationRows()} endDate={TODAY} />
      </div>

      <RosterGrid
        className="w-full max-w-none"
        people={ROSTER_PEOPLE.filter((person) => person.id.startsWith('d-'))}
        days={ROSTER_DAYS}
        shiftTypes={ROSTER_SHIFTS}
        defaultAssignments={INITIAL_ROSTER}
        today={TODAY}
        onAssign={(personId, day, shiftId) => {
          const name = getDriver(personId)?.name ?? 'Driver';
          const shift = ROSTER_SHIFTS.find((candidate) => candidate.id === shiftId);
          toast({ title: shift ? `${name}: ${shift.label.toLowerCase()} shift` : `${name} is off`, description: new Date(day).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) });
        }}
      />

      {open ? (
        <RecordDetailSheet
          open
          onOpenChange={(next) => !next && setOpenId(null)}
          title={open.driver.name}
          subtitle={`${openVehicle?.name} · ${openVehicle?.plate}`}
          status={{ label: STATUS_LABEL[open.driver.status], tone: open.driver.status === 'on-route' ? 'accent' : 'muted' }}
          fields={[
            { label: 'Phone', value: open.driver.phone, mono: true },
            { label: 'Shift', value: open.driver.shift, mono: true },
            { label: 'On time, 30 days', value: `${open.driver.onTimePercent}%`, mono: true },
            { label: 'Rating', value: open.driver.rating.toFixed(1), mono: true },
            { label: 'Deliveries, 30 days', value: String(open.stats.deliveries30d), mono: true },
            { label: 'Distance, 30 days', value: `${open.stats.km30d.toLocaleString('en-US')} km`, mono: true },
          ]}
          tabs={[
            { id: 'jobs', label: `Today ${openJobs.length}`, content: openJobs.length ? <Timeline events={openJobs} /> : <p className="py-6 text-sm text-muted-foreground">No deliveries today.</p> },
            { id: 'use', label: 'Van use', content: <UtilizationGrid rows={openUtilization} endDate={TODAY} className="w-full max-w-none" /> },
          ]}
          actions={
            <>
              <Button variant="outline" size="sm" onClick={() => toast({ title: `Message sent to ${open.driver.name}`, variant: 'success' })}>
                Message
              </Button>
              <Button size="sm" onClick={() => navigate(`/vehicles/${open.driver.vehicleId}`)}>
                View the vehicle
              </Button>
            </>
          }
        />
      ) : null}
    </HarborPage>
  );
}
