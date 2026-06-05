import { Link, useParams } from 'react-router-dom';
import { MessageCircle, ShieldCheck, ShoppingBasket, Wrench } from 'lucide-react';
import { getFarmerById } from '../../api/farmersApi.js';
import { InfoCard } from '../../components/common/Page.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { ErrorState, LoadingState } from '../../components/common/States.jsx';
import { ProfileAbout } from '../../components/profile/ProfileAbout.jsx';
import { ProfileHeader } from '../../components/profile/ProfileHeader.jsx';
import { ProfileProducts } from '../../components/profile/ProfileProducts.jsx';
import { ProfileStats } from '../../components/profile/ProfileStats.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { resolveMediaUrl } from '../../utils/format.js';
import { homeImage } from '../../utils/assets.js';

function customerProductPath(id) {
  return `/customer/products/${encodeURIComponent(id)}`;
}

export function CustomerFarmerProfilePage() {
  const { farmerId } = useParams();
  const { data, loading, error } = useAsyncData(() => getFarmerById(farmerId), [farmerId]);
  const farmer = data?.data || data || {};
  const products = Array.isArray(farmer.products) ? farmer.products : [];
  const posts = Array.isArray(farmer.posts) ? farmer.posts : [];
  const farmerName = farmer.farmName || farmer.fullName || farmer.name || 'Farmer profile';

  return (
    <div className="profile-page customer-facing-farmer-profile">
      {loading ? <LoadingState title="Loading farmer profile" /> : null}
      {error ? <ErrorState text={error} /> : null}
      {!loading && !error ? (
        <>
          <ProfileHeader
            role="farmer"
            name={farmerName}
            subtitle={farmer.bio || 'Public farmer profile with fresh products and customer-safe contact options.'}
            location={farmer.location || farmer.address || 'Location not listed'}
            avatarUrl={resolveMediaUrl(farmer.avatarUrl || farmer.imageUrl || '')}
            coverUrl={homeImage('farmer-fallback-1.webp')}
            badge="Verified Farmer"
            actions={(
              <>
                <Link className="primary-button" to={`/customer/messages?recipientId=${encodeURIComponent(farmerId)}&recipientName=${encodeURIComponent(farmerName)}&recipientRole=farmer`}><MessageCircle size={18} /> Message farmer</Link>
                <Link className="secondary-button" to="/customer/marketplace"><ShoppingBasket size={18} /> Shop products</Link>
              </>
            )}
          />
          <ProfileStats
            stats={[
              { label: 'Products', value: products.length, text: farmer.productsLabel || 'Returned products' },
              { label: 'Orders', value: 'Pending', text: 'Public order count pending' },
              { label: 'Rating', value: farmer.rating || '4.8', text: 'Customer-facing preview' },
              { label: 'Followers', value: farmer.followers || 'Pending', text: 'Social graph pending' },
            ]}
          />
          <section className="profile-layout">
            <div className="profile-main-column">
              <ProfileAbout
                title="About Farm"
                text={farmer.bio || 'This farmer profile shares public farm identity, product listings, and safe customer contact actions.'}
                details={[
                  { label: 'Farm type', value: farmer.farmType || farmer.productsLabel || 'Fresh produce' },
                  { label: 'Location', value: farmer.location || farmer.address || 'Not listed' },
                  { label: 'Public posts', value: posts.length },
                ]}
              />
              <ProfileProducts
                products={products}
                detailPath={customerProductPath}
                allowCustomerActions
                emptyText="Products from this farmer will appear when the public farmer endpoint returns listings."
              />
            </div>
            <aside className="profile-side-column">
              <InfoCard className="profile-action-card" title="Customer Actions">
                <div className="profile-mini-list">
                  <article><MessageCircle size={18} /><div><strong>Contact farmer</strong><p>Start a customer-to-farmer conversation.</p></div><Link className="secondary-button" to={`/customer/messages?recipientId=${encodeURIComponent(farmerId)}&recipientName=${encodeURIComponent(farmerName)}&recipientRole=farmer`}>Message</Link></article>
                  <article><Wrench size={18} /><div><strong>Service requests</strong><p>Farm services are available in the farmer workspace.</p></div><StatusBadge label="Farmer only" tone="gold" /></article>
                  <article><ShieldCheck size={18} /><div><strong>Verified profile</strong><p>Verification is shown as a customer trust signal.</p></div><StatusBadge label="Verified" tone="green" /></article>
                </div>
              </InfoCard>
            </aside>
          </section>
        </>
      ) : null}
    </div>
  );
}
