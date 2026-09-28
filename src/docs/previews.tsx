import * as React from 'react';
import { AddressPicker } from '@/components/maps/address-picker';
import { BranchDirectory } from '@/components/maps/branch-directory';
import { CommuteCalculator } from '@/components/maps/commute-calculator';
import { CoverageMap } from '@/components/maps/coverage-map';
import { DeliveryTrackerCard } from '@/components/maps/delivery-tracker-card';
import { DispatchBoard } from '@/components/maps/dispatch-board';
import { DriverArrivingSheet } from '@/components/maps/driver-arriving-sheet';
import { EventVenueCard } from '@/components/maps/event-venue-card';
import { FleetOverview, type FleetVehicle } from '@/components/maps/fleet-overview';
import { GeofenceAlertFeed } from '@/components/maps/geofence-alert-feed';
import { HeatmapCard } from '@/components/maps/heatmap-card';
import { ItineraryMap } from '@/components/maps/itinerary-map';
import { LocationBadge } from '@/components/maps/location-badge';
import { bearing, type LngLat } from '@/components/maps/map-kit';
import { MapCoordinatesInput } from '@/components/maps/map-coordinates-input';
import { NearbyList } from '@/components/maps/nearby-list';
import { OrderRouteMini } from '@/components/maps/order-route-mini';
import { OriginDestinationFlow } from '@/components/maps/origin-destination-flow';
import { PickupPointSelector } from '@/components/maps/pickup-point-selector';
import { PlaceCard } from '@/components/maps/place-card';
import { ProofOfDelivery } from '@/components/maps/proof-of-delivery';
import { PropertyMapCard } from '@/components/maps/property-map-card';
import { RegionChoropleth, type RegionDatum } from '@/components/maps/region-choropleth';
import { RouteOptimizerResult } from '@/components/maps/route-optimizer-result';
import { ServiceAreaChecker } from '@/components/maps/service-area-checker';
import { ShipmentJourney } from '@/components/maps/shipment-journey';
import { StoreLocator } from '@/components/maps/store-locator';
import { TripReplay } from '@/components/maps/trip-replay';
import { TripSummaryCard } from '@/components/maps/trip-summary-card';
import { VehicleDetailPanel } from '@/components/maps/vehicle-detail-panel';
import { WeatherAlertMap } from '@/components/maps/weather-alert-map';
import { FLEET_ROUTES } from './fixtures/fleet-routes';
import { HEAT_POINTS } from './fixtures/heat';
import { ISOCHRONES } from './fixtures/isochrones';
import { DROP_OFF_PHOTO, SHOPFRONT_PHOTO, SIGNATURE_PATH } from './fixtures/media';
import { OPTIMIZER_BEST, OPTIMIZER_BEST_ROUTE, OPTIMIZER_NAIVE, OPTIMIZER_NAIVE_ROUTE } from './fixtures/optimizer';
import {
  BRANCHES,
  COVERAGE_CELLS,
  DISPATCH_DRIVERS,
  DISPATCH_JOBS,
  FLOWS,
  FLOW_NODES,
  GEOFENCE_EVENTS,
  ITINERARY,
  LISTINGS,
  PARKING,
  PICKUP_POINTS,
  SERVICE_ZONES,
  SHIPMENT_LEGS,
  SHIPMENT_LEGS_AIR,
  VENUE,
  WEATHER_ALERTS,
} from './fixtures/places';
import { reverseAddress, searchAddresses, STORES, USER_POSITION } from './fixtures/san-francisco';
import { TRIP_DISTANCE_KM, TRIP_ELEVATION, TRIP_ELEVATION_GAIN_M, TRIP_ROUTE } from './fixtures/trip';
import { US_STATE_NAMES, US_STATES } from './fixtures/us-states';

