'use client';

import * as React from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/internal/badge';
import { Button } from '@/components/internal/button';
import { Card } from '@/components/internal/card';
import { Eyebrow } from '@/components/internal/eyebrow';
import { Rule } from '@/components/internal/rule';
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from '@/components/internal/tabs';
import { ApprovalStep } from '@/components/agent-ops/approval-step';
import { BranchCompare } from '@/components/agent-ops/branch-compare';
import { EventStream } from '@/components/agent-ops/event-stream';
import { ForkPanel } from '@/components/agent-ops/fork-panel';
import { ReplayScrubber } from '@/components/agent-ops/replay-scrubber';
import { RunHeader } from '@/components/agent-ops/run-header';
import { RunMetrics } from '@/components/agent-ops/run-metrics';
import { RunTimeline } from '@/components/agent-ops/run-timeline';
import { RunsTable } from '@/components/agent-ops/runs-table';
import { StepDetail } from '@/components/agent-ops/step-detail';
import { COMPONENTS, PLANNED, getComponent, type ComponentEntry } from './registry';
import {
  APPROVAL_EMAIL,
  EVENTS,
  EXAMPLES,
  FAILURES,
  KPIS,
  PREVIEWS,
  RUNS,
  RUN_ACTIVE,
  RUN_BRANCH,
  RUN_PARENT,
  TREND,
} from './previews';

const START_PAGES = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'installation', label: 'Installation' },
  { id: 'console', label: 'Operations console' },
];

const ON_THIS_PAGE = [
  { id: 'installation', label: 'Installation' },
  { id: 'usage', label: 'Usage' },
  { id: 'examples', label: 'Examples' },
  { id: 'api', label: 'API reference' },
];

function useRoute() {
  const read = () =>
    typeof window === 'undefined' ? 'introduction' : window.location.hash.replace(/^#\/?/, '') || 'introduction';
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
      <pre className="overflow-x-auto rounded-paper border border-border bg-muted p-4 pr-14 font-mono text-[12.5px] leading-relaxed text-foreground">
        {code}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy code"
        className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-paper px-2 py-1 text-[11px] uppercase tracking-wider text-faint transition-colors hover:text-foreground"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

function Demo({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-paper-lg border border-border bg-background p-4 sm:p-6', className)}>{children}</div>
  );
}

function PageSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <>
      <Rule className="mt-12" />
      <section id={id} className="scroll-mt-24 py-9">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        <div className="mt-5">{children}</div>
      </section>
    </>
  );
}

function ManualInstall({ entry }: { entry?: ComponentEntry }) {
  return (
    <div className="space-y-4">
      <ol className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        <li>
          1. Copy{' '}
          <code className="font-mono text-[12.5px] text-foreground">
            src/{entry ? entry.file : 'components/agent-ops/…'}
          </code>{' '}
          into your project.
        </li>
        <li>
          2. Install what it imports:{' '}
          <span className="font-mono text-[12.5px] text-foreground">
            {entry ? entry.deps.join(', ') : 'lucide-react, internal/*'}
          </span>
          .
        </li>
        <li>
          3. Keep the token block from <code className="font-mono text-[12.5px] text-foreground">styles/app.css</code> — the
          components read <code className="font-mono text-[12.5px] text-foreground">--background</code>,{' '}
          <code className="font-mono text-[12.5px] text-foreground">--card</code>,{' '}
          <code className="font-mono text-[12.5px] text-foreground">--border</code> and friends.
        </li>
      </ol>
      <p className="rounded-paper border border-border bg-card p-4 text-sm text-muted-foreground">
        A shadcn-compatible registry is planned, so this becomes{' '}
        <code className="font-mono text-[12.5px] text-foreground">npx shadcn@latest add …</code> with no manual copying.
      </p>
    </div>
  );
}

