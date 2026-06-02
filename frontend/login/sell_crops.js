import { getCurrentUser } from '../js/authService.js';
import '../assets/js/notification-float.js';
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct as removeProduct,
} from '../js/productService.js';

const LOCAL_LISTINGS_KEY = 'fh_sell_crops_local_listings';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x450?text=No+Image';

let products = [];
let currentEditingProductId = null;
let currentUser = null;

const addProductBtn = document.getElementById('addProductBtn');
const emptyAddBtn = document.getElementById('emptyAddBtn');
const productCount = document.getElementById('productCount');
const productModal = document.getElementById('productModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const productForm = document.getElementById('productForm');
const productsGrid = document.getElementById('productsGrid');
const emptyState = document.getElementById('emptyState');
const detailsModal = document.getElementById('detailsModal');
const closeDetailsBtn = document.getElementById('closeDetailsBtn');
const closeDetailsModalBtn = document.getElementById('closeDetailsModalBtn');
const editProductBtn = document.getElementById('editProductBtn');
const deleteProductBtn = document.getElementById('deleteProductBtn');
const detailsContent = document.getElementById('detailsContent');
const productImageInput = document.getElementById('productImage');
const imagePreview = document.getElementById('imagePreview');
const modalTitle = document.getElementById('modalTitle');

document.addEventListener('DOMContentLoaded', function () {
  currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'farmer') {
    alert('Please log in as a farmer to manage products.');
    window.location.href = 'login.html';
    return;
  }

  fillSellerInfo(currentUser);
  setupEventListeners();
  loadProductsFromAPI();
});

function fillSellerInfo(user) {
  const sellerNameEl = document.getElementById('sellerName');
  const sellerEmailEl = document.getElementById('sellerEmail');
  const sellerPhoneEl = document.getElementById('sellerPhone');
  const sellerLocationEl = document.getElementById('sellerLocation');
  if (sellerNameEl && user.fullName) sellerNameEl.value = user.fullName;
  if (sellerEmailEl && user.email) sellerEmailEl.value = user.email;
  if (sellerPhoneEl && user.phone) sellerPhoneEl.value = user.phone;
  if (sellerLocationEl && user.address) sellerLocationEl.value = user.address;
}

function setupEventListeners() {
  addProductBtn.addEventListener('click', openAddProductModal);
  if (emptyAddBtn) emptyAddBtn.addEventListener('click', openAddProductModal);
  closeModalBtn.addEventListener('click', closeProductModal);
  cancelBtn.addEventListener('click', closeProductModal);
  closeDetailsBtn.addEventListener('click', closeDetailsModal);
  closeDetailsModalBtn.addEventListener('click', closeDetailsModal);
  productForm.addEventListener('submit', handleFormSubmit);
  productImageInput.addEventListener('change', handleImageChange);
  editProductBtn.addEventListener('click', editProduct);
  deleteProductBtn.addEventListener('click', deleteProduct);

  productModal.addEventListener('click', function (event) {
    if (event.target === productModal) closeProductModal();
  });

  detailsModal.addEventListener('click', function (event) {
    if (event.target === detailsModal) closeDetailsModal();
  });
}

function openAddProductModal() {
  currentEditingProductId = null;
  productForm.reset();
  fillSellerInfo(currentUser);
  imagePreview.innerHTML = '<span>No image selected</span>';
  modalTitle.textContent = 'Add New Product';
  const submitBtn = productForm.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = 'List Product';
  productModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  productModal.classList.add('hidden');
  document.body.style.overflow = 'auto';
  productForm.reset();
  fillSellerInfo(currentUser);
  imagePreview.innerHTML = '<span>No image selected</span>';
  currentEditingProductId = null;
}

function closeDetailsModal() {
  detailsModal.classList.add('hidden');
  document.body.style.overflow = 'auto';
}

