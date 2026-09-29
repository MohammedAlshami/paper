import type { LngLat } from '@/components/maps/map-kit';
import { FLEET_ROUTES } from './fleet-routes';
import { DROP_OFF_PHOTO, SIGNATURE_PATH } from './media';

/** A real street-following route (Mission to Hayes Valley, San Francisco), fetched once from OSRM. */
export const ORDER_ROUTE: LngLat[] = [
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

export const TRACKING_STEPS = [
  { id: 'packed', label: 'Packed' },
  { id: 'picked-up', label: 'Picked up' },
  { id: 'on-the-way', label: 'On the way' },
  { id: 'arriving', label: 'Arriving' },
  { id: 'delivered', label: 'Delivered' },
];

export interface DemoOrder {
  id: string;
  store: { name: string; category: string; address: string; position: LngLat; rating: number; reviewCount: number; hours: string };
  origin: { label: string; position: LngLat };
  destination: { label: string; position: LngLat };
  route: LngLat[];
  driver: { name: string; vehicle: string; plate: string; rating: number; position: LngLat };
  currentStepId: string;
  etaMinutes: number;
  summary: { title: string; detail: string };
  delivery?: { deliveredAt: string; recipient: string; address: string; photoUrl: string; photoCaption: string; signaturePath: string; note: string };
}

const STORE = { name: 'Guerrero Market', category: 'Grocery · Deli', address: '600 Guerrero St, San Francisco', position: ORDER_ROUTE[0], rating: 4.8, reviewCount: 932, hours: 'Open until 9 pm' };

/** Two orders the tracking page can show: one on its way, one already delivered. */
export const ORDERS: Record<string, DemoOrder> = {
  '48213': {
    id: '48213',
    store: STORE,
    origin: { label: 'Guerrero Market', position: ORDER_ROUTE[0] },
    destination: { label: '412 Hayes St, San Francisco', position: ORDER_ROUTE[ORDER_ROUTE.length - 1] },
    route: ORDER_ROUTE,
    driver: { name: 'Marcus Lee', vehicle: 'White Toyota Prius', plate: '8KTR204', rating: 4.9, position: ORDER_ROUTE[Math.round(ORDER_ROUTE.length * 0.58)] },
    currentStepId: 'on-the-way',
    etaMinutes: 6,
    summary: { title: 'Order #48213', detail: 'Arrives 2:40 pm' },
  },
  '48190': {
    id: '48190',
    store: STORE,
    origin: { label: 'Guerrero Market', position: FLEET_ROUTES[3][0] },
    destination: { label: '1450 Haight St, San Francisco', position: FLEET_ROUTES[3][FLEET_ROUTES[3].length - 1] },
    route: FLEET_ROUTES[3],
    driver: { name: 'Priya Nair', vehicle: 'Silver Honda Fit', plate: '5DFG901', rating: 4.95, position: FLEET_ROUTES[3][FLEET_ROUTES[3].length - 1] },
    currentStepId: 'delivered',
    etaMinutes: 0,
    summary: { title: 'Order #48190', detail: 'Yesterday, 6:12 pm' },
    delivery: {
      deliveredAt: 'Mon 28 Sep, 6:12 pm',
      recipient: 'Jordan Ellis',
      address: '1450 Haight St, front door',
      photoUrl: DROP_OFF_PHOTO,
      photoCaption: 'Left at the front door',
      signaturePath: SIGNATURE_PATH,
      note: 'Ring the bell twice.',
    },
  },
};
