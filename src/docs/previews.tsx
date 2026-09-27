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
import { ApprovalQueue } from '@/components/agent-ops/approval-queue';
import { AnomalyFeed } from '@/components/agent-ops/anomaly-feed';
import { BudgetGauge } from '@/components/agent-ops/budget-gauge';
import { CostBreakdown } from '@/components/agent-ops/cost-breakdown';
import { DatasetTable } from '@/components/agent-ops/dataset-table';
import { ErrorPanel } from '@/components/agent-ops/error-panel';
import { EvalRunTable } from '@/components/agent-ops/eval-run-table';
import { LogViewer } from '@/components/agent-ops/log-viewer';
import { Playground } from '@/components/agent-ops/playground';
import { PromptDiff } from '@/components/agent-ops/prompt-diff';
import { PromptEditor } from '@/components/agent-ops/prompt-editor';
import { RateLimitMeter } from '@/components/agent-ops/rate-limit-meter';
import { RunDiff } from '@/components/agent-ops/run-diff';
import { RunQueue } from '@/components/agent-ops/run-queue';
import { ScheduleList } from '@/components/agent-ops/schedule-list';
import { ScorePanel } from '@/components/agent-ops/score-panel';
import { SpanWaterfall } from '@/components/agent-ops/span-waterfall';
import { StepSchemaForm } from '@/components/agent-ops/step-schema-form';
import { WebhookList } from '@/components/agent-ops/webhook-list';
import { WorkflowGraph } from '@/components/agent-ops/workflow-graph';
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

/* ---------- mock data for the second wave ---------- */

export const SPANS = [
  { id: 'sp1', name: 'Literature review brief', kind: 'agent' as const, startMs: 0, durationMs: 412_000, status: 'running' as const, detail: 'run_9f3a2b' },
  { id: 'sp2', name: 'Plan the brief', kind: 'llm' as const, startMs: 100, durationMs: 1_180, status: 'done' as const, depth: 1, detail: '412 tokens' },
  { id: 'sp3', name: 'references_search', kind: 'tool' as const, startMs: 1_500, durationMs: 84, status: 'done' as const, depth: 1, detail: '5 results' },
  { id: 'sp4', name: 'extract_pdf', kind: 'tool' as const, startMs: 2_200, durationMs: 4_100, status: 'done' as const, depth: 1, detail: 'retried once' },
  { id: 'sp5', name: 'embed chunk 3', kind: 'internal' as const, startMs: 3_100, durationMs: 610, status: 'done' as const, depth: 2, detail: '1536 dims' },
  { id: 'sp6', name: 'Draft section with citations', kind: 'llm' as const, startMs: 6_400, durationMs: 248_000, status: 'running' as const, depth: 1, detail: '2,140 tokens so far' },
  { id: 'sp7', name: 'vector lookup', kind: 'retrieval' as const, startMs: 180_400, durationMs: 96, status: 'done' as const, depth: 2, detail: 'top-k 8' },
  { id: 'sp8', name: 'Approve sending the draft', kind: 'human' as const, startMs: 254_400, durationMs: 157_600, status: 'running' as const, depth: 1, detail: 'waiting on you' },
];

export const LOGS = [
  { id: 'l1', ts: '10:02:01.004', level: 'info' as const, message: 'run_9f3a2b started (manual, mshami)', source: 'orchestrator' },
  { id: 'l2', ts: '10:02:02.118', level: 'debug' as const, message: 'POST /v1/chat/completions model=gpt-5 stream=true', source: 'openai' },
  { id: 'l3', ts: '10:02:03.402', level: 'info' as const, message: 'plan produced: 5 steps', source: 'step s1' },
  { id: 'l4', ts: '10:04:11.770', level: 'warn' as const, message: 'pdf extract timed out after 3000ms — retrying (attempt 2)', source: 'step s3' },
  { id: 'l5', ts: '10:04:20.005', level: 'info' as const, message: 'extracted 5/5 papers', source: 'step s3' },
  { id: 'l6', ts: '10:05:30.221', level: 'debug' as const, message: 'token spend 1340 · $0.0041', source: 'step s4' },
  { id: 'l7', ts: '10:06:00.640', level: 'info' as const, message: 'approval requested: mail.send', source: 'step s5' },
  { id: 'l8', ts: '10:06:02.310', level: 'error' as const, message: 'heartbeat missed twice, marking run as degraded', source: 'supervisor' },
];

