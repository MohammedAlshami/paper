import type { CoverageCell } from '@/components/maps/coverage-map';
import type { FleetVehicle } from '@/components/maps/fleet-overview';
import type { GeofenceEvent } from '@/components/maps/geofence-alert-feed';
import type { HeatPoint } from '@/components/maps/heatmap-card';
import { bearing, circleRing } from '@/components/maps/map-kit';
import type { PickupPoint } from '@/components/maps/pickup-point-selector';
import type { ServicePlace, ServiceZone } from '@/components/maps/service-area-checker';
import type { UtilizationRow, DayState } from '@/components/fleet/utilization-grid';
import type { VehicleStop } from '@/components/maps/vehicle-detail-panel';
import { CUSTOMERS, DRIVERS, LOCATIONS, VEHICLES, WAREHOUSE, type Driver, type LngLat, type Vehicle } from './entities';
import { distanceKm, jobPosition, lerp, type DeliveryJob, type Order } from './orders';
import { NOW, TODAY, addDays, formatTime, seeded } from './seed';
import { isLate } from './selectors';

/* ---------------- where things are ---------------- */

/** A job is "open" until it is delivered or has failed. */
export const isOpenJob = (job: DeliveryJob) => job.status !== 'delivered' && job.status !== 'failed';

/** Where a vehicle is right now: on its en-route job's line, at the pickup of an assigned job, or in the yard. */
export function vehiclePosition(vehicle: Vehicle, jobs: DeliveryJob[]): LngLat {
  const enRoute = jobs.find((job) => job.vehicleId === vehicle.id && job.status === 'en-route');
  if (enRoute) return jobPosition(enRoute);
  const assigned = jobs.find((job) => job.vehicleId === vehicle.id && job.status === 'assigned');
  if (assigned) return assigned.pickup.position;
  const slot = VEHICLES.findIndex((candidate) => candidate.id === vehicle.id);
  // Idle and in-shop vehicles wait in the warehouse yard, each in its own bay.
  return [WAREHOUSE.position[0] + (slot % 4) * 0.0009 - 0.0014, WAREHOUSE.position[1] + Math.floor(slot / 4) * 0.0007];
}

export function vehicleJob(vehicleId: string, jobs: DeliveryJob[]) {
  return jobs.find((job) => job.vehicleId === vehicleId && job.status === 'en-route') ?? jobs.find((job) => job.vehicleId === vehicleId && job.status === 'assigned');
}

/** The fleet as FleetOverview wants it, worked out from the live jobs. */
export function fleetVehicles(jobs: DeliveryJob[]): FleetVehicle[] {
  return VEHICLES.map((vehicle) => {
    const driver = DRIVERS.find((candidate) => candidate.id === vehicle.driverId);
    const job = vehicleJob(vehicle.id, jobs);
    const position = vehiclePosition(vehicle, jobs);
    const base = { id: vehicle.id, name: vehicle.name, driver: driver?.name, position };
    if (vehicle.status === 'in-shop') return { ...base, status: 'offline' as const, task: 'In the workshop' };
    if (job?.status === 'en-route') {
      const stopsLeft = jobs.filter((other) => other.vehicleId === vehicle.id && isOpenJob(other)).length;
      return {
        ...base,
        status: isLate(job) ? ('delayed' as const) : ('moving' as const),
        heading: bearing(job.pickup.position, job.dropoff.position),
        speedKph: isLate(job) ? 14 : 28 + ((vehicle.odometerKm % 9) + 1),
        task: `${stopsLeft} ${stopsLeft === 1 ? 'stop' : 'stops'} left${job.etaMinutes ? `, ${job.etaMinutes} min to the next` : ''}`,
      };
    }
    if (job?.status === 'assigned') return { ...base, status: 'idle' as const, speedKph: 0, task: 'Loading the next order' };
    return { ...base, status: 'idle' as const, speedKph: 0, task: 'Waiting in the yard' };
  });
}

/** A short trail for the detail panel: from where the job started to where the vehicle is now. */
export function vehicleTrail(vehicle: Vehicle, jobs: DeliveryJob[]): LngLat[] {
  const job = vehicleJob(vehicle.id, jobs);
  const now = vehiclePosition(vehicle, jobs);
  if (job) return Array.from({ length: 9 }, (_, i) => lerp(job.pickup.position, now, i / 8));
  return [[now[0] - 0.006, now[1] + 0.004], [now[0] - 0.003, now[1] + 0.002], now];
}

