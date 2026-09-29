import type { BookedService } from '@/components/fleet/maintenance-calendar';
import type { BoardOrder } from '@/components/fleet/work-order-board';
import type { ChecklistSection } from '@/components/fleet/inspection-checklist';
import type { CostCategory, CostRow } from '@/components/fleet/cost-breakdown-chart';
import type { DiagnosticCode } from '@/components/fleet/diagnostic-code-list';
import type { DowntimeDay, DowntimeVehicle } from '@/components/fleet/downtime-forecast';
import type { DueService } from '@/components/fleet/service-due-list';
import type { EstimateLine } from '@/components/fleet/repair-estimate-table';
import type { FleetDocument } from '@/components/fleet/document-expiry-tracker';
import type { FluidLevel } from '@/components/fleet/fluids-battery-panel';
import type { FuelEconomyPoint } from '@/components/fleet/fuel-economy-trend';
import type { FuelTransaction } from '@/components/fleet/fuel-transaction-list';
import type { Kpi } from '@/components/fleet/fleet-kpi-strip';
import type { LeaderboardMetric, LeaderboardVehicle } from '@/components/fleet/vehicle-leaderboard';
import type { Part } from '@/components/fleet/parts-inventory-table';
import type { PartDetail } from '@/components/fleet/part-detail-panel';
import type { PMClass } from '@/components/fleet/pm-schedule-builder';
import type { POLine } from '@/components/fleet/purchase-order-card';
import type { ReorderSuggestion } from '@/components/fleet/reorder-suggestions';
import type { ServiceInterval } from '@/components/fleet/service-interval-gauge';
import type { SpecGroup } from '@/components/fleet/vehicle-spec-sheet';
import type { StockLevel } from '@/components/fleet/stock-level-bar';
import type { Tire } from '@/components/fleet/tire-status-grid';
import type { TimelineEvent } from '@/components/fleet/vehicle-timeline';
import type { UtilizationRow, DayState } from '@/components/fleet/utilization-grid';
import type { WorkOrder } from '@/components/fleet/work-order-card';
import type { YearProjection } from '@/components/fleet/replacement-planner';
import { dayFromToday, seeded, VEHICLES } from './fleet';

/* ---------- vehicle records and health ---------- */

export const VAN_12_SPECS: SpecGroup[] = [
  {
    title: 'Identity',
    rows: [
      { label: 'Plate', value: '8KTR204', copyable: true },
      { label: 'VIN', value: '1FTBW2CM5MKA48213', copyable: true },
      { label: 'Year', value: '2021' },
      { label: 'Make and model', value: 'Ford Transit 350' },
      { label: 'Colour', value: 'Oxford White' },
    ],
  },
  {
    title: 'Powertrain',
    rows: [
      { label: 'Engine', value: '3.5 L V6 EcoBoost' },
      { label: 'Fuel', value: 'Petrol' },
      { label: 'Transmission', value: '10-speed automatic' },
      { label: 'Drive', value: 'Rear wheel' },
    ],
  },
  {
    title: 'Capacity',
    rows: [
      { label: 'Payload', value: '1,470 kg' },
      { label: 'Fuel tank', value: '95 L' },
      { label: 'Cargo volume', value: '10.6 m³' },
      { label: 'Tyre size', value: '235/65 R16C' },
    ],
  },
  {
    title: 'Compliance',
    rows: [
      { label: 'Registration expires', value: '14 Mar 2027' },
      { label: 'Insurance renews', value: '1 Jan 2027' },
      { label: 'Last inspection', value: '12 Jul 2026' },
      { label: 'Next inspection', value: '12 Jan 2027' },
    ],
  },
];

export const VAN_12_TIMELINE: TimelineEvent[] = [
  { id: 'e1', type: 'purchase', title: 'Bought new', date: '2021-03-18', odometerKm: 12, cost: 41800, detail: 'Delivered from the dealer with the shelving and roof rack fitted.' },
  { id: 'e2', type: 'service', title: '10,000 km service', date: '2021-08-02', odometerKm: 10120, cost: 240 },
  { id: 'e3', type: 'service', title: '30,000 km service', date: '2022-05-19', odometerKm: 30480, cost: 410, detail: 'Oil, oil filter, air filter, cabin filter.' },
  {
    id: 'e4',
    type: 'incident',
    title: 'Reversing collision, rear bumper',
    date: '2022-11-07',
    odometerKm: 47210,
    cost: 1180,
    detail: 'Struck a bollard in the depot yard. Bumper and parking sensor replaced.',
  },
  { id: 'e5', type: 'inspection', title: 'Annual safety inspection', date: '2023-03-10', odometerKm: 58900, cost: 95 },
  {
    id: 'e6',
    type: 'repair',
    title: 'Replaced alternator',
    date: '2023-09-26',
    odometerKm: 79350,
    cost: 860,
    detail: 'Battery light on and dimming headlights. Fitted a remanufactured unit with a 2-year warranty.',
  },
  { id: 'e7', type: 'service', title: '90,000 km service', date: '2024-04-15', odometerKm: 90210, cost: 690, detail: 'Oil, filters and transmission fluid.' },
  { id: 'e8', type: 'repair', title: 'Front brake pads and rotors', date: '2025-02-04', odometerKm: 118400, cost: 720 },
  { id: 'e9', type: 'note', title: 'Driver reports a rattle from the sliding door', date: '2025-08-21', odometerKm: 131200, detail: 'Roller replaced under warranty.' },
  { id: 'e10', type: 'service', title: '135,000 km service', date: '2026-01-13', odometerKm: 135180, cost: 520 },
  { id: 'e11', type: 'inspection', title: 'Annual safety inspection', date: '2026-07-12', odometerKm: 143870, cost: 95 },
  { id: 'e12', type: 'repair', title: 'Replaced water pump', date: '2026-09-02', odometerKm: 147300, cost: 940 },
];

