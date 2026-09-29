# Paper — how to use these components

Paper is a copy-paste React component library (no npm package). Every component is one file you copy into `src/components/<family>/` and own.

## Stack
React 19, TypeScript, Tailwind CSS v4, shadcn/ui primitives in `@/components/ui`, `lucide-react` icons, `clsx` + `tailwind-merge` (the `cn` helper in `@/lib/utils`). Maps use MapLibre GL (`maplibre-gl`); charts use Recharts.

## Families
- `components/maps/*` — a map is the visual (delivery tracking, store locators, routes). Needs `maplibre-gl` and the shared `map-kit.tsx`.
- `components/fleet/*` — fleet maintenance (vehicles, work orders, parts, tyres, fuel, costs). Shared `fleet-kit.ts`.
- `components/app/*` — app building blocks (shell, auth forms, data table, billing, marketing sections). Shared `app-kit.ts`.

## Design theme
Calm and minimal. Neutral greys, hairline borders instead of shadows, `text-sm` body, monospace tabular numerals for figures, generous spacing, one accent colour: pink `#ec4899`.
- Colour that is applied inline (charts, map layers) cannot read CSS variables, so components take an `accentColor` prop (default `'#ec4899'`).
- Every component takes `className`, merged with `cn`.
- Components are controlled or uncontrolled-friendly (`defaultX` + `onChange`) and never fetch data or call a router: you pass data and callbacks.
- Responsive with container queries; they must work from 390px wide.

## Tokens (CSS variables, shadcn convention)
`--background --foreground --border --muted --muted-foreground --primary --primary-foreground --destructive --radius`

## Composition rules
1. Build screens from these components; do not hand-roll buttons, inputs, tables or cards that a component already covers.
2. If something is missing, add it as a proper component first (a file with typed props, `accentColor`, `className`), then use it.
3. Copy the shared kit file (`map-kit.tsx`, `fleet-kit.ts`, `app-kit.ts`) next to any component from that family.
4. Install the shadcn primitives a component lists: `pnpm dlx shadcn@latest add card button badge ...`.

## Templates
Whole sub-projects built only from these components: Courier (maps + app), Garage (fleet + app), Ledger (SaaS), Harbor (retail back-office, all families). Each template lives in `src/templates/<id>` with its own routes and demo data.
