# SettingsLayout

A list of sections on the left, the chosen one on the right.

The shape of most settings pages. Sections are listed as a vertical menu on desktop and as a row of pills on a phone, and each brings its own content, so the forms stay where you write them.

**Category:** Layout and navigation · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add 
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/settings-layout.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<SettingsLayout
  sections={[
    { id: 'profile', label: 'Profile', icon: User, description: 'How you appear to your team.', content: <ProfileForm /> },
    { id: 'notifications', label: 'Notifications', icon: Bell, content: <NotificationPreferences /> },
  ]}
  onChange={(id) => setTab(id)}
/>
```

## Anatomy

```tsx
import { SettingsLayout, type SettingsSection } from '@/components/app/settings-layout';

// Uncontrolled by default; pass activeId + onChange to keep the section in the URL.
<SettingsLayout sections={sections} activeId={section} onChange={setSection} />
```

## Examples

### Controlled

```tsx
<SettingsLayout sections={sections} activeId={section} onChange={setSection} />
```

## API reference

#### SettingsLayout

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `sections` | `SettingsSection[]` | — | id, label, icon?, description? and content for each section. |
| `activeId` | `string` | — | Controlled section id. |
| `defaultActiveId` | `string` | — | The section shown first when uncontrolled. Defaults to the first. |
| `onChange` | `(id: string) => void` | — | Called when a section is picked. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the active marker. |
| `className` | `string` | — | Merged onto the root element. |

## Source

`src/components/app/settings-layout.tsx`

```tsx
'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SettingsSection {
  id: string;
  label: string;
  icon?: LucideIcon;
  /** A line under the section title. */
  description?: string;
  content: React.ReactNode;
}

/**
 * SettingsLayout — a settings page: a list of sections on the left, the chosen one on the right. On a phone the list
 * becomes a row of pills above the content. Each section brings its own content, so forms stay where you write them.
 */
export function SettingsLayout({
  sections,
  activeId,
  defaultActiveId,
  onChange,
  accentColor = '#ec4899',
  className,
}: {
  sections: SettingsSection[];
  /** Controlled section id. */
  activeId?: string;
  defaultActiveId?: string;
  onChange?: (id: string) => void;
  accentColor?: string;
  className?: string;
}) {
  const [inner, setInner] = React.useState(defaultActiveId ?? sections[0]?.id);
  const current = activeId ?? inner;
  const active = sections.find((section) => section.id === current) ?? sections[0];

  const choose = (id: string) => {
    setInner(id);
    onChange?.(id);
  };

  return (
    <div className={cn('flex flex-col gap-6 md:flex-row md:gap-10', className)}>
      <nav className="-mx-1 flex shrink-0 gap-1 overflow-x-auto px-1 pb-1 md:mx-0 md:w-52 md:flex-col md:overflow-visible md:px-0 md:pb-0" aria-label="Settings">
        {sections.map((section) => {
          const selected = section.id === active?.id;
          return (
            <button
              key={section.id}
              type="button"
              aria-current={selected ? 'page' : undefined}
              onClick={() => choose(section.id)}
              className={cn(
                'relative flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                selected ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <span className="absolute top-1.5 bottom-1.5 left-0 hidden w-0.5 rounded-full md:block" style={{ background: accentColor, opacity: selected ? 1 : 0 }} aria-hidden />
              {section.icon ? <section.icon className="size-4 shrink-0" /> : null}
              {section.label}
            </button>
          );
        })}
      </nav>

      <div className="min-w-0 flex-1">
        {active ? (
          <section aria-labelledby={`settings-${active.id}`} className="space-y-6">
            <div className="space-y-1 border-b pb-4">
              <h2 id={`settings-${active.id}`} className="text-lg font-bold">{active.label}</h2>
              {active.description ? <p className="text-sm text-muted-foreground">{active.description}</p> : null}
            </div>
            {active.content}
          </section>
        ) : null}
      </div>
    </div>
  );
}
```
