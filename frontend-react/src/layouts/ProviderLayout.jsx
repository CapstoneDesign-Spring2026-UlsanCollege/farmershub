import {
  Bell,
  BriefcaseBusiness,
  FilePlus2,
  HelpCircle,
  Home,
  ListChecks,
  MessageCircle,
  Settings,
  User,
} from 'lucide-react';
import { RoleShell } from './RoleShell.jsx';

const providerNav = [
  { to: '/provider', label: 'Dashboard', icon: Home },
  { to: '/provider/onboarding', label: 'Onboarding', icon: FilePlus2 },
  { to: '/provider/listings', label: 'Listings', icon: BriefcaseBusiness },
  { to: '/provider/requests', label: 'Requests', icon: ListChecks },
  { to: '/provider/messages', label: 'Messages', icon: MessageCircle },
  { to: '/provider/notifications', label: 'Notifications', icon: Bell },
  { to: '/provider/profile', label: 'Profile', icon: User },
  { to: '/provider/settings', label: 'Settings', icon: Settings },
  { to: '/provider/help', label: 'Help', icon: HelpCircle },
];

export function ProviderLayout() {
  return (
    <RoleShell
      roleLabel="Provider application"
      homePath="/provider"
      className="provider-shell"
      navItems={providerNav}
    />
  );
}
