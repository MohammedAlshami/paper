import * as React from 'react';
import { Bell, KeyRound, Plug, ShieldAlert, SlidersHorizontal, UserRound } from 'lucide-react';
import { ApiKeyList, type ApiKey } from '@/components/app/api-key-list';
import { DangerZoneCard } from '@/components/app/danger-zone-card';
import { IntegrationList } from '@/components/app/integration-list';
import { NotificationPreferences } from '@/components/app/notification-preferences';
import { ProfileForm, type ProfileValues } from '@/components/app/profile-form';
import { SettingsLayout } from '@/components/app/settings-layout';
import { useToast } from '@/components/app/toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CURRENT_USER, TODAY } from '../../../data';
import { HarborPage } from '../../../layout';
import { useHarbor } from '../../../state';
import { CUTOFF_OPTIONS, DANGER_ACTIONS, INTEGRATIONS, NOTIFICATION_CHANNELS, NOTIFICATION_DEFAULTS, NOTIFICATION_GROUPS, SEED_API_KEYS } from '../insight-data';

const PROFILE_ROLES = ['Owner', 'Admin', 'Manager', 'Warehouse', 'Support', 'Viewer'];

/** The workspace settings: your profile, what you hear about, the delivery rules, the services and the keys. */
export function SettingsPage() {
  const { actions } = useHarbor();
  const { toast } = useToast();
  const [keys, setKeys] = React.useState<ApiKey[]>(SEED_API_KEYS);
  const [integrations, setIntegrations] = React.useState(INTEGRATIONS);
  const [cutoff, setCutoff] = React.useState(CUTOFF_OPTIONS[0].value);
  const [freeOver, setFreeOver] = React.useState('75');
  const [photoProof, setPhotoProof] = React.useState(true);

  const saveDelivery = () => {
    actions.log('changed the delivery defaults', `Cutoff ${cutoff}, free over $${freeOver}`, 'settings');
    toast({ title: 'Delivery defaults saved', variant: 'success' });
  };

  return (
    <HarborPage title="Settings" description="Your profile, what you are told about, and the services Harbor talks to.">
      <SettingsLayout
        sections={[
          {
            id: 'profile',
            label: 'Profile',
            icon: UserRound,
            description: 'How you appear to the rest of the team.',
            content: (
              <ProfileForm
                defaultValues={{ name: CURRENT_USER.name, email: CURRENT_USER.email, role: CURRENT_USER.role, bio: 'Runs the day at Harbor. Ask me about delivery windows.' }}
                roles={PROFILE_ROLES}
                onSave={(values: ProfileValues) => {
                  actions.log('updated their profile', values.name, 'settings');
                  toast({ title: 'Profile saved', variant: 'success' });
                }}
              />
            ),
          },
          {
            id: 'notifications',
            label: 'Notifications',
            icon: Bell,
            description: 'What to be told about, and where.',
            content: <NotificationPreferences groups={NOTIFICATION_GROUPS} channels={NOTIFICATION_CHANNELS} defaultValue={NOTIFICATION_DEFAULTS} />,
          },
          {
            id: 'delivery',
            label: 'Delivery defaults',
            icon: SlidersHorizontal,
            description: 'The rules every new order follows.',
            content: (
              <Card className="gap-0 overflow-hidden py-0">
                <div className="flex flex-col gap-5 p-4 sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="cutoff">Same-day order cutoff</Label>
                      <Select value={cutoff} onValueChange={setCutoff}>
                        <SelectTrigger id="cutoff" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CUTOFF_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Orders placed after this are delivered the next day.</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="free-over">Free delivery over</Label>
                      <Input id="free-over" className="font-mono tabular-nums" inputMode="decimal" value={freeOver} onChange={(event) => setFreeOver(event.target.value)} />
                      <p className="text-xs text-muted-foreground">In dollars, before tax. Applies to every zone.</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-md border p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Photo proof at drop-off</p>
                      <p className="text-xs text-muted-foreground">Drivers must take a photo before an order counts as delivered.</p>
                    </div>
                    <Switch checked={photoProof} onCheckedChange={setPhotoProof} aria-label="Photo proof at drop-off" />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={saveDelivery}>Save changes</Button>
                  </div>
                </div>
              </Card>
            ),
          },
          {
            id: 'integrations',
            label: 'Integrations',
            icon: Plug,
            description: 'The services Harbor is wired to.',
            content: (
              <IntegrationList
                integrations={integrations}
                onToggle={(integration, connected) => {
                  setIntegrations((list) => list.map((item) => (item.id === integration.id ? { ...item, connected } : item)));
                  actions.log(connected ? 'connected' : 'disconnected', integration.name, 'settings');
                  toast({ title: `${integration.name} ${connected ? 'connected' : 'disconnected'}`, variant: 'success' });
                }}
              />
            ),
          },
          {
            id: 'api',
            label: 'API keys',
            icon: KeyRound,
            description: 'Keys let your own code talk to Harbor.',
            content: (
              <ApiKeyList
                keys={keys}
                onCreate={(name) => {
                  const prefix = `hb_live_${Math.random().toString(16).slice(2, 6)}`;
                  setKeys((list) => [...list, { id: `k${list.length + 1}`, name, prefix, createdAt: TODAY, scope: 'Read and write' }]);
                  actions.log('created an API key', name, 'settings');
                  return `${prefix}${Math.random().toString(16).slice(2, 14)}`;
                }}
                onRevoke={(key) => {
                  setKeys((list) => list.filter((item) => item.id !== key.id));
                  actions.log('revoked the API key', key.name, 'settings');
                  toast({ title: `${key.name} revoked` });
                }}
              />
            ),
          },
          {
            id: 'danger',
            label: 'Danger zone',
            icon: ShieldAlert,
            description: 'Things that cannot be taken back.',
            content: (
              <DangerZoneCard
                actions={DANGER_ACTIONS}
                onConfirm={(action) => {
                  if (action.id === 'reset') {
                    actions.reset();
                    toast({ title: 'Demo data reset', description: 'Orders, stock and the audit log are back to how they started.', variant: 'success' });
                  } else {
                    toast({ title: 'Not part of the demo', description: 'Deleting the workspace would need a real backend.', variant: 'error' });
                  }
                }}
              />
            ),
          },
        ]}
      />
    </HarborPage>
  );
}
