import * as React from 'react';
import { CostBreakdownChart } from '@/components/fleet/cost-breakdown-chart';
import { DefectReportForm } from '@/components/fleet/defect-report-form';
import { DiagnosticCodeList } from '@/components/fleet/diagnostic-code-list';
import { DocumentExpiryTracker } from '@/components/fleet/document-expiry-tracker';
import { DowntimeForecast } from '@/components/fleet/downtime-forecast';
import { FleetKpiStrip } from '@/components/fleet/fleet-kpi-strip';
import { FluidsAndBatteryPanel } from '@/components/fleet/fluids-battery-panel';
import { FuelEconomyTrend } from '@/components/fleet/fuel-economy-trend';
import { FuelTransactionList } from '@/components/fleet/fuel-transaction-list';
import { InspectionChecklist } from '@/components/fleet/inspection-checklist';
import { MaintenanceCalendar } from '@/components/fleet/maintenance-calendar';
import { PartDetailPanel } from '@/components/fleet/part-detail-panel';
import { PartsInventoryTable } from '@/components/fleet/parts-inventory-table';
import { PartsUsageChart } from '@/components/fleet/parts-usage-chart';
import { PMScheduleBuilder } from '@/components/fleet/pm-schedule-builder';
import { PurchaseOrderCard } from '@/components/fleet/purchase-order-card';
import { ReorderSuggestions } from '@/components/fleet/reorder-suggestions';
import { RepairEstimateTable } from '@/components/fleet/repair-estimate-table';
import { ReplacementPlanner } from '@/components/fleet/replacement-planner';
import { ServiceDueList } from '@/components/fleet/service-due-list';
import { ServiceIntervalGauge } from '@/components/fleet/service-interval-gauge';
import { StockLevelBar } from '@/components/fleet/stock-level-bar';
import { TireStatusGrid } from '@/components/fleet/tire-status-grid';
import { UtilizationGrid } from '@/components/fleet/utilization-grid';
import { VehicleHealthCard } from '@/components/fleet/vehicle-health-card';
import { VehicleLeaderboard } from '@/components/fleet/vehicle-leaderboard';
import { VehicleSpecSheet } from '@/components/fleet/vehicle-spec-sheet';
import { VehicleTimeline } from '@/components/fleet/vehicle-timeline';
import { WorkOrderBoard } from '@/components/fleet/work-order-board';
import { WorkOrderCard } from '@/components/fleet/work-order-card';
import {
  BATTERY,
  BOARD_ORDERS,
  BOOKED,
  CHECKLIST,
  CHECKLIST_ANSWERS,
  CODES,
  COST_CATEGORIES,
  COST_ROWS,
  DOCUMENTS,
  DOWNTIME_DAYS,
  DOWNTIME_VEHICLES,
  DUE_SERVICES,
  ESTIMATE_LINES,
  FLUIDS,
  FUEL_DATA,
  FUEL_TX,
  FUEL_VEHICLES,
  KPIS,
  LEADERBOARD,
  LEADERBOARD_METRICS,
  PART_DETAIL,
  PARTS,
  PM_SCHEDULE,
  PO_LINES,
  REORDER,
  REPLACEMENT_PROJECTION,
  STOCK_LEVELS,
  TRUCK_05_TIRES,
  USAGE_DATA,
  USAGE_SERIES,
  UTILIZATION_ROWS,
  VAN_12_INTERVALS,
  VAN_12_SPECS,
  VAN_12_TIMELINE,
  VAN_12_TIRES,
  WORK_ORDER,
} from './fixtures/fleet-data';
import { dayFromToday, TODAY, VEHICLES } from './fixtures/fleet';

const NARROW = 'w-full max-w-[28rem]';
const MEDIUM = 'w-full max-w-[36rem]';
const WIDE = 'w-full max-w-[60rem]';

const DEFECT_VEHICLES = VEHICLES.map((vehicle) => ({ id: vehicle.id, name: vehicle.name, plate: vehicle.plate }));

