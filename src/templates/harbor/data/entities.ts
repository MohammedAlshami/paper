import { seeded } from './seed';

export type LngLat = [number, number];

/* ---------------- locations ---------------- */

export interface Location {
  id: string;
  name: string;
  kind: 'store' | 'warehouse';
  address: string;
  position: LngLat;
  manager: string;
  phone: string;
  hours: string;
}

export const LOCATIONS: Location[] = [
  { id: 'mission', name: 'Mission', kind: 'store', address: '2200 Mission St', position: [-122.4194, 37.7599], manager: 'Ines Duarte', phone: '(415) 555-0101', hours: '9:00 – 20:00' },
  { id: 'sunset', name: 'Sunset', kind: 'store', address: '1350 Irving St', position: [-122.4939, 37.7635], manager: 'Owen Blake', phone: '(415) 555-0102', hours: '9:00 – 19:00' },
  { id: 'marina', name: 'Marina', kind: 'store', address: '2100 Chestnut St', position: [-122.4367, 37.8004], manager: 'Hana Sato', phone: '(415) 555-0103', hours: '10:00 – 20:00' },
  { id: 'soma', name: 'SoMa', kind: 'store', address: '450 Folsom St', position: [-122.3963, 37.7869], manager: 'Luca Ferrari', phone: '(415) 555-0104', hours: '9:00 – 21:00' },
  { id: 'warehouse', name: 'Warehouse', kind: 'warehouse', address: '800 Bayshore Blvd', position: [-122.4012, 37.7368], manager: 'Sam Okafor', phone: '(415) 555-0100', hours: '6:00 – 22:00' },
];
export const STORES = LOCATIONS.filter((location) => location.kind === 'store');
export const WAREHOUSE = LOCATIONS.find((location) => location.kind === 'warehouse') as Location;
export const getLocation = (id: string) => LOCATIONS.find((location) => location.id === id);

/* ---------------- suppliers ---------------- */

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  categories: string[];
  leadDays: number;
  rating: number;
  onTimePercent: number;
  spendYtd: number;
  paymentTerms: string;
}

export const SUPPLIERS: Supplier[] = [
  { id: 's-northline', name: 'Northline Supply Co', contact: 'Rhea Malik', email: 'rhea@northline.example', categories: ['Kitchen', 'Storage'], leadDays: 4, rating: 4.6, onTimePercent: 94, spendYtd: 182400, paymentTerms: 'Net 30' },
  { id: 's-bayview', name: 'Bayview Ceramics', contact: 'Carlos Vega', email: 'carlos@bayviewceramics.example', categories: ['Kitchen', 'Decor'], leadDays: 9, rating: 4.3, onTimePercent: 86, spendYtd: 96800, paymentTerms: 'Net 45' },
  { id: 's-luma', name: 'Luma Lighting', contact: 'Anouk de Vries', email: 'anouk@luma.example', categories: ['Lighting'], leadDays: 12, rating: 4.7, onTimePercent: 91, spendYtd: 141200, paymentTerms: 'Net 30' },
  { id: 's-greenfield', name: 'Greenfield Garden Wholesale', contact: 'Tariq Aziz', email: 'tariq@greenfield.example', categories: ['Garden'], leadDays: 6, rating: 4.1, onTimePercent: 81, spendYtd: 88900, paymentTerms: 'Net 30' },
  { id: 's-cedar', name: 'Cedar & Co', contact: 'Mina Park', email: 'mina@cedarco.example', categories: ['Bath', 'Decor'], leadDays: 7, rating: 4.5, onTimePercent: 92, spendYtd: 73400, paymentTerms: 'Net 30' },
  { id: 's-tidyworks', name: 'TidyWorks', contact: 'Jonas Lindqvist', email: 'jonas@tidyworks.example', categories: ['Storage'], leadDays: 5, rating: 4.4, onTimePercent: 89, spendYtd: 61500, paymentTerms: 'Net 15' },
];
export const getSupplier = (id: string) => SUPPLIERS.find((supplier) => supplier.id === id);

/* ---------------- products ---------------- */

