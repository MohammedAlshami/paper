/** Full, real file contents for every component under src/, for the docs' Source panel. */
const RAW_FILES = import.meta.glob('/src/components/**/*.{ts,tsx}', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

/** `file` is the path used in the registry, e.g. "components/maps/delivery-tracker-card.tsx". */
export function getSource(file: string): string {
  const source = RAW_FILES[`/src/${file}`];
  if (!source) throw new Error(`No source found for src/${file}`);
  return source;
}
