import * as React from 'react';
import { Search } from 'lucide-react';
import { AppShell } from '@/components/app/app-shell';
import { CommandPalette } from '@/components/app/command-palette';
import { NotificationsPopover } from '@/components/app/notifications-popover';
import { Input } from '@/components/ui/input';
import { COMMANDS, NAV, NAV_PATHS, NOTIFICATIONS, USER, USER_MENU } from './data';
import type { PageContext } from './context';

/** The frame every signed-in page sits in: sidebar, search, notifications, and the Cmd-K palette. */
export function GarageShell({ activeId, ctx, children }: { activeId: string; ctx: Pick<PageContext, 'navigate'>; children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const { navigate } = ctx;

  return (
    <div className="h-svh">
      <AppShell
        brand={{ name: 'Garage' }}
        nav={NAV}
        activeId={activeId}
        onNavigate={(item) => navigate(NAV_PATHS[item.id] ?? '/')}
        user={USER}
        userMenu={USER_MENU}
        onUserMenu={(item) => navigate(item.id === 'signout' ? '/login' : '/settings')}
        topBar={
          <>
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 pl-8"
                placeholder="Search or jump to…  Ctrl K"
                aria-label="Open the command palette"
                readOnly
                onFocus={(event) => {
                  event.currentTarget.blur();
                  setPaletteOpen(true);
                }}
                onClick={() => setPaletteOpen(true)}
              />
            </div>
            <div className="ml-auto">
              <NotificationsPopover notifications={NOTIFICATIONS} />
            </div>
          </>
        }
      >
        {children}
      </AppShell>
      <CommandPalette
        groups={COMMANDS}
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onSelect={(command) => {
          if (command.id.startsWith('go:')) {
            const target = command.id.slice(3);
            navigate(target === 'dashboard' ? '/' : `/${target}`);
          }
        }}
      />
    </div>
  );
}

/** The padded, centred column every page's content goes in. */
export function PageBody({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex w-full max-w-[80rem] flex-col gap-6 p-4 sm:p-6">{children}</div>;
}
