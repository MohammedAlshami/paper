import * as React from 'react';
import { AlertTriangle, ArrowUpDown, CircleDollarSign, FileWarning, MapPinOff, PackageCheck, Search, Timer, Undo2, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AppShell } from '@/components/app/app-shell';
import { CommandPalette, type CommandGroup } from '@/components/app/command-palette';
import { NotificationsPopover, type AppNotification } from '@/components/app/notifications-popover';
import { Input } from '@/components/ui/input';
import { CURRENT_USER, relativeTime, type AlertKind } from './data';
import { NAV, NAV_ITEMS, NAV_PATHS, buildNav } from './nav';
import { useHarborRouter } from './router-context';
import { useHarbor } from './state';

const ALERT_ICONS: Record<AlertKind, LucideIcon> = {
  'late-delivery': Timer,
  'low-stock': AlertTriangle,
  'service-due': Wrench,
  'po-arrived': PackageCheck,
  'return-request': Undo2,
  geofence: MapPinOff,
  'payment-failed': CircleDollarSign,
  'document-expiry': FileWarning,
};

/** Things you can do from anywhere with Cmd-K, besides jumping to a page. */
const ACTIONS = [
  { id: 'go:/purchasing', label: 'Create a purchase order', keywords: ['reorder', 'buy'] },
  { id: 'go:/dispatch', label: 'Assign unassigned deliveries', keywords: ['driver', 'jobs'] },
  { id: 'go:/work-orders', label: 'Open a work order', keywords: ['repair', 'defect'] },
  { id: 'go:/returns', label: 'Review return requests', keywords: ['refund'] },
  { id: 'go:/inventory', label: 'Check low stock', keywords: ['reorder'] },
];

/**
 * The frame around every Harbor page: the sidebar (with live badges), a search that opens Cmd-K, the notifications
 * bell fed by the inbox, and the user menu. Pages render inside it and never draw their own chrome.
 */
export function HarborShell({ activeId, children }: { activeId: string; children: React.ReactNode }) {
  const { base, navigate } = useHarborRouter();
  const { state, actions, counts } = useHarbor();
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  const notifications: AppNotification[] = state.alerts
    .filter((alert) => !alert.resolved)
    .slice(0, 8)
    .map((alert) => ({ id: alert.id, title: alert.title, body: alert.detail, time: relativeTime(alert.at), read: alert.read, icon: ALERT_ICONS[alert.kind] }));

  const groups: CommandGroup[] = [
    { heading: 'Go to', commands: NAV_ITEMS.map((item) => ({ id: `go:${item.path}`, label: item.label, icon: item.icon, keywords: item.keywords })) },
    { heading: 'Actions', commands: ACTIONS.map((action) => ({ id: action.id, label: action.label, icon: ArrowUpDown, keywords: action.keywords })) },
    {
      heading: 'Recent orders',
      commands: state.orders.slice(0, 8).map((order) => ({ id: `go:/orders/${order.id}`, label: `Order ${order.number}`, keywords: [order.status, order.id] })),
    },
  ];

  return (
    <div className="h-svh">
      <AppShell
        brand={{ name: 'Harbor' }}
        nav={buildNav(base, counts)}
        activeId={activeId}
        onNavigate={(item) => navigate(NAV_PATHS[item.id] ?? '/')}
        user={{ name: CURRENT_USER.name, email: CURRENT_USER.email }}
        userMenu={[{ id: 'profile', label: 'Profile and settings' }, { id: 'team', label: 'Team' }, { id: 'audit', label: 'Audit log' }]}
        onUserMenu={(item) => navigate(item.id === 'profile' ? '/settings' : item.id === 'team' ? '/team' : '/audit-log')}
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
              <NotificationsPopover
                key={state.alerts.length}
                notifications={notifications}
                onRead={(id) => actions.readAlert(id)}
                onMarkAllRead={() => actions.readAllAlerts()}
                onOpenItem={(item) => {
                  const alert = state.alerts.find((candidate) => candidate.id === item.id);
                  if (alert) navigate(alert.href);
                }}
              />
            </div>
          </>
        }
      >
        {children}
      </AppShell>
      <CommandPalette
        groups={groups}
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onSelect={(command) => {
          if (command.id.startsWith('go:')) navigate(command.id.slice(3));
        }}
      />
    </div>
  );
}