function handleImageChange(event) {
  const file = event.target.files[0];
  if (!file) {
    imagePreview.innerHTML = '<span>No image selected</span>';
    return;
  }

  const reader = new FileReader();
  reader.onload = function (readerEvent) {
    imagePreview.innerHTML = `<img src="${readerEvent.target.result}" alt="Product Image">`;
  };
  reader.readAsDataURL(file);
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const paymentCheckboxes = document.querySelectorAll('input[name="paymentMethod"]:checked');
  if (paymentCheckboxes.length === 0) {
    alert('Please select at least one payment method.');
    return;
  }

  const harvestDate = new Date(document.getElementById('harvestDate').value);
  const expiryDate = new Date(document.getElementById('expiryDate').value);
  if (expiryDate <= harvestDate) {
    alert('Expiry date must be after harvest date.');
    return;
  }

  const imageFile = productImageInput.files[0];
  const paymentMethods = Array.from(paymentCheckboxes).map(checkbox => checkbox.value);
  const listingData = await buildListingFromForm({ imageFile, paymentMethods });
  const submitBtn = productForm.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
  }

  try {
    if (currentEditingProductId && isLocalProductId(currentEditingProductId)) {
      saveLocalProduct({ ...listingData, id: currentEditingProductId, updatedAt: new Date().toISOString() });
      alert('Listing updated locally.');
    } else if (currentEditingProductId) {
      await updateRemoteProduct(currentEditingProductId, listingData, imageFile);
      alert('Product updated successfully!');
    } else {
      await createListing(listingData, imageFile);
    }

    await loadProductsFromAPI();
    closeProductModal();
  } catch (error) {
    alert('Failed to save product: ' + error.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = currentEditingProductId ? 'Update Product' : 'List Product';
    }
  }
}

async function createListing(listingData, imageFile) {
  try {
    await createProduct(buildListingFormData(listingData, imageFile));
    alert('Product added successfully!');
  } catch (apiError) {
    saveLocalProduct(listingData);
    alert('Listing saved locally. It will stay visible on this device even if the API is unavailable.');
  }
}

async function updateRemoteProduct(id, listingData, imageFile) {
  if (imageFile) {
    await updateProduct(id, buildListingFormData(listingData, imageFile));
    return;
  }

  await updateProduct(id, {
    name: listingData.name,
    brand: listingData.brand,
    description: listingData.description,
    category: listingData.category,
    costPrice: listingData.costPrice,
    sellingPrice: listingData.sellingPrice,
    discount: listingData.discount,
    stock: listingData.stock,
    unit: listingData.unit,
    harvestDate: listingData.harvestDate,
    expiryDate: listingData.expiryDate,
    paymentMethods: listingData.paymentMethods,
    sellerName: listingData.seller.name,
    sellerEmail: listingData.seller.email,
    sellerPhone: listingData.seller.phone,
    location: listingData.seller.location,
  });
}

function renderProducts() {
  productsGrid.innerHTML = '';
  productCount.textContent = `${products.length} product${products.length === 1 ? '' : 's'} listed`;

  if (products.length === 0) {
    emptyState.style.display = 'grid';
    productsGrid.appendChild(emptyState);
    return;
  }

  emptyState.style.display = 'none';
  products.forEach(product => productsGrid.appendChild(createProductCard(product)));
}

