/**
 * Tiny route matching for templates. A pattern like "/vehicles/:id" matches "/vehicles/v12" and returns { id: 'v12' }.
 * Returns null when the pattern does not match.
 */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const a = pattern.split('/').filter(Boolean);
  const b = path.split('/').filter(Boolean);
  if (a.length !== b.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < a.length; i += 1) {
    if (a[i].startsWith(':')) params[a[i].slice(1)] = decodeURIComponent(b[i]);
    else if (a[i] !== b[i]) return null;
  }
  return params;
}

/** The first pattern that matches, with its params. */
export function resolveRoute<T extends { path: string }>(routes: T[], path: string): { route: T; params: Record<string, string> } | null {
  for (const route of routes) {
    const params = matchPath(route.path, path);
    if (params) return { route, params };
  }
  return null;
}
