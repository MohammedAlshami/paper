'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusMark, type Mark } from '@/components/internal/status-mark';
import { cn } from '@/lib/utils';

export interface GraphNode {
  id: string;
  name: string;
  type: 'agent' | 'llm' | 'tool' | 'human' | 'subworkflow';
  status: 'queued' | 'running' | 'done' | 'waiting' | 'failed' | 'skipped';
  meta?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
  /** Renders a dashed-less dotted-free hint: true when the edge was not taken. */
  conditional?: boolean;
}

const markFor: Record<GraphNode['status'], Mark> = {
  queued: 'queued',
  running: 'running',
  done: 'done',
  waiting: 'waiting',
  failed: 'failed',
  skipped: 'skipped',
};

const NODE_W = 168;
const NODE_H = 56;
const COL = 200;
const ROW = 80;

function layout(nodes: GraphNode[], edges: GraphEdge[]) {
  const incoming = new Map<string, string[]>();
  edges.forEach((edge) => incoming.set(edge.to, [...(incoming.get(edge.to) ?? []), edge.from]));

  const depth = new Map<string, number>();
  const resolve = (id: string, seen: Set<string> = new Set()): number => {
    const cached = depth.get(id);
    if (cached !== undefined) return cached;
    if (seen.has(id)) return 0;
    seen.add(id);
    const parents = incoming.get(id) ?? [];
    const value = parents.length ? Math.max(...parents.map((parent) => resolve(parent, seen) + 1)) : 0;
    depth.set(id, value);
    return value;
  };
  nodes.forEach((node) => resolve(node.id));

  const counters = new Map<number, number>();
  const positions = new Map<string, { x: number; y: number }>();
  nodes.forEach((node) => {
    const column = depth.get(node.id) ?? 0;
    const row = counters.get(column) ?? 0;
    counters.set(column, row + 1);
    positions.set(node.id, { x: column * COL, y: row * ROW });
  });

  return {
    positions,
    width: (Math.max(0, ...depth.values()) + 1) * COL - (COL - NODE_W),
    height: Math.max(1, ...counters.values()) * ROW - (ROW - NODE_H),
  };
}

/** WorkflowGraph — the workflow as a graph, with live state on every node. */
export function WorkflowGraph({
  nodes,
  edges,
  onSelectNode,
  className,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode?: (node: GraphNode) => void;
  className?: string;
}) {
  const { positions, width, height } = React.useMemo(() => layout(nodes, edges), [nodes, edges]);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <CardHeader className="flex-row items-center justify-between gap-3 py-4">
        <CardTitle className="text-sm font-medium">Workflow graph</CardTitle>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {nodes.length} nodes · {edges.length} edges
        </span>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto border-t px-6 py-6">
          <div className="relative" style={{ width, height, minWidth: NODE_W, minHeight: NODE_H }}>
            <svg className="absolute inset-0" width={width} height={height} aria-hidden>
              <defs>
                <marker id="graph-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
                  <path d="M0 0 L8 4 L0 8 z" fill="var(--border-strong, var(--color-border))" />
                </marker>
              </defs>
              {edges.map((edge) => {
                const from = positions.get(edge.from);
                const to = positions.get(edge.to);
                if (!from || !to) return null;
                const x1 = from.x + NODE_W;
                const y1 = from.y + NODE_H / 2;
                const x2 = to.x;
                const y2 = to.y + NODE_H / 2;
                const mid = (x1 + x2) / 2;
                return (
                  <path
                    key={`${edge.from}-${edge.to}`}
                    d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke="var(--color-border)"
                    strokeWidth="1.5"
                    markerEnd="url(#graph-arrow)"
                    opacity={edge.conditional ? 0.5 : 1}
                  />
                );
              })}
            </svg>

            {nodes.map((node) => {
              const position = positions.get(node.id)!;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => onSelectNode?.(node)}
                  style={{ left: position.x, top: position.y, width: NODE_W, height: NODE_H }}
                  className={cn(
                    'absolute flex flex-col justify-center gap-1 rounded-lg border bg-card px-3 text-left transition-colors hover:border-input',
                    node.status === 'running' && 'border-input',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <StatusMark state={markFor[node.status]} />
                    <span className="truncate text-sm font-medium">{node.name}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">
                      {node.type}
                    </Badge>
                    {node.meta ? (
                      <span className="truncate font-mono text-[10px] text-muted-foreground">{node.meta}</span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
