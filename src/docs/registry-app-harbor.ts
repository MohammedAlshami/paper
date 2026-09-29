import type { ApiRow } from './md';
import type { ComponentEntry } from './registry';
import { APP_HARBOR_CATALOG_COMPONENTS } from './registry-app-harbor-catalog';
import { APP_HARBOR_DELIVERY_COMPONENTS } from './registry-app-harbor-delivery';
import { APP_HARBOR_FLEET_COMPONENTS } from './registry-app-harbor-fleet';
import { APP_HARBOR_INSIGHT_COMPONENTS } from './registry-app-harbor-insight';
import { APP_HARBOR_OPERATIONS_COMPONENTS } from './registry-app-harbor-operations';

const row = (prop: string, type: string, description: string, def?: string): ApiRow => ({ prop, type, description, ...(def ? { default: def } : {}) });
const accent = (what: string) => row('accentColor', 'string', `Colour of ${what}.`, "'#ec4899'");
const cls = (on = 'the root element') => row('className', 'string', `Merged onto ${on}.`);
const icons = ['lucide-react'];

const entry = (category: string, e: Omit<ComponentEntry, 'status' | 'file' | 'category'> & { file: string }): ComponentEntry => ({ status: 'new', category, ...e, file: `components/app/${e.file}.tsx` });
const data = (e: Parameters<typeof entry>[1]) => entry('Data and dashboards', e);
const forms = (e: Parameters<typeof entry>[1]) => entry('Forms and feedback', e);

