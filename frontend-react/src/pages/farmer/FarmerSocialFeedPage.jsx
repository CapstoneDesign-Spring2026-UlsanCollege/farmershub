import { useMemo } from 'react';
import { getPosts } from '../../api/postsApi.js';
import { PageHeader } from '../../components/common/Page.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { asArray, formatDate } from '../../utils/format.js';

export function FarmerSocialFeedPage() {
  const { data, loading, error } = useAsyncData(getPosts, []);
  const posts = asArray(data);
  const farmerPosts = useMemo(() => posts.filter((post) => post.author?.role === 'farmer' || post.authorRole === 'farmer'), [posts]);

  return (
    <>
      <PageHeader eyebrow="Farm feed" title="Farmer-owned feed surface" text="This replaces the static farmer link to customer-facing social-feed.html. Publishing is handled from Farmer Profile." />
      {loading ? <LoadingState title="Loading farmer updates" /> : null}
      {error ? <ErrorState text={error} /> : null}
      {!loading && !farmerPosts.length ? <EmptyState title="No farmer updates yet" text="Publish a farm update from your profile, or wait for farmer posts to appear in the public feed." /> : null}
      <div className="list-stack">
        {farmerPosts.map((post) => (
          <article className="feed-item" key={post.id || post._id || post.createdAt}>
            <strong>{post.author?.name || post.author?.fullName || 'Farmer'}</strong>
            <p>{post.content || post.text || post.caption || 'Farm update'}</p>
            <span>{formatDate(post.createdAt)}</span>
          </article>
        ))}
      </div>
    </>
  );
}