export const CODES: DiagnosticCode[] = [
  {
    code: 'P0300',
    description: 'Random misfire detected. The engine is running rough under load.',
    system: 'Engine',
    severity: 'critical',
    status: 'active',
    firstSeen: '2026-09-24',
    occurrences: 6,
    likelyCauses: ['Worn spark plugs', 'Failing ignition coil', 'Vacuum leak'],
  },
  {
    code: 'P0420',
    description: 'Catalytic converter is not cleaning the exhaust as well as it should.',
    system: 'Exhaust',
    severity: 'warning',
    status: 'active',
    firstSeen: '2026-08-11',
    occurrences: 3,
    likelyCauses: ['Ageing catalytic converter', 'Faulty downstream oxygen sensor', 'Exhaust leak before the sensor'],
  },
  {
    code: 'P0128',
    description: 'Coolant is taking too long to warm up.',
    system: 'Cooling',
    severity: 'warning',
    status: 'pending',
    firstSeen: '2026-09-27',
    occurrences: 1,
    likelyCauses: ['Thermostat stuck open', 'Low coolant level'],
  },
  {
    code: 'C0035',
    description: 'Front left wheel speed sensor signal is intermittent.',
    system: 'Brakes',
    severity: 'warning',
    status: 'active',
    firstSeen: '2026-09-15',
    occurrences: 4,
    likelyCauses: ['Damaged sensor wiring', 'Dirty or damaged tone ring'],
  },
  {
    code: 'P0456',
    description: 'A very small leak in the fuel vapour system.',
    system: 'Fuel',
    severity: 'info',
    status: 'active',
    firstSeen: '2026-07-02',
    occurrences: 2,
    likelyCauses: ['Loose or worn fuel cap seal'],
  },
  { code: 'U0100', description: 'Lost contact with the engine computer.', system: 'Network', severity: 'info', status: 'cleared', firstSeen: '2026-06-18', occurrences: 1 },
];

export const DOCUMENTS: FleetDocument[] = [
  { id: 'd1', name: 'Insurance', vehicle: 'Van 21', expiresOn: dayFromToday(-9), issuedOn: '2025-09-20' },
  { id: 'd2', name: 'Registration', vehicle: 'Truck 02', expiresOn: dayFromToday(12), issuedOn: '2025-10-11' },
  { id: 'd3', name: 'Safety inspection', vehicle: 'Van 18', expiresOn: dayFromToday(25), issuedOn: '2025-10-24' },
  { id: 'd4', name: 'Insurance', vehicle: 'Pickup 09', expiresOn: dayFromToday(61), issuedOn: '2025-11-29' },
  { id: 'd5', name: 'Registration', vehicle: 'Van 12', expiresOn: '2027-03-14', issuedOn: '2026-03-14' },
  { id: 'd6', name: 'Operating permit', vehicle: 'Truck 05', expiresOn: '2027-06-30', issuedOn: '2026-07-01' },
  { id: 'd7', name: 'Safety inspection', vehicle: 'Van 07', expiresOn: '2027-01-08', issuedOn: '2026-01-08' },
];

/* ---------- maintenance scheduling ---------- */

export const DUE_SERVICES: DueService[] = [
  { id: 's1', vehicle: 'Van 21', service: 'Brake inspection', dueKm: 230000, currentKm: 231880, dueDate: dayFromToday(-6) },
  { id: 's2', vehicle: 'Truck 02', service: 'Oil and filter', dueKm: 205000, currentKm: 204350, dueDate: dayFromToday(5) },
  { id: 's3', vehicle: 'Van 12', service: 'Tyre rotation', dueKm: 147000, currentKm: 148210 },
  { id: 's4', vehicle: 'Van 18', service: 'Transmission fluid', dueKm: 190000, currentKm: 187660, dueDate: dayFromToday(20) },
  { id: 's5', vehicle: 'Pickup 09', service: 'Annual inspection', dueDate: dayFromToday(9) },
  { id: 's6', vehicle: 'Van 07', service: 'Oil and filter', dueKm: 102000, currentKm: 96430, dueDate: dayFromToday(74) },
  { id: 's7', vehicle: 'Truck 05', service: 'Coolant flush', dueKm: 130000, currentKm: 118940, dueDate: dayFromToday(58) },
];

