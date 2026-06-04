import { useState } from 'react';
import { Send } from 'lucide-react';
import { createPost } from '../../api/postsApi.js';
import { getProfile } from '../../api/profileApi.js';
import { MetricCard, PageHeader } from '../../components/common/Page.jsx';
import { ErrorState, LoadingState, StatusMessage } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';

export function FarmerProfilePage() {
  const { data, loading, error, reload } = useAsyncData(getProfile, []);
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const profile = data?.data || data || {};

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
      setStatus({ message: 'Farm update published through the Posts API.', tone: 'success' });
      reload();
    } catch (postError) {
      setStatus({ message: postError.message || 'Unable to publish post.', tone: 'error' });
    }
  }

  return (
    <>
      <PageHeader eyebrow="Farm profile" title={profile.farmName || profile.fullName || 'Farmer profile'} text="Manage public farmer identity and publish farmer-owned updates." />
      {loading ? <LoadingState title="Loading profile" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <section className="metric-grid">
        <MetricCard label="Role" value={profile.role || 'farmer'} text="Farmer private workspace" />
        <MetricCard label="Products" value={profile.products || 'Not listed'} text="Profile products label" />
        <MetricCard label="Location" value={profile.location || profile.address || 'Not set'} text="Public profile context" />
      </section>
      <form className="info-card compact-form" onSubmit={handlePost}>
        <h2>Publish farm update</h2>
        <label className="wide-field">Update<textarea name="content" rows="4" placeholder="Share a farm update, harvest note or product announcement..." /></label>
        <label className="wide-field">Image<input type="file" name="image" accept="image/*" /></label>
        <button className="primary-button" type="submit"><Send size={17} /><span>Publish update</span></button>
      </form>
      <StatusMessage message={status.message} tone={status.tone} />
    </>
  );
}