/** What the vehicle has done today, as stops for the detail panel. */
export function vehicleStops(vehicle: Vehicle, jobs: DeliveryJob[], orders: Order[]): VehicleStop[] {
  return jobs
    .filter((job) => job.vehicleId === vehicle.id && job.windowFrom.slice(0, 10) === TODAY)
    .sort((a, b) => a.windowFrom.localeCompare(b.windowFrom))
    .map((job) => {
      const order = orders.find((candidate) => candidate.id === job.orderId);
      return { label: `${order?.number ?? job.orderId} · ${job.dropoff.label}`, time: formatTime(order?.deliveredAt ?? job.windowFrom), dwell: job.status === 'delivered' ? '4 min' : job.status === 'en-route' ? 'On the way' : 'Next' };
    });
}

export const driverOf = (vehicleId: string) => DRIVERS.find((driver) => driver.vehicleId === vehicleId);

/* ---------------- dispatch ---------------- */

/** Drivers who can take work today, with a position so the map can draw them. */
export function dispatchDrivers(jobs: DeliveryJob[]) {
  return DRIVERS.filter((driver) => driver.status !== 'off-duty').map((driver) => {
    const vehicle = VEHICLES.find((candidate) => candidate.id === driver.vehicleId) as Vehicle;
    return { id: driver.id, name: driver.name, vehicle: vehicle.name, position: vehiclePosition(vehicle, jobs) };
  });
}

/** The nearest available driver to a job's pickup, by straight-line distance. Skips drivers already on a job. */
export function nearestDriver(job: DeliveryJob, jobs: DeliveryJob[]): Driver | undefined {
  const free = DRIVERS.filter((driver) => driver.status === 'available' && !jobs.some((other) => other.driverId === driver.id && isOpenJob(other)));
  const pool = free.length ? free : DRIVERS.filter((driver) => driver.status !== 'off-duty');
  return pool
    .map((driver) => ({ driver, km: distanceKm(vehiclePosition(VEHICLES.find((v) => v.id === driver.vehicleId) as Vehicle, jobs), job.pickup.position) }))
    .sort((a, b) => a.km - b.km)[0]?.driver;
}

/* ---------------- driver performance ---------------- */

export interface DriverStats {
  driverId: string;
  deliveriesToday: number;
  deliveries30d: number;
  onTimePercent: number;
  kmToday: number;
  km30d: number;
}

export function driverStats(driver: Driver, jobs: DeliveryJob[]): DriverStats {
  const rand = seeded(driver.id.length * 97 + driver.name.charCodeAt(0));
  const today = jobs.filter((job) => job.driverId === driver.id && job.status === 'delivered' && job.windowFrom.slice(0, 10) === TODAY);
  const deliveries30d = driver.status === 'off-duty' ? 96 : 118 + Math.round(rand() * 46);
  return {
    driverId: driver.id,
    deliveriesToday: today.length,
    deliveries30d,
    onTimePercent: driver.onTimePercent,
    kmToday: Math.round(today.reduce((sum, job) => sum + job.distanceKm, 0) * 10) / 10,
    km30d: Math.round(deliveries30d * (5.2 + rand() * 2.4)),
  };
}

/** 28 days of who used which vehicle, ending today: used, idle, in the shop, or off. Same every time. */
export function utilizationRows(): UtilizationRow[] {
  return VEHICLES.map((vehicle, vi) => {
    const rand = seeded(311 + vi * 17);
    const days: DayState[] = Array.from({ length: 28 }, (_, di) => {
      const weekday = (new Date(addDays(TODAY, di - 27)).getUTCDay() + 6) % 7;
      if (weekday >= 5 && rand() < 0.7) return 'off';
      if (vehicle.status === 'in-shop' && di >= 24) return 'shop';
      const r = rand();
      return r < 0.72 ? 'used' : r < 0.94 ? 'idle' : 'off';
    });
    return { vehicle: vehicle.name, days };
  });
}

/* ---------------- geofences ---------------- */

const YARD: LngLat = WAREHOUSE.position;
const SUNSET: LngLat = [-122.4939, 37.7635];
const MARINA: LngLat = [-122.4367, 37.8004];
const SOMA: LngLat = [-122.3963, 37.7869];

