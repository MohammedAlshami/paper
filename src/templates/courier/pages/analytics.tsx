import { PageHeader } from '@/components/app/page-header';
import { StatCardGrid } from '@/components/app/stat-card-grid';
import { CoverageMap } from '@/components/maps/coverage-map';
import { HeatmapCard } from '@/components/maps/heatmap-card';
import { RegionChoropleth } from '@/components/maps/region-choropleth';
import { ANALYTICS_STATS, STATE_DATA } from '../data/ops';
import { HEAT_POINTS } from '../data/heat';
import { COVERAGE_CELLS } from '../data/places';
import { US_STATES } from '../data/us-states';

/** Where demand is, where we reach, and how it compares across the country. */
export function AnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics" description="Where orders come from and where the network reaches." breadcrumbs={[{ label: 'Courier' }, { label: 'Analytics' }]} />
      <StatCardGrid stats={ANALYTICS_STATS} period="vs last week" />
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <HeatmapCard className="w-full max-w-none" points={HEAT_POINTS} defaultRange={[11, 14]} title="Order density" />
        <CoverageMap className="w-full max-w-none" cells={COVERAGE_CELLS} />
      </div>
      <RegionChoropleth className="w-full max-w-none" geojson={US_STATES} data={STATE_DATA} title="Top states" metricLabel="Same-day orders per 10,000 residents (sample data)" />
    </>
  );
}
