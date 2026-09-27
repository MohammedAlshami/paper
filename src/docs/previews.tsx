import * as React from 'react';
import { RunHeader } from '@/components/agent-ops/run-header';
import { RunTimeline } from '@/components/agent-ops/run-timeline';
import { StepDetail } from '@/components/agent-ops/step-detail';
import { EventStream } from '@/components/agent-ops/event-stream';
import { ReplayScrubber } from '@/components/agent-ops/replay-scrubber';
import { ForkPanel } from '@/components/agent-ops/fork-panel';
import { BranchCompare } from '@/components/agent-ops/branch-compare';
import { RunsTable } from '@/components/agent-ops/runs-table';
import { RunMetrics } from '@/components/agent-ops/run-metrics';
import { ApprovalStep, type ApprovalRequest } from '@/components/agent-ops/approval-step';
import type { Run, RunEvent, RunSummary } from '@/components/agent-ops/types';

/* ---------- mock workflow data ---------- */

export const RUN_ACTIVE: Run = {
  id: 'run_9f3a2b',
  workflow: 'Literature review brief',
  workflowVersion: '4',
  status: 'waiting',
  trigger: 'manual',
  actor: 'mshami',
  startedAt: '10:02',
  elapsed: '4m 12s',
  heartbeat: '4s ago',
  checkpoint: 'after step 3',
  tokens: 12840,
  cost: 0.42,
  stepsDone: 3,
  steps: [
    {
      id: 's1',
      name: 'Plan the brief',
      type: 'llm',
      status: 'done',
      startedAt: '10:02',
      durationMs: 1180,
      tokens: 412,
      cost: 0.0012,
      input: '{ "topic": "marketing analytics", "sections": 5 }',
      output: '{ "plan": ["search", "extract", "draft", "approve", "publish"] }',
      meta: '1.2s · 412 tokens',
    },
    {
      id: 's2',
      name: 'Search the reference index',
      type: 'tool',
      status: 'done',
      startedAt: '10:02',
      durationMs: 84,
      cost: 0.0015,
      input: '{ "q": "marketing analytics", "mode": "papers", "limit": 5 }',
      output: '{ "count": 5, "took_ms": 84 }',
      meta: '5 results · 84ms',
    },
    {
      id: 's3',
      name: 'Extract PDF text',
      type: 'tool',
      status: 'done',
      startedAt: '10:04',
      durationMs: 4100,
      attempt: 2,
      input: '{ "papers": 5, "languages": ["en"] }',
      output: '{ "extracted": 5, "skipped": 0 }',
      meta: '5 papers · language checked · retried once',
    },
    {
      id: 's4',
      name: 'Draft section with citations',
      type: 'llm',
      status: 'running',
      startedAt: '10:05',
      tokens: 2140,
      cost: 0.0078,
      input: '{ "context": "5 papers", "max_tokens": 4000 }',
      meta: '2,140 tokens so far',
    },
    {
      id: 's5',
      name: 'Approve sending the draft',
      type: 'human',
      status: 'waiting',
      startedAt: '10:06',
      meta: 'waiting on you',
    },
    { id: 's6', name: 'Publish to the workspace', type: 'tool', status: 'queued' },
  ],
};

export const RUN_FAILED: Run = {
  id: 'run_71bd04',
  workflow: 'Nightly index refresh',
  workflowVersion: '12',
  status: 'failed',
  trigger: 'schedule',
  actor: 'cron',
  startedAt: '02:00',
  elapsed: '14m 03s',
  heartbeat: '12m ago',
  checkpoint: 'after step 2',
  tokens: 48210,
  cost: 1.18,
  stepsDone: 2,
  steps: [
    { id: 'f1', name: 'Fetch journal feeds', type: 'tool', status: 'done', startedAt: '02:00', durationMs: 186000, meta: '1,240 feeds · 0 failed' },
    { id: 'f2', name: 'Parse and de-duplicate', type: 'llm', status: 'done', startedAt: '02:03', durationMs: 421000, tokens: 38210, cost: 0.68, meta: '1,208 kept' },
    {
      id: 'f3',
      name: 'Embed abstracts',
      type: 'tool',
      status: 'failed',
      startedAt: '02:11',
      durationMs: 84000,
      attempt: 3,
      error: 'provider 429 — rate limited after 3 attempts',
      meta: 'retried twice · giving up',
    },
    { id: 'f4', name: 'Write to OpenSearch', type: 'tool', status: 'skipped', meta: 'skipped after failure' },
  ],
};

