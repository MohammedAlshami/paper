'use client';

import * as React from 'react';
import {
  Check,
  ChevronRight,
  KeyRound,
  Plus,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  Unplug,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/internal/badge';
import { Button } from '@/components/internal/button';
import { Eyebrow } from '@/components/internal/eyebrow';

export type McpTransport = 'http' | 'sse' | 'stdio';
export type McpAuth = 'none' | 'oauth' | 'apiKey';
export type McpStatus = 'connected' | 'needs-auth' | 'error' | 'disconnected';

export interface McpTool {
  name: string;
  description?: string;
  /** Whether the agent is allowed to call this tool. */
  allowed?: boolean;
  /** Read-only tools can't be toggled off by mistake. */
  readOnly?: boolean;
}

export interface McpServer {
  id: string;
  name: string;
  url: string;
  description?: string;
  transport?: McpTransport;
  auth?: McpAuth;
  status: McpStatus;
  tools?: McpTool[];
  error?: string;
}

const statusBadge: Record<McpStatus, { tone: 'default' | 'ink' | 'accent' | 'faint' | 'danger'; label: string }> = {
  connected: { tone: 'ink', label: 'connected' },
  'needs-auth': { tone: 'accent', label: 'needs auth' },
  error: { tone: 'danger', label: 'error' },
  disconnected: { tone: 'faint', label: 'disconnected' },
};

/**
 * MCP catalogue — the surface for adding, authenticating and consenting to
 * Model Context Protocol servers the agent can use. Nobody ships this as a
 * copy-paste component.
 */
export function MCPCatalog({
  servers,
  onConnect,
  onDisconnect,
  onAdd,
  className,
}: {
  servers: McpServer[];
  onConnect?: (server: McpServer) => void;
  onDisconnect?: (server: McpServer) => void;
  onAdd?: () => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState<string | null>(servers[0]?.id ?? null);
  const [allowed, setAllowed] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const server of servers) {
      for (const tool of server.tools ?? []) {
        initial[`${server.id}:${tool.name}`] = tool.allowed ?? true;
      }
    }
    return initial;
  });

  const totalTools = servers.reduce((n, s) => n + (s.tools?.length ?? 0), 0);
  const allowedCount = Object.values(allowed).filter(Boolean).length;

  return (
    <section
      className={cn('rounded-paper-lg border border-dashed border-line bg-raised', className)}
      aria-label="MCP servers"
    >
      <header className="flex flex-wrap items-end justify-between gap-3 p-6 pb-0">
        <div>
          <Eyebrow className="mb-2">MCP servers</Eyebrow>
          <h3 className="font-display text-lg font-bold tracking-tight text-ink">
            {servers.length} servers · {allowedCount} of {totalTools} tools allowed
          </h3>
        </div>
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Plus className="size-3.5" /> Add server
        </Button>
      </header>

      <ul className="mt-5 divide-y divide-dashed divide-line border-t border-dashed border-line">
        {servers.map((server) => {
          const isOpen = open === server.id;
          const badge = statusBadge[server.status];
          return (
            <li key={server.id}>
              <div className="flex flex-wrap items-center gap-3 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : server.id)}
                  aria-expanded={isOpen}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <ChevronRight
                    aria-hidden
                    className={cn('size-4 shrink-0 text-ink-faint transition-transform', isOpen && 'rotate-90')}
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-ink">{server.name}</span>
                      <Badge tone={badge.tone}>{badge.label}</Badge>
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[11px] text-ink-faint">
                      {server.url}
                      {server.transport ? ` · ${server.transport}` : ''}
                      {server.tools ? ` · ${server.tools.length} tools` : ''}
                    </span>
                  </span>
                </button>

                <div className="flex shrink-0 items-center gap-2">
                  {server.auth === 'oauth' ? (
                    <Badge tone="faint">
                      <ShieldCheck className="size-3" /> oauth
                    </Badge>
                  ) : server.auth === 'apiKey' ? (
                    <Badge tone="faint">
                      <KeyRound className="size-3" /> api key
                    </Badge>
                  ) : null}

                  {server.status === 'connected' ? (
                    <Button size="sm" variant="ghost" onClick={() => onDisconnect?.(server)}>
                      <Unplug className="size-3.5" /> Disconnect
                    </Button>
                  ) : server.status === 'error' ? (
                    <Button size="sm" variant="outline" onClick={() => onConnect?.(server)}>
                      <RefreshCw className="size-3.5" /> Retry
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => onConnect?.(server)}>
                      <Check className="size-3.5" /> Connect
                    </Button>
                  )}
                </div>
              </div>

              {server.error ? (
                <p className="mx-6 mb-4 flex items-start gap-2 rounded-paper border border-dashed border-danger/40 bg-danger-soft p-3 text-sm text-danger">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {server.error}
                </p>
              ) : null}

              {isOpen ? (
                <div className="px-6 pb-5 pl-[3.4rem]">
                  {server.description ? (
                    <p className="mb-4 max-w-2xl text-sm leading-relaxed text-ink-muted">{server.description}</p>
                  ) : null}

                  {server.status === 'needs-auth' ? (
                    <p className="mb-4 rounded-paper border border-dashed border-line bg-sunk/50 p-3 text-sm text-ink-muted">
                      Connecting opens <span className="font-mono text-[12px] text-ink">{server.url}</span> so you can
                      sign in. The agent only receives the tools you allow below.
                    </p>
                  ) : null}

                  <ul className="divide-y divide-dashed divide-line rounded-paper border border-dashed border-line">
                    {(server.tools ?? []).map((tool) => {
                      const key = `${server.id}:${tool.name}`;
                      const on = allowed[key] ?? true;
                      return (
                        <li key={tool.name} className="flex items-start gap-3 p-3.5">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={on}
                            aria-label={`Allow ${tool.name}`}
                            disabled={tool.readOnly}
                            onClick={() => setAllowed((prev) => ({ ...prev, [key]: !on }))}
                            className={cn(
                              'mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-colors',
                              on ? 'border-ink bg-ink' : 'border-line-strong bg-sunk',
                              tool.readOnly && 'opacity-45',
                            )}
                          >
                            <span
                              className={cn(
                                'block size-3.5 translate-y-px rounded-full bg-raised transition-transform',
                                on ? 'translate-x-[1.15rem]' : 'translate-x-0.5',
                              )}
                            />
                          </button>
                          <span className="min-w-0">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-[12.5px] text-ink">{tool.name}</span>
                              {tool.readOnly ? <Badge tone="faint">read-only</Badge> : null}
                            </span>
                            {tool.description ? (
                              <span className="mt-1 block text-sm leading-relaxed text-ink-muted">
                                {tool.description}
                              </span>
                            ) : null}
                          </span>
                        </li>
                      );
                    })}
                    {!server.tools?.length ? (
                      <li className="p-4 text-sm text-ink-faint">
                        No tools discovered yet — connect the server to list them.
                      </li>
                    ) : null}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <footer className="flex flex-wrap items-center gap-2 border-t border-dashed border-line p-6 py-4">
        <span className="mr-auto text-xs text-ink-faint">
          Tools are granted per server; nothing is exposed by default.
        </span>
        <Button size="sm" variant="ghost">
          Review permissions
        </Button>
      </footer>
    </section>
  );
}
