import type { HeatPoint } from '@/components/maps/heatmap-card';
import type { LngLat } from '@/components/maps/map-kit';

/** A small seeded random generator, so the demo looks the same on every load. */
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Invented order locations in San Francisco: four hotspots, each busiest at its own hour. Not real data. */
const HOTSPOTS: { center: LngLat; peakHour: number; spread: number; count: number }[] = [
  { center: [-122.3995, 37.7946], peakHour: 12.5, spread: 0.006, count: 260 },
  { center: [-122.4194, 37.7599], peakHour: 19.5, spread: 0.008, count: 300 },
  { center: [-122.3948, 37.7764], peakHour: 8.5, spread: 0.005, count: 200 },
  { center: [-122.437, 37.8036], peakHour: 20.5, spread: 0.007, count: 160 },
];

function gaussian(random: () => number) {
  return Math.sqrt(-2 * Math.log(random() || 1e-9)) * Math.cos(2 * Math.PI * random());
}

export const HEAT_POINTS: HeatPoint[] = (() => {
  const random = mulberry32(2026);
  const points: HeatPoint[] = [];
  HOTSPOTS.forEach((spot) => {
    for (let i = 0; i < spot.count; i += 1) {
      const hour = Math.min(23, Math.max(0, Math.round(spot.peakHour + gaussian(random) * 2.2)));
      points.push({ hour, position: [spot.center[0] + gaussian(random) * spot.spread, spot.center[1] + gaussian(random) * spot.spread * 0.8] });
    }
  });
  return points;
})();