/** A real street-following route (Mission → Hayes Valley, San Francisco), fetched once from OSRM. */
const ROUTE: LngLat[] = [
  [-122.42410, 37.76155],
  [-122.42384, 37.76156],
  [-122.42375, 37.76166],
  [-122.42391, 37.76317],
  [-122.42398, 37.76397],
  [-122.42405, 37.76472],
  [-122.42406, 37.76489],
  [-122.42422, 37.76641],
  [-122.42430, 37.76734],
  [-122.42435, 37.76779],
  [-122.42436, 37.76802],
  [-122.42439, 37.76825],
  [-122.42443, 37.76864],
  [-122.42449, 37.76921],
  [-122.42454, 37.76975],
  [-122.42473, 37.76973],
  [-122.42503, 37.76972],
  [-122.42538, 37.76969],
  [-122.42558, 37.76968],
  [-122.42597, 37.76966],
  [-122.42620, 37.76965],
  [-122.42633, 37.76964],
  [-122.42640, 37.76963],
  [-122.42649, 37.76964],
  [-122.42654, 37.76965],
  [-122.42659, 37.76969],
  [-122.42666, 37.77000],
  [-122.42680, 37.77067],
  [-122.42708, 37.77063],
  [-122.42836, 37.77047],
  [-122.42846, 37.77054],
  [-122.42862, 37.77134],
  [-122.42865, 37.77147],
  [-122.42880, 37.77224],
  [-122.42883, 37.77240],
  [-122.42893, 37.77286],
  [-122.42901, 37.77326],
  [-122.42918, 37.77411],
  [-122.42921, 37.77427],
  [-122.42929, 37.77466],
  [-122.42938, 37.77512],
  [-122.42948, 37.77559],
  [-122.42957, 37.77605],
  [-122.42992, 37.77601],
  [-122.43093, 37.77588],
  [-122.43122, 37.77584],
  [-122.43150, 37.77581],
  [-122.43276, 37.77565],
  [-122.43297, 37.77562],
  [-122.43394, 37.77550],
];

const ORIGIN = ROUTE[0];
const DESTINATION = ROUTE[ROUTE.length - 1];
const DRIVER = ROUTE[Math.round(ROUTE.length * 0.58)];

/* ---------- DeliveryTrackerCard ---------- */

const STEPS = [
  { id: 'packed', label: 'Packed' },
  { id: 'picked-up', label: 'Picked up' },
  { id: 'on-the-way', label: 'On the way' },
  { id: 'arriving', label: 'Arriving' },
  { id: 'delivered', label: 'Delivered' },
];

const ORDER = {
  className: 'w-full max-w-[26rem]',
  orderId: '#48213',
  origin: { label: 'Guerrero Market', position: ORIGIN },
  destination: { label: '412 Hayes St, San Francisco', position: DESTINATION },
  route: ROUTE,
  steps: STEPS,
};

const DRIVER_INFO = { name: 'Marcus Lee', vehicle: 'White Toyota Prius', plate: '8KTR204', rating: 4.9 };

/* ---------- FleetOverview ---------- */

interface FleetSeed {
  id: string;
  name: string;
  driver: string;
  task: string;
  status: FleetVehicle['status'];
  route?: number;
  offset?: number;
  speedKph?: number;
  position?: LngLat;
}

const FLEET_SEED: FleetSeed[] = [
  { id: 'v12', name: 'Van 12', driver: 'Priya Nair', task: '6 stops left', status: 'moving', route: 0, offset: 10, speedKph: 34 },
  { id: 'v07', name: 'Van 07', driver: 'Diego Alvarez', task: '3 stops left', status: 'moving', route: 1, offset: 25, speedKph: 41 },
  { id: 'b03', name: 'Bike 03', driver: 'Sam Okafor', task: 'Delivering', status: 'moving', route: 2, offset: 5, speedKph: 19 },
  { id: 'v21', name: 'Van 21', driver: 'Lena Fischer', task: 'Road closed ahead', status: 'delayed', route: 3, offset: 30, speedKph: 6 },
  { id: 't02', name: 'Truck 02', driver: 'Omar Haddad', task: 'Returning to depot', status: 'moving', route: 4, offset: 15, speedKph: 37 },
  { id: 'v03', name: 'Van 03', driver: 'Mia Chen', task: 'At the depot', status: 'idle', position: [-122.3998, 37.7605], speedKph: 0 },
  { id: 'v18', name: 'Van 18', driver: 'Jon Berg', task: 'On break', status: 'idle', position: [-122.446, 37.771], speedKph: 0 },
  { id: 'b09', name: 'Bike 09', driver: 'Unassigned', task: 'No signal for 42 min', status: 'offline', position: [-122.418, 37.79] },
];

