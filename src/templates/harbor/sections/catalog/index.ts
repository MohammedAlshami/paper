import * as React from 'react';
import type { HarborRoute, HarborSection } from '../../types';
import { CATALOG_PAGES } from './pages';
import { Inventory } from './pages/Inventory';
import { ProductDetail } from './pages/ProductDetail';
import { Products } from './pages/Products';
import { Purchasing } from './pages/Purchasing';
import { Suppliers } from './pages/Suppliers';

const routes: HarborRoute[] = [
  { path: '/products', render: () => React.createElement(Products) },
  { path: '/products/:id', render: ({ params }) => React.createElement(ProductDetail, { id: params.id }) },
  { path: '/inventory', render: () => React.createElement(Inventory) },
  { path: '/purchasing', render: () => React.createElement(Purchasing) },
  { path: '/suppliers', render: () => React.createElement(Suppliers) },
];

/** The catalog and stock section of Harbor: its pages and routes. */
export const CATALOG: HarborSection = { pages: CATALOG_PAGES, routes };
