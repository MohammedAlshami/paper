import type { ApiRow } from './md';
import type { ComponentEntry } from './registry';

const row = (prop: string, type: string, description: string, def?: string): ApiRow => ({ prop, type, description, ...(def ? { default: def } : {}) });
const accent = (what: string) => row('accentColor', 'string', `Colour of ${what}. Charts and inline styles cannot read CSS variables, so pass a value.`, "'#ec4899'");
const cls = (on = 'the card') => row('className', 'string', `Merged onto ${on}.`);
const icons = ['lucide-react'];
const charts = ['recharts', 'lucide-react'];
const currency = row('currency', 'string', 'An ISO currency code, used to format money.', "'USD'");

const entry = (e: Omit<ComponentEntry, 'status' | 'file'> & { file: string }): ComponentEntry => ({ status: 'new', ...e, file: `components/fleet/${e.file}.tsx` });

export const FLEET_COMPONENTS: ComponentEntry[] = [
  /* ---------- Vehicle health and records ---------- */
  entry({
    id: 'vehicle-health-card',
    name: 'VehicleHealthCard',
    category: 'Vehicle health and records',
    tagline: 'One vehicle at a glance: a score, what is wrong, what is next.',
    description: 'A health ring from 0 to 100, the plate and odometer, a list of open issues by severity, and the next booked service with schedule and open actions. Under 60 the ring turns to the accent colour.',
    file: 'vehicle-health-card',
    primitives: ['badge', 'button', 'card'],
    deps: icons,
    usage: `<VehicleHealthCard
  name="Van 21"
  model="2019 Mercedes Sprinter 2500"
  plate="6HJP118"
  odometerKm={231880}
  score={54}
  issues={[
    { id: 'i1', label: 'Coolant leak at the water pump', severity: 'critical' },
    { id: 'i2', label: 'Rear brake pads at 15%', severity: 'major' },
  ]}
  nextService={{ label: 'Brakes and cooling repair', due: 'Booked Thu 1 Oct · Bay 2' }}
  onOpen={() => openVehicle('v21')}
/>`,
    anatomy: `import { VehicleHealthCard, type HealthIssue } from '@/components/fleet/vehicle-health-card';

// score is 0 to 100, computed by you: from open issues, overdue services, fault codes.
// severity: 'minor' | 'major' | 'critical'. Critical issues also show a count badge.
<VehicleHealthCard name={name} model={model} plate={plate} odometerKm={km} score={score} issues={issues} />`,
    examples: [{ label: 'A healthy vehicle', code: `<VehicleHealthCard name="Van 03" model="2023 Ram ProMaster 2500" plate="9QRS340" odometerKm={54120} score={96} issues={[]} />` }],
    api: [{ title: 'VehicleHealthCard', description: 'A card for one vehicle.', rows: [row('name', 'string', 'The fleet name, e.g. "Van 21".'), row('model', 'string', 'Year, make and model.'), row('plate', 'string', 'Shown in a plate-style box.'), row('odometerKm', 'number', 'Current reading.'), row('score', 'number', '0 to 100. Under 60 is drawn in the accent colour.'), row('issues', 'HealthIssue[]', 'id, label and severity for each open issue.'), row('nextService', '{ label; due }', 'The next booked service. Free text for due.'), row('onOpen', '() => void', 'Adds an Open button.'), row('onSchedule', '() => void', 'Called when Schedule is pressed.'), accent('the low-score ring and critical issues'), cls()] }],
  }),
  entry({
    id: 'vehicle-spec-sheet',
    name: 'VehicleSpecSheet',
    category: 'Vehicle health and records',
    tagline: 'The facts about a vehicle, grouped so they can be found.',
    description: 'Identity, powertrain, capacity and compliance details in labelled groups. Rows marked copyable, like the VIN and plate, are set in mono with a copy button that appears on hover.',
    file: 'vehicle-spec-sheet',
    primitives: ['card'],
    deps: icons,
    usage: `<VehicleSpecSheet
  title="Van 12"
  subtitle="2021 Ford Transit 350 · 148,210 km"
  groups={[
    { title: 'Identity', rows: [{ label: 'Plate', value: '8KTR204', copyable: true }, { label: 'VIN', value: '1FTBW2CM5MKA48213', copyable: true }] },
    { title: 'Capacity', rows: [{ label: 'Payload', value: '1,470 kg' }, { label: 'Fuel tank', value: '95 L' }] },
  ]}
/>`,
    anatomy: `import { VehicleSpecSheet, type SpecGroup } from '@/components/fleet/vehicle-spec-sheet';

// Values are strings, already formatted. Groups lay out in two columns once the card is wide enough
// and stack below that, so it works in a narrow side panel too.
<VehicleSpecSheet title={name} groups={groups} />`,
    examples: [{ label: 'Two groups only', code: `<VehicleSpecSheet title="Pickup 09" subtitle="2021 Toyota Tacoma" groups={groups.slice(0, 2)} />` }],
    api: [{ title: 'VehicleSpecSheet', description: 'Grouped key-value details.', rows: [row('title', 'string', 'The vehicle name.'), row('subtitle', 'string', 'e.g. year, model and odometer.'), row('groups', 'SpecGroup[]', 'A title and rows: label, value and an optional copyable flag.'), cls()] }],
  }),
  entry({
    id: 'vehicle-timeline',
    name: 'VehicleTimeline',
    category: 'Vehicle health and records',
    tagline: 'A vehicle’s whole life, in order.',
    description: 'Purchases, services, repairs, inspections, incidents and notes, newest first and grouped by year, with a running cost total. Filter by type; tap an event for its detail.',
    file: 'vehicle-timeline',
    primitives: ['badge', 'card'],
    deps: icons,
    usage: `<VehicleTimeline
  events={[
    { id: 'e1', type: 'purchase', title: 'Bought new', date: '2021-03-18', odometerKm: 12, cost: 41800 },
    { id: 'e2', type: 'repair', title: 'Replaced water pump', date: '2026-09-02', odometerKm: 147300, cost: 940, detail: 'Coolant leak at the pump.' },
  ]}
/>`,
    anatomy: `import { VehicleTimeline, type TimelineEvent } from '@/components/fleet/vehicle-timeline';

// type: 'purchase' | 'service' | 'repair' | 'inspection' | 'incident' | 'note'
// date is an ISO string. Events with a detail expand when tapped. Incidents use the accent colour.
<VehicleTimeline events={events} />`,
    examples: [{ label: 'Repairs only', code: `<VehicleTimeline events={events.filter((e) => e.type === 'repair' || e.type === 'incident')} />` }],
    api: [{ title: 'VehicleTimeline', description: 'A filterable list of events.', rows: [row('events', 'TimelineEvent[]', 'id, type, title, date, and optionally odometerKm, cost and detail.'), currency, row('onSelect', '(event: TimelineEvent) => void', 'Called when an event is pressed.'), accent('incident markers'), cls()] }],
  }),
  entry({
    id: 'diagnostic-code-list',
    name: 'DiagnosticCodeList',
    category: 'Vehicle health and records',
    tagline: 'Fault codes in plain English, worst first.',
    description: 'OBD-II codes sorted by severity, each with a plain-English meaning, its system, when it first appeared and how often. Expand a code for likely causes, and create a work order or clear it.',
    file: 'diagnostic-code-list',
    primitives: ['badge', 'button', 'card'],
    deps: icons,
    usage: `<DiagnosticCodeList
  codes={[
    { code: 'P0300', description: 'Random misfire detected.', system: 'Engine', severity: 'critical', status: 'active', firstSeen: '2026-09-24', occurrences: 6, likelyCauses: ['Worn spark plugs', 'Failing ignition coil'] },
  ]}
  onCreateWorkOrder={(code) => createWorkOrder(code)}
  onClear={(code) => api.clearCode(code.code)}
/>`,
    anatomy: `import { DiagnosticCodeList, type DiagnosticCode } from '@/components/fleet/diagnostic-code-list';

// severity: 'info' | 'warning' | 'critical'   status: 'active' | 'pending' | 'cleared'
// Translate the SAE description yourself: "Random misfire detected", not "Cylinder misfire".
<DiagnosticCodeList codes={codes} />`,
    examples: [{ label: 'A clean vehicle', code: `<DiagnosticCodeList codes={[]} />` }],
    api: [{ title: 'DiagnosticCodeList', description: 'Codes, worst first. Cleared codes are hidden until you ask for them.', rows: [row('codes', 'DiagnosticCode[]', 'code, description, system, severity, status, firstSeen, occurrences and optional likelyCauses.'), row('onClear', '(code: DiagnosticCode) => void', 'Called when Clear code is pressed. The code is then shown as cleared.'), row('onCreateWorkOrder', '(code: DiagnosticCode) => void', 'Called when Create work order is pressed.'), accent('critical codes'), cls()] }],
  }),
  entry({
    id: 'document-expiry-tracker',
    name: 'DocumentExpiryTracker',
    category: 'Vehicle health and records',
    tagline: 'Registration, insurance and inspections, and how long they have left.',
    description: 'Every compliance document soonest first, with days left, a bar for how much of its life remains, and a filter for expired, due soon and valid. Expired ones use the accent colour; a Renew action is optional.',
    file: 'document-expiry-tracker',
    primitives: ['badge', 'card'],
    deps: icons,
    usage: `<DocumentExpiryTracker
  documents={[
    { id: 'd1', name: 'Insurance', vehicle: 'Van 21', expiresOn: '2026-09-20', issuedOn: '2025-09-20' },
    { id: 'd2', name: 'Registration', vehicle: 'Truck 02', expiresOn: '2026-10-11', issuedOn: '2025-10-11' },
  ]}
  soonDays={30}
  onRenew={(document) => startRenewal(document)}
/>`,
    anatomy: `import { DocumentExpiryTracker, type FleetDocument } from '@/components/fleet/document-expiry-tracker';

// Dates are ISO strings. Pass today in tests and demos so the days left do not change under you.
// issuedOn is optional; with it, each row shows a bar for how much of the document's life is left.
<DocumentExpiryTracker documents={documents} />`,
    examples: [{ label: 'Only what is valid', code: `<DocumentExpiryTracker documents={documents.filter((d) => d.expiresOn > '2027-01-01')} />` }],
    api: [{ title: 'DocumentExpiryTracker', description: 'Documents sorted by days left.', rows: [row('documents', 'FleetDocument[]', 'id, name, vehicle, expiresOn and optionally issuedOn.'), row('today', 'string', 'An ISO date treated as today.', 'today'), row('soonDays', 'number', 'Expiring within this many days is flagged "due soon".', '30'), row('onRenew', '(document: FleetDocument) => void', 'When set, a Renew button appears on expired and due-soon rows.'), accent('expired documents'), cls()] }],
  }),

  /* ---------- Maintenance scheduling ---------- */
  entry({
    id: 'service-due-list',
    name: 'ServiceDueList',
    category: 'Maintenance scheduling',
    tagline: 'What is due or overdue across the fleet, most urgent first.',
    description: 'Services due by distance, by date, or both, sorted by how close each is to its limit. Each row says how many kilometres or days are left (or over) and offers a Schedule action. Filter by overdue, due soon and upcoming.',
    file: 'service-due-list',
    primitives: ['badge', 'button', 'card'],
    deps: icons,
    usage: `<ServiceDueList
  items={[
    { id: 's1', vehicle: 'Van 21', service: 'Brake inspection', dueKm: 230000, currentKm: 231880, dueDate: '2026-09-23' },
    { id: 's2', vehicle: 'Truck 02', service: 'Oil and filter', dueKm: 205000, currentKm: 204350 },
  ]}
  onSchedule={(item) => openBooking(item)}
/>`,
    anatomy: `import { ServiceDueList, type DueService } from '@/components/fleet/service-due-list';

// A service can be due by distance (dueKm + currentKm), by date (dueDate), or both.
// Whichever is closest to its limit decides the urgency, so a service can be overdue by date alone.
<ServiceDueList items={items} />`,
    examples: [{ label: 'A tighter window', code: `<ServiceDueList items={items} soonKm={500} soonDays={7} />` }],
    api: [{ title: 'ServiceDueList', description: 'A sorted, filterable list.', rows: [row('items', 'DueService[]', 'id, vehicle, service, and any of dueKm and currentKm, or dueDate.'), row('today', 'string', 'An ISO date treated as today.', 'today'), row('soonKm', 'number', 'Within this many km of the due reading counts as "due soon".', '1500'), row('soonDays', 'number', 'Within this many days of the due date counts as "due soon".', '14'), row('onSchedule', '(item: DueService) => void', 'Called when Schedule is pressed.'), accent('the overdue edge and text'), cls()] }],
  }),
  entry({
    id: 'maintenance-calendar',
    name: 'MaintenanceCalendar',
    category: 'Maintenance scheduling',
    tagline: 'A month of booked services. Pick a day to see the bays.',
    description: 'A month grid with each day’s booked vehicles, today marked, and month navigation. On a phone the cells show dots instead of names. Pick a day to list its services with the bay and status.',
    file: 'maintenance-calendar',
    primitives: ['button', 'card'],
    deps: icons,
    usage: `<MaintenanceCalendar
  services={[
    { id: 'b1', date: '2026-10-01', vehicle: 'Van 21', service: 'Front brakes', bay: 'Bay 2', status: 'booked' },
    { id: 'b2', date: '2026-10-01', vehicle: 'Truck 02', service: 'Oil and filter', bay: 'Bay 1' },
  ]}
  defaultMonth="2026-10"
  onSelectService={(service) => openService(service)}
/>`,
    anatomy: `import { MaintenanceCalendar, type BookedService } from '@/components/fleet/maintenance-calendar';

// Weeks start on Monday. Dates are ISO strings; defaultMonth is "YYYY-MM".
// status: 'booked' | 'in-progress' | 'done'
<MaintenanceCalendar services={services} defaultMonth="2026-10" />`,
    examples: [{ label: 'An empty month', code: `<MaintenanceCalendar services={services} defaultMonth="2026-11" />` }],
    api: [{ title: 'MaintenanceCalendar', description: 'A month view with a day detail list.', rows: [row('services', 'BookedService[]', 'id, date, vehicle, service, and optionally bay and status.'), row('defaultMonth', 'string', '"YYYY-MM", the month shown first.', 'this month'), row('today', 'string', 'An ISO date drawn as today.', 'today'), row('defaultSelected', 'string', 'An ISO date selected at the start.'), row('onSelectDay', '(date: string, services: BookedService[]) => void', 'Called when a day is picked.'), row('onSelectService', '(service: BookedService) => void', 'Called when a service in the day list is pressed.'), accent('today and the selected day'), cls()] }],
  }),
  entry({
    id: 'pm-schedule-builder',
    name: 'PMScheduleBuilder',
    category: 'Maintenance scheduling',
    tagline: 'Set the maintenance intervals once, per vehicle class.',
    description: 'A tab per vehicle class, with its tasks as editable rows: every N kilometres, every N months, whichever comes first. Add and remove tasks, see when there are unsaved changes, and save the whole schedule.',
    file: 'pm-schedule-builder',
    primitives: ['button', 'card', 'input'],
    deps: icons,
    usage: `<PMScheduleBuilder
  defaultValue={[
    { id: 'van', name: 'Vans', vehicleCount: 5, tasks: [
      { id: 'oil', task: 'Oil and filter', everyKm: 12000, everyMonths: 6 },
      { id: 'rot', task: 'Tyre rotation', everyKm: 15000 },
    ] },
  ]}
  onSave={(schedule) => api.saveSchedule(schedule)}
/>`,
    anatomy: `import { PMScheduleBuilder, type PMClass } from '@/components/fleet/pm-schedule-builder';

// A task with only everyKm is distance-based; with only everyMonths it is date-based; with both, whichever is first.
// The component holds the edits. onChange fires on every edit, onSave on Save.
<PMScheduleBuilder defaultValue={schedule} onSave={save} />`,
    examples: [{ label: 'One class', code: `<PMScheduleBuilder defaultValue={schedule.slice(1, 2)} />` }],
    api: [{ title: 'PMScheduleBuilder', description: 'An editable schedule. It keeps its own copy; use onChange and onSave to read it.', rows: [row('defaultValue', 'PMClass[]', 'Each class has id, name, vehicleCount and tasks (id, task, everyKm?, everyMonths?).'), row('onChange', '(schedule: PMClass[]) => void', 'Fires on every edit with the whole schedule.'), row('onSave', '(schedule: PMClass[]) => void', 'Called when Save schedule is pressed.'), accent('the unsaved-changes dot'), cls()] }],
  }),
  entry({
    id: 'service-interval-gauge',
    name: 'ServiceIntervalGauge',
    category: 'Maintenance scheduling',
    tagline: 'How far through each service interval a vehicle is.',
    description: 'One bar per interval (oil, tyre rotation, brakes, filters) showing how much of it is used, with the distance left or over and when it was last done. The most used interval is at the top.',
    file: 'service-interval-gauge',
    primitives: ['card'],
    deps: icons,
    usage: `<ServiceIntervalGauge
  vehicle="Van 12"
  odometerKm={148210}
  intervals={[
    { id: 'oil', label: 'Oil and filter', everyKm: 12000, lastDoneKm: 138500 },
    { id: 'rot', label: 'Tyre rotation', everyKm: 15000, lastDoneKm: 132000 },
  ]}
/>`,
    anatomy: `import { ServiceIntervalGauge, type ServiceInterval } from '@/components/fleet/service-interval-gauge';

// Used = (odometer - lastDoneKm) / everyKm. At 85% a bar lightens to the accent colour, at 100% it is overdue.
<ServiceIntervalGauge vehicle={name} odometerKm={km} intervals={intervals} />`,
    examples: [{ label: 'A newer vehicle', code: `<ServiceIntervalGauge vehicle="Van 03" odometerKm={54120} intervals={intervals} />` }],
    api: [{ title: 'ServiceIntervalGauge', description: 'Progress through each interval.', rows: [row('vehicle', 'string', 'The vehicle name.'), row('odometerKm', 'number', 'Current reading.'), row('intervals', 'ServiceInterval[]', 'id, label, everyKm and lastDoneKm.'), row('onSelect', '(interval: ServiceInterval) => void', 'Called when an interval row is pressed.'), accent('near-due and overdue bars'), cls()] }],
  }),
  entry({
    id: 'downtime-forecast',
    name: 'DowntimeForecast',
    category: 'Maintenance scheduling',
    tagline: 'How many vehicles will be off the road, day by day.',
    description: 'A stacked bar chart of vehicles out of service each day, split by scheduled service, repair and inspection, the lowest availability in the window, and the list of vehicles that account for it.',
    file: 'downtime-forecast',
    primitives: ['card'],
    deps: charts,
    usage: `<DowntimeForecast
  days={[
    { date: '2026-09-30', scheduled: 1, repair: 1, inspection: 0 },
    { date: '2026-10-01', scheduled: 2, repair: 1, inspection: 0 },
  ]}
  vehicles={[{ id: 'x1', vehicle: 'Van 21', reason: 'repair', from: '2026-09-30', to: '2026-10-03', detail: 'Brakes and cooling' }]}
  fleetSize={8}
/>`,
    anatomy: `import { DowntimeForecast, type DowntimeDay } from '@/components/fleet/downtime-forecast';

// Built on Recharts. Availability = (fleetSize - vehicles out) / fleetSize, for the worst day shown.
// Turns to the accent colour under 75%.
<DowntimeForecast days={days} vehicles={vehicles} fleetSize={8} />`,
    examples: [{ label: 'A larger fleet', code: `<DowntimeForecast days={days} vehicles={vehicles.slice(0, 3)} fleetSize={20} />` }],
    api: [{ title: 'DowntimeForecast', description: 'A chart and a list.', rows: [row('days', 'DowntimeDay[]', 'date, and how many vehicles are out for scheduled, repair and inspection.'), row('vehicles', 'DowntimeVehicle[]', 'id, vehicle, reason, from, to and optionally detail.'), row('fleetSize', 'number', 'Total vehicles, to work out availability.'), accent('repairs and low availability'), cls()] }],
  }),

  /* ---------- Work orders and repairs ---------- */
  entry({
    id: 'work-order-card',
    name: 'WorkOrderCard',
    category: 'Work orders and repairs',
    tagline: 'One repair job: where it is, who has it, what it costs so far.',
    description: 'The status as a five-step bar, priority, technician and bay, a task checklist you can tick, and parts, labour and total cost. A primary action moves the job to its next status.',
    file: 'work-order-card',
    primitives: ['badge', 'button', 'card'],
    deps: icons,
    usage: `<WorkOrderCard
  order={{
    id: 'WO-2261',
    title: 'Replace front brake pads and rotors',
    vehicle: 'Van 21 · 6HJP118',
    status: 'in-bay',
    priority: 'urgent',
    technician: 'Tomas Reyes',
    bay: 'Bay 2',
    openedOn: '2026-09-26',
    tasks: [{ id: 't1', label: 'Lift and remove front wheels', done: true }],
    parts: [{ id: 'p1', name: 'Front brake rotor', qty: 2, unitCost: 68.5 }],
    laborHours: 3.5,
    laborRate: 95,
  }}
  onAdvance={(status) => api.setStatus('WO-2261', status)}
/>`,
    anatomy: `import { WorkOrderCard, WORK_ORDER_STATUSES, type WorkOrder } from '@/components/fleet/work-order-card';

// status: 'requested' | 'scheduled' | 'in-bay' | 'waiting-parts' | 'done'
// priority: 'low' | 'normal' | 'high' | 'urgent'
// The card keeps its own copy of the ticks and the status; use the callbacks to persist them.
<WorkOrderCard order={order} onAdvance={advance} />`,
    examples: [{ label: 'Just requested', code: `<WorkOrderCard order={{ ...order, status: 'requested', technician: undefined, bay: undefined }} />` }],
    api: [{ title: 'WorkOrderCard', description: 'A single job.', rows: [row('order', 'WorkOrder', 'id, title, vehicle, status, priority, technician?, bay?, openedOn, tasks, parts, laborHours and laborRate.'), currency, row('onToggleTask', '(task, done: boolean) => void', 'Called when a task is ticked or unticked.'), row('onAdvance', '(next: WorkOrderStatus) => void', 'Called when the action moves the job to its next status.'), accent('the current step and urgent priority'), cls()] }],
  }),
  entry({
    id: 'work-order-board',
    name: 'WorkOrderBoard',
    category: 'Work orders and repairs',
    tagline: 'Every job in its column. Drag it on, or use the menu.',
    description: 'A kanban of work orders by status. Drag a card to another column, or use the status menu on each card, which is what touchscreens use. Columns scroll sideways on a phone and snap into place.',
    file: 'work-order-board',
    primitives: ['card'],
    deps: icons,
    wide: true,
    usage: `<WorkOrderBoard
  orders={orders}
  onMove={(order, status) => api.setStatus(order.id, status)}
  onOpen={(order) => openWorkOrder(order.id)}
/>`,
    anatomy: `import { WorkOrderBoard, type BoardOrder } from '@/components/fleet/work-order-board';

// Shares its status list with work-order-card.tsx, so copy that file too.
// Dragging uses the browser's own drag and drop; the status menu covers touch and keyboards.
<WorkOrderBoard orders={orders} onMove={move} />`,
    examples: [{ label: 'Only open work', code: `<WorkOrderBoard orders={orders.filter((order) => order.status !== 'done')} />` }],
    api: [{ title: 'WorkOrderBoard', description: 'Columns of cards.', rows: [row('orders', 'BoardOrder[]', 'id, title, vehicle, status, priority, technician? and openedOn.'), row('onMove', '(order: BoardOrder, status: WorkOrderStatus) => void', 'Called when a card lands in another column.'), row('onOpen', '(order: BoardOrder) => void', 'Called when a card is pressed.'), accent('the drop target and urgent jobs'), cls()] }],
  }),
  entry({
    id: 'inspection-checklist',
    name: 'InspectionChecklist',
    category: 'Work orders and repairs',
    tagline: 'A pre-trip walk-around: pass, fail or not applicable.',
    description: 'Sections of items, each answered pass, fail or N/A. A fail asks what is wrong. A failed critical item shows a "do not drive" warning and marks the vehicle out of service on submit. Submit stays off until every item is answered.',
    file: 'inspection-checklist',
    primitives: ['button', 'card', 'textarea'],
    deps: icons,
    usage: `<InspectionChecklist
  vehicle="Van 12 · 8KTR204"
  sections={[
    { title: 'Outside', items: [{ id: 'lights', label: 'Headlights and indicators work' }] },
    { title: 'In the cab', items: [{ id: 'brakes', label: 'Brakes feel firm', critical: true }] },
  ]}
  onSubmit={(results, outOfService) => api.submitInspection(results, outOfService)}
/>`,
    anatomy: `import { InspectionChecklist, type ChecklistSection } from '@/components/fleet/inspection-checklist';

// results: { itemId, result: 'pass' | 'fail' | 'na', note? }[]
// defaultResults resumes a saved draft. The second argument to onSubmit is true when a critical item failed.
<InspectionChecklist vehicle={vehicle} sections={sections} onSubmit={submit} />`,
    examples: [{ label: 'A critical item fails', code: `<InspectionChecklist vehicle="Van 12" sections={sections} defaultResults={{ ...answers, brakes: 'fail' }} defaultNotes={{ brakes: 'Pedal goes to the floor' }} />` }],
    api: [{ title: 'InspectionChecklist', description: 'A form of pass, fail and N/A answers.', rows: [row('title', 'string', 'Heading.', "'Pre-trip inspection'"), row('vehicle', 'string', 'The vehicle being inspected.'), row('sections', 'ChecklistSection[]', 'title and items (id, label, critical?).'), row('defaultResults', 'Record<string, ItemResult>', 'Answers to start with, by item id.', '{}'), row('defaultNotes', 'Record<string, string>', 'Notes to start with, by item id.', '{}'), row('onSubmit', '(results: InspectionResult[], outOfService: boolean) => void', 'Called when the inspection is submitted.'), accent('failures and the progress bar'), cls()] }],
  }),
  entry({
    id: 'defect-report-form',
    name: 'DefectReportForm',
    category: 'Work orders and repairs',
    tagline: 'How a driver reports a problem, in under a minute.',
    description: 'Pick the vehicle, tap what is affected, say how serious it is, describe it, and add a photo (which opens the camera on a phone). It validates before sending and tells the workshop straight away.',
    file: 'defect-report-form',
    primitives: ['button', 'card', 'label', 'textarea'],
    deps: icons,
    usage: `<DefectReportForm
  vehicles={[{ id: 'v21', name: 'Van 21', plate: '6HJP118' }, { id: 'v12', name: 'Van 12', plate: '8KTR204' }]}
  defaultValues={{ vehicleId: 'v21', system: 'Brakes' }}
  onSubmit={(report) => api.createDefect(report)}
/>`,
    anatomy: `import { DefectReportForm, type DefectReport } from '@/components/fleet/defect-report-form';

// report: { vehicleId, system, severity: 'minor' | 'attention' | 'unsafe', description, photo?: File }
// systems defaults to Brakes, Engine, Tyres, Lights, Steering, Body, Cab, Other; pass your own list.
<DefectReportForm vehicles={vehicles} onSubmit={submit} />`,
    examples: [{ label: 'A blank report', code: `<DefectReportForm vehicles={vehicles} />` }],
    api: [{ title: 'DefectReportForm', description: 'A short report form.', rows: [row('vehicles', '{ id; name; plate? }[]', 'The vehicles a driver can report on.'), row('systems', 'string[]', 'The choices for what is affected.', 'Brakes, Engine, Tyres, Lights, Steering, Body, Cab, Other'), row('defaultValues', 'Partial<DefectReport>', 'Start with a vehicle, system, severity or description filled in.'), row('onSubmit', '(report: DefectReport) => void', 'Called with a valid report.'), accent('the unsafe option and validation messages'), cls()] }],
  }),
  entry({
    id: 'repair-estimate-table',
    name: 'RepairEstimateTable',
    category: 'Work orders and repairs',
    tagline: 'A shop’s estimate, line by line: approve or decline each.',
    description: 'Parts and labour lines, each with approve and decline buttons, recommended extras declined by default, and a running total with tax on parts. Declined lines are struck through and the savings shown.',
    file: 'repair-estimate-table',
    primitives: ['badge', 'button', 'card'],
    deps: icons,
    usage: `<RepairEstimateTable
  title="Estimate 4417"
  vehicle="Van 21 · 6HJP118"
  shop="Northside Truck Repair"
  lines={[
    { id: 'l1', type: 'part', description: 'Front brake rotors (pair)', qty: 2, unitPrice: 68.5 },
    { id: 'l2', type: 'labor', description: 'Fit rotors and pads', qty: 3.5, unitPrice: 95 },
    { id: 'l3', type: 'part', description: 'Rear brake pad set', qty: 1, unitPrice: 48, optional: true },
  ]}
  taxRate={0.0875}
  onSubmit={(decisions, total) => api.answerEstimate(decisions, total)}
/>`,
    anatomy: `import { RepairEstimateTable, type EstimateLine } from '@/components/fleet/repair-estimate-table';

// Lines marked optional start declined; everything else starts approved.
// Tax applies to parts only. decisions is a map of line id to 'approved' | 'declined'.
<RepairEstimateTable title={title} vehicle={vehicle} lines={lines} taxRate={0.0875} />`,
    examples: [{ label: 'Without recommendations', code: `<RepairEstimateTable title="Estimate 4418" vehicle="Van 12" lines={lines.filter((line) => !line.optional)} />` }],
    api: [{ title: 'RepairEstimateTable', description: 'An estimate you can answer.', rows: [row('title', 'string', 'Heading.'), row('vehicle', 'string', 'The vehicle.'), row('shop', 'string', 'The workshop that wrote it.'), row('lines', 'EstimateLine[]', 'id, type ("part" or "labor"), description, qty, unitPrice and optional.'), row('taxRate', 'number', 'e.g. 0.08. Applied to parts only.', '0'), currency, row('onSubmit', '(decisions, total: number) => void', 'Called when Send decision is pressed.'), accent('declined lines'), cls()] }],
  }),

  /* ---------- Parts and inventory ---------- */
  entry({
    id: 'parts-inventory-table',
    name: 'PartsInventoryTable',
    category: 'Parts and inventory',
    tagline: 'Every part in stock: search, filter, sort, low stock flagged.',
    description: 'A table of parts with search across SKU, name and bin, category chips, a low-stock-only toggle and sortable columns. Parts at or under their minimum show their count in the accent colour. Columns drop away on a phone.',
    file: 'parts-inventory-table',
    primitives: ['badge', 'card', 'input', 'table'],
    deps: icons,
    wide: true,
    usage: `<PartsInventoryTable
  parts={[
    { sku: 'BRK-FR-350', name: 'Front brake pad set, Transit', category: 'Brakes', bin: 'A-04-2', onHand: 6, min: 4, unitCost: 54 },
    { sku: 'BAT-H8-95', name: 'Battery H8 95 Ah', category: 'Electrical', bin: 'D-01-1', onHand: 0, min: 2, unitCost: 168 },
  ]}
  onSelect={(part) => openPart(part.sku)}
/>`,
    anatomy: `import { PartsInventoryTable, type Part } from '@/components/fleet/parts-inventory-table';

// low stock = onHand <= min. Sorting and filtering run in the browser, so it suits a few thousand rows;
// for more, filter on the server and pass the page in.
<PartsInventoryTable parts={parts} />`,
    examples: [{ label: 'A short list', code: `<PartsInventoryTable parts={parts.slice(0, 5)} />` }],
    api: [{ title: 'PartsInventoryTable', description: 'A searchable, sortable table.', rows: [row('parts', 'Part[]', 'sku, name, category, bin, onHand, min, unitCost and optionally supplier.'), currency, row('onSelect', '(part: Part) => void', 'Called when a row is pressed.'), accent('low-stock counts'), cls()] }],
  }),
  entry({
    id: 'stock-level-bar',
    name: 'StockLevelBar',
    category: 'Parts and inventory',
    tagline: 'Stock against its limits, and what is on its way.',
    description: 'A bar per part showing what is on the shelf, the reorder line, the ceiling, and a hatched segment for what is on order. Below the reorder line it says "Reorder now", or "Low, order arriving" if an order covers it.',
    file: 'stock-level-bar',
    primitives: ['card'],
    deps: icons,
    usage: `<StockLevelBar
  items={[
    { id: 'a', name: 'Front brake pad set', onHand: 6, min: 4, max: 14 },
    { id: 'b', name: 'Front brake rotor', onHand: 3, min: 4, max: 12, onOrder: 6 },
  ]}
/>`,
    anatomy: `import { StockLevelBar, type StockLevel } from '@/components/fleet/stock-level-bar';

// min is the reorder point, max the shelf capacity. onOrder is optional and drawn hatched.
<StockLevelBar items={levels} />`,
    examples: [{ label: 'One part, nothing wrong', code: `<StockLevelBar items={levels.slice(4)} />` }],
    api: [{ title: 'StockLevelBar', description: 'A list of stock bars.', rows: [row('items', 'StockLevel[]', 'id, name, onHand, min, max and optionally onOrder.'), row('onSelect', '(item: StockLevel) => void', 'Called when a row is pressed.'), accent('parts that need reordering'), cls()] }],
  }),
  entry({
    id: 'reorder-suggestions',
    name: 'ReorderSuggestions',
    category: 'Parts and inventory',
    tagline: 'Parts that hit their reorder point, ready to order in one go.',
    description: 'Parts at or below their minimum with a suggested quantity you can nudge up or down, the supplier and lead time, and a running total. Tick what to order; creating orders groups the lines by supplier.',
    file: 'reorder-suggestions',
    primitives: ['button', 'card'],
    deps: icons,
    usage: `<ReorderSuggestions
  suggestions={[
    { sku: 'BAT-H8-95', name: 'Battery H8 95 Ah', onHand: 0, min: 2, suggestedQty: 4, supplier: 'VoltCo', leadTimeDays: 2, unitCost: 168 },
  ]}
  onCreateOrders={(bySupplier) => api.createPurchaseOrders(bySupplier)}
/>`,
    anatomy: `import { ReorderSuggestions, type ReorderSuggestion } from '@/components/fleet/reorder-suggestions';

// onCreateOrders receives the ticked lines grouped by supplier: { VoltCo: [{ sku, qty, supplier }], ... }
// so one click can raise several purchase orders.
<ReorderSuggestions suggestions={suggestions} onCreateOrders={create} />`,
    examples: [{ label: 'A single supplier', code: `<ReorderSuggestions suggestions={suggestions.slice(0, 1)} />` }],
    api: [{ title: 'ReorderSuggestions', description: 'A checklist of parts to reorder.', rows: [row('suggestions', 'ReorderSuggestion[]', 'sku, name, onHand, min, suggestedQty, supplier, leadTimeDays and unitCost.'), currency, row('onCreateOrders', '(bySupplier: Record<string, ReorderLine[]>) => void', 'Called with the ticked lines grouped by supplier.'), accent('out-of-stock parts and the checkboxes'), cls()] }],
  }),
  entry({
    id: 'parts-usage-chart',
    name: 'PartsUsageChart',
    category: 'Parts and inventory',
    tagline: 'How fast parts are used up, month by month.',
    description: 'An area chart of consumption by part with a chip per part showing its total. Tap a chip to show or hide that part. Built on Recharts.',
    file: 'parts-usage-chart',
    primitives: ['badge', 'card'],
    deps: charts,
    usage: `<PartsUsageChart
  data={[
    { label: 'Oct', brakes: 7, oil: 19, tyres: 5 },
    { label: 'Nov', brakes: 9, oil: 21, tyres: 4 },
  ]}
  series={[{ key: 'brakes', label: 'Brake pads' }, { key: 'oil', label: 'Oil filters' }, { key: 'tyres', label: 'Tyres' }]}
  unit="units"
/>`,
    anatomy: `import { PartsUsageChart } from '@/components/fleet/parts-usage-chart';

// One row per period; each series key is a column in every row.
// The first series uses the accent colour, then a monochrome ramp.
<PartsUsageChart data={rows} series={series} />`,
    examples: [{ label: 'Two parts', code: `<PartsUsageChart data={rows} series={series.slice(0, 2)} title="Brakes and filters" />` }],
    api: [{ title: 'PartsUsageChart', description: 'A togglable area chart.', rows: [row('data', 'Array<Record<string, number | string>>', 'One row per period: a label and a number for each series key.'), row('series', 'UsageSeries[]', 'key and label for each part.'), row('title', 'string', 'Heading.', "'Parts used'"), row('unit', 'string', 'What one count is.', "'units'"), accent('the first series'), cls()] }],
  }),
  entry({
    id: 'part-detail-panel',
    name: 'PartDetailPanel',
    category: 'Parts and inventory',
    tagline: 'One part: what it fits, who sells it, what it has cost, where it is.',
    description: 'Four tabs: the vehicles the part fits, suppliers by price with a preferred one marked, the price history as a chart with the change since the first entry, and stock by location.',
    file: 'part-detail-panel',
    primitives: ['badge', 'card'],
    deps: charts,
    usage: `<PartDetailPanel
  part={{
    sku: 'BRK-FR-350',
    name: 'Front brake pad set, Transit',
    category: 'Brakes',
    fits: [{ vehicle: 'Van 12 · Ford Transit 350', note: '2021' }],
    suppliers: [{ name: 'Northline Parts', unitCost: 54, leadTimeDays: 2, preferred: true }],
    priceHistory: [{ date: '2025-10-01', unitCost: 47 }, { date: '2026-08-01', unitCost: 54 }],
    stock: [{ location: 'Main workshop', onHand: 4, bin: 'A-04-2' }],
  }}
/>`,
    anatomy: `import { PartDetailPanel, type PartDetail } from '@/components/fleet/part-detail-panel';

// priceHistory is oldest first. Suppliers are listed cheapest first. defaultTab: 'fit' | 'suppliers' | 'price' | 'stock'
<PartDetailPanel part={part} />`,
    examples: [{ label: 'The price tab', code: `<PartDetailPanel part={part} defaultTab="price" />` }],
    api: [{ title: 'PartDetailPanel', description: 'A tabbed panel for one part.', rows: [row('part', 'PartDetail', 'sku, name, category, description?, fits, suppliers, priceHistory and stock.'), currency, row('defaultTab', "'fit' | 'suppliers' | 'price' | 'stock'", 'The tab shown first.', "'fit'"), accent('the preferred badge and the price line'), cls()] }],
  }),
  entry({
    id: 'purchase-order-card',
    name: 'PurchaseOrderCard',
    category: 'Parts and inventory',
    tagline: 'An order to a supplier, and a way to book in the delivery.',
    description: 'The order’s status as a five-step bar, its total and ETA, and each line with received against ordered. Type what arrived (or leave it empty for everything outstanding) and Receive; the status moves to part received or received on its own.',
    file: 'purchase-order-card',
    primitives: ['button', 'card'],
    deps: icons,
    usage: `<PurchaseOrderCard
  id="PO-1184"
  supplier="Northline Parts"
  status="confirmed"
  eta="2026-10-02"
  lines={[
    { sku: 'BRK-RT-350', name: 'Front brake rotor', qty: 8, received: 0, unitCost: 68.5 },
    { sku: 'BRK-FR-350', name: 'Front brake pad set', qty: 6, received: 4, unitCost: 54 },
  ]}
  onReceive={(received) => api.receiveStock(received)}
/>`,
    anatomy: `import { PurchaseOrderCard, type POLine } from '@/components/fleet/purchase-order-card';

// status: 'draft' | 'sent' | 'confirmed' | 'partial' | 'received'
// onReceive gets only what was booked this time: { 'BRK-RT-350': 4 }. The card works out the new status.
<PurchaseOrderCard id={id} supplier={supplier} status={status} lines={lines} onReceive={receive} />`,
    examples: [{ label: 'Fully received', code: `<PurchaseOrderCard id="PO-1179" supplier="Lubeco" status="received" lines={lines.map((l) => ({ ...l, received: l.qty }))} />` }],
    api: [{ title: 'PurchaseOrderCard', description: 'A purchase order and its deliveries.', rows: [row('id', 'string', 'The order number.'), row('supplier', 'string', 'Who it is with.'), row('status', 'POStatus', 'draft, sent, confirmed, partial or received.'), row('eta', 'string', 'ISO date the delivery is expected.'), row('lines', 'POLine[]', 'sku, name, qty, received and unitCost.'), currency, row('onReceive', '(received: Record<string, number>) => void', 'Called with what was booked in: sku to quantity.'), accent('the current step'), cls()] }],
  }),

  /* ---------- Tyres, fuel and fluids ---------- */
  entry({
    id: 'tire-status-grid',
    name: 'TireStatusGrid',
    category: 'Tyres, fuel and fluids',
    tagline: 'Every tyre where it sits, with tread, pressure and age.',
    description: 'Tyres laid out by axle, left and right, each with tread depth and a bar, pressure, and a status of OK, watch or replace. Tap one for its detail. Works for two axles or three, and for dual wheels.',
    file: 'tire-status-grid',
    primitives: ['card'],
    deps: icons,
    usage: `<TireStatusGrid
  vehicle="Van 12"
  odometerKm={148210}
  tires={[
    { axle: 1, side: 'left', position: 'Front left', treadMm: 6.4, pressureKpa: 410, targetKpa: 415, ageMonths: 14 },
    { axle: 1, side: 'right', position: 'Front right', treadMm: 5.1, pressureKpa: 365, targetKpa: 415, ageMonths: 14 },
    { axle: 2, side: 'left', position: 'Rear left', treadMm: 3.2, pressureKpa: 470, targetKpa: 480, ageMonths: 26 },
    { axle: 2, side: 'right', position: 'Rear right', treadMm: 2.0, pressureKpa: 475, targetKpa: 480, ageMonths: 26 },
  ]}
/>`,
    anatomy: `import { TireStatusGrid, type Tire } from '@/components/fleet/tire-status-grid';

// Replace: tread within 0.5 mm of minTreadMm. Watch: within 2 mm of it, or pressure more than 10% off target.
// minTreadMm and newTreadMm suit cars (1.6 / 8); use 3 / 12 for truck tyres.
<TireStatusGrid vehicle={name} odometerKm={km} tires={tires} />`,
    examples: [{ label: 'A truck with three axles', code: `<TireStatusGrid vehicle="Truck 05" odometerKm={118940} tires={tires} minTreadMm={3} newTreadMm={12} />` }],
    api: [{ title: 'TireStatusGrid', description: 'Tyres by position.', rows: [row('vehicle', 'string', 'The vehicle name.'), row('odometerKm', 'number', 'Current reading, for rotation.'), row('tires', 'Tire[]', 'axle, side, position, treadMm, pressureKpa, targetKpa, ageMonths and optionally rotateAtKm.'), row('minTreadMm', 'number', 'Legal minimum tread depth.', '1.6'), row('newTreadMm', 'number', 'Depth of a new tyre, for the tread bar.', '8'), accent('tyres to replace and low pressure'), cls()] }],
  }),
  entry({
    id: 'fuel-economy-trend',
    name: 'FuelEconomyTrend',
    category: 'Tyres, fuel and fluids',
    tagline: 'One vehicle’s fuel economy against the fleet.',
    description: 'A vehicle picker, three numbers (average, difference from the fleet, the last three months against the first three), and a line chart of the vehicle against the fleet average. It says whether each is better or worse for the direction you set.',
    file: 'fuel-economy-trend',
    primitives: ['card'],
    deps: charts,
    usage: `<FuelEconomyTrend
  data={[
    { label: 'Oct', v12: 11.6, v21: 13.1, fleet: 11.9 },
    { label: 'Nov', v12: 11.9, v21: 13.6, fleet: 12.1 },
  ]}
  vehicles={[{ id: 'v12', name: 'Van 12' }, { id: 'v21', name: 'Van 21' }]}
  defaultVehicleId="v21"
  unit="L/100 km"
/>`,
    anatomy: `import { FuelEconomyTrend } from '@/components/fleet/fuel-economy-trend';

// Each row has a label, the fleet average under fleetKey ("fleet"), and one number per vehicle id.
// lowerIsBetter: true for L/100 km, false for mpg.
<FuelEconomyTrend data={rows} vehicles={vehicles} />`,
    examples: [{ label: 'A vehicle that beats the fleet', code: `<FuelEconomyTrend data={rows} vehicles={vehicles} defaultVehicleId="v03" />` }],
    api: [{ title: 'FuelEconomyTrend', description: 'A vehicle against the fleet.', rows: [row('data', 'FuelEconomyPoint[]', 'label, the fleet average, and a number for each vehicle id.'), row('vehicles', '{ id; name }[]', 'The vehicles in the picker.'), row('defaultVehicleId', 'string', 'The vehicle shown first.'), row('fleetKey', 'string', 'The row key holding the fleet average.', "'fleet'"), row('unit', 'string', 'The unit label.', "'L/100 km'"), row('lowerIsBetter', 'boolean', 'True for L/100 km, false for mpg.', 'true'), accent('the vehicle line and worse-than-fleet numbers'), cls()] }],
  }),
  entry({
    id: 'fluids-battery-panel',
    name: 'FluidsAndBatteryPanel',
    category: 'Tyres, fuel and fluids',
    tagline: 'The small things that strand a vehicle.',
    description: 'Oil life, coolant, brake and washer fluid as bars with notes, and the battery’s voltage, health, cold-crank amps and last test. Anything low is in the accent colour, and a weak battery says to plan a replacement.',
    file: 'fluids-battery-panel',
    primitives: ['card'],
    deps: icons,
    usage: `<FluidsAndBatteryPanel
  vehicle="Van 21"
  fluids={[
    { id: 'oil', label: 'Engine oil life', level: 34, note: 'About 4,000 km until the next change' },
    { id: 'coolant', label: 'Coolant', level: 22 },
  ]}
  battery={{ voltage: 12.3, healthPercent: 54, coldCrankAmps: 510, testedOn: '2026-09-12' }}
/>`,
    anatomy: `import { FluidsAndBatteryPanel, type FluidLevel } from '@/components/fleet/fluids-battery-panel';

// level is 0 to 100. A fluid is low under lowBelow (default 25). The battery is low under 60% health or 12.4 V.
<FluidsAndBatteryPanel vehicle={name} fluids={fluids} battery={battery} />`,
    examples: [{ label: 'All fine', code: `<FluidsAndBatteryPanel vehicle="Van 03" fluids={fluids} battery={{ voltage: 12.7, healthPercent: 93, coldCrankAmps: 720, testedOn: '2026-09-12' }} />` }],
    api: [{ title: 'FluidsAndBatteryPanel', description: 'Levels and battery status.', rows: [row('vehicle', 'string', 'The vehicle name.'), row('fluids', 'FluidLevel[]', 'id, label, level (0 to 100) and optionally note and lowBelow.'), row('battery', 'BatteryStatus', 'voltage, healthPercent, coldCrankAmps and testedOn.'), accent('low fluids and a weak battery'), cls()] }],
  }),
  entry({
    id: 'fuel-transaction-list',
    name: 'FuelTransactionList',
    category: 'Tyres, fuel and fluids',
    tagline: 'Fuel card purchases, with anything odd flagged and explained.',
    description: 'Totals for spend, litres and flagged purchases, then the purchases newest first. Flagged ones say why: more than the tank holds, the vehicle was parked, far from the route, or a possible duplicate. Mark each reviewed.',
    file: 'fuel-transaction-list',
    primitives: ['badge', 'card'],
    deps: icons,
    usage: `<FuelTransactionList
  transactions={[
    { id: 'f1', date: '2026-09-28', time: '07:42', station: 'Shell, Cesar Chavez St', vehicle: 'Van 12', litres: 61.4, total: 103.2 },
    { id: 'f2', date: '2026-09-28', time: '14:05', station: 'Chevron, Van Ness Ave', vehicle: 'Van 21', litres: 118.7, total: 199.5, flags: ['over-capacity'] },
  ]}
  onReview={(transaction) => api.markReviewed(transaction.id)}
/>`,
    anatomy: `import { FuelTransactionList, type FuelTransaction } from '@/components/fleet/fuel-transaction-list';

// flags: 'over-capacity' | 'while-idle' | 'off-route' | 'duplicate'
// Working out the flags is yours: compare against tank size, telematics and the fuel card feed.
<FuelTransactionList transactions={transactions} />`,
    examples: [{ label: 'Nothing flagged', code: `<FuelTransactionList transactions={transactions.filter((tx) => !tx.flags)} />` }],
    api: [{ title: 'FuelTransactionList', description: 'Purchases and their flags.', rows: [row('transactions', 'FuelTransaction[]', 'id, date, station, vehicle, litres, total and optionally time, odometerKm and flags.'), currency, row('onReview', '(transaction: FuelTransaction) => void', 'Called when a flagged purchase is marked reviewed.'), accent('flagged purchases'), cls()] }],
  }),

  /* ---------- Fleet costs and stats ---------- */
  entry({
    id: 'fleet-kpi-strip',
    name: 'FleetKpiStrip',
    category: 'Fleet costs and stats',
    tagline: 'The numbers a fleet manager checks first.',
    description: 'A strip of figures (availability, cost per kilometre, open work orders, average age), each with its change, coloured only when the change is the wrong way, and a trend line. Two across on a phone, four across on a desktop.',
    file: 'fleet-kpi-strip',
    primitives: ['card'],
    deps: icons,
    wide: true,
    usage: `<FleetKpiStrip
  kpis={[
    { id: 'avail', label: 'Availability', value: '91.4%', delta: -2.1, goodWhen: 'up', trend: [95, 94, 95, 93, 94, 92, 91.4] },
    { id: 'cpk', label: 'Cost per km', value: '$0.47', delta: 3.8, goodWhen: 'down', trend: [0.42, 0.43, 0.45, 0.47] },
  ]}
  period="vs last month"
/>`,
    anatomy: `import { FleetKpiStrip, type Kpi } from '@/components/fleet/fleet-kpi-strip';

// goodWhen says which direction is good, so a rising cost is drawn as bad and a rising availability as fine.
// value is already formatted; trend is a short series, oldest first.
<FleetKpiStrip kpis={kpis} />`,
    examples: [{ label: 'Three numbers', code: `<FleetKpiStrip kpis={kpis.slice(0, 3)} period="vs Aug" />` }],
    api: [{ title: 'FleetKpiStrip', description: 'A grid of figures.', rows: [row('kpis', 'Kpi[]', 'id, label, value (formatted), and optionally unit, delta (percent), goodWhen and trend.'), row('period', 'string', 'Label after each change.', "'vs last month'"), row('onSelect', '(kpi: Kpi) => void', 'Called when a figure is pressed.'), accent('changes in the wrong direction'), cls()] }],
  }),
  entry({
    id: 'cost-breakdown-chart',
    name: 'CostBreakdownChart',
    category: 'Fleet costs and stats',
    tagline: 'What each vehicle costs to run, split by kind.',
    description: 'A stacked bar per vehicle for fuel, maintenance, tyres and insurance, ranked with the costliest first, with a switch between total and per kilometre and chips to hide a category. Built on Recharts.',
    file: 'cost-breakdown-chart',
    primitives: ['badge', 'card'],
    deps: charts,
    usage: `<CostBreakdownChart
  data={[
    { name: 'Van 21', distanceKm: 31200, fuel: 6100, maintenance: 5400, tires: 900, insurance: 2400 },
    { name: 'Van 12', distanceKm: 36900, fuel: 6300, maintenance: 2100, tires: 800, insurance: 2300 },
  ]}
  categories={[{ key: 'fuel', label: 'Fuel' }, { key: 'maintenance', label: 'Maintenance' }, { key: 'tires', label: 'Tyres' }, { key: 'insurance', label: 'Insurance' }]}
/>`,
    anatomy: `import { CostBreakdownChart, type CostRow } from '@/components/fleet/cost-breakdown-chart';

// Each row needs distanceKm so per-kilometre costs can be worked out, plus a number per category key.
// The chart's height grows with the number of vehicles.
<CostBreakdownChart data={rows} categories={categories} />`,
    examples: [{ label: 'Per kilometre', code: `<CostBreakdownChart data={rows} categories={categories} defaultMode="perKm" />` }],
    api: [{ title: 'CostBreakdownChart', description: 'A stacked, rankable cost chart.', rows: [row('data', 'CostRow[]', 'name, distanceKm and a cost for each category key.'), row('categories', 'CostCategory[]', 'key and label for each cost type.'), currency, row('defaultMode', "'total' | 'perKm'", 'The view shown first.', "'total'"), accent('the second category'), cls()] }],
  }),
  entry({
    id: 'utilization-grid',
    name: 'UtilizationGrid',
    category: 'Fleet costs and stats',
    tagline: 'Which vehicles were working, idle or in the shop, day by day.',
    description: 'A row per vehicle and a square per day: in use, idle, in the shop or off duty. Each row ends with its utilisation, hovering a day names it, and the first column stays put when the grid scrolls on a phone.',
    file: 'utilization-grid',
    primitives: ['card'],
    deps: icons,
    wide: true,
    usage: `<UtilizationGrid
  rows={[
    { vehicle: 'Van 12', days: ['used', 'used', 'idle', 'off', 'off', 'used', 'shop'] },
    { vehicle: 'Van 21', days: ['used', 'shop', 'shop', 'off', 'off', 'shop', 'shop'] },
  ]}
  endDate="2026-09-29"
/>`,
    anatomy: `import { UtilizationGrid, type UtilizationRow } from '@/components/fleet/utilization-grid';

// days: 'used' | 'idle' | 'shop' | 'off', oldest first, the same length in every row.
// Utilisation = used days / days that were not "off".
<UtilizationGrid rows={rows} endDate={today} />`,
    examples: [{ label: 'Trucks only', code: `<UtilizationGrid rows={rows.filter((row) => row.vehicle.startsWith('Truck'))} endDate="2026-09-29" />` }],
    api: [{ title: 'UtilizationGrid', description: 'A vehicles-by-days grid.', rows: [row('rows', 'UtilizationRow[]', 'vehicle and one state per day.'), row('endDate', 'string', 'ISO date of the last column.'), accent('days in the shop'), cls()] }],
  }),
  entry({
    id: 'vehicle-leaderboard',
    name: 'VehicleLeaderboard',
    category: 'Fleet costs and stats',
    tagline: 'Rank the fleet, so the vehicle costing you money is obvious.',
    description: 'Vehicles ranked worst first by cost per kilometre, downtime or fuel use, each with a bar and a fleet-average marker. The worst few are in the accent colour. Switch the ranking with the tabs.',
    file: 'vehicle-leaderboard',
    primitives: ['card'],
    deps: icons,
    usage: `<VehicleLeaderboard
  vehicles={[
    { id: 'v21', name: 'Van 21', costPerKm: 0.91, downtimeDays: 14 },
    { id: 'v03', name: 'Van 03', costPerKm: 0.27, downtimeDays: 0 },
  ]}
  metrics={[
    { key: 'costPerKm', label: 'Cost per km', format: (v) => '$' + v.toFixed(2), higherIsWorse: true },
    { key: 'downtimeDays', label: 'Downtime', format: (v) => v + ' days', higherIsWorse: true },
  ]}
/>`,
    anatomy: `import { VehicleLeaderboard, type LeaderboardMetric } from '@/components/fleet/vehicle-leaderboard';

// Each vehicle has any number of numeric fields; each metric names one by key.
// higherIsWorse decides the order: true for cost and downtime, false for mpg.
<VehicleLeaderboard vehicles={vehicles} metrics={metrics} />`,
    examples: [{ label: 'Ranked by downtime', code: `<VehicleLeaderboard vehicles={vehicles} metrics={metrics} defaultMetric="downtimeDays" />` }],
    api: [{ title: 'VehicleLeaderboard', description: 'A ranked list with tabs.', rows: [row('vehicles', 'LeaderboardVehicle[]', 'id, name and a number for each metric key.'), row('metrics', 'LeaderboardMetric[]', 'key, label, format and higherIsWorse.'), row('defaultMetric', 'string', 'The metric shown first.', 'the first metric'), row('worstCount', 'number', 'How many at the top are highlighted.', '2'), row('onSelect', '(vehicle: LeaderboardVehicle) => void', 'Called when a row is pressed.'), accent('the worst vehicles'), cls()] }],
  }),
  entry({
    id: 'replacement-planner',
    name: 'ReplacementPlanner',
    category: 'Fleet costs and stats',
    tagline: 'When does it stop making sense to keep it?',
    description: 'Cost per year owned across the vehicle’s life, the year it is lowest, and where it is now. Slide to a planned replacement year to see the cost per year, how much more than the best year that is, and the resale value. Built on Recharts.',
    file: 'replacement-planner',
    primitives: ['card'],
    deps: charts,
    usage: `<ReplacementPlanner
  vehicle="Van 21 · 2019 Sprinter"
  currentAge={7}
  purchasePrice={42000}
  projection={[
    { year: 1, running: 900, resale: 34500 },
    { year: 2, running: 1400, resale: 29000 },
    { year: 3, running: 2100, resale: 24800 },
  ]}
  onReplace={(year) => api.planReplacement(year)}
/>`,
    anatomy: `import { ReplacementPlanner, type YearProjection } from '@/components/fleet/replacement-planner';

// Cost per year owned = (purchasePrice - resale + running costs so far) / years.
// The best year is where that is lowest. Running and resale figures are your forecast.
<ReplacementPlanner vehicle={name} currentAge={7} purchasePrice={42000} projection={projection} />`,
    examples: [{ label: 'A newer vehicle', code: `<ReplacementPlanner vehicle="Van 03" currentAge={3} purchasePrice={42000} projection={projection} />` }],
    api: [{ title: 'ReplacementPlanner', description: 'An ownership-cost curve and a slider.', rows: [row('vehicle', 'string', 'The vehicle name.'), row('currentAge', 'number', 'Age in years.'), row('purchasePrice', 'number', 'What it cost new.'), row('projection', 'YearProjection[]', 'year, the running cost that year, and the resale value at the end of it.'), currency, row('onReplace', '(atYear: number) => void', 'Called when the plan button is pressed.'), accent('the best year and costs above it'), cls()] }],
  }),
];
