# Paper — the agent-ops layer, as copy-paste components

React components for **running and managing AI workflows**: watching a run, inspecting a step, replaying it, forking it from a step, comparing the branch, listing every run, watching the metrics, and approving a side effect before it happens.

Copy-paste — there is no package to install and no version to chase. You copy the component file into your project and own it.

Monochrome by design: black, white and greys only. Component surfaces are white on a grey canvas, hairlines are always solid, and **state is carried by shape, fill, weight and icon — never by hue**:

| State | Mark | Meaning |
| --- | --- | --- |
| queued | hollow circle | not started |
| running | pulsing ring + animating bar | in flight |
| waiting | half-filled circle + hatched bar | blocked on a human |
| done | filled black circle + check | finished |
| failed | circle with ✕ | gave up |
| retried | `×2` next to the name | ran more than once |
| skipped | faint ring + strikethrough | bypassed |

## Components

| Component | Purpose |
| --- | --- |
| `RunHeader` | Workflow, state, progress, counters and controls (pause · resume · re-run · cancel) |
| `RunTimeline` | The workflow's steps in order, with live state, retries and inline errors |
| `StepDetail` | One step: input/output payloads, duration, tokens, cost, error, retry/skip |
| `EventStream` | The run's live log, filtered by level, with follow-the-tail |
| `ReplayScrubber` | Transport for a finished run: play, step, speed, scrub |
| `ForkPanel` | Branch a run from a step, editing the input on the way in |
| `BranchCompare` | Parent vs fork, step by step, with duration and token deltas |
| `RunsTable` | The run index: status, trigger, progress, duration, cost, re-run/cancel |
| `RunMetrics` | Success rate, p95, cost per run, retry rate, failure reasons |
| `ApprovalStep` | Human-in-the-loop before the side effect, arguments shown first |

Every component speaks the same shared model (`src/components/agent-ops/types.ts`): `Run` → `RunStep[]` → `RunEvent[]`, plus `RunSummary`, `Kpi` and `TrendPoint`. Feed them from your orchestrator; no component owns your data.

## Quick start

1. Copy `src/components/agent-ops/<component>.tsx` into your project.
2. Install what it imports: `lucide-react`, and for tabs `@base-ui/react`.
3. Copy the tokens from `src/styles/app.css` into your global stylesheet, plus the `cn()` helper (`clsx` + `tailwind-merge`).

```tsx
import { RunTimeline } from '@/components/agent-ops/run-timeline';

<RunTimeline run={run} selectedStepId={step.id} onSelectStep={setStep} />;
```

## Tokens

```css
:root {
  --background: #f4f4f5;   /* page canvas (grey) */
  --card: #ffffff;         /* component surfaces */
  --muted: #f4f4f5;        /* wells, inert fills */
  --muted-strong: #e4e4e7;
  --border: #e4e4e7;       /* hairlines, always solid */
  --border-strong: #d4d4d8;
  --foreground: #18181b;
  --primary: #09090b;      /* fills, active state */
  --primary-foreground: #fafafa;
  --muted-foreground: #71717a;
  --faint: #a1a1aa;
  --radius: 6px;
}

[data-theme='dark'] {
  --background: #09090b;
  --card: #18181b;
  --foreground: #fafafa;
  --primary: #fafafa;
}
```

Set `data-theme="dark"` on `<html>` and the whole set inverts.

## Docs

The docs site (`npm run dev`, http://localhost:3100) has a page per component — description, preview/code tabs, installation, usage, examples, API reference — plus an **Operations console** page that assembles all ten the way a real ops screen uses them.

React Grab is wired in dev only (`src/main.tsx`), so you can hover any element on the docs site to see the file it comes from.

## Not included, on purpose

No primitives (button, card, input, badge) — those are commodity. No chat shell, no data grid, no charting library. The planned next surfaces are `BrowserUse` (watch the agent drive a browser), `MemoryBrowser` (browse and edit what the agent remembers) and `WorkflowGraph` (the workflow as a live node graph).

## Develop

```bash
npm install
npm run dev      # http://localhost:3100
npm run build
```

## Licence

MIT. Illustrations from the Notion Resources freebie pack.
