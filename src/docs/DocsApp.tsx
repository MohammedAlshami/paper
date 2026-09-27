'use client';

import * as React from 'react';
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
import {
  ApiTable,
  Code,
  CodeBlock,
  Demo,
  GhostButton,
  InstallBlock,
  Link,
  MdH1,
  MdH2,
  MdH3,
  MdLi,
  MdP,
  MdUl,
  Subtitle,
  SubtitleLink,
} from './md';
import { COMPONENTS, getComponent, type ComponentEntry } from './registry';
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

/* ============================================================================
   navigation
   ========================================================================== */

type NavItem = { id: string; label: string; href: string; external?: boolean };
type NavGroup = { heading: string; items: NavItem[] };

const COMPONENT_ITEMS: NavItem[] = COMPONENTS.map((entry) => ({
  id: entry.id,
  label: entry.name,
  href: `#/components/${entry.id}`,
}));

const NAV: NavGroup[] = [
  {
    heading: 'Overview',
    items: [
      { id: 'quick-start', label: 'Quick start', href: '#/quick-start' },
      { id: 'installation', label: 'Installation', href: '#/installation' },
      { id: 'console', label: 'Operations console', href: '#/console' },
    ],
  },
  {
    heading: 'Handbook',
    items: [
      { id: 'styling', label: 'Styling', href: '#/styling' },
      { id: 'composition', label: 'Composition', href: '#/composition' },
      { id: 'typescript', label: 'TypeScript', href: '#/typescript' },
    ],
  },
  { heading: 'Components', items: COMPONENT_ITEMS },
];

const REPO = 'https://github.com/MohammedAlshami/paper';

/* ============================================================================
   routing
   ========================================================================== */