export const RUN_PARENT: Run = {
  id: 'run_9f3a2b',
  workflow: 'Literature review brief',
  status: 'succeeded',
  elapsed: '4m 12s',
  cost: 0.42,
  tokens: 12840,
  steps: [
    { id: 'p1', name: 'Plan the brief', type: 'llm', status: 'done', durationMs: 1180, tokens: 412 },
    { id: 'p2', name: 'Search the reference index', type: 'tool', status: 'done', durationMs: 84 },
    { id: 'p3', name: 'Extract PDF text', type: 'tool', status: 'done', durationMs: 4100 },
    { id: 'p4', name: 'Draft section with citations', type: 'llm', status: 'done', durationMs: 18400, tokens: 4210 },
    { id: 'p5', name: 'Approve sending the draft', type: 'human', status: 'done', durationMs: 21000 },
    { id: 'p6', name: 'Publish to the workspace', type: 'tool', status: 'done', durationMs: 620 },
  ],
};

export const RUN_BRANCH: Run = {
  id: 'run_9f3a2b-fork',
  workflow: 'Literature review brief',
  status: 'running',
  elapsed: '2m 40s',
  cost: 0.29,
  tokens: 8120,
  parentRunId: 'run_9f3a2b',
  forkedFromStep: 's3',
  steps: [
    { id: 'b1', name: 'Plan the brief', type: 'llm', status: 'done', durationMs: 1180, tokens: 412 },
    { id: 'b2', name: 'Search the reference index', type: 'tool', status: 'done', durationMs: 76 },
    { id: 'b3', name: 'Extract PDF text', type: 'tool', status: 'done', durationMs: 2600 },
    { id: 'b4', name: 'Draft section with citations', type: 'llm', status: 'running', tokens: 3280 },
    { id: 'b5', name: 'Approve sending the draft', type: 'human', status: 'queued' },
    { id: 'b6', name: 'Publish to the workspace', type: 'tool', status: 'queued' },
  ],
};

export const EVENTS: RunEvent[] = [
  { id: 'e1', ts: '10:02:01', level: 'info', type: 'run.start', message: 'run_9f3a2b started (manual, mshami)' },
  { id: 'e2', ts: '10:02:02', level: 'info', type: 'step.start', message: 'Plan the brief', stepId: 's1' },
  { id: 'e3', ts: '10:02:03', level: 'info', type: 'llm.call', message: 'gpt-5 · 412 tokens · 1.2s', stepId: 's1' },
  { id: 'e4', ts: '10:02:04', level: 'info', type: 'step.done', message: 'Plan the brief → 5 steps planned', stepId: 's1' },
  { id: 'e5', ts: '10:02:05', level: 'info', type: 'tool.call', message: 'references_search · 5 results · 84ms', stepId: 's2' },
  { id: 'e6', ts: '10:04:11', level: 'warn', type: 'tool.retry', message: 'pdf extract timed out — retrying (attempt 2)', stepId: 's3' },
  { id: 'e7', ts: '10:04:20', level: 'info', type: 'step.done', message: 'Extract PDF text → 5 papers', stepId: 's3' },
  { id: 'e8', ts: '10:04:21', level: 'info', type: 'checkpoint', message: 'checkpoint written after step 3' },
  { id: 'e9', ts: '10:05:02', level: 'info', type: 'step.start', message: 'Draft section with citations', stepId: 's4' },
  { id: 'e10', ts: '10:05:30', level: 'info', type: 'token.spend', message: '1,340 tokens · $0.0041', stepId: 's4' },
  { id: 'e11', ts: '10:05:58', level: 'info', type: 'token.spend', message: '800 tokens · $0.0037', stepId: 's4' },
  { id: 'e12', ts: '10:06:00', level: 'info', type: 'approval.requested', message: 'email co-author · waiting on you', stepId: 's5' },
  { id: 'e13', ts: '10:06:02', level: 'warn', type: 'heartbeat', message: 'run paused — heartbeat every 30s' },
];