export const RUN_ERROR = {
  id: 'e1',
  type: 'ProviderRateLimitError',
  message: 'Provider returned 429 after 3 attempts. The batch of 1,208 abstracts was not embedded.',
  stack: `ProviderRateLimitError: 429 Too Many Requests
    at embed.batch (/app/src/providers/embed.ts:88:13)
    at async Step.run (/app/src/orchestrator/step.ts:212:20)
    at async Runner.tick (/app/src/orchestrator/runner.ts:64:7)
retry-after: 30`,
  context: `{
  "model": "text-embedding-3-large",
  "batch_size": 256,
  "attempt": 3,
  "input_tokens": 48210
}`,
  retryable: true,
  attempts: 3,
  provider: 'openai',
  status: 429,
};

export const DIFF_BEFORE = `{
  "paper_count": 5,
  "languages": ["en"],
  "extract": { "ocr": false, "tables": false },
  "chunk_size": 1200
}`;

export const DIFF_AFTER = `{
  "paper_count": 5,
  "languages": ["en", "fr"],
  "extract": { "ocr": true, "tables": true },
  "chunk_size": 800,
  "chunk_overlap": 120
}`;

export const ANOMALIES = [
  {
    id: 'a1',
    kind: 'cost' as const,
    severity: 'high' as const,
    title: 'Cost per run is 3.4× the 14-day median',
    detail: 'The draft step is re-reading the whole context on every retry instead of resuming from the checkpoint.',
    runId: 'run_9f3a2b',
    detectedAt: 'today 10:06',
  },
  {
    id: 'a2',
    kind: 'loop' as const,
    severity: 'high' as const,
    title: 'Step re-entered 4 times',
    detail: 'extract_pdf → validate → extract_pdf. No progress between iterations; the loop guard did not fire.',
    runId: 'run_71bd04',
    detectedAt: 'today 02:14',
  },
  {
    id: 'a3',
    kind: 'latency' as const,
    severity: 'medium' as const,
    title: 'p95 duration up 41% week over week',
    detail: 'Provider latency, not your code: the same step is faster against the fallback model.',
    detectedAt: 'yesterday 18:20',
  },
  {
    id: 'a4',
    kind: 'drift' as const,
    severity: 'low' as const,
    title: 'Output length drifting down',
    detail: 'Draft sections average 412 words, down from 690 two weeks ago. Prompt unchanged.',
    detectedAt: 'Mon 09:02',
    acknowledged: true,
  },
];

export const GRAPH_NODES = [
  { id: 'g1', name: 'Fetch feeds', type: 'tool' as const, status: 'done' as const, meta: '1,240 feeds' },
  { id: 'g2', name: 'Parse & de-duplicate', type: 'llm' as const, status: 'done' as const, meta: '1,208 kept' },
  { id: 'g3', name: 'Route by topic', type: 'agent' as const, status: 'running' as const, meta: '3 branches' },
  { id: 'g4', name: 'Embed abstracts', type: 'tool' as const, status: 'failed' as const, meta: '429' },
  { id: 'g5', name: 'Human review', type: 'human' as const, status: 'waiting' as const, meta: 'waiting on you' },
  { id: 'g6', name: 'Write to index', type: 'tool' as const, status: 'queued' as const },
  { id: 'g7', name: 'Summarise daily', type: 'llm' as const, status: 'skipped' as const },
];

export const GRAPH_EDGES = [
  { from: 'g1', to: 'g2' },
  { from: 'g2', to: 'g3' },
  { from: 'g3', to: 'g4' },
  { from: 'g3', to: 'g7', conditional: true },
  { from: 'g4', to: 'g5' },
  { from: 'g5', to: 'g6' },
];

export const SCHEMA_FIELDS = [
  { name: 'topic', type: 'string' as const, required: true, label: 'Topic', description: 'What the brief is about.' },
  { name: 'paper_count', type: 'number' as const, required: true, default: 5 },
  {
    name: 'mode',
    type: 'enum' as const,
    options: ['papers', 'news', 'internal'],
    required: true,
    description: 'Which index to search.',
  },
  { name: 'include_preprints', type: 'boolean' as const, default: false },
  { name: 'sections', type: 'json' as const, description: 'Section plan, as JSON.' },
];

