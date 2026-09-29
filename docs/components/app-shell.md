# AppShell

The frame around a signed-in app: sidebar, top bar, content.

A sidebar with grouped navigation that collapses to icons on desktop and turns into a drawer on a phone, a top bar with a slot for search and actions, a user menu at the foot of the sidebar, and a scrolling content area. It knows nothing about routing: you say which item is active and hear about clicks.

**Category:** Layout and navigation · **Family:** app · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add avatar badge button dropdown-menu sheet
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/app-shell.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

Files to copy: `src/components/app/app-shell.tsx`, `src/components/app/app-kit.ts`

## Usage

```tsx
<AppShell
  brand={{ name: 'Northwind Fleet' }}
  nav={[
    { items: [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }, { id: 'vehicles', label: 'Vehicles', icon: Truck, badge: 8 }] },
    { heading: 'Manage', items: [{ id: 'settings', label: 'Settings', icon: Settings }] },
  ]}
  activeId={page}
  onNavigate={(item) => setPage(item.id)}
  user={{ name: 'Priya Nair', email: 'priya@northwind.example' }}
  userMenu={[{ id: 'signout', label: 'Sign out', icon: LogOut, destructive: true }]}
  onUserMenu={(item) => item.id === 'signout' && signOut()}
  topBar={<NotificationsPopover notifications={notifications} />}
>
  {content}
</AppShell>
```

## Anatomy

```tsx
import { AppShell, type NavGroup, type NavItem } from '@/components/app/app-shell';

// Give the shell a height (h-svh for a whole page); it fills its parent.
// Items with an href render as links, so your router can handle the click in onNavigate.
<AppShell brand={brand} nav={groups} activeId={id} onNavigate={go}>
  {page}
</AppShell>
```

## Examples

### Collapsed to icons

```tsx
<AppShell brand={{ name: 'Northwind Fleet' }} nav={nav} activeId="work-orders" defaultCollapsed>{content}</AppShell>
```

## API reference

#### AppShell

Fills its parent. Below the md breakpoint the sidebar is a drawer opened from the top bar.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `brand` | `{ name; logo? }` | — | The name and an optional logo node. Without a logo a small accent square is drawn. |
| `nav` | `NavGroup[]` | — | Groups of { id, label, icon?, href?, badge? } items; a group may have a heading, and with `collapsible` the heading folds it away (`defaultCollapsed` starts it folded unless it holds the active item). |
| `activeId` | `string` | — | The id of the current item. |
| `onNavigate` | `(item: NavItem) => void` | — | Called on a click; also closes the drawer on a phone. |
| `user` | `{ name; email?; avatarUrl? }` | — | Shown at the foot of the sidebar. |
| `userMenu` | `UserMenuItem[]` | — | Items in the menu that opens from the user. |
| `onUserMenu` | `(item: UserMenuItem) => void` | — | Called when a menu item is chosen. |
| `topBar` | `ReactNode` | — | Placed in the top bar after the menu buttons. |
| `defaultCollapsed` | `boolean` | `false` | Start with the icon-only sidebar. |
| `collapsed` | `boolean` | — | Controlled collapsed state. |
| `onCollapsedChange` | `(collapsed: boolean) => void` | — | Called when the toggle is pressed. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the active item marker and the default logo. |
| `className` | `string` | — | Merged onto the root element. |

## Source

`src/components/app/app-shell.tsx`

