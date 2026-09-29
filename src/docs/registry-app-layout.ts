import type { ApiRow } from './md';
import type { ComponentEntry } from './registry';

const row = (prop: string, type: string, description: string, def?: string): ApiRow => ({ prop, type, description, ...(def ? { default: def } : {}) });
const accent = (what: string) => row('accentColor', 'string', `Colour of ${what}.`, "'#ec4899'");
const cls = (on = 'the root element') => row('className', 'string', `Merged onto ${on}.`);
const icons = ['lucide-react'];
const CATEGORY = 'Layout and navigation';

const entry = (e: Omit<ComponentEntry, 'status' | 'file' | 'category'> & { file: string }): ComponentEntry => ({ status: 'new', category: CATEGORY, ...e, file: `components/app/${e.file}.tsx` });

export const APP_LAYOUT_COMPONENTS: ComponentEntry[] = [
  entry({
    id: 'app-shell',
    name: 'AppShell',
    tagline: 'The frame around a signed-in app: sidebar, top bar, content.',
    description: 'A sidebar with grouped navigation that collapses to icons on desktop and turns into a drawer on a phone, a top bar with a slot for search and actions, a user menu at the foot of the sidebar, and a scrolling content area. It knows nothing about routing: you say which item is active and hear about clicks.',
    file: 'app-shell',
    wide: true,
    primitives: ['avatar', 'badge', 'button', 'dropdown-menu', 'sheet'],
    deps: icons,
    usage: `<AppShell
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
</AppShell>`,
    anatomy: `import { AppShell, type NavGroup, type NavItem } from '@/components/app/app-shell';

// Give the shell a height (h-svh for a whole page); it fills its parent.
// Items with an href render as links, so your router can handle the click in onNavigate.
<AppShell brand={brand} nav={groups} activeId={id} onNavigate={go}>
  {page}
</AppShell>`,
    examples: [{ label: 'Collapsed to icons', code: `<AppShell brand={{ name: 'Northwind Fleet' }} nav={nav} activeId="work-orders" defaultCollapsed>{content}</AppShell>` }],
    api: [
      {
        title: 'AppShell',
        description: 'Fills its parent. Below the md breakpoint the sidebar is a drawer opened from the top bar.',
        rows: [
          row('brand', '{ name; logo? }', 'The name and an optional logo node. Without a logo a small accent square is drawn.'),
          row('nav', 'NavGroup[]', 'Groups of { id, label, icon?, href?, badge? } items; a group may have a heading.'),
          row('activeId', 'string', 'The id of the current item.'),
          row('onNavigate', '(item: NavItem) => void', 'Called on a click; also closes the drawer on a phone.'),
          row('user', '{ name; email?; avatarUrl? }', 'Shown at the foot of the sidebar.'),
          row('userMenu', 'UserMenuItem[]', 'Items in the menu that opens from the user.'),
          row('onUserMenu', '(item: UserMenuItem) => void', 'Called when a menu item is chosen.'),
          row('topBar', 'ReactNode', 'Placed in the top bar after the menu buttons.'),
          row('defaultCollapsed', 'boolean', 'Start with the icon-only sidebar.', 'false'),
          row('collapsed', 'boolean', 'Controlled collapsed state.'),
          row('onCollapsedChange', '(collapsed: boolean) => void', 'Called when the toggle is pressed.'),
          accent('the active item marker and the default logo'),
          cls(),
        ],
      },
    ],
  }),
  entry({
    id: 'page-header',
    name: 'PageHeader',
    tagline: 'The top of a page: crumbs, title, status, actions.',
    description: 'Breadcrumbs above a title that has room for a status badge, a line of description, and a row of action buttons that drops under the title on a phone.',
    file: 'page-header',
    primitives: [],
    deps: icons,
    usage: `<PageHeader
  breadcrumbs={[{ label: 'Fleet', href: '/fleet' }, { label: 'Vehicles', href: '/vehicles' }, { label: 'Van 21' }]}
  onCrumb={(crumb) => navigate(crumb.href!)}
  title="Van 21"
  badge={<Badge variant="outline">In the shop</Badge>}
  description="2019 Mercedes Sprinter 2500 · 231,880 km."
  actions={<Button size="sm">Schedule service</Button>}
/>`,
    anatomy: `import { PageHeader } from '@/components/app/page-header';

// The last crumb is the current page and is never a link.
<PageHeader title={title} breadcrumbs={crumbs} actions={buttons} />`,
    examples: [{ label: 'Title only', code: `<PageHeader title="Settings" />` }],
    api: [{ title: 'PageHeader', rows: [row('title', 'string', 'The page title.'), row('description', 'ReactNode', 'A line under the title.'), row('breadcrumbs', 'Crumb[]', '{ label, href? } for each step; the last is the current page.'), row('onCrumb', '(crumb: Crumb) => void', 'Called when a crumb link is clicked, so your router can take over.'), row('badge', 'ReactNode', 'Beside the title, usually a status Badge.'), row('actions', 'ReactNode', 'Buttons on the right.'), cls()] }],
  }),
  entry({
    id: 'settings-layout',
    name: 'SettingsLayout',
    tagline: 'A list of sections on the left, the chosen one on the right.',
    description: 'The shape of most settings pages. Sections are listed as a vertical menu on desktop and as a row of pills on a phone, and each brings its own content, so the forms stay where you write them.',
    file: 'settings-layout',
    wide: true,
    primitives: [],
    deps: icons,
    usage: `<SettingsLayout
  sections={[
    { id: 'profile', label: 'Profile', icon: User, description: 'How you appear to your team.', content: <ProfileForm /> },
    { id: 'notifications', label: 'Notifications', icon: Bell, content: <NotificationPreferences /> },
  ]}
  onChange={(id) => setTab(id)}
/>`,
    anatomy: `import { SettingsLayout, type SettingsSection } from '@/components/app/settings-layout';

// Uncontrolled by default; pass activeId + onChange to keep the section in the URL.
<SettingsLayout sections={sections} activeId={section} onChange={setSection} />`,
    examples: [{ label: 'Controlled', code: `<SettingsLayout sections={sections} activeId={section} onChange={setSection} />` }],
    api: [{ title: 'SettingsLayout', rows: [row('sections', 'SettingsSection[]', 'id, label, icon?, description? and content for each section.'), row('activeId', 'string', 'Controlled section id.'), row('defaultActiveId', 'string', 'The section shown first when uncontrolled. Defaults to the first.'), row('onChange', '(id: string) => void', 'Called when a section is picked.'), accent('the active marker'), cls()] }],
  }),
  entry({
    id: 'command-palette',
    name: 'CommandPalette',
    tagline: 'Cmd-K: search grouped commands, arrow to pick, enter to run.',
    description: 'A search box over grouped commands with keyboard selection and keyword matching. Use it as a dialog that toggles on Cmd-K or Ctrl-K, or draw it in place with inline.',
    file: 'command-palette',
    primitives: ['card', 'dialog'],
    deps: icons,
    usage: `const [open, setOpen] = React.useState(false);

<CommandPalette
  open={open}
  onOpenChange={setOpen}
  groups={[
    { heading: 'Go to', commands: [{ id: 'vehicles', label: 'Vehicles', icon: Truck, shortcut: 'G V', keywords: ['fleet'] }] },
    { heading: 'Create', commands: [{ id: 'new-wo', label: 'New work order', icon: Wrench }] },
  ]}
  onSelect={(command) => run(command.id)}
/>`,
    anatomy: `import { CommandPalette, type CommandGroup } from '@/components/app/command-palette';

// The Cmd-K toggle is wired when you pass onOpenChange. Selecting a command also closes the dialog.
<CommandPalette open={open} onOpenChange={setOpen} groups={groups} onSelect={run} />`,
    examples: [{ label: 'Drawn in place', code: `<CommandPalette inline groups={groups} onSelect={run} />` }],
    api: [{ title: 'CommandPalette', rows: [row('groups', 'CommandGroup[]', 'heading and commands; each command has id, label, icon?, keywords?, shortcut?.'), row('onSelect', '(command: Command) => void', 'Called on click or enter.'), row('open', 'boolean', 'Dialog state.'), row('onOpenChange', '(open: boolean) => void', 'Called on close, and on the Cmd-K toggle.'), row('inline', 'boolean', 'Draw the panel in a card instead of a dialog.', 'false'), row('hotkey', 'boolean', 'Toggle on Cmd-K or Ctrl-K.', 'true'), row('placeholder', 'string', 'Search box placeholder.', "'Type a command or search'"), accent('the active row marker'), cls('the card or dialog')] }],
  }),
  entry({
    id: 'notifications-popover',
    name: 'NotificationsPopover',
    tagline: 'A bell with an unread count and a short list.',
    description: 'A ghost button with an unread badge that opens a popover of notifications. Read state is kept inside, seeded from your list; every change is reported so you can save it.',
    file: 'notifications-popover',
    primitives: ['button', 'popover'],
    deps: icons,
    usage: `<NotificationsPopover
  notifications={[
    { id: 'n1', title: 'Van 21 failed its inspection', body: 'A work order was opened.', time: '4 min ago', icon: Wrench },
    { id: 'n2', title: 'Insurance expires soon', time: 'Yesterday', read: true },
  ]}
  onRead={(id) => markRead(id)}
  onMarkAllRead={() => markAllRead()}
  onOpenItem={(item) => open(item.id)}
/>`,
    anatomy: `import { NotificationsPopover, type AppNotification } from '@/components/app/notifications-popover';

// Put it in the AppShell topBar. time is already formatted text, so use your own relative-time helper.
<NotificationsPopover notifications={items} />`,
    examples: [{ label: 'Nothing new', code: `<NotificationsPopover notifications={[]} />` }],
    api: [{ title: 'NotificationsPopover', rows: [row('notifications', 'AppNotification[]', 'id, title, body?, time, read?, icon?.'), row('onRead', '(id: string) => void', 'Called when one is opened.'), row('onMarkAllRead', '() => void', 'Called from the Mark all read button.'), row('onOpenItem', '(n: AppNotification) => void', 'Called when an item is clicked.'), row('defaultOpen', 'boolean', 'Start open.', 'false'), accent('the count and unread dots'), cls('the bell button')] }],
  }),
  entry({
    id: 'empty-state',
    name: 'EmptyState',
    tagline: 'Nothing here yet: say so, and offer the next step.',
    description: 'An icon, a title, a line of explanation and up to two actions, in a dashed panel. For a first-run list or a search with no results.',
    file: 'empty-state',
    primitives: ['button'],
    deps: icons,
    usage: `<EmptyState
  icon={Truck}
  title="No vehicles yet"
  description="Add your first vehicle to start tracking its health, services and costs."
  action={{ label: 'Add a vehicle', onClick: openForm }}
  secondaryAction={{ label: 'Import a CSV' }}
/>`,
    anatomy: `import { EmptyState } from '@/components/app/empty-state';

<EmptyState icon={Inbox} title="Inbox zero" description="Nothing needs you right now." bordered={false} />`,
    examples: [{ label: 'No search results', code: `<EmptyState icon={Search} title="No results" description="Try a shorter word." action={{ label: 'Clear filters' }} />` }],
    api: [{ title: 'EmptyState', rows: [row('title', 'string', 'What is missing.'), row('description', 'ReactNode', 'Why, or what to do.'), row('icon', 'LucideIcon', 'Drawn in a circle in the accent colour.'), row('action', '{ label; onClick? }', 'The primary button.'), row('secondaryAction', '{ label; onClick? }', 'An outline button beside it.'), row('bordered', 'boolean', 'A dashed border around it.', 'true'), accent('the icon'), cls()] }],
  }),
];
