import type { ApiRow } from './md';
import type { ComponentEntry } from './registry';

const row = (prop: string, type: string, description: string, def?: string): ApiRow => ({ prop, type, description, ...(def ? { default: def } : {}) });
const accent = (what: string) => row('accentColor', 'string', `Colour of ${what}. Inline styles cannot read CSS variables, so pass a value.`, "'#ec4899'");
const cls = (on = 'the root element') => row('className', 'string', `Merged onto ${on}.`);
const icons = ['lucide-react'];

const entry = (e: Omit<ComponentEntry, 'status' | 'file'> & { file: string }): ComponentEntry => ({ status: 'new', ...e, file: `components/app/${e.file}.tsx` });

/** New app components the Ledger template needed, added to the library so the template can use them. */
export const APP_LEDGER_COMPONENTS: ComponentEntry[] = [
  entry({
    id: 'cta-banner',
    name: 'CtaBanner',
    category: 'Marketing pages',
    tagline: 'The closing ask of a marketing page.',
    description: 'A centred panel with a headline, a sentence and one or two buttons, washed with a soft accent glow from the top. Put it right above the footer.',
    file: 'cta-banner',
    primitives: ['button'],
    deps: [],
    wide: true,
    usage: `<CtaBanner
  title="Close the month in an afternoon."
  description="Start free. No card, no call, and your data is yours to export."
  primaryAction={{ label: 'Start free', href: '/register' }}
  secondaryAction={{ label: 'Talk to sales', href: '/contact' }}
/>`,
    anatomy: `import { CtaBanner } from '@/components/app/cta-banner';

// Each action is { label, href } for a link or { label, onClick } for a button.
<CtaBanner title="…" primaryAction={{ label: 'Start free', onClick: signUp }} />`,
    examples: [{ label: 'One action', code: `<CtaBanner title="Ready when you are." primaryAction={{ label: 'Get started', href: '/register' }} />` }],
    api: [{ title: 'CtaBanner', description: 'A closing call to action.', rows: [row('title', 'string', 'The headline.'), row('description', 'string', 'One supporting sentence.'), row('primaryAction', '{ label; href?; onClick? }', 'The filled button.'), row('secondaryAction', '{ label; href?; onClick? }', 'The outline button.'), accent('the glow'), cls('the section')] }],
  }),
  entry({
    id: 'testimonial-grid',
    name: 'TestimonialGrid',
    category: 'Marketing pages',
    tagline: 'Customer quotes in a calm grid.',
    description: 'A heading over a grid of quote cards, each with the person, their role and company. One column on a phone, two on a tablet, three on a desktop.',
    file: 'testimonial-grid',
    primitives: ['avatar'],
    deps: [],
    wide: true,
    usage: `<TestimonialGrid
  title="Teams that stopped dreading month end"
  testimonials={[
    { id: 't1', quote: 'We cut our close from six days to two.', name: 'Ines Duarte', role: 'Controller', company: 'Northwind' },
    { id: 't2', quote: 'The first finance tool my team opens on purpose.', name: 'Tom Adeyemi', role: 'COO', company: 'Acme' },
  ]}
/>`,
    anatomy: `import { TestimonialGrid, type Testimonial } from '@/components/app/testimonial-grid';

<TestimonialGrid testimonials={testimonials} />`,
    examples: [{ label: 'Without a heading', code: `<TestimonialGrid testimonials={testimonials} />` }],
    api: [{ title: 'TestimonialGrid', description: 'A grid of customer quotes.', rows: [row('testimonials', 'Testimonial[]', 'id, quote, name, role and company.'), row('title', 'string', 'A heading above the grid.'), row('description', 'string', 'A line under the heading.'), cls('the section')] }],
  }),
  entry({
    id: 'danger-zone-card',
    name: 'DangerZoneCard',
    category: 'Authentication and account',
    tagline: 'Irreversible actions, each behind a confirmation.',
    description: 'A card outlined in the destructive colour that lists actions such as deleting a workspace. Each opens a dialog; give an action a confirm phrase and the button stays disabled until it is typed exactly.',
    file: 'danger-zone-card',
    primitives: ['button', 'card', 'dialog', 'input', 'label'],
    deps: [],
    usage: `<DangerZoneCard
  actions={[
    { id: 'transfer', title: 'Transfer ownership', description: 'Hand this workspace to another member.', actionLabel: 'Transfer' },
    { id: 'delete', title: 'Delete workspace', description: 'Removes every customer, invoice and file. This cannot be undone.', actionLabel: 'Delete workspace', confirmPhrase: 'northwind' },
  ]}
  onConfirm={(action) => run(action.id)}
/>`,
    anatomy: `import { DangerZoneCard, type DangerAction } from '@/components/app/danger-zone-card';

// confirmPhrase is optional. Without it the dialog just asks to confirm.
<DangerZoneCard actions={actions} onConfirm={(action) => run(action)} />`,
    examples: [{ label: 'One action, no phrase', code: `<DangerZoneCard actions={[{ id: 'reset', title: 'Reset data', description: 'Clears demo data.', actionLabel: 'Reset' }]} />` }],
    api: [{ title: 'DangerZoneCard', description: 'A list of destructive actions.', rows: [row('actions', 'DangerAction[]', 'id, title, description, actionLabel and an optional confirmPhrase.'), row('onConfirm', '(action) => void', 'Called after the dialog is confirmed.'), row('title', 'string', 'The card heading.', "'Danger zone'"), cls('the card')] }],
  }),
  entry({
    id: 'api-key-list',
    name: 'ApiKeyList',
    category: 'Authentication and account',
    tagline: 'Keys with their last use, and a way to make or revoke one.',
    description: 'Each key shows its name, scope, visible prefix, creation date and last use. New key opens a dialog for a name; the full secret is shown once with a copy button and is never shown again.',
    file: 'api-key-list',
    primitives: ['badge', 'button', 'card', 'dialog', 'input'],
    deps: icons,
    usage: `<ApiKeyList
  keys={keys}
  onCreate={async (name) => createKey(name)}
  onRevoke={(key) => revokeKey(key.id)}
/>`,
    anatomy: `import { ApiKeyList, type ApiKey } from '@/components/app/api-key-list';

// onCreate returns the full secret. The list itself only ever holds the prefix.
<ApiKeyList keys={keys} onCreate={(name) => makeSecret(name)} onRevoke={(key) => remove(key)} />`,
    examples: [{ label: 'No keys yet', code: `<ApiKeyList keys={[]} onCreate={(name) => 'lg_live_' + name} />` }],
    api: [{ title: 'ApiKeyList', description: 'A list of API keys.', rows: [row('keys', 'ApiKey[]', 'id, name, prefix, createdAt, lastUsedAt and scope.'), row('onCreate', '(name) => string | Promise<string>', 'Make a key and return its full secret.'), row('onRevoke', '(key) => void', 'Called when the bin is pressed.'), cls('the card')] }],
  }),
];
