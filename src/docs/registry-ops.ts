import type { ComponentEntry } from './registry';

/** The second wave: observability, authoring, evaluation, cost and operations. */
export const OPS_COMPONENTS: ComponentEntry[] = [
  {
    id: 'span-waterfall',
    name: 'SpanWaterfall',
    category: 'Observability',
    tagline: 'The trace, drawn to scale. Where did the time actually go?',
    description:
      'Nested spans with their offset and duration drawn as bars against the total, so a slow tool or a long human wait is visible at a glance rather than inferred from timestamps.',
    status: 'new',
    file: 'components/agent-ops/span-waterfall.tsx',
    primitives: ['card', 'badge'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<SpanWaterfall spans={spans} onSelectSpan={(span) => select(span.id)} />`,
    anatomy: `import { SpanWaterfall } from '@/components/agent-ops/span-waterfall';

// Span: id, name, kind, startMs, durationMs, status, depth?, detail?
<SpanWaterfall spans={trace.spans} onSelectSpan={openSpan} />`,
    examples: [
      { label: 'A retried tool and a human step', code: `<SpanWaterfall spans={spans} />` },
      { label: 'Failures are drawn lighter', code: `<SpanWaterfall spans={spans.filter((s) => s.status === 'failed')} />` },
    ],
    api: [
      {
        title: 'SpanWaterfall · Span',
        description: 'A flat span list with a depth per span; nesting is expressed by depth.',
        rows: [
          { prop: 'spans', type: 'Span[]', description: 'id, name, kind, startMs, durationMs, status, depth?, detail?' },
          { prop: 'kind', type: "'agent' | 'llm' | 'tool' | 'retrieval' | 'human' | 'internal'", description: 'Shown as a badge.' },
          { prop: 'depth', type: 'number', description: 'Indentation level. Defaults to 0.' },
          { prop: 'onSelectSpan', type: '(span: Span) => void', description: 'Called when a span is clicked.' },
        ],
      },
    ],
  },
  {
    id: 'log-viewer',
    name: 'LogViewer',
    category: 'Observability',
    tagline: 'The raw logs, with the search box you always end up needing.',
    description:
      'A filtered log pane: substring search, level toggles, wrapping and follow-the-tail. Where EventStream is the run’s narrative, this is the firehose underneath it.',
    status: 'new',
    file: 'components/agent-ops/log-viewer.tsx',
    primitives: ['card', 'badge', 'button', 'input'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<LogViewer lines={logs} />`,
    anatomy: `import { LogViewer } from '@/components/agent-ops/log-viewer';

// LogLine: id, ts, level ('debug' | 'info' | 'warn' | 'error'), message, source?
<LogViewer lines={logs} />`,
    examples: [{ label: 'Filtered, wrapped, following', code: `<LogViewer lines={logs} />` }],
    api: [
      {
        title: 'LogViewer · LogLine',
        description: 'Search, level filters, wrap and follow are all internal state.',
        rows: [
          { prop: 'lines', type: 'LogLine[]', description: 'Rendered in array order, oldest first.' },
          { prop: 'ts', type: 'string', description: 'Timestamp with milliseconds, e.g. 10:04:11.770.' },
          { prop: 'level', type: "'debug' | 'info' | 'warn' | 'error'", description: 'Drives the filter and the colour of the level column.' },
          { prop: 'source', type: 'string', description: 'Optional origin, e.g. step s3 or openai.' },
          { prop: 'className', type: 'string', description: 'Merged onto the card.' },
        ],
      },
    ],
  },
  {
    id: 'error-panel',
    name: 'ErrorPanel',
    category: 'Observability',
    tagline: 'What broke, and whether it is worth retrying.',
    description:
      'The provider error, its type, status and attempt count, the stack and the exact request that caused it, with retry disabled when the error is not retryable.',
    status: 'new',
    file: 'components/agent-ops/error-panel.tsx',
    primitives: ['card', 'badge', 'button', 'separator'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<ErrorPanel error={error} onRetry={() => retry(step.id)} onSkip={() => skip(step.id)} />`,
    anatomy: `import { ErrorPanel } from '@/components/agent-ops/error-panel';

// RunError: type, message, retryable?, attempts?, provider?, status?, stack?, context?
<ErrorPanel error={error} onRetry={retry} />`,
    examples: [
      { label: 'Retryable provider error', code: `<ErrorPanel error={rateLimit} onRetry={retry} />` },
      { label: 'Fatal error, no retry', code: `<ErrorPanel error={{ ...error, retryable: false }} />` },
    ],
    api: [
      {
        title: 'ErrorPanel · RunError',
        description: 'Retry is offered only when the error says so.',
        rows: [
          { prop: 'type', type: 'string', description: 'Machine name of the error.' },
          { prop: 'message', type: 'string', description: 'One-line human explanation.' },
          { prop: 'retryable', type: 'boolean', description: 'Disables the Retry button when false.' },
          { prop: 'stack / context', type: 'string', description: 'Optional stack and request payload, each in its own well.' },
          { prop: 'provider / status / attempts', type: 'string · number · number', description: 'Rendered as badges.' },
          { prop: 'onRetry / onSkip', type: '() => void', description: 'Step actions.' },
        ],
      },
    ],
  },
  {
    id: 'run-diff',
    name: 'RunDiff',
    category: 'Observability',
    tagline: 'What actually changed between two runs, line by line.',
    description:
      'A line diff (LCS, so insertions stay aligned) of any two payloads: a step input you edited, or the outputs of a parent and its branch.',
    status: 'new',
    file: 'components/agent-ops/run-diff.tsx',
    primitives: ['card', 'badge'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<RunDiff
  before={parentStep.input}
  after={branchStep.input}
  beforeLabel={parent.id}
  afterLabel={branch.id}
/>`,
    anatomy: `import { RunDiff } from '@/components/agent-ops/run-diff';

// anything line-based: JSON payloads, prompts, generated text
<RunDiff before={before} after={after} title="Input diff" />`,
    examples: [
      { label: 'Editing a step input', code: `<RunDiff before={before} after={after} />` },
      { label: 'Two prompt outputs', code: `<RunDiff title="Output diff" before={a} after={b} />` },
    ],
    api: [
      {
        title: 'RunDiff',
        description: 'A unified, line-aligned diff.',
        rows: [
          { prop: 'before / after', type: 'string', description: 'The two texts to compare.' },
          { prop: 'beforeLabel / afterLabel', type: 'string', description: 'Badges in the header.' },
          { prop: 'title', type: 'string', description: 'Card title. Defaults to Diff.' },
        ],
      },
    ],
  },
  {
    id: 'anomalies',
    name: 'AnomalyFeed',
    category: 'Observability',
    tagline: 'The things a run did that it did not do yesterday.',
    description:
      'Cost spikes, latency regressions, loops and drift, each with a severity, the run that triggered it and an acknowledge action — the difference between a dashboard and a signal.',
    status: 'new',
    file: 'components/agent-ops/anomaly-feed.tsx',
    primitives: ['card', 'badge', 'button'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<AnomalyFeed anomalies={anomalies} onAcknowledge={(anomaly) => ack(anomaly.id)} />`,
    anatomy: `import { AnomalyFeed } from '@/components/agent-ops/anomaly-feed';

// Anomaly: kind ('cost' | 'latency' | 'drift' | 'error-rate' | 'loop'), severity, title, detail
<AnomalyFeed anomalies={anomalies} onAcknowledge={ack} />`,
    examples: [{ label: 'Open and acknowledged', code: `<AnomalyFeed anomalies={anomalies} />` }],
    api: [
      {
        title: 'AnomalyFeed · Anomaly',
        description: 'A list of detected anomalies, newest first.',
        rows: [
          { prop: 'kind', type: "'cost' | 'latency' | 'drift' | 'error-rate' | 'loop'", description: 'Rendered as a badge.' },
          { prop: 'severity', type: "'low' | 'medium' | 'high'", description: 'High renders in the destructive tone.' },
          { prop: 'title / detail', type: 'string', description: 'The headline and the explanation.' },
          { prop: 'runId / detectedAt', type: 'string', description: 'Where and when it was seen.' },
          { prop: 'onAcknowledge', type: '(anomaly: Anomaly) => void', description: 'Called from the row action.' },
        ],
      },
    ],
  },
  {
    id: 'workflow-graph',
    name: 'WorkflowGraph',
    category: 'Authoring',
    tagline: 'The workflow as a graph, with live state on every node.',
    description:
      'Layers are derived from the edges, nodes are positioned automatically, and each node carries the same status marks as the timeline — so the picture of the workflow and its live state are the same object.',
    status: 'new',
    file: 'components/agent-ops/workflow-graph.tsx',
    primitives: ['card', 'badge'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<WorkflowGraph nodes={nodes} edges={edges} onSelectNode={(node) => select(node.id)} />`,
    anatomy: `import { WorkflowGraph } from '@/components/agent-ops/workflow-graph';

// GraphNode: id, name, type, status, meta?  ·  GraphEdge: from, to, label?, conditional?
<WorkflowGraph nodes={nodes} edges={edges} onSelectNode={select} />`,
    examples: [
      { label: 'A running workflow with a failed node', code: `<WorkflowGraph nodes={nodes} edges={edges} />` },
      { label: 'Conditional branches render lighter', code: `<WorkflowGraph nodes={nodes} edges={edges.map((e) => ({ ...e, conditional: true }))} />` },
    ],
    api: [
      {
        title: 'WorkflowGraph',
        description: 'Auto-layout: column = longest path from a root, row = order in the array.',
        rows: [
          { prop: 'nodes', type: 'GraphNode[]', description: 'id, name, type, status, meta?' },
          { prop: 'edges', type: 'GraphEdge[]', description: 'from, to, label?, conditional? — conditional edges render at half opacity.' },
          { prop: 'onSelectNode', type: '(node: GraphNode) => void', description: 'Called when a node is clicked.' },
        ],
      },
    ],
  },
  {
    id: 'step-schema-form',
    name: 'StepSchemaForm',
    category: 'Authoring',
    tagline: 'A form generated from the step’s declared inputs.',
    description:
      'String, number, boolean, enum and JSON fields from a small schema, with the payload it will send shown underneath — the “edit the input before you fork” surface.',
    status: 'new',
    file: 'components/agent-ops/step-schema-form.tsx',
    primitives: ['card', 'badge', 'button', 'input', 'label', 'separator', 'textarea'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<StepSchemaForm
  fields={step.inputSchema}
  values={values}
  onChange={setValues}
  onSubmit={(values) => forkWith(values)}
/>`,
    anatomy: `import { StepSchemaForm } from '@/components/agent-ops/step-schema-form';

// SchemaField: name, type ('string' | 'number' | 'boolean' | 'enum' | 'json'), label?, options?, required?
<StepSchemaForm fields={fields} values={values} onChange={setValues} />`,
    examples: [{ label: 'Generated from the step schema', code: `<StepSchemaForm fields={fields} values={values} onChange={setValues} />` }],
    api: [
      {
        title: 'StepSchemaForm · SchemaField',
        description: 'Controlled when onChange is given, local otherwise.',
        rows: [
          { prop: 'fields', type: 'SchemaField[]', description: 'name, type, label?, description?, required?, options? (for enum), default?' },
          { prop: 'values', type: 'Record<string, string | number | boolean>', description: 'Current values.' },
          { prop: 'onChange', type: '(values) => void', description: 'Makes the form controlled.' },
          { prop: 'onSubmit', type: '(values) => void', description: 'Called from the submit button.' },
          { prop: 'submitLabel', type: 'string', description: 'Defaults to Run with these inputs.' },
        ],
      },
    ],
  },
  {
    id: 'prompt-editor',
    name: 'PromptEditor',
    category: 'Authoring',
    tagline: 'Write the prompt, see its variables and what it will cost.',
    description:
      'System and user prompt bodies, the {{variables}} detected in them, and a token estimate per version — the smallest thing that stops prompts living in a string constant.',
    status: 'new',
    file: 'components/agent-ops/prompt-editor.tsx',
    primitives: ['card', 'badge', 'button', 'separator', 'textarea'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<PromptEditor
  system={prompt.system}
  user={prompt.user}
  model="gpt-5"
  onChange={setPrompt}
  onSave={(value) => saveVersion(value)}
  onTest={(value) => runOn(value, cases)}
/>`,
    anatomy: `import { PromptEditor } from '@/components/agent-ops/prompt-editor';

// variables are detected from {{name}} and shown as chips
<PromptEditor system={system} user={user} model="gpt-5" onSave={save} />`,
    examples: [{ label: 'With variables and a token estimate', code: `<PromptEditor system={system} user={user} onSave={save} />` }],
    api: [
      {
        title: 'PromptEditor',
        description: 'Token count is a ~4 characters per token estimate, not a tokenizer.',
        rows: [
          { prop: 'system / user', type: 'string', description: 'Initial prompt bodies.' },
          { prop: 'model', type: 'string', description: 'Shown as a badge.' },
          { prop: 'onChange / onSave / onTest', type: '({ system, user }) => void', description: 'Called as the prompt changes, is saved, or is tested.' },
        ],
      },
    ],
  },
  {
    id: 'prompt-diff',
    name: 'PromptDiff',
    category: 'Authoring',
    tagline: 'What changed in the prompt, and whether to publish it.',
    description:
      'Version chips, the author and date on both sides, a line diff of the bodies, and the publish or discard decision — prompt changes reviewed like code.',
    status: 'new',
    file: 'components/agent-ops/prompt-diff.tsx',
    primitives: ['card', 'badge', 'button', 'separator'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<PromptDiff
  versions={versions}
  activeVersionId="v4"
  onSelectVersion={setVersion}
  before={versions[2].body}
  after={versions[3].body}
  onPublish={publish}
  onDiscard={discard}
/>`,
    anatomy: `import { PromptDiff } from '@/components/agent-ops/prompt-diff';

// PromptVersion: id, label, author?, createdAt?, status? ('draft' | 'published' | 'archived')
<PromptDiff versions={versions} before={before} after={after} onPublish={publish} />`,
    examples: [{ label: 'Draft vs published', code: `<PromptDiff versions={versions} before={before} after={after} />` }],
    api: [
      {
        title: 'PromptDiff',
        description: 'The diff itself is the same LCS line diff as RunDiff.',
        rows: [
          { prop: 'versions', type: 'PromptVersion[]', description: 'id, label, author?, createdAt?, status?' },
          { prop: 'before / after', type: 'string', description: 'The two prompt bodies.' },
          { prop: 'activeVersionId', type: 'string', description: 'Highlights the selected version chip.' },
          { prop: 'onSelectVersion / onPublish / onDiscard', type: 'callbacks', description: 'Version and decision handlers.' },
        ],
      },
    ],
  },
  {
    id: 'eval-run-table',
    name: 'EvalRunTable',
    category: 'Evaluation',
    tagline: 'Every test case, its score, and the ones that regressed.',
    description:
      'A pass rate in the header, a score bar per case, and duration, tokens and cost per case — so a regression is a row, not a vibe.',
    status: 'new',
    file: 'components/agent-ops/eval-run-table.tsx',
    primitives: ['card', 'badge', 'button', 'table'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<EvalRunTable
  name="Groundedness eval"
  model="gpt-5"
  cases={cases}
  onRun={runEval}
  onRerunCase={(testCase) => rerun(testCase.id)}
/>`,
    anatomy: `import { EvalRunTable } from '@/components/agent-ops/eval-run-table';

// EvalCase: id, name, input, expected?, score? (0-100), passed?, durationMs?, tokens?, cost?
<EvalRunTable cases={cases} onRun={runEval} />`,
    examples: [
      { label: 'With one case still running', code: `<EvalRunTable cases={cases} onRun={runEval} />` },
      { label: 'Pass rate only', code: `<EvalRunTable cases={cases.filter((c) => c.score !== undefined)} />` },
    ],
    api: [
      {
        title: 'EvalRunTable · EvalCase',
        description: 'Cases without a score render as unscored.',
        rows: [
          { prop: 'name / model', type: 'string', description: 'Header labels.' },
          { prop: 'cases', type: 'EvalCase[]', description: 'id, name, input, expected?, score?, passed?, durationMs?, tokens?, cost?' },
          { prop: 'onRun', type: '() => void', description: 'Runs the whole eval.' },
          { prop: 'onRerunCase / onSelectCase', type: '(testCase) => void', description: 'Per-row actions.' },
        ],
      },
    ],
  },
  {
    id: 'score-panel',
    name: 'ScorePanel',
    category: 'Evaluation',
    tagline: 'How the graders scored this output, criterion by criterion.',
    description:
      'Weighted rubric scores with the grader’s comment per criterion, an overall score, a note field for the reviewer, and the override a human always wants.',
    status: 'new',
    file: 'components/agent-ops/score-panel.tsx',
    primitives: ['card', 'badge', 'button', 'separator', 'textarea'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<ScorePanel
  criteria={criteria}
  overall={86}
  verdict="needs-review"
  onVerdict={(verdict) => override(verdict)}
  onSaveNote={saveNote}
/>`,
    anatomy: `import { ScorePanel } from '@/components/agent-ops/score-panel';

// Criterion: name, score (0-100), weight?, comment?
<ScorePanel criteria={criteria} overall={86} verdict="needs-review" onVerdict={override} />`,
    examples: [
      { label: 'Needs review', code: `<ScorePanel criteria={criteria} overall={86} verdict="needs-review" />` },
      { label: 'Accepted', code: `<ScorePanel criteria={criteria} overall={94} verdict="pass" />` },
    ],
    api: [
      {
        title: 'ScorePanel · Criterion',
        description: 'Overall defaults to the unweighted mean of the criteria.',
        rows: [
          { prop: 'criteria', type: 'Criterion[]', description: 'name, score, weight?, comment?' },
          { prop: 'overall', type: 'number', description: 'Overrides the computed mean.' },
          { prop: 'verdict', type: "'pass' | 'fail' | 'needs-review'", description: 'Shown as a badge.' },
          { prop: 'onVerdict', type: "(verdict: 'pass' | 'fail') => void", description: 'Called from the override buttons.' },
          { prop: 'onSaveNote', type: '(note: string) => void', description: 'Called when the reviewer saves a note.' },
        ],
      },
    ],
  },
  {
    id: 'dataset-table',
    name: 'DatasetTable',
    category: 'Evaluation',
    tagline: 'The test data behind the evals, versioned like everything else.',
    description:
      'Dataset rows with their expected output, tags and last score, plus import, export and add-row actions — the part of evals that is easy to leave in a spreadsheet.',
    status: 'new',
    file: 'components/agent-ops/dataset-table.tsx',
    primitives: ['card', 'badge', 'button', 'table'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<DatasetTable
  name="Brief test set"
  version="7"
  rows={rows}
  onAddRow={addRow}
  onImport={importCsv}
  onExport={exportCsv}
/>`,
    anatomy: `import { DatasetTable } from '@/components/agent-ops/dataset-table';

// DatasetRow: id, input, expected?, lastScore?, tags?
<DatasetTable name="Brief test set" rows={rows} onAddRow={addRow} />`,
    examples: [{ label: 'A versioned test set', code: `<DatasetTable name="Brief test set" version="7" rows={rows} />` }],
    api: [
      {
        title: 'DatasetTable · DatasetRow',
        description: 'Scores render as a slim bar so regressions are scannable.',
        rows: [
          { prop: 'rows', type: 'DatasetRow[]', description: 'id, input, expected?, lastScore?, tags?' },
          { prop: 'name / version', type: 'string', description: 'Header labels.' },
          { prop: 'onAddRow / onImport / onExport', type: '() => void', description: 'Dataset actions.' },
        ],
      },
    ],
  },
  {
    id: 'playground',
    name: 'Playground',
    category: 'Evaluation',
    tagline: 'One input, several variants, until one wins.',
    description:
      'The same input run through several models or settings side by side, each with its output, latency, tokens, cost and score — and a winner you can pick and keep.',
    status: 'new',
    file: 'components/agent-ops/playground.tsx',
    primitives: ['card', 'badge', 'button'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<Playground
  input={testCase.input}
  variants={variants}
  pickedId={winner}
  onPick={(variant) => setWinner(variant.id)}
  onRun={() => runAll()}
/>`,
    anatomy: `import { Playground } from '@/components/agent-ops/playground';

// PlaygroundVariant: id, label, model, output, latencyMs?, tokens?, cost?, score?
<Playground input={input} variants={variants} onPick={pick} />`,
    examples: [{ label: 'Three variants, one picked', code: `<Playground input={input} variants={variants} pickedId="v1" />` }],
    api: [
      {
        title: 'Playground · PlaygroundVariant',
        description: 'Variants lay out in a responsive grid.',
        rows: [
          { prop: 'input', type: 'string', description: 'Shown once above the variants.' },
          { prop: 'variants', type: 'PlaygroundVariant[]', description: 'id, label, model, output, latencyMs?, tokens?, cost?, score?' },
          { prop: 'pickedId', type: 'string', description: 'Highlights the winner.' },
          { prop: 'onPick', type: '(variant) => void', description: 'Called when a variant is picked.' },
        ],
      },
    ],
  },
  {
    id: 'cost-breakdown',
    name: 'CostBreakdown',
    category: 'Cost & limits',
    tagline: 'Where the money went, by day and by step.',
    description:
      'Stacked daily bars broken down by model or step, drawn in shades of one colour so the shape is readable without a legend lookup, plus the totals per category.',
    status: 'new',
    file: 'components/agent-ops/cost-breakdown.tsx',
    primitives: ['card', 'table'],
    deps: [],
    wide: true,
    usage: `<CostBreakdown
  title="Model"
  window="Last 7 days"
  buckets={buckets}
  rows={rows}
/>`,
    anatomy: `import { CostBreakdown } from '@/components/agent-ops/cost-breakdown';

// CostBucket: { label, segments: [{ name, value }] }  ·  CostRow: { name, cost, tokens?, runs? }
<CostBreakdown buckets={buckets} rows={rows} />`,
    examples: [{ label: 'Seven days by model', code: `<CostBreakdown title="Model" buckets={buckets} rows={rows} />` }],
    api: [
      {
        title: 'CostBreakdown',
        description: 'Segment names are collected across buckets and assigned shades in order.',
        rows: [
          { prop: 'buckets', type: 'CostBucket[]', description: 'label plus segments (name, value).' },
          { prop: 'rows', type: 'CostRow[]', description: 'name, cost, tokens?, runs? — the summary table.' },
          { prop: 'total', type: 'number', description: 'Overrides the summed total.' },
          { prop: 'title / window', type: 'string', description: 'Header labels. title is also the first column name.' },
        ],
      },
    ],
  },
  {
    id: 'budget-gauge',
    name: 'BudgetGauge',
    category: 'Cost & limits',
    tagline: 'Spend against the budget, with the forecast you did not want.',
    description:
      'Used, remaining and projected spend against thresholds, with the forecast marked on the bar — so budget is a decision made now rather than a surprise at the end of the month.',
    status: 'new',
    file: 'components/agent-ops/budget-gauge.tsx',
    primitives: ['card', 'badge', 'separator'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<BudgetGauge period="October" budget={120} spent={78.4} forecast={148.2} thresholds={[50, 80, 100]} />`,
    anatomy: `import { BudgetGauge } from '@/components/agent-ops/budget-gauge';

// the forecast marker is the difference between "fine" and "fine until Sunday"
<BudgetGauge budget={120} spent={78.4} forecast={148.2} />`,
    examples: [
      { label: 'On track', code: `<BudgetGauge budget={120} spent={41.2} forecast={88.4} />` },
      { label: 'Projected over budget', code: `<BudgetGauge budget={120} spent={78.4} forecast={148.2} />` },
    ],
    api: [
      {
        title: 'BudgetGauge',
        description: 'The badge flips to “projected over” when the forecast exceeds the budget.',
        rows: [
          { prop: 'budget / spent / forecast?', type: 'number', description: 'Forecast defaults to nothing and the marker is hidden.' },
          { prop: 'period', type: 'string', description: 'Shown next to the title.' },
          { prop: 'thresholds', type: 'number[]', description: 'Percentages drawn as ticks. Defaults to [50, 80, 100].' },
        ],
      },
    ],
  },
  {
    id: 'rate-limit-meter',
    name: 'RateLimitMeter',
    category: 'Cost & limits',
    tagline: 'The quota wall, before you hit it.',
    description:
      'Per-provider and per-model usage against the limit for a window, with the reset countdown and a state that turns “close to limit” into something you can see in advance.',
    status: 'new',
    file: 'components/agent-ops/rate-limit-meter.tsx',
    primitives: ['card', 'badge'],
    deps: [],
    wide: true,
    usage: `<RateLimitMeter limits={limits} />`,
    anatomy: `import { RateLimitMeter } from '@/components/agent-ops/rate-limit-meter';

// RateLimit: provider, model?, used, limit, window, resetIn (e.g. '14s', '—' for concurrency)
<RateLimitMeter limits={limits} />`,
    examples: [
      { label: 'Ok, close and exceeded', code: `<RateLimitMeter limits={limits} />` },
      { label: 'A single provider', code: `<RateLimitMeter limits={limits.slice(0, 1)} />` },
    ],
    api: [
      {
        title: 'RateLimitMeter · RateLimit',
        description: 'State is derived: ok under 80%, close under 100%, exceeded at or over.',
        rows: [
          { prop: 'provider / model?', type: 'string', description: 'Provider name and optional model.' },
          { prop: 'used / limit', type: 'number', description: 'Current usage and the ceiling.' },
          { prop: 'window', type: 'string', description: 'minute, day, concurrent…' },
          { prop: 'resetIn', type: 'string', description: 'Human countdown, e.g. 14s.' },
        ],
      },
    ],
  },
  {
    id: 'approval-queue',
    name: 'ApprovalQueue',
    category: 'Operations',
    tagline: 'Every run blocked on a person, in one inbox.',
    description:
      'Pending approvals across all runs with multi-select and bulk approve or reject, filtered by risk — the screen that makes human-in-the-loop workable at more than one run a day.',
    status: 'new',
    file: 'components/agent-ops/approval-queue.tsx',
    primitives: ['card', 'badge', 'button', 'table'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<ApprovalQueue
  approvals={approvals}
  onApprove={(selected) => approve(selected.map((a) => a.id))}
  onReject={(selected) => reject(selected.map((a) => a.id))}
/>`,
    anatomy: `import { ApprovalQueue } from '@/components/agent-ops/approval-queue';

// PendingApproval: id, action, tool, risk, runId, workflow, requestedAt, expiresIn?
<ApprovalQueue approvals={approvals} onApprove={approve} onReject={reject} />`,
    examples: [{ label: 'Four runs blocked on people', code: `<ApprovalQueue approvals={approvals} onApprove={approve} />` }],
    api: [
      {
        title: 'ApprovalQueue · PendingApproval',
        description: 'Bulk actions receive the selected approvals.',
        rows: [
          { prop: 'approvals', type: 'PendingApproval[]', description: 'id, action, tool, risk, runId, workflow, requestedAt, expiresIn?' },
          { prop: 'onApprove / onReject', type: '(approvals: PendingApproval[]) => void', description: 'Called with the selection.' },
        ],
      },
    ],
  },
  {
    id: 'run-queue',
    name: 'RunQueue',
    category: 'Operations',
    tagline: 'What is waiting to run, in what order.',
    description:
      'Queued runs with priority, wait time and what they are blocked on, alongside worker utilisation and a pause for the whole queue — the back-pressure view.',
    status: 'new',
    file: 'components/agent-ops/run-queue.tsx',
    primitives: ['card', 'badge', 'button', 'progress'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<RunQueue
  runs={queued}
  running={3}
  concurrency={4}
  paused={paused}
  onTogglePause={toggle}
  onPromote={(run) => promote(run.id)}
  onRemove={(run) => remove(run.id)}
/>`,
    anatomy: `import { RunQueue } from '@/components/agent-ops/run-queue';

// QueuedRun: id, workflow, priority, queuedFor, trigger?, waitingOn?
<RunQueue runs={queued} running={3} concurrency={4} onPromote={promote} />`,
    examples: [
      { label: 'Three of four workers busy', code: `<RunQueue runs={queued} running={3} concurrency={4} />` },
      { label: 'Paused', code: `<RunQueue runs={queued} running={0} concurrency={4} paused />` },
    ],
    api: [
      {
        title: 'RunQueue · QueuedRun',
        description: 'Order in the array is queue order; promote is your chance to change it.',
        rows: [
          { prop: 'runs', type: 'QueuedRun[]', description: 'id, workflow, priority, queuedFor, trigger?, waitingOn?' },
          { prop: 'running / concurrency', type: 'number', description: 'Drives the utilisation bar.' },
          { prop: 'paused / onTogglePause', type: 'boolean · () => void', description: 'Pauses the whole queue.' },
          { prop: 'onPromote / onRemove', type: '(run) => void', description: 'Per-row actions.' },
        ],
      },
    ],
  },
  {
    id: 'schedule-list',
    name: 'ScheduleList',
    category: 'Operations',
    tagline: 'The cron jobs behind the workflows, with last night’s outcome.',
    description:
      'Cron expression and a human reading of it, the next run in local time, and how the last run actually ended — the detail that decides whether a schedule is trustworthy.',
    status: 'new',
    file: 'components/agent-ops/schedule-list.tsx',
    primitives: ['card', 'badge', 'button', 'table'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<ScheduleList
  schedules={schedules}
  onToggle={(schedule) => setEnabled(schedule.id, !schedule.enabled)}
  onEdit={(schedule) => openEditor(schedule)}
/>`,
    anatomy: `import { ScheduleList } from '@/components/agent-ops/schedule-list';

// Schedule: id, workflow, cron, humanReading, timezone?, nextRun, lastRun?, enabled
<ScheduleList schedules={schedules} onToggle={toggle} />`,
    examples: [{ label: 'A failed nightly and a paused weekly', code: `<ScheduleList schedules={schedules} onToggle={toggle} />` }],
    api: [
      {
        title: 'ScheduleList · Schedule',
        description: 'Cron is rendered as code; the human reading sits next to it.',
        rows: [
          { prop: 'workflow / cron / humanReading', type: 'string', description: 'What runs and when.' },
          { prop: 'nextRun / timezone?', type: 'string', description: 'e.g. in 15h 32m · Asia/Kuala_Lumpur.' },
          { prop: 'lastRun', type: "{ at: string, status: 'succeeded' | 'failed' | 'cancelled' }", description: 'Rendered as a badge.' },
          { prop: 'enabled / onToggle / onEdit', type: 'boolean · callbacks', description: 'Enable and edit actions.' },
        ],
      },
    ],
  },
  {
    id: 'webhooks',
    name: 'WebhookList',
    category: 'Operations',
    tagline: 'The way work arrives, and whether your endpoint is answering.',
    description:
      'Endpoints with their subscribed events, the last delivery with its status code and duration, a success rate, and a replay for the delivery you need to send again.',
    status: 'new',
    file: 'components/agent-ops/webhook-list.tsx',
    primitives: ['card', 'badge', 'button', 'table'],
    deps: ['lucide-react'],
    wide: true,
    usage: `<WebhookList
  endpoints={endpoints}
  onSendTest={(endpoint) => sendTest(endpoint.id)}
  onReplay={(endpoint) => replay(endpoint.id)}
  onToggle={(endpoint) => setEnabled(endpoint.id, !endpoint.enabled)}
/>`,
    anatomy: `import { WebhookList } from '@/components/agent-ops/webhook-list';

// WebhookEndpoint: id, url, events, enabled, successRate?, lastDelivery?
<WebhookList endpoints={endpoints} onReplay={replay} />`,
    examples: [
      { label: 'A failing endpoint next to a healthy one', code: `<WebhookList endpoints={endpoints} onReplay={replay} />` },
      { label: 'Healthy endpoints only', code: `<WebhookList endpoints={endpoints.filter((e) => (e.successRate ?? 0) > 90)} />` },
    ],
    api: [
      {
        title: 'WebhookList · WebhookEndpoint',
        description: 'URLs render as plain text, never as links.',
        rows: [
          { prop: 'url', type: 'string', description: 'The endpoint that receives the events.' },
          { prop: 'events', type: 'string[]', description: 'Subscribed event names, shown as badges.' },
          { prop: 'lastDelivery', type: "{ at, status: 'delivered' | 'failed' | 'pending', code?, ms? }", description: 'The last attempt.' },
          { prop: 'successRate', type: 'number', description: 'Percentage, 0–100.' },
          { prop: 'onSendTest / onReplay / onToggle', type: '(endpoint) => void', description: 'Endpoint actions.' },
        ],
      },
    ],
  },
];
