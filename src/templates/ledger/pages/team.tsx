import * as React from 'react';
import { PageHeader } from '@/components/app/page-header';
import { TeamMembers } from '@/components/app/team-members';
import { MEMBERS } from '../data';
import { AppLayout } from '../layouts';
import type { PageProps } from './types';

export function TeamPage(props: PageProps) {
  const [members, setMembers] = React.useState(MEMBERS);
  return (
    <AppLayout {...props} active="/app/team">
      <PageHeader title="Team" description="Who can see and change what in this workspace." breadcrumbs={[{ label: 'Ledger' }, { label: 'Team' }]} />
      <TeamMembers
        members={members}
        currentUserId="m1"
        onRoleChange={(member, role) => setMembers((list) => list.map((item) => (item.id === member.id ? { ...item, role } : item)))}
        onRemove={(member) => setMembers((list) => list.filter((item) => item.id !== member.id))}
        onInvite={(email, role) => setMembers((list) => [...list, { id: `m${list.length + 1}`, name: email.split('@')[0], email, role, status: 'invited' }])}
      />
    </AppLayout>
  );
}
