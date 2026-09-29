// Builds everything the MCP server and other AI agents read, from the same registry the docs use:
//   docs/components/<id>.md            one markdown doc per component (also committed)
//   public/mcp-data/index.json         components and templates, with the files to copy for each
//   public/mcp-data/components/<id>.md the same docs, served as static files
//   public/mcp-data/templates/<id>.md  one overview per template
//   public/mcp-data/src/<path>.txt     the source of every component, ui primitive and template file
//   public/mcp-data/guidelines.md, public/llms.txt
// Run by `npm run build:mcp` (and by build/deploy).
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const OUT = path.join(ROOT, 'public/mcp-data');
const TMP = path.join(ROOT, '.mcp-tmp');
const SITE = process.env.SITE_URL ?? 'https://paper.mshami2021.workers.dev';
const require = createRequire(import.meta.url);

rmSync(OUT, { recursive: true, force: true });
rmSync(TMP, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

/** Bundle a TS module for Node, stubbing css, ?query imports and template entry points so nothing heavy loads. */
async function load(entry, name) {
  const outfile = path.join(TMP, `${name}.cjs`);
  await build({
    entryPoints: [path.join(ROOT, entry)],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile,
    packages: 'external',
    logLevel: 'error',
    tsconfig: path.join(ROOT, 'tsconfig.json'),
    plugins: [
      {
        name: 'stubs',
        setup(b) {
          b.onResolve({ filter: /\.css$|\?/ }, (args) => ({ path: args.path, namespace: 'stub' }));
          b.onResolve({ filter: /^\.\/(courier|garage|ledger|harbor)$/ }, (args) => ({ path: args.path, namespace: 'stub' }));
          b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'module.exports = {}', loader: 'js' }));
        },
      },
    ],
  });
  return require(outfile);
}

const { COMPONENTS } = await load('src/docs/registry.ts', 'registry');
const { TEMPLATES } = await load('src/templates/registry.ts', 'templates');

const read = (rel) => readFileSync(path.join(ROOT, 'src', rel), 'utf8');
const exists = (rel) => existsSync(path.join(ROOT, 'src', rel));

/** Files a source file imports from its own folder or from ui, transitively, as paths relative to src/. */
function localFiles(file, seen = new Set()) {
  const folder = path.posix.dirname(file);
  const source = read(file);
  const found = [];
  for (const match of source.matchAll(/from '\.\/([\w-]+)'/g)) {
    const candidate = ['tsx', 'ts'].map((ext) => `${folder}/${match[1]}.${ext}`).find(exists);
    if (candidate && !seen.has(candidate)) {
      seen.add(candidate);
      found.push(candidate, ...localFiles(candidate, seen));
    }
  }
  return found;
}
const uiFiles = (file) => Array.from(new Set(Array.from(read(file).matchAll(/from '@\/components\/ui\/([\w-]+)'/g), (m) => `components/ui/${m[1]}.tsx`)));
const family = (file) => (file.startsWith('components/maps/') ? 'maps' : file.startsWith('components/fleet/') ? 'fleet' : 'app');

function apiTable(section) {
  const header = '| Prop | Type | Default | Description |\n| --- | --- | --- | --- |';
  const rows = section.rows.map((row) => `| \`${row.prop}\` | \`${row.type.replace(/\|/g, '\\|')}\` | ${row.default ? '`' + row.default + '`' : '—'} | ${row.description.replace(/\|/g, '\\|')} |`).join('\n');
  return `#### ${section.title}\n\n${section.description ? section.description + '\n\n' : ''}${header}\n${rows}`;
}

const kitNote = {
  maps: '\n\nThis component imports the shared map helpers from `src/components/maps/map-kit.tsx`. Copy that file once; every map component uses it. MapLibre needs a web worker set up in your bundler, which `map-kit.tsx` does for Vite (`?worker&url`).',
  fleet: '\n\nThis component imports shared helpers from `src/components/fleet/fleet-kit.ts`. Copy that file once next to it.',
  app: '\n\nThis component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.',
};

mkdirSync(path.join(ROOT, 'docs/components'), { recursive: true });
mkdirSync(path.join(OUT, 'components'), { recursive: true });

