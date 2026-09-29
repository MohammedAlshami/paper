import * as React from 'react';
import { Search, Truck } from 'lucide-react';
import { AppShell } from '@/components/app/app-shell';
import { CommandPalette } from '@/components/app/command-palette';
import { NotificationsPopover } from '@/components/app/notifications-popover';
import { SiteFooter } from '@/components/app/site-footer';
import { SiteHeader } from '@/components/app/site-header';
import { Button } from '@/components/ui/button';
import { COMMANDS, NAV, NOTIFICATIONS, USER, USER_MENU } from './data/ops';

export const Brand = () => (
  <>
    <Truck className="size-4" /> Courier
  </>
);

/** A page that is one form in the middle of the screen: sign in, sign up, reset. */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-svh items-center justify-center bg-background p-4 sm:p-8">{children}</div>;
}

/** The customer-facing pages: a site header, a centred column, a footer. */
export function PublicLayout({ base, navigate, children }: { base: string; navigate: (path: string) => void; children: React.ReactNode }) {
  const go = (href: string) => navigate(href.startsWith(base) ? href.slice(base.length) || '/' : href);
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader
        brand="Courier"
        links={[
          { label: 'Track an order', href: `${base}/track/48213` },
          { label: 'Checkout', href: `${base}/checkout` },
        ]}
        primaryAction={{ label: 'Dispatcher sign in', href: `${base}/login` }}
        onNavigate={go}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">{children}</main>
      <SiteFooter
        brand="Courier"
        tagline="Groceries and parcels, tracked to your door."
        columns={[
          { title: 'Customers', links: [{ label: 'Track an order', href: `${base}/track/48213` }, { label: 'Checkout', href: `${base}/checkout` }] },
          { title: 'Dispatchers', links: [{ label: 'Sign in', href: `${base}/login` }, { label: 'Create an account', href: `${base}/register` }] },
        ]}
        legal="© 2026 Courier. A demo template."
        onNavigate={go}
      />
    </div>
  );
}

/** The dispatcher app: sidebar, a top bar with search and notifications, and the page. */
export function ConsoleLayout({ path, base, navigate, children }: { path: string; base: string; navigate: (path: string) => void; children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const activeId = path === '/' ? 'dispatch' : path.split('/')[1];
  return (
    <div className="h-svh">
      <AppShell
        brand={{ name: 'Courier', logo: <Truck className="size-4" /> }}
        nav={NAV.map((group) => ({ ...group, items: group.items.map((item) => ({ ...item, href: `${base}${item.href}` })) }))}
        activeId={activeId}
        onNavigate={(item) => item.href && navigate(item.href.slice(base.length))}
        user={USER}
        userMenu={USER_MENU}
        onUserMenu={(item) => item.id === 'signout' && navigate('/login')}
        topBar={
          <>
            <Button variant="outline" size="sm" className="w-full max-w-64 justify-start font-normal text-muted-foreground" onClick={() => setPaletteOpen(true)}>
              <Search /> Search
              <span className="ml-auto hidden font-mono text-xs sm:inline">Ctrl K</span>
            </Button>
            <div className="ml-auto">
              <NotificationsPopover notifications={NOTIFICATIONS} />
            </div>
          </>
        }
      >
        <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-6 p-4 sm:p-6">{children}</div>
      </AppShell>
      <CommandPalette groups={COMMANDS} open={paletteOpen} onOpenChange={setPaletteOpen} onSelect={(command) => navigate(command.id)} />
    </div>
  );
}
