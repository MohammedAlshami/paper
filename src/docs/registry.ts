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

export const COMPONENTS: ComponentEntry[] = [
  {
    id: 'run-timeline',
    name: 'RunTimeline',
    category: 'Run control',
    tagline: 'A long-running agent run you can see and steer.',
    description:
      'Renders a run as a timeline of steps with per-step status, a heartbeat, a checkpoint and controls to pause, resume or fork. This is the surface that dies silently in most products today.',
    status: 'ready',
    file: 'components/agent-ops/run-timeline.tsx',
    deps: ['lucide-react', 'internal/button', 'internal/badge', 'internal/rule'],
    usage: `import { RunTimeline } from '@/components/agent-ops/run-timeline';

const run = {
  id: 'run_9f3a',
  title: 'Draft chapter 3 — citation pass',
  status: 'waiting',
  heartbeat: '4s ago',
  checkpoint: 'after step 3',
  steps: [
    { id: 'plan',  label: 'Plan the outline',        status: 'done',    meta: '1.2s · 412 tokens' },
    { id: 'draft', label: 'Draft section',           status: 'running', meta: '2,140 tokens' },
    { id: 'send',  label: 'Await approval: email',   status: 'waiting', meta: 'approval gate' },
  ],
};

<RunTimeline run={run} onPause={pause} onResume={resume} />`,
    examples: [
      { label: 'Waiting on an approval gate', code: `<RunTimeline run={{ ...run, status: 'waiting' }} />` },
      { label: 'A step failed', code: `<RunTimeline run={{ ...run, status: 'failed' }} />` },
    ],
    api: [
      {
        title: 'RunTimeline',
        rows: [
          { prop: 'run', type: 'AgentRun', description: 'The run to render.' },
          { prop: 'onPause', type: '() => void', description: 'Called when the run is paused.' },
          { prop: 'onResume', type: '() => void', description: 'Called when a paused run is resumed.' },
          { prop: 'className', type: 'string', description: 'Extra classes on the wrapper.' },
        ],
      },
      {
        title: 'AgentRun · RunStep',
        rows: [
          { prop: 'id, title, status', type: 'string · RunStatus', description: "'running' | 'succeeded' | 'failed' | 'paused' | 'waiting'." },
          { prop: 'heartbeat, checkpoint', type: 'string', description: 'Shown in the header and footer.' },
          { prop: 'steps', type: 'RunStep[]', description: "Each step: id, label, status ('done' | 'running' | 'waiting' | 'failed' | 'pending'), meta, at." },
        ],
      },
    ],
  },
  {
    id: 'approval-gate',
    name: 'ApprovalGate',
    category: 'Human in the loop',
    tagline: 'Consent before the side effect, not after.',
    description:
      'Pauses a run and shows exactly what is about to happen — the tool, the arguments, the risk and the reason — with approve, reject and edit. Designed to sit before a tool call, not as an "Approve" button at the end.',
    status: 'ready',
    file: 'components/agent-ops/approval-gate.tsx',
    deps: ['lucide-react', 'internal/button', 'internal/badge', 'internal/eyebrow'],
    usage: `import { ApprovalGate } from '@/components/agent-ops/approval-gate';

<ApprovalGate
  request={{
    id: 'ap_4412',
    action: 'Send email to 3 recipients',
    tool: 'mail.send',
    risk: 'medium',
    reason: 'The draft is finished. Sending cannot be undone.',
    expiresIn: 'expires in 9m',
    args: '{\\n  "to": ["sara@example.com"],\\n  "subject": "Chapter 3 — draft"\\n}',
  }}
  onApprove={approve}
  onReject={reject}
/>`,
    examples: [
      { label: 'Medium risk — sending email', code: `<ApprovalGate request={emailRequest} />` },
      { label: 'High risk — destructive tool', code: `<ApprovalGate request={{ ...req, tool: 'db.delete_rows', risk: 'high' }} />` },
    ],
    api: [
      {
        title: 'ApprovalGate',
        rows: [
          { prop: 'request', type: 'ApprovalRequest', description: 'What is being approved.' },
          { prop: 'onApprove', type: '() => void', description: 'Run the tool call.' },
          { prop: 'onReject', type: '() => void', description: 'Cancel the tool call and continue the run.' },
          { prop: 'className', type: 'string', description: 'Extra classes on the wrapper.' },
        ],
      },
      {
        title: 'ApprovalRequest',
        rows: [
          { prop: 'action', type: 'string', description: 'One line describing the side effect.' },
          { prop: 'tool', type: 'string', description: 'Tool name, shown in mono.' },
          { prop: 'args', type: 'string', description: 'Pretty-printed JSON of the arguments.' },
          { prop: 'risk', type: "'low' | 'medium' | 'high'", description: 'Drives the badge.' },
          { prop: 'reason, requestedBy, expiresIn', type: 'string', description: 'Optional context lines.' },
        ],
      },
    ],
  },
  {
    id: 'trace-inspector',
    name: 'TraceInspector',
    category: 'Observability',
    tagline: 'Spans and tool calls, inside your app.',
    description:
      'An embeddable span viewer with OTel-shaped props: duration bars, tokens and cost per span, and expandable input/output. Today this only exists inside monolithic observability platforms.',
    status: 'ready',
    file: 'components/agent-ops/trace-inspector.tsx',
    deps: ['lucide-react', 'internal/badge', 'internal/rule', 'internal/eyebrow'],
    usage: `import { TraceInspector } from '@/components/agent-ops/trace-inspector';

<TraceInspector
  spans={[
    { id: 's1', name: 'agent.run',           kind: 'agent', durationMs: 18420, input: '{ "goal": "draft chapter 3" }' },
    { id: 's2', name: 'llm.complete · plan', kind: 'llm',   durationMs: 1180, tokens: 412,  cost: 0.0012 },
    { id: 's3', name: 'tool.references_search', kind: 'tool', durationMs: 84, cost: 0.0015, input: '{ "q": "marketing" }' },
  ]}
/>`,
    examples: [
      { label: 'Mixed spans with an error', code: `<TraceInspector spans={spans} currency="$" />` },
      { label: 'Retrieval-only trace', code: `<TraceInspector spans={spans.filter((s) => s.kind === 'retrieval')} />` },
    ],
    api: [
      {
        title: 'TraceInspector',
        rows: [
          { prop: 'spans', type: 'Span[]', description: 'Tree is flattened; order is render order.' },
          { prop: 'currency', type: 'string', default: "'$'", description: 'Prefix for the cost figures.' },
          { prop: 'className', type: 'string', description: 'Extra classes on the wrapper.' },
        ],
      },
      {
        title: 'Span',
        rows: [
          { prop: 'name, kind', type: 'string · SpanKind', description: "'agent' | 'llm' | 'tool' | 'retrieval' — sets the dot colour." },
          { prop: 'durationMs', type: 'number', description: 'Drives the relative duration bar.' },
          { prop: 'tokens, cost', type: 'number', description: 'Shown per span and summed in the header.' },
          { prop: 'input, output', type: 'string', description: 'Revealed when the row is expanded.' },
          { prop: 'status', type: "'ok' | 'error'", description: 'Flags failing spans.' },
        ],
      },
    ],
  },
  {
    id: 'cost-meter',
    name: 'CostMeter',
    category: 'Budgets',
    tagline: 'Token and cost budgets as an interface.',
    description:
      'Spent versus budget, a burn rate, an eight-hour projection and a pause control — with a plain-English warning when the run is going to overspend. Solved at the gateway layer today, absent as a React surface.',
    status: 'ready',
    file: 'components/agent-ops/cost-meter.tsx',
    deps: ['lucide-react', 'internal/button', 'internal/badge', 'internal/eyebrow'],
    usage: `import { CostMeter } from '@/components/agent-ops/cost-meter';

<CostMeter spent={18.42} budget={25} burnPerHour={3.1} hoursElapsed={6} onPause={pause} />`,
    examples: [
      { label: 'On track', code: `<CostMeter spent={8.2} budget={25} burnPerHour={1.1} hoursElapsed={3} />` },
      { label: 'Over budget', code: `<CostMeter spent={27.9} budget={25} burnPerHour={4.2} hoursElapsed={7} />` },
    ],
    api: [
      {
        title: 'CostMeter',
        rows: [
          { prop: 'spent, budget', type: 'number', description: 'Amounts, in the same currency.' },
          { prop: 'currency', type: 'string', default: "'$'", description: 'Rendered before every figure.' },
          { prop: 'burnPerHour', type: 'number', description: 'Drives the projection and the warning.' },
          { prop: 'hoursElapsed', type: 'number', default: '1', description: 'Shown as the elapsed figure.' },
          { prop: 'onPause', type: '() => void', description: 'Called by "Pause agent".' },
          { prop: 'label', type: 'string', default: "'Run budget'", description: 'Eyebrow text.' },
        ],
      },
    ],
  },
  {
    id: 'mcp-catalog',
    name: 'MCPCatalog',
    category: 'Tools',
    tagline: 'Connect MCP servers and consent to their tools.',
    description:
      'The Model Context Protocol surface: server list with transport and auth, a connect → authenticate → consent flow, per-tool toggles and honest error states. Only one other library ships a partial answer.',
    status: 'new',
    file: 'components/agent-ops/mcp-catalog.tsx',
    deps: ['lucide-react', 'internal/button', 'internal/badge', 'internal/eyebrow'],
    usage: `import { MCPCatalog } from '@/components/agent-ops/mcp-catalog';

<MCPCatalog
  servers={[
    {
      id: 'openabstracts',
      name: 'OpenAbstracts',
      url: 'https://openabstracts.com/mcp',
      transport: 'http',
      auth: 'apiKey',
      status: 'connected',
      tools: [
        { name: 'references_search', description: 'Search 10M+ papers.' },
        { name: 'citation_verify', description: 'Check a citation exists.', readOnly: true },
      ],
    },
    { id: 'gdrive', name: 'Google Drive', url: 'https://mcp.gdrive.example/v1', auth: 'oauth', status: 'needs-auth' },
  ]}
  onConnect={connect}
/>`,
    examples: [
      { label: 'Connected, needs-auth and error', code: `<MCPCatalog servers={servers} />` },
      { label: 'Nothing connected yet', code: `<MCPCatalog servers={[]} />` },
    ],
    api: [
      {
        title: 'MCPCatalog',
        rows: [
          { prop: 'servers', type: 'McpServer[]', description: 'One row per server.' },
          { prop: 'onConnect', type: '(server) => void', description: 'Start the connect / OAuth flow.' },
          { prop: 'onDisconnect', type: '(server) => void', description: 'Revoke and disconnect.' },
          { prop: 'onAdd', type: '() => void', description: 'Opens your add-server flow.' },
        ],
      },
      {
        title: 'McpServer · McpTool',
        rows: [
          { prop: 'url, transport', type: 'string · McpTransport', description: "'http' | 'sse' | 'stdio'." },
          { prop: 'auth', type: 'McpAuth', description: "'none' | 'oauth' | 'apiKey' — drives the chip and the consent copy." },
          { prop: 'status', type: 'McpStatus', description: "'connected' | 'needs-auth' | 'error' | 'disconnected'." },
          { prop: 'tools[].allowed', type: 'boolean', default: 'true', description: 'Per-tool consent, toggled in the UI.' },
          { prop: 'tools[].readOnly', type: 'boolean', description: 'Renders a locked read-only toggle.' },
        ],
      },
    ],
  },
];

export const getComponent = (id: string) => COMPONENTS.find((c) => c.id === id);

export const PLANNED = [
  { name: 'BrowserUse', note: 'Watch the agent drive a browser — viewport frames, click highlights, action log.' },
  { name: 'MemoryBrowser', note: 'Browse and edit what the agent remembers, with provenance.' },
];
