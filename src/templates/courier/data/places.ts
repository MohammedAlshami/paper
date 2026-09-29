import { circleRing, type LngLat } from '@/components/maps/map-kit';
import type { Branch } from '@/components/maps/branch-directory';
import type { CoverageCell } from '@/components/maps/coverage-map';
import type { DispatchDriver, DispatchJob } from '@/components/maps/dispatch-board';
import type { Flow, FlowNode } from '@/components/maps/origin-destination-flow';
import type { GeofenceEvent } from '@/components/maps/geofence-alert-feed';
import type { ItineraryDay } from '@/components/maps/itinerary-map';
import type { Listing } from '@/components/maps/property-map-card';
import type { PickupPoint } from '@/components/maps/pickup-point-selector';
import type { ServiceZone } from '@/components/maps/service-area-checker';
import type { ShipmentLeg } from '@/components/maps/shipment-journey';
import type { ParkingOption } from '@/components/maps/event-venue-card';
import type { WeatherAlert } from '@/components/maps/weather-alert-map';
import { ITINERARY_DISTANCES_KM, ITINERARY_ROUTES } from './itinerary';

/* ---------- pickers and forms ---------- */

export const SERVICE_ZONES: ServiceZone[] = [
  { id: 'core', name: 'Central zone', ring: circleRing([-122.4194, 37.7679], 3.4, 48), eta: '25 to 35 min', fee: 'Free over $30' },
  { id: 'extended', name: 'Extended zone', ring: circleRing([-122.4194, 37.7679], 6.2, 48), eta: '45 to 60 min', fee: '$4.99 delivery' },
];

export const PICKUP_POINTS: PickupPoint[] = [
  { id: 'p1', name: 'Locker 4021', type: 'locker', address: '2100 Mission St', position: [-122.4193, 37.7633], hours: '24 hours' },
  { id: 'p2', name: 'Corner Market on 18th', type: 'store', address: '3639 18th St', position: [-122.4262, 37.7615], hours: 'Until 9 pm' },
  { id: 'p3', name: 'Mission Post Office', type: 'post-office', address: '3082 16th St', position: [-122.4216, 37.7649], hours: 'Until 5 pm' },
  { id: 'p4', name: 'Locker 4188', type: 'locker', address: '1 Valencia Plaza', position: [-122.4221, 37.7699], hours: '24 hours', available: false },
  { id: 'p5', name: 'Guerrero Bakery', type: 'store', address: '600 Guerrero St', position: [-122.4241, 37.7614], hours: 'Until 4 pm' },
  { id: 'p6', name: 'Locker 3950', type: 'locker', address: '2800 Mission St', position: [-122.4187, 37.7532], hours: '24 hours' },
  { id: 'p7', name: 'Dolores Pastry', type: 'store', address: '3500 19th St', position: [-122.4245, 37.7604], hours: 'Until 5 pm' },
];

/* ---------- discovery ---------- */