export const CATEGORIES = ['Kitchen', 'Bath', 'Lighting', 'Garden', 'Storage', 'Decor'] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: Category;
  price: number;
  cost: number;
  supplierId: string;
  /** Reorder when the warehouse falls to this many. */
  reorderPoint: number;
  /** How many to order at a time. */
  reorderQty: number;
  status: 'active' | 'paused' | 'retired';
  weightKg: number;
  description: string;
}

// [name, category, price, cost, supplier, reorderPoint, weightKg]
const PRODUCT_ROWS: [string, Category, number, number, string, number, number][] = [
  ['Cast iron skillet, 26 cm', 'Kitchen', 49, 21, 's-northline', 12, 2.6],
  ['Ceramic mixing bowls, set of 3', 'Kitchen', 38, 14, 's-bayview', 10, 2.1],
  ['Acacia cutting board', 'Kitchen', 32, 12, 's-northline', 14, 1.4],
  ['Chef knife, 20 cm', 'Kitchen', 64, 26, 's-northline', 8, 0.4],
  ['Stoneware dinner set, 12 piece', 'Kitchen', 128, 52, 's-bayview', 6, 9.5],
  ['Glass storage jars, set of 4', 'Kitchen', 29, 10, 's-tidyworks', 16, 1.8],
  ['Enamel dutch oven, 5 L', 'Kitchen', 119, 51, 's-northline', 6, 5.2],
  ['Linen apron', 'Kitchen', 24, 8, 's-cedar', 15, 0.3],
  ['Waffle-weave bath towel', 'Bath', 28, 9, 's-cedar', 20, 0.7],
  ['Bamboo bath mat', 'Bath', 34, 12, 's-cedar', 10, 1.2],
  ['Ceramic soap dispenser', 'Bath', 22, 7, 's-bayview', 14, 0.5],
  ['Shower caddy, stainless', 'Bath', 31, 11, 's-tidyworks', 12, 1.0],
  ['Cotton shower curtain', 'Bath', 36, 13, 's-cedar', 10, 0.9],
  ['Arc floor lamp', 'Lighting', 149, 62, 's-luma', 5, 6.8],
  ['Ceramic table lamp', 'Lighting', 89, 34, 's-luma', 8, 3.4],
  ['Pendant light, brass', 'Lighting', 112, 46, 's-luma', 6, 2.9],
  ['LED strip, 5 m warm white', 'Lighting', 26, 8, 's-luma', 25, 0.3],
  ['Paper lantern, large', 'Lighting', 18, 5, 's-luma', 20, 0.2],
  ['Desk lamp, adjustable', 'Lighting', 58, 22, 's-luma', 10, 1.5],
  ['Wall sconce, matte black', 'Lighting', 74, 29, 's-luma', 8, 1.7],
  ['Terracotta planter, 30 cm', 'Garden', 27, 9, 's-greenfield', 18, 3.9],
  ['Raised garden bed, cedar', 'Garden', 139, 58, 's-greenfield', 5, 14.0],
  ['Watering can, 8 L', 'Garden', 33, 11, 's-greenfield', 12, 1.1],
  ['Garden tool set, 5 piece', 'Garden', 46, 17, 's-greenfield', 10, 2.3],
  ['Herb kit, indoor', 'Garden', 21, 7, 's-greenfield', 20, 0.9],
  ['Outdoor string lights, 10 m', 'Garden', 39, 14, 's-luma', 14, 0.8],
  ['Compost bin, 40 L', 'Garden', 52, 20, 's-greenfield', 8, 4.6],
  ['Bird feeder, hanging', 'Garden', 24, 8, 's-greenfield', 14, 0.7],
  ['Stackable crates, set of 3', 'Storage', 42, 16, 's-tidyworks', 12, 3.1],
  ['Woven basket, large', 'Storage', 35, 12, 's-tidyworks', 14, 0.8],
  ['Shoe rack, 3 tier', 'Storage', 44, 17, 's-tidyworks', 10, 3.4],
  ['Hooks, brass, set of 5', 'Storage', 16, 5, 's-northline', 30, 0.3],
  ['Floating shelf, oak 60 cm', 'Storage', 41, 15, 's-northline', 12, 2.2],
  ['Under-bed boxes, set of 2', 'Storage', 37, 14, 's-tidyworks', 10, 2.4],
  ['Wool throw blanket', 'Decor', 79, 31, 's-cedar', 8, 1.3],
  ['Linen cushion cover, 50 cm', 'Decor', 26, 8, 's-cedar', 20, 0.3],
  ['Stoneware vase, tall', 'Decor', 48, 17, 's-bayview', 10, 1.8],
  ['Framed print, 40 x 50', 'Decor', 57, 21, 's-cedar', 8, 1.6],
  ['Wall mirror, round 60 cm', 'Decor', 96, 38, 's-cedar', 6, 4.2],
  ['Beeswax candle trio', 'Decor', 23, 7, 's-bayview', 24, 0.6],
];

