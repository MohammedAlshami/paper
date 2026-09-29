import { FUEL_TRANSACTIONS, getDriver, getVehicle, type Vehicle } from '../../data';
import type { DiagnosticCode } from '@/components/fleet/diagnostic-code-list';
import type { FluidLevel } from '@/components/fleet/fluids-battery-panel';
import type { HealthIssue } from '@/components/fleet/vehicle-health-card';
import type { ServiceInterval } from '@/components/fleet/service-interval-gauge';
import type { SpecGroup } from '@/components/fleet/vehicle-spec-sheet';
import type { Tire } from '@/components/fleet/tire-status-grid';
import type { TimelineEvent } from '@/components/fleet/vehicle-timeline';
import type { WorkOrder } from '@/components/fleet/work-order-card';
import type { EstimateLine } from '@/components/fleet/repair-estimate-table';
import type { FuelTransaction } from '@/components/fleet/fuel-transaction-list';
import { BATTERY, CODES, DOCUMENTS, FLUIDS, FUEL_TX, TRUCK_05_TIRES, VAN_12_INTERVALS, VAN_12_TIMELINE, VAN_12_TIRES } from './demo-data';

/** A Harbor vehicle with what the fleet components need to describe it. */
export interface FleetVehicle extends Vehicle {
  driver: string;
  issues: HealthIssue[];
  nextService?: { label: string; due: string };
}

export const STATUS_LABEL: Record<Vehicle['status'], string> = { 'on-road': 'On the road', depot: 'At the depot', 'in-shop': 'In the shop' };

const HEALTH: Record<string, Pick<FleetVehicle, 'issues' | 'nextService'>> = {
  v12: {
    issues: [
      { id: 'i1', label: 'Rear right tyre at 2.0 mm tread', severity: 'critical' },
      { id: 'i2', label: 'Front right tyre 50 kPa under target', severity: 'minor' },
    ],
    nextService: { label: 'Tyre rotation', due: 'Overdue by 1,210 km' },
  },
  v07: { issues: [], nextService: { label: 'Oil and filter', due: 'In 74 days · 5,570 km' } },
  v21: {
    issues: [
      { id: 'i1', label: 'Coolant leak at the water pump', severity: 'critical' },
      { id: 'i2', label: 'Rear brake pads at 15%', severity: 'major' },
      { id: 'i3', label: 'Insurance expired 9 days ago', severity: 'major' },
    ],
    nextService: { label: 'Brakes and cooling repair', due: 'Booked Thu 1 Oct · Bay 2' },
  },
  v03: { issues: [], nextService: { label: '60,000 km service', due: 'Booked Thu 8 Oct · Bay 2' } },
  v18: {
    issues: [
      { id: 'i1', label: 'Catalytic converter below efficiency', severity: 'major' },
      { id: 'i2', label: 'Transmission fluid due in 20 days', severity: 'minor' },
    ],
    nextService: { label: 'Transmission fluid', due: 'Booked Tue 6 Oct · Bay 1' },
  },
  t02: { issues: [{ id: 'i1', label: 'Registration expires in 12 days', severity: 'minor' }], nextService: { label: 'Oil and filter', due: 'In 5 days · 650 km' } },
  t05: { issues: [{ id: 'i1', label: 'Rear right tyre 80 kPa under target', severity: 'minor' }], nextService: { label: 'Coolant flush', due: 'Booked Tue 13 Oct · Bay 1' } },
  p09: { issues: [{ id: 'i1', label: 'P0300 random misfire, 6 occurrences', severity: 'critical' }], nextService: { label: 'Annual inspection', due: 'Booked Fri 2 Oct · Bay 3' } },
};

