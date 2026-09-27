'use client';

import * as React from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/internal/badge';
import { Button } from '@/components/internal/button';
import { Eyebrow } from '@/components/internal/eyebrow';
import { Illustration } from '@/components/internal/illustration';
import { Rule } from '@/components/internal/rule';
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from '@/components/internal/tabs';
import { COMPONENTS, PLANNED, getComponent, type ComponentEntry } from './registry';
import { EXAMPLES, PREVIEWS } from './previews';

const START_PAGES = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'installation', label: 'Installation' },
];

const ON_THIS_PAGE = [
  { id: 'installation', label: 'Installation' },
  { id: 'usage', label: 'Usage' },
  { id: 'examples', label: 'Examples' },
  { id: 'api', label: 'API reference' },
];

function useRoute() {
  const read = () => (typeof window === 'undefined' ? 'introduction' : window.location.hash.replace(/^#\/?/, '') || 'introduction');
  const [route, setRoute] = React.useState(read);

  React.useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

function CodeBlock({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className={cn('relative', className)}>
      <pre className="overflow-x-auto rounded-paper border border-dashed border-line bg-sunk/50 p-4 pr-14 font-mono text-[12.5px] leading-relaxed text-ink">
        {code}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy code"
        className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] uppercase tracking-wider text-ink-faint transition-colors hover:text-ink"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

function PageSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <>
      <Rule className="mt-12" />
      <section id={id} className="scroll-mt-24 py-9">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink">{title}</h2>
        <div className="mt-5">{children}</div>
      </section>
    </>
  );
}

function ManualInstall({ entry }: { entry?: ComponentEntry }) {
  return (
    <div className="space-y-4">
      <ol className="space-y-3 text-sm leading-relaxed text-ink-muted">
        <li>
          1. Copy{' '}
          <code className="font-mono text-[12.5px] text-ink">
            src/{entry ? entry.file : 'components/agent-ops/…'}
          </code>{' '}
          into your project.
        </li>
        <li>
          2. Install what it imports:{' '}
          <span className="font-mono text-[12.5px] text-ink">
            {entry ? entry.deps.join(', ') : 'lucide-react, internal/*'}
          </span>
          .
        </li>
        <li>
          3. Keep the token block from <code className="font-mono text-[12.5px] text-ink">styles/app.css</code> — the
          components read <code className="font-mono text-[12.5px] text-ink">--paper</code>,{' '}
          <code className="font-mono text-[12.5px] text-ink">--ink</code>,{' '}
          <code className="font-mono text-[12.5px] text-ink">--line</code> and friends.
        </li>
      </ol>
      <p className="rounded-paper border border-dashed border-line bg-sunk/50 p-4 text-sm text-ink-muted">
        A shadcn-compatible registry is planned, so this becomes{' '}
        <code className="font-mono text-[12.5px] text-ink">npx shadcn@latest add …</code> with no manual copying.
      </p>
    </div>
  );
}

function ApiTables({ entry }: { entry: ComponentEntry }) {
  return (
    <div className="space-y-8">
      {entry.api.map((group) => (
        <div key={group.title}>
          <h3 className="font-mono text-[13px] text-ink">{group.title}</h3>
          <div className="mt-3 overflow-x-auto rounded-paper border border-dashed border-line">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-sunk/50 text-[11px] uppercase tracking-wider text-ink-faint">
                <tr>
                  <th className="px-4 py-2 font-medium">Prop</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 font-medium">Default</th>
                  <th className="px-4 py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-line">
                {group.rows.map((row) => (
                  <tr key={row.prop}>
                    <td className="px-4 py-2.5 font-mono text-[12.5px] text-ink">{row.prop}</td>
                    <td className="px-4 py-2.5 font-mono text-[12px] text-ink-muted">{row.type}</td>
                    <td className="px-4 py-2.5 font-mono text-[12px] text-ink-faint">{row.default ?? '—'}</td>
                    <td className="px-4 py-2.5 text-ink-muted">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function ComponentPage({ entry }: { entry: ComponentEntry }) {
  const examples = EXAMPLES[entry.id] ?? [];
  return (
    <article className="min-w-0 flex-1 pb-32">
      <Eyebrow className="mb-3">{entry.category}</Eyebrow>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-4xl font-extrabold leading-[0.95] tracking-tight text-ink sm:text-5xl">
          {entry.name}
        </h1>
        {entry.status === 'new' ? <Badge tone="accent">new</Badge> : null}
      </div>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted">{entry.tagline}</p>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted">{entry.description}</p>

      <div className="mt-9">
        <Tabs defaultValue="preview">
          <TabsList>
            <TabsTab value="preview">Preview</TabsTab>
            <TabsTab value="code">Code</TabsTab>
            <TabsIndicator />
          </TabsList>
          <TabsPanel value="preview">{PREVIEWS[entry.id]}</TabsPanel>
          <TabsPanel value="code">
            <CodeBlock code={entry.usage} />
          </TabsPanel>
        </Tabs>
      </div>

      <PageSection id="installation" title="Installation">
        <ManualInstall entry={entry} />
      </PageSection>

      <PageSection id="usage" title="Usage">
        <CodeBlock code={entry.usage} />
      </PageSection>

      <PageSection id="examples" title="Examples">
        <div className="space-y-8">
          {examples.map((example) => (
            <div key={example.label}>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge>{example.label}</Badge>
              </div>
              {example.node}
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection id="api" title="API reference">
        <ApiTables entry={entry} />
      </PageSection>
    </article>
  );
}

function IntroductionPage() {
  return (
    <article className="min-w-0 flex-1 pb-32">
      <Eyebrow className="mb-4">Copy-paste components · MIT</Eyebrow>
      <h1 className="max-w-3xl font-display text-5xl font-extrabold leading-[0.92] tracking-tight text-ink sm:text-6xl">
        The agent-ops layer, as components.
      </h1>
      <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-muted">
        Chat shells are commodity. Paper ships the surfaces that make a running agent <em>observable</em>,{' '}
        <em>interruptible</em> and <em>affordable</em> — the parts that today live inside closed observability
        platforms, never in your app. Five components, no runtime package, copy the file and own it.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Button onClick={() => (window.location.hash = '#/components/run-timeline')}>
          Start with RunTimeline
        </Button>
        <Button variant="outline" onClick={() => (window.location.hash = '#/installation')}>
          Installation
        </Button>
      </div>

      <Rule className="my-12" />

      <div className="grid gap-4">
        {COMPONENTS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => (window.location.hash = `#/components/${entry.id}`)}
            className="flex items-center gap-5 rounded-paper-lg border border-dashed border-line bg-raised p-5 text-left transition-colors hover:border-line-strong"
          >
            <Illustration name="build" className="hidden h-14 w-14 shrink-0 sm:block" />
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-display text-lg font-bold tracking-tight text-ink">{entry.name}</span>
                <Badge tone="faint">{entry.category}</Badge>
                {entry.status === 'new' ? <Badge tone="accent">new</Badge> : null}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-ink-muted">{entry.tagline}</span>
            </span>
          </button>
        ))}
        {PLANNED.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-5 rounded-paper-lg border border-dashed border-line/60 bg-sunk/40 p-5"
          >
            <Illustration name="time" className="hidden h-14 w-14 shrink-0 opacity-40 sm:block" />
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-display text-lg font-bold tracking-tight text-ink-faint">{item.name}</span>
                <Badge tone="faint">planned</Badge>
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-ink-faint">{item.note}</span>
            </span>
          </div>
        ))}
      </div>

      <Rule className="my-12" />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-paper-lg border border-dashed border-line bg-raised p-6">
          <Eyebrow className="mb-3">Why these five</Eyebrow>
          <p className="text-sm leading-relaxed text-ink-muted">
            A market scan found the chat layer has at least a dozen MIT competitors whose differences reviewers call
            “a week of work either way”, while trace inspection, pre-execution approval, budget meters and MCP
            catalogues have no well-adopted open-source React answer.
          </p>
        </div>
        <div className="rounded-paper-lg border border-dashed border-line bg-raised p-6">
          <Eyebrow className="mb-3">Foundations</Eyebrow>
          <p className="text-sm leading-relaxed text-ink-muted">
            Built on Base UI for behaviour, Tailwind v4 tokens for theming, and logical properties so the components
            are RTL-correct from the start. Illustrations carry the empty, loading and error states.
          </p>
        </div>
      </div>
    </article>
  );
}

function InstallationPage() {
  return (
    <article className="min-w-0 flex-1 pb-32">
      <Eyebrow className="mb-4">Getting started</Eyebrow>
      <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Installation</h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
        There is no package to install. Copy the component you need, keep the tokens, delete the rest.
      </p>

      <PageSection id="installation" title="Manual install">
        <ManualInstall />
      </PageSection>

      <PageSection id="usage" title="Requirements">
        <ul className="space-y-2 text-sm text-ink-muted">
          <li>· React 19 · TypeScript</li>
          <li>· Tailwind CSS v4 (the components use token utilities like bg-raised, text-ink-muted, border-line)</li>
          <li>
            · <code className="font-mono text-[12.5px] text-ink">@base-ui/react</code> for the interactive internals
          </li>
          <li>
            · <code className="font-mono text-[12.5px] text-ink">clsx</code> +{' '}
            <code className="font-mono text-[12.5px] text-ink">tailwind-merge</code> for the single{' '}
            <code className="font-mono text-[12.5px] text-ink">cn()</code> helper
          </li>
        </ul>
      </PageSection>

      <PageSection id="api" title="Tokens">
        <CodeBlock
          code={`:root {
  --paper: #ffffff;        /* page */
  --paper-raised: #ffffff; /* cards */
  --paper-sunk: #f2f2f0;   /* code wells */
  --ink: #0e100f;
  --line: rgba(14, 16, 15, 0.16);
  --accent: #b4791f;
  --danger: #9f2f22;
}
[data-theme='dark'] { --paper: #0e100f; --paper-raised: #141816; --ink: #fff7dd; }`}
        />
      </PageSection>
    </article>
  );
}

export default function DocsApp() {
  const route = useRoute();
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const componentId = route.startsWith('components/') ? route.slice('components/'.length) : null;
  const entry = componentId ? getComponent(componentId) : undefined;

  const isActive = (id: string) => route === id || componentId === id;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-50 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[90rem] items-center gap-4 px-5">
          <a href="#/introduction" className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-md bg-ink font-mono text-[13px] font-medium text-paper">
              P
            </span>
            <span className="font-display text-base font-bold tracking-tight">Paper</span>
            <Badge tone="faint">v0.1</Badge>
          </a>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="https://github.com/MohammedAlshami"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 text-xs text-ink-faint transition-colors hover:text-ink sm:inline-flex"
            >
              GitHub <ExternalLink className="size-3" />
            </a>
            <Button variant="ghost" size="sm" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? 'Dark' : 'Light'} theme
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[90rem] gap-10 px-5">
        {/* Sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto py-10 lg:block">
          <Eyebrow className="mb-3">Getting Started</Eyebrow>
          <nav className="flex flex-col gap-0.5">
            {START_PAGES.map((page) => (
              <a
                key={page.id}
                href={`#/${page.id}`}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm transition-colors',
                  isActive(page.id) ? 'bg-ink/[0.06] text-ink' : 'text-ink-muted hover:bg-ink/[0.04] hover:text-ink',
                )}
              >
                {page.label}
              </a>
            ))}
          </nav>

          <Eyebrow className="mb-3 mt-8">Components</Eyebrow>
          <nav className="flex flex-col gap-0.5">
            {COMPONENTS.map((item) => (
              <a
                key={item.id}
                href={`#/components/${item.id}`}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm transition-colors',
                  componentId === item.id
                    ? 'bg-ink/[0.06] text-ink'
                    : 'text-ink-muted hover:bg-ink/[0.04] hover:text-ink',
                )}
              >
                {item.name}
              </a>
            ))}
            {PLANNED.map((item) => (
              <span key={item.name} className="cursor-default rounded-md px-3 py-1.5 text-sm text-ink-faint">
                {item.name}
              </span>
            ))}
          </nav>

          <Rule className="my-6" />
          <p className="text-xs leading-relaxed text-ink-faint">
            Five components. No primitives, no data grid, no chat shell.
          </p>
        </aside>

        {/* Page */}
        {entry ? <ComponentPage entry={entry} /> : route === 'installation' ? <InstallationPage /> : <IntroductionPage />}

        {/* On this page */}
        {entry ? (
          <nav className="sticky top-20 hidden h-fit w-48 shrink-0 py-12 xl:block">
            <Eyebrow className="mb-3">On this page</Eyebrow>
            <ul className="border-l border-dashed border-line">
              {ON_THIS_PAGE.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                    className="-ml-px block w-full border-l border-transparent py-1.5 pl-3 text-left text-sm text-ink-muted transition-colors hover:border-ink hover:text-ink"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
