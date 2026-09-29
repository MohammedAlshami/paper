# TeamMembers

Who is on the team, their role, and a way to invite more.

A member list with avatar, name, email, a role select and an actions menu, plus an Invite dialog with an email field and a role. Pending invites carry an Invited badge. Your own row cannot be demoted or removed.

**Category:** Billing and teams · **Status:** new

## Installation

```bash
pnpm dlx shadcn@latest add avatar badge button card dialog dropdown-menu input label select
```

And the packages the file imports: `lucide-react`

Copy the file below into `src/components/app/team-members.tsx` in your project. There is no package to install and no
version to track — you own this file from the moment you paste it.

This component imports shared helpers from `src/components/app/app-kit.ts`. Copy that file once next to it.

## Usage

```tsx
<TeamMembers
  members={members}
  currentUserId="m1"
  onRoleChange={(member, role) => setRole(member.id, role)}
  onRemove={(member) => remove(member.id)}
  onInvite={(email, role) => invite(email, role)}
/>
```

## Anatomy

```tsx
import { TeamMembers, type TeamMember } from '@/components/app/team-members';

// members: { id, name, email, role, status?: 'active' | 'invited' }
// roles defaults to Owner, Admin, Member and Viewer. Owner is never offered on invite.
<TeamMembers members={members} roles={['Owner', 'Editor']} defaultInviteRole="Editor" />
```

## Examples

### Custom roles

```tsx
<TeamMembers members={members} roles={['Owner', 'Editor']} defaultInviteRole="Editor" currentUserId="m1" />
```

## API reference

#### TeamMembers

A card of members with an invite dialog.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `members` | `TeamMember[]` | — | id, name, email, role and an optional status. |
| `roles` | `string[]` | `['Owner', 'Admin', 'Member', 'Viewer']` | The roles offered in the selects. |
| `defaultInviteRole` | `string` | `'Member'` | Role preselected in the invite dialog. |
| `currentUserId` | `string` | — | That member cannot be demoted or removed. |
| `onRoleChange` | `(member, role) => void` | — | Called when a role select changes. |
| `onRemove` | `(member) => void` | — | Called by Remove from team. Confirm in your own code. |
| `onInvite` | `(email, role) => void` | — | Called when the invite form is submitted with a valid email. |
| `accentColor` | `string` | `'#ec4899'` | Colour of the Invited badge. Inline styles cannot read CSS variables, so pass a value. |
| `className` | `string` | — | Merged onto the card. |

## Source

`src/components/app/team-members.tsx`

```tsx
'use client';

import * as React from 'react';
import { MoreHorizontal, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { initials } from './app-kit';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: 'active' | 'invited';
}

/** TeamMembers — who is on the team, their role, and a dialog to invite more. Removing asks nothing; wire your own confirmation into onRemove. */
export function TeamMembers({
  members,
  roles = ['Owner', 'Admin', 'Member', 'Viewer'],
  defaultInviteRole = 'Member',
  currentUserId,
  onRoleChange,
  onRemove,
  onInvite,
  accentColor = '#ec4899',
  className,
}: {
  members: TeamMember[];
  roles?: string[];
  defaultInviteRole?: string;
  /** The row for this member cannot be removed or have its role changed. */
  currentUserId?: string;
  onRoleChange?: (member: TeamMember, role: string) => void;
  onRemove?: (member: TeamMember) => void;
  onInvite?: (email: string, role: string) => void;
  accentColor?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState(defaultInviteRole);
  const valid = /^\S+@\S+\.\S+$/.test(email);

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    onInvite?.(email, role);
    setEmail('');
    setOpen(false);
  };

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <div className="flex items-center justify-between gap-3 border-b p-4">
        <div>
          <p className="text-sm font-bold">Team</p>
          <p className="text-xs text-muted-foreground">{members.length} members</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus /> Invite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={send} className="grid gap-4">
              <DialogHeader>
                <DialogTitle>Invite a teammate</DialogTitle>
                <DialogDescription>They get an email with a link to join.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input id="invite-email" type="email" placeholder="name@company.com" value={email} onChange={(event) => setEmail(event.target.value)} autoFocus />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.filter((item) => item !== 'Owner').map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!valid}>
                  Send invite
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ul className="divide-y">
        {members.map((member) => {
          const self = member.id === currentUserId;
          return (
            <li key={member.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <Avatar>
                <AvatarFallback>{initials(member.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 basis-40">
                <p className="flex items-center gap-2 truncate text-sm font-medium">
                  {member.name}
                  {self ? <span className="text-xs font-normal text-muted-foreground">you</span> : null}
                  {member.status === 'invited' ? (
                    <Badge variant="outline" style={{ color: accentColor }}>
                      Invited
                    </Badge>
                  ) : null}
                </p>
                <p className="truncate text-xs text-muted-foreground">{member.email}</p>
              </div>
              <Select value={member.role} onValueChange={(next) => onRoleChange?.(member, next)} disabled={self}>
                <SelectTrigger size="sm" className="w-28" aria-label={`Role for ${member.name}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${member.name}`}>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {member.status === 'invited' ? <DropdownMenuItem>Resend invite</DropdownMenuItem> : <DropdownMenuItem>Send message</DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" disabled={self} onSelect={() => onRemove?.(member)}>
                    Remove from team
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
```
