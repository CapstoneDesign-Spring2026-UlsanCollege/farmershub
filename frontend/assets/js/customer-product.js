import { getProductById, getProductReviews, createProductReview } from './services/productService.js';
import {
  addProductToCart,
  customerFarmerUrl,
  customerMessageUrl,
  formatCurrency,
  formatDate,
  getInitials,
  getProductCategory,
  getProductId,
  getProductImage,
  getProductName,
  getProductPrice,
  getProductUnit,
  getSellerId,
  getSellerLocation,
  getSellerName,
  getStoredRole,
  getToken,
  hydrateCustomerShell,
  isFavorite,
  setStatus,
  toggleFavorite,
} from './customer-shell.js';

const shell = document.getElementById('productDetailShell');
const topTitle = document.getElementById('productTopTitle');
const searchForm = document.getElementById('productSearchForm');
const searchInput = document.getElementById('productSearchInput');
const params = new URLSearchParams(window.location.search);
const requestedId = params.get('id') || params.get('productId');

let activeProduct = null;

function renderState(title, body, type = '') {
  shell.innerHTML = '';
  const state = document.createElement('section');
  state.className = 'customer-state customer-empty';
  const heading = document.createElement('strong');
  heading.textContent = title;
  const copy = document.createElement('p');
  copy.textContent = body;
  state.append(heading, copy);
  if (type === 'error') state.classList.add('is-error');
  shell.appendChild(state);
}

function createImage(product) {
  const image = document.createElement('div');
  image.className = 'product-detail-image';
  const imageUrl = getProductImage(product);
  if (imageUrl) {
    image.style.backgroundImage = `url("${imageUrl}")`;
    image.setAttribute('role', 'img');
    image.setAttribute('aria-label', getProductName(product));
  } else {
    image.textContent = 'Image pending';
  }
  return image;
}

function addMeta(dl, label, value) {
  if (value === undefined || value === null || value === '') return;
  const item = document.createElement('div');
  const term = document.createElement('dt');
  const details = document.createElement('dd');
  term.textContent = label;
  details.textContent = value;
  item.append(term, details);
  dl.appendChild(item);
}

function updateFavoriteButton(button) {
  if (!button || !activeProduct) return;
  const saved = isFavorite(activeProduct);
  button.textContent = saved ? 'Saved on this device' : 'Save on this device';
  button.setAttribute('aria-pressed', saved ? 'true' : 'false');
}

