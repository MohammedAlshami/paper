import type * as React from 'react';
import type { TemplatePage } from '../types';

/** What a page's render function gets. */
export interface HarborContext {
  /** Path params, e.g. { id: 'o-1042' } for /orders/:id. */
  params: Record<string, string>;
  /** Go to a path inside Harbor, e.g. navigate('/orders/o-1042'). */
  navigate: (path: string) => void;
  /** The prefix links need: href={`${base}/orders`}. */
  base: string;
}

export interface HarborRoute {
  path: string;
  render: (context: HarborContext) => React.ReactNode;
}

/** What each section of the app exports from its index.ts. */
export interface HarborSection {
  pages: TemplatePage[];
  routes: HarborRoute[];
}
