import { PageHeader } from '@/components/app/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CostBreakdownChart } from '@/components/fleet/cost-breakdown-chart';
import { FleetKpiStrip } from '@/components/fleet/fleet-kpi-strip';
import { FuelEconomyTrend } from '@/components/fleet/fuel-economy-trend';
import { FuelTransactionList } from '@/components/fleet/fuel-transaction-list';
import { ReplacementPlanner } from '@/components/fleet/replacement-planner';
import { UtilizationGrid } from '@/components/fleet/utilization-grid';
import { VehicleLeaderboard } from '@/components/fleet/vehicle-leaderboard';
import { COST_CATEGORIES, COST_ROWS, FUEL_DATA, FUEL_TX, FUEL_VEHICLES, KPIS, LEADERBOARD, LEADERBOARD_METRICS, REPLACEMENT_PROJECTION, TODAY, UTILIZATION_ROWS } from '../data';
import { GarageShell, PageBody } from '../shell';
import type { PageContext } from '../context';

export function ReportsPage(ctx: PageContext) {
  return (
    <GarageShell activeId="reports" ctx={ctx}>
      <PageBody>
        <PageHeader
          title="Reports"
          description="Where the money goes, how hard each vehicle works, and when to replace one."
          actions={
            <Button variant="outline" size="sm">
              Export CSV
            </Button>
          }
        />
        <FleetKpiStrip kpis={KPIS} period="vs last month" />
        <Tabs defaultValue="costs">
          <TabsList className="group-data-[orientation=horizontal]/tabs:h-auto flex-wrap justify-start">
            <TabsTrigger value="costs">Costs</TabsTrigger>
            <TabsTrigger value="utilisation">Utilisation</TabsTrigger>
            <TabsTrigger value="fuel">Fuel</TabsTrigger>
            <TabsTrigger value="replacement">Replacement</TabsTrigger>
          </TabsList>
          <TabsContent value="costs">
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <CostBreakdownChart data={COST_ROWS} categories={COST_CATEGORIES} />
              <VehicleLeaderboard vehicles={LEADERBOARD} metrics={LEADERBOARD_METRICS} />
            </div>
          </TabsContent>
          <TabsContent value="utilisation">
            <UtilizationGrid rows={UTILIZATION_ROWS} endDate={TODAY} />
          </TabsContent>
          <TabsContent value="fuel">
            <div className="grid items-start gap-6 xl:grid-cols-2">
              <FuelEconomyTrend data={FUEL_DATA} vehicles={FUEL_VEHICLES} defaultVehicleId="v21" unit="L/100 km" />
              <FuelTransactionList transactions={FUEL_TX} />
            </div>
          </TabsContent>
          <TabsContent value="replacement">
            <ReplacementPlanner className="max-w-3xl" vehicle="Van 21 · 2019 Sprinter" currentAge={7} purchasePrice={42000} projection={REPLACEMENT_PROJECTION} />
          </TabsContent>
        </Tabs>
      </PageBody>
    </GarageShell>
  );
}
