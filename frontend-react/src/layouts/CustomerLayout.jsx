import {
  Bell,
  Heart,
  HelpCircle,
  Home,
  MessageCircle,
  PackageCheck,
  Settings,
  ShoppingBasket,
  Store,
  User,
  Users,
} from 'lucide-react';
import { RoleShell } from './RoleShell.jsx';

const customerNav = [
  { to: '/customer', label: 'Home', icon: Home },
  { to: '/customer/marketplace', label: 'Marketplace', icon: Store },
  { to: '/customer/cart', label: 'Cart', icon: ShoppingBasket },
  { to: '/customer/favorites', label: 'Favorites', icon: Heart },
  { to: '/customer/orders', label: 'Orders', icon: PackageCheck },
  { to: '/customer/messages', label: 'Messages', icon: MessageCircle },
  { to: '/customer/notifications', label: 'Notifications', icon: Bell },
  { to: '/customer/feed', label: 'Social Feed', icon: Users },
  { to: '/customer/profile', label: 'Profile', icon: User },
  { to: '/customer/settings', label: 'Settings', icon: Settings },
  { to: '/customer/help', label: 'Help', icon: HelpCircle },
];

export function CustomerLayout() {
  return (
    <RoleShell
      roleLabel="Customer application"
      homePath="/customer"
      className="customer-shell"
      navItems={customerNav}
    />
  );
}
