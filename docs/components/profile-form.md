# ProfileForm

Account details that know when they have changed.

A photo, name, email, role and bio. Save and Cancel stay off until something changes, Cancel restores the last saved values, and a chosen photo is previewed at once. Uploading it is yours.

**Category:** Authentication and account · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add avatar button card input label select textarea
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/profile-form.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<ProfileForm
  defaultValues={{ name: 'Priya Nair', email: 'priya@northwind.example', role: 'Fleet manager', bio: '' }}
  roles={['Fleet manager', 'Workshop lead', 'Technician']}
  onSave={(values) => api.updateProfile(values)}
  onAvatarChange={(file) => api.uploadAvatar(file)}
/>
```

## Anatomy

```tsx
import { ProfileForm, type ProfileValues } from '@/components/app/profile-form';

// "Saved" is whatever onSave last received; dirty compares the fields to it.
// Leave `roles` out to make the role a free text field.
<ProfileForm defaultValues={values} onSave={(next: ProfileValues) => {}} />
```

## Examples

### Free-text role

```tsx
<ProfileForm defaultValues={{ name: 'Sam Okafor', email: 'sam@northwind.example', role: 'Driver', bio: '' }} />
```

## API reference

#### ProfileForm

An editable profile.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `defaultValues` | `ProfileValues` | — | name, email, role, bio and an optional avatarUrl. |
| `roles` | `string[]` | — | Options for a role select. Without it the role is a text input. |
| `bioLimit` | `number` | `200` | Maximum bio length. |
| `onSave` | `(values: ProfileValues) => void` | — | Called with valid, changed values. |
| `onAvatarChange` | `(file: File) => void` | — | Receives the picked image. |
| `saving` | `boolean` | `false` | Disables the buttons and spins Save. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/app/profile-form.tsx`

```tsx
'use client';

import * as React from 'react';
import { LoaderCircle, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { initials } from './app-kit';

export interface ProfileValues {
  name: string;
  email: string;
  role: string;
  bio: string;
  avatarUrl?: string;
}

/**
 * ProfileForm — a person's account details. Save and Cancel stay disabled until something changes, Cancel restores
 * the last saved values, and a chosen picture is previewed straight away. Uploading it is yours (`onAvatarChange`).
 */
export function ProfileForm({
  defaultValues,
  roles,
  bioLimit = 200,
  onSave,
  onAvatarChange,
  saving = false,
  className,
}: {
  defaultValues: ProfileValues;
  /** Options for the role select. Leave out to show the role as plain text. */
  roles?: string[];
  bioLimit?: number;
  onSave?: (values: ProfileValues) => void;
  /** Receives the picked image file; the preview updates on its own. */
  onAvatarChange?: (file: File) => void;
  saving?: boolean;
  className?: string;
}) {
  const [saved, setSaved] = React.useState(defaultValues);
  const [values, setValues] = React.useState(defaultValues);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const dirty = (Object.keys(values) as (keyof ProfileValues)[]).some((key) => values[key] !== saved[key]);
  const invalid = !values.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email);

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (invalid || !dirty) return;
          setSaved(values);
          onSave?.(values);
        }}
        noValidate
      >
        <div className="flex items-center gap-4 border-b p-4 sm:p-6">
          <Avatar className="size-16">
            {values.avatarUrl ? <AvatarImage src={values.avatarUrl} alt="" /> : null}
            <AvatarFallback className="text-base">{initials(values.name || '?')}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{values.name || 'Your name'}</p>
            <p className="truncate text-xs text-muted-foreground">{values.email}</p>
            <Button type="button" variant="outline" size="xs" className="mt-2" onClick={() => fileRef.current?.click()}>
              <Upload /> Change photo
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setValues((current) => ({ ...current, avatarUrl: URL.createObjectURL(file) }));
                onAvatarChange?.(file);
              }}
            />
          </div>
        </div>

        <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-name">Full name</Label>
            <Input id="profile-name" value={values.name} aria-invalid={!values.name.trim()} onChange={(event) => setValues({ ...values, name: event.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" type="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="profile-role">Role</Label>
            {roles ? (
              <Select value={values.role} onValueChange={(role) => setValues({ ...values, role })}>
                <SelectTrigger id="profile-role" className="w-full">
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input id="profile-role" value={values.role} onChange={(event) => setValues({ ...values, role: event.target.value })} />
            )}
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="profile-bio">Bio</Label>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {values.bio.length}/{bioLimit}
              </span>
            </div>
            <Textarea id="profile-bio" rows={3} maxLength={bioLimit} value={values.bio} onChange={(event) => setValues({ ...values, bio: event.target.value })} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t p-4 sm:px-6">
          <p className="text-xs text-muted-foreground">{dirty ? 'You have unsaved changes.' : 'All changes saved.'}</p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" disabled={!dirty || saving} onClick={() => setValues(saved)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!dirty || invalid || saving}>
              {saving ? <LoaderCircle className="animate-spin" /> : null}
              Save changes
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
```
