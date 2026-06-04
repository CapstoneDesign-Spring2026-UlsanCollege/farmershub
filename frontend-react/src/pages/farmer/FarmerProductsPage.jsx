import { useState } from 'react';
import { Plus } from 'lucide-react';
import { createProduct, deleteProduct, getProducts } from '../../api/productsApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { InfoCard, PageHeader } from '../../components/common/Page.jsx';
import { EmptyState, ErrorState, LoadingState, StatusMessage } from '../../components/common/States.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { asArray, formatMoney, getId } from '../../utils/format.js';

export function FarmerProductsPage() {
  const { user } = useAuth();
  const userId = user?.id || user?._id;
  const { data, loading, error, reload } = useAsyncData(() => getProducts(userId ? { farmerId: userId } : {}), [userId]);
  const [status, setStatus] = useState({ message: '', tone: 'info' });
  const products = asArray(data);

  async function handleCreate(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get('image');
    if (file?.size) {
      formData.set('images', file);
    }
    formData.delete('image');
    try {
      await createProduct(formData);
      form.reset();
      setStatus({ message: 'Product created through the Products API.', tone: 'success' });
      reload();
    } catch (createError) {
      setStatus({ message: createError.message || 'Unable to create product.', tone: 'error' });
    }
  }

  async function handleDelete(id) {
    try {
      await deleteProduct(id);
      setStatus({ message: 'Product deleted.', tone: 'success' });
      reload();
    } catch (deleteError) {
      setStatus({ message: deleteError.message || 'Unable to delete product.', tone: 'error' });
    }
  }

  return (
    <>
      <PageHeader eyebrow="Products" title="Manage farm product listings" text="This page uses the real Products API and does not render customer cart or provider controls." />
      <StatusMessage message={status.message} tone={status.tone} />
      <section className="two-column">
        <form className="info-card compact-form" onSubmit={handleCreate}>
          <h2>Add product</h2>
          <label>Name<input name="name" required /></label>
          <label>Category<input name="category" placeholder="vegetables" required /></label>
          <label>Selling price<input name="sellingPrice" type="number" min="0" step="1" required /></label>
          <label>Stock<input name="stock" type="number" min="0" step="1" defaultValue="0" /></label>
          <label>Unit<input name="unit" defaultValue="kg" /></label>
          <label className="wide-field">Description<textarea name="description" rows="4" /></label>
          <label className="wide-field">Image<input name="image" type="file" accept="image/*" /></label>
          <button className="primary-button" type="submit"><Plus size={17} /><span>Create product</span></button>
        </form>
        <article className="info-card">
          <h2>Listing truth</h2>
          <p>Inventory, dashboard stock and marketplace availability are currently derived from these product records. Full order-based stock history is pending.</p>
        </article>
      </section>
      {loading ? <LoadingState title="Loading products" /> : null}
      {error ? <ErrorState text={error} /> : null}
      <div className="list-stack">
        {products.map((product) => (
          <article className="line-item" key={getId(product)}>
            <div>
              <strong>{product.name}</strong>
              <span>{formatMoney(product.price || product.sellingPrice)} - Stock {product.stock ?? 'not listed'} {product.unit || ''}</span>
              <p>{product.description || 'No description.'}</p>
            </div>
            <button className="secondary-button" type="button" onClick={() => handleDelete(getId(product))}>Delete</button>
          </article>
        ))}
      </div>
      {!loading && !products.length ? <EmptyState title="No products listed yet" text="Create a product to publish it to the marketplace." /> : null}
    </>
  );
}