function fleetAt(tick: number): FleetVehicle[] {
  return FLEET_SEED.map((seed) => {
    if (seed.route === undefined) {
      return { id: seed.id, name: seed.name, driver: seed.driver, task: seed.task, status: seed.status, position: seed.position!, speedKph: seed.speedKph };
    }
    const path = FLEET_ROUTES[seed.route];
    const index = ((seed.offset ?? 0) + tick * (seed.status === 'delayed' ? 0 : 1)) % (path.length - 1);
    return {
      id: seed.id,
      name: seed.name,
      driver: seed.driver,
      task: seed.task,
      status: seed.status,
      position: path[index],
      heading: bearing(path[index], path[index + 1]),
      speedKph: seed.speedKph,
    };
  });
}

/** The fleet, live: each moving vehicle steps along its real route every 1.6 seconds. */
function FleetOverviewDemo() {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const timer = window.setInterval(() => setTick((current) => current + 1), 1600);
    return () => window.clearInterval(timer);
  }, []);
  return <FleetOverview className="w-full max-w-[60rem]" vehicles={fleetAt(tick)} />;
}

/* ---------- RegionChoropleth ---------- */

/** Deterministic sample values, so the demo looks the same every time. Not real data. */
const STATE_DATA: RegionDatum[] = US_STATE_NAMES.map((name) => {
  let hash = 0;
  for (const character of name) hash = (hash * 31 + character.charCodeAt(0)) % 997;
  return { id: name, value: 38 + (hash % 131) };
});

const CHOROPLETH = {
  geojson: US_STATES,
  data: STATE_DATA,
  title: 'Top states',
  metricLabel: 'Same-day orders per 10,000 residents (sample data)',
};

/* ---------- AddressPicker ---------- */

const PICKER = {
  className: 'w-full max-w-[26rem]',
  search: searchAddresses,
  reverseGeocode: reverseAddress,
};

/* ---------- TripSummaryCard ---------- */

const TRIP = {
  className: 'w-full max-w-[24rem]',
  title: 'Presidio loop',
  date: 'Sat, 27 Sep · 8:12 am',
  athlete: 'Marcus Lee',
  route: TRIP_ROUTE,
  elevation: TRIP_ELEVATION,
  distanceKm: TRIP_DISTANCE_KM,
  elevationGainM: TRIP_ELEVATION_GAIN_M,
};

/* ---------- the rest ---------- */

const NARROW = 'w-full max-w-[26rem]';
const WIDE = 'w-full max-w-[60rem]';

const NEARBY = STORES.map((store) => ({ id: store.id, name: store.name, category: store.category, position: store.position, openNow: store.openNow, hours: store.hours }));

const OPTIMIZER_STOPS = [
  { label: 'Depot', position: [-122.3998, 37.7605] as LngLat, beforeIndex: 0, afterIndex: 0 },
  { label: 'Haight St', position: [-122.4477, 37.7691] as LngLat, beforeIndex: 1, afterIndex: 2 },
  { label: 'North Beach', position: [-122.4102, 37.8005] as LngLat, beforeIndex: 2, afterIndex: 4 },
  { label: 'Cole Valley', position: [-122.446, 37.771] as LngLat, beforeIndex: 3, afterIndex: 3 },
  { label: 'Mission', position: [-122.4195, 37.7599] as LngLat, beforeIndex: 4, afterIndex: 1 },
  { label: 'Marina', position: [-122.437, 37.8036] as LngLat, beforeIndex: 5, afterIndex: 5 },
];

const VEHICLE = {
  name: 'Van 12',
  plate: '8KTR204',
  status: 'moving' as const,
  driver: { name: 'Priya Nair', phone: '+1 415 555 0118' },
  speedKph: 34,
  fuelPercent: 62,
  odometerKm: 48210,
  position: FLEET_ROUTES[0][30],
};
const VEHICLE_STOPS = [
  { time: '8:05 am', label: 'Depot, loaded', dwell: '22 min' },
  { time: '9:40 am', label: '412 Hayes St', dwell: '4 min' },
  { time: '10:52 am', label: '1200 Valencia St', dwell: '6 min' },
];