export const BRANCHES: Branch[] = [
  { id: 'sea', name: 'Seattle', region: 'West', address: '410 Pine St', position: [-122.3321, 47.6062], phone: '+1 206 555 0142', email: 'seattle@example.com', hours: 'Mon to Fri, 9 am to 5 pm' },
  { id: 'sf', name: 'San Francisco', region: 'West', address: '88 Howard St', position: [-122.3961, 37.7898], phone: '+1 415 555 0118', email: 'sf@example.com', hours: 'Mon to Fri, 8:30 am to 5:30 pm' },
  { id: 'la', name: 'Los Angeles', region: 'West', address: '700 Flower St', position: [-118.2571, 34.0509], phone: '+1 213 555 0177', email: 'la@example.com', hours: 'Mon to Fri, 9 am to 5 pm' },
  { id: 'den', name: 'Denver', region: 'Central', address: '1600 Wynkoop St', position: [-105.0002, 39.7527], phone: '+1 303 555 0163', email: 'denver@example.com', hours: 'Mon to Fri, 8 am to 4 pm' },
  { id: 'dal', name: 'Dallas', region: 'Central', address: '2001 Ross Ave', position: [-96.7970, 32.7876], phone: '+1 214 555 0129', email: 'dallas@example.com', hours: 'Mon to Fri, 9 am to 5 pm' },
  { id: 'chi', name: 'Chicago', region: 'Central', address: '233 S Wacker Dr', position: [-87.6353, 41.8789], phone: '+1 312 555 0190', email: 'chicago@example.com', hours: 'Mon to Fri, 8:30 am to 5 pm' },
  { id: 'atl', name: 'Atlanta', region: 'East', address: '191 Peachtree St', position: [-84.3880, 33.7590], phone: '+1 404 555 0155', email: 'atlanta@example.com', hours: 'Mon to Fri, 9 am to 5 pm' },
  { id: 'nyc', name: 'New York', region: 'East', address: '1 Liberty Plaza', position: [-74.0120, 40.7094], phone: '+1 212 555 0101', email: 'nyc@example.com', hours: 'Mon to Fri, 8 am to 6 pm' },
  { id: 'bos', name: 'Boston', region: 'East', address: '100 Federal St', position: [-71.0570, 42.3554], phone: '+1 617 555 0136', email: 'boston@example.com', hours: 'Mon to Fri, 9 am to 5 pm' },
];

export const VENUE = { position: [-122.433, 37.784] as LngLat, address: '1805 Geary Blvd' };
export const PARKING: ParkingOption[] = [
  { id: 'k1', name: 'Geary Street Garage', position: [-122.4342, 37.7846], price: '$18 flat', note: 'Fills by 7 pm' },
  { id: 'k2', name: 'Webster Lot', position: [-122.4313, 37.7827], price: '$12 event rate' },
  { id: 'k3', name: 'Fillmore Street Parking', position: [-122.4331, 37.7869], price: 'Free after 6 pm', note: 'Street parking' },
  { id: 'k4', name: 'Japantown Garage', position: [-122.4297, 37.7853], price: '$22 flat' },
];

/* ---------- fleet and operations ---------- */

export const DISPATCH_JOBS: DispatchJob[] = [
  { id: 'j1', title: 'Order #48213', address: '412 Hayes St', position: [-122.4262, 37.7768], window: 'Before 3 pm' },
  { id: 'j2', title: 'Order #48214', address: '1200 Valencia St', position: [-122.4209, 37.7541], window: 'Before 2 pm' },
  { id: 'j3', title: 'Order #48215', address: '77 Dolores St', position: [-122.4265, 37.7658] },
  { id: 'j4', title: 'Order #48216', address: '2200 Market St', position: [-122.4287, 37.7684], window: 'After 1 pm' },
  { id: 'j5', title: 'Order #48217', address: '901 Bryant St', position: [-122.4054, 37.7714] },
  { id: 'j6', title: 'Order #48218', address: '3400 24th St', position: [-122.4189, 37.7521], window: 'Before 5 pm' },
  { id: 'j7', title: 'Order #48219', address: '55 Laguna St', position: [-122.4266, 37.7743] },
];
export const DISPATCH_DRIVERS: DispatchDriver[] = [
  { id: 'd1', name: 'Priya Nair', vehicle: 'Van 12', position: [-122.4147, 37.7642] },
  { id: 'd2', name: 'Diego Alvarez', vehicle: 'Van 07', position: [-122.4322, 37.7711] },
  { id: 'd3', name: 'Sam Okafor', vehicle: 'Bike 03', position: [-122.4093, 37.7588] },
];

