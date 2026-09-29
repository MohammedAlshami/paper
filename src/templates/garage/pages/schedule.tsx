import * as React from 'react';
import { PageHeader } from '@/components/app/page-header';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DowntimeForecast } from '@/components/fleet/downtime-forecast';
import { MaintenanceCalendar } from '@/components/fleet/maintenance-calendar';
import { PMScheduleBuilder } from '@/components/fleet/pm-schedule-builder';
import { ServiceIntervalGauge } from '@/components/fleet/service-interval-gauge';
import { BOOKED, DOWNTIME_DAYS, DOWNTIME_VEHICLES, intervalsFor, PM_SCHEDULE, VEHICLES } from '../data';
import { GarageShell, PageBody } from '../shell';
import type { PageContext } from '../context';

export function SchedulePage(ctx: PageContext) {
  const { navigate } = ctx;
  const [vehicleId, setVehicleId] = React.useState('v12');
  const vehicle = VEHICLES.find((item) => item.id === vehicleId)!;

  return (
    <GarageShell activeId="schedule" ctx={ctx}>
      <PageBody>
        <PageHeader
          title="Schedule"
          description="What is booked, what the plan says should be, and how far each vehicle is through its intervals."
          actions={
            <Button size="sm" onClick={() => navigate('/work-orders/new')}>
              Book a service
            </Button>
          }
        />
        <Tabs defaultValue="calendar">
          <TabsList>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="intervals">Intervals</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar">
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <MaintenanceCalendar services={BOOKED} defaultMonth="2026-10" onSelectService={(service) => navigate(`/vehicles/${VEHICLES.find((item) => item.name === service.vehicle)?.id ?? ''}`)} />
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
      </PageBody>
    </GarageShell>
  );
}