```tsx
'use client';

import * as React from 'react';
import { ChevronDown, ChevronsUpDown, Menu, PanelLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { initials } from './app-kit';

export interface NavItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  /** When set the item renders as a link, so middle-click and copy-link work. */
  href?: string;
  badge?: string | number;
}

export interface NavGroup {
  heading?: string;
  items: NavItem[];
  /** Lets the heading fold the group away. Needs a heading; ignored in the icon-only sidebar. */
  collapsible?: boolean;
  /** With `collapsible`, start folded. A group holding the active item always starts open. */
  defaultCollapsed?: boolean;
}

export interface ShellUser {
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface UserMenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  destructive?: boolean;
}

/**
 * AppShell — the frame around a signed-in app: a sidebar that collapses to icons on desktop and becomes a drawer on
 * a phone, a top bar, and a scrolling content area. It knows nothing about routing; you say which item is active and
 * hear about clicks, so any router plugs in.
 */
export function AppShell({
  brand,
  nav,
  activeId,
  onNavigate,
  user,
  userMenu,
  onUserMenu,
  topBar,
  children,
  defaultCollapsed = false,
  collapsed: collapsedProp,
  onCollapsedChange,
  accentColor = '#ec4899',
  className,
}: {
  brand: { name: string; logo?: React.ReactNode };
  nav: NavGroup[];
  activeId?: string;
  onNavigate?: (item: NavItem) => void;
  user?: ShellUser;
  userMenu?: UserMenuItem[];
  onUserMenu?: (item: UserMenuItem) => void;
  /** Sits in the top bar after the menu buttons: a search box, a breadcrumb, actions. */
  topBar?: React.ReactNode;
  children?: React.ReactNode;
  defaultCollapsed?: boolean;
  /** Controlled collapsed state. */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  accentColor?: string;
  className?: string;
}) {
  const [inner, setInner] = React.useState(defaultCollapsed);
  const collapsed = collapsedProp ?? inner;
  const [drawer, setDrawer] = React.useState(false);

  const setCollapsed = (next: boolean) => {
    setInner(next);
    onCollapsedChange?.(next);
  };

  const body = (compact: boolean, afterPick?: () => void) => (
    <SidebarBody brand={brand} nav={nav} activeId={activeId} compact={compact} user={user} userMenu={userMenu} onUserMenu={onUserMenu} accentColor={accentColor} onPick={(item) => { onNavigate?.(item); afterPick?.(); }} />
  );

  return (
    <div className={cn('flex h-full min-h-[28rem] w-full overflow-hidden bg-background text-foreground', className)}>
      <aside className={cn('hidden shrink-0 border-r bg-muted/40 transition-[width] md:block', collapsed ? 'w-14' : 'w-60')}>{body(collapsed)}</aside>

      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent side="left" className="w-64 gap-0 p-0 sm:max-w-64">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Move between the sections of the app.</SheetDescription>
          {body(false, () => setDrawer(false))}
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-4">
          <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={() => setDrawer(true)} aria-label="Open navigation">
            <Menu />
          </Button>
          <Button variant="ghost" size="icon-sm" className="hidden md:inline-flex" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-pressed={collapsed}>
            <PanelLeft />
          </Button>
          <div className="flex min-w-0 flex-1 items-center gap-2">{topBar}</div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function SidebarBody({
  brand,
  nav,
  activeId,
  compact,
  user,
  userMenu,
  onUserMenu,
  onPick,
  accentColor,
}: {
  brand: { name: string; logo?: React.ReactNode };
  nav: NavGroup[];
  activeId?: string;
  compact: boolean;
  user?: ShellUser;
  userMenu?: UserMenuItem[];
  onUserMenu?: (item: UserMenuItem) => void;
  onPick: (item: NavItem) => void;
  accentColor: string;
}) {
  const [folded, setFolded] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(nav.filter((group) => group.collapsible && group.heading && group.defaultCollapsed && !group.items.some((item) => item.id === activeId)).map((group) => [group.heading as string, true])),
  );
  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-14 shrink-0 items-center gap-2 border-b px-4', compact && 'justify-center px-0')}>
        {brand.logo ?? <span className="size-5 shrink-0 rounded-md" style={{ background: accentColor }} aria-hidden />}
        {compact ? null : <span className="truncate text-sm font-bold">{brand.name}</span>}
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-2" aria-label="Main">
        {nav.map((group, index) => (
          <div key={group.heading ?? index}>
            {group.heading && !compact ? (
              group.collapsible ? (
                <button
                  type="button"
                  aria-expanded={!folded[group.heading]}
                  onClick={() => setFolded((current) => ({ ...current, [group.heading as string]: !current[group.heading as string] }))}
                  className="flex w-full items-center justify-between rounded-md px-2 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {group.heading}
                  <ChevronDown className={cn('size-3 transition-transform', folded[group.heading] && '-rotate-90')} />
                </button>
              ) : (
                <p className="px-2 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{group.heading}</p>
              )
            ) : null}
            <ul className={cn('space-y-0.5', group.collapsible && group.heading && !compact && folded[group.heading] && 'hidden')}>
              {group.items.map((item) => {
                const active = item.id === activeId;
                const Icon = item.icon;
                const inner = (
                  <>
                    <span className={cn('absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-full', active ? 'opacity-100' : 'opacity-0')} style={{ background: accentColor }} aria-hidden />
                    {Icon ? <Icon className={cn('size-4 shrink-0', active ? 'text-foreground' : 'text-muted-foreground')} /> : null}
                    {compact ? null : <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>}
                    {item.badge !== undefined && !compact ? <Badge variant="outline" className="font-mono tabular-nums">{item.badge}</Badge> : null}
                  </>
                );
                const cls = cn(
                  'relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                  compact && 'justify-center px-0',
                  active ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                );
                return (
                  <li key={item.id}>
                    {item.href ? (
                      <a href={item.href} className={cls} aria-current={active ? 'page' : undefined} title={compact ? item.label : undefined} onClick={(event) => { if (event.button === 0 && !event.metaKey && !event.ctrlKey) { event.preventDefault(); onPick(item); } }}>
                        {inner}
                      </a>
                    ) : (
                      <button type="button" className={cls} aria-current={active ? 'page' : undefined} title={compact ? item.label : undefined} onClick={() => onPick(item)}>
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {user ? (
        <div className="shrink-0 border-t p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={cn('flex w-full items-center gap-2.5 rounded-md p-2 text-left text-sm transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50', compact && 'justify-center p-1')}>
                <Avatar className="size-7">
                  {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
                {compact ? null : (
                  <>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{user.name}</span>
                      {user.email ? <span className="block truncate text-xs text-muted-foreground">{user.email}</span> : null}
                    </span>
                    <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            {userMenu?.length ? (
              <DropdownMenuContent side={compact ? 'right' : 'top'} align="start" className="w-56">
                <DropdownMenuLabel className="truncate">{user.email ?? user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userMenu.map((item) => (
                  <DropdownMenuItem key={item.id} variant={item.destructive ? 'destructive' : 'default'} onSelect={() => onUserMenu?.(item)}>
                    {item.icon ? <item.icon /> : null}
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            ) : null}
          </DropdownMenu>
        </div>
      ) : null}
    </div>
  );
}
```