function ApiTables({ entry }: { entry: ComponentEntry }) {
  return (
    <div className="space-y-8">
      {entry.api.map((group) => (
        <div key={group.title}>
          <h3 className="font-mono text-[13px] text-foreground">{group.title}</h3>
          <div className="mt-3 overflow-x-auto rounded-paper border border-border bg-card">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b border-border bg-muted text-[11px] uppercase tracking-wider text-faint">
                <tr>
                  <th className="px-4 py-2 font-medium">Prop</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 font-medium">Default</th>
                  <th className="px-4 py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-solid divide-border">
                {group.rows.map((row) => (
                  <tr key={row.prop}>
                    <td className="px-4 py-2.5 font-mono text-[12.5px] text-foreground">{row.prop}</td>
                    <td className="px-4 py-2.5 font-mono text-[12px] text-muted-foreground">{row.type}</td>
                    <td className="px-4 py-2.5 font-mono text-[12px] text-faint">{row.default ?? '—'}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{row.description}</td>
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
        <h1 className="font-display text-4xl font-extrabold leading-[0.95] tracking-tight text-foreground sm:text-5xl">
          {entry.name}
        </h1>
        {entry.status === 'new' ? <Badge tone="solid">new</Badge> : null}
      </div>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{entry.tagline}</p>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">{entry.description}</p>

      <div className="mt-9">
        <Tabs defaultValue="preview">
          <TabsList>
            <TabsTab value="preview">Preview</TabsTab>
            <TabsTab value="code">Code</TabsTab>
            <TabsIndicator />
          </TabsList>
          <TabsPanel value="preview">
            <Demo>{PREVIEWS[entry.id]}</Demo>
          </TabsPanel>
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
        <div className="space-y-10">
          {examples.map((example, index) => (
            <div key={example.label}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge>{example.label}</Badge>
                {entry.examples[index]?.code ? (
                  <code className="font-mono text-[11.5px] text-faint">{entry.examples[index].code}</code>
                ) : null}
              </div>
              <Demo>{example.node}</Demo>
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
      <h1 className="max-w-3xl font-display text-5xl font-extrabold leading-[0.92] tracking-tight text-foreground sm:text-6xl">
        The agent-ops layer, as components.
      </h1>
      <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        Chat shells are commodity. Paper ships the surfaces that make a running AI workflow <em>observable</em>,{' '}
        <em>interruptible</em> and <em>affordable</em> — running a workflow, watching each step, replaying it, forking it
        from a step, and approving the side effect before it happens. Ten components, no runtime package.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Button onClick={() => (window.location.hash = '#/console')}>Open the console</Button>
        <Button variant="outline" onClick={() => (window.location.hash = '#/components/run-timeline')}>
          Start with RunTimeline
        </Button>
      </div>

      <Rule className="my-12" />

      <div className="grid gap-4">
        {COMPONENTS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => (window.location.hash = `#/components/${entry.id}`)}
            className="flex items-start gap-5 rounded-paper-lg border border-border bg-card p-5 text-left shadow-card transition-colors hover:border-border-strong"
          >
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-display text-lg font-bold tracking-tight text-foreground">{entry.name}</span>
                <Badge tone="muted">{entry.category}</Badge>
                {entry.status === 'new' ? <Badge tone="solid">new</Badge> : null}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{entry.tagline}</span>
            </span>
          </button>
        ))}
        {PLANNED.map((item) => (
          <div
            key={item.name}
            className="flex items-start gap-5 rounded-paper-lg border border-border bg-card/60 p-5"
          >
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-display text-lg font-bold tracking-tight text-faint">{item.name}</span>
                <Badge tone="plain">planned</Badge>
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-faint">{item.note}</span>
            </span>
          </div>
        ))}
      </div>

      <Rule className="my-12" />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-paper-lg border border-border bg-card p-6 shadow-card">
          <Eyebrow className="mb-3">Why this layer</Eyebrow>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A market scan found the chat layer has a dozen MIT competitors whose differences reviewers call “a week of
            work either way”, while run tracking, replay, forking, budget meters and pre-execution approval have no
            well-adopted open-source React answer.
          </p>
        </div>
        <div className="rounded-paper-lg border border-border bg-card p-6 shadow-card">
          <Eyebrow className="mb-3">Monochrome by design</Eyebrow>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Black, white and greys only. State is carried by shape, fill, weight and icon — a hollow dot is queued, a
            pulsing ring is running, a filled dot is done — so the surfaces stay legible in any product’s brand.
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
      <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Installation</h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        There is no package to install. Copy the component you need, keep the tokens, delete the rest.
      </p>

      <PageSection id="installation" title="Manual install">
        <ManualInstall />
      </PageSection>

      <PageSection id="usage" title="Requirements">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>· React 19 · TypeScript</li>
          <li>· Tailwind CSS v4 (the components use token utilities like bg-background, bg-card, border-border)</li>
          <li>
            · <code className="font-mono text-[12.5px] text-foreground">@base-ui/react</code> for the interactive internals
          </li>
          <li>
            · <code className="font-mono text-[12.5px] text-foreground">lucide-react</code> for icons
          </li>
          <li>
            · <code className="font-mono text-[12.5px] text-foreground">clsx</code> +{' '}
            <code className="font-mono text-[12.5px] text-foreground">tailwind-merge</code> for the single{' '}
            <code className="font-mono text-[12.5px] text-foreground">cn()</code> helper
          </li>
        </ul>
      </PageSection>

      <PageSection id="api" title="Tokens">
        <CodeBlock
          code={`:root {
  --background: #f4f4f5;        /* page canvas (grey) */
  --card: #ffffff;              /* component surfaces */
  --muted: #f4f4f5;             /* wells, inert fills */
  --border: #e4e4e7;            /* hairlines, always solid */
  --foreground: #18181b;        /* primary text */
  --primary: #09090b;           /* fills, active state */
  --muted-foreground: #71717a;
  --faint: #a1a1aa;
  --radius: 6px;
}
[data-theme='dark'] {
  --background: #09090b; --card: #18181b; --foreground: #fafafa; --primary: #fafafa;
}`}
        />
      </PageSection>
    </article>
  );
}

function ConsolePage() {
  const [step, setStep] = React.useState(RUN_ACTIVE.steps[3]);
  const [index, setIndex] = React.useState(3);
  const [playing, setPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState(1);
  const last = RUN_PARENT.steps.length - 1;

  React.useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setIndex((current) => {
        if (current >= last) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 1400 / speed);
    return () => window.clearInterval(timer);
  }, [playing, speed, last]);

  return (
    <article className="min-w-0 flex-1 pb-32">
      <Eyebrow className="mb-4">The console</Eyebrow>
      <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-[0.95] tracking-tight text-foreground sm:text-5xl">
        Every workflow run, on one screen.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        The ten components assembled the way a real ops console uses them: watch a live run, inspect a step, read the
        event log, replay the whole thing, fork it, compare the branch, and manage the run list and its metrics.
      </p>

      <div className="mt-8 space-y-6">
        <RunHeader run={RUN_ACTIVE} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <RunTimeline run={RUN_ACTIVE} selectedStepId={step.id} onSelectStep={setStep} />
          <div className="space-y-6">
            <StepDetail step={step} />
            <EventStream events={EVENTS} />
          </div>
        </div>

        <ApprovalStep request={APPROVAL_EMAIL} />

        <div className="grid gap-6">
          <ReplayScrubber
            run={RUN_PARENT}
            index={index}
            onChange={setIndex}
            playing={playing}
            onTogglePlay={() => setPlaying((value) => !value)}
            speed={speed}
            onSpeedChange={setSpeed}
          />
          <div className="grid gap-6 xl:grid-cols-2">
            <ForkPanel run={RUN_PARENT} step={RUN_PARENT.steps[2]} />
            <BranchCompare parent={RUN_PARENT} branch={RUN_BRANCH} />
          </div>
        </div>

        <div className="grid gap-6">
          <RunMetrics kpis={KPIS} trend={TREND} failures={FAILURES} />
          <RunsTable runs={RUNS} />
        </div>
      </div>

      <Rule className="my-12" />
      <Card className="p-6">
        <Eyebrow className="mb-3">Composition</Eyebrow>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Every surface above reads the same shared model — <code className="font-mono text-[12px] text-foreground">Run</code>,{' '}
          <code className="font-mono text-[12px] text-foreground">RunStep</code>,{' '}
          <code className="font-mono text-[12px] text-foreground">RunEvent</code>. Feed them from your orchestrator and the
          whole console stays in sync; no component owns your data.
        </p>
      </Card>
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[90rem] items-center gap-4 px-5">
          <a href="#/introduction" className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-paper bg-primary font-mono text-[13px] font-medium text-primary-foreground">
              P
            </span>
            <span className="font-display text-base font-bold tracking-tight">Paper</span>
            <Badge tone="muted">v0.1</Badge>
          </a>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="https://github.com/MohammedAlshami"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 text-xs text-faint transition-colors hover:text-foreground sm:inline-flex"
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
          <Eyebrow className="mb-3">Getting started</Eyebrow>
          <nav className="flex flex-col gap-0.5">
            {START_PAGES.map((page) => (
              <a
                key={page.id}
                href={`#/${page.id}`}
                className={cn(
                  'rounded-paper px-3 py-1.5 text-sm transition-colors',
                  isActive(page.id)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-card hover:text-foreground',
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
                  'rounded-paper px-3 py-1.5 text-sm transition-colors',
                  componentId === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-card hover:text-foreground',
                )}
              >
                {item.name}
              </a>
            ))}
            {PLANNED.map((item) => (
              <span key={item.name} className="cursor-default px-3 py-1.5 text-sm text-faint">
                {item.name}
              </span>
            ))}
          </nav>

          <Rule className="my-6" />
          <p className="text-xs leading-relaxed text-faint">
            Ten components. No primitives, no data grid, no chat shell.
          </p>
        </aside>

        {/* Page */}
        {entry ? (
          <ComponentPage entry={entry} />
        ) : route === 'installation' ? (
          <InstallationPage />
        ) : route === 'console' ? (
          <ConsolePage />
        ) : (
          <IntroductionPage />
        )}

        {/* On this page */}
        {entry ? (
          <nav className="sticky top-20 hidden h-fit w-48 shrink-0 py-12 xl:block">
            <Eyebrow className="mb-3">On this page</Eyebrow>
            <ul className="border-l border-border">
              {ON_THIS_PAGE.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                    className="-ml-px block w-full border-l border-transparent py-1.5 pl-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
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
