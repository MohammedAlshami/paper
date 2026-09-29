import * as React from 'react';
import { DateRangePicker, type DateRange } from '@/components/app/date-range-picker';
import { EmptyState } from '@/components/app/empty-state';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CostBreakdownChart } from '@/components/fleet/cost-breakdown-chart';
import { FleetKpiStrip } from '@/components/fleet/fleet-kpi-strip';
import { FuelEconomyTrend } from '@/components/fleet/fuel-economy-trend';
import { FuelTransactionList } from '@/components/fleet/fuel-transaction-list';
import { ReplacementPlanner } from '@/components/fleet/replacement-planner';
import { UtilizationGrid } from '@/components/fleet/utilization-grid';
import { VehicleLeaderboard } from '@/components/fleet/vehicle-leaderboard';
import { useToast } from '@/components/app/toast';
import { TODAY } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarbor } from '../../../state';
import { COST_CATEGORIES, COST_ROWS, FUEL_DATA, FUEL_VEHICLES, KPIS, LEADERBOARD, LEADERBOARD_METRICS, REPLACEMENT_PROJECTION, UTILIZATION_ROWS } from '../demo-data';
import { ALL_FUEL } from '../helpers';

export function FuelAndCostsPage() {
  const { counts } = useHarbor();
  const { toast } = useToast();
  const [range, setRange] = React.useState<DateRange>({});
  const kpis = KPIS.map((kpi) => (kpi.id === 'wo' ? { ...kpi, value: String(counts.openWorkOrders) } : kpi));
  const fuel = ALL_FUEL.filter((transaction) => (!range.from || transaction.date >= range.from) && (!range.to || transaction.date <= range.to));

  return (
    <HarborPage
      title="Fuel and costs"
      crumbs={[{ label: 'Fleet', path: '/vehicles' }]}
      description="Where the money goes, how hard each vehicle works, and when to replace one."
      actions={
        <>
          <DateRangePicker value={range} onChange={setRange} today={TODAY} placeholder="All dates" />
          <Button variant="outline" size="sm" onClick={() => toast({ title: 'Export started', description: 'A CSV of the fleet costs will download shortly.' })}>
            Export CSV
          </Button>
        </>
      }
    >
      <FleetKpiStrip kpis={kpis} period="vs last month" />
      <Tabs defaultValue="costs">
        <TabsList className="group-data-[orientation=horizontal]/tabs:h-auto flex-wrap justify-start">
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="fuel">Fuel</TabsTrigger>
          <TabsTrigger value="utilisation">Utilisation</TabsTrigger>
          <TabsTrigger value="replacement">Replacement</TabsTrigger>
        </TabsList>
        <TabsContent value="costs">
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <CostBreakdownChart data={COST_ROWS} categories={COST_CATEGORIES} />
            <VehicleLeaderboard vehicles={LEADERBOARD} metrics={LEADERBOARD_METRICS} />
          </div>
        </TabsContent>
        <TabsContent value="fuel">
          <div className="grid items-start gap-6 xl:grid-cols-2">
            <FuelEconomyTrend data={FUEL_DATA} vehicles={FUEL_VEHICLES} defaultVehicleId="v21" unit="L/100 km" />
            {fuel.length ? (
              <FuelTransactionList transactions={fuel} />
            ) : (
              <EmptyState title="No fuel purchases in this range" description="Pick a wider range to see card transactions." action={{ label: 'Show all dates', onClick: () => setRange({}) }} />
            )}
          </div>
        </TabsContent>
        <TabsContent value="utilisation">
          <UtilizationGrid rows={UTILIZATION_ROWS} endDate={TODAY} />
        </TabsContent>
        <TabsContent value="replacement">
          <ReplacementPlanner className="max-w-3xl" vehicle="Van 21 · 2019 Sprinter" currentAge={7} purchasePrice={42000} projection={REPLACEMENT_PROJECTION} />
        </TabsContent>
      </Tabs>
    </HarborPage>
  );
}
