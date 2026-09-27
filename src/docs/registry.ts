export type ApiRow = { prop: string; type: string; default?: string; description: string };

export type ComponentEntry = {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  status: 'ready' | 'new';
  file: string;
  deps: string[];
  usage: string;
  examples: { label: string; code: string }[];
  api: { title: string; rows: ApiRow[] }[];
};

const SHARED: ApiRow[] = [
  { prop: 'Run', type: 'object', description: 'id, workflow, workflowVersion?, status, trigger?, actor?, startedAt?, elapsed?, heartbeat?, checkpoint?, tokens?, cost?, stepsDone?, steps[]' },
  { prop: 'RunStep', type: 'object', description: "id, name, type ('agent' | 'llm' | 'tool' | 'human'), status ('queued' | 'running' | 'done' | 'waiting' | 'failed' | 'skipped'), durationMs?, tokens?, cost?, attempt?, input?, output?, error?, meta?" },
  { prop: 'RunStatus', type: 'union', description: "'queued' | 'running' | 'waiting' | 'paused' | 'succeeded' | 'failed' | 'cancelled'" },
];

export const COMPONENTS: ComponentEntry[] = [
  {
    id: 'run-header',
    name: 'RunHeader',
    category: 'Run control',
    tagline: 'What is this run doing, right now.',
    description:
      'Workflow name and version, run state, progress bar, counters (steps, elapsed, tokens, cost, checkpoint) and the controls: pause, resume, re-run, cancel.',
    status: 'ready',
    file: 'components/agent-ops/run-header.tsx',
    deps: ['lucide-react', 'internal/card', 'internal/badge', 'internal/button', 'internal/status'],
    usage: `<RunHeader run={run} onPause={pause} onResume={resume} onRerun={rerun} onCancel={cancel} />`,
    examples: [
      { label: 'Waiting on a human step', code: `<RunHeader run={{ ...run, status: 'waiting' }} />` },
      { label: 'Failed run', code: `<RunHeader run={{ ...run, status: 'failed' }} />` },
    ],
    api: [
      {
        title: 'RunHeader',
        rows: [
          { prop: 'run', type: 'Run', description: 'The run to display.' },
          { prop: 'onPause / onResume', type: '() => void', description: 'Run controls.' },
          { prop: 'onRerun / onCancel', type: '() => void', description: 'Run controls.' },
        ],
      },
      { title: 'Shared types', rows: SHARED },
    ],
  },
  {
    id: 'run-timeline',
    name: 'RunTimeline',
    category: 'Progress',
    tagline: "The workflow's steps, in order, with live state.",
    description:
      'A step list with monochrome status marks (done, running with pulse, waiting, failed, skipped), durations, retry counts, inline errors, and selection to open a step.',
    status: 'ready',
    file: 'components/agent-ops/run-timeline.tsx',
    deps: ['lucide-react', 'internal/card', 'internal/status'],
    usage: `<RunTimeline run={run} selectedStepId={step.id} onSelectStep={setStep} />`,
    examples: [
      { label: 'In progress, step selected', code: `<RunTimeline run={run} selectedStepId="s4" />` },
      { label: 'Failed and skipped steps', code: `<RunTimeline run={failedRun} />` },
    ],
    api: [
      {
        title: 'RunTimeline',
        rows: [
          { prop: 'run', type: 'Run', description: 'Steps render in array order.' },
          { prop: 'selectedStepId', type: 'string', description: 'Highlights the active row.' },
          { prop: 'onSelectStep', type: '(step: RunStep) => void', description: 'Called when a row is clicked.' },
        ],
      },
    ],
  },
  {
    id: 'step-detail',
    name: 'StepDetail',
    category: 'Inspecting',
    tagline: 'Everything about one step.',
    description:
      'Opens a step: type, attempt, duration, tokens, cost, the input and output payloads in wells, any error, and the actions — retry, skip, edit input, copy payload.',
    status: 'ready',
    file: 'components/agent-ops/step-detail.tsx',
    deps: ['lucide-react', 'internal/card', 'internal/badge', 'internal/button', 'internal/status'],
    usage: `<StepDetail step={step} onRetry={retry} onSkip={skip} />`,
    examples: [
      { label: 'Tool step that was retried', code: `<StepDetail step={retriedStep} />` },
      { label: 'Failed step with an error', code: `<StepDetail step={failedStep} />` },
    ],
    api: [
      {
        title: 'StepDetail',
        rows: [
          { prop: 'step', type: 'RunStep', description: 'When omitted, renders the empty prompt.' },
          { prop: 'onRetry / onSkip', type: '() => void', description: 'Step-level actions.' },
        ],
      },
    ],
  },
  {
    id: 'event-stream',
    name: 'EventStream',
    category: 'Tracking',
    tagline: "The run's live log.",
    description:
      'A monospace event feed with level filters (info, warn, error) and a follow tail. Token spend, retries, approvals and failures all land here in order.',
    status: 'ready',
    file: 'components/agent-ops/event-stream.tsx',
    deps: ['lucide-react', 'internal/card'],
    usage: `<EventStream events={events} />`,
    examples: [{ label: 'Live run', code: `<EventStream events={events} />` }],
    api: [
      {
        title: 'EventStream · RunEvent',
        rows: [
          { prop: 'events', type: 'RunEvent[]', description: 'Rendered in array order, oldest first.' },
          { prop: 'levels / follow', type: 'internal state', description: "Filters are 'info' | 'warn' | 'error'; follow pins the scroller to the newest event." },
          { prop: 'ts, type, message, stepId?', type: 'string', description: 'One event row.' },
        ],
      },
    ],
  },
  {
    id: 'replay-scrubber',
    name: 'ReplayScrubber',
    category: 'Replay',
    tagline: 'Scrub through a finished run.',
    description:
      'A transport for a completed run: play/pause, step forward and back, speed, and a scrubber that walks the timeline. The current step is named, with its mark and timestamp.',
    status: 'new',
    file: 'components/agent-ops/replay-scrubber.tsx',
    deps: ['lucide-react', 'internal/card', 'internal/status'],
    usage: `const [index, setIndex] = React.useState(0);

<ReplayScrubber
  run={run}
  index={index}
  onChange={setIndex}
  playing={playing}
  onTogglePlay={() => setPlaying(!playing)}
  speed={speed}
  onSpeedChange={setSpeed}
/>`,
    examples: [
      { label: 'Mid-run', code: `<ReplayScrubber run={run} index={3} onChange={setIndex} />` },
      { label: 'At the end, 4× speed', code: `<ReplayScrubber run={run} index={5} onChange={setIndex} speed={4} />` },
    ],
    api: [
      {
        title: 'ReplayScrubber',
        rows: [
          { prop: 'run', type: 'Run', description: 'The finished run to replay.' },
          { prop: 'index / onChange', type: 'number · (n) => void', description: 'Controlled step position.' },
          { prop: 'playing / onTogglePlay', type: 'boolean · () => void', description: 'Playback state.' },
          { prop: 'speed / onSpeedChange', type: '1 | 2 | 4', description: 'Playback speed.' },
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
    deps: ['lucide-react', 'internal/card', 'internal/button'],
    usage: `<ForkPanel run={run} step={step} onFork={({ branch, input }) => forkRun(run, step, input, branch)} />`,
    examples: [{ label: 'Fork from a tool step', code: `<ForkPanel run={run} step={step} onFork={fork} />` }],
    api: [
      {
        title: 'ForkPanel',
        rows: [
          { prop: 'run', type: 'Run', description: 'Parent run.' },
          { prop: 'step', type: 'RunStep', description: 'The step to branch from; its input pre-fills the editor.' },
          { prop: 'onFork', type: '({ branch, input }) => void', description: 'Called with the branch name and edited input.' },
        ],
      },
    ],
  },
  {
    id: 'branch-compare',
    name: 'BranchCompare',
    category: 'Branching',
    tagline: 'Parent vs fork, step by step.',
    description:
      'Two columns over the same steps with per-step deltas for duration and tokens, plus the totals — so you can see whether the change actually helped.',
    status: 'new',
    file: 'components/agent-ops/branch-compare.tsx',
    deps: ['internal/card', 'internal/badge', 'internal/status'],
    usage: `<BranchCompare parent={parentRun} branch={branchRun} />`,
    examples: [{ label: 'Parent vs branch', code: `<BranchCompare parent={parentRun} branch={branchRun} />` }],
    api: [
      {
        title: 'BranchCompare',
        rows: [
          { prop: 'parent', type: 'Run', description: 'The original run.' },
          { prop: 'branch', type: 'Run', description: 'The forked run; steps are paired by index.' },
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
    deps: ['lucide-react', 'internal/card', 'internal/status'],
    usage: `<RunsTable runs={runs} onSelect={openRun} onRerun={rerun} onCancel={cancel} />`,
    examples: [{ label: 'All runs', code: `<RunsTable runs={runs} onSelect={openRun} />` }],
    api: [
      {
        title: 'RunsTable · RunSummary',
        rows: [
          { prop: 'runs', type: 'RunSummary[]', description: 'id, workflow, status, trigger?, actor?, startedAt?, durationMs?, cost?, stepsDone?, stepsTotal?' },
          { prop: 'onSelect / onRerun / onCancel', type: '(run) => void', description: 'Row interactions.' },
        ],
      },
    ],
  },
  {
    id: 'run-metrics',
    name: 'RunMetrics',
    category: 'Management',
    tagline: 'Are the workflows healthy.',
    description:
      'KPI tiles (success rate, p95 duration, cost per run, retry rate), a fourteen-day runs chart drawn in greyscale, and the failure reasons as hatched bars with counts.',
    status: 'new',
    file: 'components/agent-ops/run-metrics.tsx',
    deps: ['internal/card'],
    usage: `<RunMetrics workflow="All workflows" window="Last 14 days" kpis={kpis} trend={trend} failures={failures} />`,
    examples: [{ label: 'Fourteen days', code: `<RunMetrics kpis={kpis} trend={trend} failures={failures} />` }],
    api: [
      {
        title: 'RunMetrics',
        rows: [
          { prop: 'kpis', type: 'Kpi[]', description: 'label, value, hint?, delta? — rendered as tiles.' },
          { prop: 'trend', type: 'TrendPoint[]', description: 'label, value, failed? — bars; failed days render in the hatch tone.' },
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
    deps: ['lucide-react', 'internal/card', 'internal/badge', 'internal/button', 'internal/eyebrow'],
    usage: `<ApprovalStep request={request} onApprove={approve} onReject={reject} />`,
    examples: [
      { label: 'Medium risk — sending email', code: `<ApprovalStep request={emailRequest} />` },
      { label: 'High risk — destructive tool', code: `<ApprovalStep request={{ ...req, risk: 'high' }} />` },
    ],
    api: [
      {
        title: 'ApprovalStep · ApprovalRequest',
        rows: [
          { prop: 'action, tool, args', type: 'string', description: 'What will happen, and the exact arguments.' },
          { prop: 'risk', type: "'low' | 'medium' | 'high'", description: 'Shown as a badge and severity text.' },
          { prop: 'reason?, requestedBy?, expiresIn?', type: 'string', description: 'Optional context.' },
          { prop: 'onApprove / onReject', type: '() => void', description: 'Decision handlers.' },
        ],
      },
    ],
  },
];

export const getComponent = (id: string) => COMPONENTS.find((c) => c.id === id);

export const PLANNED = [
  { name: 'BrowserUse', note: 'Watch the agent drive a browser — frames, click highlights, action log.' },
  { name: 'MemoryBrowser', note: 'Browse and edit what the agent remembers, with provenance.' },
  { name: 'WorkflowGraph', note: 'The workflow as a node graph, with live state per node.' },
];