export const SCHEMA_VALUES = {
  topic: 'marketing analytics',
  paper_count: 5,
  mode: 'papers',
  include_preprints: false,
  sections: '{"sections": ["search", "extract", "draft", "approve", "publish"]}',
};

export const PROMPT_SYSTEM =
  'You are a research assistant. You write briefs that cite their sources. Never invent a citation.';

export const PROMPT_USER = `Write section {{section_index}} of a brief about {{topic}}.

Use only the {{paper_count}} papers in the context below.
For each claim, cite the paper id in square brackets.
Keep the tone {{tone}}.

Context:
{{context}}`;

export const PROMPT_VERSIONS = [
  { id: 'v3', label: '3', author: 'mshami', createdAt: '12 Sep', status: 'published' as const },
  { id: 'v4', label: '4', author: 'you', createdAt: '2m ago', status: 'draft' as const },
];

export const PROMPT_BEFORE = `Write section {{section_index}} of a brief about {{topic}}.

Use only the papers in the context below.
For each claim, cite the paper id in square brackets.
Keep the tone {{tone}}.`;

export const PROMPT_AFTER = `Write section {{section_index}} of a brief about {{topic}}.

Use only the {{paper_count}} papers in the context below.
For each claim, cite the paper id in square brackets, and quote at most 12 words.
Keep the tone {{tone}} and prefer short sentences.
If the context does not answer the question, say so instead of guessing.`;

export const EVAL_CASES = [
  { id: 'c1', name: 'cites every claim', input: 'summarise the 5 papers on churn', score: 92, passed: true, durationMs: 18_400, tokens: 3_910, cost: 0.014 },
  { id: 'c2', name: 'refuses when context is empty', input: 'summarise (no papers)', score: 88, passed: true, durationMs: 6_200, tokens: 1_240, cost: 0.005 },
  { id: 'c3', name: 'handles french papers', input: 'summarise the 5 papers (fr)', score: 64, passed: false, durationMs: 21_700, tokens: 4_180, cost: 0.017 },
  { id: 'c4', name: 'stays under 400 words', input: 'write section 2', score: 71, passed: false, durationMs: 24_100, tokens: 5_020, cost: 0.021 },
  { id: 'c5', name: 'no invented citations', input: 'write with weak context', score: 96, passed: true, durationMs: 17_300, tokens: 3_640, cost: 0.013 },
  { id: 'c6', name: 'survives a retried tool', input: 'extract then summarise', score: undefined, passed: undefined, durationMs: undefined, tokens: undefined, cost: undefined },
];

export const CRITERIA = [
  { name: 'Groundedness', score: 92, weight: 2, comment: 'Every claim maps to a paper id in the context.' },
  { name: 'Citation format', score: 100, weight: 1 },
  { name: 'Completeness', score: 74, weight: 1, comment: 'Section 4 is thin — the context had only one relevant paper.' },
  { name: 'Style', score: 86, weight: 1 },
];

export const DATASET_ROWS = [
  { id: 'd1', input: 'summarise the 5 papers on churn', expected: 'brief with 5 citations', lastScore: 92, tags: ['core'] },
  { id: 'd2', input: 'summarise (no papers)', expected: 'a refusal, no citations', lastScore: 88, tags: ['edge'] },
  { id: 'd3', input: 'summarise the 5 papers (fr)', expected: 'brief in french', lastScore: 64, tags: ['i18n', 'regressed'] },
  { id: 'd4', input: 'write section 2', expected: 'under 400 words', lastScore: 71, tags: ['length'] },
  { id: 'd5', input: 'write with weak context', expected: 'no invented citations', lastScore: 96, tags: ['safety'] },
];

export const VARIANTS = [
  {
    id: 'v1',
    label: 'Temp 0.2',
    model: 'gpt-5',
    output: 'Churn in this cohort is driven by onboarding friction rather than price [p3][p5].',
    tokens: 3_910,
    cost: 0.014,
    latencyMs: 18_400,
    score: 92,
  },
  {
    id: 'v2',
    label: 'Temp 0.7',
    model: 'gpt-5',
    output: 'Onboarding, not pricing, explains most of the churn — onboarding friction appears in 4 of 5 papers [p1][p3][p4][p5].',
    tokens: 4_240,
    cost: 0.016,
    latencyMs: 21_100,
    score: 88,
  },
  {
    id: 'v3',
    label: 'Cheap pass',
    model: 'gpt-5-mini',
    output: 'Churn is mostly about onboarding [p3].',
    tokens: 1_180,
    cost: 0.002,
    latencyMs: 5_600,
    score: 61,
  },
];

