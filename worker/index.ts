import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';

/**
 * Paper as an MCP server, at /mcp. Stateless: a fresh server and transport per request, no sessions, no auth.
 * Everything it serves is public and static: the tools read the files that `npm run build:mcp` writes into
 * /mcp-data, through the assets binding. Every other path falls through to the docs site.
 */

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

interface ComponentInfo {
  id: string;
  name: string;
  family: 'maps' | 'fleet' | 'app';
  category: string;
  tagline: string;
  description: string;
  file: string;
  primitives: string[];
  deps: string[];
  files: string[];
  uiFiles: string[];
  wide: boolean;
  props: string[];
}
interface TemplateInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  families: string[];
  pages: { path: string; label: string; description: string; components: string[]; example?: string }[];
  componentIds: string[];
  files: string[];
}
interface Index {
  site: string;
  components: ComponentInfo[];
  templates: TemplateInfo[];
}

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] });
const json = (value: unknown) => text(JSON.stringify(value, null, 2));
const fail = (message: string) => ({ isError: true, content: [{ type: 'text' as const, text: message }] });

let indexCache: Promise<Index> | undefined;

function createServer(env: Env, origin: string) {
  const fetchAsset = async (path: string) => {
    const response = await env.ASSETS.fetch(new Request(`${origin}/mcp-data/${path}`));
    if (!response.ok || (response.headers.get('content-type') ?? '').includes('text/html')) return null;
    return response.text();
  };
  const getIndex = () => (indexCache ??= fetchAsset('index.json').then((raw) => {
    if (!raw) throw new Error('index.json missing');
    return JSON.parse(raw) as Index;
  }));
  const sourceOf = (file: string) => fetchAsset(`src/${file}.txt`);

  const server = new McpServer({ name: 'paper', version: '1.0.0' }, {
    instructions:
      'Paper is a copy-paste React component library: maps, fleet operations and app building blocks, plus full templates. ' +
      'Call get_guidelines first, then search_components or list_components, get_component for the API and source, and get_install_plan for the files, packages and shadcn primitives to copy. ' +
      'Components are copied into the project, not installed. Build screens only from these components; if something is missing, add it as a component first.',
  });

  server.registerTool('get_guidelines', {
    title: 'Get design guidelines',
    description: 'How the library works and how to compose with it: the stack, the three families, the design theme (pink #ec4899, hairline borders, mono numerals), token names and composition rules. Read this before building anything.',
    inputSchema: {},
  }, async () => text((await fetchAsset('guidelines.md')) ?? 'Guidelines are unavailable.'));

  server.registerTool('list_components', {
    title: 'List components',
    description: 'Every component with id, name, family (maps, fleet or app), category and a one-line description. Filter by family or category.',
    inputSchema: {
      family: z.enum(['maps', 'fleet', 'app']).optional().describe('Only this family'),
      category: z.string().optional().describe('Only this category, e.g. "Work orders and repairs" (case-insensitive substring)'),
    },
  }, async ({ family, category }) => {
    const { components } = await getIndex();
    const rows = components
      .filter((c) => (!family || c.family === family) && (!category || c.category.toLowerCase().includes(category.toLowerCase())))
      .map((c) => ({ id: c.id, name: c.name, family: c.family, category: c.category, tagline: c.tagline }));
    return json({ count: rows.length, components: rows });
  });

  server.registerTool('search_components', {
    title: 'Search components',
    description: 'Find components by what you need, e.g. "kanban board", "invoice table", "vehicle tyre wear", "login form". Ranks by name, tagline, description, category and props.',
    inputSchema: {
      query: z.string().describe('What you are looking for'),
      limit: z.number().int().min(1).max(30).optional().describe('Max results (default 8)'),
    },
  }, async ({ query, limit = 8 }) => {
    const { components } = await getIndex();
    const words = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const scored = components
      .map((c) => {
        const name = `${c.id} ${c.name}`.toLowerCase();
        const rest = `${c.tagline} ${c.description} ${c.category}`.toLowerCase();
        const props = c.props.join(' ').toLowerCase();
        const score = words.reduce((sum, w) => sum + (name.includes(w) ? 5 : 0) + (c.tagline.toLowerCase().includes(w) ? 3 : 0) + (rest.includes(w) ? 1 : 0) + (props.includes(w) ? 0.5 : 0), 0);
        return { c, score };
      })
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ c }) => ({ id: c.id, name: c.name, family: c.family, category: c.category, tagline: c.tagline }));
    return json({ query, results: scored });
  });

  server.registerTool('get_component', {
    title: 'Get a component',
    description: 'The full doc for one component as markdown: description, installation, usage, anatomy, examples, the API reference table and the complete source.',
    inputSchema: { id: z.string().describe('Component id, e.g. "work-order-board" (see list_components)') },
  }, async ({ id }) => {
    const doc = await fetchAsset(`components/${id}.md`);
    return doc ? text(doc) : fail(`No component "${id}". Use search_components or list_components.`);
  });

  server.registerTool('get_source', {
    title: 'Get a source file',
    description: 'The source of any file in the library, by path relative to src/: a component, a shared kit (components/fleet/fleet-kit.ts), a shadcn primitive (components/ui/button.tsx), lib/utils.ts, or a template file (templates/garage/pages/dashboard.tsx).',
    inputSchema: { path: z.string().describe('Path relative to src/, e.g. "components/ui/button.tsx"') },
  }, async ({ path }) => {
    if (path.includes('..')) return fail('Invalid path.');
    const source = await sourceOf(path.replace(/^\/?(src\/)?/, ''));
    return source ? text(source) : fail(`No file "${path}". Paths are relative to src/ and include the extension.`);
  });

  server.registerTool('get_install_plan', {
    title: 'Plan an install',
    description: 'For one or more components: the shadcn/ui primitives to add, the npm packages to install, and every file to copy (each component, the components it imports, its shared kit, and the ui primitive files). Use this before copying anything into a project.',
    inputSchema: { ids: z.array(z.string()).min(1).max(40).describe('Component ids') },
  }, async ({ ids }) => {
    const { components } = await getIndex();
    const picked = ids.map((id) => components.find((c) => c.id === id));
    const missing = ids.filter((_, i) => !picked[i]);
    if (missing.length) return fail(`Unknown component id(s): ${missing.join(', ')}.`);
    const list = picked as ComponentInfo[];
    const primitives = Array.from(new Set(list.flatMap((c) => c.primitives))).sort();
    const deps = Array.from(new Set(['lucide-react', 'clsx', 'tailwind-merge', ...list.flatMap((c) => c.deps)])).sort();
    const files = Array.from(new Set(list.flatMap((c) => c.files))).sort();
    return json({
      shadcn: `pnpm dlx shadcn@latest add ${primitives.join(' ')}`,
      install: `pnpm add ${deps.join(' ')}`,
      copy: files.map((f) => `src/${f}`),
      alsoNeeded: ['src/lib/utils.ts (the cn helper)', ...(list.some((c) => c.family === 'maps') ? ['MapLibre worker setup in map-kit.tsx (Vite: ?worker&url)'] : [])],
      note: 'Fetch each file with get_source (or get_component for docs plus source). Components are copied, not installed.',
    });
  });

  server.registerTool('list_templates', {
    title: 'List templates',
    description: 'The full templates: whole sub-projects built only from the components, with their pages. Courier (maps), Garage (fleet), Ledger (SaaS), Harbor (retail back-office).',
    inputSchema: {},
  }, async () => {
    const { templates, site } = await getIndex();
    return json(templates.map((t) => ({ id: t.id, name: t.name, tagline: t.tagline, families: t.families, pages: t.pages.length, components: t.componentIds.length, live: `${site}/t/${t.id}` })));
  });

  server.registerTool('get_template', {
    title: 'Get a template',
    description: 'One template as markdown: its pages with the components each uses, and the list of its files (read them with get_source).',
    inputSchema: { id: z.string().describe('Template id: courier, garage, ledger or harbor') },
  }, async ({ id }) => {
    const doc = await fetchAsset(`templates/${id}.md`);
    return doc ? text(doc) : fail(`No template "${id}". Use list_templates.`);
  });

  return server;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== '/mcp') return env.ASSETS.fetch(request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS', 'access-control-allow-headers': '*', 'access-control-expose-headers': 'mcp-session-id' } });
    }
    // A browser opening /mcp gets the setup page instead of a protocol error.
    if (request.method === 'GET' && (request.headers.get('accept') ?? '').includes('text/html')) {
      return Response.redirect(`${url.origin}/mcp/doc`, 302);
    }

    const server = createServer(env, url.origin);
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    await server.connect(transport);
    const response = await transport.handleRequest(await withArguments(request));
    const headers = new Headers(response.headers);
    headers.set('access-control-allow-origin', '*');
    headers.set('access-control-expose-headers', 'mcp-session-id');
    return new Response(response.body, { status: response.status, headers });
  },
};

/**
 * Some clients leave "arguments" out entirely when a tool takes none (the spec allows it), and the SDK's
 * validation then rejects the call. Fill in an empty object for tools/call before the transport sees it.
 */
async function withArguments(request: Request): Promise<Request> {
  if (request.method !== 'POST') return request;
  const raw = await request.clone().text();
  if (!raw) return request;
  try {
    const body = JSON.parse(raw) as { method?: string; params?: { arguments?: unknown } } | { method?: string; params?: { arguments?: unknown } }[];
    const messages = Array.isArray(body) ? body : [body];
    let changed = false;
    for (const message of messages) {
      if (message?.method === 'tools/call' && message.params && message.params.arguments == null) {
        message.params.arguments = {};
        changed = true;
      }
    }
    return changed ? new Request(request, { body: JSON.stringify(body) }) : request;
  } catch {
    return request;
  }
}
