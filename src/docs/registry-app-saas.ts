import type { ApiRow } from './md';
import type { ComponentEntry } from './registry';

const row = (prop: string, type: string, description: string, def?: string): ApiRow => ({ prop, type, description, ...(def ? { default: def } : {}) });
const accent = (what: string) => row('accentColor', 'string', `Colour of ${what}. Inline styles cannot read CSS variables, so pass a value.`, "'#ec4899'");
const cls = (on = 'the root element') => row('className', 'string', `Merged onto ${on}.`);
const icons = ['lucide-react'];
const currency = row('currency', 'string', 'An ISO currency code, used to format money.', "'USD'");

const entry = (e: Omit<ComponentEntry, 'status' | 'file'> & { file: string }): ComponentEntry => ({ status: 'new', ...e, file: `components/app/${e.file}.tsx` });

export const APP_SAAS_COMPONENTS: ComponentEntry[] = [
  /* ---------- Billing and teams ---------- */
  entry({
    id: 'pricing-table',
    name: 'PricingTable',
    category: 'Billing and teams',
    tagline: 'Plans side by side, with a monthly and yearly toggle.',
    description: 'A row of plan cards under a billing toggle. The price follows the toggle, the featured plan is outlined in the accent colour with a badge, and a plan with no price shows a custom label such as "Let\'s talk".',
    file: 'pricing-table',
    primitives: ['badge', 'button'],
    deps: icons,
    wide: true,
    usage: `<PricingTable
  plans={[
    { id: 'free', name: 'Starter', monthly: 0, features: ['1 workspace', '3 team members'], cta: 'Start free' },
    { id: 'pro', name: 'Growth', monthly: 32, yearly: 26, featured: true, features: ['Unlimited workspaces', '25 team members'], cta: 'Start trial' },
    { id: 'ent', name: 'Scale', monthly: null, customLabel: "Let's talk", features: ['Single sign-on'], cta: 'Contact sales' },
  ]}
  onSelect={(plan, billing) => startCheckout(plan.id, billing)}
/>`,
    anatomy: `import { PricingTable, type PricingPlan } from '@/components/app/pricing-table';

// monthly is the price per month when billed monthly. yearly is the per-month price when billed yearly.
// Set monthly to null for a plan with no public price and give it a customLabel.
<PricingTable plans={plans} onSelect={(plan, billing) => go(plan, billing)} />`,
    examples: [{ label: 'Monthly by default', code: `<PricingTable plans={plans} defaultBilling="monthly" />` }],
    api: [{ title: 'PricingTable', description: 'Plans and a billing toggle.', rows: [row('plans', 'PricingPlan[]', 'id, name, description, monthly, yearly, customLabel, features, cta and featured.'), currency, row('defaultBilling', "'monthly' | 'yearly'", 'Which billing period starts selected.', "'yearly'"), row('onSelect', '(plan, billing) => void', 'Called when a plan button is pressed.'), accent('the featured plan outline, badge and ticks'), cls()] }],
  }),
  entry({
    id: 'plan-usage-card',
    name: 'PlanUsageCard',
    category: 'Billing and teams',
    tagline: 'The plan you are on and how much of it you have used.',
    description: 'The plan name and price, the renewal date, and a meter for each limit: seats, storage, requests. A meter at 85% or more turns to the accent colour. Two buttons at the foot: manage billing and upgrade.',
    file: 'plan-usage-card',
    primitives: ['button', 'card'],
    deps: [],
    usage: `<PlanUsageCard
  planName="Growth"
  price={624}
  interval="month"
  renewsOn="2026-10-01"
  meters={[
    { id: 'seats', label: 'Team members', used: 18, limit: 25 },
    { id: 'storage', label: 'Storage', used: 41, limit: 50, unit: 'GB' },
  ]}
  onUpgrade={() => openUpgrade()}
  onManage={() => openPortal()}
/>`,
    anatomy: `import { PlanUsageCard, type UsageMeter } from '@/components/app/plan-usage-card';

// used and limit are plain numbers in the same unit. Add unit for a suffix like "GB".
<PlanUsageCard planName={plan.name} price={plan.price} renewsOn={sub.renewsOn} meters={meters} />`,
    examples: [{ label: 'A free plan', code: `<PlanUsageCard planName="Starter" price={0} renewsOn="2026-10-01" meters={meters} />` }],
    api: [{ title: 'PlanUsageCard', description: 'A card for one subscription.', rows: [row('planName', 'string', 'The name of the plan.'), row('price', 'number', 'Price per interval.'), currency, row('interval', "'month' | 'year'", 'The billing interval shown under the price.', "'month'"), row('renewsOn', 'string', 'ISO date of the next charge.'), row('meters', 'UsageMeter[]', 'id, label, used, limit and an optional unit.'), row('onUpgrade', '() => void', 'Called by Upgrade plan.'), row('onManage', '() => void', 'Called by Manage billing.'), accent('meters at 85% or more'), cls('the card')] }],
  }),
  entry({
    id: 'invoice-list',
    name: 'InvoiceList',
    category: 'Billing and teams',
    tagline: 'Past invoices, their status, and a download button.',
    description: 'One row per invoice: what it was for, the number and date, a status badge, the amount in mono, and a download icon. Failed invoices are drawn in the accent colour so they cannot be missed.',
    file: 'invoice-list',
    primitives: ['badge', 'button', 'card'],
    deps: icons,
    usage: `<InvoiceList
  invoices={[
    { id: 'i1', number: 'INV-2026-0009', date: '2026-09-01', amount: 624, status: 'open', description: 'Growth plan, 24 seats' },
    { id: 'i2', number: 'INV-2026-0008', date: '2026-08-01', amount: 624, status: 'paid' },
  ]}
  onDownload={(invoice) => download(invoice.id)}
/>`,
    anatomy: `import { InvoiceList, type Invoice } from '@/components/app/invoice-list';

// status is 'paid' | 'open' | 'failed' | 'refunded'.
<InvoiceList invoices={invoices} onDownload={(invoice) => window.open(invoice.pdfUrl)} />`,
    examples: [{ label: 'Paid only', code: `<InvoiceList invoices={invoices.filter((invoice) => invoice.status === 'paid')} />` }],
    api: [{ title: 'InvoiceList', description: 'A card of invoice rows.', rows: [row('invoices', 'Invoice[]', 'id, number, date, amount, status and an optional description.'), currency, row('onDownload', '(invoice) => void', 'Called by the download button.'), accent('failed invoices'), cls('the card')] }],
  }),
  entry({
    id: 'payment-method-card',
    name: 'PaymentMethodCard',
    category: 'Billing and teams',
    tagline: 'A saved card, without the digits you should not show.',
    description: 'A drawn brand mark, the last four digits, the expiry and the holder, with a Default badge and actions to update, remove or make it the default. An expired card shows its expiry in the accent colour.',
    file: 'payment-method-card',
    primitives: ['badge', 'button', 'card'],
    deps: [],
    usage: `<PaymentMethodCard
  brand="visa"
  last4="4242"
  expMonth={11}
  expYear={2028}
  holder="Nadia Rahman"
  isDefault
  onUpdate={() => editCard(card.id)}
  onRemove={() => removeCard(card.id)}
/>`,
    anatomy: `import { PaymentMethodCard } from '@/components/app/payment-method-card';

// Never pass a full card number. Your payment provider gives you brand, last4 and the expiry.
<PaymentMethodCard brand={card.brand} last4={card.last4} expMonth={card.expMonth} expYear={card.expYear} />`,
    examples: [{ label: 'An expired card', code: `<PaymentMethodCard brand="mastercard" last4="0087" expMonth={3} expYear={2025} />` }],
    api: [{ title: 'PaymentMethodCard', description: 'A card for one saved payment method.', rows: [row('brand', "'visa' | 'mastercard' | 'amex' | 'other'", 'Decides the mark.'), row('last4', 'string', 'The last four digits.'), row('expMonth', 'number', '1 to 12.'), row('expYear', 'number', 'Four digits.'), row('holder', 'string', 'Shown after the expiry.'), row('isDefault', 'boolean', 'Shows the Default badge and hides Make default.'), row('onUpdate', '() => void', 'Called by Update.'), row('onRemove', '() => void', 'Called by Remove.'), row('onMakeDefault', '() => void', 'Called by Make default.'), accent('an expired expiry'), cls('the card')] }],
  }),
  entry({
    id: 'team-members',
    name: 'TeamMembers',
    category: 'Billing and teams',
    tagline: 'Who is on the team, their role, and a way to invite more.',
    description: 'A member list with avatar, name, email, a role select and an actions menu, plus an Invite dialog with an email field and a role. Pending invites carry an Invited badge. Your own row cannot be demoted or removed.',
    file: 'team-members',
    primitives: ['avatar', 'badge', 'button', 'card', 'dialog', 'dropdown-menu', 'input', 'label', 'select'],
    deps: icons,
    usage: `<TeamMembers
  members={members}
  currentUserId="m1"
  onRoleChange={(member, role) => setRole(member.id, role)}
  onRemove={(member) => remove(member.id)}
  onInvite={(email, role) => invite(email, role)}
/>`,
    anatomy: `import { TeamMembers, type TeamMember } from '@/components/app/team-members';

// members: { id, name, email, role, status?: 'active' | 'invited' }
// roles defaults to Owner, Admin, Member and Viewer. Owner is never offered on invite.
<TeamMembers members={members} roles={['Owner', 'Editor']} defaultInviteRole="Editor" />`,
    examples: [{ label: 'Custom roles', code: `<TeamMembers members={members} roles={['Owner', 'Editor']} defaultInviteRole="Editor" currentUserId="m1" />` }],
    api: [{ title: 'TeamMembers', description: 'A card of members with an invite dialog.', rows: [row('members', 'TeamMember[]', 'id, name, email, role and an optional status.'), row('roles', 'string[]', 'The roles offered in the selects.', "['Owner', 'Admin', 'Member', 'Viewer']"), row('defaultInviteRole', 'string', 'Role preselected in the invite dialog.', "'Member'"), row('currentUserId', 'string', 'That member cannot be demoted or removed.'), row('onRoleChange', '(member, role) => void', 'Called when a role select changes.'), row('onRemove', '(member) => void', 'Called by Remove from team. Confirm in your own code.'), row('onInvite', '(email, role) => void', 'Called when the invite form is submitted with a valid email.'), accent('the Invited badge'), cls('the card')] }],
  }),

  /* ---------- Marketing pages ---------- */
  entry({
    id: 'site-header',
    name: 'SiteHeader',
    category: 'Marketing pages',
    tagline: 'The top bar of a marketing page, with a menu on phones.',
    description: 'The brand, a row of links, and up to two actions. Below the md breakpoint the links and actions move into a sheet opened by a menu button. Pass onNavigate to route the links yourself.',
    file: 'site-header',
    primitives: ['button', 'sheet'],
    deps: icons,
    wide: true,
    usage: `<SiteHeader
  brand="Ledger"
  links={[{ label: 'Product', href: '/product' }, { label: 'Pricing', href: '/pricing' }]}
  primaryAction={{ label: 'Start free', href: '/register' }}
  secondaryAction={{ label: 'Sign in', href: '/login' }}
  onNavigate={(href) => navigate(href)}
/>`,
    anatomy: `import { SiteHeader } from '@/components/app/site-header';

// Links are real anchors. onNavigate, when given, cancels the default and calls you instead.
<SiteHeader brand="Ledger" links={links} primaryAction={cta} />`,
    examples: [{ label: 'One action', code: `<SiteHeader brand="Ledger" links={links} primaryAction={{ label: 'Get started', href: '/register' }} />` }],
    api: [{ title: 'SiteHeader', description: 'A header bar.', rows: [row('brand', 'string', 'The name beside the accent dot.'), row('links', 'SiteNavLink[]', 'label and href.'), row('primaryAction', '{ label; href }', 'A filled button.'), row('secondaryAction', '{ label; href }', 'A ghost button.'), row('onNavigate', '(href) => void', 'Handle navigation yourself, for a client-side router.'), accent('the brand dot'), cls('the header')] }],
  }),
  entry({
    id: 'hero-section',
    name: 'HeroSection',
    category: 'Marketing pages',
    tagline: 'The first screen of a page: a headline, two actions, a visual.',
    description: 'An optional eyebrow pill, a headline, a sentence of copy and two buttons, then a bordered frame for any visual and a quiet strip of customer names. Centred or left-aligned.',
    file: 'hero-section',
    primitives: ['button'],
    deps: [],
    wide: true,
    usage: `<HeroSection
  eyebrow="Now with automations"
  title="Know where every dollar is, without the spreadsheet."
  description="Ledger keeps your customers, invoices and cash in one calm place."
  primaryAction={{ label: 'Start free', href: '/register' }}
  secondaryAction={{ label: 'See how it works', href: '#product' }}
  media={<DashboardPreview />}
  logos={['Northwind', 'Acme', 'Globex']}
/>`,
    anatomy: `import { HeroSection } from '@/components/app/hero-section';

// media is any node: a screenshot, or a live component from this library.
// An action with an href renders a link; one without renders a button that calls onClick.
<HeroSection title="..." primaryAction={{ label: 'Start' }} media={<Preview />} />`,
    examples: [{ label: 'Left-aligned', code: `<HeroSection align="left" title="Invoices that chase themselves." primaryAction={{ label: 'Try it' }} />` }],
    api: [{ title: 'HeroSection', description: 'A hero block.', rows: [row('title', 'ReactNode', 'The headline.'), row('eyebrow', 'string', 'A small pill above the headline.'), row('description', 'string', 'A sentence under the headline.'), row('primaryAction', '{ label; onClick?; href? }', 'The filled button.'), row('secondaryAction', '{ label; onClick?; href? }', 'The outline button.'), row('media', 'ReactNode', 'Shown in a bordered frame below the copy.'), row('logos', 'string[]', 'Customer names in a strip.'), row('logosLabel', 'string', 'Caption above the strip.', "'Trusted by teams at'"), row('align', "'center' | 'left'", 'Alignment of the copy.', "'center'"), accent('the eyebrow dot'), cls('the section')] }],
  }),
  entry({
    id: 'feature-grid',
    name: 'FeatureGrid',
    category: 'Marketing pages',
    tagline: 'Small tiles that say what the product does.',
    description: 'A centred heading and a responsive grid of bordered tiles, each with an icon, a title and one sentence. Two, three or four columns on wide screens; one or two on a phone.',
    file: 'feature-grid',
    primitives: [],
    deps: icons,
    wide: true,
    usage: `<FeatureGrid
  title="Everything the finance team asks for"
  description="And a few things they did not know they could ask for."
  features={[
    { id: 'f1', title: 'Live dashboards', description: 'Every number updates as it changes.', icon: <BarChart3 /> },
    { id: 'f2', title: 'Roles and access', description: 'Decide who sees what.', icon: <Lock /> },
  ]}
/>`,
    anatomy: `import { FeatureGrid, type Feature } from '@/components/app/feature-grid';

// icon is a lucide element. It is coloured with accentColor.
<FeatureGrid features={features} columns={3} />`,
    examples: [{ label: 'Four across', code: `<FeatureGrid columns={4} features={features} />` }],
    api: [{ title: 'FeatureGrid', description: 'A grid of feature tiles.', rows: [row('features', 'Feature[]', 'id, title, description and an optional icon element.'), row('title', 'string', 'Heading above the grid.'), row('description', 'string', 'A sentence under the heading.'), row('columns', '2 | 3 | 4', 'Columns on large screens.', '3'), accent('the icons'), cls('the section')] }],
  }),
  entry({
    id: 'faq-list',
    name: 'FaqList',
    category: 'Marketing pages',
    tagline: 'Questions that open to their answers.',
    description: 'A bordered list of questions built on the collapsible primitive. Opening one closes the others unless multiple is set; the plus turns to a cross. Answers can be any node, so links work.',
    file: 'faq-list',
    primitives: ['collapsible'],
    deps: icons,
    usage: `<FaqList
  defaultOpenId="q1"
  items={[
    { id: 'q1', question: 'Can I change plans later?', answer: 'Yes. Upgrades apply straight away.' },
    { id: 'q2', question: 'Do you offer refunds?', answer: 'Within 30 days, no questions asked.' },
  ]}
/>`,
    anatomy: `import { FaqList, type FaqItem } from '@/components/app/faq-list';

// answer is a ReactNode: a string, or markup with links.
<FaqList items={items} multiple />`,
    examples: [{ label: 'Several open at once', code: `<FaqList items={items} multiple defaultOpenId="q2" />` }],
    api: [{ title: 'FaqList', description: 'A list of collapsible questions.', rows: [row('items', 'FaqItem[]', 'id, question and answer.'), row('defaultOpenId', 'string', 'Which item starts open.'), row('multiple', 'boolean', 'Let several stay open.', 'false'), cls()] }],
  }),
  entry({
    id: 'site-footer',
    name: 'SiteFooter',
    category: 'Marketing pages',
    tagline: 'The bottom of a marketing page.',
    description: 'The brand and a line about it, columns of links, and the small print. The columns sit beside the brand on wide screens and stack under it on a phone.',
    file: 'site-footer',
    primitives: [],
    deps: [],
    wide: true,
    usage: `<SiteFooter
  brand="Ledger"
  tagline="Calm money software for small teams."
  columns={[
    { title: 'Product', links: [{ label: 'Features', href: '/features' }, { label: 'Pricing', href: '/pricing' }] },
    { title: 'Legal', links: [{ label: 'Privacy', href: '/privacy' }] },
  ]}
  legal="© 2026 Ledger, Inc. All rights reserved."
/>`,
    anatomy: `import { SiteFooter, type FooterColumn } from '@/components/app/site-footer';

<SiteFooter brand="Ledger" columns={columns} legal="© 2026 Ledger, Inc." onNavigate={(href) => navigate(href)} />`,
    examples: [{ label: 'Two columns, no tagline', code: `<SiteFooter brand="Ledger" columns={columns.slice(0, 2)} />` }],
    api: [{ title: 'SiteFooter', description: 'A footer.', rows: [row('brand', 'string', 'The name beside the accent dot.'), row('tagline', 'string', 'A line under the brand.'), row('columns', 'FooterColumn[]', 'title and links (label, href).'), row('legal', 'string', 'The small print row.'), row('onNavigate', '(href) => void', 'Handle navigation yourself.'), accent('the brand dot'), cls('the footer')] }],
  }),
];
