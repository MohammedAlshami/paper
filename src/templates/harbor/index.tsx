import * as React from 'react';
import { Compass } from 'lucide-react';
import { EmptyState } from '@/components/app/empty-state';
import { ToastProvider } from '@/components/app/toast';
import { resolveRoute } from '../router';
import type { TemplateProps } from '../types';
import { HarborPage } from './layout';
import { activeIdFor } from './nav';
import { HarborRouterProvider } from './router-context';
import { CATALOG } from './sections/catalog';
import { DELIVERY } from './sections/delivery';
import { FLEET } from './sections/fleet';
import { INSIGHT } from './sections/insight';
import { OPERATIONS } from './sections/operations';
import { HarborShell } from './shell';
import { HarborProvider } from './state';

/**
 * Order matters: a literal path such as "/products/new" must come before "/products/:id". Each section keeps its own
 * order; sections are joined in nav order, and no two sections share a first path segment.
 */
const ROUTES = [...OPERATIONS.routes, ...DELIVERY.routes, ...CATALOG.routes, ...FLEET.routes, ...INSIGHT.routes];

function NotFound({ path, navigate }: { path: string; navigate: (path: string) => void }) {
  return (
    <HarborPage title="Page not found" description={<span className="font-mono text-sm">{path}</span>}>
      <EmptyState icon={Compass} title="Nothing lives here" description="This page does not exist in Harbor, or it is still being built. Use the sidebar or press Ctrl K to jump somewhere." action={{ label: 'Back to the overview', onClick: () => navigate('/') }} />
    </HarborPage>
  );
}

/** Harbor — a retailer's back-office. Everything is inside one app, so there is no landing page or sign-up. */
export default function Harbor({ path, navigate, base }: TemplateProps) {
  const match = resolveRoute(ROUTES, path);
  const router = React.useMemo(() => ({ path, base, navigate, href: (to: string) => `${base}${to === '/' ? '' : to}` }), [path, base, navigate]);

  // A new page starts at the top of the scrolling area.
  React.useEffect(() => {
    document.querySelector('main')?.scrollTo({ top: 0 });
  }, [path]);

  return (
    <ToastProvider>
      <HarborProvider>
        <HarborRouterProvider value={router}>
          <HarborShell activeId={activeIdFor(path)}>
            {match ? <React.Fragment key={path}>{match.route.render({ params: match.params, navigate, base })}</React.Fragment> : <NotFound path={path} navigate={navigate} />}
          </HarborShell>
        </HarborRouterProvider>
      </HarborProvider>
    </ToastProvider>
  );
}
