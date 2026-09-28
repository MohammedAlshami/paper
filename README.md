# Paper — React components for AI workflow runs

Thirty copy-paste components for the **operations** side of an AI product: running a workflow, watching each step, replaying it, forking it, comparing the branch, grading the output, watching the cost, and approving a side effect before it happens.

The chat layer is commodity. This is the part that today only exists inside closed observability platforms.

- **Copy-paste, not a package.** No version to chase — copy the file and own it.
- **Built on shadcn/ui.** Every component composes primitives you already have (`button`, `card`, `badge`, `table`, `tabs`, `progress`, …), so it inherits your theme.
- **Docs like Base UI's.** The documentation site is a faithful clone of `base-ui.com`'s docs: same fonts, tokens, sidebar, quick-nav, code blocks, demo frames and API-reference accordions.

Live docs: **https://paper.mshami2021.workers.dev**

Every component also has a plain markdown doc under [`docs/components/`](docs/components) — installation, usage,
the full source, and the API reference in one file, for reading on GitHub or feeding to an LLM without the docs site.

## Components

**Run control & progress** — `RunHeader`, `RunTimeline`, `ReplayScrubber`, `RunQueue`
**Inspecting** — `StepDetail`, `SpanWaterfall`, `EventStream`, `LogViewer`, `ErrorPanel`, `RunDiff`, `AnomalyFeed`
**Authoring** — `WorkflowGraph`, `StepSchemaForm`, `PromptEditor`, `PromptDiff`
**Branching** — `ForkPanel`, `BranchCompare`
**Evaluation** — `EvalRunTable`, `ScorePanel`, `DatasetTable`, `Playground`
**Cost & limits** — `RunMetrics`, `CostBreakdown`, `BudgetGauge`, `RateLimitMeter`
**Human in the loop** — `ApprovalStep`, `ApprovalQueue`
**Operations** — `RunsTable`, `ScheduleList`, `WebhookList`

| Component | What it is for |
| --- | --- |
| `RunHeader` | Workflow, state, progress, counters and controls (pause · resume · re-run · cancel) |
| `RunTimeline` | The workflow's steps in order, with live state, retries and inline errors |
| `ReplayScrubber` | Transport for a finished run: play, step, speed, scrub |
| `RunQueue` | What is waiting to run, in what order, and what it is blocked on |
| `StepDetail` | One step: input/output payloads, duration, tokens, cost, error, retry/skip |
| `SpanWaterfall` | The trace drawn to scale, so a slow tool or a long human wait is visible |
| `EventStream` | The run's live log, filtered by level, with follow-the-tail |
| `LogViewer` | The raw logs: search, level filters, wrap, follow |
| `ErrorPanel` | What broke, whether it is retryable, and the request that caused it |
| `RunDiff` | A line diff between two runs, prompts or payloads |
| `AnomalyFeed` | Cost spikes, latency regressions, loops and drift, with acknowledgement |
| `WorkflowGraph` | The workflow as a node graph, with live state on every node |
| `StepSchemaForm` | A form generated from a step's declared inputs, with the payload in view |
| `PromptEditor` | Prompt bodies, detected `{{variables}}`, token estimate, save a version |
| `PromptDiff` | Prompt versions compared, with publish or discard |
| `ForkPanel` | Branch a run from a step, editing the input on the way in |
| `BranchCompare` | Parent vs fork, step by step, with duration and token deltas |
| `EvalRunTable` | Every test case, its score, and the ones that regressed |
| `ScorePanel` | Weighted rubric scores, grader comments, and a human override |
| `DatasetTable` | The test data behind the evals, versioned |
| `Playground` | One input, several variants, side by side, until one wins |
| `RunMetrics` | Success rate, p95, cost per run, retry rate, failure reasons |
| `CostBreakdown` | Where the money went, by day and by model or step |
| `BudgetGauge` | Spend against the budget, with the forecast you did not want |
| `RateLimitMeter` | Per-model quota usage with reset countdowns |
| `ApprovalStep` | Human-in-the-loop before the side effect, arguments shown first |
| `ApprovalQueue` | Every run blocked on a person, with bulk approve and reject |
| `RunsTable` | The run index: status, trigger, progress, duration, cost, actions |
| `ScheduleList` | The cron jobs behind the workflows, with last night's outcome |
| `WebhookList` | The way work arrives, and whether your endpoint is answering |

Every component reads the same model (`src/components/agent-ops/types.ts`): `Run` → `RunStep[]` → `RunEvent[]`, plus `RunSummary`, `Kpi` and `TrendPoint`. Component-specific shapes (`Span`, `LogLine`, `EvalCase`, `RateLimit`, …) live next to the component that renders them. Nothing owns your data.

## State without colour

Six run states, no hues spent. State is carried by shape, fill, weight and icon:

| State | Mark |
| --- | --- |
| queued | hollow circle |
| running | spinning arc in the ring |
| waiting | half-filled circle and a half-filled bar (blocked on a human) |
| done | filled circle with a check |
| failed | circle with an ✕, error inline |
| skipped | faint outline and a strikethrough |

## Quick start

```bash
npm install
npm run dev      # http://localhost:3100
npm run deploy   # build and ship the docs to Cloudflare Workers
```

Add the primitives a component uses (the exact list is in its Installation section):

```bash
pnpm dlx shadcn@latest add card button badge separator
```

then copy the file:

```bash
cp src/components/agent-ops/{run-timeline,types}.tsx ./src/components/agent-ops/
```

```tsx
import { RunTimeline } from '@/components/agent-ops/run-timeline';

<RunTimeline run={run} selectedStepId={step.id} onSelectStep={setStep} />;
```

## Docs site

`src/docs` is the documentation app, and it is deliberately a copy of Base UI's docs design:

- `src/styles/baseui/*.css` — Base UI's own stylesheets, copied verbatim (layout, markdown, code blocks, demo frames, API tables, syntax theme).
- `src/styles/app.css` — our shadcn/ui tokens, tuned to the same palette.
- `src/docs/md.tsx` — the markdown, code, demo and API-table primitives, built with Base UI's class names.
- `src/docs/DocsApp.tsx` — the shell: header, side nav, quick nav, pages, ⌘K search.
- `src/docs/registry.ts` + `registry-ops.ts` + `previews.tsx` — the content for all thirty component pages.

React Grab is wired in dev only (`src/main.tsx`). Select any element in the docs and you get the file it came from.

## Deploy

The docs are a static build deployed as a Cloudflare Worker with static assets:

```bash
npm run deploy
```

## Known caveat: fonts

The docs use the same self-hosted fonts as Base UI's site (`public/fonts`: *Die Grotesk* and *Paper Mono*), copied so the design matches. **Die Grotesk is a commercial typeface** — before publishing widely, either license it or swap `--font-sans` in `src/styles/app.css` for a substitute.

## Licence

MIT for the code. Base UI's stylesheets and fonts belong to their authors; the design is copied here as a placeholder scaffold.
