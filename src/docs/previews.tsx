import * as React from 'react';
import { RunTimeline, type AgentRun } from '@/components/agent-ops/run-timeline';
import { ApprovalGate, type ApprovalRequest } from '@/components/agent-ops/approval-gate';
import { TraceInspector, type Span } from '@/components/agent-ops/trace-inspector';
import { CostMeter } from '@/components/agent-ops/cost-meter';
import { MCPCatalog, type McpServer } from '@/components/agent-ops/mcp-catalog';

/* ---------- mock data ---------- */

const RUN_WAITING: AgentRun = {
  id: 'run_9f3a',
  title: 'Draft chapter 3 — citation pass',
  status: 'waiting',
  heartbeat: '4s ago',
  checkpoint: 'after step 3',
  steps: [
    { id: 'plan', label: 'Plan the chapter outline', status: 'done', meta: '1.2s · 412 tokens', at: '10:02' },
    { id: 'search', label: 'Search the reference index (tool)', status: 'done', meta: '5 results · 84ms', at: '10:02' },
    { id: 'extract', label: 'Extract PDF text', status: 'done', meta: '3 papers · language checked', at: '10:04' },
    { id: 'draft', label: 'Draft section with citations', status: 'running', meta: '2,140 tokens', at: '10:05' },
    { id: 'send', label: 'Await approval: email the co-author', status: 'waiting', meta: 'approval gate', at: '10:06' },
    { id: 'publish', label: 'Publish to the workspace', status: 'pending' },
  ],
};

const RUN_FAILED: AgentRun = {
  id: 'run_71bd',
  title: 'Nightly index refresh',
  status: 'failed',
  heartbeat: '12m ago',
  checkpoint: 'after step 2',
  steps: [
    { id: 'fetch', label: 'Fetch 1,240 journal feeds', status: 'done', meta: '1,240 ok · 0 failed', at: '02:00' },
    { id: 'parse', label: 'Parse and de-duplicate', status: 'done', meta: '1,208 kept', at: '02:11' },
    { id: 'embed', label: 'Embed abstracts (tool)', status: 'failed', meta: 'provider 429 · retryable', at: '02:14' },
    { id: 'index', label: 'Write to OpenSearch', status: 'pending' },
  ],
};

const APPROVAL_EMAIL: ApprovalRequest = {
  id: 'ap_4412',
  action: 'Send email to 3 recipients',
  tool: 'mail.send',
  risk: 'medium',
  requestedBy: 'the agent · step 5',
  expiresIn: 'expires in 9m',
  reason:
    'The draft is finished. Sending cannot be undone, so the run pauses here until a person approves the recipients and the body.',
  args: `{
  "to": ["sara@example.com", "omar@example.com", "editor@journal.org"],
  "subject": "Chapter 3 — draft for review",
  "attach": "chapter-3.docx"
}`,
};

const APPROVAL_DANGER: ApprovalRequest = {
  id: 'ap_9081',
  action: 'Delete 42 rows from the production table',
  tool: 'db.delete_rows',
  risk: 'high',
  requestedBy: 'the agent · step 9',
  reason:
    'The agent believes these rows are stale duplicates. This cannot be undone and there is no export in the plan.',
  args: `{
  "table": "public.submissions",
  "where": "status = 'duplicate' AND created_at < '2026-01-01'",
  "rows_matched": 42,
  "dry_run": false
}`,
};

const SPANS: Span[] = [
  {
    id: 's1',
    name: 'agent.run',
    kind: 'agent',
    durationMs: 18420,
    input: '{ "goal": "draft chapter 3", "run": "run_9f3a" }',
    output: '{ "steps": 5, "status": "waiting", "checkpoint": 3 }',
  },
  {
    id: 's2',
    name: 'llm.complete · plan the outline',
    kind: 'llm',
    durationMs: 1180,
    tokens: 412,
    cost: 0.0012,
    input: '{"messages":3,"model":"gpt-5"}',
    output: '{"plan":["outline","search","extract","draft","send"]}',
  },
  {
    id: 's3',
    name: 'tool.references_search',
    kind: 'tool',
    durationMs: 84,
    cost: 0.0015,
    input: '{ "q": "marketing", "mode": "papers", "limit": 5 }',
    output: '{ "count": 5, "took_ms": 84 }',
  },
  {
    id: 's4',
    name: 'llm.complete · draft section',
    kind: 'llm',
    durationMs: 9240,
    tokens: 2140,
    cost: 0.0078,
    status: 'error',
    input: '{"context":"3 papers","max_tokens":4000}',
    output: '{ "error": "context window exceeded", "retryable": true }',
  },
];