function renderProduct(product) {
  activeProduct = product;
  const productId = getProductId(product);
  const sellerId = getSellerId(product);
  const sellerName = getSellerName(product);
  const productName = getProductName(product);
  topTitle.textContent = productName;
  shell.innerHTML = '';

  const detail = document.createElement('article');
  detail.className = 'customer-card product-detail-card';

  const copy = document.createElement('div');
  copy.className = 'product-detail-copy';

  const category = document.createElement('span');
  category.className = 'customer-pill';
  category.textContent = getProductCategory(product);

  const title = document.createElement('h2');
  title.textContent = productName;

  const price = document.createElement('strong');
  price.className = 'product-detail-price';
  price.textContent = `${formatCurrency(getProductPrice(product))} / ${getProductUnit(product)}`;

  const description = document.createElement('p');
  description.textContent = product.description || 'No product description was provided with this listing.';

  const meta = document.createElement('dl');
  meta.className = 'customer-meta-list';
  addMeta(meta, 'Category', getProductCategory(product));
  if (Number(product.ratingCount)) {
    const reviewWord = Number(product.ratingCount) === 1 ? 'review' : 'reviews';
    addMeta(meta, 'Rating', `${Number(product.rating).toFixed(1)} of 5 (${product.ratingCount} ${reviewWord})`);
  }
  addMeta(meta, 'Seller', sellerName);
  addMeta(meta, 'Location', getSellerLocation(product));
  if (product.stock !== undefined && product.stock !== null && product.stock !== '') {
    addMeta(meta, 'Stock returned', `${product.stock} ${getProductUnit(product)}`);
  }
  addMeta(meta, 'Harvest date', formatDate(product.harvestDate));
  addMeta(meta, 'Best before', formatDate(product.expiryDate));
  if (Array.isArray(product.paymentMethods) && product.paymentMethods.length) {
    addMeta(meta, 'Payment methods returned', product.paymentMethods.join(', '));
  }

  const status = document.createElement('p');
  status.className = 'customer-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  const actions = document.createElement('div');
  actions.className = 'product-detail-actions';

  const cartButton = document.createElement('button');
  cartButton.type = 'button';
  cartButton.className = 'customer-button';
  cartButton.textContent = 'Add to cart';
  cartButton.disabled = !productId;
  cartButton.addEventListener('click', () => {
    const result = addProductToCart(product);
    setStatus(status, result.message, result.ok ? 'success' : 'error');
  });

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'customer-secondary-button';
  saveButton.disabled = !productId;
  updateFavoriteButton(saveButton);
  saveButton.addEventListener('click', () => {
    const result = toggleFavorite(product);
    updateFavoriteButton(saveButton);
    setStatus(status, result.message, 'success');
  });

  let messageHref = '';
  let messageControl;
  if (sellerId) {
    messageHref = customerMessageUrl({
      recipientId: sellerId,
      recipientName: sellerName,
      recipientRole: 'farmer',
      productId,
      productName,
    });
    messageControl = document.createElement('a');
    messageControl.className = 'customer-secondary-button';
    messageControl.href = messageHref;
    messageControl.textContent = 'Message farmer';
  } else {
    messageControl = document.createElement('button');
    messageControl.type = 'button';
    messageControl.className = 'customer-secondary-button';
    messageControl.disabled = true;
    messageControl.textContent = 'Message farmer';
  }

  actions.append(cartButton, saveButton, messageControl);
  copy.append(category, title, price, description, meta, actions, status);
  detail.append(createImage(product), copy);
  shell.appendChild(detail);

  const seller = document.createElement('section');
  seller.className = 'customer-card product-seller-card';
  seller.setAttribute('aria-label', 'Seller information');

  const avatar = document.createElement('div');
  avatar.className = 'product-seller-avatar';
  avatar.textContent = getInitials(sellerName);

  const sellerCopy = document.createElement('div');
  const sellerHeading = document.createElement('h2');
  sellerHeading.textContent = sellerName;
  const sellerLocation = document.createElement('p');
  sellerLocation.textContent = getSellerLocation(product) || 'Seller location not provided.';
  sellerCopy.append(sellerHeading, sellerLocation);

  const sellerActions = document.createElement('div');
  sellerActions.className = 'product-seller-actions';
  const farmerLink = document.createElement('a');
  farmerLink.className = 'customer-secondary-button';
  farmerLink.href = sellerId ? customerFarmerUrl(sellerId) : 'customer-marketplace.html';
  farmerLink.textContent = 'View farmer';
  if (sellerId) {
    const farmerMessage = document.createElement('a');
    farmerMessage.className = 'customer-button';
    farmerMessage.href = messageHref;
    farmerMessage.textContent = 'Ask about this';
    sellerActions.append(farmerLink, farmerMessage);
  } else {
    const disabledMessage = document.createElement('button');
    disabledMessage.type = 'button';
    disabledMessage.className = 'customer-button';
    disabledMessage.disabled = true;
    disabledMessage.textContent = 'Ask about this';
    sellerActions.append(farmerLink, disabledMessage);
  }
  seller.append(avatar, sellerCopy, sellerActions);
  shell.appendChild(seller);

  appendReviews(product, productId);
}

function buildStars(value) {
  const stars = document.createElement('span');
  stars.className = 'review-stars';
  stars.setAttribute('aria-hidden', 'true');
  const rounded = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  stars.textContent = '★★★★★☆☆☆☆☆'.slice(5 - rounded, 10 - rounded);
  return stars;
}

function reviewSummaryLine(summary) {
  const wrap = document.createElement('div');
  wrap.className = 'reviews-summary';
  const count = Number(summary?.count || 0);
  const average = Number(summary?.average || 0);
  if (!count) {
    const none = document.createElement('p');
    none.className = 'reviews-note';
    none.textContent = 'No reviews yet. Customers can review after ordering.';
    wrap.appendChild(none);
    return wrap;
  }
  const score = document.createElement('strong');
  score.className = 'reviews-score';
  score.textContent = average.toFixed(1);
  const metaText = document.createElement('span');
  metaText.className = 'reviews-count';
  metaText.textContent = `${count} review${count === 1 ? '' : 's'}`;
  wrap.append(score, buildStars(average), metaText);
  return wrap;
}

