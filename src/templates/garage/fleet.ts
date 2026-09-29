/**
 * One invented fleet, used by every fleet demo so they read as a single product.
 * All names, plates, VINs, dates and figures are made up. "Today" is 29 Sep 2026.
 */
export const TODAY = '2026-09-29';

export interface DemoVehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  vin: string;
  odometerKm: number;
  driver: string;
  klass: 'Van' | 'Truck' | 'Pickup';
}

export const VEHICLES: DemoVehicle[] = [
  { id: 'v12', name: 'Van 12', make: 'Ford', model: 'Transit 350', year: 2021, plate: '8KTR204', vin: '1FTBW2CM5MKA48213', odometerKm: 148210, driver: 'Priya Nair', klass: 'Van' },
  { id: 'v07', name: 'Van 07', make: 'Ford', model: 'Transit 250', year: 2022, plate: '7LMN552', vin: '1FTBR1C82NKB19044', odometerKm: 96430, driver: 'Diego Alvarez', klass: 'Van' },
  { id: 'v21', name: 'Van 21', make: 'Mercedes', model: 'Sprinter 2500', year: 2019, plate: '6HJP118', vin: 'W1Y4ECHY5KT073350', odometerKm: 231880, driver: 'Lena Fischer', klass: 'Van' },
  { id: 'v03', name: 'Van 03', make: 'Ram', model: 'ProMaster 2500', year: 2023, plate: '9QRS340', vin: '3C6LRVDG4PE512877', odometerKm: 54120, driver: 'Mia Chen', klass: 'Van' },
  { id: 'v18', name: 'Van 18', make: 'Ford', model: 'Transit 350', year: 2020, plate: '5DFG901', vin: '1FTBW2CM8LKB66120', odometerKm: 187660, driver: 'Jon Berg', klass: 'Van' },
  { id: 't02', name: 'Truck 02', make: 'Isuzu', model: 'NPR-HD', year: 2020, plate: '4TRK022', vin: 'JALC4W165L7011952', odometerKm: 204350, driver: 'Omar Haddad', klass: 'Truck' },
  { id: 't05', name: 'Truck 05', make: 'Hino', model: '195', year: 2022, plate: '3TRK057', vin: '5PVNJ8JV6N4S30518', odometerKm: 118940, driver: 'Sam Okafor', klass: 'Truck' },
  { id: 'p09', name: 'Pickup 09', make: 'Toyota', model: 'Tacoma', year: 2021, plate: '2PKP090', vin: '3TMCZ5AN6MM429981', odometerKm: 88270, driver: 'Ana Costa', klass: 'Pickup' },
];

export const VEHICLE_BY_ID = Object.fromEntries(VEHICLES.map((vehicle) => [vehicle.id, vehicle]));

/** Deterministic pseudo-random numbers, so charts look the same on every load. */
export function seeded(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** ISO date `offset` days from `TODAY`. */
export function dayFromToday(offset: number) {
  const date = new Date(`${TODAY}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}
