import { PageHeader } from '@/components/app/page-header';
import { DefectReportForm } from '@/components/fleet/defect-report-form';
import { InspectionChecklist } from '@/components/fleet/inspection-checklist';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CHECKLIST, TODAY, VEHICLES } from '../data';
import { GarageShell, PageBody } from '../shell';
import type { PageContext } from '../context';

export function WorkOrderNewPage(ctx: PageContext) {
  const { navigate, orders, setOrders } = ctx;
  const nextId = () => `WO-${2269 + orders.length - 9}`;

  return (
    <GarageShell activeId="work-orders" ctx={ctx}>
      <PageBody>
        <PageHeader
          breadcrumbs={[{ label: 'Work orders', href: '#' }, { label: 'New' }]}
          onCrumb={() => navigate('/work-orders')}
          title="Report a defect"
          description="Drivers file a defect or walk round the vehicle. Either one opens a work order for the workshop."
        />
        <Tabs defaultValue="defect">
          <TabsList>
            <TabsTrigger value="defect">Report a defect</TabsTrigger>
            <TabsTrigger value="inspection">Pre-trip inspection</TabsTrigger>
          </TabsList>
          <TabsContent value="defect">
            <DefectReportForm
              className="max-w-2xl"
              vehicles={VEHICLES.map((vehicle) => ({ id: vehicle.id, name: vehicle.name, plate: vehicle.plate }))}
              defaultValues={{ vehicleId: 'v21', system: 'Brakes' }}
              onSubmit={(report) => {
                const vehicle = VEHICLES.find((item) => item.id === report.vehicleId);
                setOrders((current) => [
                  {
                    id: nextId(),
                    title: `${report.system}: ${report.description.slice(0, 48)}`,
                    vehicle: vehicle?.name ?? 'Unknown',
                    status: 'requested',
                    priority: report.severity === 'unsafe' ? 'urgent' : report.severity === 'attention' ? 'high' : 'normal',
                    openedOn: TODAY,
                  },
                  ...current,
                ]);
                navigate('/work-orders');
              }}
            />
          </TabsContent>
          <TabsContent value="inspection">
            <InspectionChecklist
              className="max-w-2xl"
              vehicle="Van 12 · 8KTR204"
              sections={CHECKLIST}
              onSubmit={(results, outOfService) => {
                const failed = results.filter((result) => result.result === 'fail');
                if (failed.length) {
                  setOrders((current) => [
                    {
                      id: nextId(),
                      title: `Failed inspection: ${failed.length} item${failed.length === 1 ? '' : 's'}`,
                      vehicle: 'Van 12',
                      status: 'requested',
                      priority: outOfService ? 'urgent' : 'normal',
                      openedOn: TODAY,
                    },
                    ...current,
                  ]);
                }
                navigate('/work-orders');
              }}
            />
          </TabsContent>
        </Tabs>
      </PageBody>
    </GarageShell>
  );
}
