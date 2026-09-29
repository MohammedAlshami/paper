import * as React from 'react';
import { CheckCheck, Clock, PackageOpen, Sparkles, Truck, UserRoundX } from 'lucide-react';
import { ActivityFeed, type ActivityItem } from '@/components/app/activity-feed';
import { RosterGrid } from '@/components/app/roster-grid';
import { StatCardGrid, type Stat } from '@/components/app/stat-card-grid';
import { useToast } from '@/components/app/toast';
import { DispatchBoard, type DispatchJob } from '@/components/maps/dispatch-board';
import { Button } from '@/components/ui/button';
import { INITIAL_ROSTER, ROSTER_DAYS, ROSTER_PEOPLE, ROSTER_SHIFTS, TODAY, formatTime, getDriver, isLate } from '../../../data';
import { dispatchDrivers, isOpenJob, nearestDriver } from '../../../data/delivery';
import { HarborPage } from '../../../layout';
import { useHarborRouter } from '../../../router-context';
import { useHarbor } from '../../../state';

/** Give jobs to drivers. Drag a job onto a driver on the board (or tap it, then Assign) and every other page sees it. */
export function DispatchPage() {
  const { state, actions } = useHarbor();
  const { navigate } = useHarborRouter();
  const { toast } = useToast();
  // The board keeps its own copy of who has what; changing this key gives it a fresh one after an auto-assign.
  const [boardKey, setBoardKey] = React.useState(0);

  const dispatchable = state.jobs.filter((job) => job.status === 'unassigned' || job.status === 'assigned');
  const unassigned = dispatchable.filter((job) => job.status === 'unassigned');
  const enRoute = state.jobs.filter((job) => job.status === 'en-route');
  const deliveredToday = state.jobs.filter((job) => job.status === 'delivered' && job.windowFrom.slice(0, 10) === TODAY).length;
  const lateCount = state.jobs.filter(isOpenJob).filter(isLate).length;

  const orderNumber = (orderId: string) => state.orders.find((order) => order.id === orderId)?.number ?? orderId;
  const jobs: DispatchJob[] = dispatchable.map((job) => ({
    id: job.id,
    title: `Order ${orderNumber(job.orderId)}`,
    address: job.dropoff.label,
    position: job.dropoff.position,
    window: `${formatTime(job.windowFrom)} to ${formatTime(job.windowTo)}`,
  }));
  const assignments = Object.fromEntries(dispatchable.filter((job) => job.driverId).map((job) => [job.id, job.driverId as string]));
  const drivers = dispatchDrivers(state.jobs);

  const stats: Stat[] = [
    { id: 'unassigned', label: 'Waiting for a driver', value: String(unassigned.length), icon: UserRoundX, goodWhen: 'down' },
    { id: 'assigned', label: 'Assigned, not left', value: String(dispatchable.length - unassigned.length), icon: PackageOpen },
    { id: 'route', label: 'On the way', value: String(enRoute.length), icon: Truck },
    { id: 'late', label: 'Running late', value: String(lateCount), icon: Clock, goodWhen: 'down' },
    { id: 'done', label: 'Delivered today', value: String(deliveredToday), icon: CheckCheck },
  ];

  const autoAssign = () => {
    // Work on a copy so each job sees the drivers already picked for the ones before it.
    let working = state.jobs;
    let count = 0;
    unassigned.forEach((job) => {
      const driver = nearestDriver(job, working);
      if (!driver) return;
      actions.assignDriver(job.orderId, driver.id);
      working = working.map((other) => (other.id === job.id ? { ...other, driverId: driver.id, vehicleId: driver.vehicleId, status: 'assigned' as const } : other));
      count += 1;
    });
    setBoardKey((key) => key + 1);
    toast({ title: count ? `Assigned ${count} ${count === 1 ? 'job' : 'jobs'}` : 'Nothing to assign', description: count ? 'Each went to the nearest driver who was free.' : 'Every job already has a driver.', variant: count ? 'success' : 'default' });
  };

  const activity: ActivityItem[] = state.audit
    .filter((event) => event.kind === 'delivery' || event.kind === 'order')
    .map((event) => ({ id: event.id, actor: { name: event.actor }, action: event.action, subject: event.subject, at: event.at }));

  return (
    <HarborPage
      title="Dispatch"
      description="Drag a job onto a driver, or let Harbor give each to the nearest one who is free."
      actions={
        <Button size="sm" onClick={autoAssign} disabled={!unassigned.length}>
          <Sparkles /> Auto-assign
        </Button>
      }
    >
      <StatCardGrid stats={stats} period="today" />

      <DispatchBoard
        key={boardKey}
        className="w-full max-w-none"
        jobs={jobs}
        drivers={drivers}
        defaultAssignments={assignments}
        onAssign={(job, driver) => {
          const found = state.jobs.find((candidate) => candidate.id === job.id);
          if (!found) return;
          actions.assignDriver(found.orderId, driver.id);
          toast({ title: `${driver.name} has ${job.title}`, description: job.address, variant: 'success', action: { label: 'View order', onClick: () => navigate(`/orders/${found.orderId}`) } });
        }}
        onUnassign={(job, driver) => {
          const found = state.jobs.find((candidate) => candidate.id === job.id);
          if (!found) return;
          actions.assignDriver(found.orderId, null);
          toast({ title: `${job.title} is unassigned`, description: `Taken off ${driver.name}.` });
        }}
      />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
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
            actions.log(shift ? `put ${name} on ${shift.label.toLowerCase()} for` : `took ${name} off the roster for`, new Date(day).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }), 'delivery', '/dispatch');
            toast({ title: shift ? `${name}: ${shift.label.toLowerCase()} shift` : `${name} is off`, description: new Date(day).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) });
          }}
        />
        <ActivityFeed className="w-full max-w-none" items={activity} today={TODAY} title="Dispatch activity" pageSize={5} />
      </div>
    </HarborPage>
  );
}