function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  const imageUrl = product.imageUrl || PLACEHOLDER_IMAGE;
  const finalPrice = Number((product.sellingPrice || 0) * (1 - (product.discount || 0) / 100)).toFixed(2);
  const daysUntilExpiry = Math.ceil((new Date(product.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  const expiryLabel = daysUntilExpiry < 0 ? 'Expired' : daysUntilExpiry < 7 ? `Expires in ${daysUntilExpiry}d` : 'Fresh';

  card.innerHTML = `
    <img src="${imageUrl}" alt="${product.name}" class="product-card-image">
    <div class="product-card-body">
      <div class="product-card-title">${product.name}</div>
      <div class="product-card-category">${capitalizeCategory(product.category)}</div>
      <div class="product-card-price">$${finalPrice}</div>
      <div class="product-card-stock">Stock: ${product.stock || 0} ${product.unit || 'pcs'}</div>
      <div class="product-card-meta">${expiryLabel} - Discount ${Number(product.discount || 0).toFixed(0)}%</div>
      <div class="product-card-description">${product.description || 'No description provided.'}</div>
    </div>
  `;

  card.addEventListener('click', () => showProductDetails(product));
  return card;
}

function showProductDetails(product) {
  const paymentMethodsText = (product.paymentMethods || [])
    .map(method => capitalizePaymentMethod(method))
    .join(', ');
  const daysUntilExpiry = Math.ceil((new Date(product.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  const expiryStatus = daysUntilExpiry < 0 ? 'Expired' : daysUntilExpiry < 7 ? `Expires in ${daysUntilExpiry} days` : 'Fresh';
  const costPrice = Number(product.costPrice || 0).toFixed(2);
  const sellingPrice = Number(product.sellingPrice || 0).toFixed(2);
  const finalPrice = Number(product.price || product.sellingPrice || 0).toFixed(2);

  detailsContent.innerHTML = `
    <img src="${product.imageUrl || PLACEHOLDER_IMAGE}" alt="${product.name}" class="detail-image">
    ${detailRow('Product Name:', product.name)}
    ${detailRow('Category:', capitalizeCategory(product.category))}
    ${detailRow('Farm / Variety:', product.brand || 'N/A')}
    ${detailRow('Description:', product.description || 'N/A')}
    ${detailRow('Cost Price:', '$' + costPrice)}
    ${detailRow('Selling Price:', '$' + sellingPrice)}
    ${detailRow('Discount:', `${Number(product.discount || 0)}%`)}
    ${detailRow('Final Price:', `<strong>$${finalPrice}</strong>`)}
    ${detailRow('Stock:', `${product.stock || 0} ${product.unit || 'pcs'}`)}
    ${detailRow('Harvest Date:', formatDate(product.harvestDate))}
    ${detailRow('Expiry Date:', `${formatDate(product.expiryDate)} (${expiryStatus})`)}
    ${detailRow('Payment Methods:', paymentMethodsText || 'N/A')}
    ${detailRow('Seller Name:', product.seller?.name || 'N/A')}
    ${detailRow('Seller Email:', product.seller?.email ? `<a href="mailto:${product.seller.email}">${product.seller.email}</a>` : 'N/A')}
    ${detailRow('Seller Phone:', product.seller?.phone ? `<a href="tel:${product.seller.phone}">${product.seller.phone}</a>` : 'N/A')}
    ${detailRow('Location:', product.seller?.location || 'N/A')}
    ${detailRow('Listed:', formatDate(product.createdAt))}
  `;

  currentEditingProductId = product.id;
  detailsModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function detailRow(label, value) {
  return `
    <div class="detail-row">
      <div class="detail-label">${label}</div>
      <div class="detail-value">${value}</div>
    </div>
  `;
}

function editProduct() {
  const product = products.find(item => item.id === currentEditingProductId);
  if (!product) return;

  document.getElementById('name').value = product.name || '';
  document.getElementById('category').value = product.category || '';
  document.getElementById('brand').value = product.brand || '';
  document.getElementById('description').value = product.description || '';
  document.getElementById('costPrice').value = product.costPrice || 0;
  document.getElementById('sellingPrice').value = product.sellingPrice || 0;
  document.getElementById('discount').value = product.discount || 0;
  document.getElementById('stock').value = product.stock || 0;
  document.getElementById('unit').value = product.unit || '';
  document.getElementById('harvestDate').value = toDateInputValue(product.harvestDate);
  document.getElementById('expiryDate').value = toDateInputValue(product.expiryDate);
  document.getElementById('sellerName').value = product.seller?.name || '';
  document.getElementById('sellerEmail').value = product.seller?.email || '';
  document.getElementById('sellerPhone').value = product.seller?.phone || '';
  document.getElementById('sellerLocation').value = product.seller?.location || '';

  document.querySelectorAll('input[name="paymentMethod"]').forEach(checkbox => {
    checkbox.checked = (product.paymentMethods || []).includes(checkbox.value);
  });

  imagePreview.innerHTML = product.imageUrl
    ? `<img src="${product.imageUrl}" alt="Product Image">`
    : '<span>No image selected</span>';

  modalTitle.textContent = 'Edit Product';
  const submitBtn = productForm.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = 'Update Product';
  closeDetailsModal();
  productModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

async function deleteProduct() {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    if (isLocalProductId(currentEditingProductId)) {
      deleteLocalProduct(currentEditingProductId);
    } else {
      await removeProduct(currentEditingProductId);
    }

    await loadProductsFromAPI();
    closeDetailsModal();
    alert('Product deleted successfully!');
  } catch (error) {
    alert('Failed to delete product: ' + error.message);
  }
}

async function loadProductsFromAPI() {
  const localProducts = getLocalProductsForCurrentUser();

  try {
    const params = { limit: 100 };
    const farmerId = getCurrentUserId();
    if (farmerId) params.farmerId = farmerId;
    const data = await getProducts(params);
    products = mergeProducts(localProducts, data.data || []);
  } catch (error) {
    console.error('Failed to load products:', error);
    products = localProducts;
  }

  renderProducts();
}

async function buildListingFromForm({ imageFile, paymentMethods }) {
  const sellingPrice = parseFloat(document.getElementById('sellingPrice').value) || 0;
  const discount = parseFloat(document.getElementById('discount').value) || 0;
  const price = Number((sellingPrice * (1 - discount / 100)).toFixed(2));
  const imageUrl = imageFile ? await readFileAsDataUrl(imageFile) : '';

  return {
    id: `local-${Date.now()}`,
    name: document.getElementById('name').value.trim(),
    brand: document.getElementById('brand').value.trim(),
    description: document.getElementById('description').value.trim(),
    category: document.getElementById('category').value,
    costPrice: parseFloat(document.getElementById('costPrice').value) || 0,
    sellingPrice,
    discount,
    price,
    stock: parseInt(document.getElementById('stock').value, 10) || 0,
    unit: document.getElementById('unit').value,
    harvestDate: document.getElementById('harvestDate').value,
    expiryDate: document.getElementById('expiryDate').value,
    imageUrl,
    paymentMethods,
    seller: {
      id: getCurrentUserId(),
      role: currentUser?.role || 'farmer',
      name: document.getElementById('sellerName').value.trim(),
      email: document.getElementById('sellerEmail').value.trim(),
      phone: document.getElementById('sellerPhone').value.trim(),
      location: document.getElementById('sellerLocation').value.trim(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function buildListingFormData(listing, imageFile) {
  const form = new FormData();
  form.append('name', listing.name);
  form.append('brand', listing.brand);
  form.append('description', listing.description);
  form.append('category', listing.category);
  form.append('costPrice', listing.costPrice);
  form.append('sellingPrice', listing.sellingPrice);
  form.append('discount', listing.discount);
  form.append('stock', listing.stock);
  form.append('unit', listing.unit);
  form.append('harvestDate', listing.harvestDate);
  form.append('expiryDate', listing.expiryDate);
  form.append('sellerName', listing.seller.name);
  form.append('sellerEmail', listing.seller.email);
  form.append('sellerPhone', listing.seller.phone);
  form.append('location', listing.seller.location);
  listing.paymentMethods.forEach(method => form.append('paymentMethods[]', method));
  if (imageFile) form.append('images', imageFile);
  return form;
}

function readFileAsDataUrl(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = event => resolve(event.target.result);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

function getCurrentUserId() {
  return currentUser?.id || currentUser?._id || currentUser?.email || 'local-farmer';
}

function getAllLocalProducts() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_LISTINGS_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function getLocalProductsForCurrentUser() {
  const userId = getCurrentUserId();
  return getAllLocalProducts().filter(product => product.seller?.id === userId);
}

function saveLocalProduct(product) {
  const allProducts = getAllLocalProducts();
  const nextProducts = allProducts.filter(item => item.id !== product.id);
  nextProducts.unshift(product);
  localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify(nextProducts));
}

function deleteLocalProduct(id) {
  const nextProducts = getAllLocalProducts().filter(product => product.id !== id);
  localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify(nextProducts));
}

function isLocalProductId(id) {
  return String(id || '').startsWith('local-');
}

function mergeProducts(localProducts, apiProducts) {
  const localIds = new Set(localProducts.map(product => product.id));
  return [...localProducts, ...apiProducts.filter(product => !localIds.has(product.id))];
}

function capitalizeCategory(category) {
  const categories = {
    vegetables: 'Vegetables',
    fruits: 'Fruits',
    grains: 'Grains',
    dairy: 'Dairy',
    spices: 'Spices',
    other: 'Other',
  };
  return categories[category] || category || 'Other';
}

function capitalizePaymentMethod(method) {
  const methods = {
    cash: 'Cash',
    card: 'Credit/Debit Card',
    bank_transfer: 'Bank Transfer',
    digital_wallet: 'Digital Wallet',
  };
  return methods[method] || method;
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function toDateInputValue(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
}