export const RUNS: RunSummary[] = [
  { id: 'run_9f3a2b', workflow: 'Literature review brief', status: 'waiting', trigger: 'manual', actor: 'mshami', startedAt: '10:02', durationMs: 252000, cost: 0.42, stepsDone: 3, stepsTotal: 6 },
  { id: 'run_71bd04', workflow: 'Nightly index refresh', status: 'failed', trigger: 'schedule', actor: 'cron', startedAt: '02:00', durationMs: 843000, cost: 1.18, stepsDone: 2, stepsTotal: 4 },
  { id: 'run_6c1aa9', workflow: 'Literature review brief', status: 'succeeded', trigger: 'manual', actor: 'mshami', startedAt: '09:14', durationMs: 238000, cost: 0.38, stepsDone: 6, stepsTotal: 6 },
  { id: 'run_5b0e77', workflow: 'Support triage', status: 'running', trigger: 'webhook', actor: 'zendesk', startedAt: '10:41', cost: 0.07, stepsDone: 2, stepsTotal: 5 },
  { id: 'run_4d92c3', workflow: 'Support triage', status: 'succeeded', trigger: 'webhook', actor: 'zendesk', startedAt: '09:58', durationMs: 41000, cost: 0.05, stepsDone: 5, stepsTotal: 5 },
  { id: 'run_3a77f1', workflow: 'Invoice extraction', status: 'succeeded', trigger: 'api', actor: 'billing', startedAt: '08:30', durationMs: 12600, cost: 0.02, stepsDone: 3, stepsTotal: 3 },
  { id: 'run_2f88b4', workflow: 'Nightly index refresh', status: 'succeeded', trigger: 'schedule', actor: 'cron', startedAt: '02:00', durationMs: 902000, cost: 1.24, stepsDone: 4, stepsTotal: 4 },
  { id: 'run_1e55c9', workflow: 'Literature review brief', status: 'cancelled', trigger: 'manual', actor: 'mshami', startedAt: '07:12', durationMs: 22000, cost: 0.01, stepsDone: 1, stepsTotal: 6 },
];

export const KPIS = [
  { label: 'Success rate', value: '94%', delta: '+3pts', hint: 'vs previous 14 days' },
  { label: 'p95 duration', value: '4m 02s', delta: '−18s', hint: 'across all runs' },
  { label: 'Cost per run', value: '$0.31', delta: '−$0.04', hint: 'weighted average' },
  { label: 'Retry rate', value: '6.2%', delta: '+1.1pts', hint: 'steps retried at least once' },
];

export const TREND = [
  { label: 'Mon', value: 42 },
  { label: 'Tue', value: 51 },
  { label: 'Wed', value: 38 },
  { label: 'Thu', value: 64 },
  { label: 'Fri', value: 58, failed: true },
  { label: 'Sat', value: 12 },
  { label: 'Sun', value: 9 },
  { label: 'Mon', value: 61 },
  { label: 'Tue', value: 72 },
  { label: 'Wed', value: 55 },
  { label: 'Thu', value: 68, failed: true },
  { label: 'Fri', value: 74 },
  { label: 'Sat', value: 18 },
  { label: 'Sun', value: 14 },
];

export const FAILURES = [
  { reason: 'provider rate limit (429)', count: 14 },
  { reason: 'context window exceeded', count: 9 },
  { reason: 'tool timeout', count: 6 },
  { reason: 'schema validation', count: 3 },
];

export const APPROVAL_EMAIL: ApprovalRequest = {
  id: 'ap_4412',
  action: 'Send the draft to 3 recipients',
  tool: 'mail.send',
  risk: 'medium',
  requestedBy: 'the agent · step 5',
  expiresIn: 'expires in 9m',
  step: { id: 's5', name: 'Approve sending the draft', type: 'human' },
  reason: 'The draft is finished. Sending cannot be undone, so the workflow is paused here until a person approves it.',
  args: `{
  "to": ["sara@example.com", "omar@example.com", "editor@journal.org"],
  "subject": "Chapter 3 — draft for review",
  "attach": "chapter-3.docx"
}`,
};