export const COST_BUCKETS = [
  { label: 'Mon', segments: [{ name: 'draft', value: 0.62 }, { name: 'extract', value: 0.18 }, { name: 'embed', value: 0.08 }] },
  { label: 'Tue', segments: [{ name: 'draft', value: 0.71 }, { name: 'extract', value: 0.21 }, { name: 'embed', value: 0.09 }] },
  { label: 'Wed', segments: [{ name: 'draft', value: 0.48 }, { name: 'extract', value: 0.16 }, { name: 'embed', value: 0.07 }] },
  { label: 'Thu', segments: [{ name: 'draft', value: 0.86 }, { name: 'extract', value: 0.24 }, { name: 'embed', value: 0.1 }] },
  { label: 'Fri', segments: [{ name: 'draft', value: 1.42 }, { name: 'extract', value: 0.31 }, { name: 'embed', value: 0.14 }] },
  { label: 'Sat', segments: [{ name: 'draft', value: 0.19 }, { name: 'extract', value: 0.06 }, { name: 'embed', value: 0.03 }] },
  { label: 'Sun', segments: [{ name: 'draft', value: 0.14 }, { name: 'extract', value: 0.05 }, { name: 'embed', value: 0.02 }] },
];

export const COST_ROWS = [
  { name: 'draft', cost: 4.42, tokens: 1_284_000, runs: 42 },
  { name: 'extract', cost: 1.21, tokens: 486_000, runs: 42 },
  { name: 'embed', cost: 0.53, tokens: 210_000, runs: 38 },
];

export const RATE_LIMITS = [
  { id: 'r1', provider: 'OpenAI', model: 'gpt-5', used: 812_400, limit: 1_000_000, window: 'minute', resetIn: '14s' },
  { id: 'r2', provider: 'OpenAI', model: 'text-embedding-3-large', used: 296_000, limit: 300_000, window: 'minute', resetIn: '42s' },
  { id: 'r3', provider: 'Anthropic', model: 'claude-opus', used: 41_200, limit: 80_000, window: 'minute', resetIn: '31s' },
  { id: 'r4', provider: 'Internal GPU pool', used: 3, limit: 4, window: 'concurrent', resetIn: '—' },
];

export const PENDING_APPROVALS = [
  { id: 'p1', action: 'Send the draft to 3 recipients', tool: 'mail.send', risk: 'medium' as const, runId: 'run_9f3a2b', workflow: 'Literature review brief', requestedAt: '4m', expiresIn: 'expires in 9m' },
  { id: 'p2', action: 'Delete 42 rows from public.submissions', tool: 'db.delete_rows', risk: 'high' as const, runId: 'run_9081aa', workflow: 'Dedupe submissions', requestedAt: '11m', expiresIn: 'expires in 4m' },
  { id: 'p3', action: 'Publish the invoice extractor v3', tool: 'deploy.promote', risk: 'high' as const, runId: 'run_3a77f1', workflow: 'Invoice extraction', requestedAt: '26m' },
  { id: 'p4', action: 'Charge 4 overage seats', tool: 'billing.charge', risk: 'low' as const, runId: 'run_2f88b4', workflow: 'Monthly billing', requestedAt: '1h' },
];

export const QUEUED_RUNS = [
  { id: 'run_1e55c9', workflow: 'Literature review brief', priority: 'high' as const, queuedFor: '12s', trigger: 'manual' as const },
  { id: 'run_5b0e77', workflow: 'Support triage', priority: 'normal' as const, queuedFor: '48s', trigger: 'webhook' as const },
  { id: 'run_4d92c3', workflow: 'Nightly index refresh', priority: 'normal' as const, queuedFor: '2m', trigger: 'schedule' as const },
  { id: 'run_6c1aa9', workflow: 'Invoice extraction', priority: 'low' as const, queuedFor: '6m', trigger: 'api' as const, waitingOn: 'GPU slot' },
  { id: 'run_3a77f1', workflow: 'Support triage', priority: 'low' as const, queuedFor: '9m', trigger: 'webhook' as const, waitingOn: 'rate limit' },
];

