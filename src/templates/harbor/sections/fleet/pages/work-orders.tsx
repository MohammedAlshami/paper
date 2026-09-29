import * as React from 'react';
import { RecordDetailSheet } from '@/components/app/record-detail-sheet';
import { useToast } from '@/components/app/toast';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DefectReportForm } from '@/components/fleet/defect-report-form';
import { InspectionChecklist } from '@/components/fleet/inspection-checklist';
import { RepairEstimateTable } from '@/components/fleet/repair-estimate-table';
import { WorkOrderBoard } from '@/components/fleet/work-order-board';
import { WORK_ORDER_STATUSES, WorkOrderCard } from '@/components/fleet/work-order-card';
import { formatDate, VEHICLES } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarborRouter } from '../../../router-context';
import { useHarbor } from '../../../state';
import { CHECKLIST } from '../demo-data';
import { estimateFor } from '../helpers';

const statusLabel = (status: string) => WORK_ORDER_STATUSES.find((entry) => entry.id === status)?.label ?? status;

export function WorkOrdersPage() {
  const { navigate } = useHarborRouter();
  const { state, actions } = useHarbor();
  const { toast } = useToast();
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<'defect' | 'inspection' | null>(null);
  const open = state.workOrders.find((order) => order.id === openId);

  const create = (title: string, vehicleName: string, priority: 'low' | 'normal' | 'high' | 'urgent') => {
    const id = actions.addWorkOrder({ title, vehicle: vehicleName, status: 'requested', priority, tasks: [{ id: 't1', label: 'Inspect and diagnose', done: false }], parts: [], laborHours: 1, laborRate: 95 });
    toast({ title: `Work order ${id.toUpperCase()} opened`, description: vehicleName, variant: 'success' });
    setForm(null);
  };

  return (
    <HarborPage
      title="Work orders"
      crumbs={[{ label: 'Fleet', path: '/vehicles' }]}
      description="Drag a card to another column, or use the menu on it. Open one for the job card and the estimate."
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => setForm('inspection')}>
            Pre-trip inspection
          </Button>
          <Button size="sm" onClick={() => setForm('defect')}>
            New work order
          </Button>
        </>
      }
    >
      <WorkOrderBoard
        key={state.workOrders.map((order) => `${order.id}:${order.status}`).join('|')}
        orders={state.workOrders}
        onMove={(order, status) => {
          actions.moveWorkOrder(order.id, status);
          toast({ title: `${order.id.toUpperCase()} moved to ${statusLabel(status).toLowerCase()}`, description: order.title });
        }}
        onOpen={(order) => setOpenId(order.id)}
      />

      <RecordDetailSheet
        open={Boolean(open)}
        onOpenChange={(next) => !next && setOpenId(null)}
        title={open ? `${open.id.toUpperCase()} · ${open.title}` : ''}
        subtitle={open?.vehicle}
        status={open ? { label: statusLabel(open.status), tone: open.priority === 'urgent' ? 'accent' : 'default' } : undefined}
        fields={
          open
            ? [
                { label: 'Vehicle', value: open.vehicle },
                { label: 'Priority', value: open.priority },
                { label: 'Technician', value: open.technician ?? 'Unassigned' },
                { label: 'Bay', value: open.bay ?? 'Not in a bay' },
                { label: 'Opened', value: formatDate(open.openedOn) },
              ]
            : []
        }
        tabs={
          open
            ? [
                { id: 'card', label: 'Job card', content: <WorkOrderCard order={open} onAdvance={(status) => actions.moveWorkOrder(open.id, status)} /> },
                { id: 'estimate', label: 'Estimate', content: <RepairEstimateTable title={open.title} vehicle={open.vehicle} shop="Harbor depot workshop" lines={estimateFor(open)} taxRate={0.0875} onSubmit={(_, total) => toast({ title: 'Estimate approved', description: `Total $${total.toFixed(2)}.`, variant: 'success' })} /> },
              ]
            : []
        }
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const match = VEHICLES.find((item) => item.name === open?.vehicle);
                if (match) navigate(`/vehicles/${match.id}`);
              }}
            >
              Open vehicle
            </Button>
            <Button size="sm" variant="outline" onClick={() => setOpenId(null)}>
              Close
            </Button>
          </>
        }
      />

      <Sheet open={form !== null} onOpenChange={(next) => !next && setForm(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{form === 'inspection' ? 'Pre-trip inspection' : 'New work order'}</SheetTitle>
            <SheetDescription>{form === 'inspection' ? 'A failed item opens a work order for the workshop.' : 'Drivers and dispatchers report a defect, and the workshop sees it straight away.'}</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            {form === 'defect' ? (
              <DefectReportForm
                vehicles={VEHICLES.map((vehicle) => ({ id: vehicle.id, name: vehicle.name, plate: vehicle.plate }))}
                defaultValues={{ vehicleId: 'v21' }}
                onSubmit={(report) => {
                  const match = VEHICLES.find((item) => item.id === report.vehicleId);
                  create(`${report.system}: ${report.description.slice(0, 48)}`, match?.name ?? 'Unknown', report.severity === 'unsafe' ? 'urgent' : report.severity === 'attention' ? 'high' : 'normal');
                }}
              />
            ) : null}
            {form === 'inspection' ? (
              <InspectionChecklist
                vehicle="Van 12 · 8KTR204"
                sections={CHECKLIST}
                onSubmit={(results, outOfService) => {
                  const failed = results.filter((result) => result.result === 'fail');
                  if (failed.length) create(`Failed inspection: ${failed.length} item${failed.length === 1 ? '' : 's'}`, 'Van 12', outOfService ? 'urgent' : 'normal');
                  else {
                    toast({ title: 'Inspection passed', description: 'Van 12 is clear to go out.', variant: 'success' });
                    setForm(null);
                  }
                }}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </HarborPage>
  );
}
