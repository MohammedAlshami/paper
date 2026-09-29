import * as React from 'react';
import { Inbox, Search, Truck } from 'lucide-react';
import { AppShell } from '@/components/app/app-shell';
import { CommandPalette } from '@/components/app/command-palette';
import { EmptyState } from '@/components/app/empty-state';
import { NotificationsPopover } from '@/components/app/notifications-popover';
import { PageHeader } from '@/components/app/page-header';
import { SettingsLayout } from '@/components/app/settings-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { COMMAND_GROUPS, NOTIFICATIONS, SETTINGS_SECTIONS, SHELL_NAV, SHELL_USER, SHELL_USER_MENU } from './fixtures/app-layout';

const NARROW = 'w-full max-w-[28rem]';
const MEDIUM = 'w-full max-w-[36rem]';
const WIDE = 'w-full max-w-[60rem]';

function ShellDemo({ defaultCollapsed = false, initial = 'vehicles' }: { defaultCollapsed?: boolean; initial?: string }) {
  const [active, setActive] = React.useState(initial);
  const label = SHELL_NAV.flatMap((group) => group.items).find((item) => item.id === active)?.label ?? '';
  return (
    <div className={`h-[520px] overflow-hidden rounded-xl border ${WIDE}`}>
      <AppShell
        brand={{ name: 'Northwind Fleet' }}
        nav={SHELL_NAV}
        activeId={active}
        onNavigate={(item) => setActive(item.id)}
        user={SHELL_USER}
        userMenu={SHELL_USER_MENU}
        defaultCollapsed={defaultCollapsed}
        topBar={
          <>
            <div className="relative max-w-xs flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-8 pl-8" placeholder="Search" aria-label="Search" />
            </div>
            <div className="ml-auto">
              <NotificationsPopover notifications={NOTIFICATIONS} />
            </div>
          </>
        }
      >
        <div className="space-y-6 p-6">
          <PageHeader title={label} description="This is where the page goes." breadcrumbs={[{ label: 'Northwind', href: '#' }, { label }]} actions={<Button size="sm">New</Button>} />
          <Card className="h-40 items-center justify-center border-dashed text-sm text-muted-foreground shadow-none">Page content</Card>
        </div>
      </AppShell>
    </div>
  );
}

function SettingsDemo() {
  const content: Record<string, React.ReactNode> = {
    profile: (
      <div className="max-w-md space-y-4">
        <div className="space-y-1.5"><Label htmlFor="s-name">Full name</Label><Input id="s-name" defaultValue="Priya Nair" /></div>
        <div className="space-y-1.5"><Label htmlFor="s-email">Email</Label><Input id="s-email" defaultValue="priya@northwind.example" /></div>
        <Button size="sm">Save changes</Button>
      </div>
    ),
    notifications: (
      <ul className="max-w-md divide-y rounded-lg border">
        {['Work order assigned to me', 'Service due this week', 'Low stock alerts'].map((name, index) => (
          <li key={name} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            {name}
            <Switch defaultChecked={index !== 2} aria-label={name} />
          </li>
        ))}
      </ul>
    ),
    security: <p className="text-sm text-muted-foreground">Change your password or turn on two-step sign-in.</p>,
    billing: <p className="text-sm text-muted-foreground">Team plan, billed monthly.</p>,
  };
  return <SettingsLayout className={WIDE} sections={SETTINGS_SECTIONS.map((section) => ({ ...section, content: content[section.id] }))} />;
}

function PaletteTrigger() {
  const [open, setOpen] = React.useState(false);
  const [last, setLast] = React.useState('');
  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant="outline" onClick={() => setOpen(true)} className="w-64 justify-between text-muted-foreground">
        <span className="flex items-center gap-2"><Search /> Search</span>
        <kbd className="font-mono text-[10px]">⌘K</kbd>
      </Button>
      <CommandPalette groups={COMMAND_GROUPS} open={open} onOpenChange={setOpen} onSelect={(command) => setLast(command.label)} />
      <p className="text-xs text-muted-foreground">{last ? `Ran: ${last}` : 'Press ⌘K or the button.'}</p>
    </div>
  );
}

export const APP_LAYOUT_PREVIEWS: Record<string, React.ReactNode> = {
  'app-shell': <ShellDemo />,
  'page-header': (
    <PageHeader
      className={WIDE}
      breadcrumbs={[{ label: 'Fleet', href: '#' }, { label: 'Vehicles', href: '#' }, { label: 'Van 21' }]}
      title="Van 21"
      badge={<Badge variant="outline">In the shop</Badge>}
      description="2019 Mercedes Sprinter 2500 · 231,880 km. Assigned to Lena Fischer."
      actions={<><Button variant="outline" size="sm">Export</Button><Button size="sm">Schedule service</Button></>}
    />
  ),
  'settings-layout': <SettingsDemo />,
  'command-palette': <CommandPalette inline className={MEDIUM} groups={COMMAND_GROUPS} />,
  'notifications-popover': (
    <div className="flex min-h-[26rem] w-full max-w-[28rem] justify-end">
      <NotificationsPopover notifications={NOTIFICATIONS} defaultOpen />
    </div>
  ),
  'empty-state': (
    <EmptyState
      className={MEDIUM}
      icon={Truck}
      title="No vehicles yet"
      description="Add your first vehicle to start tracking its health, services and costs."
      action={{ label: 'Add a vehicle' }}
      secondaryAction={{ label: 'Import a CSV' }}
    />
  ),
};

export const APP_LAYOUT_EXAMPLES: Record<string, { label: string; node: React.ReactNode }[]> = {
  'app-shell': [{ label: 'Collapsed to icons', node: <ShellDemo defaultCollapsed initial="work-orders" /> }],
  'page-header': [{ label: 'Title only', node: <PageHeader className={NARROW} title="Settings" /> }],
  'settings-layout': [],
  'command-palette': [{ label: 'As a dialog', node: <PaletteTrigger /> }],
  'notifications-popover': [{ label: 'Closed, with a count', node: <NotificationsPopover notifications={NOTIFICATIONS} /> }, { label: 'Nothing new', node: <NotificationsPopover notifications={[]} /> }],
  'empty-state': [
    { label: 'No search results', node: <EmptyState className={NARROW} icon={Search} title="No results for “brake”" description="Try a shorter word, or clear the filters." action={{ label: 'Clear filters' }} /> },
    { label: 'Without a border', node: <EmptyState className={NARROW} bordered={false} icon={Inbox} title="Inbox zero" description="Nothing needs you right now." /> },
  ],
};