export const BOOKED: BookedService[] = [
  { id: 'b1', date: '2026-10-01', vehicle: 'Van 21', service: 'Front brakes and rotors', bay: 'Bay 2', status: 'booked' },
  { id: 'b2', date: '2026-10-01', vehicle: 'Truck 02', service: 'Oil and filter', bay: 'Bay 1', status: 'booked' },
  { id: 'b3', date: '2026-10-02', vehicle: 'Van 21', service: 'Front brakes and rotors', bay: 'Bay 2', status: 'booked' },
  { id: 'b4', date: '2026-10-02', vehicle: 'Van 12', service: 'Tyre rotation', bay: 'Bay 1', status: 'booked' },
  { id: 'b5', date: '2026-10-02', vehicle: 'Pickup 09', service: 'Annual inspection', bay: 'Bay 3', status: 'booked' },
  { id: 'b6', date: '2026-10-06', vehicle: 'Van 18', service: 'Transmission fluid', bay: 'Bay 1', status: 'booked' },
  { id: 'b7', date: '2026-10-08', vehicle: 'Van 03', service: '60,000 km service', bay: 'Bay 2', status: 'booked' },
  { id: 'b8', date: '2026-10-13', vehicle: 'Truck 05', service: 'Coolant flush', bay: 'Bay 1', status: 'booked' },
  { id: 'b9', date: '2026-10-13', vehicle: 'Van 07', service: 'Oil and filter', bay: 'Bay 3', status: 'booked' },
  { id: 'b10', date: '2026-10-13', vehicle: 'Van 12', service: 'Brake inspection', bay: 'Bay 2', status: 'booked' },
  { id: 'b11', date: '2026-10-13', vehicle: 'Van 21', service: 'Post-repair check', bay: 'Bay 1', status: 'booked' },
  { id: 'b12', date: '2026-10-20', vehicle: 'Truck 02', service: 'Annual inspection', bay: 'Bay 2', status: 'booked' },
  { id: 'b13', date: '2026-10-27', vehicle: 'Van 18', service: 'Safety inspection', bay: 'Bay 1', status: 'booked' },
];

export const PM_SCHEDULE: PMClass[] = [
  {
    id: 'van',
    name: 'Vans',
    vehicleCount: 5,
    tasks: [
      { id: 'oil', task: 'Oil and filter', everyKm: 12000, everyMonths: 6 },
      { id: 'rot', task: 'Tyre rotation', everyKm: 15000 },
      { id: 'brk', task: 'Brake inspection', everyKm: 20000, everyMonths: 12 },
      { id: 'air', task: 'Air filter', everyKm: 30000 },
      { id: 'trn', task: 'Transmission fluid', everyKm: 60000, everyMonths: 36 },
      { id: 'saf', task: 'Safety inspection', everyMonths: 12 },
    ],
  },
  {
    id: 'truck',
    name: 'Trucks',
    vehicleCount: 2,
    tasks: [
      { id: 'oil', task: 'Oil and filter', everyKm: 10000, everyMonths: 4 },
      { id: 'brk', task: 'Brake inspection', everyKm: 15000, everyMonths: 6 },
      { id: 'grs', task: 'Chassis grease', everyKm: 10000 },
      { id: 'saf', task: 'Safety inspection', everyMonths: 6 },
    ],
  },
  {
    id: 'pickup',
    name: 'Pickups',
    vehicleCount: 1,
    tasks: [
      { id: 'oil', task: 'Oil and filter', everyKm: 10000, everyMonths: 6 },
      { id: 'rot', task: 'Tyre rotation', everyKm: 12000 },
      { id: 'saf', task: 'Safety inspection', everyMonths: 12 },
    ],
  },
];

export const VAN_12_INTERVALS: ServiceInterval[] = [
  { id: 'oil', label: 'Oil and filter', everyKm: 12000, lastDoneKm: 138500 },
  { id: 'rot', label: 'Tyre rotation', everyKm: 15000, lastDoneKm: 132000 },
  { id: 'brk', label: 'Brake inspection', everyKm: 20000, lastDoneKm: 130000 },
  { id: 'air', label: 'Air filter', everyKm: 30000, lastDoneKm: 120000 },
  { id: 'trn', label: 'Transmission fluid', everyKm: 60000, lastDoneKm: 100000 },
  { id: 'clt', label: 'Coolant flush', everyKm: 80000, lastDoneKm: 85000 },
];

