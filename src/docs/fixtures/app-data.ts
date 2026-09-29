import { CreditCard, DollarSign, Repeat, Users } from 'lucide-react';
import type { ActivityItem } from '@/components/app/activity-feed';
import type { RevenuePoint } from '@/components/app/revenue-chart';
import type { Stat } from '@/components/app/stat-card-grid';

/**
 * Demo data for the "Data and dashboards" components. Everything here is invented: the customers, figures and
 * dates belong to an imaginary product, and "today" is 29 Sep 2026.
 */
export const APP_TODAY = '2026-09-29';

export interface DemoCustomer {
  id: string;
  name: string;
  email: string;
  plan: 'Free' | 'Pro' | 'Business';
  status: 'Active' | 'Trialing' | 'Past due' | 'Cancelled';
  mrr: number;
  country: string;
  joined: string;
}

export const CUSTOMERS: DemoCustomer[] = [
  { id: 'c01', name: 'Amara Okonkwo', email: 'amara@northwind.example', plan: 'Business', status: 'Active', mrr: 480, country: 'Nigeria', joined: '2024-02-11' },
  { id: 'c02', name: 'Lucas Ferreira', email: 'lucas@brightside.example', plan: 'Pro', status: 'Active', mrr: 79, country: 'Brazil', joined: '2024-05-03' },
  { id: 'c03', name: 'Hannah Weiss', email: 'hannah@kestrel.example', plan: 'Business', status: 'Past due', mrr: 480, country: 'Germany', joined: '2023-11-19' },
  { id: 'c04', name: 'Ravi Menon', email: 'ravi@lumen.example', plan: 'Pro', status: 'Trialing', mrr: 0, country: 'India', joined: '2026-09-18' },
  { id: 'c05', name: 'Sofia Rossi', email: 'sofia@tramonto.example', plan: 'Pro', status: 'Active', mrr: 79, country: 'Italy', joined: '2025-01-27' },
  { id: 'c06', name: 'Tomasz Nowak', email: 'tomasz@vistula.example', plan: 'Free', status: 'Active', mrr: 0, country: 'Poland', joined: '2025-08-14' },
  { id: 'c07', name: 'Yuki Tanaka', email: 'yuki@harbor.example', plan: 'Business', status: 'Active', mrr: 480, country: 'Japan', joined: '2024-09-02' },
  { id: 'c08', name: 'Marcus Bell', email: 'marcus@fieldnote.example', plan: 'Pro', status: 'Cancelled', mrr: 0, country: 'United States', joined: '2024-03-22' },
  { id: 'c09', name: 'Elena Petrova', email: 'elena@birch.example', plan: 'Pro', status: 'Active', mrr: 79, country: 'Bulgaria', joined: '2025-04-09' },
  { id: 'c10', name: 'Daniel Osei', email: 'daniel@goldcoast.example', plan: 'Business', status: 'Active', mrr: 480, country: 'Ghana', joined: '2023-08-30' },
  { id: 'c11', name: 'Chloe Martin', email: 'chloe@atelier.example', plan: 'Pro', status: 'Trialing', mrr: 0, country: 'France', joined: '2026-09-22' },
  { id: 'c12', name: 'Ibrahim Yilmaz', email: 'ibrahim@bosphorus.example', plan: 'Pro', status: 'Active', mrr: 79, country: 'Turkey', joined: '2025-06-16' },
  { id: 'c13', name: 'Grace Lindqvist', email: 'grace@fjord.example', plan: 'Free', status: 'Active', mrr: 0, country: 'Sweden', joined: '2026-01-05' },
  { id: 'c14', name: 'Mateo Vargas', email: 'mateo@andes.example', plan: 'Business', status: 'Past due', mrr: 480, country: 'Chile', joined: '2024-12-12' },
  { id: 'c15', name: 'Nora Haddad', email: 'nora@cedar.example', plan: 'Pro', status: 'Active', mrr: 79, country: 'Lebanon', joined: '2025-10-08' },
  { id: 'c16', name: 'Oliver Grant', email: 'oliver@tidewater.example', plan: 'Pro', status: 'Cancelled', mrr: 0, country: 'Australia', joined: '2024-07-25' },
  { id: 'c17', name: 'Priya Desai', email: 'priya@saffron.example', plan: 'Business', status: 'Active', mrr: 480, country: 'India', joined: '2025-02-18' },
  { id: 'c18', name: 'Jonas Becker', email: 'jonas@ostsee.example', plan: 'Free', status: 'Active', mrr: 0, country: 'Germany', joined: '2026-06-30' },
  { id: 'c19', name: 'Fatima Zahra', email: 'fatima@atlas.example', plan: 'Pro', status: 'Active', mrr: 79, country: 'Morocco', joined: '2025-11-21' },
  { id: 'c20', name: 'Liam Doyle', email: 'liam@corrib.example', plan: 'Pro', status: 'Trialing', mrr: 0, country: 'Ireland', joined: '2026-09-25' },
];

