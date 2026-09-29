'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ApiTable,
  Code,
  CodeBlock,
  Demo,
  GhostButton,
  InstallBlock,
  Link,
  MdH1,
  MdH2,
  MdH3,
  MdLi,
  MdP,
  MdUl,
  Subtitle,
  SubtitleLink,
} from './md';
import { COMPONENTS, getComponent, type ComponentEntry } from './registry';
import { loadSource, localImportFiles } from './source';
import { getTemplate, TEMPLATES } from '@/templates/registry';
import type { TemplateEntry, TemplateProps } from '@/templates/types';

/* ============================================================================
   navigation
   ========================================================================== */

type NavItem = { id: string; label: string; href: string; external?: boolean };
type NavGroup = { heading: string; items: NavItem[] };

/** Sidebar grouping for components. */
const SIDEBAR_COMPONENT_GROUPS: { heading: string; ids: string[] }[] = [
  { heading: 'Tracking and delivery', ids: ['delivery-tracker-card', 'order-route-mini', 'driver-arriving-sheet', 'shipment-journey', 'proof-of-delivery'] },
  { heading: 'Store and place discovery', ids: ['store-locator', 'place-card', 'nearby-list', 'branch-directory', 'event-venue-card'] },
  { heading: 'Location pickers and forms', ids: ['address-picker', 'service-area-checker', 'pickup-point-selector', 'location-badge', 'map-coordinates-input'] },
  { heading: 'Fleet and operations', ids: ['fleet-overview', 'vehicle-detail-panel', 'dispatch-board', 'route-optimizer-result', 'geofence-alert-feed'] },
  { heading: 'Data visualisation', ids: ['region-choropleth', 'origin-destination-flow', 'heatmap-card', 'coverage-map', 'trip-replay'] },
  { heading: 'Travel and real estate', ids: ['trip-summary-card', 'itinerary-map', 'property-map-card', 'commute-calculator', 'weather-alert-map'] },
  { heading: 'Vehicle health and records', ids: ['vehicle-health-card', 'vehicle-spec-sheet', 'vehicle-timeline', 'diagnostic-code-list', 'document-expiry-tracker'] },
  { heading: 'Maintenance scheduling', ids: ['service-due-list', 'maintenance-calendar', 'pm-schedule-builder', 'service-interval-gauge', 'downtime-forecast'] },
  { heading: 'Work orders and repairs', ids: ['work-order-card', 'work-order-board', 'inspection-checklist', 'defect-report-form', 'repair-estimate-table'] },
  { heading: 'Parts and inventory', ids: ['parts-inventory-table', 'stock-level-bar', 'reorder-suggestions', 'parts-usage-chart', 'part-detail-panel', 'purchase-order-card'] },
  { heading: 'Tyres, fuel and fluids', ids: ['tire-status-grid', 'fuel-economy-trend', 'fluids-battery-panel', 'fuel-transaction-list'] },
  { heading: 'Fleet costs and stats', ids: ['fleet-kpi-strip', 'cost-breakdown-chart', 'utilization-grid', 'vehicle-leaderboard', 'replacement-planner'] },
  { heading: 'Layout and navigation', ids: ['app-shell', 'page-header', 'settings-layout', 'command-palette', 'notifications-popover', 'empty-state', 'step-indicator', 'page-tabs'] },
  { heading: 'Authentication and account', ids: ['auth-card', 'login-form', 'register-form', 'forgot-password-form', 'verify-code-form', 'profile-form', 'notification-preferences', 'api-key-list', 'danger-zone-card'] },
  { heading: 'Data and dashboards', ids: ['data-table', 'filter-bar', 'date-range-picker', 'kanban-board', 'timeline', 'roster-grid', 'bulk-action-bar', 'stat-card-grid', 'activity-feed', 'revenue-chart', 'record-detail-sheet', 'share-bar-list', 'metric-leaderboard'] },
  { heading: 'Forms and feedback', ids: ['multi-select', 'file-upload', 'confirm-dialog', 'toast', 'inline-edit', 'stock-adjust-dialog'] },
  { heading: 'Billing and teams', ids: ['pricing-table', 'plan-usage-card', 'invoice-list', 'payment-method-card', 'team-members'] },
  { heading: 'Marketing pages', ids: ['site-header', 'hero-section', 'feature-grid', 'faq-list', 'testimonial-grid', 'cta-banner', 'site-footer'] },
];

const COMPONENT_NAV_GROUPS: NavGroup[] = SIDEBAR_COMPONENT_GROUPS.map(({ heading, ids }) => ({
  heading,
  items: ids.flatMap((id) => {
    const entry = COMPONENTS.find((component) => component.id === id);
    return entry ? [{ id: entry.id, label: entry.name, href: `/components/${entry.id}` }] : [];
  }),
}));

const NAV: NavGroup[] = [
  {
    heading: 'Overview',
    items: [
      { id: 'quick-start', label: 'Quick start', href: '/quick-start' },
      { id: 'installation', label: 'Installation', href: '/installation' },
      { id: 'components', label: 'All components', href: '/components' },
      { id: 'templates', label: 'Templates', href: '/templates' },
      { id: 'mcp', label: 'Use with AI (MCP)', href: '/mcp/doc' },
    ],
  },
  {
    heading: 'Handbook',
    items: [
      { id: 'styling', label: 'Styling', href: '/styling' },
      { id: 'composition', label: 'Composition', href: '/composition' },
      { id: 'typescript', label: 'TypeScript', href: '/typescript' },
    ],
  },
  ...COMPONENT_NAV_GROUPS,
];

const REPO = 'https://github.com/MohammedAlshami/paper';

/**
 * The live previews pull in MapLibre or Recharts plus every component, so they load on demand, one chunk per
 * family: the docs shell and the components grid never pay for them, and a fleet page never downloads MapLibre.
 */
type Family = 'maps' | 'fleet' | 'app';
type PreviewModule = { PREVIEWS: Record<string, React.ReactNode>; EXAMPLES: Record<string, { label: string; node: React.ReactNode }[]> };
const previewCache: Partial<Record<Family, PreviewModule>> = {};

const familyOf = (file: string): Family => (file.startsWith('components/fleet/') ? 'fleet' : file.startsWith('components/app/') ? 'app' : 'maps');

function loadPreviews(family: Family): Promise<PreviewModule> {
  if (family === 'app') return import('./previews-app').then((loaded) => ({ PREVIEWS: loaded.APP_PREVIEWS, EXAMPLES: loaded.APP_EXAMPLES }));
  return family === 'fleet'
    ? import('./previews-fleet').then((loaded) => ({ PREVIEWS: loaded.FLEET_PREVIEWS, EXAMPLES: loaded.FLEET_EXAMPLES }))
    : import('./previews').then((loaded) => ({ PREVIEWS: loaded.PREVIEWS, EXAMPLES: loaded.EXAMPLES }));
}