/** The event position is on the zone's edge, at `degrees` clockwise from north. */
function onEdge(center: LngLat, radiusKm: number, degrees: number): LngLat {
  const rad = (degrees * Math.PI) / 180;
  return [center[0] + (radiusKm * Math.sin(rad)) / (111.32 * Math.cos((center[1] * Math.PI) / 180)), center[1] + (radiusKm * Math.cos(rad)) / 110.574];
}
const ZONE_A: LngLat = [-122.3998, 37.7605];
const ZONE_B: LngLat = [-122.4477, 37.7691];
const ZONE_C: LngLat = [-122.4102, 37.8005];
export const GEOFENCE_EVENTS: GeofenceEvent[] = [
  { id: 'g1', vehicle: 'Truck 12', type: 'exit', zone: { name: 'Depot', ring: circleRing(ZONE_A, 0.7, 40) }, at: '2:41 pm', position: onEdge(ZONE_A, 0.7, 70) },
  { id: 'g2', vehicle: 'Van 07', type: 'enter', zone: { name: 'Haight delivery zone', ring: circleRing(ZONE_B, 0.9, 40) }, at: '2:33 pm', position: onEdge(ZONE_B, 0.9, 200) },
  { id: 'g3', vehicle: 'Bike 03', type: 'enter', zone: { name: 'North Beach zone', ring: circleRing(ZONE_C, 0.8, 40) }, at: '2:18 pm', position: onEdge(ZONE_C, 0.8, 300) },
  { id: 'g4', vehicle: 'Van 21', type: 'exit', zone: { name: 'Depot', ring: circleRing(ZONE_A, 0.7, 40) }, at: '1:57 pm', position: onEdge(ZONE_A, 0.7, 150) },
];

/* ---------- data visualisation ---------- */

export const FLOW_NODES: FlowNode[] = [
  { id: 'sea', label: 'Seattle', position: [-122.3321, 47.6062] },
  { id: 'sf', label: 'San Francisco', position: [-122.4194, 37.7749] },
  { id: 'la', label: 'Los Angeles', position: [-118.2437, 34.0522] },
  { id: 'den', label: 'Denver', position: [-104.9903, 39.7392] },
  { id: 'dal', label: 'Dallas', position: [-96.797, 32.7767] },
  { id: 'chi', label: 'Chicago', position: [-87.6298, 41.8781] },
  { id: 'atl', label: 'Atlanta', position: [-84.388, 33.749] },
  { id: 'mia', label: 'Miami', position: [-80.1918, 25.7617] },
  { id: 'nyc', label: 'New York', position: [-74.006, 40.7128] },
  { id: 'bos', label: 'Boston', position: [-71.0589, 42.3601] },
];
export const FLOWS: Flow[] = [
  { from: 'la', to: 'nyc', value: 4820 },
  { from: 'sf', to: 'chi', value: 3110 },
  { from: 'chi', to: 'nyc', value: 3950 },
  { from: 'dal', to: 'atl', value: 2760 },
  { from: 'sea', to: 'sf', value: 2240 },
  { from: 'la', to: 'dal', value: 3380 },
  { from: 'atl', to: 'mia', value: 1980 },
  { from: 'nyc', to: 'bos', value: 2870 },
  { from: 'den', to: 'chi', value: 1640 },
  { from: 'sf', to: 'la', value: 4210 },
  { from: 'chi', to: 'atl', value: 2130 },
  { from: 'sea', to: 'den', value: 980 },
  { from: 'dal', to: 'mia', value: 1120 },
  { from: 'la', to: 'sea', value: 1490 },
  { from: 'bos', to: 'chi', value: 870 },
  { from: 'den', to: 'dal', value: 1290 },
];

const tower = (id: string, name: string, position: LngLat, radiusKm: number, signal: CoverageCell['signal']): CoverageCell => ({ id, name, position, radiusKm, signal });
export const COVERAGE_CELLS: CoverageCell[] = [
  tower('t1', 'Downtown SF', [-122.4, 37.79], 2.6, 'strong'),
  tower('t2', 'Mission', [-122.418, 37.76], 2.4, 'strong'),
  tower('t3', 'Sunset', [-122.482, 37.752], 3.2, 'ok'),
  tower('t4', 'Richmond', [-122.482, 37.781], 3, 'ok'),
  tower('t5', 'Oakland', [-122.271, 37.805], 3.4, 'strong'),
  tower('t6', 'Berkeley hills', [-122.245, 37.874], 3.6, 'weak'),
  tower('t7', 'Daly City', [-122.47, 37.687], 3.4, 'ok'),
  tower('t8', 'San Bruno mountain', [-122.43, 37.69], 2.8, 'weak'),
  tower('t9', 'Alameda', [-122.24, 37.765], 2.6, 'ok'),
  tower('t10', 'Marin headlands', [-122.5, 37.83], 3.8, 'weak'),
];

