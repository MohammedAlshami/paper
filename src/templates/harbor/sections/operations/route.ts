import type { LngLat } from '../../data';

/** A route that follows the street grid: along one axis, then the other, then in. Stands in for a routing API. */
export function gridRoute(from: LngLat, to: LngLat): LngLat[] {
  const bend: LngLat = [to[0], from[1]];
  const legs: [LngLat, LngLat][] = [[from, bend], [bend, to]];
  const points: LngLat[] = [from];
  legs.forEach(([a, b]) => {
    for (let i = 1; i <= 8; i += 1) points.push([a[0] + ((b[0] - a[0]) * i) / 8, a[1] + ((b[1] - a[1]) * i) / 8]);
  });
  return points;
}

/** The point a fraction (0 to 1) of the way along a route, by length. */
export function positionAlong(route: LngLat[], fraction: number): LngLat {
  const lengths = route.slice(1).map((point, i) => Math.hypot(point[0] - route[i][0], point[1] - route[i][1]));
  const total = lengths.reduce((sum, length) => sum + length, 0) || 1;
  let remaining = Math.min(Math.max(fraction, 0), 1) * total;
  for (let i = 0; i < lengths.length; i += 1) {
    if (remaining <= lengths[i]) {
      const t = lengths[i] ? remaining / lengths[i] : 0;
      return [route[i][0] + (route[i + 1][0] - route[i][0]) * t, route[i][1] + (route[i + 1][1] - route[i][1]) * t];
    }
    remaining -= lengths[i];
  }
  return route[route.length - 1];
}
