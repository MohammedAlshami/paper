import * as React from 'react';
import { ChevronRight, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Rule } from '@/components/ui/rule';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/editorial/empty-state';
import { Eyebrow } from '@/components/editorial/eyebrow';
import { FeatureCard } from '@/components/editorial/feature-card';
import { Illustration, ILLUSTRATIONS } from '@/components/editorial/illustration';
import { SectionHeading } from '@/components/editorial/section-heading';

const NAV = [
  { id: 'start', label: 'Getting started' },
  { id: 'foundations', label: 'Foundations' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'components', label: 'Components' },
  { id: 'illustrations', label: 'Illustrations' },
  { id: 'roadmap', label: 'Roadmap' },
];

function Preview({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-paper-lg border border-dashed border-line bg-raised/40 p-6', className)}>
      {children}
    </div>
  );
}

function Snippet({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-paper border border-dashed border-line bg-sunk/50 p-4 font-mono text-[12.5px] leading-relaxed text-ink-muted">
      {children}
    </pre>
  );
}

function Block({
  id,
  title,
  note,
  code,
  children,
  wide,
}: {
  id: string;
  title: string;
  note: string;
  code?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-display text-2xl font-bold tracking-tight text-ink">{title}</h3>
        <Badge>{id}</Badge>
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{note}</p>
      <div className={cn('mt-5', wide ? '' : 'max-w-3xl')}>{children}</div>
      {code ? <Snippet>{code}</Snippet> : null}
    </section>
  );
}