/* ---------- travel and real estate ---------- */

const DAY_STOPS: { title: string; stops: { name: string; time: string; note?: string; position: LngLat }[] }[] = [
  {
    title: 'Downtown to the bay',
    stops: [
      { name: 'Civic Center Plaza', time: '9:00 am', note: 'Coffee first', position: [-122.4194, 37.7749] },
      { name: 'Chinatown gate', time: '10:15 am', position: [-122.4133, 37.7955] },
      { name: 'Telegraph Hill viewpoint', time: '12:00 pm', note: 'Lunch nearby', position: [-122.4058, 37.8024] },
      { name: 'Fort Mason lawn', time: '3:30 pm', position: [-122.4224, 37.808] },
    ],
  },
  {
    title: 'Golden Gate Park',
    stops: [
      { name: 'Windmill meadow', time: '9:30 am', position: [-122.4783, 37.7694] },
      { name: 'Lily pond', time: '11:00 am', position: [-122.4686, 37.7704] },
      { name: 'Music concourse', time: '1:00 pm', note: 'Picnic', position: [-122.4529, 37.7726] },
      { name: 'Haight Street gate', time: '3:00 pm', position: [-122.44, 37.7719] },
    ],
  },
  {
    title: 'Waterfront and shops',
    stops: [
      { name: 'Ferry plaza', time: '9:00 am', note: 'Market stalls', position: [-122.3937, 37.7955] },
      { name: 'Ballpark', time: '11:30 am', position: [-122.3894, 37.7786] },
      { name: 'Museum plaza', time: '1:30 pm', position: [-122.4019, 37.7786] },
      { name: 'Union Square', time: '4:00 pm', position: [-122.4025, 37.7853] },
    ],
  },
];
export const ITINERARY: ItineraryDay[] = DAY_STOPS.map((day, index) => ({
  id: `day-${index + 1}`,
  label: `Day ${index + 1}`,
  title: day.title,
  stops: day.stops.map((stop, stopIndex) => ({ id: `d${index + 1}s${stopIndex + 1}`, ...stop })),
  route: ITINERARY_ROUTES[index],
  distanceKm: ITINERARY_DISTANCES_KM[index],
}));

export const LISTINGS: Listing[] = [
  { id: 'l1', price: 1295000, beds: 3, baths: 2, sqft: 1780, address: '412 Hayes St', position: [-122.4247, 37.7767] },
  { id: 'l2', price: 985000, beds: 2, baths: 1, sqft: 1120, address: '58 Laguna St', position: [-122.4264, 37.7738] },
  { id: 'l3', price: 1740000, beds: 4, baths: 3, sqft: 2340, address: '1 Alamo Square', position: [-122.4342, 37.7763] },
  { id: 'l4', price: 2890000, beds: 5, baths: 4, sqft: 3320, address: '920 Steiner St', position: [-122.4366, 37.7772] },
  { id: 'l5', price: 845000, beds: 1, baths: 1, sqft: 760, address: '245 Octavia St', position: [-122.4238, 37.7752] },
  { id: 'l6', price: 1120000, beds: 2, baths: 2, sqft: 1290, address: '1500 Fell St', position: [-122.4408, 37.7737] },
  { id: 'l7', price: 1560000, beds: 3, baths: 2, sqft: 1690, address: '780 Divisadero St', position: [-122.4386, 37.7789] },
  { id: 'l8', price: 720000, beds: 1, baths: 1, sqft: 640, address: '399 Fulton St', position: [-122.4218, 37.7788] },
  { id: 'l9', price: 1385000, beds: 3, baths: 2, sqft: 1540, address: '640 Oak St', position: [-122.4283, 37.7734] },
  { id: 'l10', price: 2140000, beds: 4, baths: 3, sqft: 2610, address: '1230 Hayes St', position: [-122.4359, 37.7756] },
];

