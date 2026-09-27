# Paper — React components for AI workflow runs

Copy-paste components for the **operations** side of an AI product: running a workflow, watching each step, replaying it, forking it from a step, comparing the branch, listing every run, watching the metrics, and approving a side effect before it happens.

The chat layer is commodity. This is the part that today only exists inside closed observability platforms.

- **Copy-paste, not a package.** There is no version to chase — you copy the file and own it.
- **Built on shadcn/ui.** Every component composes the primitives you already have (`button`, `card`, `badge`, `table`, `tabs`, …), so it inherits your theme.
- **Docs like Base UI's.** The documentation site is a faithful clone of `base-ui.com`'s docs layout — same fonts, tokens, sidebar, quick-nav, code blocks, demo frames and API-reference accordions.

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
| `RunsTable` | The run index: status, trigger, progress, duration, cost, actions |
| `RunMetrics` | Success rate, p95, cost per run, retry rate, failure reasons |
| `ApprovalStep` | Human-in-the-loop before the side effect, arguments shown first |

Every component reads the same model (`src/components/agent-ops/types.ts`): `Run` → `RunStep[]` → `RunEvent[]`, plus `RunSummary`, `Kpi` and `TrendPoint`. Feed them from your orchestrator; no component owns your data.

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
npm run build
```

Add a component the way the docs describe it:

```bash
pnpm dlx shadcn@latest add card button badge separator
```

then copy `src/components/agent-ops/run-timeline.tsx` (and `types.ts`) into your project:

```tsx
import { RunTimeline } from '@/components/agent-ops/run-timeline';

<RunTimeline run={run} selectedStepId={step.id} onSelectStep={setStep} />;
```

## Docs site

`src/docs` is the documentation app, and it is deliberately a copy of Base UI's docs design:

- `src/styles/baseui/*.css` — Base UI's own stylesheets, copied verbatim (layout, markdown, code blocks, demo frames, API tables, syntax theme).
- `src/styles/app.css` — our shadcn/ui tokens, tuned to the same palette.
- `src/docs/md.tsx` — the markdown/code/demo/API-table primitives built with Base UI's class names.
- `src/docs/DocsApp.tsx` — the shell: header, side nav, quick nav, pages.
- `src/docs/registry.ts` + `previews.tsx` — the content for the ten component pages.

React Grab is wired in dev only (`src/main.tsx`).

## Known caveat: fonts

The docs use the same self-hosted fonts as Base UI's site (`public/fonts`: *Die Grotesk* and *Paper Mono*), copied so the design matches. **Die Grotesk is a commercial typeface** — before publishing widely, either license it or swap `--font-sans` in `src/styles/app.css` for a substitute.

## Licence

MIT for the code. Base UI's stylesheets and fonts belong to their authors; the design is copied here as a placeholder scaffold.