function usePreviews(family: Family = 'maps') {
  const [module, setModule] = React.useState<PreviewModule | null>(previewCache[family] ?? null);
  React.useEffect(() => {
    if (previewCache[family]) return setModule(previewCache[family]);
    let live = true;
    setModule(null);
    void loadPreviews(family).then((loaded) => {
      previewCache[family] = loaded;
      if (live) setModule(loaded);
    });
    return () => {
      live = false;
    };
  }, [family]);
  return module;
}

/** A component's source text, or null while it loads. */
function useSource(file: string) {
  const [source, setSource] = React.useState<string | null>(null);
  React.useEffect(() => {
    let live = true;
    setSource(null);
    void loadSource(file).then((text) => live && setSource(text));
    return () => {
      live = false;
    };
  }, [file]);
  return source;
}

function PreviewFallback() {
  return (
    <div className="flex min-h-40 w-full items-center justify-center text-sm text-muted-foreground" role="status">
      Loading preview
    </div>
  );
}


/* ============================================================================
   routing — real paths (pushState), not hash fragments

   Any click on an internal <a href="/..."> is intercepted and turned into a
   pushState navigation; hash fragments (#main-content, #some-heading) are left
   alone since those are same-page anchors, not routes.
   ========================================================================== */

function normalizeRoute(pathname: string) {
  return pathname.replace(/^\/+|\/+$/g, '');
}

function useRouter() {
  const read = () => (typeof window === 'undefined' ? '' : normalizeRoute(window.location.pathname));
  const [route, setRoute] = React.useState(read);

  const navigate = React.useCallback((href: string) => {
    const path = href.startsWith('/') ? href : `/${href}`;
    if (path !== window.location.pathname) {
      window.history.pushState(null, '', path);
    }
    setRoute(normalizeRoute(path));
    window.scrollTo({ top: 0 });
  }, []);

  React.useEffect(() => {
    const onPopState = () => {
      setRoute(read());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('popstate', onPopState);

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest?.('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('/') || href.startsWith('//')) return;
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      event.preventDefault();
      navigate(href);
    };
    document.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('popstate', onPopState);
      document.removeEventListener('click', onClick);
    };
  }, [navigate]);

  return { route, navigate };
}

function useActiveAnchor() {
  const [active, setActive] = React.useState('');
  React.useEffect(() => {
    const ids = Array.from(document.querySelectorAll<HTMLElement>('.QuickNavContent [id]')).map((el) => el.id);
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: '-72px 0px -70% 0px' },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  return active;
}

/* ============================================================================
   chrome
   ========================================================================== */

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M8 0C3.58 0 0 3.67 0 8.2c0 3.63 2.29 6.7 5.47 7.78.4.07.55-.17.55-.39 0-.19-.01-.84-.01-1.53-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.16-.28-.15-.68-.53-.01-.54.63-.01 1.08.59 1.23.84.72 1.24 1.87.89 2.33.68.07-.53.28-.89.51-1.1-1.78-.2-3.64-.91-3.64-4.05 0-.89.31-1.63.82-2.2-.08-.21-.36-1.05.08-2.17 0 0 .67-.22 2.2.84.64-.18 1.32-.28 2-.28s1.36.09 2 .28c1.53-1.07 2.2-.84 2.2-.84.44 1.13.16 1.97.08 2.17.51.57.82 1.3.82 2.2 0 3.15-1.87 3.84-3.65 4.05.29.26.54.75.54 1.52 0 1.1-.01 1.98-.01 2.26 0 .22.15.47.55.39C13.71 14.9 16 11.82 16 8.2 16 3.67 12.42 0 8 0" />
    </svg>
  );
}

const HEADER_LINKS = [
  { label: 'Quick start', href: '/quick-start' },
  { label: 'Components', href: '/components' },
  { label: 'Templates', href: '/templates' },
];