const PLACE = {
  name: 'Dolores Pastry',
  category: 'Bakery · Pastries',
  address: '3500 19th St, San Francisco',
  position: [-122.4245, 37.7604] as LngLat,
  rating: 4.9,
  reviewCount: 1284,
  priceLevel: 2 as const,
  openNow: true,
  hours: 'Closes 5 pm',
};

const REPLAY = {
  route: TRIP_ROUTE,
  movingMin: 46,
  startMinutes: 8 * 60 + 12,
  stops: [
    { at: 0.36, label: 'Coffee stop', dwellMin: 6 },
    { at: 0.7, label: 'Viewpoint', dwellMin: 4 },
  ],
};

const ROW_ORDERS = (
  <div className={`${NARROW} space-y-2`}>
    <OrderRouteMini title="Order #48213" from="Guerrero Market" to="412 Hayes St" route={ROUTE} position={DRIVER} status="on-the-way" detail="Arrives 2:40 pm" />
    <OrderRouteMini title="Order #48214" from="Guerrero Market" to="Marina" route={FLEET_ROUTES[0]} position={FLEET_ROUTES[0][14]} status="delayed" detail="12 min late" />
    <OrderRouteMini title="Order #48190" from="Guerrero Market" to="Haight St" route={FLEET_ROUTES[3]} status="delivered" detail="Yesterday, 6:12 pm" />
  </div>
);

/* ---------- registry hooks ---------- */