const SERVERS: McpServer[] = [
  {
    id: 'openabstracts',
    name: 'OpenAbstracts',
    url: 'https://openabstracts.com/mcp',
    transport: 'http',
    auth: 'apiKey',
    status: 'connected',
    description: 'Paper search across 10M+ papers and 100,000+ journals.',
    tools: [
      { name: 'references_search', description: 'Keyword or full-text search over titles, abstracts and PDFs.' },
      { name: 'paper_get', description: 'Fetch a paper by DOI with metadata and the PDF link.' },
      { name: 'citation_verify', description: 'Check that a citation exists before it is used.', readOnly: true },
    ],
  },
  {
    id: 'filesystem',
    name: 'Filesystem',
    url: 'npx -y @modelcontextprotocol/server-filesystem ~/docs',
    transport: 'stdio',
    auth: 'none',
    status: 'connected',
    description: 'Read and write files in a scoped directory.',
    tools: [
      { name: 'read_file', description: 'Read a file.', readOnly: true },
      { name: 'write_file', description: 'Write or create a file — the agent asks before overwriting.', allowed: false },
      { name: 'list_directory', description: 'List a directory.', readOnly: true },
    ],
  },
  {
    id: 'gdrive',
    name: 'Google Drive',
    url: 'https://mcp.gdrive.example/v1',
    transport: 'sse',
    auth: 'oauth',
    status: 'needs-auth',
    description: 'Search and read documents from a Drive account.',
    tools: [],
  },
  {
    id: 'browser',
    name: 'Browser (Playwright)',
    url: 'npx -y @playwright/mcp',
    transport: 'stdio',
    auth: 'none',
    status: 'error',
    error: 'Handshake failed: server exited with code 1. Check the command and your Node version.',
    tools: [],
  },
];

/* ---------- previews & examples ---------- */

export const PREVIEWS: Record<string, React.ReactNode> = {
  'run-timeline': <RunTimeline run={RUN_WAITING} />,
  'approval-gate': <ApprovalGate request={APPROVAL_EMAIL} />,
  'trace-inspector': <TraceInspector spans={SPANS} />,
  'cost-meter': <CostMeter spent={18.42} budget={25} burnPerHour={3.1} hoursElapsed={6} />,
  'mcp-catalog': <MCPCatalog servers={SERVERS} />,
};

export const EXAMPLES: Record<string, { label: string; node: React.ReactNode }[]> = {
  'run-timeline': [
    { label: 'Waiting on an approval gate', node: <RunTimeline run={RUN_WAITING} /> },
    { label: 'A step failed — retry or fork', node: <RunTimeline run={RUN_FAILED} /> },
  ],
  'approval-gate': [
    { label: 'Medium risk — sending email', node: <ApprovalGate request={APPROVAL_EMAIL} /> },
    { label: 'High risk — destructive tool', node: <ApprovalGate request={APPROVAL_DANGER} /> },
  ],
  'trace-inspector': [
    { label: 'Mixed spans with an error', node: <TraceInspector spans={SPANS} /> },
    {
      label: 'Tool calls only',
      node: <TraceInspector spans={SPANS.filter((s) => s.kind === 'tool' || s.kind === 'retrieval')} />,
    },
  ],
  'cost-meter': [
    { label: 'On track', node: <CostMeter spent={8.2} budget={25} burnPerHour={1.1} hoursElapsed={3} /> },
    { label: 'Over budget', node: <CostMeter spent={27.9} budget={25} burnPerHour={4.2} hoursElapsed={7} /> },
  ],
  'mcp-catalog': [
    { label: 'Connected · needs auth · error', node: <MCPCatalog servers={SERVERS} /> },
    {
      label: 'Nothing connected yet',
      node: <MCPCatalog servers={[{ id: 'none', name: 'No servers yet', url: '—', status: 'disconnected' }]} />,
    },
  ],
};