/** Shared components Harbor needed, then the ones each section added. */
export const APP_HARBOR_BASE_COMPONENTS: ComponentEntry[] = [
  data({
    id: 'filter-bar',
    wide: true,
    name: 'FilterBar',
    tagline: 'The strip above a list: views, search and filters in one place.',
    description: 'Saved views as tabs with counts, a search box, one select per filter, and a Clear button that appears when anything is set. It is fully controlled and never filters anything itself; it only reports what the person asked for.',
    file: 'filter-bar',
    primitives: ['button', 'input', 'select'],
    deps: icons,
    usage: `const [view, setView] = useState('all');
const [search, setSearch] = useState('');
const [filters, setFilters] = useState<Record<string, string | undefined>>({});

<FilterBar
  views={[{ id: 'all', label: 'All', count: 62 }, { id: 'late', label: 'Late', count: 4 }]}
  activeView={view}
  onViewChange={setView}
  search={search}
  onSearchChange={setSearch}
  searchPlaceholder="Search orders"
  filters={[{ id: 'store', label: 'Store', options: [{ value: 'mission', label: 'Mission' }, { value: 'sunset', label: 'Sunset' }] }]}
  values={filters}
  onFilterChange={(id, value) => setFilters((current) => ({ ...current, [id]: value }))}
  onClear={() => { setSearch(''); setFilters({}); }}
  trailing={<DateRangePicker onChange={setRange} />}
/>`,
    anatomy: `import { FilterBar, type FilterDefinition, type SavedView } from '@/components/app/filter-bar';

// Filter the rows yourself from view, search and the values; the bar only holds the controls.
<FilterBar views={views} activeView={view} search={search} filters={defs} values={values} />`,
    examples: [{ label: 'Filters only', code: `<FilterBar filters={defs} values={values} onFilterChange={setFilter} onClear={clear} />` }],
    api: [{ title: 'FilterBar', description: 'Controlled. A missing or empty filter value means "all".', rows: [row('views', 'SavedView[]', 'Tabs along the top: id, label and an optional count.'), row('activeView', 'string', 'The id of the selected view.'), row('onViewChange', '(id: string) => void', 'Called when a view tab is chosen.'), row('search', 'string', 'The search text.'), row('onSearchChange', '(value: string) => void', 'Shows the search box when given.'), row('searchPlaceholder', 'string', 'Placeholder and accessible label of the search box.', "'Search'"), row('filters', 'FilterDefinition[]', 'One select each: id, label and options.'), row('values', 'Record<string, string | undefined>', 'The chosen value per filter id.'), row('onFilterChange', '(id, value) => void', 'Value is undefined for "All".'), row('onClear', '() => void', 'Called by the Clear button, which shows once a filter or the search is set.'), row('trailing', 'ReactNode', 'Extra controls on the right, such as a date range.'), accent('the active view marker'), cls()] }],
  }),
  data({
    id: 'date-range-picker',
    wide: true,
    name: 'DateRangePicker',
    tagline: 'A range of days, from presets or a two-month calendar.',
    description: 'A button that opens presets (today, last 7 days, this month and so on) beside a two-month calendar, one month on a phone. Click a start day, then an end day, with a live preview as you hover. Dates are ISO strings, so there is no date library and no time-zone drift.',
    file: 'date-range-picker',
    primitives: ['button', 'popover'],
    deps: icons,
    usage: `const [range, setRange] = useState<DateRange>({ from: '2026-09-01', to: '2026-09-29' });

<DateRangePicker value={range} onChange={setRange} today="2026-09-29" />`,
    anatomy: `import { DateRangePicker, DEFAULT_PRESETS, type DateRange, type DatePreset } from '@/components/app/date-range-picker';

// Dates are "YYYY-MM-DD". Add your own presets next to the defaults:
const presets: DatePreset[] = [...DEFAULT_PRESETS, { id: 'qtd', label: 'Quarter to date', range: (today) => ({ from: '2026-07-01', to: today }) }];`,
    examples: [{ label: 'Limited to the past', code: `<DateRangePicker max="2026-09-29" today="2026-09-29" onChange={setRange} />` }],
    api: [{ title: 'DateRangePicker', description: 'Controlled with value, or uncontrolled with defaultValue.', rows: [row('value', 'DateRange', 'The chosen { from, to } as ISO dates.'), row('defaultValue', 'DateRange', 'Starting range when uncontrolled.'), row('onChange', '(range: DateRange) => void', 'Called once a range is complete.'), row('today', 'string', 'ISO date treated as today, for presets and the marker.', 'the current date'), row('presets', 'DatePreset[]', 'Shortcuts on the left: id, label and range(today).', 'DEFAULT_PRESETS'), row('min', 'string', 'Earliest selectable day.'), row('max', 'string', 'Latest selectable day.'), row('placeholder', 'string', 'Shown before a range is chosen.', "'Pick a date range'"), row('defaultOpen', 'boolean', 'Open on first render.', 'false'), accent('the selected days'), cls('the trigger button')] }],
  }),
  data({
    id: 'kanban-board',
    wide: true,
    name: 'KanbanBoard',
    tagline: 'Columns of cards you drag along a process.',
    description: 'A generic board: name the columns, say how to read an item\'s id and column, draw a card, and handle onMove. Cards drag between columns with the mouse; on a phone every card has a Move menu instead. The board scrolls sideways and snaps to columns.',
    file: 'kanban-board',
    primitives: ['dropdown-menu'],
    deps: icons,
    usage: `<KanbanBoard
  columns={[{ id: 'new', title: 'New' }, { id: 'picking', title: 'Picking' }, { id: 'packed', title: 'Packed' }]}
  items={orders}
  getId={(order) => order.id}
  getColumn={(order) => order.status}
  renderCard={(order) => (<div><p className="text-sm font-medium">{order.number}</p><p className="text-xs text-muted-foreground">{order.customer}</p></div>)}
  onMove={(order, status) => setStatus(order.id, status)}
  onCardClick={(order) => open(order.id)}
/>`,
    anatomy: `import { KanbanBoard, type KanbanColumn } from '@/components/app/kanban-board';

// The board keeps no items. onMove tells you which one went where; update your state and pass the new items back.
<KanbanBoard<Order> columns={columns} items={orders} getId={(o) => o.id} getColumn={(o) => o.status} renderCard={card} onMove={move} />`,
    examples: [{ label: 'Narrow columns', code: `<KanbanBoard columns={columns} items={items} getId={id} getColumn={col} renderCard={card} columnWidth="w-56" />` }],
    api: [{ title: 'KanbanBoard<T>', description: 'Generic over the item type.', rows: [row('columns', 'KanbanColumn[]', 'id, title and an optional hint for each column.'), row('items', 'T[]', 'Every card on the board.'), row('getId', '(item: T) => string', 'A stable id per item.'), row('getColumn', '(item: T) => string', 'Which column an item is in.'), row('renderCard', '(item: T) => ReactNode', 'The card body.'), row('onMove', '(item: T, toColumnId: string) => void', 'Called on a drop or a Move menu choice. Without it cards do not move.'), row('onCardClick', '(item: T) => void', 'Called when a card is clicked.'), row('emptyText', 'string', 'Shown in an empty column.', "'Nothing here'"), row('columnWidth', 'string', 'A Tailwind width class for every column.', "'w-72'"), accent('the drop target outline'), cls()] }],
  }),
  data({
    id: 'timeline',
    name: 'Timeline',
    tagline: 'What happened, what is happening, what is still to come.',
    description: 'A vertical list of events joined by a line. Done events are solid, the current one uses the accent colour, and upcoming ones are outlined with a dashed line. Each can carry an icon, a detail line and a time.',
    file: 'timeline',
    primitives: [],
    deps: icons,
    usage: `<Timeline
  events={[
    { id: 'placed', title: 'Order placed', time: '09:12' },
    { id: 'packed', title: 'Packed at Mission', detail: 'By Sam O.', time: '10:40' },
    { id: 'out', title: 'Out for delivery', state: 'current', icon: Truck, time: '11:05' },
    { id: 'delivered', title: 'Delivered', state: 'upcoming', detail: 'Estimated 12:30' },
  ]}
/>`,
    anatomy: `import { Timeline, type TimelineEvent } from '@/components/app/timeline';

// state: 'done' (default) | 'current' | 'upcoming'. time is free text.
<Timeline events={events} />`,
    examples: [{ label: 'All done', code: `<Timeline events={[{ id: 'a', title: 'Placed', time: 'Mon' }, { id: 'b', title: 'Delivered', time: 'Tue' }]} />` }],
    api: [{ title: 'Timeline', description: 'A list; each event is one step.', rows: [row('events', 'TimelineEvent[]', 'id, title, detail?, time?, icon? and state? for each step.'), accent('the current step'), cls()] }],
  }),
  data({
    id: 'roster-grid',
    wide: true,
    name: 'RosterGrid',
    tagline: 'Who works when: people down the side, days across.',
    description: 'A grid with a chip per person per day for the shift. Click a cell to choose a shift or clear it. Names stay in place while the days scroll sideways on a phone, and today is marked.',
    file: 'roster-grid',
    primitives: ['popover'],
    deps: [],
    usage: `<RosterGrid
  people={[{ id: 'p1', name: 'Priya Nair', role: 'Driver' }, { id: 'p2', name: 'Diego Alvarez', role: 'Driver' }]}
  days={['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01']}
  shiftTypes={[{ id: 'am', label: 'Morning', short: 'AM', hours: '06:00 – 14:00' }, { id: 'pm', label: 'Evening', short: 'PM', hours: '14:00 – 22:00', accent: true }]}
  defaultAssignments={{ 'p1.2026-09-29': 'am' }}
  onAssign={(personId, day, shiftId) => save(personId, day, shiftId)}
  today="2026-09-29"
/>`,
    anatomy: `import { RosterGrid, type RosterPerson, type ShiftType } from '@/components/app/roster-grid';

// Assignments are keyed "personId.YYYY-MM-DD" and hold a shift id. Leave them out and the grid keeps its own.
<RosterGrid people={people} days={days} shiftTypes={shifts} assignments={assignments} onAssign={assign} />`,
    examples: [{ label: 'Controlled', code: `<RosterGrid people={people} days={days} shiftTypes={shifts} assignments={assignments} onAssign={(p, d, s) => setAssignments({ ...assignments, [\`\${p}.\${d}\`]: s ?? undefined })} />` }],
    api: [{ title: 'RosterGrid', description: 'Scrolls sideways when the days do not fit.', rows: [row('people', 'RosterPerson[]', 'id, name and an optional role for each row.'), row('days', 'string[]', 'ISO dates, one column each, in order.'), row('shiftTypes', 'ShiftType[]', 'id, label, short, hours? and accent? for each shift.'), row('assignments', 'Record<string, string | undefined>', 'Controlled shift id per "personId.day".'), row('defaultAssignments', 'Record<string, string | undefined>', 'Starting assignments when uncontrolled.'), row('onAssign', '(personId, day, shiftId | null) => void', 'Called when a cell changes; null clears it.'), row('today', 'string', 'ISO date to highlight.'), accent('accent shifts'), cls()] }],
  }),
  data({
    id: 'bulk-action-bar',
    name: 'BulkActionBar',
    tagline: 'Appears when rows are selected: how many, and what to do with them.',
    description: 'A dark bar that floats at the bottom of a list once the count is above zero, with the actions you offer and a way to clear the selection. It renders nothing at zero, so it can sit permanently at the end of a page.',
    file: 'bulk-action-bar',
    primitives: ['button'],
    deps: icons,
    usage: `<BulkActionBar
  count={selected.length}
  noun="orders selected"
  actions={[
    { id: 'pack', label: 'Mark packed', icon: PackageCheck, onSelect: () => pack(selected) },
    { id: 'cancel', label: 'Cancel', icon: Trash2, destructive: true, onSelect: () => cancel(selected) },
  ]}
  onClear={() => setSelected([])}
/>`,
    anatomy: `import { BulkActionBar, type BulkAction } from '@/components/app/bulk-action-bar';

// Put it at the end of the page's content; it sticks to the bottom of the scrolling area.
<BulkActionBar count={n} actions={actions} onClear={clear} />`,
    examples: [{ label: 'One action', code: `<BulkActionBar count={3} actions={[{ id: 'export', label: 'Export', onSelect: exportRows }]} />` }],
    api: [{ title: 'BulkActionBar', description: 'Sticky at the bottom of its scroll container.', rows: [row('count', 'number', 'How many are selected. The bar is hidden at 0.'), row('noun', 'string', 'Text after the count.', "'selected'"), row('actions', 'BulkAction[]', 'id, label, icon?, destructive? and onSelect.'), row('onClear', '() => void', 'Adds a close button.'), cls()] }],
  }),
  entry('Layout and navigation', {
    id: 'page-tabs',
    name: 'PageTabs',
    tagline: 'The tab strip under a page header: one record, several views.',
    description: 'Underlined tabs with optional counts that switch between views of the same page, such as Overview, History and Documents. Tabs can be links, so each view can be its own route and open in a new tab.',
    file: 'page-tabs',
    primitives: [],
    deps: [],
    usage: `<PageTabs
  activeId="history"
  tabs={[
    { id: 'overview', label: 'Overview', href: '/vehicles/v21' },
    { id: 'history', label: 'History', count: 14, href: '/vehicles/v21/history' },
    { id: 'documents', label: 'Documents', count: 3, href: '/vehicles/v21/documents' },
  ]}
  onChange={(tab) => navigate(tab.href!)}
/>`,
    anatomy: `import { PageTabs, type PageTab } from '@/components/app/page-tabs';

// With href a tab is a link; onChange is called on a plain click so your router can take over.
<PageTabs tabs={tabs} activeId={id} onChange={go} />`,
    examples: [{ label: 'Buttons, not links', code: `<PageTabs tabs={[{ id: 'a', label: 'All' }, { id: 'b', label: 'Late', count: 4 }]} activeId={tab} onChange={(t) => setTab(t.id)} />` }],
    api: [{ title: 'PageTabs', description: 'Scrolls sideways on a narrow screen.', rows: [row('tabs', 'PageTab[]', 'id, label, count? and href? for each tab.'), row('activeId', 'string', 'The id of the current tab.'), row('onChange', '(tab: PageTab) => void', 'Called on a click; for links, a plain click only (modified clicks open a new tab).'), accent('the active underline'), cls()] }],
  }),
  forms({
    id: 'multi-select',
    name: 'MultiSelect',
    tagline: 'Pick several options from a searchable list.',
    description: 'A field that opens a searchable checklist. The choices appear as removable chips in the field, collapsing to "+N" past a limit, and the list has a Clear link. Use it for tags, stores, roles: anything with more than one answer.',
    file: 'multi-select',
    primitives: ['badge', 'checkbox', 'input', 'popover'],
    deps: icons,
    usage: `<MultiSelect
  options={[{ value: 'mission', label: 'Mission', description: '2200 Mission St' }, { value: 'sunset', label: 'Sunset' }]}
  value={stores}
  onChange={setStores}
  placeholder="Choose stores"
/>`,
    anatomy: `import { MultiSelect, type MultiSelectOption } from '@/components/app/multi-select';

// value is the list of chosen option values. Uncontrolled? pass defaultValue instead.
<MultiSelect options={options} value={value} onChange={setValue} />`,
    examples: [{ label: 'Show more chips', code: `<MultiSelect options={options} defaultValue={['a', 'b', 'c', 'd']} maxChips={4} />` }],
    api: [{ title: 'MultiSelect', description: 'Controlled with value, or uncontrolled with defaultValue.', rows: [row('options', 'MultiSelectOption[]', 'value, label and an optional description.'), row('value', 'string[]', 'The chosen values.'), row('defaultValue', 'string[]', 'Starting choices when uncontrolled.', '[]'), row('onChange', '(value: string[]) => void', 'Called on every change.'), row('placeholder', 'string', 'Shown when nothing is chosen.', "'Select'"), row('searchPlaceholder', 'string', 'Placeholder of the filter box.', "'Search'"), row('maxChips', 'number', 'Chips shown before "+N".', '3'), row('defaultOpen', 'boolean', 'Open on first render.', 'false'), cls('the trigger')] }],
  }),
  forms({
    id: 'file-upload',
    name: 'FileUpload',
    tagline: 'A drop zone and the files under it, with progress.',
    description: 'Drop files or browse for them. Each file gets a row with a progress bar, a size once it is done, an error if it is too big, and a remove button. It does no networking: by default it animates the progress, or drive it yourself with items and onFiles.',
    file: 'file-upload',
    primitives: ['button'],
    deps: icons,
    usage: `<FileUpload
  accept="image/*,.pdf"
  maxSizeMb={5}
  hint="PNG, JPG or PDF up to 5 MB"
  onFiles={(files) => upload(files)}
/>`,
    anatomy: `import { FileUpload, type UploadItem } from '@/components/app/file-upload';

// Uncontrolled it animates progress itself. To upload for real, pass items and update them as you send:
<FileUpload items={items} onFiles={start} onRemove={cancel} simulate={false} />`,
    examples: [{ label: 'A single file', code: `<FileUpload multiple={false} accept=".csv" hint="A CSV of products" onFiles={([file]) => importCsv(file)} />` }],
    api: [{ title: 'FileUpload', description: 'Files are checked against maxSizeMb before onFiles is called.', rows: [row('items', 'UploadItem[]', 'Controlled list: id, name, size, progress, status and error.'), row('defaultItems', 'UploadItem[]', 'Starting list when uncontrolled.', '[]'), row('onFiles', '(files: File[]) => void', 'Called with the accepted files.'), row('onRemove', '(item: UploadItem) => void', 'Called when a row is removed.'), row('onChange', '(items: UploadItem[]) => void', 'Called when the internal list changes.'), row('accept', 'string', 'The input accept attribute.'), row('multiple', 'boolean', 'Allow several files.', 'true'), row('maxSizeMb', 'number', 'Largest file accepted.', '10'), row('hint', 'string', 'Line under the drop prompt.'), row('simulate', 'boolean', 'Animate progress for internally kept files.', 'true'), accent('the progress bar and drop outline'), cls()] }],
  }),
  forms({
    id: 'confirm-dialog',
    name: 'ConfirmDialog',
    tagline: '"Are you sure?" for anything that is hard to undo.',
    description: 'A small dialog with a title, a line of explanation and two buttons. onConfirm can be async: the button shows a spinner until it settles, then the dialog closes, or stays open with the error message if it throws.',
    file: 'confirm-dialog',
    primitives: ['button', 'dialog'],
    deps: icons,
    usage: `<ConfirmDialog
  trigger={<Button variant="outline">Cancel order</Button>}
  title="Cancel order #1042?"
  description="The customer will be refunded and the items returned to stock."
  confirmLabel="Cancel order"
  destructive
  onConfirm={async () => { await cancelOrder('o-1042'); }}
/>`,
    anatomy: `import { ConfirmDialog } from '@/components/app/confirm-dialog';

// Give it a trigger, or control it yourself with open and onOpenChange.
<ConfirmDialog open={open} onOpenChange={setOpen} title="Delete?" onConfirm={remove} destructive />`,
    examples: [{ label: 'Controlled', code: `<ConfirmDialog open={open} onOpenChange={setOpen} title="Discard changes?" confirmLabel="Discard" onConfirm={discard} />` }],
    api: [{ title: 'ConfirmDialog', description: 'Closing is blocked while onConfirm is running.', rows: [row('open', 'boolean', 'Controlled open state.'), row('onOpenChange', '(open: boolean) => void', 'Called when it opens or closes.'), row('trigger', 'ReactNode', 'An element that opens the dialog.'), row('title', 'string', 'The question.'), row('description', 'ReactNode', 'What will happen.'), row('confirmLabel', 'string', 'Text of the confirm button.', "'Confirm'"), row('cancelLabel', 'string', 'Text of the cancel button.', "'Cancel'"), row('destructive', 'boolean', 'Draw the confirm button as destructive.', 'false'), row('onConfirm', '() => void | Promise<void>', 'Runs on confirm; throw to keep the dialog open with a message.')] }],
  }),
  forms({
    id: 'toast',
    name: 'Toast',
    tagline: 'A small message in the corner that confirms what just happened.',
    description: 'Wrap the app in ToastProvider, then call useToast().toast() from anywhere. Toasts are one line with an optional description and action, disappear after a few seconds, and stack. Errors stay longer and use the accent colour.',
    file: 'toast',
    primitives: [],
    deps: icons,
    usage: `// once, near the root
<ToastProvider>
  <App />
</ToastProvider>

// anywhere below it
const { toast } = useToast();
toast({ title: 'Order packed', description: '#1042 is ready for dispatch.', variant: 'success', action: { label: 'Undo', onClick: undo } });`,
    anatomy: `import { ToastProvider, useToast, type ToastOptions } from '@/components/app/toast';

// variant: 'default' | 'success' | 'error'. duration in ms (0 keeps it until dismissed).
const { toast, dismiss } = useToast();`,
    examples: [{ label: 'An error that stays', code: `toast({ title: 'Could not save', description: 'Check your connection and try again.', variant: 'error', duration: 0 })` }],
    api: [{ title: 'ToastProvider', description: 'Draws the toasts; must be above every useToast call.', rows: [row('children', 'ReactNode', 'The app.'), accent('success and error icons')] }, { title: 'useToast()', description: 'Returns { toast, dismiss }.', rows: [row('toast', '(options: ToastOptions) => number', 'Shows a toast and returns its id.'), row('dismiss', '(id: number) => void', 'Removes a toast early.'), row('options.title', 'string', 'The message.'), row('options.description', 'string', 'A second line.'), row('options.variant', "'default' | 'success' | 'error'", 'Icon and colour.', "'default'"), row('options.duration', 'number', 'Milliseconds; 0 keeps it.', '3800 (6000 for errors)'), row('options.action', '{ label; onClick }', 'A link-style button.')] }],
  }),
  forms({
    id: 'inline-edit',
    name: 'InlineEdit',
    tagline: 'A value that becomes a field when you click it.',
    description: 'Text, a number or one of a fixed list of choices, shown as plain text until clicked. Enter or the tick saves, Escape or the cross cancels, and validate can refuse a value with a message. For quick fixes in a table or a detail page without a form.',
    file: 'inline-edit',
    primitives: ['button', 'input', 'select'],
    deps: icons,
    usage: `<InlineEdit value={price} type="number" format={(v) => \`$\${v}\`} validate={(v) => (Number(v) < 0 ? 'Cannot be negative' : undefined)} onSave={(v) => setPrice(Number(v))} />

<InlineEdit value={status} type="select" options={[{ value: 'active', label: 'Active' }, { value: 'paused', label: 'Paused' }]} onSave={(v) => setStatus(String(v))} />`,
    anatomy: `import { InlineEdit } from '@/components/app/inline-edit';

// onSave is only called when the value actually changed and passed validate.
<InlineEdit value={name} onSave={rename} />`,
    examples: [{ label: 'Read only', code: `<InlineEdit value="SKU-1042" disabled onSave={() => {}} />` }],
    api: [{ title: 'InlineEdit', description: 'Controlled by you: it holds a draft only while editing.', rows: [row('value', 'string | number', 'The current value.'), row('onSave', '(value: string | number) => void', 'Called with the new value; numbers arrive as numbers.'), row('type', "'text' | 'number' | 'select'", 'The kind of field.', "'text'"), row('options', '{ value; label }[]', 'Choices for type "select".'), row('format', '(value) => ReactNode', 'How to show the value when not editing.'), row('validate', '(value) => string | undefined', 'Return a message to refuse the value.'), row('placeholder', 'string', 'Shown for an empty value.', "'Empty'"), row('disabled', 'boolean', 'Show as plain text.', 'false'), cls()] }],
  }),
];

export const APP_HARBOR_COMPONENTS: ComponentEntry[] = [
  ...APP_HARBOR_BASE_COMPONENTS,
  ...APP_HARBOR_OPERATIONS_COMPONENTS,
  ...APP_HARBOR_DELIVERY_COMPONENTS,
  ...APP_HARBOR_CATALOG_COMPONENTS,
  ...APP_HARBOR_FLEET_COMPONENTS,
  ...APP_HARBOR_INSIGHT_COMPONENTS,
];