export const PREVIEWS: Record<string, React.ReactNode> = {
  'delivery-tracker-card': (
    <DeliveryTrackerCard {...ORDER} driver={{ ...DRIVER_INFO, position: DRIVER }} currentStepId="on-the-way" etaMinutes={6} />
  ),
  'order-route-mini': ROW_ORDERS,
  'driver-arriving-sheet': (
    <DriverArrivingSheet
      className="w-full max-w-[24rem]"
      pickup={{ label: 'Your pickup', position: ROUTE[26] }}
      driver={{ ...DRIVER_INFO, rating: 4.92, position: ROUTE[10] }}
      route={ROUTE.slice(10, 27)}
      etaMinutes={3}
      pin="4821"
    />
  ),
  'shipment-journey': <ShipmentJourney className={NARROW} title="Order #77120 · 240 units" reference="MSKU 4471903" legs={SHIPMENT_LEGS} />,
  'proof-of-delivery': (
    <ProofOfDelivery
      className="w-full max-w-[26rem]"
      deliveredAt="Tue 29 Sep, 2:41 pm"
      recipient="Jordan Ellis"
      address="412 Hayes St, front door"
      position={DESTINATION}
      photoUrl={DROP_OFF_PHOTO}
      photoCaption="Left at the front door"
      signaturePath={SIGNATURE_PATH}
      driver="Marcus Lee"
      note="Ring the bell twice."
    />
  ),
  'store-locator': <StoreLocator className={WIDE} stores={STORES} userPosition={USER_POSITION} />,
  'place-card': <PlaceCard className="w-full max-w-[22rem]" place={PLACE} userPosition={USER_POSITION} />,
  'nearby-list': <NearbyList className={NARROW} places={NEARBY} origin={USER_POSITION} limit={6} selectedId="s3" />,
  'branch-directory': <BranchDirectory className={WIDE} branches={BRANCHES} defaultSelectedId="sf" />,
  'event-venue-card': (
    <EventVenueCard
      className="w-full max-w-[28rem]"
      title="Neon Harbor Live"
      month="OCT"
      day={14}
      time="Doors 7 pm · Show 8 pm"
      venue="Harbor Hall"
      address={VENUE.address}
      position={VENUE.position}
      parking={PARKING}
    />
  ),
  'address-picker': (
    <AddressPicker {...PICKER} defaultValue={{ position: [-122.421, 37.76035], address: '800 Valencia Street' }} />
  ),
  'service-area-checker': (
    <ServiceAreaChecker className="w-full max-w-[28rem]" zones={SERVICE_ZONES} defaultPosition={USER_POSITION} search={searchAddresses} onNotify={() => undefined} />
  ),
  'pickup-point-selector': <PickupPointSelector className="w-full max-w-[28rem]" points={PICKUP_POINTS} userPosition={USER_POSITION} defaultSelectedId="p2" />,
  'location-badge': (
    <div className="min-h-[19rem] w-full max-w-[26rem]">
      <LocationBadge city="San Francisco" region="California" country="US" flag="🇺🇸" position={[-122.4194, 37.7749]} defaultOpen />
    </div>
  ),
  'map-coordinates-input': <MapCoordinatesInput className={NARROW} defaultValue={[-122.4194, 37.7749]} />,
  'fleet-overview': <FleetOverviewDemo />,
  'vehicle-detail-panel': <VehicleDetailPanel className={NARROW} vehicle={VEHICLE} trail={FLEET_ROUTES[0].slice(0, 31)} stops={VEHICLE_STOPS} />,
  'dispatch-board': <DispatchBoard className={WIDE} jobs={DISPATCH_JOBS} drivers={DISPATCH_DRIVERS} defaultAssignments={{ j1: 'd2', j3: 'd1' }} />,
  'route-optimizer-result': (
    <RouteOptimizerResult
      className="w-full max-w-[30rem]"
      stops={OPTIMIZER_STOPS}
      before={{ route: OPTIMIZER_NAIVE_ROUTE, ...OPTIMIZER_NAIVE }}
      after={{ route: OPTIMIZER_BEST_ROUTE, ...OPTIMIZER_BEST }}
    />
  ),
  'geofence-alert-feed': <GeofenceAlertFeed className="w-full max-w-[30rem]" events={GEOFENCE_EVENTS} />,
  'region-choropleth': <RegionChoropleth className="w-full max-w-[56rem]" {...CHOROPLETH} />,
  'origin-destination-flow': (
    <OriginDestinationFlow className="w-full max-w-[56rem]" nodes={FLOW_NODES} flows={FLOWS} metricLabel="Shipments this month" />
  ),
  'heatmap-card': <HeatmapCard className="w-full max-w-[30rem]" points={HEAT_POINTS} defaultRange={[11, 14]} />,
  'coverage-map': <CoverageMap className="w-full max-w-[34rem]" cells={COVERAGE_CELLS} />,
  'trip-replay': <TripReplay className="w-full max-w-[32rem]" {...REPLAY} defaultProgress={0.42} />,
  'trip-summary-card': <TripSummaryCard {...TRIP} activity="run" durationMin={46} />,
  'itinerary-map': <ItineraryMap className="w-full max-w-[56rem]" days={ITINERARY} />,
  'property-map-card': <PropertyMapCard className="w-[28rem] max-w-[calc(100vw-5rem)]" listings={LISTINGS} defaultSelectedId="l1" />,
  'commute-calculator': (
    <CommuteCalculator className="w-full max-w-[30rem]" work={{ label: 'Union Square', position: [-122.4074, 37.7879] }} isochrones={ISOCHRONES} defaultHome={[-122.4477, 37.7691]} search={searchAddresses} />
  ),
  'weather-alert-map': <WeatherAlertMap className="w-full max-w-[56rem]" alerts={WEATHER_ALERTS} />,
};