export const toFleetVehicle = (vehicle: Vehicle): FleetVehicle => ({ ...vehicle, driver: getDriver(vehicle.driverId)?.name ?? 'Unassigned', ...HEALTH[vehicle.id] });
export const modelLine = (vehicle: Pick<Vehicle, 'year' | 'make' | 'model'>) => `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

const ENGINE: Record<Vehicle['klass'], { engine: string; fuel: string; transmission: string; drive: string; payload: string; tank: string; cargo: string; tyre: string }> = {
  Van: { engine: '3.5 L V6 EcoBoost', fuel: 'Petrol', transmission: '10-speed automatic', drive: 'Rear wheel', payload: '1,470 kg', tank: '95 L', cargo: '10.6 m³', tyre: '235/65 R16C' },
  Truck: { engine: '5.2 L 4-cylinder turbo diesel', fuel: 'Diesel', transmission: '6-speed automatic', drive: 'Rear wheel', payload: '3,600 kg', tank: '150 L', cargo: '24 m³', tyre: '225/70 R19.5' },
  Pickup: { engine: '3.5 L V6', fuel: 'Petrol', transmission: '6-speed automatic', drive: 'Four wheel', payload: '640 kg', tank: '80 L', cargo: '1.6 m³ bed', tyre: '265/65 R17' },
};

export function specsFor(vehicle: FleetVehicle): SpecGroup[] {
  const spec = ENGINE[vehicle.klass];
  return [
    {
      title: 'Identity',
      rows: [
        { label: 'Plate', value: vehicle.plate, copyable: true },
        { label: 'VIN', value: vehicle.vin, copyable: true },
        { label: 'Year', value: String(vehicle.year) },
        { label: 'Make and model', value: `${vehicle.make} ${vehicle.model}` },
        { label: 'Driver', value: vehicle.driver },
      ],
    },
    {
      title: 'Powertrain',
      rows: [
        { label: 'Engine', value: spec.engine },
        { label: 'Fuel', value: spec.fuel },
        { label: 'Transmission', value: spec.transmission },
        { label: 'Drive', value: spec.drive },
      ],
    },
    {
      title: 'Capacity',
      rows: [
        { label: 'Payload', value: spec.payload },
        { label: 'Fuel tank', value: spec.tank },
        { label: 'Cargo', value: spec.cargo },
        { label: 'Tyre size', value: spec.tyre },
      ],
    },
  ];
}

export function timelineFor(vehicle: FleetVehicle): TimelineEvent[] {
  const ratio = vehicle.odometerKm / 148210;
  return VAN_12_TIMELINE.filter((event) => Number(event.date.slice(0, 4)) >= vehicle.year)
    .map((event, index) => ({
      ...event,
      id: `${vehicle.id}-${event.id}`,
      date: index === 0 ? `${vehicle.year}-03-18` : event.date,
      odometerKm: event.odometerKm !== undefined ? Math.round(event.odometerKm * ratio) : undefined,
    }))
    .map((event, index) => (index === 0 ? { ...event, type: 'purchase' as const, title: 'Bought new', cost: event.cost ?? 41800 } : event));
}

export function codesFor(id: string): DiagnosticCode[] {
  if (id === 'v21') return CODES.slice(0, 4);
  if (id === 'p09') return CODES.filter((code) => code.code === 'P0300');
  if (id === 'v18') return CODES.filter((code) => code.code === 'P0420');
  if (id === 'v12') return CODES.filter((code) => code.code === 'C0035' || code.code === 'P0456');
  return [];
}

export function tiresFor(vehicle: FleetVehicle): Tire[] {
  if (vehicle.klass === 'Truck') return vehicle.id === 't05' ? TRUCK_05_TIRES : TRUCK_05_TIRES.map((tire) => ({ ...tire, treadMm: tire.treadMm + 1.2, pressureKpa: tire.targetKpa }));
  if (vehicle.id === 'v12') return VAN_12_TIRES;
  return VAN_12_TIRES.map((tire) => ({ ...tire, treadMm: +(tire.treadMm + 2.1).toFixed(1), pressureKpa: tire.targetKpa - 3, ageMonths: 9 }));
}

export function fluidsFor(id: string): { fluids: FluidLevel[]; battery: typeof BATTERY } {
  if (id === 'v21') return { fluids: FLUIDS, battery: BATTERY };
  return {
    fluids: [
      { id: 'oil', label: 'Engine oil life', level: 72, note: 'About 8,600 km until the next change' },
      { id: 'coolant', label: 'Coolant', level: 88 },
      { id: 'brake', label: 'Brake fluid', level: 81 },
      { id: 'washer', label: 'Washer fluid', level: 55 },
    ],
    battery: { voltage: 12.7, healthPercent: 91, coldCrankAmps: 720, testedOn: '2026-08-20' },
  };
}

export function intervalsFor(vehicle: Pick<Vehicle, 'odometerKm'>): ServiceInterval[] {
  const shift = vehicle.odometerKm - 148210;
  return VAN_12_INTERVALS.map((interval) => ({ ...interval, lastDoneKm: interval.lastDoneKm + shift }));
}

export const documentsFor = (vehicle: Pick<Vehicle, 'name'>) => DOCUMENTS.filter((document) => document.vehicle === vehicle.name);

/** The estimate lines for a work order: its parts, then its labour. */
export function estimateFor(order: WorkOrder): EstimateLine[] {
  return [
    ...order.parts.map((part) => ({ id: `p-${part.id}`, type: 'part' as const, description: part.name, qty: part.qty, unitPrice: part.unitCost })),
    { id: 'labor', type: 'labor' as const, description: 'Workshop labour', qty: order.laborHours, unitPrice: order.laborRate },
  ];
}

/**
 * Fuel purchases: the recent, flagged ones from the demo fleet, then Harbor's older card transactions. Each is in the shape
 * FuelTransactionList takes, with the vehicle by name.
 */
export const ALL_FUEL: FuelTransaction[] = [
  ...FUEL_TX,
  ...FUEL_TRANSACTIONS.filter((transaction) => transaction.date < '2026-09-25').map((transaction) => ({
    id: transaction.id,
    date: transaction.date,
    station: transaction.station,
    vehicle: getVehicle(transaction.vehicleId)?.name ?? transaction.vehicleId,
    litres: transaction.litres,
    total: Math.round(transaction.litres * transaction.pricePerLitre * 100) / 100,
    odometerKm: transaction.odometerKm,
  })),
];
