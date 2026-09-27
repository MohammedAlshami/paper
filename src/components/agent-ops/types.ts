/** Shared model for the agent-ops set. Every component speaks this language. */

export type StepType = 'agent' | 'llm' | 'tool' | 'human' | 'subworkflow';
export type StepStatus = 'queued' | 'running' | 'done' | 'waiting' | 'failed' | 'skipped';
export type RunStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'paused' | 'waiting' | 'cancelled';
export type Trigger = 'manual' | 'schedule' | 'webhook' | 'api';

export interface RunStep {
  id: string;
  name: string;
  type: StepType;
  status: StepStatus;
  startedAt?: string;
  durationMs?: number;
  tokens?: number;
  cost?: number;
  /** 1 = first try; >1 means it was retried. */
  attempt?: number;
  input?: string;
  output?: string;
  error?: string;
  /** Short line shown under the name, e.g. "5 results · 84ms". */
  meta?: string;
}

export interface Run {
  id: string;
  workflow: string;
  workflowVersion?: string;
  status: RunStatus;
  trigger?: Trigger;
  actor?: string;
  startedAt?: string;
  elapsed?: string;
  heartbeat?: string;
  checkpoint?: string;
  tokens?: number;
  cost?: number;
  stepsDone?: number;
  steps: RunStep[];
  parentRunId?: string;
  forkedFromStep?: string;
}

export interface RunEvent {
  id: string;
  ts: string;
  level: 'info' | 'warn' | 'error';
  type: string;
  message: string;
  stepId?: string;
}

export interface RunSummary {
  id: string;
  workflow: string;
  status: RunStatus;
  trigger?: Trigger;
  actor?: string;
  startedAt?: string;
  durationMs?: number;
  cost?: number;
  stepsDone?: number;
  stepsTotal?: number;
}

export interface Kpi {
  label: string;
  value: string;
  hint?: string;
  delta?: string;
}

export interface TrendPoint {
  label: string;
  value: number;
  failed?: boolean;
}

export const stepCount = (run: Run) => ({
  done: run.steps.filter((s) => s.status === 'done').length,
  total: run.steps.length,
});