export const PRODUCTS: Product[] = PRODUCT_ROWS.map(([name, category, price, cost, supplierId, reorderPoint, weightKg], index) => ({
  id: `p-${String(index + 1).padStart(2, '0')}`,
  sku: `${category.slice(0, 3).toUpperCase()}-${String(1000 + index * 7)}`,
  name,
  category,
  price,
  cost,
  supplierId,
  reorderPoint,
  reorderQty: Math.max(reorderPoint * 3, 24),
  status: index === 39 ? 'retired' : index === 17 || index === 31 ? 'paused' : 'active',
  weightKg,
  description: `${name}. Stocked in ${category.toLowerCase()} at every store and the warehouse.`,
}));
export const getProduct = (id: string) => PRODUCTS.find((product) => product.id === id);

/** Units on hand per product per location, at the start of the demo day. */
export const INITIAL_STOCK: Record<string, Record<string, number>> = (() => {
  const rand = seeded(7);
  const stock: Record<string, Record<string, number>> = {};
  // A few products are deliberately short so the alerts, reorder and inventory pages have something to say.
  const short = new Map<string, number>([['p-04', 4], ['p-14', 3], ['p-22', 0], ['p-17', 12], ['p-30', 9], ['p-09', 14]]);
  PRODUCTS.forEach((product) => {
    const row: Record<string, number> = {};
    STORES.forEach((store) => (row[store.id] = Math.floor(rand() * (product.price > 100 ? 6 : 14)) + 1));
    row.warehouse = short.get(product.id) ?? Math.round(product.reorderPoint * (1.6 + rand() * 2.4));
    stock[product.id] = row;
  });
  return stock;
})();

/* ---------------- customers ---------------- */

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  position: LngLat;
  segment: 'new' | 'regular' | 'vip';
  joined: string;
  marketing: boolean;
}

const NAMES = ['Ines Duarte', 'Tom Adeyemi', 'Nadia Rahman', 'Yuki Tanaka', 'Omar Haddad', 'Priya Raman', 'Lucas Meyer', 'Amara Okoye', 'Noah Bennett', 'Sofia Rossi', 'Mateo Silva', 'Chloe Dubois', 'Kenji Watanabe', 'Leila Hosseini', 'Ethan Brooks', 'Zainab Khan', 'Oscar Lindgren', 'Maya Patel', 'Diego Herrera', 'Freya Nilsson', 'Jamal Carter', 'Elena Petrova', 'Hugo Martin', 'Aisha Bello', 'Theo Grant', 'Rosa Alvarez', 'Ivan Kovac', 'Grace Kim', 'Felix Wagner', 'Lina Haddad'];
const STREETS: [string, number, number][] = [
  ['Valencia St', 37.7599, -122.4213], ['Hayes St', 37.7762, -122.4262], ['Irving St', 37.7635, -122.4712], ['Chestnut St', 37.8004, -122.4367], ['Folsom St', 37.7785, -122.4056],
  ['Divisadero St', 37.7715, -122.4375], ['Guerrero St', 37.7538, -122.4243], ['Clement St', 37.7826, -122.4642], ['Union St', 37.7982, -122.4298], ['Bryant St', 37.7708, -122.4105], ['Noriega St', 37.7542, -122.4805], ['Fillmore St', 37.7891, -122.4327],
];
export const CUSTOMERS: Customer[] = (() => {
  const rand = seeded(21);
  return NAMES.map((name, index) => {
    const [street, lat, lng] = STREETS[index % STREETS.length];
    const number = 100 + Math.floor(rand() * 1800);
    return {
      id: `c-${String(index + 1).padStart(2, '0')}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`,
      phone: `(415) 555-${String(1000 + Math.floor(rand() * 8999))}`,
      address: `${number} ${street}, San Francisco`,
      position: [lng + (rand() - 0.5) * 0.006, lat + (rand() - 0.5) * 0.004] as LngLat,
      segment: index < 5 ? 'vip' : index > 22 ? 'new' : 'regular',
      joined: `20${index < 5 ? 22 : index < 15 ? 24 : 26}-${String(1 + Math.floor(rand() * 9)).padStart(2, '0')}-${String(1 + Math.floor(rand() * 27)).padStart(2, '0')}`,
      marketing: rand() > 0.3,
    };
  });
})();
export const getCustomer = (id: string) => CUSTOMERS.find((customer) => customer.id === id);

