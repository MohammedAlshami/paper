import type { ApiSection } from './md';

export type ComponentEntry = {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  status: 'ready' | 'new';
  /** Path inside src/, used for the source link and the copy instruction. */
  file: string;
  /** shadcn/ui primitives the file imports. */
  primitives: string[];
  /** npm packages the file imports. */
  deps: string[];
  wide?: boolean;
  usage: string;
  anatomy: string;
  examples: { label: string; code: string }[];
  api: ApiSection[];
};

const SHARED_ROWS = [
  {
    prop: 'run',
    type: 'Run',
    description:
      'The run: id, workflow, workflowVersion, status, trigger, actor, startedAt, elapsed, heartbeat, checkpoint, tokens, cost, steps, and optionally parentRunId and forkedFromStep.',
  },
  {
    prop: 'step',
    type: 'RunStep',
    description:
      'One step: id, name, type (agent | llm | tool | human | subworkflow), status (queued | running | done | waiting | failed | skipped), durationMs, tokens, cost, attempt, input, output, error, meta.',
  },
];

export const COMPONENTS: ComponentEntry[] = [
  {
    id: 'run-header',
    name: 'RunHeader',
    category: 'Run control',
    tagline: 'What this run is doing, right now, and the controls over it.',
    description:
      'Workflow name and version, run state, a progress bar, the counters that matter (steps, elapsed, tokens, cost, checkpoint) and the controls: pause, resume, re-run, cancel.',
    status: 'ready',
    file: 'components/agent-ops/run-header.tsx',
    primitives: ['card', 'button', 'badge', 'separator'],
    deps: ['lucide-react'],
    usage: `<RunHeader
  run={run}
  onPause={() => pause(run.id)}
  onResume={() => resume(run.id)}
  onRerun={() => rerun(run.id)}
  onCancel={() => cancel(run.id)}
/>`,
    anatomy: `import { RunHeader } from '@/components/agent-ops/run-header';

// one card: identity, state, progress, counters, controls
<RunHeader run={run} />`,
    examples: [
      { label: 'Waiting on a human step', code: `<RunHeader run={{ ...run, status: 'waiting' }} />` },
      { label: 'Failed run', code: `<RunHeader run={{ ...run, status: 'failed' }} />` },
    ],
    api: [
      {
        title: 'RunHeader',
        description: 'The header for a single run. Renders a card with the run identity and its controls.',
        rows: [
          { prop: 'run', type: 'Run', description: 'The run to display.' },
          { prop: 'onPause', type: '() => void', description: 'Called when Pause is pressed.' },
          { prop: 'onResume', type: '() => void', description: 'Called when Resume is pressed (run is paused or waiting).' },
          { prop: 'onRerun', type: '() => void', description: 'Called when Re-run is pressed.' },
          { prop: 'onCancel', type: '() => void', description: 'Called when Cancel is pressed.' },
          { prop: 'className', type: 'string', description: 'Merged onto the card.' },
        ],
      },
      { title: 'Shared types', description: 'The model this component reads.', rows: SHARED_ROWS },
    ],
  },
  {
    id: 'run-timeline',
    name: 'RunTimeline',
    category: 'Progress',
    tagline: "The workflow's steps, in order, with live state.",
    description:
      'A step list with monochrome status marks (done, running with a pulse, waiting, failed, skipped), durations, retry counts, inline errors, and selection to open a step.',
    status: 'ready',
    file: 'components/agent-ops/run-timeline.tsx',
    primitives: ['card', 'badge'],
    deps: ['lucide-react'],
    usage: `<RunTimeline
  run={run}
  selectedStepId={step.id}
  onSelectStep={setStep}
/>`,
    anatomy: `import { RunTimeline } from '@/components/agent-ops/run-timeline';

// rows render in run.steps order; selection is controlled by you
<RunTimeline run={run} selectedStepId={step.id} onSelectStep={setStep} />`,
    examples: [
      { label: 'In progress with a step selected', code: `<RunTimeline run={run} selectedStepId="s4" />` },
      { label: 'Failed and skipped steps', code: `<RunTimeline run={failedRun} />` },
    ],
    api: [
      {
        title: 'RunTimeline',
        description: 'The step list for a run.',
        rows: [
          { prop: 'run', type: 'Run', description: 'Steps render in array order.' },
          { prop: 'selectedStepId', type: 'string', description: 'Highlights the matching row.' },
          { prop: 'onSelectStep', type: '(step: RunStep) => void', description: 'Called when a row is clicked.' },
          { prop: 'className', type: 'string', description: 'Merged onto the card.' },
        ],
      },
    ],
  },
  {
    id: 'step-detail',
    name: 'StepDetail',
    category: 'Inspecting',
    tagline: 'Everything about one step: payloads, cost, retries, errors.',
    description:
      'Opens a step: type, attempt, duration, tokens, cost, the input and output payloads as tabs, any error, and the actions — retry, skip, edit input, copy payload.',
    status: 'ready',
    file: 'components/agent-ops/step-detail.tsx',
    primitives: ['card', 'button', 'badge', 'separator', 'tabs'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<StepDetail step={step} onRetry={() => retry(step.id)} onSkip={() => skip(step.id)} />`,
    anatomy: `import { StepDetail } from '@/components/agent-ops/step-detail';

// step is optional: with no step it renders the empty prompt
<StepDetail step={selectedStep} onRetry={retry} />`,
    examples: [
      { label: 'Tool step that was retried', code: `<StepDetail step={retriedStep} />` },
      { label: 'Failed step with an error', code: `<StepDetail step={failedStep} />` },
    ],
    api: [
      {
        title: 'StepDetail',
        description: 'The inspector for a single step.',
        rows: [
          { prop: 'step', type: 'RunStep', description: 'When omitted, renders the empty prompt.' },
          { prop: 'onRetry', type: '() => void', description: 'Called when Retry is pressed.' },
          { prop: 'onSkip', type: '() => void', description: 'Called when Skip is pressed.' },
          { prop: 'className', type: 'string', description: 'Merged onto the card.' },
        ],
      },
    ],
  },
  {
    id: 'event-stream',
    name: 'EventStream',
    category: 'Tracking',
    tagline: "The run's live log — the honest record.",
    description:
      'A monospace event feed with level filters (info, warn, error) and a follow-the-tail toggle. Token spend, retries, approvals and failures all land here in order.',
    status: 'ready',
    file: 'components/agent-ops/event-stream.tsx',
    primitives: ['card', 'badge'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<EventStream events={run.events} />`,
    anatomy: `import { EventStream } from '@/components/agent-ops/event-stream';

// oldest first; the component keeps itself pinned to the newest event
<EventStream events={events} />`,
    examples: [{ label: 'Live run', code: `<EventStream events={events} />` }],
    api: [
      {
        title: 'EventStream · RunEvent',
        description: 'The event log for a run.',
        rows: [
          { prop: 'events', type: 'RunEvent[]', description: 'Rendered in array order, oldest first.' },
          { prop: 'ts', type: 'string', description: 'Timestamp, e.g. 10:02:01.' },
          { prop: 'level', type: "'info' | 'warn' | 'error'", description: 'Drives the glyph and the filter.' },
          { prop: 'type', type: 'string', description: 'Event type, e.g. step.start or tool.retry.' },
          { prop: 'message', type: 'string', description: 'The human-readable line.' },
          { prop: 'stepId', type: 'string', description: 'Optional step this event belongs to.' },
        ],
      },
    ],
  },
  {
    id: 'replay-scrubber',
    name: 'ReplayScrubber',
    category: 'Replay',
    tagline: 'Scrub through a finished run, step by step.',
    description:
      'A transport for a completed run: play and pause, step forward and back, speed, and a scrubber that walks the timeline. The current step is named, with its mark and timestamp.',
    status: 'new',
    file: 'components/agent-ops/replay-scrubber.tsx',
    primitives: ['card', 'button', 'badge'],
    deps: ['lucide-react'],
    wide: true,
    usage: `const [index, setIndex] = React.useState(0);
const [playing, setPlaying] = React.useState(false);

<ReplayScrubber
  run={run}
  index={index}
  onChange={setIndex}
  playing={playing}
  onTogglePlay={() => setPlaying((value) => !value)}
  speed={1}
  onSpeedChange={setSpeed}
/>`,
    anatomy: `import { ReplayScrubber } from '@/components/agent-ops/replay-scrubber';

// fully controlled: you own index and playback, it owns nothing
<ReplayScrubber run={run} index={index} onChange={setIndex} playing={playing} onTogglePlay={toggle} />`,
    examples: [
      { label: 'Mid-run', code: `<ReplayScrubber run={run} index={3} onChange={setIndex} />` },
      { label: 'At the end, 4× speed', code: `<ReplayScrubber run={run} index={5} onChange={setIndex} speed={4} />` },
    ],
    api: [
      {
        title: 'ReplayScrubber',
        description: 'Step-level playback for a run.',
        rows: [
          { prop: 'run', type: 'Run', description: 'The run to replay.' },
          { prop: 'index', type: 'number', description: 'Controlled step position.' },
          { prop: 'onChange', type: '(index: number) => void', description: 'Called with the new position.' },
          { prop: 'playing', type: 'boolean', description: 'Whether playback is running.' },
          { prop: 'onTogglePlay', type: '() => void', description: 'Called by the play/pause button.' },
          { prop: 'speed', type: '1 | 2 | 4', description: 'Playback speed. Defaults to 1.' },
          { prop: 'onSpeedChange', type: '(speed: number) => void', description: 'Called when a speed is chosen.' },
        ],
      },
    ],
  },
  {
    id: 'fork-panel',
    name: 'ForkPanel',
    category: 'Branching',
    tagline: 'Branch a run from any step.',
    description:
      'Reuses everything before the chosen step, lets you edit that step’s input, names the branch, and shows the lineage. The original run is never touched.',
    status: 'new',
    file: 'components/agent-ops/fork-panel.tsx',
    primitives: ['card', 'button', 'input', 'label', 'textarea', 'separator'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<ForkPanel
  run={run}
  step={step}
  onFork={({ branch, input }) => forkRun({ run, step, input, branch })}
/>`,
    anatomy: `import { ForkPanel } from '@/components/agent-ops/fork-panel';

// the step's input pre-fills the editor
<ForkPanel run={run} step={step} onFork={fork} />`,
    examples: [{ label: 'Fork from a tool step', code: `<ForkPanel run={run} step={step} onFork={fork} />` }],
    api: [
      {
        title: 'ForkPanel',
        description: 'Create a branch of a run from one of its steps.',
        rows: [
          { prop: 'run', type: 'Run', description: 'The parent run.' },
          { prop: 'step', type: 'RunStep', description: 'The step to branch from; its input pre-fills the editor.' },
          { prop: 'onFork', type: '({ branch, input }) => void', description: 'Called with the branch name and the edited input.' },
        ],
      },
    ],
  },
  {
    id: 'branch-compare',
    name: 'BranchCompare',
    category: 'Branching',
    tagline: 'Parent vs fork, step by step. Did the change help?',
    description:
      'Two columns over the same steps with per-step deltas for duration and tokens, plus the totals — enough to decide whether a branch is worth keeping.',
    status: 'new',
    file: 'components/agent-ops/branch-compare.tsx',
    primitives: ['card', 'badge', 'table'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<BranchCompare parent={parentRun} branch={branchRun} />`,
    anatomy: `import { BranchCompare } from '@/components/agent-ops/branch-compare';

// steps are paired by index; missing steps render as —
<BranchCompare parent={parentRun} branch={branchRun} />`,
    examples: [{ label: 'Parent vs branch', code: `<BranchCompare parent={parentRun} branch={branchRun} />` }],
    api: [
      {
        title: 'BranchCompare',
        description: 'A step-by-step diff of two runs.',
        rows: [
          { prop: 'parent', type: 'Run', description: 'The original run.' },
          { prop: 'branch', type: 'Run', description: 'The forked run; steps are paired by index.' },
          { prop: 'className', type: 'string', description: 'Merged onto the card.' },
        ],
      },
    ],
  },
  {
    id: 'runs-table',
    name: 'RunsTable',
    category: 'Management',
    tagline: 'The index of every run.',
    description:
      'Status, workflow, run id, trigger, step progress, duration, cost and start time — filterable by status, with per-row re-run and cancel.',
    status: 'ready',
    file: 'components/agent-ops/runs-table.tsx',
    primitives: ['card', 'button', 'badge', 'table'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<RunsTable
  runs={runs}
  onSelect={(run) => open(run.id)}
  onRerun={(run) => rerun(run.id)}
  onCancel={(run) => cancel(run.id)}
/>`,
    anatomy: `import { RunsTable } from '@/components/agent-ops/runs-table';

// RunSummary rows: id, workflow, status, trigger, startedAt, durationMs, cost, stepsDone, stepsTotal
<RunsTable runs={summaries} onSelect={open} />`,
    examples: [{ label: 'All runs', code: `<RunsTable runs={runs} onSelect={open} />` }],
    api: [
      {
        title: 'RunsTable · RunSummary',
        description: 'The run index.',
        rows: [
          {
            prop: 'runs',
            type: 'RunSummary[]',
            description: 'id, workflow, status, trigger?, actor?, startedAt?, durationMs?, cost?, stepsDone?, stepsTotal?',
          },
          { prop: 'onSelect', type: '(run: RunSummary) => void', description: 'Called when a row is clicked.' },
          { prop: 'onRerun', type: '(run: RunSummary) => void', description: 'Called from the row action.' },
          { prop: 'onCancel', type: '(run: RunSummary) => void', description: 'Called from the row action.' },
        ],
      },
    ],
  },
  {
    id: 'run-metrics',
    name: 'RunMetrics',
    category: 'Management',
    tagline: 'Are the workflows healthy, and what fails.',
    description:
      'KPI tiles (success rate, p95 duration, cost per run, retry rate), a fourteen-day runs chart, and the failure reasons as bars with counts.',
    status: 'new',
    file: 'components/agent-ops/run-metrics.tsx',
    primitives: ['card'],
    deps: [],
    wide: true,
    usage: `<RunMetrics
  workflow="All workflows"
  window="Last 14 days"
  kpis={kpis}
  trend={trend}
  failures={failures}
/>`,
    anatomy: `import { RunMetrics } from '@/components/agent-ops/run-metrics';

// Kpi: { label, value, hint?, delta? } · TrendPoint: { label, value, failed? }
<RunMetrics kpis={kpis} trend={trend} failures={failures} />`,
    examples: [{ label: 'Fourteen days', code: `<RunMetrics kpis={kpis} trend={trend} failures={failures} />` }],
    api: [
      {
        title: 'RunMetrics',
        description: 'The portfolio view over many runs.',
        rows: [
          { prop: 'workflow', type: 'string', description: 'Card title. Defaults to All workflows.' },
          { prop: 'window', type: 'string', description: 'Right-aligned window label. Defaults to Last 14 days.' },
          { prop: 'kpis', type: 'Kpi[]', description: 'label, value, hint?, delta? — rendered as tiles.' },
          { prop: 'trend', type: 'TrendPoint[]', description: 'label, value, failed? — bars; failed days render hatched.' },
          { prop: 'failures', type: '{ reason, count }[]', description: 'Hatched bars, longest first.' },
        ],
      },
    ],
  },
  {
    id: 'approval-step',
    name: 'ApprovalStep',
    category: 'Human in the loop',
    tagline: 'Consent before the side effect.',
    description:
      'A human step inside the workflow: the action, the tool, the arguments shown in full, the risk and the reason — approve, reject or edit before anything runs.',
    status: 'ready',
    file: 'components/agent-ops/approval-step.tsx',
    primitives: ['card', 'button', 'badge', 'separator'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<ApprovalStep request={request} onApprove={approve} onReject={reject} />`,
    anatomy: `import { ApprovalStep } from '@/components/agent-ops/approval-step';

// ApprovalRequest: action, tool, args, risk, reason?, requestedBy?, expiresIn?
<ApprovalStep request={request} onApprove={approve} />`,
    examples: [
      { label: 'Medium risk — sending email', code: `<ApprovalStep request={emailRequest} onApprove={approve} />` },
      { label: 'High risk — destructive tool', code: `<ApprovalStep request={{ ...request, risk: 'high' }} />` },
    ],
    api: [
      {
        title: 'ApprovalStep · ApprovalRequest',
        description: 'A pre-execution approval gate.',
        rows: [
          { prop: 'action', type: 'string', description: 'What will happen, in one line.' },
          { prop: 'tool', type: 'string', description: 'The tool that will run, e.g. mail.send.' },
          { prop: 'args', type: 'string', description: 'The exact arguments, shown in full.' },
          { prop: 'risk', type: "'low' | 'medium' | 'high'", description: 'Drives the risk badge and severity line.' },
          { prop: 'reason', type: 'string', description: 'Optional explanation of why approval is needed.' },
          { prop: 'requestedBy', type: 'string', description: 'Who (or what) is asking.' },
          { prop: 'expiresIn', type: 'string', description: 'Optional expiry label, e.g. expires in 9m.' },
          { prop: 'onApprove', type: '() => void', description: 'Called when the request is approved.' },
          { prop: 'onReject', type: '() => void', description: 'Called when the request is rejected.' },
        ],
      },
    ],
  },
];

export const getComponent = (id: string) => COMPONENTS.find((entry) => entry.id === id);
