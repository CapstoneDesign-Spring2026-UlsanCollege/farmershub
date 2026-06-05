import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  ChevronDown,
  Heart,
  LogOut,
  MapPin,
  MessageCircle,
  Search,
  ShoppingBasket,
  UserRound,
} from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AppLogo } from '../components/common/AppLogo.jsx';
import { AnimatedRouteShell } from '../components/common/AnimatedRouteShell.jsx';
import { SidebarPromoCard } from '../components/common/SidebarPromoCard.jsx';
import { roleHomePath } from '../auth/roleRedirect.js';
import { useAuth } from '../auth/useAuth.js';
import { favoriteIds, getCartItems } from '../utils/customerStorage.js';

const roleCopy = {
  customer: {
    chip: 'Customer',
    welcome: 'Welcome back,',
    search: 'Search fresh produce, farmers, or products...',
    locationLabel: 'Deliver to',
    location: 'Lagos, Nigeria',
    promoTitle: 'Invite and earn',
    promoText: 'Invite friends and grow your local food circle.',
    promoAction: 'Invite Now',
    promoTo: '/customer/feed',
    promoTone: 'gold',
    notificationsTo: '/customer/notifications',
    messagesTo: '/customer/messages',
    profileTo: '/customer/profile',
  },
  farmer: {
    chip: 'Farmer',
    welcome: 'Welcome back,',
    search: 'Search products, orders, customers, services...',
    locationLabel: 'Farm location',
    location: 'Abeokuta, Ogun State',
    promoTitle: 'Grow your farm business',
    promoText: 'Get premium tools, priority support, and more.',
    promoAction: 'View Analytics',
    promoTo: '/farmer/analytics',
    promoTone: 'green',
    notificationsTo: '/farmer/service-notifications',
    messagesTo: '/farmer/messages',
    profileTo: '/farmer/profile',
  },
  provider: {
    chip: 'Provider',
    welcome: 'Welcome back,',
    search: 'Search requests, services, or customers...',
    locationLabel: 'Deliver services in',
    location: 'Lagos, Nigeria',
    promoTitle: 'Grow your business',
    promoText: 'Unlock priority visibility and better request flow.',
    promoAction: 'Onboarding',
    promoTo: '/provider/onboarding',
    promoTone: 'blue',
    notificationsTo: '/provider/notifications',
    messagesTo: '/provider/messages',
    profileTo: '/provider/profile',
  },
};

function initialsFor(user) {
  const name = user?.fullName || user?.name || user?.businessName || user?.email || 'FH';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'FH';
}

function navBadge(label, role, cartQuantity, favoritesCount) {
  if (role === 'customer' && label === 'Cart' && cartQuantity > 0) return cartQuantity;
  if (role === 'customer' && label === 'Favorites' && favoritesCount > 0) return favoritesCount;
  return null;
}

export function RoleShell({ roleLabel, homePath, navItems, className }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const activeRole = roleCopy[role] ? role : className?.replace('-shell', '') || 'customer';
  const config = roleCopy[activeRole] || roleCopy.customer;
  const [cartQuantity, setCartQuantity] = useState(() => getCartItems().reduce((sum, item) => sum + Number(item.quantity || 1), 0));
  const [favoritesCount, setFavoritesCount] = useState(() => favoriteIds().length);
  const [cartBumped, setCartBumped] = useState(false);
  const displayName = user?.businessName || user?.fullName || user?.name || user?.email || 'FarmersHub member';
  const topbarActions = useMemo(() => {
    const commonActions = [
      { to: config.notificationsTo, label: 'Notifications', icon: Bell, dot: true },
      { to: config.messagesTo, label: 'Messages', icon: MessageCircle },
    ];
    if (activeRole === 'customer') {
      return [
        ...commonActions,
        { to: '/customer/favorites', label: 'Favorites', icon: Heart, badge: favoritesCount },
        { to: '/customer/cart', label: 'Cart', icon: ShoppingBasket, badge: cartQuantity, bump: cartBumped },
      ];
    }
    return commonActions;
  }, [activeRole, cartBumped, cartQuantity, config.messagesTo, config.notificationsTo, favoritesCount]);

  useEffect(() => {
    function syncCart(event) {
      const items = event.detail?.items || getCartItems();
      setCartQuantity(items.reduce((sum, item) => sum + Number(item.quantity || 1), 0));
      setFavoritesCount(favoriteIds().length);
      setCartBumped(true);
      window.setTimeout(() => setCartBumped(false), 520);
    }

    function syncStorage(event) {
      if (!event.key || event.key === 'fh_cart' || event.key === 'fh_favorite_products') {
        syncCart({ detail: { items: getCartItems() } });
      }
    }

    window.addEventListener('fh-cart-updated', syncCart);
    window.addEventListener('storage', syncStorage);
    return () => {
      window.removeEventListener('fh-cart-updated', syncCart);
      window.removeEventListener('storage', syncStorage);
    };
  }, []);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className={`role-shell ${className}`}>
      <aside className="role-sidebar">
        <div className="sidebar-brand">
          <AppLogo to={roleHomePath(role)} />
          <span>Connect. Grow. Thrive.</span>
        </div>
        <div className="role-switch-chip">
          <span className="avatar avatar-small">{initialsFor(user)}</span>
          <strong>{config.chip}</strong>
          <ChevronDown size={16} />
        </div>
        <nav className="role-nav" aria-label={`${roleLabel} navigation`}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === homePath}>
              <Icon aria-hidden="true" size={18} />
              <span>{label}</span>
              {navBadge(label, activeRole, cartQuantity, favoritesCount) ? (
                <span className="role-nav-badge">{navBadge(label, activeRole, cartQuantity, favoritesCount)}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>
        <SidebarPromoCard
          title={config.promoTitle}
          text={config.promoText}
          actionLabel={config.promoAction}
          to={config.promoTo}
          tone={config.promoTone}
        />
        <button className="logout-button" type="button" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </aside>
      <section className="role-main">
        <header className="role-topbar">
          <div className="topbar-greeting">
            <span>{config.welcome}</span>
            <strong>{displayName}</strong>
          </div>
          <label className="topbar-search">
            <Search size={20} />
            <input type="search" placeholder={config.search} aria-label="Search FarmersHub" />
          </label>
          <button className="location-chip" type="button">
            <MapPin size={18} />
            <span>{config.locationLabel}</span>
            <strong>{config.location}</strong>
            <ChevronDown size={16} />
          </button>
          <div className="topbar-actions">
            {topbarActions.map(({ to, label, icon: Icon, badge, dot, bump }) => (
              <Link key={label} className={`topbar-action ${bump ? 'is-bumping' : ''}`} to={to} aria-label={label} title={label}>
                <Icon size={20} />
                {badge ? <span className="topbar-badge">{badge}</span> : null}
                {dot && !badge ? <span className="topbar-dot" /> : null}
              </Link>
            ))}
            <Link className="profile-menu-button" to={config.profileTo} aria-label="Profile">
              <span className="avatar avatar-small"><UserRound size={18} /></span>
              <ChevronDown size={16} />
            </Link>
          </div>
        </header>
        <div className="role-content">
          <AnimatedRouteShell>
            <Outlet />
          </AnimatedRouteShell>
        </div>
      </section>
    </div>
  );
}