const components = [];
for (const entry of COMPONENTS) {
  const source = read(entry.file).trimEnd();
  const fam = family(entry.file);
  const local = localFiles(entry.file);
  const kit = fam === 'maps' ? 'map-kit.tsx' : fam === 'fleet' ? 'fleet-kit.ts' : 'app-kit.ts';
  const kitFile = `components/${fam}/${kit}`;
  const files = Array.from(new Set([entry.file, ...local, ...(exists(kitFile) && kitFile !== entry.file && read(entry.file).includes(`'./${kit.replace(/\.tsx?$/, '')}'`) ? [kitFile] : [])]));
  const ui = Array.from(new Set([entry.file, ...local].flatMap(uiFiles)));
  const examples = entry.examples.map((example) => `### ${example.label}\n\n\`\`\`tsx\n${example.code}\n\`\`\``).join('\n\n');

  const md = `# ${entry.name}

${entry.tagline}

${entry.description}

**Category:** ${entry.category} · **Family:** ${fam} · **Status:** ${entry.status}

## Installation

\`\`\`bash
pnpm dlx shadcn@latest add ${entry.primitives.join(' ')}
\`\`\`
${entry.deps.length ? `\nAnd the packages the file imports: \`${entry.deps.join(' ')}\`\n` : ''}
Copy the file below into \`src/${entry.file}\` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.${kitNote[fam].startsWith('\n') && (fam !== 'maps' || true) ? kitNote[fam] : ''}

Files to copy: ${files.map((f) => `\`src/${f}\``).join(', ')}

## Usage

\`\`\`tsx
${entry.usage}
\`\`\`

## Anatomy

\`\`\`tsx
${entry.anatomy}
\`\`\`

## Examples

${examples}

## API reference

${entry.api.map(apiTable).join('\n\n')}

## Source

\`src/${entry.file}\`

\`\`\`tsx
${source}
\`\`\`
`;
  writeFileSync(path.join(ROOT, 'docs/components', `${entry.id}.md`), md);
  writeFileSync(path.join(OUT, 'components', `${entry.id}.md`), md);
  components.push({
    id: entry.id, name: entry.name, family: fam, category: entry.category, tagline: entry.tagline, description: entry.description,
    file: entry.file, primitives: entry.primitives, deps: entry.deps, files, uiFiles: ui, wide: Boolean(entry.wide),
    props: entry.api.flatMap((section) => section.rows.map((row) => row.prop)),
  });
}

// ---- sources: components, ui primitives, lib, templates
const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const full = path.join(dir, name);
  return statSync(full).isDirectory() ? walk(full) : /\.(tsx?|css)$/.test(name) ? [full] : [];
});
const sourceFiles = ['components', 'lib', 'templates'].flatMap((d) => walk(path.join(ROOT, 'src', d))).map((f) => path.relative(path.join(ROOT, 'src'), f));
for (const file of sourceFiles) {
  const dest = path.join(OUT, 'src', `${file}.txt`);
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, readFileSync(path.join(ROOT, 'src', file), 'utf8'));
}

// ---- templates
mkdirSync(path.join(OUT, 'templates'), { recursive: true });
const templates = TEMPLATES.map((template) => {
  const files = sourceFiles.filter((f) => f.startsWith(`templates/${template.id}/`));
  const componentIds = Array.from(new Set(template.pages.flatMap((page) => page.components)));
  const md = `# ${template.name} template

${template.tagline}

${template.description}

Families: ${template.families.join(', ')} · ${template.pages.length} pages · ${componentIds.length} components · live at ${SITE}/t/${template.id}

## Pages

${template.pages.map((page) => `- \`${page.path}\` **${page.label}** — ${page.description}\n  Components: ${page.components.map((c) => `\`${c}\``).join(', ')}`).join('\n')}

## Files

${files.map((f) => `- \`src/${f}\``).join('\n')}

Every piece of UI in the template comes from \`src/components\`. To use it, copy the components its pages list (see get_install_plan), then the \`src/templates/${template.id}\` folder, and replace the demo data.
`;
  writeFileSync(path.join(OUT, 'templates', `${template.id}.md`), md);
  return { id: template.id, name: template.name, tagline: template.tagline, description: template.description, families: template.families, pages: template.pages, componentIds, files };
});

cpSync(path.join(ROOT, 'scripts/mcp-guidelines.md'), path.join(OUT, 'guidelines.md'));
writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({ site: SITE, components, templates, generatedAt: new Date().toISOString() }));

// ---- llms.txt for agents that read plain files
const byCategory = new Map();
for (const c of components) byCategory.set(c.category, [...(byCategory.get(c.category) ?? []), c]);
writeFileSync(path.join(ROOT, 'public/llms.txt'), `# Paper

> Copy-paste React components (maps, fleet operations, app building blocks) and four full templates. Built on shadcn/ui, Tailwind v4, MapLibre and Recharts. No npm package: you copy the files.

MCP server: ${SITE}/mcp (streamable HTTP, no auth). Setup: ${SITE}/mcp/doc
Design guidelines: ${SITE}/mcp-data/guidelines.md

## Templates
${templates.map((t) => `- [${t.name}](${SITE}/mcp-data/templates/${t.id}.md): ${t.tagline}`).join('\n')}

${Array.from(byCategory, ([category, list]) => `## ${category}\n${list.map((c) => `- [${c.name}](${SITE}/mcp-data/components/${c.id}.md): ${c.tagline}`).join('\n')}`).join('\n\n')}
`);

rmSync(TMP, { recursive: true, force: true });
console.log(`mcp data: ${components.length} components, ${templates.length} templates, ${sourceFiles.length} source files`);