export const SCHEDULES = [
  { id: 's1', workflow: 'Nightly index refresh', cron: '0 2 * * *', humanReading: 'every day at 02:00', timezone: 'Asia/Kuala_Lumpur', nextRun: 'in 15h 32m', lastRun: { at: 'today 02:00', status: 'failed' as const }, enabled: true },
  { id: 's2', workflow: 'Literature review brief', cron: '0 9 * * 1-5', humanReading: 'weekdays at 09:00', timezone: 'Asia/Kuala_Lumpur', nextRun: 'in 22h 32m', lastRun: { at: 'today 09:00', status: 'succeeded' as const }, enabled: true },
  { id: 's3', workflow: 'Invoice extraction', cron: '*/15 * * * *', humanReading: 'every 15 minutes', timezone: 'UTC', nextRun: 'in 6m', lastRun: { at: '10:30', status: 'succeeded' as const }, enabled: true },
  { id: 's4', workflow: 'Weekly digest', cron: '0 16 * * 5', humanReading: 'Fridays at 16:00', timezone: 'Asia/Kuala_Lumpur', nextRun: 'in 4d 6h', lastRun: { at: 'Fri 16:00', status: 'cancelled' as const }, enabled: false },
];

export const WEBHOOKS = [
  { id: 'w1', url: 'https://hooks.zendesk.example.com/paper/triage', events: ['run.succeeded', 'run.failed'], enabled: true, successRate: 99, lastDelivery: { at: '10:41', status: 'delivered' as const, code: 200, ms: 84 } },
  { id: 'w2', url: 'https://billing.internal/paper/invoice-events', events: ['step.approved'], enabled: true, successRate: 92, lastDelivery: { at: '08:30', status: 'failed' as const, code: 502, ms: 3_100 } },
  { id: 'w3', url: 'https://slack.com/api/hooks/T000/B000/xxxx', events: ['anomaly.detected'], enabled: true, successRate: 100, lastDelivery: { at: '10:06', status: 'delivered' as const, code: 200, ms: 121 } },
  { id: 'w4', url: 'https://staging.internal/paper/hook', events: ['run.started'], enabled: false, successRate: 41, lastDelivery: { at: 'Mon 14:02', status: 'failed' as const, code: 404 } },
];

/* ---------- per-component previews ---------- */

const firstStep = RUN_ACTIVE.steps[3];

const NEW_PREVIEWS: Record<string, React.ReactNode> = {
  'span-waterfall': <SpanWaterfall spans={SPANS} />,
  'log-viewer': <LogViewer lines={LOGS} />,
  'error-panel': <ErrorPanel error={RUN_ERROR} />,
  'run-diff': <RunDiff before={DIFF_BEFORE} after={DIFF_AFTER} />,
  anomalies: <AnomalyFeed anomalies={ANOMALIES} />,
  'workflow-graph': <WorkflowGraph nodes={GRAPH_NODES} edges={GRAPH_EDGES} />,
  'step-schema-form': <StepSchemaForm fields={SCHEMA_FIELDS} values={SCHEMA_VALUES} />,
  'prompt-editor': <PromptEditor system={PROMPT_SYSTEM} user={PROMPT_USER} />,
  'prompt-diff': <PromptDiff versions={PROMPT_VERSIONS} activeVersionId="v4" before={PROMPT_BEFORE} after={PROMPT_AFTER} />,
  'eval-run-table': <EvalRunTable name="Groundedness eval" model="gpt-5" cases={EVAL_CASES} />,
  'score-panel': <ScorePanel criteria={CRITERIA} overall={86} verdict="needs-review" />,
  'dataset-table': <DatasetTable name="Brief test set" version="7" rows={DATASET_ROWS} />,
  playground: <Playground input="Summarise the 5 papers on churn." variants={VARIANTS} pickedId="v1" />,
  'cost-breakdown': <CostBreakdown title="Model" window="Last 7 days" buckets={COST_BUCKETS} rows={COST_ROWS} />,
  'budget-gauge': <BudgetGauge period="October" budget={120} spent={78.4} forecast={148.2} />,
  'rate-limit-meter': <RateLimitMeter limits={RATE_LIMITS} />,
  'approval-queue': <ApprovalQueue approvals={PENDING_APPROVALS} />,
  'run-queue': <RunQueue runs={QUEUED_RUNS} running={3} concurrency={4} />,
  'schedule-list': <ScheduleList schedules={SCHEDULES} />,
  webhooks: <WebhookList endpoints={WEBHOOKS} />,
};