/* ---------------- vehicles and drivers ---------------- */

export interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  vin: string;
  odometerKm: number;
  klass: 'Van' | 'Truck' | 'Pickup';
  /** Where it is in the working day. */
  status: 'on-road' | 'depot' | 'in-shop';
  health: number;
  driverId: string;
  fuelLevel: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleId: string;
  rating: number;
  onTimePercent: number;
  shift: string;
  status: 'on-route' | 'available' | 'off-duty';
}

export const VEHICLES: Vehicle[] = [
  { id: 'v12', name: 'Van 12', make: 'Ford', model: 'Transit 350', year: 2021, plate: '8KTR204', vin: '1FTBW2CM5MKA48213', odometerKm: 148210, klass: 'Van', status: 'on-road', health: 82, driverId: 'd-priya', fuelLevel: 64 },
  { id: 'v07', name: 'Van 07', make: 'Ford', model: 'Transit 250', year: 2022, plate: '7LMN552', vin: '1FTBR1C82NKB19044', odometerKm: 96430, klass: 'Van', status: 'on-road', health: 91, driverId: 'd-diego', fuelLevel: 48 },
  { id: 'v21', name: 'Van 21', make: 'Mercedes', model: 'Sprinter 2500', year: 2019, plate: '6HJP118', vin: 'W1Y4ECHY5KT073350', odometerKm: 231880, klass: 'Van', status: 'in-shop', health: 54, driverId: 'd-lena', fuelLevel: 30 },
  { id: 'v03', name: 'Van 03', make: 'Ram', model: 'ProMaster 2500', year: 2023, plate: '9QRS340', vin: '3C6LRVDG4PE512877', odometerKm: 54120, klass: 'Van', status: 'depot', health: 96, driverId: 'd-mia', fuelLevel: 88 },
  { id: 'v18', name: 'Van 18', make: 'Ford', model: 'Transit 350', year: 2020, plate: '5DFG901', vin: '1FTBW2CM8LKB66120', odometerKm: 187660, klass: 'Van', status: 'on-road', health: 71, driverId: 'd-jon', fuelLevel: 41 },
  { id: 't02', name: 'Truck 02', make: 'Isuzu', model: 'NPR-HD', year: 2020, plate: '4TRK022', vin: 'JALC4W165L7011952', odometerKm: 204350, klass: 'Truck', status: 'on-road', health: 77, driverId: 'd-omar', fuelLevel: 55 },
  { id: 't05', name: 'Truck 05', make: 'Hino', model: '195', year: 2022, plate: '3TRK057', vin: '5PVNJ8JV6N4S30518', odometerKm: 118940, klass: 'Truck', status: 'depot', health: 88, driverId: 'd-sam', fuelLevel: 72 },
  { id: 'p09', name: 'Pickup 09', make: 'Toyota', model: 'Tacoma', year: 2021, plate: '2PKP090', vin: '3TMCZ5AN6MM429981', odometerKm: 88270, klass: 'Pickup', status: 'on-road', health: 93, driverId: 'd-ana', fuelLevel: 59 },
];
export const getVehicle = (id: string) => VEHICLES.find((vehicle) => vehicle.id === id);