function reviewItem(review) {
  const item = document.createElement('article');
  item.className = 'review-item';
  const head = document.createElement('div');
  head.className = 'review-head';
  const name = document.createElement('strong');
  name.textContent = review.customerName || 'Customer';
  head.append(name, buildStars(review.rating));
  const date = document.createElement('span');
  date.className = 'review-date';
  date.textContent = formatDate(review.createdAt);
  item.append(head, date);
  if (review.comment) {
    const comment = document.createElement('p');
    comment.className = 'review-comment';
    comment.textContent = review.comment;
    item.appendChild(comment);
  }
  return item;
}

async function renderReviews(productId, summaryHost, listHost) {
  summaryHost.replaceChildren();
  listHost.replaceChildren();
  try {
    const response = await getProductReviews(productId);
    const data = response.data || {};
    summaryHost.appendChild(reviewSummaryLine(data.summary));
    (Array.isArray(data.reviews) ? data.reviews : []).forEach((review) => {
      listHost.appendChild(reviewItem(review));
    });
  } catch {
    const fail = document.createElement('p');
    fail.className = 'reviews-note';
    fail.textContent = 'Reviews could not be loaded right now.';
    summaryHost.appendChild(fail);
  }
}

function appendReviews(product, productId) {
  if (!productId) return;
  const section = document.createElement('section');
  section.className = 'customer-card product-reviews-card';
  section.setAttribute('aria-label', 'Ratings and reviews');

  const heading = document.createElement('h2');
  heading.textContent = 'Ratings & Reviews';
  section.appendChild(heading);

  const summaryHost = document.createElement('div');
  const listHost = document.createElement('div');
  listHost.className = 'reviews-list';
  section.append(summaryHost, listHost);

  if (getToken() && getStoredRole() === 'customer') {
    const form = document.createElement('form');
    form.className = 'review-form';
    form.innerHTML = `
      <label>Your rating
        <select name="rating" required>
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Good</option>
          <option value="3">3 - Okay</option>
          <option value="2">2 - Poor</option>
          <option value="1">1 - Bad</option>
        </select>
      </label>
      <label>Your review (optional)
        <textarea name="comment" rows="3" maxlength="1000" placeholder="Share how the product was..."></textarea>
      </label>
      <button type="submit" class="customer-button">Submit review</button>
    `;
    const formStatus = document.createElement('p');
    formStatus.className = 'customer-status';
    formStatus.setAttribute('role', 'status');
    formStatus.setAttribute('aria-live', 'polite');
    form.appendChild(formStatus);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const rating = Number(form.elements.rating.value);
      const comment = String(form.elements.comment.value || '').trim();
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      setStatus(formStatus, 'Submitting your review...');
      try {
        await createProductReview(productId, { rating, comment });
        setStatus(formStatus, 'Thanks! Your review was posted.', 'success');
        form.remove();
        await renderReviews(productId, summaryHost, listHost);
      } catch (error) {
        setStatus(formStatus, error.message || 'Could not submit review.', 'error');
        submit.disabled = false;
      }
    });
    section.appendChild(form);
  } else if (!getToken()) {
    const note = document.createElement('p');
    note.className = 'reviews-note';
    note.textContent = 'Log in as a customer who ordered this product to leave a review.';
    section.appendChild(note);
  }

  shell.appendChild(section);
  renderReviews(productId, summaryHost, listHost);
}

async function loadProduct() {
  hydrateCustomerShell();

  if (!requestedId) {
    renderState('Product not selected', 'Open a product from Customer Marketplace to view its customer-safe details.', 'error');
    return;
  }

  try {
    const response = await getProductById(requestedId);
    if (!response.data) {
      renderState('Product unavailable', 'The Products API did not return a product for this id.', 'error');
      return;
    }
    renderProduct(response.data);
  } catch (error) {
    renderState('Unable to load product', error.message || 'Please return to the marketplace and try again.', 'error');
  }
}

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = String(searchInput?.value || '').trim();
  const params = new URLSearchParams();
  if (query) params.set('search', query);
  window.location.href = `customer-marketplace.html${params.toString() ? `?${params.toString()}` : ''}`;
});

loadProduct();
