import { COURIER_PAGES } from './courier/pages';
import { GARAGE_PAGES } from './garage/pages';
import { HARBOR_PAGES } from './harbor/pages';
import { LEDGER_PAGES } from './ledger/pages';
import type { TemplateEntry } from './types';

/**
 * The templates. Each one is a small sub-project in its own folder, built only from components in
 * src/components (ui, maps, fleet, app). `pages` lists its routes and the components each page uses.
 */
export const TEMPLATES: TemplateEntry[] = [
  {
    id: 'courier',
    name: 'Courier',
    tagline: 'A last-mile delivery platform: tracking for customers, a console for dispatchers.',
    description:
      'Two products in one project. Customers get a public tracking page and a checkout address step; dispatchers get an app with a live board, route planning and coverage analytics. It shows how the map components share one layer across a public site and an admin app.',
    families: ['maps', 'app'],
    pages: COURIER_PAGES,
    load: () => import('./courier'),
  },
  {
    id: 'garage',
    name: 'Garage',
    tagline: 'A fleet maintenance app: vehicles, work orders, scheduling, parts and costs.',
    description:
      'The daily tool for a fleet manager or workshop. A dashboard of what is due, a vehicle list and detail page, a work order board, a maintenance planner, parts inventory with reordering, and cost reports. Around 25 of the fleet components in real page compositions.',
    families: ['fleet', 'app'],
    pages: GARAGE_PAGES,
    load: () => import('./garage'),
  },
  {
    id: 'ledger',
    name: 'Ledger',
    tagline: 'A SaaS starter: marketing site, sign-up, billing, teams and settings.',
    description:
      'The generic pieces most products need. A landing page with pricing and FAQ, the auth flow, an overview dashboard, customers, billing with plan and invoices, team management and account settings.',
    families: ['app'],
    pages: LEDGER_PAGES,
    load: () => import('./ledger'),
  },
  {
    id: 'harbor',
    name: 'Harbor',
    tagline: 'A retailer back-office: orders, delivery, stock, the van fleet and the numbers, in one app.',
    description:
      'The biggest template, and the one that uses all three families at once. A retailer with stores, a warehouse and its own delivery vans runs the day from here: orders are picked, packed and delivered, stock is reordered, vans are serviced. One shared data set links an order to its customer, its products and the van that carried it. There is no landing page and no sign-up, only the app.',
    families: ['maps', 'fleet', 'app'],
    pages: HARBOR_PAGES,
    load: () => import('./harbor'),
  },
];

export const getTemplate = (id: string) => TEMPLATES.find((template) => template.id === id);
