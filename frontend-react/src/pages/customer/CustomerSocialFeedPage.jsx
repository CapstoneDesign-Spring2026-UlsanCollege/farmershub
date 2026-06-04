import { getPosts } from '../../api/postsApi.js';
import { PageHeader } from '../../components/common/Page.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { asArray, formatDate } from '../../utils/format.js';

export function CustomerSocialFeedPage() {
  const { data, loading, error } = useAsyncData(getPosts, []);
  const posts = asArray(data);

  return (
    <>
      <PageHeader eyebrow="Social feed preview" title="FarmersHub community updates" text="Customer feed keeps preview behavior: public posts may be read, but customer posting is not claimed as complete." />
      {loading ? <LoadingState title="Loading community updates" /> : null}
      {error ? <ErrorState text={error} /> : null}
      {!loading && !posts.length ? <EmptyState title="No updates yet" text="Public feed items will appear after farmers publish updates." /> : null}
      <div className="list-stack">
        {posts.slice(0, 12).map((post) => (
          <article className="feed-item" key={post.id || post._id || post.createdAt}>
            <strong>{post.author?.name || post.author?.fullName || 'FarmersHub member'}</strong>
            <p>{post.text || post.content || post.description || 'Community update'}</p>
            <span>{formatDate(post.createdAt)} - preview actions only</span>
          </article>
        ))}
      </div>
    </>
  );
}
