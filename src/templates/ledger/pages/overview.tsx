import { ActivityFeed } from '@/components/app/activity-feed';
import { PageHeader } from '@/components/app/page-header';
import { RevenueChart } from '@/components/app/revenue-chart';
import { StatCardGrid } from '@/components/app/stat-card-grid';
import { Button } from '@/components/ui/button';
import { ACTIVITY, REVENUE, STATS, TODAY } from '../data';
import { AppLayout } from '../layouts';
import type { PageProps } from './types';

export function OverviewPage(props: PageProps) {
  return (
    <AppLayout {...props} active="/app">
      <PageHeader
        title="Overview"
        description="How Northwind is doing this month."
        breadcrumbs={[{ label: 'Ledger' }, { label: 'Overview' }]}
        actions={<Button variant="outline">Export report</Button>}
      />
      <StatCardGrid stats={STATS} period="vs last month" />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <RevenueChart data={REVENUE} title="Revenue" />
        <ActivityFeed items={ACTIVITY} today={TODAY} title="Recent activity" pageSize={4} />
      </div>
    </AppLayout>
  );
}