/** The event position is on the zone's edge, `degrees` clockwise from north. */
function onEdge(center: LngLat, radiusKm: number, degrees: number): LngLat {
  const rad = (degrees * Math.PI) / 180;
  return [center[0] + (radiusKm * Math.sin(rad)) / (111.32 * Math.cos((center[1] * Math.PI) / 180)), center[1] + (radiusKm * Math.cos(rad)) / 110.574];
}

export const GEOFENCE_EVENTS: GeofenceEvent[] = [
  { id: 'g1', vehicle: 'Van 07', type: 'exit', zone: { name: 'Marina zone', ring: circleRing(MARINA, 1.1, 40) }, at: '10:41 am', position: onEdge(MARINA, 1.1, 130) },
  { id: 'g2', vehicle: 'Truck 02', type: 'exit', zone: { name: 'Sunset zone', ring: circleRing(SUNSET, 1.4, 40) }, at: '10:22 am', position: onEdge(SUNSET, 1.4, 80) },
  { id: 'g3', vehicle: 'Van 12', type: 'exit', zone: { name: 'Warehouse yard', ring: circleRing(YARD, 0.6, 40) }, at: '9:46 am', position: onEdge(YARD, 0.6, 20) },
  { id: 'g4', vehicle: 'Van 18', type: 'enter', zone: { name: 'SoMa zone', ring: circleRing(SOMA, 1, 40) }, at: '9:31 am', position: onEdge(SOMA, 1, 250) },
  { id: 'g5', vehicle: 'Pickup 09', type: 'exit', zone: { name: 'Warehouse yard', ring: circleRing(YARD, 0.6, 40) }, at: '8:58 am', position: onEdge(YARD, 0.6, 310) },
];

/* ---------------- zones and coverage ---------------- */

const CENTER: LngLat = [-122.4325, 37.7745];
export const SERVICE_ZONES: ServiceZone[] = [
  { id: 'core', name: 'City zone', ring: circleRing(CENTER, 5.6, 56), eta: '30 to 45 min', fee: 'Free over $75' },
  { id: 'extended', name: 'Extended zone', ring: circleRing([-122.435, 37.755], 10.5, 56), eta: '60 to 90 min', fee: '$6.00 delivery' },
];

export const CHECKER_START: LngLat = [-122.4213, 37.7638];

/** A stand-in for a geocoder: finds customer addresses and Harbor's own sites. */
export async function searchPlaces(query: string): Promise<ServicePlace[]> {
  const text = query.trim().toLowerCase();
  const places: ServicePlace[] = [
    ...CUSTOMERS.map((customer) => ({ id: customer.id, label: customer.address.replace(', San Francisco', ''), secondary: `San Francisco, CA · ${customer.name}`, position: customer.position })),
    ...LOCATIONS.map((location) => ({ id: location.id, label: location.address, secondary: `San Francisco, CA · Harbor ${location.name}`, position: location.position })),
    { id: 'dalycity', label: '333 Gellert Blvd', secondary: 'Daly City, CA', position: [-122.4699, 37.6689] as LngLat },
    { id: 'oakland', label: '1 Frank H Ogawa Plaza', secondary: 'Oakland, CA', position: [-122.2727, 37.8044] as LngLat },
    { id: 'sanjose', label: '200 E Santa Clara St', secondary: 'San Jose, CA', position: [-121.8863, 37.3382] as LngLat },
  ];
  return places.filter((place) => `${place.label} ${place.secondary ?? ''}`.toLowerCase().includes(text)).slice(0, 6);
}

const cell = (id: string, name: string, position: LngLat, radiusKm: number, signal: CoverageCell['signal']): CoverageCell => ({ id, name, position, radiusKm, signal });
/** How well each part of the city is served: strong is same-hour delivery, weak is next day. */
export const COVERAGE_CELLS: CoverageCell[] = [
  cell('c1', 'Mission', LOCATIONS[0].position, 2.5, 'strong'),
  cell('c2', 'SoMa and Financial District', LOCATIONS[3].position, 2.4, 'strong'),
  cell('c3', 'Marina and Cow Hollow', LOCATIONS[2].position, 2.2, 'strong'),
  cell('c4', 'Sunset', LOCATIONS[1].position, 3.1, 'ok'),
  cell('c5', 'Richmond', [-122.4832, 37.7801], 2.9, 'ok'),
  cell('c6', 'Bayview', [-122.3894, 37.7295], 2.6, 'strong'),
  cell('c7', 'Haight and Cole Valley', [-122.4467, 37.7692], 1.6, 'strong'),
  cell('c8', 'Daly City', [-122.4702, 37.6879], 3.4, 'weak'),
  cell('c9', 'Presidio and Park', [-122.4662, 37.7994], 2.3, 'ok'),
  cell('c10', 'Twin Peaks and Glen Park', [-122.4438, 37.7415], 2.2, 'ok'),
];