export const FLEET_PREVIEWS: Record<string, React.ReactNode> = {
  'vehicle-health-card': (
    <VehicleHealthCard
      className={NARROW}
      name="Van 21"
      model="2019 Mercedes Sprinter 2500"
      plate="6HJP118"
      odometerKm={231880}
      score={54}
      issues={[
        { id: 'i1', label: 'Coolant leak at the water pump', severity: 'critical' },
        { id: 'i2', label: 'Rear brake pads at 15%', severity: 'major' },
        { id: 'i3', label: 'Chip in the windscreen', severity: 'minor' },
      ]}
      nextService={{ label: 'Brakes and cooling repair', due: 'Booked Thu 1 Oct · Bay 2' }}
    />
  ),
  'vehicle-spec-sheet': <VehicleSpecSheet className={MEDIUM} title="Van 12" subtitle="2021 Ford Transit 350 · 148,210 km" groups={VAN_12_SPECS} />,
  'vehicle-timeline': <VehicleTimeline className={NARROW} events={VAN_12_TIMELINE} />,
  'diagnostic-code-list': <DiagnosticCodeList className={MEDIUM} codes={CODES} />,
  'document-expiry-tracker': <DocumentExpiryTracker className={MEDIUM} documents={DOCUMENTS} today={TODAY} onRenew={() => undefined} />,
  'service-due-list': <ServiceDueList className={MEDIUM} items={DUE_SERVICES} today={TODAY} />,
  'maintenance-calendar': <MaintenanceCalendar className={MEDIUM} services={BOOKED} defaultMonth="2026-10" today={TODAY} defaultSelected="2026-10-13" />,
  'pm-schedule-builder': <PMScheduleBuilder className={MEDIUM} defaultValue={PM_SCHEDULE} />,
  'service-interval-gauge': <ServiceIntervalGauge className={NARROW} vehicle="Van 12" odometerKm={148210} intervals={VAN_12_INTERVALS} />,
  'downtime-forecast': <DowntimeForecast className={MEDIUM} days={DOWNTIME_DAYS} vehicles={DOWNTIME_VEHICLES} fleetSize={8} />,
  'work-order-card': <WorkOrderCard className={NARROW} order={WORK_ORDER} />,
  'work-order-board': <WorkOrderBoard className={WIDE} orders={BOARD_ORDERS} />,
  'inspection-checklist': <InspectionChecklist className={NARROW} vehicle="Van 12 · 8KTR204" sections={CHECKLIST} defaultResults={CHECKLIST_ANSWERS} defaultNotes={{ body: 'Scrape along the rear left panel' }} />,
  'defect-report-form': <DefectReportForm className={NARROW} vehicles={DEFECT_VEHICLES} defaultValues={{ vehicleId: 'v21', system: 'Brakes', severity: 'attention', description: 'Grinding noise from the front left when braking' }} />,
  'repair-estimate-table': <RepairEstimateTable className={MEDIUM} title="Estimate 4417" vehicle="Van 21 · 6HJP118" shop="Northside Truck Repair" lines={ESTIMATE_LINES} taxRate={0.0875} />,
  'parts-inventory-table': <PartsInventoryTable className={WIDE} parts={PARTS} />,
  'stock-level-bar': <StockLevelBar className={MEDIUM} items={STOCK_LEVELS} />,
  'reorder-suggestions': <ReorderSuggestions className={MEDIUM} suggestions={REORDER} />,
  'parts-usage-chart': <PartsUsageChart className={MEDIUM} data={USAGE_DATA} series={USAGE_SERIES} />,
  'part-detail-panel': <PartDetailPanel className={NARROW} part={PART_DETAIL} />,
  'purchase-order-card': <PurchaseOrderCard className={MEDIUM} id="PO-1184" supplier="Northline Parts" status="confirmed" eta={dayFromToday(3)} lines={PO_LINES} />,
  'tire-status-grid': <TireStatusGrid className={NARROW} vehicle="Van 12" odometerKm={148210} tires={VAN_12_TIRES} />,
  'fuel-economy-trend': <FuelEconomyTrend className={MEDIUM} data={FUEL_DATA} vehicles={FUEL_VEHICLES} defaultVehicleId="v21" />,
  'fluids-battery-panel': <FluidsAndBatteryPanel className={MEDIUM} vehicle="Van 21" fluids={FLUIDS} battery={BATTERY} />,
  'fuel-transaction-list': <FuelTransactionList className={MEDIUM} transactions={FUEL_TX} />,
  'fleet-kpi-strip': <FleetKpiStrip className={WIDE} kpis={KPIS} />,
  'cost-breakdown-chart': <CostBreakdownChart className={MEDIUM} data={COST_ROWS} categories={COST_CATEGORIES} />,
  'utilization-grid': <UtilizationGrid className={WIDE} rows={UTILIZATION_ROWS} endDate={TODAY} />,
  'vehicle-leaderboard': <VehicleLeaderboard className={NARROW} vehicles={LEADERBOARD} metrics={LEADERBOARD_METRICS} />,
  'replacement-planner': <ReplacementPlanner className={MEDIUM} vehicle="Van 21 · 2019 Sprinter" currentAge={7} purchasePrice={42000} projection={REPLACEMENT_PROJECTION} />,
};