function MobileMenu({ route }: { route: string }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(false), [route]);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
        className="flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
          {open ? <path d="M4 4l10 10M14 4L4 14" /> : <path d="M3 5h12M3 9h12M3 13h12" />}
        </svg>
      </button>
      {open ? (
        <nav
          id="mobile-menu"
          aria-label="Site"
          className="fixed inset-x-0 bottom-0 top-[var(--header-height)] z-40 overflow-y-auto bg-background px-4 pb-10 pt-2"
        >
          {NAV.map((group) => (
            <div key={group.heading} className="py-3">
              <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">{group.heading}</p>
              <ul>
                {group.items.map((item) => {
                  const active = route === item.href.slice(1);
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn('block rounded-md px-2 py-2.5 text-[15px]', active ? 'bg-muted font-medium text-foreground' : 'text-foreground/80')}
                      >
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <div className="mt-2 border-t pt-4">
            <a href={REPO} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md px-2 py-2.5 text-[15px] text-foreground/80">
              <GitHubMark /> GitHub
            </a>
          </div>
        </nav>
      ) : null}
    </div>
  );
}

function Header({ route, onSearch }: { route: string; onSearch: () => void }) {
  return (
    <header className="Header">
      <div className="HeaderInner">
        <a className="SkipNav" href="#main-content">
          Skip to contents
        </a>
        <div className="flex items-center gap-3 md:gap-8">
          <MobileMenu route={route} />
          <a className="HeaderLogoLink flex items-center gap-2" aria-label="Go to the homepage" href="/">
            <svg width="20" height="18" viewBox="0 0 20 18" fill="currentColor" aria-hidden>
              <rect x="0" y="0" width="20" height="3" rx="1.5" />
              <rect x="0" y="7" width="13" height="3" rx="1.5" />
              <rect x="0" y="14" width="7" height="3" rx="1.5" />
            </svg>
            <span className="hidden text-sm font-medium text-foreground sm:inline">Paper</span>
          </a>
          <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
            {HEADER_LINKS.map((link) => {
              const active = route === link.href.slice(1) || route.startsWith(`${link.href.slice(1)}/`);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={cn('text-sm transition-colors hover:text-foreground', active ? 'font-medium text-foreground' : 'text-muted-foreground')}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <div className="HeaderSearch">
            <button type="button" className="SearchTrigger HeaderSearchDesktopTrigger" onClick={onSearch}>
              Search
              <span className="SearchTriggerShortcut">
                (<kbd>⌘</kbd>
                <kbd>k</kbd>)
              </span>
            </button>
            <button type="button" className="SearchTrigger HeaderSearchMobileTrigger" onClick={onSearch}>
              Search
            </button>
          </div>
          <a
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <GitHubMark /> GitHub
          </a>
        </div>
      </div>
    </header>
  );
}

function SearchDialog({ open, onClose, onNavigate }: { open: boolean; onClose: () => void; onNavigate: (href: string) => void }) {
  const [query, setQuery] = React.useState('');
  const input = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setQuery('');
      window.setTimeout(() => input.current?.focus(), 20);
    }
  }, [open]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!open) return null;

  const results = NAV.flatMap((group) => group.items.map((item) => ({ ...item, heading: group.heading }))).filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div
      onMouseDown={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'var(--blackA-2)',
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '10vh',
      }}
    >
      <div
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          width: 'min(32rem, calc(100vw - 2rem))',
          height: 'fit-content',
          background: 'var(--color-popup)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-12)',
          boxShadow: 'var(--shadow-4)',
          overflow: 'hidden',
        }}
      >
        <input
          ref={input}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search the docs"
          style={{
            width: '100%',
            height: '3rem',
            paddingInline: '1rem',
            border: 0,
            borderBottom: '1px solid var(--color-border)',
            outline: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--font-size-15)',
            background: 'transparent',
            color: 'var(--color-foreground)',
          }}
        />
        <ul style={{ listStyle: 'none', margin: 0, padding: '.5rem', maxHeight: '20rem', overflowY: 'auto' }}>
          {results.map((item) => (
            <li key={item.href}>
              <button
                type="button"
                onClick={() => {
                  onNavigate(item.href);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  padding: '.5rem .625rem',
                  border: 0,
                  background: 'transparent',
                  borderRadius: 'var(--radius-6)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--font-size-14)',
                  color: 'var(--color-foreground)',
                  cursor: 'default',
                  textAlign: 'left',
                }}
              >
                {item.label}
                <span style={{ color: 'var(--gray-t1)', fontSize: 'var(--font-size-13)' }}>{item.heading}</span>
              </button>
            </li>
          ))}
          {!results.length ? (
            <li style={{ padding: '.75rem', color: 'var(--gray-t1)', fontSize: 'var(--font-size-14)' }}>No matches.</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

function SideNav({ route }: { route: string }) {
  return (
    <nav aria-label="Main navigation" className="SideNavRoot">
      <div className="SideNavViewport" data-side-nav-viewport="true" style={{ overflowY: 'auto' }}>
        {NAV.map((group) => (
          <div className="SideNavSection" key={group.heading}>
            <div className="SideNavHeading">{group.heading}</div>
            <ul className="SideNavList">
              {group.items.map((item) => (
                <li className="SideNavItem" key={item.href}>
                  <a
                    className="SideNavLink"
                    href={item.href}
                    aria-current={route === item.id ? 'true' : undefined}
                    data-active={route === item.id ? 'true' : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <hr className="SideNavSeparator" />
        <div className="SideNavSection">
          <ul className="SideNavList">
            <li className="SideNavItem">
              <a className="SideNavLink" href={REPO} target="_blank" rel="noopener noreferrer">
                <div className="SideNavLinkIconContainer">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                    <path d="M8 0C3.58 0 0 3.67 0 8.2c0 3.63 2.29 6.7 5.47 7.78.4.07.55-.17.55-.39 0-.19-.01-.84-.01-1.53-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.16-.28-.15-.68-.53-.01-.54.63-.01 1.08.59 1.23.84.72 1.24 1.87.89 2.33.68.07-.53.28-.89.51-1.1-1.78-.2-3.64-.91-3.64-4.05 0-.89.31-1.63.82-2.2-.08-.21-.36-1.05.08-2.17 0 0 .67-.22 2.2.84.64-.18 1.32-.28 2-.28s1.36.09 2 .28c1.53-1.07 2.2-.84 2.2-.84.44 1.13.16 1.97.08 2.17.51.57.82 1.3.82 2.2 0 3.15-1.87 3.84-3.65 4.05.29.26.54.75.54 1.52 0 1.1-.01 1.98-.01 2.26 0 .22.15.47.55.39C13.71 14.9 16 11.82 16 8.2 16 3.67 12.42 0 8 0" />
                  </svg>
                  GitHub
                </div>
              </a>
            </li>
            <li className="SideNavItem">
              <a className="SideNavLink" href={`${REPO}/releases`} target="_blank" rel="noopener noreferrer">
                <div className="SideNavLinkIconContainer">
                  <svg fill="currentColor" width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                    <rect width="16" height="16" fill="black" />
                    <rect x="3" y="3" width="10" height="10" fill="white" />
                    <path d="M8 5H11V13H8V5Z" fill="black" />
                  </svg>
                  <span>
                    releases
                    <span className="SideNavVersion">0.1.0</span>
                  </span>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

type QuickNavItem = { id: string; label: string; children?: QuickNavItem[] };

function QuickNav({ title, items }: { title: string; items: QuickNavItem[] }) {
  const active = useActiveAnchor();
  return (
    <div className="QuickNavContainer">
      <nav aria-label="On this page" className="QuickNavRoot">
        <div className="QuickNavInner">
          <div className="QuickNavViewport" style={{ overflowY: 'auto' }}>
            <header className="bui-sr-only">{title}</header>
            <ul className="QuickNavList">
              <li className="QuickNavItem">
                <a className="QuickNavLink" href="#">
                  (Top)
                </a>
              </li>
              {items.map((item) => (
                <li className="QuickNavItem" key={item.id}>
                  <a
                    className="QuickNavLink"
                    href={`#${item.id}`}
                    aria-current={active === item.id ? 'true' : undefined}
                    style={active === item.id ? { color: 'var(--gray-t2)' } : undefined}
                  >
                    {item.label}
                  </a>
                  {item.children?.length ? (
                    <ul className="QuickNavList">
                      {item.children.map((child) => (
                        <li className="QuickNavItem" key={child.id}>
                          <a
                            className="QuickNavLink"
                            href={`#${child.id}`}
                            style={active === child.id ? { color: 'var(--gray-t2)' } : undefined}
                          >
                            {child.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

/* ============================================================================
   pages
   ========================================================================== */

function QuickStartPage() {
  const tracker = getComponent('delivery-tracker-card');
  const previews = usePreviews();
  return (
    <>
      <MdH1 id="quick-start">Quick start</MdH1>
      <Subtitle
        links={
          <SubtitleLink href={`${REPO}#readme`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M14.85 12.92H1.15A1.15 1.15 0 0 1 0 11.77V4.23a1.15 1.15 0 0 1 1.15-1.15h13.7a1.15 1.15 0 0 1 1.15 1.15v7.54a1.15 1.15 0 0 1-1.15 1.15M3.85 10.62V7.61l1.54 1.93 1.53-1.93v3h1.54V5.39H6.92l-1.53 1.92-1.54-1.92H2.31v5.23zm10.3-2.62H12.6V5.38h-1.53v2.62H9.54l2.3 2.69z"
                fill="currentColor"
              />
            </svg>
            View as Markdown
          </SubtitleLink>
        }
      >
        React components for maps, fleets and the apps around them.
      </Subtitle>

      <MdP>
        Paper is a set of finished, product-facing components for delivery, fleet and back-office work. Some put a map
        front and centre (a delivery tracker, a store locator, a dispatch board); the rest cover the workshop (work
        orders, service schedules, parts, fuel, running costs) and the app around it (shells, auth, tables, billing,
        settings). They are the screens you would otherwise build from scratch.
      </MdP>

      <MdP>
        There is no package to install. Every component is a file you copy into your project and own. They are built on{' '}
        <Link href="https://ui.shadcn.com/" arrow>
          shadcn/ui
        </Link>{' '}
        components and{' '}
        <Link href="https://maplibre.org/" arrow>
          MapLibre GL
        </Link>
        , which is open source and needs no API key, and the charts on{' '}
        <Link href="https://recharts.org/" arrow>
          Recharts
        </Link>
        .
      </MdP>

      <Demo code={tracker?.usage} file="delivery-tracker-card.tsx">
        {previews ? previews.PREVIEWS['delivery-tracker-card'] : <PreviewFallback />}
      </Demo>

      <MdH2 id="how-it-works">How it works</MdH2>
      <MdUl>
        <MdLi>
          Positions are <Code>[longitude, latitude]</Code> pairs, longitude first, as in GeoJSON.
        </MdLi>
        <MdLi>Routes come from your own routing API (OSRM, Mapbox, Google). The components draw them; they never fetch them.</MdLi>
        <MdLi>Components are controlled: push new data in and the map follows, get events out through callbacks.</MdLi>
      </MdUl>

      <MdH2 id="next">Next</MdH2>
      <MdP>
        Follow the <Link href="/installation">installation</Link> steps, or <Link href="/components">browse the components</Link>.
      </MdP>
    </>
  );
}

function InstallationPage() {
  const mapKit = useSource('components/maps/map-kit.tsx');
  return (
    <>
      <MdH1 id="installation">Installation</MdH1>
      <Subtitle>How to get a component into your project.</Subtitle>

      <MdH2 id="install-the-dependencies">Install the dependencies</MdH2>
      <MdP>Every component is plain React. Install the map engine and the helpers it imports.</MdP>
      <InstallBlock packages="maplibre-gl lucide-react clsx tailwind-merge" />

      <MdH2 id="copy-the-component">Copy the component</MdH2>
      <MdP>
        Every map component imports one shared file, <Code>map-kit.tsx</Code>, so copy that first and only once. Then copy
        the components you need from <Code>src/components/maps</Code>. Components compose the primitives in{' '}
        <Code>src/components/ui</Code> (shadcn/ui), so add the ones a component lists.
      </MdP>
      <CodeBlock
        file="terminal"
        language="bash"
        code={`pnpm dlx shadcn@latest add card button badge input
cp src/components/maps/map-kit.tsx ./src/components/maps/
cp src/components/maps/store-locator.tsx ./src/components/maps/`}
      />

      <MdH2 id="fleet-components">Fleet maintenance components</MdH2>
      <MdP>
        The fleet components need no map. They import <Code>lucide-react</Code>, and the ones that draw charts also import{' '}
        <Code>recharts</Code>. Each folder has one small shared file, <Code>fleet-kit.ts</Code> (date, number and money
        formatting), so copy that once next to the components you take from <Code>src/components/fleet</Code>.
      </MdP>
      <InstallBlock packages="recharts lucide-react clsx tailwind-merge" />

      <MdH2 id="app-components">App components and templates</MdH2>
      <MdP>
        The app components (shell, auth forms, data table, billing, marketing sections) share <Code>app-kit.ts</Code> in{' '}
        <Code>src/components/app</Code>. Copy it once. They use a few more shadcn/ui primitives: avatar, checkbox, dialog,
        dropdown-menu, select, sheet, switch and popover. The <Link href="/templates">templates</Link> are built only from these
        components, so a template folder needs the components its pages list.
      </MdP>
      <MdP>
        The whole library is also readable by AI assistants over MCP — see{' '}
        <Link href="/mcp/doc">Use with AI (MCP)</Link>.
      </MdP>

      <MdH2 id="set-up-the-map">Set up the map</MdH2>
      <MdP>
        <Code>map-kit.tsx</Code> holds everything MapLibre needs: the <Code>useMap</Code> hook, the <Code>MapCanvas</Code>{' '}
        element, the <Code>MapMarker</Code> component and a few geometry helpers. It imports MapLibre&apos;s stylesheet and
        points MapLibre at its web worker; the worker line is the Vite form, so other bundlers need their own equivalent.
      </MdP>
      <CodeBlock file="map-kit.tsx" code={mapKit ?? '// Loading the source'} />
      <MdP>
        The default map style is OpenFreeMap&apos;s <Code>positron</Code>, which needs no key. Pass any MapLibre style URL
        or object as <Code>mapStyle</Code> to use your own tiles.
      </MdP>
      <MdH2 id="set-up-styles">Set up styles</MdH2>
      <MdP>
        The components use the standard shadcn/ui CSS variables, plus Tailwind v4. If you already run shadcn/ui, there is
        nothing to configure.
      </MdP>
      <CodeBlock
        file="styles.css"
        language="css"
        code={`@import 'tailwindcss';

:root {
  --radius: 0.5rem;
  --background: #ffffff;
  --foreground: #2e2e2e;
  --border: #00000014;
  --muted: #f9f9f9;
  --muted-foreground: #767676;
  --primary: #2e2e2e;
  --primary-foreground: #ffffff;
}`}
      />

      <MdH2 id="requirements">Requirements</MdH2>
      <MdUl>
        <MdLi>React 19 and TypeScript.</MdLi>
        <MdLi>
          Tailwind CSS v4, with{' '}
          <Link href="https://ui.shadcn.com/" arrow>
            shadcn/ui
          </Link>{' '}
          components available at <Code>@/components/ui</Code>.
        </MdLi>
        <MdLi>
          <Code>lucide-react</Code>, plus <Code>maplibre-gl</Code> for the map components or <Code>recharts</Code> for the fleet charts.
        </MdLi>
        <MdLi>A network connection to a tile server for the map components. The default is OpenFreeMap.</MdLi>
      </MdUl>
    </>
  );
}

function StylingPage() {
  return (
    <>
      <MdH1 id="styling">Styling</MdH1>
      <Subtitle>How the components are styled, and how to make them yours.</Subtitle>

      <MdH2 id="tokens">Tokens</MdH2>
      <MdP>
        The card, text and buttons run on shadcn/ui CSS variables, so a rebrand is a variable change rather than a
        component fork.
      </MdP>
      <CodeBlock
        file="styles.css"
        language="css"
        code={`:root {
  --background: #ffffff;
  --foreground: #2e2e2e;
  --card: #ffffff;
  --muted: #f9f9f9;
  --muted-foreground: #767676;
  --border: #00000014;
  --primary: #2e2e2e;
  --primary-foreground: #ffffff;
  --radius: 0.5rem;
}`}
      />

      <MdH2 id="colour-on-the-map">Colour on the map</MdH2>
      <MdP>
        Map layers are drawn on a canvas, which cannot read CSS variables. Anything painted on the map takes a plain
        colour prop instead: <Code>routeColor</Code> for the route line and <Code>accentColor</Code> for the driver
        marker, the active step and the ETA icon.
      </MdP>
      <CodeBlock code={`<DeliveryTrackerCard routeColor="#0f172a" accentColor="#2563eb" {...order} />`} />

      <MdH2 id="overriding">Overriding</MdH2>
      <MdP>
        Every component accepts <Code>className</Code>, merged onto its root element, so the usual Tailwind escape
        hatches work.
      </MdP>
      <CodeBlock code={`<DeliveryTrackerCard className="w-full max-w-md" {...order} />`} />
    </>
  );
}

function CompositionPage() {
  return (
    <>
      <MdH1 id="composition">Composition</MdH1>
      <Subtitle>Data in, events out, and no map state owned by the component.</Subtitle>

      <MdH2 id="controlled">Controlled by default</MdH2>
      <MdP>
        Positions, routes and the current step are props. Nothing reaches for a context you did not provide, so two maps
        can sit on one page without interfering.
      </MdP>
      <CodeBlock
        code={`const [position, setPosition] = React.useState(driver.position);

<DeliveryTrackerCard route={route} driver={{ ...driver, position }} currentStepId={step} ... />`}
      />

      <MdH2 id="data-flow">Data flow</MdH2>
      <MdP>
        The components are read-only views over data you already have. When your backend emits a new position, put it in
        state and the marker moves and the route re-splits.
      </MdP>
      <CodeBlock
        code={`// your backend, your store, your socket
socket.on('driver:position', (lngLat) => setPosition(lngLat));`}
      />

      <MdH2 id="bring-your-own-routing">Bring your own routing</MdH2>
      <MdP>
        The route is an array of coordinates, so it can come from OSRM, Mapbox, Google or your own dispatch service. The
        component draws it and never calls a routing API itself.
      </MdP>
    </>
  );
}

function TypeScriptPage() {
  return (
    <>
      <MdH1 id="typescript">TypeScript</MdH1>
      <Subtitle>The types are the documentation.</Subtitle>

      <MdH2 id="the-model">The model</MdH2>
      <MdP>The shapes below are exported from the component file. Nothing else is shared between components yet.</MdP>
      <CodeBlock
        file="components/maps/delivery-tracker-card.tsx"
        code={`export type LngLat = [longitude: number, latitude: number];

export interface DeliveryStop {
  label: string;
  position: LngLat;
}

export interface DeliveryDriver {
  name: string;
  vehicle: string;
  plate?: string;
  rating?: number;
  position: LngLat;
}

export interface DeliveryStep {
  id: string;
  label: string;
}`}
      />

      <MdH2 id="extending">Extending</MdH2>
      <MdP>
        The components are your files, so extend the types in place. Add a field to <Code>DeliveryDriver</Code>, then
        read it in the driver row.
      </MdP>
      <CodeBlock
        code={`import type { DeliveryDriver } from '@/components/maps/delivery-tracker-card';

interface MyDriver extends DeliveryDriver {
  photoUrl: string;
}`}
      />
    </>
  );
}

const COMPONENT_SECTIONS: QuickNavItem[] = [
  { id: 'installation', label: 'Installation' },
  { id: 'source', label: 'Source' },
  { id: 'usage', label: 'Usage' },
  { id: 'anatomy', label: 'Anatomy' },
  { id: 'examples', label: 'Examples' },
];

function ComponentPage({ entry, route }: { entry: ComponentEntry; route: string }) {
  void route;
  const previews = usePreviews(familyOf(entry.file));
  const source = useSource(entry.file);
  const imports = source ? localImportFiles(entry.file, source) : [];
  const examples = previews?.EXAMPLES[entry.id] ?? [];
  return (
    <>
      <MdH1 id={entry.id}>{entry.name}</MdH1>
      <Subtitle
        links={
          <>
            <SubtitleLink href={`${REPO}/blob/main/src/${entry.file}`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M8 0C3.58 0 0 3.67 0 8.2c0 3.63 2.29 6.7 5.47 7.78.4.07.55-.17.55-.39 0-.19-.01-.84-.01-1.53-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.16-.28-.15-.68-.53-.01-.54.63-.01 1.08.59 1.23.84.72 1.24 1.87.89 2.33.68.07-.53.28-.89.51-1.1-1.78-.2-3.64-.91-3.64-4.05 0-.89.31-1.63.82-2.2-.08-.21-.36-1.05.08-2.17 0 0 .67-.22 2.2.84.64-.18 1.32-.28 2-.28s1.36.09 2 .28c1.53-1.07 2.2-.84 2.2-.84.44 1.13.16 1.97.08 2.17.51.57.82 1.3.82 2.2 0 3.15-1.87 3.84-3.65 4.05.29.26.54.75.54 1.52 0 1.1-.01 1.98-.01 2.26 0 .22.15.47.55.39C13.71 14.9 16 11.82 16 8.2 16 3.67 12.42 0 8 0" />
              </svg>
              View source
            </SubtitleLink>
            <SubtitleLink href={`${REPO}/blob/main/docs/components/${entry.id}.md`}>View as Markdown</SubtitleLink>
          </>
        }
      >
        {entry.tagline}
      </Subtitle>

      <MdP>{entry.description}</MdP>

      <Demo code={entry.usage} file={`${entry.id}.tsx`} wide={entry.wide}>
        {previews ? previews.PREVIEWS[entry.id] : <PreviewFallback />}
      </Demo>

      <MdH2 id="installation">Installation</MdH2>
      <MdP>
        There is no package here — copy the file below into <Code>src/{entry.file}</Code> and it's yours to edit.
        {entry.primitives.length ? " It's built on shadcn/ui primitives, so add those first:" : ' It uses no shadcn/ui primitives.'}
      </MdP>
      {entry.primitives.length ? (
        <CodeBlock file="terminal" language="bash" code={`pnpm dlx shadcn@latest add ${entry.primitives.join(' ')}`} />
      ) : null}
      {entry.deps.length ? (
        <>
          <MdP>And the packages the file imports:</MdP>
          <InstallBlock packages={entry.deps.join(' ')} />
        </>
      ) : null}
      {imports.length ? (
        <MdP>
          It also imports{' '}
          {imports.map((name, index, all) => (
            <React.Fragment key={name}>
              {index > 0 ? (index === all.length - 1 ? ' and ' : ', ') : ''}
              <Code>{name}</Code>
            </React.Fragment>
          ))}{' '}
          from the same folder. Copy {imports.length === 1 ? 'that file' : 'those files'} too
          {entry.file.startsWith('components/maps/') ? (
            <>
              ; see <Link href="/installation">Installation</Link> for the map setup.
            </>
          ) : (
            '.'
          )}
        </MdP>
      ) : null}

      <MdH2 id="source">Source</MdH2>
      <MdP>
        The full, real file — this is what you paste. Anything shorter than this is a usage example, not the component.
      </MdP>
      <CodeBlock file={entry.file.split('/').pop()} code={source ?? '// Loading the source'} />

      <MdH2 id="usage">Usage</MdH2>
      <CodeBlock code={entry.usage} />

      <MdH2 id="anatomy">Anatomy</MdH2>
      <MdP>Import the component and pass it the part of the model it renders.</MdP>
      <CodeBlock code={entry.anatomy} />

      <MdH2 id="examples">Examples</MdH2>
      {examples.map((example, index) => (
        <React.Fragment key={example.label}>
          <MdH3 id={example.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>{example.label}</MdH3>
          <Demo code={entry.examples[index]?.code ?? entry.usage} wide={entry.wide}>
            {example.node}
          </Demo>
        </React.Fragment>
      ))}

      <MdH2 id="api-reference">API reference</MdH2>
      <ApiTable sections={entry.api} />
    </>
  );
}

/* ============================================================================
   components index
   ========================================================================== */

const PITCHES = [
  {
    title: 'Finished, not plumbing',
    body: 'A delivery tracker, a work order board, a parts inventory: whole screens for a real workflow, not another set of primitives.',
    illustration: '/illustrations/project-development.svg',
  },
  {
    title: 'Copy-paste, not a package',
    body: 'No version to chase. Copy the file into your project and own it from that moment on.',
    illustration: '/illustrations/puzzle.svg',
  },
  {
    title: 'Open by default',
    body: 'MapLibre GL and OpenFreeMap for the maps, Recharts for the charts: open source, no API keys, no per-load billing.',
    illustration: '/illustrations/target-accent.svg',
  },
];

const FEATURED_IDS = ['delivery-tracker-card', 'work-order-board', 'fleet-overview', 'cost-breakdown-chart'];

function ComponentCard({ id }: { id: string }) {
  const entry = getComponent(id);
  if (!entry) return null;
  return (
    <a
      href={`/components/${entry.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card no-underline transition-colors hover:border-pink/50"
    >
      <span className="flex aspect-[4/3] items-start justify-center overflow-hidden border-b border-border bg-muted">
        <img src={`/screenshots/${entry.id}.png`} alt={`${entry.name} preview`} loading="lazy" className="h-full w-full object-cover object-top" />
      </span>
      <span className="flex flex-col gap-1 p-4">
        <span className="text-sm font-bold text-foreground group-hover:text-pink">{entry.name}</span>
        <span className="text-xs text-muted-foreground">{entry.tagline}</span>
      </span>
    </a>
  );
}

function LandingPage() {
  const previews = usePreviews();
  return (
    <div className="flex flex-col gap-20 py-8 sm:py-12">
      <section className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_auto]">
        <div className="flex flex-col items-start gap-6">
          <span className="flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-pink" aria-hidden />
            {COMPONENTS.length} components
          </span>

          <h1 className="max-w-3xl text-4xl font-medium tracking-tight text-foreground sm:text-6xl">
            React components for maps, fleets and back-office apps.
          </h1>

          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Delivery tracking and store locators on a map; the fleet side too — maintenance schedules, work orders,
            parts inventory, running costs; and the app pieces — shells, auth, tables, billing, settings. Finished screens
            you copy into your project, and four full templates, from a delivery platform to a retailer&apos;s back-office,
            that show how they fit together.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="lg">
              <a href="/components">Browse components</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="/quick-start">Read the docs</a>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <a href={REPO} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </Button>
          </div>
        </div>

        <div className="hidden min-h-[36rem] w-[26rem] lg:block">{previews ? previews.PREVIEWS['delivery-tracker-card'] : null}</div>
      </section>

      <section className="grid grid-cols-1 gap-10 border-y border-border py-10 sm:grid-cols-3">
        {PITCHES.map((pitch) => (
          <div key={pitch.title} className="flex flex-col gap-3">
            <img src={pitch.illustration} alt="" aria-hidden className="h-20 w-auto self-start" />
            <h3 className="text-sm font-medium text-foreground">{pitch.title}</h3>
            <p className="text-sm text-muted-foreground">{pitch.body}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-medium text-foreground">A few of them</h2>
          <a href="/components" className="font-mono text-xs text-muted-foreground hover:text-pink">
            Browse all {COMPONENTS.length} →
          </a>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_IDS.map((id) => (
            <ComponentCard key={id} id={id} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ComponentsIndexPage() {
  const [family, setFamily] = React.useState<'all' | 'maps' | 'fleet' | 'app'>('all');
  const shown = COMPONENTS.filter((entry) => family === 'all' || entry.file.startsWith(`components/${family}/`));
  const counts = { all: COMPONENTS.length, maps: COMPONENTS.filter((entry) => entry.file.startsWith('components/maps/')).length, fleet: COMPONENTS.filter((entry) => entry.file.startsWith('components/fleet/')).length, app: COMPONENTS.filter((entry) => entry.file.startsWith('components/app/')).length };
  return (
    <div className="flex flex-col gap-12 py-8 sm:py-12">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-pink" aria-hidden />
            {COMPONENTS.length} components
          </span>
          <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">Components</h1>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            Open one for installation, the full source and the API reference.
          </p>
        </div>
        <img src="/illustrations/target-accent.svg" alt="" aria-hidden className="hidden h-24 w-auto sm:block" />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter components">
        {(
          [
            { id: 'all', label: 'All' },
            { id: 'maps', label: 'Maps' },
            { id: 'fleet', label: 'Fleet maintenance' },
            { id: 'app', label: 'App building blocks' },
          ] as const
        ).map((chip) => (
          <button
            key={chip.id}
            type="button"
            aria-pressed={family === chip.id}
            onClick={() => setFamily(chip.id)}
            className={cn('rounded-full border px-3.5 py-1.5 text-sm transition-colors', family === chip.id ? 'border-transparent bg-foreground text-background' : 'text-muted-foreground hover:bg-muted')}
          >
            {chip.label} <span className="font-mono text-xs opacity-70">{counts[chip.id]}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((entry) => (
          <ComponentCard key={entry.id} id={entry.id} />
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   MCP — the library as a tool for Claude and other agents
   ========================================================================== */

const MCP_URL = 'https://paper.mshami2021.workers.dev/mcp';

const MCP_TOOLS: { name: string; does: string }[] = [
  { name: 'get_guidelines', does: 'How the library works: the stack, the design theme and the composition rules. Read first.' },
  { name: 'search_components', does: 'Find components by what you need, such as "kanban board" or "invoice table".' },
  { name: 'list_components', does: 'Every component, filterable by family (maps, fleet, app) or category.' },
  { name: 'get_component', does: 'One component as markdown: usage, examples, the API table and the full source.' },
  { name: 'get_install_plan', does: 'The shadcn primitives, npm packages and every file to copy for a set of components.' },
  { name: 'get_source', does: 'Any file by path: a component, a shared kit, a ui primitive or a template file.' },
  { name: 'list_templates', does: 'The templates, with their pages and live links.' },
  { name: 'get_template', does: 'One template: its pages, the components each page uses and its files.' },
];

function McpPage() {
  return (
    <>
      <MdH1 id="use-with-ai">Use with AI</MdH1>
      <Subtitle>Connect Claude, Cursor or any MCP client, so an assistant can find, read and copy these components itself.</Subtitle>

      <MdH2 id="server">The server</MdH2>
      <MdP>
        Paper is a remote MCP server over streamable HTTP. It is public and read-only, so there is no sign-in and no key. Every
        tool reads the same registry and source files as this site.
      </MdP>
      <CodeBlock file="url" language="bash" code={MCP_URL} />

      <MdH2 id="claude">Claude</MdH2>
      <MdP>
        In Claude, open Settings, then Connectors, choose <Code>Add custom connector</Code>, paste the URL above and connect.
        There is nothing to authorise.
      </MdP>

      <MdH2 id="claude-code">Claude Code</MdH2>
      <CodeBlock file="terminal" language="bash" code={`claude mcp add --transport http paper ${MCP_URL}`} />

      <MdH2 id="other-clients">Cursor and other clients</MdH2>
      <MdP>Any client that supports remote servers takes the URL in its config.</MdP>
      <CodeBlock
        file="mcp.json"
        language="json"
        code={`{
  "mcpServers": {
    "paper": {
      "url": "${MCP_URL}"
    }
  }
}`}
      />
      <MdP>
        A client that only speaks stdio can bridge with <Code>npx mcp-remote {MCP_URL}</Code>.
      </MdP>

      <MdH2 id="tools">Tools</MdH2>
      <MdUl>
        {MCP_TOOLS.map((tool) => (
          <MdLi key={tool.name}>
            <Code>{tool.name}</Code>: {tool.does}
          </MdLi>
        ))}
      </MdUl>

      <MdH2 id="try-it">Try it</MdH2>
      <MdP>Once connected, ask for something in plain words:</MdP>
      <MdUl>
        <MdLi>&quot;Add a work order board and a data table to my app, using Paper.&quot;</MdLi>
        <MdLi>&quot;Build a settings page from Paper components: profile form and notification preferences.&quot;</MdLi>
        <MdLi>&quot;Which Paper components would I use for a vehicle detail page? Give me the install plan.&quot;</MdLi>
        <MdLi>&quot;Start from the Garage template and swap the demo data for my own.&quot;</MdLi>
      </MdUl>

      <MdH2 id="for-other-agents">For other agents</MdH2>
      <MdP>
        Agents that read plain files can start from <Link href={`${MCP_URL.replace(/\/mcp$/, "")}/llms.txt`} arrow>llms.txt</Link>, which links every component and template as
        markdown, or from <Link href={`${MCP_URL.replace(/\/mcp$/, "")}/mcp-data/guidelines.md`} arrow>the design guidelines</Link>. Each component is at{' '}
        <Code>/mcp-data/components/&lt;id&gt;.md</Code>.
      </MdP>
    </>
  );
}

/* ============================================================================
   templates — sub-projects built only from the components above
   ========================================================================== */

function TemplateCard({ template }: { template: TemplateEntry }) {
  const componentIds = new Set(template.pages.flatMap((page) => page.components));
  return (
    <a
      href={`/templates/${template.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card no-underline transition-colors hover:border-pink/50"
    >
      <span className="flex aspect-[16/10] items-start justify-center overflow-hidden border-b border-border bg-muted">
        <img src={`/screenshots/templates/${template.id}.png`} alt={`${template.name} template preview`} loading="lazy" className="h-full w-full object-cover object-top" />
      </span>
      <span className="flex flex-col gap-2 p-5">
        <span className="flex items-center justify-between gap-3">
          <span className="text-base font-bold text-foreground group-hover:text-pink">{template.name}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {template.pages.length} pages · {componentIds.size} components
          </span>
        </span>
        <span className="text-sm text-muted-foreground">{template.tagline}</span>
      </span>
    </a>
  );
}

function TemplatesIndexPage() {
  return (
    <div className="flex flex-col gap-12 py-8 sm:py-12">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-pink" aria-hidden />
            {TEMPLATES.length} templates
          </span>
          <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">Templates</h1>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            Whole projects, not single screens. Each one is built only from the components in this library, so you can see how
            they fit together and copy the folder as a starting point.
          </p>
        </div>
        <img src="/illustrations/target-accent.svg" alt="" aria-hidden className="hidden h-24 w-auto sm:block" />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}

function TemplateDetailPage({ id }: { id: string }) {
  const template = getTemplate(id);
  if (!template) return <div className="py-16 text-sm text-muted-foreground">Unknown template: {id}</div>;
  const componentIds = Array.from(new Set(template.pages.flatMap((page) => page.components)));
  return (
    <div className="flex flex-col gap-12 py-8 sm:py-12">
      <div className="flex flex-col gap-4">
        <a href="/templates" className="text-sm text-muted-foreground no-underline hover:text-foreground">
          ← All templates
        </a>
        <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">{template.name}</h1>
        <p className="max-w-2xl text-base text-muted-foreground">{template.description}</p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button asChild size="lg">
            <a href={`/t/${template.id}`}>Open the live template</a>
          </Button>
          <span className="font-mono text-xs text-muted-foreground">
            {template.pages.length} pages · {componentIds.length} components · src/templates/{template.id}
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-border" aria-hidden />
          <span className="size-2.5 rounded-full bg-border" aria-hidden />
          <span className="size-2.5 rounded-full bg-border" aria-hidden />
          <span className="ml-3 truncate font-mono text-xs text-muted-foreground">/t/{template.id}</span>
        </div>
        <iframe src={`/t/${template.id}`} title={`${template.name} live preview`} loading="lazy" className="block h-[34rem] w-full border-0 sm:h-[46rem]" />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight text-foreground">Pages</h2>
        <div className="overflow-hidden rounded-lg border border-border">
          {template.pages.map((page) => (
            <div key={page.path} className="grid grid-cols-1 gap-3 border-b border-border p-4 last:border-b-0 md:grid-cols-[14rem_1fr_1fr]">
              <div className="flex flex-col gap-1">
                <a href={`/t/${template.id}${page.example ?? page.path}`} className="text-sm font-bold text-foreground no-underline hover:text-pink">
                  {page.label}
                </a>
                <code className="font-mono text-xs text-muted-foreground">{page.path}</code>
              </div>
              <p className="text-sm text-muted-foreground">{page.description}</p>
              <p className="flex flex-wrap gap-x-2 gap-y-1 text-sm">
                {page.components.map((componentId) => {
                  const entry = getComponent(componentId);
                  return entry ? (
                    <a key={componentId} href={`/components/${componentId}`} className="font-mono text-xs text-foreground/80 underline decoration-border underline-offset-4 hover:text-pink">
                      {entry.name}
                    </a>
                  ) : null;
                })}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-medium tracking-tight text-foreground">Use it</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          The template is a folder, <Code>src/templates/{template.id}</Code>, with one file per page and its own demo data. Every piece of
          interface in it comes from <Code>src/components</Code>, so copy the components each page lists, then the folder, and replace the
          demo data with your own.
        </p>
      </section>
    </div>
  );
}

const templateComponents: Record<string, React.LazyExoticComponent<React.ComponentType<TemplateProps>>> = {};

/** Runs a template full-bleed, at /t/<id>/<path>. Only a small pill leads back to the docs. */
function TemplateRunner({ id, path, navigate }: { id: string; path: string; navigate: (href: string) => void }) {
  const template = getTemplate(id);
  const embedded = typeof window !== 'undefined' && window.self !== window.top;
  if (!template) return <div className="p-8 text-sm text-muted-foreground">Unknown template: {id}</div>;
  const Template = (templateComponents[id] ??= React.lazy(template.load));
  const base = `/t/${id}`;
  return (
    <>
      <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground" role="status">Loading {template.name}</div>}>
        <Template path={path || '/'} base={base} navigate={(to) => navigate(`${base}${to === '/' ? '' : to}`)} />
      </React.Suspense>
      {embedded ? null : (
        <a
          href={`/templates/${id}`}
          className="fixed bottom-3 right-3 z-[60] hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground no-underline opacity-80 transition-opacity hover:border-pink/50 hover:text-foreground hover:opacity-100 md:flex"
        >
          <span className="size-1.5 rounded-full bg-pink" aria-hidden />
          {template.name} · Paper templates
        </a>
      )}
    </>
  );
}

/* ============================================================================
   screenshot target — bare render of one preview, used by the screenshot script
   ========================================================================== */

function ShotPage({ id }: { id: string }) {
  const entry = getComponent(id);
  const previews = usePreviews(entry ? familyOf(entry.file) : 'maps');
  const preview = previews?.PREVIEWS[id];
  return (
    <>
      <style>{'html,body{margin:0;padding:0;background:var(--background);}'}</style>
      {preview ? (
        <div id="shot-root" style={{ display: 'inline-block', padding: 24, width: entry?.wide ? 1000 : 700 }}>
          <Demo wide={entry?.wide}>{preview}</Demo>
        </div>
      ) : (
        <div style={{ padding: 24 }}>{previews ? `Unknown component: ${id}` : 'Loading'}</div>
      )}
    </>
  );
}

/* ============================================================================
   app
   ========================================================================== */

export default function DocsApp() {
  const { route, navigate } = useRouter();
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (route.startsWith('shot/')) {
    return <ShotPage id={route.slice('shot/'.length)} />;
  }

  if (route.startsWith('t/')) {
    const [, id, ...rest] = route.split('/');
    return <TemplateRunner id={id} path={`/${rest.join('/')}`} navigate={navigate} />;
  }

  const componentId = route.startsWith('components/') ? route.slice('components/'.length) : null;
  const entry = componentId ? getComponent(componentId) : undefined;

  const quickNav: QuickNavItem[] = entry
    ? [
        ...COMPONENT_SECTIONS,
        {
          id: 'api-reference',
          label: 'API reference',
          children: entry.api.map((section) => ({
            id: section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            label: section.title,
          })),
        },
      ]
    : route === 'mcp/doc'
      ? [
          { id: 'server', label: 'The server' },
          { id: 'claude', label: 'Claude' },
          { id: 'claude-code', label: 'Claude Code' },
          { id: 'other-clients', label: 'Cursor and others' },
          { id: 'tools', label: 'Tools' },
          { id: 'try-it', label: 'Try it' },
          { id: 'for-other-agents', label: 'For other agents' },
        ]
      : route === 'installation'
      ? [
          { id: 'install-the-dependencies', label: 'Install the dependencies' },
          { id: 'copy-the-component', label: 'Copy the component' },
          { id: 'fleet-components', label: 'Fleet components' },
          { id: 'app-components', label: 'App components' },
          { id: 'set-up-the-map', label: 'Set up the map' },
          { id: 'set-up-styles', label: 'Set up styles' },
          { id: 'requirements', label: 'Requirements' },
        ]
      : route === 'styling'
        ? [
            { id: 'tokens', label: 'Tokens' },
            { id: 'colour-on-the-map', label: 'Colour on the map' },
            { id: 'overriding', label: 'Overriding' },
          ]
        : route === 'composition'
          ? [
              { id: 'controlled', label: 'Controlled by default' },
              { id: 'data-flow', label: 'Data flow' },
              { id: 'bring-your-own-routing', label: 'Bring your own routing' },
            ]
          : route === 'typescript'
            ? [
                { id: 'the-model', label: 'The model' },
                { id: 'extending', label: 'Extending' },
              ]
            : [
                { id: 'how-it-works', label: 'How it works' },
                { id: 'next', label: 'Next' },
              ];

  const isBare = route === '' || route === 'components' || route === 'templates' || route.startsWith('templates/');

  const page = route === '' ? (
    <LandingPage />
  ) : entry ? (
    <ComponentPage entry={entry} route={route} />
  ) : route === 'components' ? (
    <ComponentsIndexPage />
  ) : route === 'templates' ? (
    <TemplatesIndexPage />
  ) : route.startsWith('templates/') ? (
    <TemplateDetailPage id={route.slice('templates/'.length)} />
  ) : route === 'mcp/doc' ? (
    <McpPage />
  ) : route === 'installation' ? (
    <InstallationPage />
  ) : route === 'styling' ? (
    <StylingPage />
  ) : route === 'composition' ? (
    <CompositionPage />
  ) : route === 'typescript' ? (
    <TypeScriptPage />
  ) : (
    <QuickStartPage />
  );

  return (
    <div className={cn('RootLayout', !isBare && 'DocsWide')}>
      <Header route={route} onSearch={() => setSearchOpen(true)} />
      <div className="RootLayoutContainer">
        <div className="RootLayoutContent">
          {isBare ? (
            <main id="main-content" className="mx-auto w-full max-w-[80rem] px-6 pb-24 sm:px-10" style={{ paddingTop: 'var(--header-height)' }}>
              {page}
            </main>
          ) : (
            <div className="ContentLayoutRoot">
              <SideNav route={route} />
              <main className="ContentLayoutMain" id="main-content">
                <QuickNav title={entry?.name ?? 'Paper'} items={quickNav} />
                <div className="QuickNavContent">{page}</div>
              </main>
            </div>
          )}
        </div>
      </div>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={navigate} />
    </div>
  );
}
