/** Real file contents for every component under src/, loaded on demand for the docs' Source panel. */
const LOADERS = import.meta.glob('/src/components/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

/** `file` is the path used in the registry, e.g. "components/maps/delivery-tracker-card.tsx". */
export function loadSource(file: string): Promise<string> {
  const load = LOADERS[`/src/${file}`];
  if (!load) return Promise.reject(new Error(`No source found for src/${file}`));
  return load();
}

/**
 * The files a component imports from its own folder, with their real extensions, e.g. ["map-kit.tsx"].
 * Pass the component's source text.
 */
export function localImportFiles(file: string, source: string) {
  const folder = file.slice(0, file.lastIndexOf('/'));
  const names = Array.from(new Set(Array.from(source.matchAll(/from '\.\/([a-z-]+)'/g), (match) => match[1])));
  return names.flatMap((name) => ['ts', 'tsx'].map((ext) => `${name}.${ext}`).filter((candidate) => `/src/${folder}/${candidate}` in LOADERS));
}