export const CUSTOMER_STATUSES = ['Active', 'Trialing', 'Past due', 'Cancelled'].map((value) => ({ value, label: value }));

const NORTHWIND = CUSTOMERS[0];

/** The record shown in the detail sheet. */
export const CUSTOMER_RECORD = {
  title: NORTHWIND.name,
  subtitle: NORTHWIND.email,
  status: { label: 'Active', tone: 'default' as const },
  fields: [
    { label: 'Customer id', value: 'cus_8Hq2mVx41', mono: true },
    { label: 'Plan', value: 'Business, billed yearly' },
    { label: 'Monthly revenue', value: '$480.00', mono: true },
    { label: 'Country', value: NORTHWIND.country },
    { label: 'Seats', value: '18 of 25', mono: true },
    { label: 'Customer since', value: '11 Feb 2024' },
    { label: 'Next invoice', value: '1 Nov 2026' },
  ],
};

export const CUSTOMER_EVENTS = [
  { id: 'e1', text: 'Added 3 seats', when: '2 days ago' },
  { id: 'e2', text: 'Invoice INV-2071 paid', when: '9 days ago' },
  { id: 'e3', text: 'Switched to yearly billing', when: '3 months ago' },
];

export const STATS: Stat[] = [
  { id: 'mrr', label: 'Monthly recurring revenue', value: '$48,210', icon: DollarSign, delta: 6.4, goodWhen: 'up', trend: [30, 32, 31, 35, 38, 37, 41, 44, 46, 48] },
  { id: 'customers', label: 'Active customers', value: '1,284', icon: Users, delta: 3.1, goodWhen: 'up', trend: [90, 92, 95, 97, 96, 99, 103, 105, 107, 110] },
  { id: 'churn', label: 'Churn', value: '2.4%', icon: Repeat, delta: 0.6, goodWhen: 'down', trend: [1.8, 1.9, 1.7, 2, 2.1, 2, 2.2, 2.3, 2.3, 2.4] },
  { id: 'arpu', label: 'Average per customer', value: '$37.55', icon: CreditCard, delta: 0, goodWhen: 'up', trend: [36, 37, 37, 38, 37, 38, 38, 37, 38, 38] },
];

const at = (day: string, time: string) => `${day}T${time}:00Z`;

export const ACTIVITY: ActivityItem[] = [
  { id: 'a1', actor: { name: 'Amara Okonkwo' }, action: 'upgraded', subject: 'Northwind to Business', at: at('2026-09-29', '09:42') },
  { id: 'a2', actor: { name: 'Ravi Menon' }, action: 'started a trial of', subject: 'Pro', at: at('2026-09-29', '08:15') },
  { id: 'a3', actor: { name: 'Hannah Weiss' }, action: 'commented on', subject: 'Invoice INV-2094', detail: 'The card on file expired, sending a new one today.', at: at('2026-09-28', '17:30') },
  { id: 'a4', actor: { name: 'Sofia Rossi' }, action: 'added 2 seats to', subject: 'Tramonto', at: at('2026-09-28', '14:05') },
  { id: 'a5', actor: { name: 'Marcus Bell' }, action: 'cancelled', subject: 'Fieldnote', detail: 'Moving the team to a tool their parent company already pays for.', at: at('2026-09-28', '10:21') },
  { id: 'a6', actor: { name: 'Yuki Tanaka' }, action: 'paid', subject: 'Invoice INV-2091', at: at('2026-09-27', '16:48') },
  { id: 'a7', actor: { name: 'Daniel Osei' }, action: 'invited 4 people to', subject: 'Gold Coast', at: at('2026-09-27', '11:03') },
  { id: 'a8', actor: { name: 'Chloe Martin' }, action: 'started a trial of', subject: 'Pro', at: at('2026-09-26', '13:37') },
  { id: 'a9', actor: { name: 'Mateo Vargas' }, action: 'missed a payment for', subject: 'Andes', at: at('2026-09-26', '06:00') },
  { id: 'a10', actor: { name: 'Priya Desai' }, action: 'renewed', subject: 'Saffron for a year', at: at('2026-09-25', '15:12') },
];

/** A deterministic small random number generator, so the chart is the same on every render. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** 400 days of daily revenue ending on APP_TODAY: a slow climb, a weekly dip, and some noise. */
export const REVENUE: RevenuePoint[] = (() => {
  const random = seeded(7);
  const end = Date.parse(APP_TODAY);
  return Array.from({ length: 400 }, (_, index) => {
    const date = new Date(end - (399 - index) * 86_400_000);
    const weekday = date.getUTCDay();
    const base = 1100 + index * 3.2;
    const weekly = weekday === 0 || weekday === 6 ? 0.62 : 1;
    return { date: date.toISOString().slice(0, 10), value: Math.round(base * weekly * (0.88 + random() * 0.24)) };
  });
})();
