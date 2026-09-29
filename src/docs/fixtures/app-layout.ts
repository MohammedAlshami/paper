import { Bell, CreditCard, FileText, Inbox, LayoutDashboard, LogOut, Palette, Settings, Shield, Truck, User, Users, Wrench } from 'lucide-react';
import type { AppNotification } from '@/components/app/notifications-popover';
import type { CommandGroup } from '@/components/app/command-palette';
import type { NavGroup, ShellUser, UserMenuItem } from '@/components/app/app-shell';
import type { SettingsSection } from '@/components/app/settings-layout';

export const SHELL_NAV: NavGroup[] = [
  {
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'vehicles', label: 'Vehicles', icon: Truck, badge: 8 },
      { id: 'work-orders', label: 'Work orders', icon: Wrench, badge: 5 },
      { id: 'inbox', label: 'Inbox', icon: Inbox, badge: 3 },
    ],
  },
  {
    heading: 'Manage',
    items: [
      { id: 'team', label: 'Team', icon: Users },
      { id: 'billing', label: 'Billing', icon: CreditCard },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

export const SHELL_USER: ShellUser = { name: 'Priya Nair', email: 'priya@northwind.example' };

export const SHELL_USER_MENU: UserMenuItem[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'signout', label: 'Sign out', icon: LogOut, destructive: true },
];

export const COMMAND_GROUPS: CommandGroup[] = [
  {
    heading: 'Go to',
    commands: [
      { id: 'go-overview', label: 'Overview', icon: LayoutDashboard, shortcut: 'G O' },
      { id: 'go-vehicles', label: 'Vehicles', icon: Truck, shortcut: 'G V', keywords: ['fleet', 'vans'] },
      { id: 'go-work-orders', label: 'Work orders', icon: Wrench, shortcut: 'G W', keywords: ['repairs', 'jobs'] },
      { id: 'go-invoices', label: 'Invoices', icon: FileText, keywords: ['billing'] },
    ],
  },
  {
    heading: 'Create',
    commands: [
      { id: 'new-work-order', label: 'New work order', icon: Wrench },
      { id: 'new-vehicle', label: 'Add a vehicle', icon: Truck },
      { id: 'invite', label: 'Invite a teammate', icon: Users },
    ],
  },
  {
    heading: 'Account',
    commands: [
      { id: 'theme', label: 'Change theme', icon: Palette },
      { id: 'security', label: 'Security settings', icon: Shield, keywords: ['password', '2fa'] },
    ],
  },
];

export const NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', title: 'Van 21 failed its inspection', body: 'Coolant leak at the water pump. A work order was opened.', time: '4 min ago', icon: Wrench },
  { id: 'n2', title: 'PO-1184 is on its way', body: 'Northline Parts expects to deliver on 2 Oct.', time: '1 hour ago', icon: Truck },
  { id: 'n3', title: 'Diego commented on WO-2041', body: 'Rotors are on back order, moving it to next week.', time: '3 hours ago', icon: Inbox },
  { id: 'n4', title: 'Insurance expires in 14 days', body: 'Truck 02 needs a renewed certificate.', time: 'Yesterday', icon: Bell, read: true },
];

/** The section list for the SettingsLayout demo; contents are filled in by the preview. */
export const SETTINGS_SECTIONS: Omit<SettingsSection, 'content'>[] = [
  { id: 'profile', label: 'Profile', icon: User, description: 'How you appear to the rest of your team.' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Choose what is worth an email.' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Password and sign-in.' },
  { id: 'billing', label: 'Billing', icon: CreditCard, description: 'Your plan and payment method.' },
];
