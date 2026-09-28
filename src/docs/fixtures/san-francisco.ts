import { distanceKm, type LngLat } from '@/components/maps/map-kit';
import type { PlaceSuggestion } from '@/components/maps/address-picker';
import type { Store } from '@/components/maps/store-locator';

/** Where the demo visitor is: the Mission, San Francisco. */
export const USER_POSITION: LngLat = [-122.4213, 37.7638];

/** Invented businesses at plausible San Francisco addresses. */
export const STORES: Store[] = [
  { id: 's1', name: 'Valencia Roasters', category: 'Coffee', address: '1026 Valencia St', position: [-122.42115, 37.75665], rating: 4.7, openNow: true, hours: 'Closes 6 pm' },
  { id: 's2', name: 'Hayes Street Coffee', category: 'Coffee', address: '315 Hayes St', position: [-122.42388, 37.77618], rating: 4.5, openNow: true, hours: 'Closes 5 pm' },
  { id: 's3', name: 'Guerrero Bakery', category: 'Bakery', address: '600 Guerrero St', position: [-122.42405, 37.7614], rating: 4.8, openNow: true, hours: 'Closes 4 pm' },
  { id: 's4', name: 'Corner Market on 18th', category: 'Grocery', address: '3639 18th St', position: [-122.42624, 37.76148], rating: 4.6, openNow: true, hours: 'Closes 9 pm' },
  { id: 's5', name: 'Folsom Grocery Co-op', category: 'Grocery', address: '1745 Folsom St', position: [-122.4136, 37.769], rating: 4.4, openNow: true, hours: 'Closes 8 pm' },
  { id: 's6', name: 'Mission Loaf', category: 'Bakery', address: '2901 Mission St', position: [-122.4187, 37.7511], rating: 4.6, openNow: false, hours: 'Opens 7 am' },
  { id: 's7', name: '20th Street Coffee', category: 'Coffee', address: '3014 20th St', position: [-122.411, 37.7587], rating: 4.3, openNow: true, hours: 'Closes 3 pm' },
  { id: 's8', name: 'Market & Church Grocery', category: 'Grocery', address: '2020 Market St', position: [-122.4255, 37.7695], rating: 4.1, openNow: true, hours: 'Closes 10 pm' },
  { id: 's9', name: 'Bernal Bakehouse', category: 'Bakery', address: '2937 24th St', position: [-122.4108, 37.7522], rating: 4.7, openNow: false, hours: 'Opens 6 am' },
  { id: 's10', name: 'Valencia Espresso Bar', category: 'Coffee', address: '375 Valencia St', position: [-122.422, 37.7672], rating: 4.5, openNow: true, hours: 'Closes 7 pm' },
  { id: 's11', name: 'Ninth Street Market', category: 'Grocery', address: '555 9th St', position: [-122.4106, 37.7717], rating: 4.0, openNow: true, hours: 'Closes 9 pm' },
  { id: 's12', name: 'Dolores Pastry', category: 'Bakery', address: '3500 19th St', position: [-122.4245, 37.7604], rating: 4.9, openNow: true, hours: 'Closes 5 pm' },
];

const ADDRESSES: PlaceSuggestion[] = [
  { id: 'a1', label: '1200 Valencia Street', secondary: 'Mission District, San Francisco', position: [-122.42085, 37.75405] },
  { id: 'a2', label: '800 Valencia Street', secondary: 'Mission District, San Francisco', position: [-122.421, 37.76035] },
  { id: 'a3', label: '2100 Mission Street', secondary: 'Mission District, San Francisco', position: [-122.4193, 37.76335] },
  { id: 'a4', label: '3400 18th Street', secondary: 'Mission District, San Francisco', position: [-122.4212, 37.76195] },
  { id: 'a5', label: '500 Hayes Street', secondary: 'Hayes Valley, San Francisco', position: [-122.4262, 37.7772] },
  { id: 'a6', label: '300 Octavia Street', secondary: 'Hayes Valley, San Francisco', position: [-122.424, 37.7757] },
  { id: 'a7', label: '2000 Market Street', secondary: 'Duboce Triangle, San Francisco', position: [-122.426, 37.7694] },
  { id: 'a8', label: '1500 Dolores Street', secondary: 'Noe Valley, San Francisco', position: [-122.4243, 37.7509] },
  { id: 'a9', label: '600 Castro Street', secondary: 'Castro, San Francisco', position: [-122.435, 37.7587] },
  { id: 'a10', label: '1700 Church Street', secondary: 'Noe Valley, San Francisco', position: [-122.4273, 37.7497] },
];

/** A stand-in for a geocoder: substring match over a short list, with a little latency. */
export async function searchAddresses(query: string): Promise<PlaceSuggestion[]> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const needle = query.toLowerCase();
  return ADDRESSES.filter((place) => `${place.label} ${place.secondary}`.toLowerCase().includes(needle)).slice(0, 5);
}

/** A stand-in for reverse geocoding: the nearest listed address, or a generic label. */
export async function reverseAddress(position: LngLat): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const nearest = ADDRESSES.map((place) => ({ place, km: distanceKm(position, place.position) })).sort((a, b) => a.km - b.km)[0];
  if (nearest.km < 0.12) return nearest.place.label;
  if (nearest.km < 0.6) return `Near ${nearest.place.label}`;
  return 'Dropped pin';
}