export const DRIVERS: Driver[] = [
  { id: 'd-priya', name: 'Priya Nair', phone: '(415) 555-0201', vehicleId: 'v12', rating: 4.9, onTimePercent: 97, shift: '06:00 – 14:00', status: 'on-route' },
  { id: 'd-diego', name: 'Diego Alvarez', phone: '(415) 555-0202', vehicleId: 'v07', rating: 4.8, onTimePercent: 95, shift: '06:00 – 14:00', status: 'on-route' },
  { id: 'd-lena', name: 'Lena Fischer', phone: '(415) 555-0203', vehicleId: 'v21', rating: 4.7, onTimePercent: 92, shift: '06:00 – 14:00', status: 'off-duty' },
  { id: 'd-mia', name: 'Mia Chen', phone: '(415) 555-0204', vehicleId: 'v03', rating: 4.9, onTimePercent: 98, shift: '10:00 – 18:00', status: 'available' },
  { id: 'd-jon', name: 'Jon Berg', phone: '(415) 555-0205', vehicleId: 'v18', rating: 4.5, onTimePercent: 88, shift: '06:00 – 14:00', status: 'on-route' },
  { id: 'd-omar', name: 'Omar Haddad', phone: '(415) 555-0206', vehicleId: 't02', rating: 4.6, onTimePercent: 93, shift: '07:00 – 15:00', status: 'on-route' },
  { id: 'd-sam', name: 'Sam Okafor', phone: '(415) 555-0207', vehicleId: 't05', rating: 4.8, onTimePercent: 96, shift: '10:00 – 18:00', status: 'available' },
  { id: 'd-ana', name: 'Ana Costa', phone: '(415) 555-0208', vehicleId: 'p09', rating: 4.7, onTimePercent: 94, shift: '06:00 – 14:00', status: 'on-route' },
];
export const getDriver = (id: string) => DRIVERS.find((driver) => driver.id === id);

/* ---------------- team (people who use this app) ---------------- */

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Manager' | 'Warehouse' | 'Support' | 'Viewer';
  status: 'active' | 'invited';
  lastActive: string;
}

export const TEAM: TeamMember[] = [
  { id: 'u-nadia', name: 'Nadia Rahman', email: 'nadia@harbor.example', role: 'Owner', status: 'active', lastActive: '2026-09-29T11:14:00Z' },
  { id: 'u-tom', name: 'Tom Adeyemi', email: 'tom@harbor.example', role: 'Admin', status: 'active', lastActive: '2026-09-29T10:52:00Z' },
  { id: 'u-ines', name: 'Ines Duarte', email: 'ines@harbor.example', role: 'Manager', status: 'active', lastActive: '2026-09-29T10:31:00Z' },
  { id: 'u-owen', name: 'Owen Blake', email: 'owen@harbor.example', role: 'Manager', status: 'active', lastActive: '2026-09-28T17:40:00Z' },
  { id: 'u-hana', name: 'Hana Sato', email: 'hana@harbor.example', role: 'Manager', status: 'active', lastActive: '2026-09-29T09:05:00Z' },
  { id: 'u-luca', name: 'Luca Ferrari', email: 'luca@harbor.example', role: 'Manager', status: 'active', lastActive: '2026-09-27T15:12:00Z' },
  { id: 'u-sam', name: 'Sam Okafor', email: 'sam@harbor.example', role: 'Warehouse', status: 'active', lastActive: '2026-09-29T11:02:00Z' },
  { id: 'u-jo', name: 'Jo Martin', email: 'jo@harbor.example', role: 'Support', status: 'active', lastActive: '2026-09-29T08:44:00Z' },
  { id: 'u-rafi', name: 'Rafi Khan', email: 'rafi@harbor.example', role: 'Viewer', status: 'invited', lastActive: '2026-09-25T12:00:00Z' },
];
/** The person using the app in the demo. */
export const CURRENT_USER = TEAM[0];
export const getTeamMember = (id: string) => TEAM.find((member) => member.id === id);
