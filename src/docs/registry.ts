import type { ApiRow, ApiSection } from './md';
import { FLEET_COMPONENTS } from './registry-fleet';


export type ComponentEntry = {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  status: 'ready' | 'new';
  /** Path inside src/, used for the source link and the copy instruction. */
  file: string;
  /** shadcn/ui primitives the file imports. */
  primitives: string[];
  /** npm packages the file imports. */
  deps: string[];
  wide?: boolean;
  usage: string;
  anatomy: string;
  examples: { label: string; code: string }[];
  api: ApiSection[];
};


const row = (prop: string, type: string, description: string, def?: string): ApiRow => ({ prop, type, description, ...(def ? { default: def } : {}) });
/** The three props every map component shares. */
const common = (accent: string): ApiRow[] => [
  row('accentColor', 'string', `Colour of ${accent}. Map layers cannot read CSS variables, so pass a value.`, "'#ec4899'"),
  row('mapStyle', 'string | StyleSpecification', 'Any MapLibre style URL or object.', 'OpenFreeMap positron'),
  row('className', 'string', 'Merged onto the card.'),
];
const maps = ['maplibre-gl', 'lucide-react'];

export const COMPONENTS: ComponentEntry[] = [
  {
    id: 'delivery-tracker-card',
    name: 'DeliveryTrackerCard',
    category: 'Tracking and delivery',
    tagline: 'Where the order is, who has it, and when it arrives.',
    description:
      'A live map with the store, the driver and the destination; the route split into what has been travelled and what is left; an ETA; a step bar; and the driver with message and call actions.',
    status: 'new',
    file: 'components/maps/delivery-tracker-card.tsx',
    primitives: ['card', 'button'],
    deps: ['maplibre-gl', 'lucide-react'],
    usage: `<DeliveryTrackerCard
  orderId="#48213"
  origin={{ label: 'Bi-Rite Market', position: [-122.4241, 37.7615] }}
  destination={{ label: '412 Hayes St', position: [-122.434, 37.7758] }}
  driver={{ name: 'Marcus Lee', vehicle: 'White Toyota Prius', rating: 4.9, position: driverPosition }}
  route={route}
  steps={steps}
  currentStepId="on-the-way"
  etaMinutes={6}
  onCall={() => call(driver)}
  onMessage={() => message(driver)}
/>`,
    anatomy: `import { DeliveryTrackerCard } from '@/components/maps/delivery-tracker-card';

// route is [longitude, latitude][] from any routing API (OSRM, Mapbox, Google).
// When driver.position changes, the marker moves and the route re-splits into
// travelled (grey) and remaining (dark) — push a new position, nothing else.
<DeliveryTrackerCard route={route} driver={{ ...driver, position }} ... />`,
    examples: [
      {
        label: 'Just left the store',
        code: `<DeliveryTrackerCard
  {...order}
  driver={{ ...driver, position: route[3] }}
  currentStepId="picked-up"
  etaMinutes={9}
/>`,
      },
      {
        label: 'Arriving now',
        code: `<DeliveryTrackerCard
  {...order}
  driver={{ ...driver, position: route[route.length - 4] }}
  currentStepId="arriving"
  etaMinutes={1}
/>`,
      },
    ],
    api: [
      {
        title: 'DeliveryTrackerCard',
        description: 'A map card for one order in flight. The map itself is MapLibre GL; the rest is shadcn/ui.',
        rows: [
          { prop: 'orderId', type: 'string', description: 'Shown above the headline.' },
          { prop: 'origin', type: 'DeliveryStop', description: 'The store or warehouse: a label and a position.' },
          { prop: 'destination', type: 'DeliveryStop', description: 'Where the order is going. Its label is shown under the headline.' },
          { prop: 'driver', type: 'DeliveryDriver', description: 'Name, vehicle, optional plate and rating, and the live position.' },
          { prop: 'route', type: 'LngLat[]', description: 'The full planned route, origin to destination, as [longitude, latitude] pairs.' },
          { prop: 'steps', type: 'DeliveryStep[]', description: 'The stages of the journey, in order. Each is an id and a label.' },
          { prop: 'currentStepId', type: 'string', description: 'The active step; earlier steps render as done.' },
          { prop: 'etaMinutes', type: 'number', description: 'Minutes remaining, shown in the pill on the map.' },
          { prop: 'onCall', type: '() => void', description: 'Called when the call button is pressed.' },
          { prop: 'onMessage', type: '() => void', description: 'Called when the message button is pressed.' },
          { prop: 'routeColor', type: 'string', default: "'#2e2e2e'", description: 'Colour of the route line. Map layers cannot read CSS variables, so pass a value.' },
          { prop: 'accentColor', type: 'string', default: "'#ec4899'", description: 'Colour of the driver marker, the active step and the ETA icon.' },
          { prop: 'mapStyle', type: 'string | StyleSpecification', default: 'OpenFreeMap positron', description: 'Any MapLibre style URL or object. The default needs no API key.' },
          { prop: 'interactive', type: 'boolean', default: 'false', description: 'Allow panning and zooming. Off by default so the card behaves like a card.' },
          { prop: 'className', type: 'string', description: 'Merged onto the card.' },
        ],
      },
      {
        title: 'Types',
        description: 'The shapes this component reads.',
        rows: [
          { prop: 'LngLat', type: '[number, number]', description: '[longitude, latitude]. Longitude first, as in GeoJSON.' },
          { prop: 'DeliveryStop', type: '{ label; position }', description: 'A named place on the map.' },
          { prop: 'DeliveryDriver', type: '{ name; vehicle; plate?; rating?; position }', description: 'The person carrying the order, and where they are right now.' },
          { prop: 'DeliveryStep', type: '{ id; label }', description: 'One stage of the journey.' },
        ],
      },
    ],
  },
  {
    id: 'store-locator',
    name: 'StoreLocator',
    category: 'Store and place discovery',
    tagline: 'Find the nearest one, on a map and in a list that agree with each other.',
    description:
      'A searchable, filterable list of places beside a map. Filter chips and search narrow both at once, the list sorts nearest first, and selecting a row or a pin highlights the other and opens a card with directions.',
    status: 'new',
    file: 'components/maps/store-locator.tsx',
    primitives: ['card', 'button', 'badge', 'input'],
    deps: ['maplibre-gl', 'lucide-react'],
    wide: true,
    usage: `<StoreLocator
  stores={stores}
  userPosition={[-122.4213, 37.7638]}
  onSelect={(store) => track('store_selected', store.id)}
  onDirections={(store) => openDirections(store.position)}
/>`,
    anatomy: `import { StoreLocator, type Store } from '@/components/maps/store-locator';

// Store: id, name, address, category, position, rating?, openNow?, hours?
// Categories become filter chips automatically, next to "All" and "Open now".
// With userPosition the list shows distances and sorts nearest first.
<StoreLocator stores={stores} userPosition={position} />`,
    examples: [
      {
        label: 'A store already selected',
        code: `<StoreLocator stores={stores} userPosition={position} selectedId="s3" />`,
      },
      {
        label: 'Without the visitor’s position',
        code: `<StoreLocator stores={stores} />`,
      },
    ],
    api: [
      {
        title: 'StoreLocator',
        description: 'A list and a map over the same stores. Below 42rem wide it stacks the list above the map.',
        rows: [
          { prop: 'stores', type: 'Store[]', description: 'The places to show. Their categories become filter chips.' },
          { prop: 'userPosition', type: 'LngLat', description: 'Where the visitor is. Adds a dot on the map and distances, and sorts nearest first.' },
          { prop: 'selectedId', type: 'string | null', description: 'Controls the selection. Leave it out and the component keeps its own.' },
          { prop: 'onSelect', type: '(store: Store) => void', description: 'Called when a row or a pin is selected.' },
          { prop: 'onDirections', type: '(store: Store) => void', description: 'Called when Directions is pressed on the selected store.' },
          { prop: 'accentColor', type: 'string', default: "'#ec4899'", description: 'Colour of the selected pin and row.' },
          { prop: 'mapStyle', type: 'string | StyleSpecification', default: 'OpenFreeMap positron', description: 'Any MapLibre style URL or object.' },
          { prop: 'className', type: 'string', description: 'Merged onto the card.' },
        ],
      },
      {
        title: 'Store',
        description: 'The shape of one place.',
        rows: [
          { prop: 'id', type: 'string', description: 'Stable identifier.' },
          { prop: 'name', type: 'string', description: 'Shown in bold in the list and on the selected card.' },
          { prop: 'address', type: 'string', description: 'Street address.' },
          { prop: 'category', type: 'string', description: 'Groups the place and creates a filter chip.' },
          { prop: 'position', type: 'LngLat', description: '[longitude, latitude].' },
          { prop: 'rating', type: 'number', description: 'Optional, shown on the selected card.' },
          { prop: 'openNow', type: 'boolean', description: 'Optional. Powers the "Open now" chip and the Open/Closed label.' },
          { prop: 'hours', type: 'string', description: 'Optional free text, e.g. "Closes 8 pm".' },
        ],
      },
    ],
  },
  {
    id: 'address-picker',
    name: 'AddressPicker',
    category: 'Location pickers and forms',
    tagline: 'Search for an address or drop a pin, then confirm.',
    description:
      'A search box with suggestions above a map with a draggable pin. Searching moves the pin, and dragging it or clicking the map looks up the new address. The map is a form control here, so the geocoding is yours: pass any provider.',
    status: 'new',
    file: 'components/maps/address-picker.tsx',
    primitives: ['card', 'button', 'input'],
    deps: ['maplibre-gl', 'lucide-react'],
    usage: `<AddressPicker
  defaultValue={{ position: [-122.421, 37.7604], address: '800 Valencia Street' }}
  search={(query) => geocoder.search(query)}
  reverseGeocode={(position) => geocoder.reverse(position)}
  onConfirm={(location) => saveAddress(location)}
/>`,
    anatomy: `import { AddressPicker } from '@/components/maps/address-picker';

// search:         (query) => Promise<{ id, label, secondary?, position }[]>
// reverseGeocode: (position) => Promise<string>  (optional; without it a moved pin has no address)
// Both are called for you: search is debounced by 200 ms and starts at two characters.
<AddressPicker defaultValue={value} search={search} reverseGeocode={reverse} />`,
    examples: [
      {
        label: 'Starting from a dropped pin',
        code: `<AddressPicker
  defaultValue={{ position: [-122.4265, 37.7545] }}
  search={search}
  reverseGeocode={reverse}
  confirmLabel="Deliver here"
/>`,
      },
    ],
    api: [
      {
        title: 'AddressPicker',
        description: 'A search-and-pin form control. It keeps its own value; use onChange and onConfirm to read it.',
        rows: [
          { prop: 'defaultValue', type: 'PickedLocation', description: 'The starting pin: a position and, optionally, an address.' },
          { prop: 'search', type: '(query: string) => Promise<PlaceSuggestion[]>', description: 'Your geocoder. Called after 200 ms of no typing, for two or more characters.' },
          { prop: 'reverseGeocode', type: '(position: LngLat) => Promise<string>', description: 'Turns a dragged or clicked position into an address. Optional.' },
          { prop: 'onChange', type: '(value: PickedLocation) => void', description: 'Fires whenever the pin moves: by search, drag, or click.' },
          { prop: 'onConfirm', type: '(value: PickedLocation) => void', description: 'Called when the confirm button is pressed.' },
          { prop: 'confirmLabel', type: 'string', default: "'Confirm location'", description: 'The confirm button text.' },
          { prop: 'accentColor', type: 'string', default: "'#ec4899'", description: 'Colour of the pin.' },
          { prop: 'mapStyle', type: 'string | StyleSpecification', default: 'OpenFreeMap positron', description: 'Any MapLibre style URL or object.' },
          { prop: 'className', type: 'string', description: 'Merged onto the card.' },
        ],
      },
      {
        title: 'Types',
        description: 'The shapes this component reads and returns.',
        rows: [
          { prop: 'PlaceSuggestion', type: '{ id; label; secondary?; position }', description: 'One search result.' },
          { prop: 'PickedLocation', type: '{ position; address? }', description: 'The pin and, once known, its address.' },
        ],
      },
    ],
  },
  {
    id: 'fleet-overview',
    name: 'FleetOverview',
    category: 'Fleet and operations',
    tagline: 'Every vehicle on one map, with counts by status.',
    description:
      'A KPI strip, a status-filtered vehicle list, and a map with a heading-aware marker per vehicle. Moving vehicles are dark, idle ones outlined, delayed ones use the accent colour, and offline ones fade. Push new positions and the markers move.',
    status: 'new',
    file: 'components/maps/fleet-overview.tsx',
    primitives: ['card', 'badge'],
    deps: ['maplibre-gl', 'lucide-react'],
    wide: true,
    usage: `<FleetOverview
  vehicles={vehicles}
  onSelect={(vehicle) => openVehicle(vehicle.id)}
/>`,
    anatomy: `import { FleetOverview, type FleetVehicle } from '@/components/maps/fleet-overview';

// FleetVehicle: id, name, status, position, heading?, speedKph?, driver?, task?
// Update the array and the markers move; the map only refits when the filter changes.
socket.on('fleet:update', (next) => setVehicles(next));

<FleetOverview vehicles={vehicles} />`,
    examples: [
      {
        label: 'A quiet night',
        code: `<FleetOverview vehicles={vehicles.map((v) => ({ ...v, status: 'idle', speedKph: 0 }))} />`,
      },
    ],
    api: [
      {
        title: 'FleetOverview',
        description: 'A dashboard for a set of vehicles. Below 42rem wide it stacks the list above the map.',
        rows: [
          { prop: 'vehicles', type: 'FleetVehicle[]', description: 'The fleet. Counts, the list and the markers all derive from it.' },
          { prop: 'selectedId', type: 'string | null', description: 'Controls the selection. Leave it out and the component keeps its own.' },
          { prop: 'onSelect', type: '(vehicle: FleetVehicle) => void', description: 'Called when a row or a marker is selected.' },
          { prop: 'accentColor', type: 'string', default: "'#ec4899'", description: 'Colour of delayed vehicles and the selected marker.' },
          { prop: 'mapStyle', type: 'string | StyleSpecification', default: 'OpenFreeMap positron', description: 'Any MapLibre style URL or object.' },
          { prop: 'className', type: 'string', description: 'Merged onto the card.' },
        ],
      },
      {
        title: 'FleetVehicle',
        description: 'The shape of one vehicle.',
        rows: [
          { prop: 'id', type: 'string', description: 'Stable identifier.' },
          { prop: 'name', type: 'string', description: 'Shown in bold, e.g. "Van 12".' },
          { prop: 'status', type: "'moving' | 'idle' | 'delayed' | 'offline'", description: 'Drives the counts, the filter chips and the marker style.' },
          { prop: 'position', type: 'LngLat', description: 'Where the vehicle is right now.' },
          { prop: 'heading', type: 'number', description: 'Degrees clockwise from north. Rotates the marker.' },
          { prop: 'speedKph', type: 'number', description: 'Optional, shown in the list and on the selected card.' },
          { prop: 'driver', type: 'string', description: 'Optional.' },
          { prop: 'task', type: 'string', description: 'Optional, what the vehicle is doing, e.g. "3 stops left".' },
        ],
      },
    ],
  },
  {
    id: 'region-choropleth',
    name: 'RegionChoropleth',
    category: 'Data visualisation',
    tagline: 'Regions shaded by a number, and ranked beside the map.',
    description:
      'A map of regions coloured along a scale by one metric, with a legend and a ranked list. Hovering a region or a list row highlights both. You bring the boundaries (any GeoJSON) and the numbers; the map is a picture of the data, so panning and zooming are off.',
    status: 'new',
    file: 'components/maps/region-choropleth.tsx',
    primitives: ['card'],
    deps: ['maplibre-gl', 'lucide-react'],
    wide: true,
    usage: `<RegionChoropleth
  geojson={usStates}
  data={ordersByState}
  title="Top states"
  metricLabel="Same-day orders per 10,000 residents"
/>`,
    anatomy: `import { RegionChoropleth, type RegionDatum } from '@/components/maps/region-choropleth';

// geojson: a FeatureCollection of Polygons or MultiPolygons.
// Each feature needs a property named featureKey (default "name"); data ids match it.
// data: { id: 'California', value: 128 }[]
<RegionChoropleth geojson={geojson} data={data} title="Top states" />`,
    examples: [
      {
        label: 'A custom colour scale',
        code: `<RegionChoropleth
  geojson={usStates}
  data={ordersByState}
  title="Top states"
  colors={['#f3f3f3', '#a3a3a3', '#2e2e2e']}
  topN={5}
/>`,
      },
    ],
    api: [
      {
        title: 'RegionChoropleth',
        description: 'A map, a legend and a ranked list over one metric. Regions with no matching datum are drawn in grey.',
        rows: [
          { prop: 'geojson', type: 'FeatureCollection<Polygon | MultiPolygon>', description: 'The region boundaries.' },
          { prop: 'data', type: 'RegionDatum[]', description: 'One { id, value } per region. The id matches the feature property named featureKey.' },
          { prop: 'title', type: 'string', description: 'Heading of the ranked list.' },
          { prop: 'metricLabel', type: 'string', description: 'What the number means, shown under the title.' },
          { prop: 'formatValue', type: '(value: number) => string', default: 'toLocaleString', description: 'Formats values in the legend, the list and the hover label.' },
          { prop: 'featureKey', type: 'string', default: "'name'", description: 'The feature property that identifies a region.' },
          { prop: 'colors', type: 'string[]', default: 'pink scale', description: 'Two or more hex colours, lowest value first. Values are interpolated along them.' },
          { prop: 'topN', type: 'number', default: '8', description: 'How many regions the ranked list shows.' },
          { prop: 'onSelect', type: '(region: RegionDatum) => void', description: 'Called when a region or a list row is clicked.' },
          { prop: 'mapStyle', type: 'string | StyleSpecification', default: 'OpenFreeMap positron', description: 'Any MapLibre style URL or object.' },
          { prop: 'className', type: 'string', description: 'Merged onto the card.' },
        ],
      },
    ],
  },
  {
    id: 'trip-summary-card',
    name: 'TripSummaryCard',
    category: 'Travel and real estate',
    tagline: 'A finished trip: the route, the numbers, and the climb.',
    description:
      'A compact card for a recorded run, walk or ride: the route drawn on a map, distance, time, pace or speed, elevation gain, and an elevation profile. It fits list rows and feeds.',
    status: 'new',
    file: 'components/maps/trip-summary-card.tsx',
    primitives: ['card'],
    deps: ['maplibre-gl', 'lucide-react'],
    usage: `<TripSummaryCard
  title="Presidio loop"
  activity="run"
  date="Sat, 27 Sep · 8:12 am"
  athlete="Marcus Lee"
  route={route}
  elevation={elevation}
  distanceKm={7.8}
  durationMin={46}
  elevationGainM={73}
/>`,
    anatomy: `import { TripSummaryCard } from '@/components/maps/trip-summary-card';

// route:     [longitude, latitude][] recorded or planned
// elevation: metres, evenly spaced along the route (any number of samples)
// Pace (min/km) is shown for run and walk, speed (km/h) for ride.
<TripSummaryCard route={route} elevation={elevation} ... />`,
    examples: [
      {
        label: 'A ride',
        code: `<TripSummaryCard {...trip} title="Presidio ride" activity="ride" durationMin={24} routeColor="#2e2e2e" />`,
      },
    ],
    api: [
      {
        title: 'TripSummaryCard',
        description: 'A read-only summary of one trip.',
        rows: [
          { prop: 'title', type: 'string', description: 'The trip name.' },
          { prop: 'activity', type: "'run' | 'walk' | 'ride'", default: "'walk'", description: 'Picks the icon, and pace versus speed.' },
          { prop: 'date', type: 'string', description: 'Free text, shown under the title.' },
          { prop: 'athlete', type: 'string', description: 'Optional, shown after the date.' },
          { prop: 'route', type: 'LngLat[]', description: 'The trip as [longitude, latitude] pairs. A loop is detected and shows one start/finish dot.' },
          { prop: 'elevation', type: 'number[]', description: 'Metres above sea level, evenly spaced along the route.' },
          { prop: 'distanceKm', type: 'number', description: 'Total distance.' },
          { prop: 'durationMin', type: 'number', description: 'Total moving time in minutes.' },
          { prop: 'elevationGainM', type: 'number', description: 'Total climb in metres.' },
          { prop: 'routeColor', type: 'string', default: "'#ec4899'", description: 'Colour of the route line and the profile. Map layers cannot read CSS variables.' },
          { prop: 'mapStyle', type: 'string | StyleSpecification', default: 'OpenFreeMap positron', description: 'Any MapLibre style URL or object.' },
          { prop: 'className', type: 'string', description: 'Merged onto the card.' },
        ],
      },
    ],
  },

  /* ---------- Tracking and delivery ---------- */
  {
    id: 'order-route-mini',
    name: 'OrderRouteMini',
    category: 'Tracking and delivery',
    tagline: 'One order as a list row, with its route on a thumbnail.',
    description:
      'A compact row for order lists: a small map with the route drawn on it, where the order is going, a status badge and a line of detail. Each thumbnail only builds its map when it is near the screen, so a long list stays light.',
    status: 'new',
    file: 'components/maps/order-route-mini.tsx',
    primitives: ['badge'],
    deps: maps,
    usage: `<OrderRouteMini
  title="Order #48213"
  from="Guerrero Market"
  to="412 Hayes St"
  route={route}
  position={driverPosition}
  status="on-the-way"
  detail="Arrives 2:40 pm"
  onClick={() => openOrder('48213')}
/>`,
    anatomy: `import { OrderRouteMini } from '@/components/maps/order-route-mini';

// status: 'preparing' | 'on-the-way' | 'delivered' | 'delayed'
// Render one per order; the thumbnail map is created lazily as each row scrolls into view.
{orders.map((order) => <OrderRouteMini key={order.id} {...order} />)}`,
    examples: [{ label: 'A single order', code: `<OrderRouteMini title="Order #48213" from="Guerrero Market" to="412 Hayes St" route={route} status="preparing" detail="Ready at 2:10 pm" />` }],
    api: [
      {
        title: 'OrderRouteMini',
        description: 'A button-shaped row. It fills the width of its container.',
        rows: [
          row('title', 'string', 'The order name.'),
          row('from', 'string', 'Where it starts.'),
          row('to', 'string', 'Where it is going.'),
          row('route', 'LngLat[]', 'The route, origin to destination. Drawn on the thumbnail.'),
          row('position', 'LngLat', 'Where the order is now. Adds a dot on the thumbnail.'),
          row('status', "'preparing' | 'on-the-way' | 'delivered' | 'delayed'", 'Drives the badge. Delayed uses the accent colour.'),
          row('detail', 'string', 'Free text next to the badge, e.g. "Arrives 2:40 pm".'),
          row('onClick', '() => void', 'Called when the row is pressed.'),
          row('routeColor', 'string', 'Colour of the route line.', "'#2e2e2e'"),
          ...common('the position dot and the delayed badge'),
        ],
      },
    ],
  },
  {
    id: 'driver-arriving-sheet',
    name: 'DriverArrivingSheet',
    category: 'Tracking and delivery',
    tagline: 'The ride-share moment: the car closing in, and who is in it.',
    description:
      'A map with the driver approaching your pickup, and a bottom sheet with the ETA, a PIN to read out, the driver, the car and its plate, and message, call and cancel actions.',
    status: 'new',
    file: 'components/maps/driver-arriving-sheet.tsx',
    primitives: ['card', 'button'],
    deps: maps,
    usage: `<DriverArrivingSheet
  pickup={{ label: 'Your pickup', position: pickupPosition }}
  driver={{ name: 'Marcus Lee', vehicle: 'White Toyota Prius', plate: '8KTR204', rating: 4.92, position: driverPosition }}
  route={routeToPickup}
  etaMinutes={3}
  pin="4821"
  onCall={() => call(driver)}
  onCancel={() => cancelRide()}
/>`,
    anatomy: `import { DriverArrivingSheet } from '@/components/maps/driver-arriving-sheet';

// route is the path from the driver to the pickup point, [longitude, latitude][].
// Update driver.position and route as the car moves; at etaMinutes <= 1 the sheet says "Now".
<DriverArrivingSheet pickup={pickup} driver={driver} route={route} etaMinutes={eta} />`,
    examples: [{ label: 'The driver is here', code: `<DriverArrivingSheet pickup={pickup} driver={{ ...driver, position: route[0] }} route={route.slice(0, 2)} etaMinutes={1} />` }],
    api: [
      {
        title: 'DriverArrivingSheet',
        description: 'A map above a sheet. The sheet overlaps the map with a rounded top edge.',
        rows: [
          row('pickup', '{ label; position }', 'Where the rider is waiting. Shown as a labelled pin.'),
          row('driver', 'ArrivingDriver', 'name, vehicle, plate, rating? and the live position.'),
          row('route', 'LngLat[]', 'The path from the driver to the pickup.'),
          row('etaMinutes', 'number', 'Minutes until arrival. One or less reads "Now".'),
          row('pin', 'string', 'A code the rider reads out so the driver knows it is them.'),
          row('onCall', '() => void', 'Called when Call is pressed.'),
          row('onMessage', '() => void', 'Called when Message is pressed.'),
          row('onCancel', '() => void', 'Called when Cancel is pressed.'),
          row('routeColor', 'string', 'Colour of the approach line.', "'#2e2e2e'"),
          ...common('the driver marker'),
        ],
      },
    ],
  },
  {
    id: 'shipment-journey',
    name: 'ShipmentJourney',
    category: 'Tracking and delivery',
    tagline: 'A shipment across trucks, ships and planes, leg by leg.',
    description:
      'Every leg of a multi-mode shipment on one map, drawn as arcs (dashed when upcoming, solid when done, accented when active) with a vehicle marker riding the active leg, and a timeline of legs below. Select a leg to zoom to it.',
    status: 'new',
    file: 'components/maps/shipment-journey.tsx',
    primitives: ['card', 'badge'],
    deps: maps,
    usage: `<ShipmentJourney
  title="Order #77120 · 240 units"
  reference="MSKU 4471903"
  legs={[
    { id: 'a', mode: 'truck', from: { label: 'Shenzhen factory', position: [114.06, 22.54] }, to: { label: 'Yantian port', position: [114.28, 22.57] }, status: 'done' },
    { id: 'b', mode: 'sea', from: { label: 'Yantian port', position: [114.28, 22.57] }, to: { label: 'Long Beach', position: [-118.19, 33.77] }, status: 'active', progress: 0.72 },
    { id: 'c', mode: 'truck', from: { label: 'Long Beach', position: [-118.19, 33.77] }, to: { label: 'Phoenix DC', position: [-112.07, 33.45] }, status: 'upcoming' },
  ]}
/>`,
    anatomy: `import { ShipmentJourney, type ShipmentLeg } from '@/components/maps/shipment-journey';

// Legs are contiguous: each leg starts where the one before it ends.
// Legs that cross the Pacific are drawn the short way round, not across the whole map.
// mode: 'air' | 'sea' | 'truck' | 'rail'   status: 'done' | 'active' | 'upcoming'
<ShipmentJourney title={title} legs={legs} />`,
    examples: [{ label: 'Air and rail', code: `<ShipmentJourney title="Order #77188 · 12 pallets" reference="AWB 020-44819302" legs={airAndRailLegs} />` }],
    api: [
      {
        title: 'ShipmentJourney',
        description: 'A map and a leg timeline. Selecting a leg zooms the map to it; selecting it again zooms back out.',
        rows: [
          row('title', 'string', 'The shipment name.'),
          row('reference', 'string', 'A tracking or booking number, shown in mono.'),
          row('legs', 'ShipmentLeg[]', 'In order and contiguous.'),
          ...common('the active leg and its vehicle'),
        ],
      },
      {
        title: 'ShipmentLeg',
        description: 'One leg of the journey.',
        rows: [
          row('id', 'string', 'Stable identifier.'),
          row('mode', "'air' | 'sea' | 'truck' | 'rail'", 'Picks the icon and how far the arc bows.'),
          row('from', '{ label; position }', 'Where the leg starts.'),
          row('to', '{ label; position }', 'Where the leg ends.'),
          row('status', "'done' | 'active' | 'upcoming'", 'Drives the line style and the timeline marker.'),
          row('carrier', 'string', 'Optional.'),
          row('when', 'string', 'Optional free text, e.g. "Arrives 3 Oct".'),
          row('progress', 'number', 'How far along an active leg the shipment is, 0 to 1.'),
        ],
      },
    ],
  },
  {
    id: 'proof-of-delivery',
    name: 'ProofOfDelivery',
    category: 'Tracking and delivery',
    tagline: 'The record of a drop-off: photo, place, time, signature.',
    description:
      'A delivery confirmation: the drop-off photo, a small map with a pin where the driver confirmed it, the address, driver and note, a timestamp, and the recipient’s signature. Without a photo it shows a quiet placeholder.',
    status: 'new',
    file: 'components/maps/proof-of-delivery.tsx',
    primitives: ['card'],
    deps: maps,
    usage: `<ProofOfDelivery
  deliveredAt="Tue 29 Sep, 2:41 pm"
  recipient="Jordan Ellis"
  address="412 Hayes St, front door"
  position={[-122.434, 37.7758]}
  photoUrl={photo.url}
  photoCaption="Left at the front door"
  signaturePath={signature.path}
  driver="Marcus Lee"
  note="Ring the bell twice."
/>`,
    anatomy: `import { ProofOfDelivery } from '@/components/maps/proof-of-delivery';

// signaturePath is an SVG path drawn in a 200 x 64 box.
// Everything but deliveredAt, recipient, address and position is optional.
<ProofOfDelivery deliveredAt={at} recipient={name} address={address} position={position} />`,
    examples: [{ label: 'No photo, no signature', code: `<ProofOfDelivery deliveredAt="Tue 29 Sep, 2:41 pm" recipient="Jordan Ellis" address="412 Hayes St" position={position} />` }],
    api: [
      {
        title: 'ProofOfDelivery',
        description: 'A read-only delivery record.',
        rows: [
          row('deliveredAt', 'string', 'Free text, e.g. "Tue 29 Sep, 2:41 pm".'),
          row('recipient', 'string', 'Who received it, shown under the signature.'),
          row('address', 'string', 'Where it was left.'),
          row('position', 'LngLat', 'Where the driver was when they confirmed the drop-off.'),
          row('photoUrl', 'string', 'The drop-off photo. If it fails to load, a placeholder is shown.'),
          row('photoCaption', 'string', 'Shown over the photo.'),
          row('signaturePath', 'string', 'An SVG path in a 200 × 64 box.'),
          row('driver', 'string', 'Optional.'),
          row('note', 'string', 'Optional delivery note.'),
          ...common('the check mark and the map pin'),
        ],
      },
    ],
  },

  /* ---------- Store and place discovery ---------- */
  {
    id: 'place-card',
    name: 'PlaceCard',
    category: 'Store and place discovery',
    tagline: 'One place: how good it is, how far it is, how to get there.',
    description:
      'A card for a single place: a photo (or a map when there is none), an open or closed badge, rating and price level, distance and walking time from the visitor, and an Open in maps button.',
    status: 'new',
    file: 'components/maps/place-card.tsx',
    primitives: ['card', 'button', 'badge'],
    deps: maps,
    usage: `<PlaceCard
  place={{
    name: 'Dolores Pastry',
    category: 'Bakery · Pastries',
    address: '3500 19th St, San Francisco',
    position: [-122.4245, 37.7604],
    rating: 4.9,
    reviewCount: 1284,
    priceLevel: 2,
    openNow: true,
    hours: 'Closes 5 pm',
  }}
  userPosition={[-122.4213, 37.7638]}
/>`,
    anatomy: `import { PlaceCard, type Place } from '@/components/maps/place-card';

// With userPosition you get distance and walking time; without it those are hidden.
// Open in maps opens OpenStreetMap by default; pass onOpenInMaps to route it yourself.
<PlaceCard place={place} userPosition={position} />`,
    examples: [{ label: 'With a photo', code: `<PlaceCard place={{ ...place, photoUrl: '/photos/dolores.jpg' }} userPosition={position} />` }],
    api: [
      {
        title: 'PlaceCard',
        description: 'A single place.',
        rows: [
          row('place', 'Place', 'name, category, address, position, and optionally rating, reviewCount, priceLevel (1 to 4), openNow, hours and photoUrl.'),
          row('userPosition', 'LngLat', 'Adds the distance and the walking time.'),
          row('onOpenInMaps', '(place: Place) => void', 'Overrides the default link to OpenStreetMap.'),
          ...common('the rating star and the map pin'),
        ],
      },
    ],
  },
  {
    id: 'nearby-list',
    name: 'NearbyList',
    category: 'Store and place discovery',
    tagline: 'What is close, nearest first, with the walk.',
    description:
      'Places sorted by how far they are from a point, each with its distance, a walking-time chip and an open or closed marker. There is no map: it is the list on its own, for a sheet, a sidebar or a search result.',
    status: 'new',
    file: 'components/maps/nearby-list.tsx',
    primitives: [],
    deps: maps,
    usage: `<NearbyList
  places={places}
  origin={[-122.4213, 37.7638]}
  limit={6}
  onSelect={(place) => openPlace(place.id)}
/>`,
    anatomy: `import { NearbyList } from '@/components/maps/nearby-list';

// Distances are straight-line (haversine); walking time assumes 5 km/h.
// Pair it with any map, or use it alone.
<NearbyList places={places} origin={position} limit={5} />`,
    examples: [{ label: 'The three nearest', code: `<NearbyList places={places} origin={position} limit={3} />` }],
    api: [
      {
        title: 'NearbyList',
        description: 'A list of places ordered by distance.',
        rows: [
          row('places', 'NearbyPlace[]', 'id, name, category, position, and optionally openNow and hours.'),
          row('origin', 'LngLat', 'Where distances are measured from.'),
          row('selectedId', 'string | null', 'Highlights a row.'),
          row('onSelect', '(place: NearbyPlace) => void', 'Called when a row is pressed.'),
          row('limit', 'number', 'Show only the nearest N.'),
          row('accentColor', 'string', 'Colour of the selected row edge.', "'#ec4899'"),
          row('className', 'string', 'Merged onto the list.'),
        ],
      },
    ],
  },
  {
    id: 'branch-directory',
    name: 'BranchDirectory',
    category: 'Store and place discovery',
    tagline: 'Offices grouped by region, with the map and the contact details.',
    description:
      'A directory of branches under region headings beside a map. Selecting a branch flies the map to it and opens its hours, a call button and an email button.',
    status: 'new',
    file: 'components/maps/branch-directory.tsx',
    primitives: ['card', 'button'],
    deps: maps,
    wide: true,
    usage: `<BranchDirectory
  branches={branches}
  defaultSelectedId="sf"
  onSelect={(branch) => track('branch_selected', branch.id)}
/>`,
    anatomy: `import { BranchDirectory, type Branch } from '@/components/maps/branch-directory';

// Branches are grouped by their region property, in the order regions first appear.
// Contact buttons are plain tel: and mailto: links.
<BranchDirectory branches={branches} />`,
    examples: [{ label: 'Nothing selected', code: `<BranchDirectory branches={branches} />` }],
    api: [
      {
        title: 'BranchDirectory',
        description: 'Grouped list plus map. Below 42rem wide it stacks the list above the map.',
        rows: [
          row('branches', 'Branch[]', 'id, name, region, address, position, and optionally phone, email and hours.'),
          row('defaultSelectedId', 'string', 'The branch selected at the start.'),
          row('onSelect', '(branch: Branch) => void', 'Called when a branch is selected.'),
          ...common('the selected pin and row'),
        ],
      },
    ],
  },
  {
    id: 'event-venue-card',
    name: 'EventVenueCard',
    category: 'Store and place discovery',
    tagline: 'When and where, and where to park.',
    description:
      'An event card: a date badge, the title, time and venue, a map with the venue and each parking option, and the parking listed nearest first with price, note and the walk to the door.',
    status: 'new',
    file: 'components/maps/event-venue-card.tsx',
    primitives: ['card'],
    deps: maps,
    usage: `<EventVenueCard
  title="Neon Harbor Live"
  month="OCT"
  day={14}
  time="Doors 7 pm · Show 8 pm"
  venue="Harbor Hall"
  address="1805 Geary Blvd"
  position={venuePosition}
  parking={parking}
/>`,
    anatomy: `import { EventVenueCard, type ParkingOption } from '@/components/maps/event-venue-card';

// ParkingOption: id, name, position, price?, note?
// Distances and walking times are measured from the venue.
<EventVenueCard title={title} month="OCT" day={14} time={time} venue={venue} address={address} position={position} parking={parking} />`,
    examples: [{ label: 'Street parking only', code: `<EventVenueCard title="Sunday Flea" month="NOV" day={3} time="10 am to 4 pm" venue="Harbor Hall lot" address="1805 Geary Blvd" position={position} parking={[streetParking]} />` }],
    api: [
      {
        title: 'EventVenueCard',
        description: 'An event, its venue and its nearby parking.',
        rows: [
          row('title', 'string', 'The event name.'),
          row('month', 'string', 'Three letters, e.g. "OCT".'),
          row('day', 'string | number', 'Day of the month.'),
          row('time', 'string', 'Free text, e.g. "Doors 7 pm · Show 8 pm".'),
          row('venue', 'string', 'The venue name.'),
          row('address', 'string', 'The venue address.'),
          row('position', 'LngLat', 'Where the venue is.'),
          row('parking', 'ParkingOption[]', 'Nearby parking. Listed nearest first.'),
          ...common('the venue pin and the month'),
        ],
      },
    ],
  },

  /* ---------- Location pickers and forms ---------- */
  {
    id: 'service-area-checker',
    name: 'ServiceAreaChecker',
    category: 'Location pickers and forms',
    tagline: 'Do we deliver to you? Type an address, get a yes or a no.',
    description:
      'A search box above a map with your service zones drawn on it and a draggable pin. The pin turns to the accent colour inside a zone, and a status line answers with the zone’s ETA and fee, or says how far the nearest zone edge is.',
    status: 'new',
    file: 'components/maps/service-area-checker.tsx',
    primitives: ['card', 'button', 'input'],
    deps: maps,
    usage: `<ServiceAreaChecker
  zones={zones}
  defaultPosition={[-122.4213, 37.7638]}
  search={(query) => geocoder.search(query)}
  onCheck={(position, zone) => track('area_checked', zone?.id ?? 'outside')}
  onNotify={(position) => joinWaitlist(position)}
/>`,
    anatomy: `import { ServiceAreaChecker, type ServiceZone } from '@/components/maps/service-area-checker';

// ServiceZone: id, name, ring (outer ring, [longitude, latitude][]), fee?, eta?
// Zones are checked in order, so list the smallest first when they nest.
<ServiceAreaChecker zones={zones} defaultPosition={position} search={search} />`,
    examples: [{ label: 'Outside every zone', code: `<ServiceAreaChecker zones={zones} defaultPosition={[-122.4783, 37.7301]} search={search} onNotify={joinWaitlist} />` }],
    api: [
      {
        title: 'ServiceAreaChecker',
        description: 'A search-and-pin check against a set of zones.',
        rows: [
          row('zones', 'ServiceZone[]', 'The areas you serve. The first one containing the pin wins.'),
          row('defaultPosition', 'LngLat', 'Where the pin starts.'),
          row('search', '(query: string) => Promise<ServicePlace[]>', 'Your geocoder. Called after 200 ms of no typing, for two or more characters.'),
          row('onCheck', '(position: LngLat, zone: ServiceZone | null) => void', 'Fires each time the pin lands, with the zone it is in.'),
          row('onNotify', '(position: LngLat) => void', 'When set, a Notify me button appears if the pin is outside every zone.'),
          ...common('the zone outline and an inside pin'),
        ],
      },
    ],
  },
  {
    id: 'pickup-point-selector',
    name: 'PickupPointSelector',
    category: 'Location pickers and forms',
    tagline: 'Choose where to collect: lockers, stores, post offices.',
    description:
      'A map and a radio list of collection points, nearest first, with the type, hours, distance and walking time. Full points cannot be chosen. Filter by type, pick one, and confirm.',
    status: 'new',
    file: 'components/maps/pickup-point-selector.tsx',
    primitives: ['card', 'button', 'badge'],
    deps: maps,
    usage: `<PickupPointSelector
  points={points}
  userPosition={[-122.4213, 37.7638]}
  defaultSelectedId="p2"
  onConfirm={(point) => setPickupPoint(point)}
/>`,
    anatomy: `import { PickupPointSelector, type PickupPoint } from '@/components/maps/pickup-point-selector';

// PickupPoint: id, name, type ('locker' | 'store' | 'post-office'), address, position, hours?, available?
// available: false greys a point out and blocks selection.
<PickupPointSelector points={points} userPosition={position} />`,
    examples: [{ label: 'Nothing chosen yet', code: `<PickupPointSelector points={points} userPosition={position} />` }],
    api: [
      {
        title: 'PickupPointSelector',
        description: 'A map, a filterable radio list, and a confirm button.',
        rows: [
          row('points', 'PickupPoint[]', 'The places an order can be collected from.'),
          row('userPosition', 'LngLat', 'Adds distances and walking times, and sorts nearest first.'),
          row('defaultSelectedId', 'string', 'The point selected at the start.'),
          row('onSelect', '(point: PickupPoint) => void', 'Called when a point is chosen.'),
          row('onConfirm', '(point: PickupPoint) => void', 'Called when the confirm button is pressed.'),
          row('confirmLabel', 'string', 'Start of the confirm button text.', "'Pick up here'"),
          ...common('the selected pin and radio'),
        ],
      },
    ],
  },
  {
    id: 'location-badge',
    name: 'LocationBadge',
    category: 'Location pickers and forms',
    tagline: 'A city as a chip; hover it for a map.',
    description:
      'An inline chip for a place name. Hover, focus or tap it and a small popover opens with a map and the coordinates. The map is only created while the popover is open.',
    status: 'new',
    file: 'components/maps/location-badge.tsx',
    primitives: [],
    deps: maps,
    usage: `<LocationBadge
  city="San Francisco"
  region="California"
  country="US"
  flag="🇺🇸"
  position={[-122.4194, 37.7749]}
/>`,
    anatomy: `import { LocationBadge } from '@/components/maps/location-badge';

// Sits inline, so it can go in a sentence, a table cell or a profile header.
// Opens on hover, focus or tap; Escape closes it.
Shipping from <LocationBadge city="Lisbon" country="PT" position={position} />`,
    examples: [{ label: 'Closed until hovered', code: `<LocationBadge city="Lisbon" country="PT" flag="🇵🇹" position={[-9.1393, 38.7223]} />` }],
    api: [
      {
        title: 'LocationBadge',
        description: 'An inline chip with a map popover.',
        rows: [
          row('city', 'string', 'The place name shown on the chip.'),
          row('region', 'string', 'Optional, shown in the popover.'),
          row('country', 'string', 'Optional, shown muted after the city.'),
          row('position', 'LngLat', 'Where the place is.'),
          row('flag', 'string', 'An emoji flag or any short glyph. Without it, a pin icon is used.'),
          row('defaultOpen', 'boolean', 'Start with the popover showing.', 'false'),
          ...common('the pin'),
        ],
      },
    ],
  },
  {
    id: 'map-coordinates-input',
    name: 'MapCoordinatesInput',
    category: 'Location pickers and forms',
    tagline: 'Latitude and longitude fields that move a pin, and back.',
    description:
      'Two numeric fields and a mini map with a draggable pin, kept in step both ways. Typing a valid pair moves the pin; dragging or clicking fills the fields. Out-of-range values are flagged, and a button copies the pair.',
    status: 'new',
    file: 'components/maps/map-coordinates-input.tsx',
    primitives: ['card', 'button', 'input'],
    deps: maps,
    usage: `<MapCoordinatesInput
  defaultValue={[-122.4194, 37.7749]}
  onChange={([longitude, latitude]) => setLocation({ latitude, longitude })}
/>`,
    anatomy: `import { MapCoordinatesInput } from '@/components/maps/map-coordinates-input';

// Values are [longitude, latitude], like every position in these components.
// onChange fires only for valid pairs: latitude within ±90, longitude within ±180.
<MapCoordinatesInput defaultValue={position} onChange={setPosition} />`,
    examples: [{ label: 'A different place', code: `<MapCoordinatesInput defaultValue={[2.3522, 48.8566]} />` }],
    api: [
      {
        title: 'MapCoordinatesInput',
        description: 'A pair of fields and a pin that stay in step.',
        rows: [
          row('defaultValue', 'LngLat', 'The starting position.'),
          row('onChange', '(value: LngLat) => void', 'Fires when the position changes and is valid.'),
          ...common('the pin'),
        ],
      },
    ],
  },

  /* ---------- Fleet and operations ---------- */
  {
    id: 'vehicle-detail-panel',
    name: 'VehicleDetailPanel',
    category: 'Fleet and operations',
    tagline: 'One vehicle: speed, fuel, driver, and where it has been.',
    description:
      'The panel you open from a fleet map: a status badge, speed, a fuel gauge that turns to the accent colour when low, the odometer, the driver with a call button, today’s trail on a mini map, and the stops it has made.',
    status: 'new',
    file: 'components/maps/vehicle-detail-panel.tsx',
    primitives: ['card', 'badge', 'button'],
    deps: maps,
    usage: `<VehicleDetailPanel
  vehicle={{
    name: 'Van 12',
    plate: '8KTR204',
    status: 'moving',
    driver: { name: 'Priya Nair', phone: '+1 415 555 0118' },
    speedKph: 34,
    fuelPercent: 62,
    odometerKm: 48210,
    position: trail[trail.length - 1],
  }}
  trail={trail}
  stops={stops}
  onCall={() => call(driver)}
/>`,
    anatomy: `import { VehicleDetailPanel } from '@/components/maps/vehicle-detail-panel';

// trail is today's path so far, oldest first; the last point is the vehicle.
// Fuel under 20% is shown in the accent colour.
<VehicleDetailPanel vehicle={vehicle} trail={trail} stops={stops} />`,
    examples: [{ label: 'Low on fuel', code: `<VehicleDetailPanel vehicle={{ ...vehicle, status: 'delayed', fuelPercent: 12, speedKph: 6 }} trail={trail} />` }],
    api: [
      {
        title: 'VehicleDetailPanel',
        description: 'A read-only view of one vehicle.',
        rows: [
          row('vehicle', 'VehicleDetail', 'name, plate?, status, driver { name; phone? }, speedKph, fuelPercent (0 to 100), odometerKm? and position.'),
          row('trail', 'LngLat[]', 'Today’s path so far, oldest first.'),
          row('stops', 'VehicleStop[]', 'Optional stops made today: label, time and dwell?.'),
          row('onCall', '() => void', 'Called when the call button is pressed.'),
          ...common('the trail, the vehicle dot, low fuel and a delayed badge'),
        ],
      },
    ],
  },
  {
    id: 'dispatch-board',
    name: 'DispatchBoard',
    category: 'Fleet and operations',
    tagline: 'Drag a job onto a driver. Or tap it, on a phone.',
    description:
      'Unassigned jobs on one side, drivers below them, and a map of both. Drag a job onto a driver to assign it, or tap a job and then tap Assign, which is what touchscreens use. Assigned jobs appear as removable chips and as dashed lines on the map.',
    status: 'new',
    file: 'components/maps/dispatch-board.tsx',
    primitives: ['card', 'button'],
    deps: maps,
    wide: true,
    usage: `<DispatchBoard
  jobs={jobs}
  drivers={drivers}
  defaultAssignments={{ j1: 'd2' }}
  onAssign={(job, driver) => api.assign(job.id, driver.id)}
  onUnassign={(job, driver) => api.unassign(job.id, driver.id)}
/>`,
    anatomy: `import { DispatchBoard, type DispatchJob, type DispatchDriver } from '@/components/maps/dispatch-board';

// assignments is a map of job id to driver id, and the board keeps it for you.
// Dragging uses the browser's own drag and drop; tap-to-assign covers touch.
<DispatchBoard jobs={jobs} drivers={drivers} onAssign={assign} />`,
    examples: [{ label: 'Nothing assigned yet', code: `<DispatchBoard jobs={jobs} drivers={drivers} />` }],
    api: [
      {
        title: 'DispatchBoard',
        description: 'Jobs, drivers and a map. Below 42rem wide it stacks them.',
        rows: [
          row('jobs', 'DispatchJob[]', 'id, title, address, position, and optionally window.'),
          row('drivers', 'DispatchDriver[]', 'id, name, vehicle? and position.'),
          row('defaultAssignments', 'Record<string, string>', 'Job id to driver id, at the start.', '{}'),
          row('onAssign', '(job, driver) => void', 'Called when a job is assigned by drag or by tap.'),
          row('onUnassign', '(job, driver) => void', 'Called when an assignment is removed.'),
          ...common('the selected job and the drop target'),
        ],
      },
    ],
  },
  {
    id: 'route-optimizer-result',
    name: 'RouteOptimizerResult',
    category: 'Fleet and operations',
    tagline: 'The route as booked against the route after optimising.',
    description:
      'Both routes on one map (as booked in grey and dashed, optimised in the accent colour), a Before, After or Both toggle that also renumbers the stops, and a table of distance and drive time with what was saved.',
    status: 'new',
    file: 'components/maps/route-optimizer-result.tsx',
    primitives: ['card', 'badge'],
    deps: maps,
    usage: `<RouteOptimizerResult
  stops={stops}
  before={{ route: bookedRoute, distanceKm: 29.0, durationMin: 53 }}
  after={{ route: optimisedRoute, distanceKm: 16.3, durationMin: 31 }}
/>`,
    anatomy: `import { RouteOptimizerResult, type OptimizerStop } from '@/components/maps/route-optimizer-result';

// OptimizerStop: label, position, beforeIndex, afterIndex (both zero-based).
// The two routes come from your routing service: one through the stops in booking order,
// one in the order its optimiser chose.
<RouteOptimizerResult stops={stops} before={before} after={after} />`,
    examples: [{ label: 'Showing only the new route', code: `<RouteOptimizerResult stops={stops} before={before} after={after} />` }],
    api: [
      {
        title: 'RouteOptimizerResult',
        description: 'A before-and-after comparison of one set of stops.',
        rows: [
          row('stops', 'OptimizerStop[]', 'label, position, beforeIndex and afterIndex.'),
          row('before', 'RouteResult', 'route (LngLat[]), distanceKm and durationMin for the original order.'),
          row('after', 'RouteResult', 'The same for the optimised order.'),
          ...common('the optimised route and the savings badge'),
        ],
      },
    ],
  },
  {
    id: 'geofence-alert-feed',
    name: 'GeofenceAlertFeed',
    category: 'Fleet and operations',
    tagline: 'Who crossed which boundary, with a snapshot of where.',
    description:
      'A newest-first feed of vehicles entering and leaving zones. Every row carries its own tiny snapshot of the zone and where the vehicle was; selecting a row shows that event on a larger map above.',
    status: 'new',
    file: 'components/maps/geofence-alert-feed.tsx',
    primitives: ['card'],
    deps: maps,
    usage: `<GeofenceAlertFeed
  events={events}
  onSelect={(event) => openVehicle(event.vehicle)}
/>`,
    anatomy: `import { GeofenceAlertFeed, type GeofenceEvent } from '@/components/maps/geofence-alert-feed';

// GeofenceEvent: id, vehicle, type ('enter' | 'exit'), zone { name; ring }, at, position
// position is where the vehicle crossed the boundary. The first event gets a "newest" dot.
<GeofenceAlertFeed events={events} />`,
    examples: [{ label: 'An older event selected', code: `<GeofenceAlertFeed events={events} defaultSelectedId="g3" />` }],
    api: [
      {
        title: 'GeofenceAlertFeed',
        description: 'A snapshot map above a list of events.',
        rows: [
          row('events', 'GeofenceEvent[]', 'Newest first.'),
          row('defaultSelectedId', 'string', 'The event shown on the map at the start. Defaults to the first.'),
          row('onSelect', '(event: GeofenceEvent) => void', 'Called when a row is selected.'),
          ...common('the zone outline and the newest dot'),
        ],
      },
    ],
  },

  /* ---------- Data visualisation ---------- */
  {
    id: 'origin-destination-flow',
    name: 'OriginDestinationFlow',
    category: 'Data visualisation',
    tagline: 'Arcs between places, as thick as the volume between them.',
    description:
      'Curved lines between places whose width follows volume, place markers sized by total traffic, and a ranked list of the biggest flows. Hovering a line or a list row highlights both.',
    status: 'new',
    file: 'components/maps/origin-destination-flow.tsx',
    primitives: ['card'],
    deps: maps,
    wide: true,
    usage: `<OriginDestinationFlow
  nodes={cities}
  flows={shipments}
  title="Busiest routes"
  metricLabel="Shipments this month"
/>`,
    anatomy: `import { OriginDestinationFlow, type FlowNode, type Flow } from '@/components/maps/origin-destination-flow';

// FlowNode: id, label, position     Flow: from (node id), to (node id), value
// A flow is drawn one way; list A to B and B to A separately if both matter.
<OriginDestinationFlow nodes={nodes} flows={flows} />`,
    examples: [{ label: 'The top five only', code: `<OriginDestinationFlow nodes={nodes} flows={flows} topN={5} title="Top five routes" />` }],
    api: [
      {
        title: 'OriginDestinationFlow',
        description: 'Flows on a map with a ranked list. Panning and zooming are off; hover works.',
        rows: [
          row('nodes', 'FlowNode[]', 'The places.'),
          row('flows', 'Flow[]', 'from and to are node ids; value sets the line width.'),
          row('title', 'string', 'Heading of the ranked list.', "'Busiest routes'"),
          row('metricLabel', 'string', 'What the number means.'),
          row('formatValue', '(value: number) => string', 'Formats values in the list and the hover label.', 'toLocaleString'),
          row('topN', 'number', 'How many flows the list shows.', '8'),
          ...common('the flow lines and the hovered nodes'),
        ],
      },
    ],
  },
  {
    id: 'heatmap-card',
    name: 'HeatmapCard',
    category: 'Data visualisation',
    tagline: 'Where activity is dense, for the hours you pick.',
    description:
      'A density heatmap that fades from clear to the accent colour, an hourly histogram with your range lit, and two sliders to choose the hours. The total and the busiest hour in range update as you drag.',
    status: 'new',
    file: 'components/maps/heatmap-card.tsx',
    primitives: ['card'],
    deps: maps,
    usage: `<HeatmapCard
  points={orders.map((order) => ({ position: order.position, hour: order.placedAt.getHours() }))}
  title="Order density"
  unit="orders"
  defaultRange={[11, 14]}
/>`,
    anatomy: `import { HeatmapCard, type HeatPoint } from '@/components/maps/heatmap-card';

// HeatPoint: position, hour (0 to 23), weight? (default 1)
// Filtering happens on the map, so thousands of points stay smooth.
<HeatmapCard points={points} defaultRange={[8, 12]} />`,
    examples: [{ label: 'Evening only', code: `<HeatmapCard points={points} defaultRange={[18, 22]} title="Evening orders" />` }],
    api: [
      {
        title: 'HeatmapCard',
        description: 'A heatmap with an hour-range filter.',
        rows: [
          row('points', 'HeatPoint[]', 'position, hour (0 to 23) and an optional weight.'),
          row('title', 'string', 'Label over the total.', "'Order density'"),
          row('unit', 'string', 'What one point is, in the plural.', "'orders'"),
          row('defaultRange', '[number, number]', 'The starting hour range, inclusive.', '[0, 23]'),
          ...common('the heat, the histogram and the sliders'),
        ],
      },
    ],
  },
  {
    id: 'coverage-map',
    name: 'CoverageMap',
    category: 'Data visualisation',
    tagline: 'Where a network reaches, and how well.',
    description:
      'Coverage areas around each site, shaded by signal strength, with site markers you can select and a legend that filters the map by strength and shows how many sites there are of each.',
    status: 'new',
    file: 'components/maps/coverage-map.tsx',
    primitives: ['card'],
    deps: maps,
    usage: `<CoverageMap
  cells={sites.map((site) => ({ id: site.id, name: site.name, position: site.position, radiusKm: site.range, signal: site.quality }))}
  title="Network coverage"
/>`,
    anatomy: `import { CoverageMap, type CoverageCell } from '@/components/maps/coverage-map';

// CoverageCell: id, name, position, radiusKm, signal ('strong' | 'ok' | 'weak')
// Each cell is drawn as a circle; overlapping cells add up, so dense areas read darker.
<CoverageMap cells={cells} />`,
    examples: [{ label: 'Fewer sites', code: `<CoverageMap cells={cells.slice(0, 5)} title="Core network" />` }],
    api: [
      {
        title: 'CoverageMap',
        description: 'Circles of coverage with a filtering legend.',
        rows: [
          row('cells', 'CoverageCell[]', 'The sites and how far each reaches.'),
          row('title', 'string', 'Label next to the legend.', "'Network coverage'"),
          ...common('the coverage shading'),
        ],
      },
    ],
  },
  {
    id: 'trip-replay',
    name: 'TripReplay',
    category: 'Data visualisation',
    tagline: 'A recorded trip you can scrub and play back.',
    description:
      'The route with a vehicle marker, a clock, a speed readout, and a scrubber with playback at 1×, 2×, 4× and 8×. Stops appear as flags and as ticks on the timeline, and the vehicle waits at each one for as long as it did in real life.',
    status: 'new',
    file: 'components/maps/trip-replay.tsx',
    primitives: ['card', 'button'],
    deps: maps,
    usage: `<TripReplay
  route={route}
  movingMin={46}
  startMinutes={8 * 60 + 12}
  stops={[
    { at: 0.36, label: 'Coffee stop', dwellMin: 6 },
    { at: 0.7, label: 'Viewpoint', dwellMin: 4 },
  ]}
/>`,
    anatomy: `import { TripReplay, type ReplayStop } from '@/components/maps/trip-replay';

// ReplayStop.at is how far along the route the stop is, 0 to 1.
// movingMin is time spent moving; the timeline adds each stop's dwellMin to it.
// The vehicle moves at an even pace between stops, so speed shows the average.
<TripReplay route={route} movingMin={46} stops={stops} />`,
    examples: [{ label: 'Playing from the start', code: `<TripReplay route={route} movingMin={46} stops={stops} autoPlay />` }],
    api: [
      {
        title: 'TripReplay',
        description: 'A player for one trip.',
        rows: [
          row('route', 'LngLat[]', 'The recorded path.'),
          row('movingMin', 'number', 'Minutes spent moving, not counting stops.'),
          row('stops', 'ReplayStop[]', 'at (0 to 1), label and dwellMin.', '[]'),
          row('startMinutes', 'number', 'When the trip started, in minutes after midnight.', '480'),
          row('title', 'string', 'Label over the clock.', "'Trip replay'"),
          row('defaultProgress', 'number', 'Where the scrubber starts, 0 to 1.', '0'),
          row('autoPlay', 'boolean', 'Start playing on mount.', 'false'),
          ...common('the travelled line and the vehicle'),
        ],
      },
    ],
  },

  /* ---------- Travel and real estate ---------- */
  {
    id: 'itinerary-map',
    name: 'ItineraryMap',
    category: 'Travel and real estate',
    tagline: 'A trip day by day, with the stops, the route and the list in step.',
    description:
      'Day tabs, a numbered stop list with times and notes, and a map with the day’s route and numbered markers. Selecting a stop in either place highlights it in both and centres the map on it.',
    status: 'new',
    file: 'components/maps/itinerary-map.tsx',
    primitives: ['card'],
    deps: maps,
    wide: true,
    usage: `<ItineraryMap days={days} />`,
    anatomy: `import { ItineraryMap, type ItineraryDay } from '@/components/maps/itinerary-map';

// ItineraryDay: id, label, title?, stops[] (id, name, time?, note?, position), route, distanceKm?
// route is the path between the stops in order: from a walking or driving router.
<ItineraryMap days={days} />`,
    examples: [{ label: 'A one-day trip', code: `<ItineraryMap days={days.slice(0, 1)} />` }],
    api: [
      {
        title: 'ItineraryMap',
        description: 'Days, stops and a map. Below 42rem wide it stacks the list above the map.',
        rows: [
          row('days', 'ItineraryDay[]', 'One entry per day.'),
          ...common('the route and the selected stop'),
        ],
      },
    ],
  },
  {
    id: 'property-map-card',
    name: 'PropertyMapCard',
    category: 'Travel and real estate',
    tagline: 'Listings as price tags; pick one to see what is around it.',
    description:
      'Listings as price pills on a map. Selecting one opens its price, beds, baths and size, draws a dashed neighbourhood ring around it, and counts the other listings inside the ring.',
    status: 'new',
    file: 'components/maps/property-map-card.tsx',
    primitives: ['card', 'button'],
    deps: maps,
    usage: `<PropertyMapCard
  listings={listings}
  defaultSelectedId="l1"
  radiusKm={0.8}
  onView={(listing) => router.push(\`/listings/\${listing.id}\`)}
/>`,
    anatomy: `import { PropertyMapCard, type Listing } from '@/components/maps/property-map-card';

// Listing: id, price (whole units), beds, baths, sqft?, address, position
// Prices show compactly on the pins: $845K, $1.3M.
<PropertyMapCard listings={listings} />`,
    examples: [{ label: 'A wider neighbourhood', code: `<PropertyMapCard listings={listings} defaultSelectedId="l3" radiusKm={1.2} />` }],
    api: [
      {
        title: 'PropertyMapCard',
        description: 'Price pins, a selected listing card, and a neighbourhood ring.',
        rows: [
          row('listings', 'Listing[]', 'The homes to show.'),
          row('radiusKm', 'number', 'The neighbourhood ring around the selected listing.', '0.8'),
          row('defaultSelectedId', 'string', 'The listing selected at the start. Defaults to the first.'),
          row('onView', '(listing: Listing) => void', 'Called when View is pressed.'),
          ...common('the selected pin and the ring'),
        ],
      },
    ],
  },
  {
    id: 'commute-calculator',
    name: 'CommuteCalculator',
    category: 'Travel and real estate',
    tagline: 'How long to work from here? Drop a pin and see.',
    description:
      'Drive-time bands drawn around a workplace, and a home pin you can search for, drag or click into place. The answer reads as a range, like 10 to 20 min, or says when the pin is outside every band. The bands come from your routing service; the component draws them.',
    status: 'new',
    file: 'components/maps/commute-calculator.tsx',
    primitives: ['card', 'input'],
    deps: maps,
    usage: `<CommuteCalculator
  work={{ label: 'Union Square', position: [-122.4074, 37.7879] }}
  isochrones={isochrones}
  defaultHome={[-122.4477, 37.7691]}
  search={(query) => geocoder.search(query)}
  onChange={(home, minutes) => setCommute(minutes)}
/>`,
    anatomy: `import { CommuteCalculator, type Isochrone } from '@/components/maps/commute-calculator';

// Isochrone: minutes, ring (the outer ring of the area reachable within that time).
// Get them from a routing engine's isochrone endpoint (Valhalla, OpenRouteService, Mapbox).
<CommuteCalculator work={work} isochrones={isochrones} defaultHome={home} search={search} />`,
    examples: [{ label: 'Living outside the bands', code: `<CommuteCalculator work={work} isochrones={isochrones.slice(1)} defaultHome={[-122.4783, 37.7301]} search={search} />` }],
    api: [
      {
        title: 'CommuteCalculator',
        description: 'A home pin against drive-time bands.',
        rows: [
          row('work', '{ label; position }', 'The destination the bands are measured to.'),
          row('isochrones', 'Isochrone[]', 'Any number of bands, in any order.'),
          row('defaultHome', 'LngLat', 'Where the home pin starts.'),
          row('search', '(query: string) => Promise<CommutePlace[]>', 'Your geocoder.'),
          row('modeLabel', 'string', 'Shown under the time.', "'By car'"),
          row('onChange', '(home: LngLat, minutes: number | null) => void', 'Fires when the pin moves; minutes is the band it fell in, or null.'),
          ...common('the bands and the home pin'),
        ],
      },
    ],
  },
  {
    id: 'weather-alert-map',
    name: 'WeatherAlertMap',
    category: 'Travel and real estate',
    tagline: 'The regions under a storm, a flood or a closure.',
    description:
      'Alert areas shaded by severity (warning, watch, advisory), a severity legend that filters the map, and a list of active alerts with their time windows. Selecting an alert outlines it and zooms to it.',
    status: 'new',
    file: 'components/maps/weather-alert-map.tsx',
    primitives: ['card', 'badge'],
    deps: maps,
    wide: true,
    usage: `<WeatherAlertMap
  alerts={alerts}
  defaultSelectedId="w1"
  onSelect={(alert) => track('alert_opened', alert.id)}
/>`,
    anatomy: `import { WeatherAlertMap, type WeatherAlert } from '@/components/maps/weather-alert-map';

// WeatherAlert: id, title, severity ('advisory' | 'watch' | 'warning'), ring, window?, description?
// Works for road closures and outages too: severity is just three levels of "how bad".
<WeatherAlertMap alerts={alerts} />`,
    examples: [{ label: 'Warnings only', code: `<WeatherAlertMap alerts={alerts.filter((alert) => alert.severity === 'warning')} />` }],
    api: [
      {
        title: 'WeatherAlertMap',
        description: 'Alert areas, a filtering legend, and a list. Panning and zooming are off.',
        rows: [
          row('alerts', 'WeatherAlert[]', 'The active alerts.'),
          row('defaultSelectedId', 'string', 'The alert selected at the start.'),
          row('onSelect', '(alert: WeatherAlert) => void', 'Called when an alert is selected.'),
          ...common('the alert shading and the warning badge'),
        ],
      },
    ],
  },
  ...FLEET_COMPONENTS,
];

export const getComponent = (id: string) => COMPONENTS.find((entry) => entry.id === id);