/** Harbor's own sites as places to collect from. */
export const PICKUP_POINTS: PickupPoint[] = LOCATIONS.map((location) =>
  location.kind === 'warehouse'
    ? { id: location.id, name: 'Warehouse pickup lockers', type: 'locker' as const, address: location.address, position: location.position, hours: '24 hours' }
    : { id: location.id, name: `Harbor ${location.name}`, type: 'store' as const, address: location.address, position: location.position, hours: `Open ${location.hours}`, available: location.id !== 'sunset' },
);

/** Delivery density: where orders went, by hour. Sample data, seeded so it looks the same every time. */
export const HEAT_POINTS: HeatPoint[] = (() => {
  const rand = seeded(2026);
  const spots: { center: LngLat; peak: number; spread: number; count: number }[] = [
    { center: LOCATIONS[0].position, peak: 18.5, spread: 0.009, count: 260 },
    { center: LOCATIONS[3].position, peak: 12.5, spread: 0.006, count: 220 },
    { center: LOCATIONS[2].position, peak: 19.5, spread: 0.007, count: 180 },
    { center: LOCATIONS[1].position, peak: 17, spread: 0.011, count: 150 },
    { center: [-122.4467, 37.7692], peak: 10.5, spread: 0.006, count: 120 },
  ];
  const gauss = () => Math.sqrt(-2 * Math.log(rand() || 1e-9)) * Math.cos(2 * Math.PI * rand());
  return spots.flatMap((spot) =>
    Array.from({ length: spot.count }, () => ({
      position: [spot.center[0] + gauss() * spot.spread, spot.center[1] + gauss() * spot.spread * 0.75] as LngLat,
      hour: Math.min(23, Math.max(0, Math.round(spot.peak + gauss() * 2.4))),
    })),
  );
})();

/* ---------------- routes ---------------- */

export { FLEET_ROUTES } from './delivery-routes';
export { OPTIMIZER_BEST, OPTIMIZER_BEST_ROUTE, OPTIMIZER_NAIVE, OPTIMIZER_NAIVE_ROUTE } from './delivery-optimizer';

/** The stops of a run, before and after optimising. Positions match the route geometry. */
export const OPTIMIZER_STOPS = [
  { label: 'Yard', position: [-122.3998, 37.7605] as LngLat, beforeIndex: 0, afterIndex: 0 },
  { label: 'Haight St', position: [-122.4477, 37.7691] as LngLat, beforeIndex: 1, afterIndex: 2 },
  { label: 'North Beach', position: [-122.4102, 37.8005] as LngLat, beforeIndex: 2, afterIndex: 4 },
  { label: 'Cole Valley', position: [-122.446, 37.771] as LngLat, beforeIndex: 3, afterIndex: 3 },
  { label: 'Mission', position: [-122.4195, 37.7599] as LngLat, beforeIndex: 4, afterIndex: 1 },
  { label: 'Marina', position: [-122.437, 37.8036] as LngLat, beforeIndex: 5, afterIndex: 5 },
];

/** Which recorded route each driver's trip replay uses. */
export const REPLAY_ROUTE_INDEX: Record<string, number> = { 'd-priya': 0, 'd-diego': 1, 'd-jon': 2, 'd-omar': 3, 'd-ana': 4, 'd-mia': 1, 'd-sam': 2, 'd-lena': 0 };

export const REPLAY_STOPS: Record<string, { at: number; label: string; dwellMin: number }[]> = {
  default: [
    { at: 0.28, label: 'Drop-off, first order', dwellMin: 5 },
    { at: 0.55, label: 'Drop-off, second order', dwellMin: 4 },
    { at: 0.82, label: 'Drop-off, third order', dwellMin: 6 },
  ],
};

export const NOW_LABEL = formatTime(NOW);
