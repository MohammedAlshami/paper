import * as React from 'react';
import type { HarborSection } from '../../types';
import { DELIVERY_PAGES } from './pages';
import { DispatchPage } from './pages/dispatch';
import { DriversPage } from './pages/drivers';
import { LiveMapPage } from './pages/live-map';
import { RoutesPage } from './pages/routes';
import { ZonesPage } from './pages/zones';

/** The delivery section of Harbor: its pages and routes. */
export const DELIVERY: HarborSection = {
  pages: DELIVERY_PAGES,
  routes: [
    { path: '/live-map', render: () => React.createElement(LiveMapPage) },
    { path: '/dispatch', render: () => React.createElement(DispatchPage) },
    { path: '/routes', render: () => React.createElement(RoutesPage) },
    { path: '/drivers', render: () => React.createElement(DriversPage) },
    { path: '/zones', render: () => React.createElement(ZonesPage) },
  ],
};
