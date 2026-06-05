import { Link } from 'react-router-dom';
import { Heart, PackageCheck, Settings, ShieldCheck, ShoppingBag, Star } from 'lucide-react';
import { getProducts } from '../../api/productsApi.js';
import { getProfile } from '../../api/profileApi.js';
import { InfoCard } from '../../components/common/Page.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { ErrorState, LoadingState } from '../../components/common/States.jsx';
import { ProfileAbout } from '../../components/profile/ProfileAbout.jsx';
import { ProfileHeader } from '../../components/profile/ProfileHeader.jsx';
import { ProfileProducts } from '../../components/profile/ProfileProducts.jsx';
import { ProfileStats } from '../../components/profile/ProfileStats.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { favoriteIds } from '../../utils/customerStorage.js';
import { asArray, getId, resolveMediaUrl } from '../../utils/format.js';
import { homeImage } from '../../utils/assets.js';

function customerProductPath(id) {
  return `/customer/products/${encodeURIComponent(id)}`;
}

function customerFarmerPath(id) {
  return `/customer/farmers/${encodeURIComponent(id)}`;
}

function useCustomerProfile() {
  return useAsyncData(async () => {
    const [profileResult, productsResult] = await Promise.allSettled([getProfile(), getProducts()]);
    return {
      profile: profileResult.status === 'fulfilled' ? profileResult.value?.data || profileResult.value : {},
      products: productsResult.status === 'fulfilled' ? asArray(productsResult.value) : [],
      errors: [profileResult, productsResult].filter((result) => result.status === 'rejected').map((result) => result.reason?.message),
    };
  }, []);
}

export function CustomerProfilePage() {
  const { data, loading, error } = useCustomerProfile();
  const profile = data?.profile || {};
  const savedIds = favoriteIds();
  const favoriteProducts = (data?.products || []).filter((product) => savedIds.includes(getId(product))).slice(0, 4);
  const avatar = resolveMediaUrl(profile.avatarUrl || profile.imageUrl || '');

  return (
    <div className="profile-page customer-profile-page">
      {loading ? <LoadingState title="Loading profile" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <ProfileHeader
        role="customer"
        name={profile.fullName || profile.name || 'Happy Shopper'}
        subtitle="Fresh produce buyer and FarmersHub marketplace member."
        location={profile.location || profile.address || 'Location not set'}
        avatarUrl={avatar}
        coverUrl={homeImage('hero-delivery.webp')}
        badge="Verified Customer"
        actions={(
          <>
            <Link className="primary-button" to="/customer/marketplace"><ShoppingBag size={18} /> Shop marketplace</Link>
            <Link className="secondary-button" to="/customer/settings"><Settings size={18} /> Edit profile</Link>
          </>
        )}
      />
      <ProfileStats
        stats={[
          { label: 'Orders', value: 'Pending', text: 'Checkout backend pending' },
          { label: 'Favorites', value: savedIds.length, text: 'Saved on this device' },
          { label: 'Reviews', value: 'Pending', text: 'Review API pending' },
          { label: 'Saved', value: savedIds.length, text: 'Local favorites' },
        ]}
      />
      <section className="profile-layout">
        <div className="profile-main-column">
          <ProfileAbout
            title="About"
            text={profile.bio || 'Customer profile details are ready for shopping, saved items, and farmer conversations.'}
            details={[
              { label: 'Email', value: profile.email || 'Not available' },
              { label: 'Role', value: profile.role || 'customer' },
              { label: 'Location', value: profile.location || profile.address || 'Not set' },
            ]}
          />
          <ProfileProducts
            title="Favorite Products"
            products={favoriteProducts}
            detailPath={customerProductPath}
            farmerPath={customerFarmerPath}
            allowCustomerActions
            emptyText="Favorite products will appear after the customer saves real marketplace listings."
            action={{ to: '/customer/favorites', label: 'View favorites' }}
          />
        </div>
        <aside className="profile-side-column">
          <InfoCard className="profile-action-card" title="Recent Orders">
            <div className="profile-mini-list">
              <article><PackageCheck size={18} /><div><strong>Order workflow</strong><p>Synced customer checkout is coming soon.</p></div><StatusBadge label="Pending" tone="gold" /></article>
              <article><ShieldCheck size={18} /><div><strong>Secure payments</strong><p>Payment status will be connected after checkout.</p></div><StatusBadge label="Preview" tone="green" /></article>
            </div>
          </InfoCard>
          <InfoCard className="profile-action-card" title="Settings">
            <div className="profile-mini-list">
              <article><Settings size={18} /><div><strong>Profile details</strong><p>Update customer account preferences.</p></div><Link className="secondary-button" to="/customer/settings">Open</Link></article>
              <article><Heart size={18} /><div><strong>Favorites</strong><p>{savedIds.length} saved product ids on this device.</p></div><Link className="secondary-button" to="/customer/favorites">Open</Link></article>
              <article><Star size={18} /><div><strong>Reviews</strong><p>Review history will appear when the backend supports it.</p></div><StatusBadge label="Pending" tone="gold" /></article>
            </div>
          </InfoCard>
        </aside>
      </section>
    </div>
  );
}
