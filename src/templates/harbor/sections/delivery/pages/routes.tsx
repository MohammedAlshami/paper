import * as React from 'react';
import { Fuel, Gauge, Route as RouteIcon, Timer } from 'lucide-react';
import { StatCardGrid, type Stat } from '@/components/app/stat-card-grid';
import { Timeline, type TimelineEvent } from '@/components/app/timeline';
import { useToast } from '@/components/app/toast';
import { RouteOptimizerResult } from '@/components/maps/route-optimizer-result';
import { TripReplay } from '@/components/maps/trip-replay';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DRIVERS, getVehicle } from '../../../data';
import { FLEET_ROUTES, OPTIMIZER_BEST, OPTIMIZER_BEST_ROUTE, OPTIMIZER_NAIVE, OPTIMIZER_NAIVE_ROUTE, OPTIMIZER_STOPS, REPLAY_ROUTE_INDEX, REPLAY_STOPS } from '../../../data/delivery';
import { HarborPage } from '../../../layout';
import { useHarbor } from '../../../state';

type Day = 'today' | 'tomorrow';
const clock = (minutes: number) => `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(Math.round(minutes) % 60).padStart(2, '0')}`;

/** What the optimiser saved on a driver's run, the stops in the order it chose, and how a finished run went. */
export function RoutesPage() {
  const { actions } = useHarbor();
  const { toast } = useToast();
  const drivers = DRIVERS.filter((driver) => driver.status !== 'off-duty');
  const [driverId, setDriverId] = React.useState('d-priya');
  const [day, setDay] = React.useState<Day>('tomorrow');

  const driver = DRIVERS.find((candidate) => candidate.id === driverId) ?? drivers[0];
  const vehicle = getVehicle(driver.vehicleId);
  const startMinutes = day === 'tomorrow' ? 8 * 60 : 7 * 60;
  const kmSaved = OPTIMIZER_NAIVE.distanceKm - OPTIMIZER_BEST.distanceKm;
  const minSaved = OPTIMIZER_NAIVE.durationMin - OPTIMIZER_BEST.durationMin;

  const stats: Stat[] = [
    { id: 'km', label: 'Distance saved', value: `${kmSaved.toFixed(1)} km`, icon: RouteIcon, delta: -Math.round((kmSaved / OPTIMIZER_NAIVE.distanceKm) * 100), goodWhen: 'down' },
    { id: 'min', label: 'Time saved', value: `${minSaved} min`, icon: Timer, delta: -Math.round((minSaved / OPTIMIZER_NAIVE.durationMin) * 100), goodWhen: 'down' },
    { id: 'fuel', label: 'Fuel saved', value: `${(kmSaved * 0.11).toFixed(1)} L`, icon: Fuel },
    { id: 'stops', label: 'Stops on the run', value: String(OPTIMIZER_STOPS.length - 1), icon: Gauge },
  ];

  // The optimised order, with the time each stop is reached spread evenly over the run.
  const ordered = [...OPTIMIZER_STOPS].sort((a, b) => a.afterIndex - b.afterIndex);
  const events: TimelineEvent[] = ordered.map((stop, index) => {
    const at = startMinutes + (OPTIMIZER_BEST.durationMin + (ordered.length - 1) * 6) * (index / (ordered.length - 1));
    return {
      id: stop.label,
      title: stop.label,
      detail: index === 0 ? 'Load and leave' : stop.beforeIndex === stop.afterIndex ? 'Same place in the list' : `Was stop ${stop.beforeIndex}, now stop ${stop.afterIndex}`,
      time: clock(at),
      state: day === 'today' ? (index < 2 ? 'done' : index === 2 ? 'current' : 'upcoming') : 'upcoming',
    };
  });

  const replayRoute = FLEET_ROUTES[REPLAY_ROUTE_INDEX[driver.id] ?? 0];

  return (
    <HarborPage
      title="Routes"
      description="The run as booked against the run after optimising, and a replay of how a finished run went."
      actions={
        <Button
          size="sm"
          onClick={() => {
            actions.log('applied the optimised route for', `${vehicle?.name ?? driver.name}, ${day}`, 'delivery', '/routes');
            toast({ title: 'Optimised route applied', description: `${driver.name} will follow the new order ${day === 'today' ? 'from the next stop' : 'tomorrow'}.`, variant: 'success' });
          }}
        >
          Apply optimised route
        </Button>
      }
    >
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="route-driver">Driver</Label>
          <Select value={driver.id} onValueChange={setDriverId}>
            <SelectTrigger id="route-driver" className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name} · {getVehicle(option.vehicleId)?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="route-day">Run</Label>
          <Select value={day} onValueChange={(value) => setDay(value as Day)}>
            <SelectTrigger id="route-day" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="today">Today</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <StatCardGrid stats={stats} period="vs the booked order" />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <RouteOptimizerResult
          className="w-full max-w-none"
          stops={OPTIMIZER_STOPS}
          before={{ route: OPTIMIZER_NAIVE_ROUTE, ...OPTIMIZER_NAIVE }}
          after={{ route: OPTIMIZER_BEST_ROUTE, ...OPTIMIZER_BEST }}
        />
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">
            {driver.name}, {day === 'today' ? "today's run" : "tomorrow's run"}
          </h2>
          <Timeline events={events} />
        </div>
      </div>

      <TripReplay
        key={driver.id}
        className="w-full max-w-none"
        title={`${driver.name}'s last run, replayed`}
        route={replayRoute}
        movingMin={38 + (driver.id.length % 7) * 3}
        startMinutes={8 * 60 + 12}
        stops={REPLAY_STOPS.default}
        defaultProgress={0.4}
      />
    </HarborPage>
  );
}
