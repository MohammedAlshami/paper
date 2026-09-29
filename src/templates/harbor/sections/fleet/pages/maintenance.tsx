import * as React from 'react';
import { useToast } from '@/components/app/toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DowntimeForecast } from '@/components/fleet/downtime-forecast';
import { MaintenanceCalendar, type BookedService } from '@/components/fleet/maintenance-calendar';
import { PMScheduleBuilder } from '@/components/fleet/pm-schedule-builder';
import { ServiceDueList, type DueService } from '@/components/fleet/service-due-list';
import { ServiceIntervalGauge } from '@/components/fleet/service-interval-gauge';
import { addDays, getVehicle, INITIAL_WORK_ORDERS, SERVICE_DUE, TODAY, VEHICLES } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarborRouter } from '../../../router-context';
import { useHarbor } from '../../../state';
import { BOOKED, DOWNTIME_DAYS, DOWNTIME_VEHICLES, PM_SCHEDULE } from '../demo-data';
import { intervalsFor } from '../helpers';

const INITIAL_IDS = new Set(INITIAL_WORK_ORDERS.map((order) => order.id));

export function MaintenancePage() {
  const { navigate } = useHarborRouter();
  const { state, actions } = useHarbor();
  const { toast } = useToast();
  const [scheduled, setScheduled] = React.useState<string[]>([]);
  const [vehicleId, setVehicleId] = React.useState('v12');
  const vehicle = getVehicle(vehicleId) ?? VEHICLES[0];

  // Services booked in this session land on the calendar over the next few days.
  const added = state.workOrders.filter((order) => !INITIAL_IDS.has(order.id) && order.status !== 'done');
  const booked: BookedService[] = [
    ...BOOKED,
    ...added.map((order, index) => ({ id: order.id, date: addDays(TODAY, 1 + (index % 6)), vehicle: order.vehicle, service: order.title, status: 'booked' as const })),
  ];

  const due: DueService[] = SERVICE_DUE.filter((item) => !scheduled.includes(item.id)).map((item) => {
    const owner = getVehicle(item.vehicleId);
    return { id: item.id, vehicle: owner?.name ?? item.vehicleId, service: item.service, dueKm: item.dueKm, currentKm: owner?.odometerKm, dueDate: item.dueDate };
  });

  const schedule = (item: DueService) => {
    const orderId = actions.addWorkOrder({
      title: item.service,
      vehicle: item.vehicle,
      status: 'scheduled',
      priority: item.dueDate && item.dueDate < TODAY ? 'high' : 'normal',
      tasks: [{ id: 't1', label: item.service, done: false }],
      parts: [],
      laborHours: 1,
      laborRate: 95,
    });
    setScheduled((current) => [...current, item.id]);
    toast({ title: `${item.service} booked for ${item.vehicle}`, description: `Work order ${orderId.toUpperCase()}, on the calendar.`, variant: 'success', action: { label: 'View', onClick: () => navigate('/work-orders') } });
  };

  return (
    <HarborPage
      title="Maintenance"
      description="What is booked, what is coming due, and how far each van is through its service intervals. Keeping the vans available is what keeps the deliveries on time."
      actions={
        <Button size="sm" variant="outline" onClick={() => navigate('/work-orders')}>
          Open work orders
        </Button>
      }
    >
      <Tabs defaultValue="schedule">
        <TabsList>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="intervals">Intervals</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <div className="flex flex-col gap-6">
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <MaintenanceCalendar
                services={booked}
                defaultMonth="2026-10"
                onSelectService={(service) => {
                  const match = VEHICLES.find((item) => item.name === service.vehicle);
                  if (match) navigate(`/vehicles/${match.id}`);
                }}
              />
              <ServiceDueList items={due} today={TODAY} onSchedule={schedule} />
            </div>
            <DowntimeForecast days={DOWNTIME_DAYS} vehicles={DOWNTIME_VEHICLES} fleetSize={VEHICLES.length} />
          </div>
        </TabsContent>

        <TabsContent value="plans">
          <PMScheduleBuilder defaultValue={PM_SCHEDULE} />
        </TabsContent>

        <TabsContent value="intervals">
          <div className="flex max-w-xl flex-col gap-4">
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger className="w-56" aria-label="Vehicle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VEHICLES.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ServiceIntervalGauge vehicle={vehicle.name} odometerKm={vehicle.odometerKm} intervals={intervalsFor(vehicle)} />
          </div>
        </TabsContent>
      </Tabs>
    </HarborPage>
  );
}
