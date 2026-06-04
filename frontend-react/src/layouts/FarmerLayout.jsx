import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ClipboardList,
  HelpCircle,
  Home,
  Inbox,
  MessageCircle,
  Package,
  Receipt,
  Settings,
  Sprout,
  User,
  Users,
  Warehouse,
} from 'lucide-react';
import { RoleShell } from './RoleShell.jsx';

const farmerNav = [
  { to: '/farmer', label: 'Dashboard', icon: Home },
  { to: '/farmer/products', label: 'Products', icon: Sprout },
  { to: '/farmer/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/farmer/orders', label: 'Orders', icon: Package },
  { to: '/farmer/messages', label: 'Messages', icon: MessageCircle },
  { to: '/farmer/customers', label: 'Customers', icon: Users },
  { to: '/farmer/services', label: 'Services', icon: BriefcaseBusiness },
  { to: '/farmer/service-requests', label: 'Requests', icon: Inbox },
  { to: '/farmer/service-notifications', label: 'Service Alerts', icon: Bell },
  { to: '/farmer/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/farmer/payments', label: 'Payments', icon: Receipt },
  { to: '/farmer/feed', label: 'Farm Feed', icon: ClipboardList },
  { to: '/farmer/profile', label: 'Profile', icon: User },
  { to: '/farmer/settings', label: 'Settings', icon: Settings },
  { to: '/farmer/help', label: 'Help', icon: HelpCircle },
];

export function FarmerLayout() {
  return (
    <RoleShell
      roleLabel="Farmer application"
      homePath="/farmer"
      className="farmer-shell"
      navItems={farmerNav}
    />
  );
}
