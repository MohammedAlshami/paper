import * as React from 'react';
import { CreditCard, LayoutDashboard, LogOut, Search, Settings, Users, UserRound } from 'lucide-react';
import { AppShell, type NavGroup } from '@/components/app/app-shell';
import { CommandPalette, type CommandGroup } from '@/components/app/command-palette';
import { NotificationsPopover } from '@/components/app/notifications-popover';
import { SiteFooter } from '@/components/app/site-footer';
import { SiteHeader } from '@/components/app/site-header';
import { Button } from '@/components/ui/button';
import { FOOTER_COLUMNS, NAV_LINKS, NOTIFICATIONS, USER } from './data';
import type { PageProps } from './pages/types';

/** A link that stays inside the template, or scrolls to a section when it starts with #. */
function useLinkHandler({ base, navigate }: PageProps) {
  return (href: string) => {
    if (href.startsWith('#')) {
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    navigate(href.startsWith(base) ? href.slice(base.length) || '/' : href);
  };
}

/** The public site: header on top, footer at the bottom. */
export function MarketingLayout({ base, navigate, children }: PageProps & { children: React.ReactNode }) {
  const go = useLinkHandler({ base, navigate });
  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteHeader
        className="sticky top-0 z-30 bg-background"
        brand="Ledger"
        links={NAV_LINKS}
        primaryAction={{ label: 'Start free', href: `${base}/register` }}
        secondaryAction={{ label: 'Sign in', href: `${base}/login` }}
        onNavigate={go}
      />
      {children}
      <SiteFooter
        className="mx-auto max-w-6xl"
        brand="Ledger"
        tagline="Calm money software for small teams."
        columns={FOOTER_COLUMNS}
        legal="© 2026 Ledger, Inc. Every name and number on this site is made up."
        onNavigate={go}
      />
    </div>
  );
}

const APP_NAV = (base: string): NavGroup[] => [
  {
    items: [
      { id: '/app', label: 'Overview', icon: LayoutDashboard, href: `${base}/app` },
      { id: '/app/customers', label: 'Customers', icon: UserRound, href: `${base}/app/customers`, badge: 14 },
      { id: '/app/billing', label: 'Billing', icon: CreditCard, href: `${base}/app/billing` },
    ],
  },
  {
    heading: 'Workspace',
    items: [
      { id: '/app/team', label: 'Team', icon: Users, href: `${base}/app/team` },
      { id: '/app/settings', label: 'Settings', icon: Settings, href: `${base}/app/settings` },
    ],
  },
];

const COMMANDS: CommandGroup[] = [
  {
    heading: 'Go to',
    commands: [
      { id: '/app', label: 'Overview', icon: LayoutDashboard, shortcut: 'G O' },
      { id: '/app/customers', label: 'Customers', icon: UserRound, shortcut: 'G C', keywords: ['people', 'accounts'] },
      { id: '/app/billing', label: 'Billing', icon: CreditCard, shortcut: 'G B', keywords: ['invoices', 'plan', 'payment'] },
      { id: '/app/team', label: 'Team', icon: Users, keywords: ['members', 'invite'] },
      { id: '/app/settings', label: 'Settings', icon: Settings, keywords: ['profile', 'api keys', 'notifications'] },
    ],
  },
  { heading: 'Account', commands: [{ id: '/login', label: 'Sign out', icon: LogOut }] },
];

/** The signed-in app: a sidebar, a search box that opens the command palette, and notifications. */
export function AppLayout({ base, navigate, active, children }: PageProps & { active: string; children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  return (
    <div className="h-svh">
      <AppShell
        brand={{ name: 'Ledger' }}
        nav={APP_NAV(base)}
        activeId={active}
        onNavigate={(item) => navigate(item.id)}
        user={USER}
        userMenu={[
          { id: '/app/settings', label: 'Settings', icon: Settings },
          { id: '/login', label: 'Sign out', icon: LogOut, destructive: true },
        ]}
        onUserMenu={(item) => navigate(item.id)}
        topBar={
          <>
            <Button variant="outline" className="h-8 w-full max-w-64 justify-start gap-2 font-normal text-muted-foreground" onClick={() => setPaletteOpen(true)}>
              <Search /> <span className="flex-1 text-left">Search</span>
              <kbd className="hidden font-mono text-xs sm:inline">⌘K</kbd>
            </Button>
            <div className="flex-1" />
            <NotificationsPopover notifications={NOTIFICATIONS} />
          </>
        }
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6">{children}</div>
      </AppShell>
      <CommandPalette groups={COMMANDS} open={paletteOpen} onOpenChange={setPaletteOpen} onSelect={(command) => navigate(command.id)} />
    </div>
  );
}

/** Centres one auth screen on a quiet background. */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-10">{children}</div>;
}