export const NEW_EXAMPLES: Record<string, { label: string; node: React.ReactNode }[]> = {
  'span-waterfall': [{ label: 'A run with a retried tool and a human step', node: <SpanWaterfall spans={SPANS} /> }],
  'log-viewer': [{ label: 'Filtered, wrapped, following', node: <LogViewer lines={LOGS} /> }],
  'error-panel': [
    { label: 'Retryable provider error', node: <ErrorPanel error={RUN_ERROR} /> },
    {
      label: 'Fatal error, no retry',
      node: <ErrorPanel error={{ ...RUN_ERROR, retryable: false, type: 'SchemaValidationError', message: 'The model returned a payload that does not match the step schema.', attempts: 1 }} />,
    },
  ],
  'run-diff': [
    { label: 'Editing a step input', node: <RunDiff before={DIFF_BEFORE} after={DIFF_AFTER} /> },
    {
      label: 'Two prompt outputs',
      node: <RunDiff title="Output diff" beforeLabel="run_6c1aa9" afterLabel="run_9f3a2b" before={PROMPT_BEFORE} after={PROMPT_AFTER} />,
    },
  ],
  anomalies: [{ label: 'Open and acknowledged', node: <AnomalyFeed anomalies={ANOMALIES} /> }],
  'workflow-graph': [{ label: 'A running workflow with a failed node', node: <WorkflowGraph nodes={GRAPH_NODES} edges={GRAPH_EDGES} /> }],
  'step-schema-form': [{ label: 'Generated from the step schema', node: <StepSchemaForm fields={SCHEMA_FIELDS} values={SCHEMA_VALUES} /> }],
  'prompt-editor': [{ label: 'With variables and a token estimate', node: <PromptEditor system={PROMPT_SYSTEM} user={PROMPT_USER} /> }],
  'prompt-diff': [{ label: 'Draft vs published', node: <PromptDiff versions={PROMPT_VERSIONS} activeVersionId="v4" before={PROMPT_BEFORE} after={PROMPT_AFTER} /> }],
  'eval-run-table': [{ label: 'With one case still running', node: <EvalRunTable name="Groundedness eval" model="gpt-5" cases={EVAL_CASES} /> }],
  'score-panel': [{ label: 'Needs review', node: <ScorePanel criteria={CRITERIA} overall={86} verdict="needs-review" /> }],
  'dataset-table': [{ label: 'A versioned test set', node: <DatasetTable name="Brief test set" version="7" rows={DATASET_ROWS} /> }],
  playground: [{ label: 'Three variants, one picked', node: <Playground input="Summarise the 5 papers on churn." variants={VARIANTS} pickedId="v1" /> }],
  'cost-breakdown': [{ label: 'Seven days by model', node: <CostBreakdown title="Model" window="Last 7 days" buckets={COST_BUCKETS} rows={COST_ROWS} /> }],
  'budget-gauge': [
    { label: 'On track', node: <BudgetGauge period="October" budget={120} spent={41.2} forecast={88.4} /> },
    { label: 'Projected over budget', node: <BudgetGauge period="October" budget={120} spent={78.4} forecast={148.2} /> },
  ],
  'rate-limit-meter': [{ label: 'Ok, close and exceeded', node: <RateLimitMeter limits={RATE_LIMITS} /> }],
  'approval-queue': [{ label: 'Four runs blocked on people', node: <ApprovalQueue approvals={PENDING_APPROVALS} /> }],
  'run-queue': [{ label: 'Three of four workers busy', node: <RunQueue runs={QUEUED_RUNS} running={3} concurrency={4} /> }],
  'schedule-list': [{ label: 'A failed nightly and a paused weekly', node: <ScheduleList schedules={SCHEDULES} /> }],
  webhooks: [{ label: 'A failing endpoint next to a healthy one', node: <WebhookList endpoints={WEBHOOKS} /> }],
};

/* ---------- per-component previews ---------- */

export const PREVIEWS: Record<string, React.ReactNode> = {
  ...NEW_PREVIEWS,
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
  ...NEW_EXAMPLES,
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