export const EXAMPLES: Record<string, { label: string; node: React.ReactNode }[]> = {
  'delivery-tracker-card': [
    {
      label: 'Just left the store',
      node: <DeliveryTrackerCard {...ORDER} driver={{ ...DRIVER_INFO, position: ROUTE[3] }} currentStepId="picked-up" etaMinutes={9} />,
    },
    {
      label: 'Arriving now',
      node: (
        <DeliveryTrackerCard
          {...ORDER}
          driver={{ ...DRIVER_INFO, position: ROUTE[ROUTE.length - 4] }}
          currentStepId="arriving"
          etaMinutes={1}
        />
      ),
    },
  ],
  'order-route-mini': [
    {
      label: 'A single order',
      node: (
        <div className={NARROW}>
          <OrderRouteMini title="Order #48213" from="Guerrero Market" to="412 Hayes St" route={ROUTE} position={DRIVER} status="preparing" detail="Ready at 2:10 pm" />
        </div>
      ),
    },
  ],
  'driver-arriving-sheet': [
    {
      label: 'The driver is here',
      node: (
        <DriverArrivingSheet
          className="w-full max-w-[24rem]"
          pickup={{ label: 'Your pickup', position: ROUTE[26] }}
          driver={{ ...DRIVER_INFO, rating: 4.92, position: ROUTE[25] }}
          route={ROUTE.slice(25, 27)}
          etaMinutes={1}
        />
      ),
    },
  ],
  'shipment-journey': [
    {
      label: 'Air and rail',
      node: <ShipmentJourney className={NARROW} title="Order #77188 · 12 pallets" reference="AWB 020-44819302" legs={SHIPMENT_LEGS_AIR} />,
    },
  ],
  'proof-of-delivery': [
    {
      label: 'No photo, no signature',
      node: <ProofOfDelivery className="w-full max-w-[26rem]" deliveredAt="Tue 29 Sep, 2:41 pm" recipient="Jordan Ellis" address="412 Hayes St" position={DESTINATION} />,
    },
  ],
  'store-locator': [
    {
      label: 'A store already selected',
      node: <StoreLocator className={WIDE} stores={STORES} userPosition={USER_POSITION} selectedId="s3" />,
    },
    {
      label: 'Without the visitor’s position',
      node: <StoreLocator className={WIDE} stores={STORES} />,
    },
  ],
  'place-card': [
    {
      label: 'With a photo',
      node: <PlaceCard className="w-full max-w-[22rem]" place={{ ...PLACE, photoUrl: SHOPFRONT_PHOTO }} userPosition={USER_POSITION} />,
    },
  ],
  'nearby-list': [
    {
      label: 'The three nearest',
      node: <NearbyList className={NARROW} places={NEARBY} origin={USER_POSITION} limit={3} />,
    },
  ],
  'branch-directory': [
    {
      label: 'Nothing selected',
      node: <BranchDirectory className={WIDE} branches={BRANCHES} />,
    },
  ],
  'event-venue-card': [
    {
      label: 'Street parking only',
      node: (
        <EventVenueCard
          className="w-full max-w-[28rem]"
          title="Sunday Flea"
          month="NOV"
          day={3}
          time="10 am to 4 pm"
          venue="Harbor Hall lot"
          address={VENUE.address}
          position={VENUE.position}
          parking={PARKING.slice(2, 3)}
        />
      ),
    },
  ],
  'address-picker': [
    {
      label: 'Starting from a dropped pin',
      node: <AddressPicker {...PICKER} defaultValue={{ position: [-122.4265, 37.7545] }} confirmLabel="Deliver here" />,
    },
  ],
  'service-area-checker': [
    {
      label: 'Outside every zone',
      node: (
        <ServiceAreaChecker className="w-full max-w-[28rem]" zones={SERVICE_ZONES} defaultPosition={[-122.4783, 37.7301]} search={searchAddresses} onNotify={() => undefined} />
      ),
    },
  ],
  'pickup-point-selector': [
    {
      label: 'Nothing chosen yet',
      node: <PickupPointSelector className="w-full max-w-[28rem]" points={PICKUP_POINTS} userPosition={USER_POSITION} />,
    },
  ],
  'location-badge': [
    {
      label: 'Closed until hovered',
      node: (
        <div className="min-h-[19rem] w-full max-w-[26rem]">
          <LocationBadge city="Lisbon" country="PT" flag="🇵🇹" position={[-9.1393, 38.7223]} />
        </div>
      ),
    },
  ],
  'map-coordinates-input': [
    {
      label: 'A different place',
      node: <MapCoordinatesInput className={NARROW} defaultValue={[2.3522, 48.8566]} />,
    },
  ],
  'fleet-overview': [
    {
      label: 'A quiet night',
      node: (
        <FleetOverview
          className={WIDE}
          vehicles={fleetAt(0).map((vehicle) => ({ ...vehicle, status: vehicle.status === 'offline' ? 'offline' : 'idle', speedKph: 0 }))}
        />
      ),
    },
  ],
  'vehicle-detail-panel': [
    {
      label: 'Low on fuel',
      node: <VehicleDetailPanel className={NARROW} vehicle={{ ...VEHICLE, status: 'delayed', fuelPercent: 12, speedKph: 6 }} trail={FLEET_ROUTES[0].slice(0, 31)} />,
    },
  ],
  'dispatch-board': [
    {
      label: 'Nothing assigned yet',
      node: <DispatchBoard className={WIDE} jobs={DISPATCH_JOBS} drivers={DISPATCH_DRIVERS} />,
    },
  ],
  'route-optimizer-result': [
    {
      label: 'Showing only the new route',
      node: (
        <RouteOptimizerResult
          className="w-full max-w-[30rem]"
          stops={OPTIMIZER_STOPS}
          before={{ route: OPTIMIZER_NAIVE_ROUTE, ...OPTIMIZER_NAIVE }}
          after={{ route: OPTIMIZER_BEST_ROUTE, ...OPTIMIZER_BEST }}
        />
      ),
    },
  ],
  'geofence-alert-feed': [
    {
      label: 'An older event selected',
      node: <GeofenceAlertFeed className="w-full max-w-[30rem]" events={GEOFENCE_EVENTS} defaultSelectedId="g3" />,
    },
  ],
  'region-choropleth': [
    {
      label: 'A custom colour scale',
      node: (
        <RegionChoropleth
          className="w-full max-w-[56rem]"
          {...CHOROPLETH}
          colors={['#f3f3f3', '#a3a3a3', '#2e2e2e']}
          formatValue={(value) => `${value}`}
          topN={5}
        />
      ),
    },
  ],
  'origin-destination-flow': [
    {
      label: 'The top five only',
      node: <OriginDestinationFlow className="w-full max-w-[56rem]" nodes={FLOW_NODES} flows={FLOWS} topN={5} title="Top five routes" />,
    },
  ],
  'heatmap-card': [
    {
      label: 'Evening only',
      node: <HeatmapCard className="w-full max-w-[30rem]" points={HEAT_POINTS} defaultRange={[18, 22]} title="Evening orders" />,
    },
  ],
  'coverage-map': [
    {
      label: 'Fewer sites',
      node: <CoverageMap className="w-full max-w-[34rem]" cells={COVERAGE_CELLS.slice(0, 5)} title="Core network" />,
    },
  ],
  'trip-replay': [
    {
      label: 'Playing from the start',
      node: <TripReplay className="w-full max-w-[32rem]" {...REPLAY} />,
    },
  ],
  'trip-summary-card': [
    {
      label: 'A ride',
      node: <TripSummaryCard {...TRIP} title="Presidio ride" activity="ride" durationMin={24} routeColor="#2e2e2e" />,
    },
  ],
  'itinerary-map': [
    {
      label: 'A one-day trip',
      node: <ItineraryMap className="w-full max-w-[56rem]" days={ITINERARY.slice(1, 2)} />,
    },
  ],
  'property-map-card': [
    {
      label: 'A wider neighbourhood',
      node: <PropertyMapCard className="w-[28rem] max-w-[calc(100vw-5rem)]" listings={LISTINGS} defaultSelectedId="l3" radiusKm={1.2} />,
    },
  ],
  'commute-calculator': [
    {
      label: 'Living outside the bands',
      node: (
        <CommuteCalculator className="w-full max-w-[30rem]" work={{ label: 'Union Square', position: [-122.4074, 37.7879] }} isochrones={ISOCHRONES.slice(1)} defaultHome={[-122.4783, 37.7301]} search={searchAddresses} modeLabel="By car" />
      ),
    },
  ],
  'weather-alert-map': [
    {
      label: 'Warnings only',
      node: <WeatherAlertMap className="w-full max-w-[56rem]" alerts={WEATHER_ALERTS.filter((alert) => alert.severity === 'warning')} />,
    },
  ],
};
