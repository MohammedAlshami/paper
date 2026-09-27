# Paper — a light editorial React UI kit

Copy-paste React components with an editorial, illustrated light theme: **white and light-grey surfaces, near-black ink, dashed rules, line-art illustrations.** No package to install, no version to chase — you copy the component file into your project and own it.

Everything inherits from a handful of CSS variables, so the **dark editorial variant** (the near-black/cream palette) is one attribute away.

## Why this exists

Most React component libraries converge on the same neutral, grey, "shadcn look". Paper takes the opposite position: a **designed** kit — editorial type, illustrated empty states, dashed hairlines, motion-friendly surfaces — for people who care how the thing looks.

## Quick start

1. Copy the file you need from `src/components/ui` (or `src/components/editorial`) into your project.
2. Install the two runtime helpers it uses:

```bash
npm i clsx tailwind-merge
```

3. Interactive components additionally use **Base UI**:

```bash
npm i @base-ui/react
```

4. Copy the token block from `src/styles/app.css` into your global stylesheet, then use the utilities: `bg-paper`, `text-ink`, `border-line`, `bg-raised`, `text-ink-muted`, `font-display`, `font-mono`.

## What's included

| Component | File | Notes |
| --- | --- | --- |
| Button | `ui/button.tsx` | solid / outline (dashed) / ghost / accent / link, four sizes |
| Badge | `ui/badge.tsx` | uppercase, dashed, tracking-wide |
| Card | `ui/card.tsx` | header / title / description / content / footer |
| Input · Textarea · Label | `ui/input.tsx` · `ui/textarea.tsx` · `ui/label.tsx` | dashed hairline that becomes solid on focus |
| Rule | `ui/rule.tsx` | the signature dashed separator |
| Skeleton | `ui/skeleton.tsx` | calm loading placeholder |
| Tabs | `ui/tabs.tsx` | Base UI, sliding hairline indicator |
| Accordion | `ui/accordion.tsx` | Base UI, rotating plus, animated height |
| Eyebrow | `editorial/eyebrow.tsx` | tiny uppercase kicker |
| SectionHeading | `editorial/section-heading.tsx` | eyebrow + display title + standfirst |
| FeatureCard | `editorial/feature-card.tsx` | illustration + title + copy |
| EmptyState | `editorial/empty-state.tsx` | illustrated empty / error states |
| Illustration | `editorial/illustration.tsx` | 24 named line illustrations |

## Illustrations

`editorial/illustration.tsx` maps names to files in `public/illustrations`:

```tsx
<Illustration name="search" className="h-32 w-32" />
<EmptyState illustration="thinking" title="Nothing here yet" description="…" />
```

Available: `search · notes · work · build · launch · target · thinking · time · money · growth · team · deal · key · beacon · puzzle · balance · newsletter · review · typing · stats · shopping · payment · chat · delivery`.

Swap them for your own art by editing one map — the keys stay the same.

## Themes

```css
:root {
  --paper: #f6f6f4;        /* page: light grey */
  --paper-raised: #ffffff; /* cards: white */
  --ink: #0e100f;
}
[data-theme='dark'] { --paper: #0e100f; --paper-raised: #141816; --ink: #fff7dd; }
```

Set `data-theme="dark"` on `<html>` and the whole kit flips.

## Roadmap

The foundation above is the design system. The next batch targets the gap the market research identified — the **agent-ops layer**, which today exists only inside closed platforms:

- **RunTimeline** — long-running agent runs, checkpoints, resume and fork
- **ApprovalGate** — pre-execution approval for tool calls, arguments shown first
- **TraceInspector** — steps, tool calls, tokens and latency in one panel
- **CostMeter** — token/cost budgets
- **MCPCatalog** — browse, connect and authenticate MCP servers
- **States** — a complete illustrated empty/loading/error system

Also planned: a shadcn-compatible registry (one-command install), `llms.txt` + agent skill, and RTL-correct logical-property foundations.

## Develop

```bash
npm install
npm run dev      # http://localhost:3100
npm run build
```

## Licence

MIT. Illustrations from the Notion Resources freebie pack.
