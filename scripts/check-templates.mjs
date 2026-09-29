// Templates may only be assembled from components in src/components. This checks each template file for
// imports from anywhere else and for raw interactive HTML elements that should be a component instead.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = new URL('../src/templates', import.meta.url).pathname;
const RAW = ['button', 'input', 'select', 'textarea', 'table', 'form', 'dialog', 'svg', 'img', 'iframe'];
const ALLOWED_IMPORT = /^(react|lucide-react|geojson|@\/components\/(ui|maps|fleet|app)\/[\w-]+|@\/lib\/utils|\.\/[\w./-]+|\.\.\/[\w./-]+)$/;

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const full = path.join(dir, name);
  return statSync(full).isDirectory() ? walk(full) : /\.(tsx?)$/.test(name) ? [full] : [];
});

let problems = 0;
for (const file of walk(root)) {
  if (/registry\.ts$|types\.ts$|router\.ts$/.test(file) && path.dirname(file) === root) continue;
  const rel = path.relative(root, file);
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(/from\s+'([^']+)'/g)) {
    if (!ALLOWED_IMPORT.test(match[1])) {
      console.log(`${rel}: import "${match[1]}" is not a component`);
      problems += 1;
    }
  }
  // Demo data (data/*.ts) may contain markup strings such as SVG photos; only UI files are checked for raw tags.
  if (rel.split(path.sep).includes('data')) continue;
  for (const tag of RAW) {
    if (new RegExp(`<${tag}[\\s>]`).test(source)) {
      console.log(`${rel}: raw <${tag}> — use a component`);
      problems += 1;
    }
  }
}
console.log(problems ? `${problems} problem(s)` : 'templates use components only');
process.exit(problems ? 1 : 0);
