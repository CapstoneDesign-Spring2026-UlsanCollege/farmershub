import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, Settings, ShieldCheck, Sprout, Users } from 'lucide-react';
import { getProducts } from '../../api/productsApi.js';
import { createPost, getPosts } from '../../api/postsApi.js';
import { getProfile } from '../../api/profileApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { InfoCard } from '../../components/common/Page.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { ErrorState, LoadingState, StatusMessage } from '../../components/common/States.jsx';
import { ProfileAbout } from '../../components/profile/ProfileAbout.jsx';
import { ProfileHeader } from '../../components/profile/ProfileHeader.jsx';
import { ProfileProducts } from '../../components/profile/ProfileProducts.jsx';
import { ProfileStats } from '../../components/profile/ProfileStats.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { asArray, resolveMediaUrl } from '../../utils/format.js';
import { homeImage } from '../../utils/assets.js';

function useFarmerProfile(userId) {
  return useAsyncData(async () => {
    const [profileResult, productsResult, postsResult] = await Promise.allSettled([
      getProfile(),
      getProducts(userId ? { farmerId: userId } : {}),
      getPosts(),
    ]);
    return {
      profile: profileResult.status === 'fulfilled' ? profileResult.value?.data || profileResult.value : {},
      products: productsResult.status === 'fulfilled' ? asArray(productsResult.value) : [],
      posts: postsResult.status === 'fulfilled' ? asArray(postsResult.value) : [],
      errors: [profileResult, productsResult, postsResult].filter((result) => result.status === 'rejected').map((result) => result.reason?.message),
    };
  }, [userId]);
}

export function FarmerProfilePage() {
  const { user } = useAuth();
  const userId = user?.id || user?._id;
  const { data, loading, error, reload } = useFarmerProfile(userId);
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const profile = data?.profile || {};
  const products = data?.products || [];
  const posts = data?.posts || [];

  async function handlePost(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get('image');
    if (file?.size) formData.set('images', file);
    formData.delete('image');
    try {
      await createPost(formData);
      form.reset();
      setStatus({ message: 'Farm update published.', tone: 'success' });
      reload();
    } catch (postError) {
      setStatus({ message: postError.message || 'Unable to publish post.', tone: 'error' });
    }
  }

  return (
    <div className="profile-page farmer-profile-page">
      {loading ? <LoadingState title="Loading farm profile" /> : null}
      {error ? <ErrorState text={error} /> : null}
      {data?.errors?.length ? <StatusMessage message={data.errors.join(' ')} tone="error" /> : null}
      <ProfileHeader
        role="farmer"
        name={profile.farmName || profile.fullName || user?.fullName || 'Farmer profile'}
        subtitle={profile.bio || 'Verified farm profile for products, customers, and farm updates.'}
        location={profile.location || profile.address || 'Farm location not set'}
        avatarUrl={resolveMediaUrl(profile.avatarUrl || profile.imageUrl || '')}
        coverUrl={homeImage('farmer-fallback-2.webp')}
        badge="Verified Farmer"
        actions={(
          <>
            <Link className="primary-button" to="/farmer/products"><Sprout size={18} /> Manage products</Link>
            <Link className="secondary-button" to="/farmer/settings"><Settings size={18} /> Edit profile</Link>
          </>
        )}
      />
      <ProfileStats
        stats={[
          { label: 'Products', value: products.length, text: 'Current listings' },
          { label: 'Orders', value: 'Pending', text: 'Order backend pending' },
          { label: 'Rating', value: profile.rating || '4.8', text: 'Public profile preview' },
          { label: 'Followers', value: profile.followers || 'Pending', text: 'Social graph pending' },
        ]}
      />
      <section className="profile-layout">
        <div className="profile-main-column">
          <ProfileAbout
            title="About Farm"
            text={profile.bio || 'We grow fresh produce and keep customers updated through FarmersHub.'}
            details={[
              { label: 'Farm type', value: profile.farmType || profile.productsLabel || 'Mixed produce' },
              { label: 'Location', value: profile.location || profile.address || 'Not set' },
              { label: 'Member since', value: profile.createdAt ? new Date(profile.createdAt).getFullYear() : 'Pending' },
            ]}
          />
          <ProfileProducts
            products={products.slice(0, 6)}
            emptyText="Products will appear here after this farmer adds listings."
            action={{ to: '/farmer/products', label: 'Manage products' }}
          />
        </div>
        <aside className="profile-side-column">
          <form className="info-card compact-form farm-update-form" onSubmit={handlePost}>
            <h2>Publish farm update</h2>
            <label className="wide-field">Update<textarea name="content" rows="4" placeholder="Share a harvest note or product announcement..." /></label>
            <label className="wide-field">Image<input type="file" name="image" accept="image/*" /></label>
            <button className="primary-button" type="submit"><Send size={17} /><span>Publish update</span></button>
          </form>
          <StatusMessage message={status.message} tone={status.tone} />
          <InfoCard className="profile-action-card" title="Farm Activity">
            <div className="profile-mini-list">
              <article><MessageCircle size={18} /><div><strong>Messages</strong><p>Buyer conversations are available from Messages.</p></div><Link className="secondary-button" to="/farmer/messages">Open</Link></article>
              <article><Users size={18} /><div><strong>Customers</strong><p>Customer lists load from the customers workspace.</p></div><Link className="secondary-button" to="/farmer/customers">Open</Link></article>
              <article><ShieldCheck size={18} /><div><strong>Feed posts</strong><p>{posts.length} public feed items returned.</p></div><StatusBadge label={posts.length ? 'Live' : 'Pending'} tone={posts.length ? 'green' : 'gold'} /></article>
            </div>
          </InfoCard>
        </aside>
      </section>
    </div>
  );
}