export default function App() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-dashed border-line bg-paper/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-5">
          <a href="#start" className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-md bg-ink font-mono text-[13px] font-medium text-paper">
              P
            </span>
            <span className="font-display text-base font-bold tracking-tight">Paper</span>
            <Badge tone="faint">v0.1</Badge>
          </a>
          <span className="hidden text-xs text-ink-faint sm:block">
            a light editorial React UI kit · copy, paste, own
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? 'Dark' : 'Light'} theme
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => document.getElementById('start')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get started <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-12 px-5">
        {/* Sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto py-10 lg:block">
          <Eyebrow className="mb-4">Documentation</Eyebrow>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="rounded-md px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-ink/[0.05] hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <Rule className="my-6" />
          <p className="text-xs leading-relaxed text-ink-faint">
            No package to install. Copy the file you need, keep the tokens, delete the rest.
          </p>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 pb-32">
          {/* Hero */}
          <section id="start" className="scroll-mt-24 py-14">
            <Eyebrow className="mb-5">Copy-paste React components</Eyebrow>
            <h1 className="max-w-4xl font-display text-5xl font-extrabold leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
              An editorial interface kit for people who care how it looks.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-muted">
              Paper is a light, illustrated component set: cream stock, near-black ink, dashed rules and
              line-art illustrations. You copy the components into your project and own them — there is no
              runtime package, no version to chase, and every token is a CSS variable you can rewrite.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={() => document.getElementById('components')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Browse components <ChevronRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Mail className="size-4" /> Read the roadmap
              </Button>
            </div>
            <Rule className="my-10" />
            <div className="grid gap-6 sm:grid-cols-3">
              <FeatureCard illustration="puzzle" title="Own the code">
                Each component is one readable file. Edit it, rename it, ship it.
              </FeatureCard>
              <FeatureCard illustration="balance" title="Designed, not default">
                Editorial type, dashed hairlines and illustrated states out of the box.
              </FeatureCard>
              <FeatureCard illustration="key" title="Tokens first">
                A light theme by default, the dark editorial theme one attribute away.
              </FeatureCard>
            </div>
          </section>

          <Rule />

          {/* Foundations */}
          <section id="foundations" className="scroll-mt-24 py-10">
            <SectionHeading
              eyebrow="Foundations"
              title="Tokens & type"
              description="Everything inherits from a handful of CSS variables. Change them once and the whole kit follows — including the dark variant your portfolio already uses."
            />
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <Preview>
                <Eyebrow className="mb-4">Palette</Eyebrow>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    ['paper', 'bg-paper border-line'],
                    ['raised', 'bg-raised border-line'],
                    ['sunk', 'bg-sunk border-line'],
                    ['ink', 'bg-ink border-transparent'],
                    ['accent', 'bg-accent border-transparent'],
                    ['accent-soft', 'bg-accent-soft border-line'],
                  ].map(([name, cls]) => (
                    <div key={name} className="text-xs text-ink-muted">
                      <div className={cn('mb-2 h-14 rounded-paper border border-dashed', cls)} />
                      <code className="font-mono">{name}</code>
                    </div>
                  ))}
                </div>
              </Preview>
              <Preview>
                <Eyebrow className="mb-4">Typography</Eyebrow>
                <p className="font-display text-3xl font-extrabold tracking-tight">Display — Syne</p>
                <p className="mt-3 text-base leading-relaxed text-ink-muted">
                  Body — the system UI stack (SF Pro / Helvetica), the same stack the portfolio falls back to.
                </p>
                <p className="mt-3 font-serif text-xl italic">Serif accent — Playfair Display</p>
                <p className="mt-3 font-mono text-sm text-ink-muted">Mono — JetBrains Mono · $0.0015</p>
              </Preview>
            </div>
            <Snippet>{`:root {
  --paper: #fff7dd;      /* page */
  --ink: #0e100f;        /* text */
  --line: rgba(14,16,15,0.22);   /* dashed rules */
  --accent: #b4791f;
}
[data-theme='dark'] { --paper: #0e100f; --ink: #fff7dd; }`}</Snippet>
          </section>

          <Rule />

          {/* Editorial */}
          <section id="editorial" className="scroll-mt-24 py-10">
            <SectionHeading
              eyebrow="Editorial"
              title="The distinctive pieces"
              description="These are the components that make an app feel like a magazine rather than a dashboard."
            />
            <div className="mt-8 space-y-4">
              <Block
                id="section-heading"
                title="SectionHeading"
                note="Eyebrow, oversized display title and a standfirst paragraph."
                code={`<SectionHeading eyebrow="Overview" title="Built for long documents" description="…" />`}
              >
                <Preview>
                  <SectionHeading
                    eyebrow="Chapter one"
                    title="A heading that carries the page"
                    description="Set once, aligned to a measure, no extra wrapper divs."
                    size="md"
                  />
                </Preview>
              </Block>

              <Block
                id="empty-state"
                title="EmptyState"
                note="Illustrated empty states — the state most libraries leave as a grey box."
                code={`<EmptyState illustration="search" title="No results" description="…" actions={<Button>Clear filters</Button>} />`}
              >
                <Preview className="bg-transparent p-0">
                  <EmptyState
                    illustration="search"
                    title="Nothing here yet"
                    description="Filter the list, or start a new document to fill this space."
                    actions={
                      <>
                        <Button size="sm">New document</Button>
                        <Button size="sm" variant="outline">
                          Clear filters
                        </Button>
                      </>
                    }
                  />
                </Preview>
              </Block>

              <Block
                id="feature-card"
                title="FeatureCard"
                note="A card with an illustration, a title and a line of copy."
                code={`<FeatureCard illustration="growth" title="Grows with you">…</FeatureCard>`}
              >
                <Preview>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FeatureCard illustration="growth" title="Grows with you">
                      Swap the illustration, keep the rhythm.
                    </FeatureCard>
                    <FeatureCard illustration="review" title="Made to be read">
                      Comfortable measure and calm contrast.
                    </FeatureCard>
                  </div>
                </Preview>
              </Block>
            </div>
          </section>

          <Rule />

          {/* Components */}
          <section id="components" className="scroll-mt-24 py-10">
            <SectionHeading
              eyebrow="Components"
              title="The primitives"
              description="Small, single-purpose files. Interactive ones are built on Base UI, so behaviour and accessibility come from a library that is already battle-tested."
            />
            <div className="mt-8 space-y-4">
              <Block
                id="button"
                title="Button"
                note="Solid ink by default; dashed outline for secondary actions."
                code={`<Button>Primary</Button>\n<Button variant="outline">Secondary</Button>\n<Button variant="ghost">Ghost</Button>`}
              >
                <Preview>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button>Primary</Button>
                    <Button variant="outline">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="accent">Accent</Button>
                    <Button variant="link">Link</Button>
                    <Button disabled>Disabled</Button>
                  </div>
                </Preview>
              </Block>

              <Block
                id="badge"
                title="Badge"
                note="Uppercase, dashed, tracking-wide. Good for categories and status."
                code={`<Badge>API</Badge>\n<Badge tone="ink">MCP</Badge>`}
              >
                <Preview>
                  <div className="flex flex-wrap gap-2">
                    <Badge>API</Badge>
                    <Badge>MCP</Badge>
                    <Badge tone="ink">Search</Badge>
                    <Badge tone="accent">Claude Skill</Badge>
                    <Badge tone="faint">Draft</Badge>
                  </div>
                </Preview>
              </Block>

              <Block
                id="card"
                title="Card"
                note="Soft raised surface with a dashed hairline."
                code={`<Card><CardHeader><CardTitle>…</CardTitle><CardDescription>…</CardDescription></CardHeader><CardContent>…</CardContent><CardFooter>…</CardFooter></Card>`}
              >
                <Preview>
                  <Card className="max-w-md">
                    <CardHeader>
                      <CardTitle>OpenAbstracts</CardTitle>
                      <CardDescription>
                        A paper search API and remote MCP server over an OpenSearch index.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      <Badge>API</Badge>
                      <Badge>MCP</Badge>
                    </CardContent>
                    <CardFooter>
                      <Button size="sm">Visit</Button>
                      <Button size="sm" variant="outline">
                        Details
                      </Button>
                    </CardFooter>
                  </Card>
                </Preview>
              </Block>

              <Block
                id="fields"
                title="Input, Textarea, Label"
                note="Dashed hairline that becomes solid on focus."
                code={`<Label htmlFor="email">Email</Label>\n<Input id="email" placeholder="you@example.com" />\n<Textarea placeholder="Notes…" />`}
              >
                <Preview>
                  <div className="grid max-w-md gap-5">
                    <div>
                      <Label htmlFor="paper-email">Email</Label>
                      <Input id="paper-email" placeholder="you@example.com" />
                    </div>
                    <div>
                      <Label htmlFor="paper-notes">Notes</Label>
                      <Textarea id="paper-notes" placeholder="What are you building?" />
                    </div>
                  </div>
                </Preview>
              </Block>

              <Block
                id="tabs"
                title="Tabs"
                note="Base UI under the hood, with a sliding hairline indicator."
                code={`<Tabs defaultValue="overview">\n  <TabsList>\n    <TabsTab value="overview">Overview</TabsTab>\n    <TabsTab value="usage">Usage</TabsTab>\n    <TabsIndicator />\n  </TabsList>\n  <TabsPanel value="overview">…</TabsPanel>\n</Tabs>`}
              >
                <Preview>
                  <Tabs defaultValue="overview">
                    <TabsList>
                      <TabsTab value="overview">Overview</TabsTab>
                      <TabsTab value="usage">Usage</TabsTab>
                      <TabsTab value="api">API</TabsTab>
                      <TabsIndicator />
                    </TabsList>
                    <TabsPanel value="overview">
                      <p className="text-sm text-ink-muted">
                        Panels share a grid cell, so their height animates naturally.
                      </p>
                    </TabsPanel>
                    <TabsPanel value="usage">
                      <Snippet>{`npx shadcn@latest add <url>/button.json`}</Snippet>
                    </TabsPanel>
                    <TabsPanel value="api">
                      <p className="font-mono text-sm text-ink-muted">value: string (required)</p>
                    </TabsPanel>
                  </Tabs>
                </Preview>
              </Block>

              <Block
                id="accordion"
                title="Accordion"
                note="Dashed separators, rotating plus, animated panel height."
                code={`<Accordion>\n  <AccordionItem value="a">\n    <AccordionTrigger>What is Paper?</AccordionTrigger>\n    <AccordionPanel>A light editorial UI kit.</AccordionPanel>\n  </AccordionItem>\n</Accordion>`}
              >
                <Preview>
                  <Accordion defaultValue={['a']}>
                    <AccordionItem value="a">
                      <AccordionTrigger>Is this a package I install?</AccordionTrigger>
                      <AccordionPanel>
                        No. You copy the component file into your project. Dependencies are Base UI for
                        behaviour and a single <code className="font-mono">cn()</code> helper.
                      </AccordionPanel>
                    </AccordionItem>
                    <AccordionItem value="b">
                      <AccordionTrigger>Can I use it in a dark app?</AccordionTrigger>
                      <AccordionPanel>
                        Yes — set <code className="font-mono">data-theme=&quot;dark&quot;</code> and the whole kit
                        flips to the near-black/cream palette.
                      </AccordionPanel>
                    </AccordionItem>
                    <AccordionItem value="c">
                      <AccordionTrigger>Licence?</AccordionTrigger>
                      <AccordionPanel>MIT. Take it, fork it, ship it.</AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </Preview>
              </Block>

              <Block
                id="rule-skeleton"
                title="Rule & Skeleton"
                note="The dashed hairline that separates everything, and a calm loading state."
                code={`<Rule />\n<Skeleton className="h-4 w-40" />`}
              >
                <Preview>
                  <Rule />
                  <div className="mt-6 grid gap-3">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </Preview>
              </Block>
            </div>
          </section>

          <Rule />

          {/* Illustrations */}
          <section id="illustrations" className="scroll-mt-24 py-10">
            <SectionHeading
              eyebrow="Illustrations"
              title={`${Object.keys(ILLUSTRATIONS).length} illustrated states`}
              description="Line-art illustrations that sit on the paper background. Use them in empty states, feature cards and error pages — and swap in your own by editing one map."
            />
            <Preview className="mt-8">
              <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6">
                {Object.keys(ILLUSTRATIONS).map((name) => (
                  <figure key={name} className="text-center">
                    <Illustration name={name as keyof typeof ILLUSTRATIONS} className="mx-auto h-20 w-20" />
                    <figcaption className="mt-3 font-mono text-[11px] text-ink-faint">{name}</figcaption>
                  </figure>
                ))}
              </div>
            </Preview>
            <Snippet>{`<Illustration name="search" className="h-32 w-32" />`}</Snippet>
          </section>

          <Rule />

          {/* Roadmap */}
          <section id="roadmap" className="scroll-mt-24 py-10">
            <SectionHeading
              eyebrow="Roadmap"
              title="Where this goes next"
              description="The foundation is the editorial kit above. The next batch targets the gap the research identified: the agent-ops layer, which exists today only inside closed platforms."
            />
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <FeatureCard illustration="target" title="RunTimeline">
                Long-running agent runs as a stepper with checkpoint, resume and fork — not a spinner.
              </FeatureCard>
              <FeatureCard illustration="key" title="ApprovalGate">
                Pre-execution approval for tool calls, with the arguments shown before anything runs.
              </FeatureCard>
              <FeatureCard illustration="review" title="TraceInspector">
                Steps, tool calls, tokens and latency in one panel you can drop into any app.
              </FeatureCard>
              <FeatureCard illustration="stats" title="CostMeter">
                Token and cost budgets with a calm, readable meter.
              </FeatureCard>
              <FeatureCard illustration="delivery" title="MCPCatalog">
                Browse, connect and authenticate MCP servers from the UI.
              </FeatureCard>
              <FeatureCard illustration="beacon" title="States">
                A complete empty / loading / error system, illustrated.
              </FeatureCard>
            </div>
            <Rule className="my-8" />
            <div className="rounded-paper-lg border border-dashed border-line bg-raised/50 p-6">
              <Eyebrow className="mb-3">Also planned</Eyebrow>
              <ul className="space-y-2 text-sm text-ink-muted">
                <li>· A shadcn-compatible registry so components install with one CLI command.</li>
                <li>· llms.txt and an agent skill so assistants write correct Paper code.</li>
                <li>· RTL-correct foundations (logical properties everywhere) as an opt-in module.</li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