function useRoute() {
  const read = () =>
    typeof window === 'undefined' ? 'quick-start' : window.location.hash.replace(/^#\/?/, '') || 'quick-start';
  const [route, setRoute] = React.useState(read);

  React.useEffect(() => {
    const onHashChange = () => {
      setRoute(read());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}

function useActiveAnchor() {
  const [active, setActive] = React.useState('');
  React.useEffect(() => {
    const ids = Array.from(document.querySelectorAll<HTMLElement>('.QuickNavContent [id]')).map((el) => el.id);
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: '-72px 0px -70% 0px' },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  return active;
}

/* ============================================================================
   chrome
   ========================================================================== */

function Header({ onSearch }: { onSearch: () => void }) {
  return (
    <header className="Header">
      <div className="HeaderInner">
        <a className="SkipNav" href="#main-content">
          Skip to contents
        </a>
        <a className="HeaderLogoLink" aria-label="Go to the homepage" href="#/quick-start">
          <svg width="20" height="18" viewBox="0 0 20 18" fill="currentColor" aria-hidden>
            <rect x="0" y="0" width="20" height="3" rx="1.5" />
            <rect x="0" y="7" width="13" height="3" rx="1.5" />
            <rect x="0" y="14" width="7" height="3" rx="1.5" />
          </svg>
        </a>
        <div className="HeaderSearch">
          <button type="button" className="SearchTrigger HeaderSearchDesktopTrigger" onClick={onSearch}>
            Search
            <span className="SearchTriggerShortcut">
              (<kbd>⌘</kbd>
              <kbd>k</kbd>)
            </span>
          </button>
          <button type="button" className="SearchTrigger HeaderSearchMobileTrigger" onClick={onSearch}>
            Search
          </button>
        </div>
      </div>
    </header>
  );
}

function SearchDialog({ open, onClose, onNavigate }: { open: boolean; onClose: () => void; onNavigate: (href: string) => void }) {
  const [query, setQuery] = React.useState('');
  const input = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setQuery('');
      window.setTimeout(() => input.current?.focus(), 20);
    }
  }, [open]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!open) return null;

  const results = NAV.flatMap((group) => group.items.map((item) => ({ ...item, heading: group.heading }))).filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div
      onMouseDown={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'var(--blackA-2)',
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '10vh',
      }}
    >
      <div
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          width: 'min(32rem, calc(100vw - 2rem))',
          height: 'fit-content',
          background: 'var(--color-popup)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-12)',
          boxShadow: 'var(--shadow-4)',
          overflow: 'hidden',
        }}
      >
        <input
          ref={input}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search the docs"
          style={{
            width: '100%',
            height: '3rem',
            paddingInline: '1rem',
            border: 0,
            borderBottom: '1px solid var(--color-border)',
            outline: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--font-size-15)',
            background: 'transparent',
            color: 'var(--color-foreground)',
          }}
        />
        <ul style={{ listStyle: 'none', margin: 0, padding: '.5rem', maxHeight: '20rem', overflowY: 'auto' }}>
          {results.map((item) => (
            <li key={item.href}>
              <button
                type="button"
                onClick={() => {
                  onNavigate(item.href);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  padding: '.5rem .625rem',
                  border: 0,
                  background: 'transparent',
                  borderRadius: 'var(--radius-6)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--font-size-14)',
                  color: 'var(--color-foreground)',
                  cursor: 'default',
                  textAlign: 'left',
                }}
              >
                {item.label}
                <span style={{ color: 'var(--gray-t1)', fontSize: 'var(--font-size-13)' }}>{item.heading}</span>
              </button>
            </li>
          ))}
          {!results.length ? (
            <li style={{ padding: '.75rem', color: 'var(--gray-t1)', fontSize: 'var(--font-size-14)' }}>No matches.</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

function SideNav({ route }: { route: string }) {
  return (
    <nav aria-label="Main navigation" className="SideNavRoot">
      <div className="SideNavViewport" data-side-nav-viewport="true" style={{ overflowY: 'auto' }}>
        {NAV.map((group) => (
          <div className="SideNavSection" key={group.heading}>
            <div className="SideNavHeading">{group.heading}</div>
            <ul className="SideNavList">
              {group.items.map((item) => (
                <li className="SideNavItem" key={item.href}>
                  <a
                    className="SideNavLink"
                    href={item.href}
                    aria-current={route === item.id ? 'true' : undefined}
                    data-active={route === item.id ? 'true' : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <hr className="SideNavSeparator" />
        <div className="SideNavSection">
          <ul className="SideNavList">
            <li className="SideNavItem">
              <a className="SideNavLink" href={REPO} target="_blank" rel="noopener noreferrer">
                <div className="SideNavLinkIconContainer">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                    <path d="M8 0C3.58 0 0 3.67 0 8.2c0 3.63 2.29 6.7 5.47 7.78.4.07.55-.17.55-.39 0-.19-.01-.84-.01-1.53-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.16-.28-.15-.68-.53-.01-.54.63-.01 1.08.59 1.23.84.72 1.24 1.87.89 2.33.68.07-.53.28-.89.51-1.1-1.78-.2-3.64-.91-3.64-4.05 0-.89.31-1.63.82-2.2-.08-.21-.36-1.05.08-2.17 0 0 .67-.22 2.2.84.64-.18 1.32-.28 2-.28s1.36.09 2 .28c1.53-1.07 2.2-.84 2.2-.84.44 1.13.16 1.97.08 2.17.51.57.82 1.3.82 2.2 0 3.15-1.87 3.84-3.65 4.05.29.26.54.75.54 1.52 0 1.1-.01 1.98-.01 2.26 0 .22.15.47.55.39C13.71 14.9 16 11.82 16 8.2 16 3.67 12.42 0 8 0" />
                  </svg>
                  GitHub
                </div>
              </a>
            </li>
            <li className="SideNavItem">
              <a className="SideNavLink" href={`${REPO}/releases`} target="_blank" rel="noopener noreferrer">
                <div className="SideNavLinkIconContainer">
                  <svg fill="currentColor" width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                    <rect width="16" height="16" fill="black" />
                    <rect x="3" y="3" width="10" height="10" fill="white" />
                    <path d="M8 5H11V13H8V5Z" fill="black" />
                  </svg>
                  <span>
                    releases
                    <span className="SideNavVersion">0.1.0</span>
                  </span>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

type QuickNavItem = { id: string; label: string; children?: QuickNavItem[] };

function QuickNav({ title, items }: { title: string; items: QuickNavItem[] }) {
  const active = useActiveAnchor();
  return (
    <div className="QuickNavContainer">
      <nav aria-label="On this page" className="QuickNavRoot">
        <div className="QuickNavInner">
          <div className="QuickNavViewport" style={{ overflowY: 'auto' }}>
            <header className="bui-sr-only">{title}</header>
            <ul className="QuickNavList">
              <li className="QuickNavItem">
                <a className="QuickNavLink" href="#">
                  (Top)
                </a>
              </li>
              {items.map((item) => (
                <li className="QuickNavItem" key={item.id}>
                  <a
                    className="QuickNavLink"
                    href={`#${item.id}`}
                    aria-current={active === item.id ? 'true' : undefined}
                    style={active === item.id ? { color: 'var(--gray-t2)' } : undefined}
                  >
                    {item.label}
                  </a>
                  {item.children?.length ? (
                    <ul className="QuickNavList">
                      {item.children.map((child) => (
                        <li className="QuickNavItem" key={child.id}>
                          <a
                            className="QuickNavLink"
                            href={`#${child.id}`}
                            style={active === child.id ? { color: 'var(--gray-t2)' } : undefined}
                          >
                            {child.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

/* ============================================================================
   pages
   ========================================================================== */

function QuickStartPage() {
  return (
    <>
      <MdH1 id="quick-start">Quick start</MdH1>
      <Subtitle
        links={
          <SubtitleLink href={`${REPO}#readme`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M14.85 12.92H1.15A1.15 1.15 0 0 1 0 11.77V4.23a1.15 1.15 0 0 1 1.15-1.15h13.7a1.15 1.15 0 0 1 1.15 1.15v7.54a1.15 1.15 0 0 1-1.15 1.15M3.85 10.62V7.61l1.54 1.93 1.53-1.93v3h1.54V5.39H6.92l-1.53 1.92-1.54-1.92H2.31v5.23zm10.3-2.62H12.6V5.38h-1.53v2.62H9.54l2.3 2.69z"
                fill="currentColor"
              />
            </svg>
            View as Markdown
          </SubtitleLink>
        }
      >
        Ten components for running and managing AI workflows with React.
      </Subtitle>

      <MdP>
        Paper is the <em>operations</em> layer of an AI product: watching a run, inspecting a step, replaying it, forking
        it, comparing the branch, listing every run, watching the metrics, and approving a side effect before it happens.
        The chat layer is commodity — this is the part that today only exists inside closed observability platforms.
      </MdP>

      <MdP>
        There is no package to install. Every component is a file you copy into your project and own. They are built on{' '}
        <Link href="https://ui.shadcn.com/" arrow>
          shadcn/ui
        </Link>{' '}
        components, so they inherit your theme.
      </MdP>

      <Demo
        code={`import { RunHeader } from '@/components/agent-ops/run-header';
import { RunTimeline } from '@/components/agent-ops/run-timeline';

export function RunPanel({ run, step, onSelectStep }) {
  return (
    <div className="grid gap-4">
      <RunHeader run={run} />
      <RunTimeline run={run} selectedStepId={step.id} onSelectStep={onSelectStep} />
    </div>
  );
}`}
        wide
      >
        <div style={{ display: 'grid', gap: '1rem' }}>
          <RunHeader run={RUN_ACTIVE} />
          <RunTimeline run={RUN_ACTIVE} selectedStepId="s4" />
        </div>
      </Demo>

      <MdH2 id="the-shared-model">The shared model</MdH2>
      <MdP>
        Every component speaks the same model, so you can feed them from any orchestrator. Nothing owns your data: pass
        a <Code>Run</Code> in, get events out.
      </MdP>
      <MdUl>
        <MdLi>
          <Code>Workflow</Code> — id, name, version and its steps.
        </MdLi>
        <MdLi>
          <Code>Run</Code> — status, trigger, totals, and the steps; optionally a <Code>parentRunId</Code> when it is a
          fork.
        </MdLi>
        <MdLi>
          <Code>RunStep</Code> — type (agent, llm, tool, human), status, duration, tokens, cost, input, output, error,
          attempt.
        </MdLi>
        <MdLi>
          <Code>RunEvent</Code> — timestamp, level (info, warn, error), type and message.
        </MdLi>
      </MdUl>

      <MdH2 id="see-it-assembled">See it assembled</MdH2>
      <MdP>
        The <Link href="#/console">Operations console</Link> page stacks all ten the way a real ops screen uses them.
      </MdP>
    </>
  );
}

function InstallationPage() {
  return (
    <>
      <MdH1 id="installation">Installation</MdH1>
      <Subtitle>How to get the components into your project.</Subtitle>

      <MdH2 id="install-the-dependencies">Install the dependencies</MdH2>
      <MdP>Every component is plain React. Install the runtime helpers it imports — icons and the class helper.</MdP>
      <InstallBlock packages="lucide-react clsx tailwind-merge" />

      <MdH2 id="copy-the-component">Copy the component</MdH2>
      <MdP>
        Copy the file you need from <Code>src/components/agent-ops</Code> into your project. Components compose the
        primitives in <Code>src/components/ui</Code> (shadcn/ui) and the shared types in{' '}
        <Code>components/agent-ops/types.ts</Code>.
      </MdP>
      <CodeBlock file="terminal" language="bash" code={`cp src/components/agent-ops/{run-header,run-timeline,types}.tsx ./src/components/agent-ops/`} />

      <MdH2 id="set-up-styles">Set up styles</MdH2>
      <MdP>
        The components use the standard shadcn/ui CSS variables, plus Tailwind v4. If you already run shadcn/ui, there is
        nothing to configure.
      </MdP>
      <CodeBlock
        file="styles.css"
        language="css"
        code={`@import 'tailwindcss';

:root {
  --radius: 0.5rem;
  --background: #ffffff;
  --foreground: #2e2e2e;
  --border: #00000014;
  --muted: #f9f9f9;
  --muted-foreground: #767676;
  --primary: #2e2e2e;
  --primary-foreground: #ffffff;
}`}
      />

      <MdH2 id="requirements">Requirements</MdH2>
      <MdUl>
        <MdLi>React 19 and TypeScript.</MdLi>
        <MdLi>
          Tailwind CSS v4, with{' '}
          <Link href="https://ui.shadcn.com/" arrow>
            shadcn/ui
          </Link>{' '}
          components available at <Code>@/components/ui</Code>.
        </MdLi>
        <MdLi>
          <Code>lucide-react</Code> for icons.
        </MdLi>
      </MdUl>
    </>
  );
}

function StylingPage() {
  return (
    <>
      <MdH1 id="styling">Styling</MdH1>
      <Subtitle>How the components are styled, and how to make them yours.</Subtitle>

      <MdH2 id="tokens">Tokens</MdH2>
      <MdP>
        Everything runs on CSS variables, so a rebrand is a variable change rather than a component fork. The values below
        are the ones the components are designed against.
      </MdP>
      <CodeBlock
        file="styles.css"
        language="css"
        code={`:root {
  --background: #ffffff;
  --foreground: #2e2e2e;
  --card: #ffffff;
  --muted: #f9f9f9;
  --muted-foreground: #767676;
  --border: #00000014;
  --primary: #2e2e2e;
  --primary-foreground: #ffffff;
  --ring: #2e2e2e;
  --radius: 0.5rem;
}`}
      />

      <MdH2 id="state-without-colour">State without colour</MdH2>
      <MdP>
        A run has six states and the palette has no hues to spare, so state is carried by shape, fill, weight and icon —
        which is also what makes the components legible in any product’s brand.
      </MdP>
      <MdUl>
        <MdLi>Queued — a hollow circle.</MdLi>
        <MdLi>Running — a spinning arc in the ring.</MdLi>
        <MdLi>Waiting — a half-filled circle and a half-filled bar: blocked on a human.</MdLi>
        <MdLi>Done — a filled circle with a check.</MdLi>
        <MdLi>Failed — a circle with an ✕, plus the error inline.</MdLi>
        <MdLi>Skipped — a faint outline and a strikethrough.</MdLi>
      </MdUl>

      <MdH2 id="overriding">Overriding</MdH2>
      <MdP>
        Every component accepts <Code>className</Code> and spreads the rest of its props onto its root element, so the
        usual Tailwind escape hatches work.
      </MdP>
      <CodeBlock
        code={`<StepDetail step={step} className="bg-muted/40" />`}
      />
    </>
  );
}

function CompositionPage() {
  return (
    <>
      <MdH1 id="composition">Composition</MdH1>
      <Subtitle>One model, ten surfaces, no data owned by any of them.</Subtitle>

      <MdH2 id="controlled">Controlled by default</MdH2>
      <MdP>
        Selection, replay position and filters are either controlled (<Code>value</Code> + <Code>onChange</Code>) or
        local. Nothing reaches for a context you did not provide, so two consoles can sit on one page without
        interfering.
      </MdP>
      <CodeBlock
        code={`const [step, setStep] = React.useState(run.steps[0]);

<RunTimeline run={run} selectedStepId={step.id} onSelectStep={setStep} />
<StepDetail step={step} onRetry={() => retry(step)} />`}
      />

      <MdH2 id="data-flow">Data flow</MdH2>
      <MdP>
        The components are read-only views over data you already have. When your orchestrator emits something, pass the
        new array in — the timeline, event stream and metrics all follow.
      </MdP>
      <CodeBlock
        code={`// your orchestrator, your store, your socket
socket.on('run:update', (run) => store.setRun(run));

// the console is just a view
<EventStream events={run.events} />`}
      />

      <MdH2 id="internal-primitives">Internal primitives</MdH2>
      <MdP>
        Anything under <Code>components/internal</Code> is implementation detail, not API. The public surface is the ten
        components; if you delete an internal helper, the compiler tells you which component needed it.
      </MdP>
    </>
  );
}

function TypeScriptPage() {
  return (
    <>
      <MdH1 id="typescript">TypeScript</MdH1>
      <Subtitle>The types are the documentation.</Subtitle>

      <MdH2 id="the-model">The model</MdH2>
      <MdP>Import the model once and every component accepts it.</MdP>
      <CodeBlock
        file="components/agent-ops/types.ts"
        code={`export type StepType = 'agent' | 'llm' | 'tool' | 'human' | 'subworkflow';
export type StepStatus = 'queued' | 'running' | 'done' | 'waiting' | 'failed' | 'skipped';
export type RunStatus = 'queued' | 'running' | 'waiting' | 'paused' | 'succeeded' | 'failed' | 'cancelled';

export interface RunStep {
  id: string;
  name: string;
  type: StepType;
  status: StepStatus;
  durationMs?: number;
  tokens?: number;
  cost?: number;
  attempt?: number;
  input?: string;
  output?: string;
  error?: string;
  meta?: string;
}

export interface Run {
  id: string;
  workflow: string;
  workflowVersion?: string;
  status: RunStatus;
  trigger?: 'manual' | 'schedule' | 'webhook' | 'api';
  startedAt?: string;
  elapsed?: string;
  heartbeat?: string;
  checkpoint?: string;
  tokens?: number;
  cost?: number;
  steps: RunStep[];
  parentRunId?: string;
  forkedFromStep?: string;
}`}
      />

      <MdH2 id="extending">Extending</MdH2>
      <MdP>
        Add fields to <Code>RunStep</Code> and the components keep working: they render what they know and ignore the
        rest. Where a component needs more, it takes a small dedicated type — for example{' '}
        <Code>ApprovalRequest</Code> for the approval step.
      </MdP>
      <CodeBlock
        code={`import type { Run, RunStep } from '@/components/agent-ops/types';

function MyOwnTimeline({ run }: { run: Run }) {
  return run.steps.map((step: RunStep) => step.name);
}`}
      />
    </>
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
    <>
      <MdH1 id="operations-console">Operations console</MdH1>
      <Subtitle>All ten components on one screen, the way an ops product uses them.</Subtitle>

      <MdP>
        Watch a live run, inspect a step, read the event log, replay the whole thing, fork it from a step, compare the
        branch, then manage the run list and its metrics. Everything below is live — click a step, scrub the replay.
      </MdP>

      <Demo wide file="agent-ops-console.tsx" code={`const [step, setStep] = React.useState(run.steps[3]);

<RunHeader run={run} />
<RunTimeline run={run} selectedStepId={step.id} onSelectStep={setStep} />
<StepDetail step={step} onRetry={() => retry(step)} />
<EventStream events={events} />`}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <RunHeader run={RUN_ACTIVE} />
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'minmax(0,1fr)' }}>
            <RunTimeline run={RUN_ACTIVE} selectedStepId={step.id} onSelectStep={setStep} />
            <StepDetail step={step} />
            <EventStream events={EVENTS} />
          </div>
        </div>
      </Demo>

      <Demo wide file="replay-fork.tsx" code={`<ReplayScrubber run={run} index={index} onChange={setIndex} />
<ForkPanel run={run} step={step} onFork={fork} />
<BranchCompare parent={parent} branch={branch} />`}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <ReplayScrubber
            run={RUN_PARENT}
            index={index}
            onChange={setIndex}
            playing={playing}
            onTogglePlay={() => setPlaying((value) => !value)}
            speed={speed}
            onSpeedChange={setSpeed}
          />
          <ForkPanel run={RUN_PARENT} step={RUN_PARENT.steps[2]} />
          <BranchCompare parent={RUN_PARENT} branch={RUN_BRANCH} />
        </div>
      </Demo>

      <Demo wide file="approvals-metrics.tsx" code={`<ApprovalStep request={request} onApprove={approve} />
<RunMetrics kpis={kpis} trend={trend} failures={failures} />
<RunsTable runs={runs} onSelect={openRun} />`}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <ApprovalStep request={APPROVAL_EMAIL} />
          <RunMetrics kpis={KPIS} trend={TREND} failures={FAILURES} />
          <RunsTable runs={RUNS} />
        </div>
      </Demo>
    </>
  );
}

const COMPONENT_SECTIONS: QuickNavItem[] = [
  { id: 'installation', label: 'Installation' },
  { id: 'usage', label: 'Usage' },
  { id: 'anatomy', label: 'Anatomy' },
  { id: 'examples', label: 'Examples' },
];

function ComponentPage({ entry, route }: { entry: ComponentEntry; route: string }) {
  void route;
  const examples = EXAMPLES[entry.id] ?? [];
  return (
    <>
      <MdH1 id={entry.id}>{entry.name}</MdH1>
      <Subtitle
        links={
          <>
            <SubtitleLink href={`${REPO}/blob/main/src/${entry.file}`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M8 0C3.58 0 0 3.67 0 8.2c0 3.63 2.29 6.7 5.47 7.78.4.07.55-.17.55-.39 0-.19-.01-.84-.01-1.53-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.16-.28-.15-.68-.53-.01-.54.63-.01 1.08.59 1.23.84.72 1.24 1.87.89 2.33.68.07-.53.28-.89.51-1.1-1.78-.2-3.64-.91-3.64-4.05 0-.89.31-1.63.82-2.2-.08-.21-.36-1.05.08-2.17 0 0 .67-.22 2.2.84.64-.18 1.32-.28 2-.28s1.36.09 2 .28c1.53-1.07 2.2-.84 2.2-.84.44 1.13.16 1.97.08 2.17.51.57.82 1.3.82 2.2 0 3.15-1.87 3.84-3.65 4.05.29.26.54.75.54 1.52 0 1.1-.01 1.98-.01 2.26 0 .22.15.47.55.39C13.71 14.9 16 11.82 16 8.2 16 3.67 12.42 0 8 0" />
              </svg>
              View source
            </SubtitleLink>
            <SubtitleLink href={`${REPO}#readme`}>View as Markdown</SubtitleLink>
          </>
        }
      >
        {entry.tagline}
      </Subtitle>

      <MdP>{entry.description}</MdP>

      <Demo code={entry.usage} file={`${entry.id}.tsx`} wide={entry.wide}>
        {PREVIEWS[entry.id]}
      </Demo>

      <MdH2 id="installation">Installation</MdH2>
      <MdP>
        The component is built on shadcn/ui primitives. Add the ones it uses, then copy{' '}
        <Code>src/{entry.file}</Code> into your project.
      </MdP>
      <CodeBlock file="terminal" language="bash" code={`pnpm dlx shadcn@latest add ${entry.primitives.join(' ')}`} />
      {entry.deps.length ? (
        <>
          <MdP>And the packages the file imports:</MdP>
          <InstallBlock packages={entry.deps.join(' ')} />
        </>
      ) : null}

      <MdH2 id="usage">Usage</MdH2>
      <CodeBlock code={entry.usage} />

      <MdH2 id="anatomy">Anatomy</MdH2>
      <MdP>Import the component and pass it the part of the model it renders.</MdP>
      <CodeBlock code={entry.anatomy} />

      <MdH2 id="examples">Examples</MdH2>
      {examples.map((example, index) => (
        <React.Fragment key={example.label}>
          <MdH3 id={example.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>{example.label}</MdH3>
          <Demo code={entry.examples[index]?.code ?? entry.usage} wide={entry.wide}>
            {example.node}
          </Demo>
        </React.Fragment>
      ))}

      <MdH2 id="api-reference">API reference</MdH2>
      <ApiTable sections={entry.api} />
    </>
  );
}

/* ============================================================================
   app
   ========================================================================== */

export default function DocsApp() {
  const route = useRoute();
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const componentId = route.startsWith('components/') ? route.slice('components/'.length) : null;
  const entry = componentId ? getComponent(componentId) : undefined;

  const quickNav: QuickNavItem[] = entry
    ? [
        ...COMPONENT_SECTIONS,
        {
          id: 'api-reference',
          label: 'API reference',
          children: entry.api.map((section) => ({
            id: section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            label: section.title,
          })),
        },
      ]
    : route === 'installation'
      ? [
          { id: 'install-the-dependencies', label: 'Install the dependencies' },
          { id: 'copy-the-component', label: 'Copy the component' },
          { id: 'set-up-styles', label: 'Set up styles' },
          { id: 'requirements', label: 'Requirements' },
        ]
      : route === 'styling'
        ? [
            { id: 'tokens', label: 'Tokens' },
            { id: 'state-without-colour', label: 'State without colour' },
            { id: 'overriding', label: 'Overriding' },
          ]
        : route === 'composition'
          ? [
              { id: 'controlled', label: 'Controlled by default' },
              { id: 'data-flow', label: 'Data flow' },
              { id: 'internal-primitives', label: 'Internal primitives' },
            ]
          : route === 'typescript'
            ? [
                { id: 'the-model', label: 'The model' },
                { id: 'extending', label: 'Extending' },
              ]
            : [
                { id: 'the-shared-model', label: 'The shared model' },
                { id: 'see-it-assembled', label: 'See it assembled' },
              ];

  const page = entry ? (
    <ComponentPage entry={entry} route={route} />
  ) : route === 'installation' ? (
    <InstallationPage />
  ) : route === 'console' ? (
    <ConsolePage />
  ) : route === 'styling' ? (
    <StylingPage />
  ) : route === 'composition' ? (
    <CompositionPage />
  ) : route === 'typescript' ? (
    <TypeScriptPage />
  ) : (
    <QuickStartPage />
  );

  return (
    <div className="RootLayout">
      <div className="RootLayoutContainer">
        <div className="RootLayoutContent">
          <div className="ContentLayoutRoot">
            <Header onSearch={() => setSearchOpen(true)} />
            <SideNav route={route} />
            <main className="ContentLayoutMain" id="main-content">
              <QuickNav title={entry?.name ?? 'Paper'} items={quickNav} />
              <div className="QuickNavContent">{page}</div>
            </main>
          </div>
        </div>
      </div>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={(href) => (window.location.hash = href.replace(/^#/, ''))} />
    </div>
  );
}