export const FLEET_EXAMPLES: Record<string, { label: string; node: React.ReactNode }[]> = {
  'vehicle-health-card': [
    {
      label: 'A healthy vehicle',
      node: <VehicleHealthCard className={NARROW} name="Van 03" model="2023 Ram ProMaster 2500" plate="9QRS340" odometerKm={54120} score={96} issues={[]} nextService={{ label: '60,000 km service', due: 'Booked Thu 8 Oct · Bay 2' }} />,
    },
  ],
  'vehicle-spec-sheet': [
    { label: 'Two groups only', node: <VehicleSpecSheet className={MEDIUM} title="Pickup 09" subtitle="2021 Toyota Tacoma" groups={VAN_12_SPECS.slice(0, 2)} /> },
  ],
  'vehicle-timeline': [
    { label: 'Repairs only', node: <VehicleTimeline className={NARROW} events={VAN_12_TIMELINE.filter((event) => event.type === 'repair' || event.type === 'incident')} /> },
  ],
  'diagnostic-code-list': [
    { label: 'A clean vehicle', node: <DiagnosticCodeList className={MEDIUM} codes={[]} /> },
  ],
  'document-expiry-tracker': [
    { label: 'Only what is valid', node: <DocumentExpiryTracker className={MEDIUM} documents={DOCUMENTS.slice(4)} today={TODAY} /> },
  ],
  'service-due-list': [
    { label: 'A tighter window', node: <ServiceDueList className={MEDIUM} items={DUE_SERVICES} today={TODAY} soonKm={500} soonDays={7} /> },
  ],
  'maintenance-calendar': [
    { label: 'An empty month', node: <MaintenanceCalendar className={MEDIUM} services={BOOKED} defaultMonth="2026-11" today={TODAY} /> },
  ],
  'pm-schedule-builder': [
    { label: 'One class', node: <PMScheduleBuilder className={MEDIUM} defaultValue={PM_SCHEDULE.slice(1, 2)} /> },
  ],
  'service-interval-gauge': [
    { label: 'A newer vehicle', node: <ServiceIntervalGauge className={NARROW} vehicle="Van 03" odometerKm={54120} intervals={VAN_12_INTERVALS.map((interval) => ({ ...interval, lastDoneKm: Math.max(0, 54120 - interval.everyKm * 0.4) }))} /> },
  ],
  'downtime-forecast': [
    { label: 'A larger fleet', node: <DowntimeForecast className={MEDIUM} days={DOWNTIME_DAYS} vehicles={DOWNTIME_VEHICLES.slice(0, 3)} fleetSize={20} /> },
  ],
  'work-order-card': [
    { label: 'Just requested', node: <WorkOrderCard className={NARROW} order={{ ...WORK_ORDER, status: 'requested', technician: undefined, bay: undefined, priority: 'normal', tasks: WORK_ORDER.tasks.map((task) => ({ ...task, done: false })) }} /> },
  ],
  'work-order-board': [
    { label: 'Only open work', node: <WorkOrderBoard className={WIDE} orders={BOARD_ORDERS.filter((order) => order.status !== 'done')} /> },
  ],
  'inspection-checklist': [
    { label: 'A critical item fails', node: <InspectionChecklist className={NARROW} vehicle="Van 12 · 8KTR204" sections={CHECKLIST} defaultResults={{ ...CHECKLIST_ANSWERS, brakes: 'fail' }} defaultNotes={{ brakes: 'Pedal goes to the floor' }} /> },
  ],
  'defect-report-form': [
    { label: 'A blank report', node: <DefectReportForm className={NARROW} vehicles={DEFECT_VEHICLES} /> },
  ],
  'repair-estimate-table': [
    { label: 'Without recommendations', node: <RepairEstimateTable className={MEDIUM} title="Estimate 4418" vehicle="Van 12 · 8KTR204" lines={ESTIMATE_LINES.filter((line) => !line.optional)} /> },
  ],
  'parts-inventory-table': [
    { label: 'A short list', node: <PartsInventoryTable className={WIDE} parts={PARTS.slice(0, 5)} /> },
  ],
  'stock-level-bar': [
    { label: 'One part, nothing wrong', node: <StockLevelBar className={MEDIUM} items={STOCK_LEVELS.slice(4)} /> },
  ],
  'reorder-suggestions': [
    { label: 'A single supplier', node: <ReorderSuggestions className={MEDIUM} suggestions={REORDER.slice(0, 1)} /> },
  ],
  'parts-usage-chart': [
    { label: 'Two parts', node: <PartsUsageChart className={MEDIUM} data={USAGE_DATA} series={USAGE_SERIES.slice(0, 2)} title="Brakes and filters" /> },
  ],
  'part-detail-panel': [
    { label: 'The price tab', node: <PartDetailPanel className={NARROW} part={PART_DETAIL} defaultTab="price" /> },
  ],
  'purchase-order-card': [
    { label: 'Fully received', node: <PurchaseOrderCard className={MEDIUM} id="PO-1179" supplier="Lubeco" status="received" lines={PO_LINES.map((line) => ({ ...line, received: line.qty }))} /> },
  ],
  'tire-status-grid': [
    { label: 'A truck with three axles', node: <TireStatusGrid className={NARROW} vehicle="Truck 05" odometerKm={118940} tires={TRUCK_05_TIRES} minTreadMm={3} newTreadMm={12} /> },
  ],
  'fuel-economy-trend': [
    { label: 'A vehicle that beats the fleet', node: <FuelEconomyTrend className={MEDIUM} data={FUEL_DATA} vehicles={FUEL_VEHICLES} defaultVehicleId="v03" /> },
  ],
  'fluids-battery-panel': [
    { label: 'All fine', node: <FluidsAndBatteryPanel className={MEDIUM} vehicle="Van 03" fluids={FLUIDS.map((fluid) => ({ ...fluid, level: 82, note: undefined }))} battery={{ voltage: 12.7, healthPercent: 93, coldCrankAmps: 720, testedOn: '2026-09-12' }} /> },
  ],
  'fuel-transaction-list': [
    { label: 'Nothing flagged', node: <FuelTransactionList className={MEDIUM} transactions={FUEL_TX.filter((tx) => !tx.flags)} /> },
  ],
  'fleet-kpi-strip': [
    { label: 'Three numbers', node: <FleetKpiStrip className={WIDE} kpis={KPIS.slice(0, 3)} period="vs Aug" /> },
  ],
  'cost-breakdown-chart': [
    { label: 'Per kilometre', node: <CostBreakdownChart className={MEDIUM} data={COST_ROWS} categories={COST_CATEGORIES} defaultMode="perKm" /> },
  ],
  'utilization-grid': [
    { label: 'Trucks only', node: <UtilizationGrid className={WIDE} rows={UTILIZATION_ROWS.filter((row) => row.vehicle.startsWith('Truck'))} endDate={TODAY} /> },
  ],
  'vehicle-leaderboard': [
    { label: 'Ranked by downtime', node: <VehicleLeaderboard className={NARROW} vehicles={LEADERBOARD} metrics={LEADERBOARD_METRICS} defaultMetric="downtimeDays" /> },
  ],
  'replacement-planner': [
    { label: 'A newer vehicle', node: <ReplacementPlanner className={MEDIUM} vehicle="Van 03 · 2023 ProMaster" currentAge={3} purchasePrice={42000} projection={REPLACEMENT_PROJECTION} /> },
  ],
};