export const APPROVAL_DANGER: ApprovalRequest = {
  id: 'ap_9081',
  action: 'Delete 42 rows from the production table',
  tool: 'db.delete_rows',
  risk: 'high',
  requestedBy: 'the agent · step 9',
  reason: 'The agent believes these rows are stale duplicates. This cannot be undone and the plan has no export step.',
  args: `{
  "table": "public.submissions",
  "where": "status = 'duplicate' AND created_at < '2026-01-01'",
  "rows_matched": 42,
  "dry_run": false
}`,
};

/* ---------- per-component previews ---------- */

const firstStep = RUN_ACTIVE.steps[3];

export const PREVIEWS: Record<string, React.ReactNode> = {
  'run-header': <RunHeader run={RUN_ACTIVE} />,
  'run-timeline': <RunTimeline run={RUN_ACTIVE} selectedStepId="s4" />,
  'step-detail': <StepDetail step={RUN_ACTIVE.steps[2]} />,
  'event-stream': <EventStream events={EVENTS} className="max-w-3xl" />,
  'replay-scrubber': <ReplayScrubber run={RUN_PARENT} index={3} onChange={() => {}} speed={1} />,
  'fork-panel': <ForkPanel run={RUN_PARENT} step={RUN_PARENT.steps[2]} />,
  'branch-compare': <BranchCompare parent={RUN_PARENT} branch={RUN_BRANCH} />,
  'runs-table': <RunsTable runs={RUNS} />,
  'run-metrics': <RunMetrics kpis={KPIS} trend={TREND} failures={FAILURES} />,
  'approval-step': <ApprovalStep request={APPROVAL_EMAIL} />,
};

export const EXAMPLES: Record<string, { label: string; node: React.ReactNode }[]> = {
  'run-header': [
    { label: 'Waiting on a human step', node: <RunHeader run={RUN_ACTIVE} /> },
    { label: 'Failed run', node: <RunHeader run={RUN_FAILED} /> },
  ],
  'run-timeline': [
    { label: 'In progress, step selected', node: <RunTimeline run={RUN_ACTIVE} selectedStepId="s4" /> },
    { label: 'Failed and skipped steps', node: <RunTimeline run={RUN_FAILED} /> },
  ],
  'step-detail': [
    { label: 'Tool step that was retried', node: <StepDetail step={RUN_ACTIVE.steps[2]} /> },
    { label: 'Failed step with an error', node: <StepDetail step={RUN_FAILED.steps[2]} /> },
  ],
  'event-stream': [
    { label: 'Live run', node: <EventStream events={EVENTS} /> },
  ],
  'replay-scrubber': [
    { label: 'Mid-run', node: <ReplayScrubber run={RUN_PARENT} index={3} onChange={() => {}} speed={1} /> },
    { label: 'At the end', node: <ReplayScrubber run={RUN_PARENT} index={5} onChange={() => {}} playing={false} speed={4} /> },
  ],
  'fork-panel': [
    { label: 'Fork from a tool step', node: <ForkPanel run={RUN_PARENT} step={RUN_PARENT.steps[2]} /> },
  ],
  'branch-compare': [
    { label: 'Parent vs branch', node: <BranchCompare parent={RUN_PARENT} branch={RUN_BRANCH} /> },
  ],
  'runs-table': [
    { label: 'All runs', node: <RunsTable runs={RUNS} /> },
  ],
  'run-metrics': [
    { label: 'Fourteen days', node: <RunMetrics kpis={KPIS} trend={TREND} failures={FAILURES} /> },
  ],
  'approval-step': [
    { label: 'Medium risk — sending email', node: <ApprovalStep request={APPROVAL_EMAIL} /> },
    { label: 'High risk — destructive tool', node: <ApprovalStep request={APPROVAL_DANGER} /> },
  ],
};

export const CONSOLE_STEP = firstStep;