export const DOWNTIME_DAYS: DowntimeDay[] = (() => {
  const plan: [number, number, number][] = [
    [1, 1, 0],
    [2, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
    [0, 0, 0],
    [0, 0, 0],
    [1, 0, 0],
    [3, 1, 0],
    [1, 0, 1],
    [1, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
  ];
  return plan.map(([scheduled, repair, inspection], index) => ({ date: dayFromToday(index + 1), scheduled, repair, inspection }));
})();

export const DOWNTIME_VEHICLES: DowntimeVehicle[] = [
  { id: 'x1', vehicle: 'Van 21', reason: 'repair', from: dayFromToday(1), to: dayFromToday(4), detail: 'Brakes and cooling' },
  { id: 'x2', vehicle: 'Truck 02', reason: 'scheduled', from: dayFromToday(1), to: dayFromToday(1), detail: 'Oil and filter' },
  { id: 'x3', vehicle: 'Pickup 09', reason: 'inspection', from: dayFromToday(3), to: dayFromToday(3), detail: 'Annual' },
  { id: 'x4', vehicle: 'Van 18', reason: 'scheduled', from: dayFromToday(7), to: dayFromToday(7), detail: 'Transmission fluid' },
  { id: 'x5', vehicle: 'Truck 05', reason: 'scheduled', from: dayFromToday(14), to: dayFromToday(14), detail: 'Coolant flush' },
];

/* ---------- work orders and repairs ---------- */

export const WORK_ORDER: WorkOrder = {
  id: 'WO-2261',
  title: 'Replace front brake pads and rotors',
  vehicle: 'Van 21 · 6HJP118',
  status: 'in-bay',
  priority: 'urgent',
  technician: 'Tomas Reyes',
  bay: 'Bay 2',
  openedOn: '2026-09-26',
  tasks: [
    { id: 't1', label: 'Lift and remove front wheels', done: true },
    { id: 't2', label: 'Measure rotor thickness', done: true },
    { id: 't3', label: 'Fit new rotors and pads', done: false },
    { id: 't4', label: 'Bleed brake fluid', done: false },
    { id: 't5', label: 'Road test and torque check', done: false },
  ],
  parts: [
    { id: 'p1', name: 'Front brake rotor', qty: 2, unitCost: 68.5 },
    { id: 'p2', name: 'Front brake pad set', qty: 1, unitCost: 54 },
    { id: 'p3', name: 'DOT 4 brake fluid, 1 L', qty: 1, unitCost: 14.2 },
  ],
  laborHours: 3.5,
  laborRate: 95,
};

const board = (id: string, title: string, vehicle: string, status: BoardOrder['status'], priority: BoardOrder['priority'], technician: string | undefined, openedOn: string): BoardOrder => ({
  id,
  title,
  vehicle,
  status,
  priority,
  technician,
  openedOn,
});
export const BOARD_ORDERS: BoardOrder[] = [
  board('WO-2268', 'Coolant leak at water pump', 'Van 12', 'requested', 'urgent', undefined, '2026-09-29'),
  board('WO-2267', 'Wheel speed sensor fault', 'Van 21', 'requested', 'normal', undefined, '2026-09-28'),
  board('WO-2265', '60,000 km service', 'Van 03', 'scheduled', 'normal', 'Aisha Khan', '2026-09-27'),
  board('WO-2264', 'Coolant flush', 'Truck 05', 'scheduled', 'low', 'Aisha Khan', '2026-09-27'),
  board('WO-2261', 'Front brakes and rotors', 'Van 21', 'in-bay', 'urgent', 'Tomas Reyes', '2026-09-26'),
  board('WO-2259', 'Misfire diagnosis', 'Pickup 09', 'in-bay', 'high', 'Tomas Reyes', '2026-09-25'),
  board('WO-2256', 'Replace exhaust catalyst', 'Van 18', 'waiting-parts', 'high', 'Aisha Khan', '2026-09-22'),
  board('WO-2250', 'Oil and filter', 'Truck 02', 'done', 'normal', 'Tomas Reyes', '2026-09-20'),
  board('WO-2247', 'Tail light repair', 'Van 07', 'done', 'low', 'Aisha Khan', '2026-09-18'),
];

export const CHECKLIST: ChecklistSection[] = [
  {
    title: 'Outside',
    items: [
      { id: 'lights', label: 'Headlights, indicators and brake lights work' },
      { id: 'tyres', label: 'Tyres are inflated and undamaged' },
      { id: 'glass', label: 'Windscreen and wipers are clear and working' },
      { id: 'body', label: 'No new body damage' },
    ],
  },
  {
    title: 'Under the bonnet',
    items: [
      { id: 'oil', label: 'Oil level is between the marks' },
      { id: 'coolant', label: 'Coolant level is correct' },
    ],
  },
  {
    title: 'In the cab',
    items: [
      { id: 'brakes', label: 'Brakes feel firm', critical: true },
      { id: 'steering', label: 'Steering has no play', critical: true },
      { id: 'belts', label: 'Seat belts latch and release', critical: true },
      { id: 'horn', label: 'Horn works' },
    ],
  },
  {
    title: 'Safety kit',
    items: [
      { id: 'extinguisher', label: 'Fire extinguisher is in date' },
      { id: 'triangle', label: 'Warning triangle is on board' },
    ],
  },
];
export const CHECKLIST_ANSWERS = { lights: 'pass', tyres: 'pass', glass: 'pass', body: 'fail', oil: 'pass', coolant: 'pass', brakes: 'pass', steering: 'pass', belts: 'pass' } as const;

export const ESTIMATE_LINES: EstimateLine[] = [
  { id: 'l1', type: 'part', description: 'Front brake rotors (pair)', qty: 2, unitPrice: 68.5 },
  { id: 'l2', type: 'part', description: 'Front brake pad set', qty: 1, unitPrice: 54 },
  { id: 'l3', type: 'part', description: 'DOT 4 brake fluid, 1 L', qty: 1, unitPrice: 14.2 },
  { id: 'l4', type: 'labor', description: 'Fit rotors and pads, bleed brakes', qty: 3.5, unitPrice: 95 },
  { id: 'l5', type: 'labor', description: 'Road test and torque check', qty: 0.5, unitPrice: 95 },
  { id: 'l6', type: 'part', description: 'Rear brake pad set', qty: 1, unitPrice: 48, optional: true },
  { id: 'l7', type: 'labor', description: 'Fit rear pads', qty: 1, unitPrice: 95, optional: true },
];

/* ---------- parts and inventory ---------- */

export const PARTS: Part[] = [
  { sku: 'BRK-FR-350', name: 'Front brake pad set, Transit', category: 'Brakes', bin: 'A-04-2', onHand: 6, min: 4, unitCost: 54, supplier: 'Northline Parts' },
  { sku: 'BRK-RT-350', name: 'Front brake rotor, Transit', category: 'Brakes', bin: 'A-04-3', onHand: 3, min: 4, unitCost: 68.5, supplier: 'Northline Parts' },
  { sku: 'OIL-FLT-35', name: 'Oil filter, 3.5 L V6', category: 'Filters', bin: 'B-01-1', onHand: 42, min: 20, unitCost: 6.8, supplier: 'Filtrex' },
  { sku: 'AIR-FLT-35', name: 'Air filter, Transit', category: 'Filters', bin: 'B-01-4', onHand: 11, min: 8, unitCost: 17.5, supplier: 'Filtrex' },
  { sku: 'OIL-5W30-5', name: 'Engine oil 5W-30, 5 L', category: 'Fluids', bin: 'C-02-1', onHand: 18, min: 12, unitCost: 32, supplier: 'Lubeco' },
  { sku: 'CLT-50-20', name: 'Coolant 50/50, 20 L', category: 'Fluids', bin: 'C-02-3', onHand: 2, min: 3, unitCost: 46, supplier: 'Lubeco' },
  { sku: 'BAT-H8-95', name: 'Battery H8 95 Ah', category: 'Electrical', bin: 'D-01-1', onHand: 0, min: 2, unitCost: 168, supplier: 'VoltCo' },
  { sku: 'WPR-24-19', name: 'Wiper blade set 24/19"', category: 'Body', bin: 'E-03-2', onHand: 14, min: 6, unitCost: 15.9, supplier: 'ClearView' },
  { sku: 'SPK-IR-6', name: 'Spark plug, iridium (6 pack)', category: 'Engine', bin: 'F-02-2', onHand: 5, min: 3, unitCost: 62, supplier: 'IgniteCo' },
  { sku: 'TYR-235-65', name: 'Tyre 235/65 R16C', category: 'Tyres', bin: 'T-01', onHand: 9, min: 8, unitCost: 142, supplier: 'RoadGrip' },
  { sku: 'BLT-SRP-35', name: 'Serpentine belt, 3.5 L', category: 'Engine', bin: 'F-04-1', onHand: 4, min: 2, unitCost: 31, supplier: 'IgniteCo' },
  { sku: 'BLB-H7-2', name: 'Headlight bulb H7 (pair)', category: 'Electrical', bin: 'D-02-4', onHand: 22, min: 10, unitCost: 11.4, supplier: 'VoltCo' },
];

export const STOCK_LEVELS: StockLevel[] = [
  { id: 'a', name: 'Front brake pad set, Transit', onHand: 6, min: 4, max: 14 },
  { id: 'b', name: 'Front brake rotor, Transit', onHand: 3, min: 4, max: 12, onOrder: 6 },
  { id: 'c', name: 'Coolant 50/50, 20 L', onHand: 2, min: 3, max: 10 },
  { id: 'd', name: 'Battery H8 95 Ah', onHand: 0, min: 2, max: 6 },
  { id: 'e', name: 'Oil filter, 3.5 L V6', onHand: 42, min: 20, max: 60 },
];

export const REORDER: ReorderSuggestion[] = [
  { sku: 'BAT-H8-95', name: 'Battery H8 95 Ah', onHand: 0, min: 2, suggestedQty: 4, supplier: 'VoltCo', leadTimeDays: 2, unitCost: 168 },
  { sku: 'CLT-50-20', name: 'Coolant 50/50, 20 L', onHand: 2, min: 3, suggestedQty: 6, supplier: 'Lubeco', leadTimeDays: 3, unitCost: 46 },
  { sku: 'BRK-RT-350', name: 'Front brake rotor, Transit', onHand: 3, min: 4, suggestedQty: 8, supplier: 'Northline Parts', leadTimeDays: 4, unitCost: 68.5 },
  { sku: 'TYR-235-65', name: 'Tyre 235/65 R16C', onHand: 8, min: 8, suggestedQty: 8, supplier: 'RoadGrip', leadTimeDays: 5, unitCost: 142 },
];

export const USAGE_SERIES = [
  { key: 'brakes', label: 'Brake pads' },
  { key: 'oil', label: 'Oil filters' },
  { key: 'tyres', label: 'Tyres' },
  { key: 'wipers', label: 'Wipers' },
];
export const USAGE_DATA = (() => {
  const random = seeded(77);
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  return months.map((label, index) => ({
    label,
    brakes: Math.round(5 + random() * 4 + (index > 8 ? 3 : 0)),
    oil: Math.round(16 + random() * 8),
    tyres: Math.round(4 + random() * 6 + (index === 3 || index === 4 ? 5 : 0)),
    wipers: Math.round(2 + random() * 5 + (index === 0 || index === 1 || index === 2 ? 4 : 0)),
  }));
})();

export const PART_DETAIL: PartDetail = {
  sku: 'BRK-FR-350',
  name: 'Front brake pad set, Transit',
  category: 'Brakes',
  description: 'Ceramic pads with wear sensor. Sold as a set for one axle.',
  fits: [
    { vehicle: 'Van 12 · Ford Transit 350', note: '2021' },
    { vehicle: 'Van 18 · Ford Transit 350', note: '2020' },
    { vehicle: 'Van 07 · Ford Transit 250', note: 'same part, 2022' },
  ],
  suppliers: [
    { name: 'Northline Parts', unitCost: 54, leadTimeDays: 2, preferred: true },
    { name: 'Fleetway Supply', unitCost: 51.5, leadTimeDays: 6 },
    { name: 'AutoDirect', unitCost: 58, leadTimeDays: 1 },
  ],
  priceHistory: [
    { date: '2025-10-01', unitCost: 47 },
    { date: '2025-12-01', unitCost: 47 },
    { date: '2026-02-01', unitCost: 49.5 },
    { date: '2026-04-01', unitCost: 52 },
    { date: '2026-06-01', unitCost: 52 },
    { date: '2026-08-01', unitCost: 54 },
  ],
  stock: [
    { location: 'Main workshop', onHand: 4, bin: 'A-04-2' },
    { location: 'North depot', onHand: 2, bin: 'S-01' },
    { location: 'Service van 1', onHand: 0 },
  ],
};

export const PO_LINES: POLine[] = [
  { sku: 'BRK-RT-350', name: 'Front brake rotor, Transit', qty: 8, received: 0, unitCost: 68.5 },
  { sku: 'BRK-FR-350', name: 'Front brake pad set, Transit', qty: 6, received: 4, unitCost: 54 },
  { sku: 'BRK-FL-1', name: 'Brake fluid DOT 4, 1 L', qty: 12, received: 12, unitCost: 14.2 },
];

/* ---------- tyres, fuel and fluids ---------- */

export const VAN_12_TIRES: Tire[] = [
  { axle: 1, side: 'left', position: 'Front left', treadMm: 6.4, pressureKpa: 410, targetKpa: 415, ageMonths: 14, rotateAtKm: 147000 },
  { axle: 1, side: 'right', position: 'Front right', treadMm: 5.1, pressureKpa: 365, targetKpa: 415, ageMonths: 14, rotateAtKm: 147000 },
  { axle: 2, side: 'left', position: 'Rear left', treadMm: 3.2, pressureKpa: 470, targetKpa: 480, ageMonths: 26, rotateAtKm: 147000 },
  { axle: 2, side: 'right', position: 'Rear right', treadMm: 2.0, pressureKpa: 475, targetKpa: 480, ageMonths: 26, rotateAtKm: 147000 },
];
export const TRUCK_05_TIRES: Tire[] = [
  { axle: 1, side: 'left', position: 'Steer L', treadMm: 9.2, pressureKpa: 620, targetKpa: 620, ageMonths: 10 },
  { axle: 1, side: 'right', position: 'Steer R', treadMm: 8.8, pressureKpa: 615, targetKpa: 620, ageMonths: 10 },
  { axle: 2, side: 'left', position: 'Drive L (dual)', treadMm: 6.1, pressureKpa: 690, targetKpa: 690, ageMonths: 18 },
  { axle: 2, side: 'right', position: 'Drive R (dual)', treadMm: 5.7, pressureKpa: 685, targetKpa: 690, ageMonths: 18 },
  { axle: 3, side: 'left', position: 'Rear L (dual)', treadMm: 4.4, pressureKpa: 690, targetKpa: 690, ageMonths: 30 },
  { axle: 3, side: 'right', position: 'Rear R (dual)', treadMm: 3.9, pressureKpa: 610, targetKpa: 690, ageMonths: 30 },
];

export const FUEL_VEHICLES = [
  { id: 'v12', name: 'Van 12' },
  { id: 'v07', name: 'Van 07' },
  { id: 'v21', name: 'Van 21' },
  { id: 'v03', name: 'Van 03' },
];
export const FUEL_DATA: FuelEconomyPoint[] = (() => {
  const random = seeded(31);
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  return months.map((label, index) => {
    const winter = [2, 3, 4, 5].includes(index) ? 0.7 : 0;
    const v12 = 11.4 + winter + random() * 0.5 + index * 0.06;
    const v07 = 10.6 + winter + random() * 0.4;
    const v21 = 12.8 + winter + random() * 0.6 + index * 0.12;
    const v03 = 9.8 + winter + random() * 0.3;
    return { label, v12: +v12.toFixed(2), v07: +v07.toFixed(2), v21: +v21.toFixed(2), v03: +v03.toFixed(2), fleet: +((v12 + v07 + v21 + v03) / 4).toFixed(2) };
  });
})();

export const FLUIDS: FluidLevel[] = [
  { id: 'oil', label: 'Engine oil life', level: 34, note: 'About 4,000 km until the next change' },
  { id: 'coolant', label: 'Coolant', level: 22, note: 'Top up, and check for a leak' },
  { id: 'brake', label: 'Brake fluid', level: 78 },
  { id: 'washer', label: 'Washer fluid', level: 60 },
];
export const BATTERY = { voltage: 12.3, healthPercent: 54, coldCrankAmps: 510, testedOn: '2026-09-12' };

export const FUEL_TX: FuelTransaction[] = [
  { id: 'f1', date: '2026-09-28', time: '07:42', station: 'Shell, Cesar Chavez St', vehicle: 'Van 12', litres: 61.4, total: 103.2, odometerKm: 148102 },
  { id: 'f2', date: '2026-09-28', time: '14:05', station: 'Chevron, Van Ness Ave', vehicle: 'Van 21', litres: 118.7, total: 199.5, odometerKm: 231790, flags: ['over-capacity'] },
  { id: 'f3', date: '2026-09-27', time: '22:31', station: 'Arco, Bayshore Blvd', vehicle: 'Pickup 09', litres: 48.2, total: 81, flags: ['while-idle'] },
  { id: 'f4', date: '2026-09-27', time: '09:10', station: 'Shell, Cesar Chavez St', vehicle: 'Van 03', litres: 52.9, total: 88.9, odometerKm: 54010 },
  { id: 'f5', date: '2026-09-26', time: '16:44', station: 'Chevron, Van Ness Ave', vehicle: 'Truck 02', litres: 74.1, total: 124.5, odometerKm: 204190, flags: ['duplicate'] },
  { id: 'f6', date: '2026-09-26', time: '16:47', station: 'Chevron, Van Ness Ave', vehicle: 'Truck 02', litres: 74.1, total: 124.5, odometerKm: 204190, flags: ['duplicate'] },
  { id: 'f7', date: '2026-09-25', time: '08:20', station: 'Valero, 3rd St', vehicle: 'Van 07', litres: 57.3, total: 96.3, odometerKm: 96210 },
  { id: 'f8', date: '2026-09-25', time: '11:52', station: 'Shell, Daly City', vehicle: 'Van 18', litres: 63.6, total: 106.9, odometerKm: 187480, flags: ['off-route'] },
];

/* ---------- fleet stats and costs ---------- */

export const KPIS: Kpi[] = [
  { id: 'avail', label: 'Availability', value: '91.4%', delta: -2.1, goodWhen: 'up', trend: [95, 94, 95, 93, 94, 92, 91.4] },
  { id: 'cpk', label: 'Cost per km', value: '$0.47', delta: 3.8, goodWhen: 'down', trend: [0.42, 0.43, 0.43, 0.45, 0.44, 0.46, 0.47] },
  { id: 'wo', label: 'Open work orders', value: '9', delta: 12.5, goodWhen: 'down', trend: [5, 6, 6, 7, 8, 8, 9] },
  { id: 'age', label: 'Average age', value: '4.6', unit: 'years', delta: 0, trend: [4.1, 4.2, 4.3, 4.3, 4.4, 4.5, 4.6] },
];

export const COST_CATEGORIES: CostCategory[] = [
  { key: 'fuel', label: 'Fuel' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'tires', label: 'Tyres' },
  { key: 'insurance', label: 'Insurance' },
];
export const COST_ROWS: CostRow[] = [
  { name: 'Van 21', distanceKm: 31200, fuel: 6100, maintenance: 5400, tires: 900, insurance: 2400 },
  { name: 'Truck 02', distanceKm: 38400, fuel: 7800, maintenance: 3900, tires: 1600, insurance: 3100 },
  { name: 'Van 18', distanceKm: 34800, fuel: 5900, maintenance: 2600, tires: 700, insurance: 2200 },
  { name: 'Van 12', distanceKm: 36900, fuel: 6300, maintenance: 2100, tires: 800, insurance: 2300 },
  { name: 'Truck 05', distanceKm: 41200, fuel: 8100, maintenance: 1800, tires: 1400, insurance: 3200 },
  { name: 'Pickup 09', distanceKm: 26700, fuel: 3900, maintenance: 1100, tires: 500, insurance: 1700 },
  { name: 'Van 07', distanceKm: 35500, fuel: 5600, maintenance: 1200, tires: 600, insurance: 2400 },
  { name: 'Van 03', distanceKm: 33100, fuel: 5100, maintenance: 800, tires: 300, insurance: 2500 },
];

export const UTILIZATION_ROWS: UtilizationRow[] = (() => {
  const random = seeded(2026);
  return VEHICLES.map((vehicle, row) => ({
    vehicle: vehicle.name,
    days: Array.from({ length: 28 }, (_, day): DayState => {
      const weekday = (day + 1) % 7;
      if (weekday === 0 || weekday === 6) return random() > 0.85 ? 'used' : 'off';
      if (vehicle.id === 'v21' && day >= 22) return 'shop';
      if (vehicle.id === 'v18' && day >= 25) return 'shop';
      if (vehicle.id === 't02' && day === 12) return 'shop';
      const busy = 0.9 - row * 0.05;
      return random() < busy ? 'used' : 'idle';
    }),
  }));
})();

export const LEADERBOARD: LeaderboardVehicle[] = [
  { id: 'v21', name: 'Van 21', costPerKm: 0.91, downtimeDays: 14, fuelL100: 14.6 },
  { id: 't02', name: 'Truck 02', costPerKm: 0.7, downtimeDays: 6, fuelL100: 20.3 },
  { id: 'v18', name: 'Van 18', costPerKm: 0.5, downtimeDays: 8, fuelL100: 12.9 },
  { id: 'v12', name: 'Van 12', costPerKm: 0.44, downtimeDays: 4, fuelL100: 12.1 },
  { id: 't05', name: 'Truck 05', costPerKm: 0.37, downtimeDays: 2, fuelL100: 19.4 },
  { id: 'p09', name: 'Pickup 09', costPerKm: 0.34, downtimeDays: 3, fuelL100: 11.8 },
  { id: 'v07', name: 'Van 07', costPerKm: 0.29, downtimeDays: 1, fuelL100: 11.3 },
  { id: 'v03', name: 'Van 03', costPerKm: 0.27, downtimeDays: 0, fuelL100: 10.4 },
];
export const LEADERBOARD_METRICS: LeaderboardMetric[] = [
  { key: 'costPerKm', label: 'Cost per km', format: (value) => `$${value.toFixed(2)}`, higherIsWorse: true },
  { key: 'downtimeDays', label: 'Downtime', format: (value) => `${value} ${value === 1 ? 'day' : 'days'}`, higherIsWorse: true },
  { key: 'fuelL100', label: 'Fuel use', format: (value) => `${value.toFixed(1)} L/100 km`, higherIsWorse: true },
];

export const REPLACEMENT_PROJECTION: YearProjection[] = [
  { year: 1, running: 900, resale: 34500 },
  { year: 2, running: 1400, resale: 29000 },
  { year: 3, running: 2100, resale: 24800 },
  { year: 4, running: 2900, resale: 21000 },
  { year: 5, running: 3900, resale: 17800 },
  { year: 6, running: 5200, resale: 14900 },
  { year: 7, running: 6800, resale: 12400 },
  { year: 8, running: 8700, resale: 10200 },
  { year: 9, running: 10900, resale: 8400 },
  { year: 10, running: 13400, resale: 6800 },
];
