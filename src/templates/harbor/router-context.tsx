import * as React from 'react';

export interface HarborRouter {
  /** The current path inside Harbor, e.g. "/orders/o-1042". */
  path: string;
  /** The prefix links need, e.g. "/t/harbor". */
  base: string;
  /** Go to a path inside Harbor. */
  navigate: (path: string) => void;
  /** A real href for a Harbor path, so links open in a new tab: href={href('/orders')}. */
  href: (path: string) => string;
}

const RouterContext = React.createContext<HarborRouter | null>(null);
export const HarborRouterProvider = RouterContext.Provider;

/** The router from anywhere in a page: `const { navigate, href } = useHarborRouter()`. */
export function useHarborRouter(): HarborRouter {
  const router = React.useContext(RouterContext);
  if (!router) throw new Error('useHarborRouter needs the Harbor shell above it.');
  return router;
}
