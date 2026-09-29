import * as React from 'react';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { PageTabs } from '@/components/app/page-tabs';
import { RosterGrid } from '@/components/app/roster-grid';
import { TeamMembers, type TeamMember as Member } from '@/components/app/team-members';
import { useToast } from '@/components/app/toast';
import { CURRENT_USER, INITIAL_ROSTER, ROSTER_DAYS, ROSTER_PEOPLE, ROSTER_SHIFTS, TODAY, type TeamMember } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarbor } from '../../../state';

const ROLES: TeamMember['role'][] = ['Owner', 'Admin', 'Manager', 'Warehouse', 'Support', 'Viewer'];

type Tab = 'members' | 'roster';

/** Who can sign in, what they can do, and who works which shift this week. */
export function TeamPage() {
  const { state, actions } = useHarbor();
  const { toast } = useToast();
  const [tab, setTab] = React.useState<Tab>('members');
  const [roster, setRoster] = React.useState(INITIAL_ROSTER);
  const [removing, setRemoving] = React.useState<Member | null>(null);

  const members: Member[] = state.team.map((member) => ({ id: member.id, name: member.name, email: member.email, role: member.role, status: member.status }));

  return (
    <HarborPage
      title="Team"
      description="The people who use Harbor and the shifts they work."
      tabs={
        <PageTabs
          tabs={[
            { id: 'members', label: 'Members', count: state.team.length },
            { id: 'roster', label: 'This week' },
          ]}
          activeId={tab}
          onChange={(next) => setTab(next.id as Tab)}
        />
      }
    >
      {tab === 'members' ? (
        <TeamMembers
          members={members}
          roles={ROLES}
          defaultInviteRole="Viewer"
          currentUserId={CURRENT_USER.id}
          onRoleChange={(member, role) => {
            actions.setMemberRole(member.id, role as TeamMember['role']);
            toast({ title: `${member.name} is now ${role}`, variant: 'success' });
          }}
          onRemove={setRemoving}
          onInvite={(email, role) => {
            actions.inviteMember(email, role as TeamMember['role']);
            toast({ title: 'Invitation sent', description: `${email} joins as ${role}.`, variant: 'success' });
          }}
        />
      ) : (
        <RosterGrid
          people={ROSTER_PEOPLE}
          days={ROSTER_DAYS}
          shiftTypes={ROSTER_SHIFTS}
          assignments={roster}
          today={TODAY}
          onAssign={(personId, day, shiftId) => {
            setRoster((current) => ({ ...current, [`${personId}.${day}`]: shiftId ?? undefined }));
            const person = ROSTER_PEOPLE.find((entry) => entry.id === personId);
            actions.log(shiftId ? 'scheduled' : 'cleared a shift for', `${person?.name ?? personId} on ${day}`, 'team');
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(next) => !next && setRemoving(null)}
        title={`Remove ${removing?.name ?? 'this person'}?`}
        description="They lose access to Harbor straight away. Their past changes stay in the audit log."
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          if (!removing) return;
          actions.removeMember(removing.id);
          toast({ title: `${removing.name} removed` });
        }}
      />
    </HarborPage>
  );
}