/** A rough storm-shaped area: a circle whose radius wobbles, so the demo alerts do not look like compass drawings. */
function blob(center: LngLat, radiusKm: number, seed: number, steps = 30): LngLat[] {
  return circleRing(center, radiusKm, steps).map((point, index) => {
    const wobble = 1 + 0.12 * Math.sin(index * 0.7 + seed) + 0.05 * Math.cos(index * 1.3 + seed * 2);
    return [center[0] + (point[0] - center[0]) * wobble, center[1] + (point[1] - center[1]) * wobble] as LngLat;
  });
}
export const WEATHER_ALERTS: WeatherAlert[] = [
  { id: 'w1', title: 'Hurricane warning', severity: 'warning', ring: blob([-89.4, 28.6], 320, 1), window: 'Until 6 am Thursday', description: 'Storm surge and winds above 120 km/h expected along the coast. Delivery routes through the region are suspended.' },
  { id: 'w2', title: 'Flood watch', severity: 'watch', ring: blob([-91.2, 38.4], 380, 3), window: 'Until 8 pm tonight', description: 'Heavy rain over saturated ground. Expect closures on low-lying roads.' },
  { id: 'w3', title: 'Winter storm watch', severity: 'watch', ring: blob([-100.6, 44.2], 420, 5), window: 'Tomorrow 3 am to 9 pm', description: 'Snow and blowing snow. Reduced visibility on interstates.' },
  { id: 'w4', title: 'Heat advisory', severity: 'advisory', ring: blob([-112.0, 33.4], 330, 2), window: 'Until 9 pm tonight', description: 'Temperatures above 42 degrees. Vehicles should not be left parked in the sun.' },
  { id: 'w5', title: 'Dense fog advisory', severity: 'advisory', ring: blob([-122.9, 45.6], 240, 4), window: 'Until 10 am', description: 'Visibility below 400 metres near the coast and river valleys.' },
];

/* ---------- tracking ---------- */

export const SHIPMENT_LEGS: ShipmentLeg[] = [
  { id: 'a', mode: 'truck', from: { label: 'Shenzhen factory', position: [114.0579, 22.5431] }, to: { label: 'Yantian port', position: [114.282, 22.573] }, status: 'done', carrier: 'Pearl Freight', when: 'Delivered 12 Sep' },
  { id: 'b', mode: 'sea', from: { label: 'Yantian port', position: [114.282, 22.573] }, to: { label: 'Long Beach', position: [-118.1937, 33.7701] }, status: 'active', carrier: 'Pacific Line', when: 'Arrives 29 Sep', progress: 0.72 },
  { id: 'c', mode: 'truck', from: { label: 'Long Beach', position: [-118.1937, 33.7701] }, to: { label: 'Phoenix DC', position: [-112.074, 33.4484] }, status: 'upcoming', carrier: 'Desert Haul', when: 'Est. 2 Oct' },
];
export const SHIPMENT_LEGS_AIR: ShipmentLeg[] = [
  { id: 'a', mode: 'truck', from: { label: 'Frankfurt DC', position: [8.6821, 50.1109] }, to: { label: 'FRA airport', position: [8.5622, 50.0379] }, status: 'done', carrier: 'Rhein Cargo', when: 'Delivered 26 Sep' },
  { id: 'b', mode: 'air', from: { label: 'FRA airport', position: [8.5622, 50.0379] }, to: { label: 'Chicago O’Hare', position: [-87.9048, 41.9742] }, status: 'done', carrier: 'Skyline Air Cargo', when: 'Landed 27 Sep' },
  { id: 'c', mode: 'rail', from: { label: 'Chicago O’Hare', position: [-87.9048, 41.9742] }, to: { label: 'Kansas City hub', position: [-94.5786, 39.0997] }, status: 'active', carrier: 'Midland Rail', when: 'Arrives 30 Sep', progress: 0.45 },
];
