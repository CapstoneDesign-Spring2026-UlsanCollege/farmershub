import { getCurrentUser } from '../js/authService.js';
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct as removeProduct,
} from '../js/productService.js';

/* ─── State ──────────────────────────────────────────────────────────── */
let products = [];
let currentEditingProductId = null;

// DOM Elements
const addProductBtn = document.getElementById('addProductBtn');
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

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'farmer') {
    alert('Please log in as a farmer to manage products.');
    window.location.href = 'login.html';
    return;
  }

  setupEventListeners();
  loadProductsFromAPI();
});

// Event Listeners
function setupEventListeners() {
  // Modal controls
  addProductBtn.addEventListener('click', openAddProductModal);
  closeModalBtn.addEventListener('click', closeProductModal);
  cancelBtn.addEventListener('click', closeProductModal);
  closeDetailsBtn.addEventListener('click', closeDetailsModal);
  closeDetailsModalBtn.addEventListener('click', closeDetailsModal);
  
  // Form
  productForm.addEventListener('submit', handleFormSubmit);
  productImageInput.addEventListener('change', handleImageChange);

  // Details modal actions
  editProductBtn.addEventListener('click', editProduct);
  deleteProductBtn.addEventListener('click', deleteProduct);

  // Close modals when clicking outside
  productModal.addEventListener('click', function(e) {
    if (e.target === productModal) closeProductModal();
  });
  detailsModal.addEventListener('click', function(e) {
    if (e.target === detailsModal) closeDetailsModal();
  });
}

// Modal Functions
function openAddProductModal() {
  currentEditingProductId = null;
  productForm.reset();
  imagePreview.innerHTML = '<span>No image selected</span>';
  modalTitle.textContent = 'Add New Product';
  productModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  productModal.classList.add('hidden');
  document.body.style.overflow = 'auto';
  productForm.reset();
  imagePreview.innerHTML = '<span>No image selected</span>';
  currentEditingProductId = null;
}

function closeDetailsModal() {
  detailsModal.classList.add('hidden');
  document.body.style.overflow = 'auto';
}

// Image Preview
function handleImageChange(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      imagePreview.innerHTML = `<img src="${event.target.result}" alt="Product Image">`;
    };
    reader.readAsDataURL(file);
  }
}

// Form Submission
async function handleFormSubmit(e) {
  e.preventDefault();

  const paymentCheckboxes = document.querySelectorAll('input[name="paymentMethod"]:checked');
  if (paymentCheckboxes.length === 0) {
    alert('Please select at least one payment method');
    return;
  }

  const harvestDate = new Date(document.getElementById('harvestDate').value);
  const expiryDate = new Date(document.getElementById('expiryDate').value);
  if (expiryDate <= harvestDate) {
    alert('Expiry date must be after harvest date');
    return;
  }

  const imageFile = productImageInput.files[0];
  if (!imageFile && !currentEditingProductId) {
    alert('Please select a product image');
    return;
  }

  const costPrice = parseFloat(document.getElementById('costPrice').value);
  const sellingPrice = parseFloat(document.getElementById('sellingPrice').value);
  const discount = parseFloat(document.getElementById('discount').value) || 0;
  const paymentMethods = Array.from(paymentCheckboxes).map(cb => cb.value);

  const submitBtn = document.getElementById('btn') || productForm.querySelector('button[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Saving...'; }

  try {
    if (currentEditingProductId) {
      // Update via PUT (JSON, no file re-upload unless new file selected)
      const updates = {
        name: document.getElementById('name').value,
        brand: document.getElementById('brand').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        costPrice, sellingPrice, discount,
        stock: parseInt(document.getElementById('stock').value, 10),
        unit: document.getElementById('unit').value,
        harvestDate: document.getElementById('harvestDate').value,
        expiryDate: document.getElementById('expiryDate').value,
        paymentMethods,
        sellerName: document.getElementById('sellerName').value,
        sellerEmail: document.getElementById('sellerEmail').value,
        sellerPhone: document.getElementById('sellerPhone').value,
        location: document.getElementById('sellerLocation').value,
      };
      if (imageFile) {
        // Re-upload with FormData
        const form = new FormData();
        Object.entries(updates).forEach(([k, v]) =>
          Array.isArray(v) ? v.forEach(i => form.append(k + '[]', i)) : form.append(k, v)
        );
        form.append('images', imageFile);
        await updateProduct(currentEditingProductId, form);
      } else {
        await updateProduct(currentEditingProductId, updates);
      }
      alert('Product updated successfully!');
    } else {
      // Create via POST with FormData (multipart)
      const form = new FormData();
      form.append('name', document.getElementById('name').value);
      form.append('brand', document.getElementById('brand').value);
      form.append('description', document.getElementById('description').value);
      form.append('category', document.getElementById('category').value);
      form.append('costPrice', costPrice);
      form.append('sellingPrice', sellingPrice);
      form.append('discount', discount);
      form.append('stock', document.getElementById('stock').value);
      form.append('unit', document.getElementById('unit').value);
      form.append('harvestDate', document.getElementById('harvestDate').value);
      form.append('expiryDate', document.getElementById('expiryDate').value);
      form.append('sellerName', document.getElementById('sellerName').value);
      form.append('sellerEmail', document.getElementById('sellerEmail').value);
      form.append('sellerPhone', document.getElementById('sellerPhone').value);
      form.append('location', document.getElementById('sellerLocation').value);
      paymentMethods.forEach(m => form.append('paymentMethods[]', m));
      form.append('images', imageFile);
      await createProduct(form);
      alert('Product added successfully!');
    }

    await loadProductsFromAPI();
    closeProductModal();
  } catch (err) {
    alert('Failed to save product: ' + err.message);
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = currentEditingProductId ? 'Update Product' : 'Add Product'; }
  }
}

// Render Products
function renderProducts() {
  productsGrid.innerHTML = '';

  if (products.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  products.forEach(product => {
    const productCard = createProductCard(product);
    productsGrid.appendChild(productCard);
  });
}

function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  const imageUrl = product.imageUrl || '';

  card.innerHTML = `
    <img src="${imageUrl}" alt="${product.name}" class="product-card-image">
    <div class="product-card-body">
      <div class="product-card-title">${product.name}</div>
      <div class="product-card-category">${capitalizeCategory(product.category)}</div>
      <div class="product-card-price">$${Number(product.price || 0).toFixed(2)}</div>
      <div class="product-card-stock">Stock: ${product.stock} ${product.unit}</div>
      <div class="product-card-description">${product.description}</div>
    </div>
  `;

  card.addEventListener('click', () => showProductDetails(product));
  return card;
}

// Show Product Details
function showProductDetails(product) {
  const paymentMethodsText = (product.paymentMethods || [])
    .map(method => capitalizePaymentMethod(method))
    .join(', ');

  const daysUntilExpiry = Math.ceil((new Date(product.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  const expiryStatus = daysUntilExpiry < 0 ? 'Expired' : daysUntilExpiry < 7 ? `Expires in ${daysUntilExpiry} days` : 'Fresh';

  detailsContent.innerHTML = `
    <img src="${product.imageUrl}" alt="${product.name}" class="detail-image">
    
    <div class="detail-row">
      <div class="detail-label">Product Name:</div>
      <div class="detail-value">${product.name}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Category:</div>
      <div class="detail-value">${capitalizeCategory(product.category)}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Brand/Model:</div>
      <div class="detail-value">${product.brand || 'N/A'}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Description:</div>
      <div class="detail-value">${product.description}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Cost Price:</div>
      <div class="detail-value">$${product.costPrice.toFixed(2)}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Selling Price:</div>
      <div class="detail-value">$${product.sellingPrice.toFixed(2)}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Discount:</div>
      <div class="detail-value">${product.discount}%</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Final Price:</div>
      <div class="detail-value" style="color: #d32f2f; font-weight: 700;">$${Number(product.price || 0).toFixed(2)}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Stock:</div>
      <div class="detail-value">${product.stock} ${product.unit}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Harvest Date:</div>
      <div class="detail-value">${formatDate(product.harvestDate)}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Expiry Date:</div>
      <div class="detail-value">${formatDate(product.expiryDate)} (${expiryStatus})</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Payment Methods:</div>
      <div class="detail-value">${paymentMethodsText}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Seller Name:</div>
      <div class="detail-value">${product.seller?.name || 'N/A'}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Seller Email:</div>
      <div class="detail-value"><a href="mailto:${product.seller?.email || ''}">${product.seller?.email || 'N/A'}</a></div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Seller Phone:</div>
      <div class="detail-value"><a href="tel:${product.seller?.phone || ''}">${product.seller?.phone || 'N/A'}</a></div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Location:</div>
      <div class="detail-value">${product.seller?.location || 'N/A'}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Listed:</div>
      <div class="detail-value">${product.createdAt}</div>
    </div>
  `;

  // Store current product ID for editing/deleting
  currentEditingProductId = product.id;
  detailsModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

// Edit Product
function editProduct() {
  const product = products.find(p => p.id === currentEditingProductId);
  if (!product) return;

  currentEditingProductId = product.id;
  
  // Populate form with product data
  document.getElementById('name').value = product.name;
  document.getElementById('category').value = product.category;
  document.getElementById('brand').value = product.brand;
  document.getElementById('description').value = product.description;
  document.getElementById('costPrice').value = product.costPrice;
  document.getElementById('sellingPrice').value = product.sellingPrice;
  document.getElementById('discount').value = product.discount;
  document.getElementById('stock').value = product.stock;
  document.getElementById('unit').value = product.unit;
  document.getElementById('harvestDate').value = product.harvestDate ? new Date(product.harvestDate).toISOString().split('T')[0] : '';
  document.getElementById('expiryDate').value = product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '';
  document.getElementById('sellerName').value = product.seller?.name || '';
  document.getElementById('sellerEmail').value = product.seller?.email || '';
  document.getElementById('sellerPhone').value = product.seller?.phone || '';
  document.getElementById('sellerLocation').value = product.seller?.location || '';

  // Set payment methods
  document.querySelectorAll('input[name="paymentMethod"]').forEach(cb => {
    cb.checked = product.paymentMethods.includes(cb.value);
  });

  // Set image preview
  imagePreview.innerHTML = `<img src="${product.imageUrl}" alt="Product Image">`;

  modalTitle.textContent = 'Edit Product';
  closeDetailsModal();
  productModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

// Delete Product
async function deleteProduct() {
  if (!confirm('Are you sure you want to delete this product?')) return;
  try {
    await removeProduct(currentEditingProductId);
    await loadProductsFromAPI();
    closeDetailsModal();
    alert('Product deleted successfully!');
  } catch (err) {
    alert('Failed to delete product: ' + err.message);
  }
}

// Load products from API
async function loadProductsFromAPI() {
  try {
    const currentUser = getCurrentUser();
    const params = { limit: 100 };
    if (currentUser?.id) {
      params.farmerId = currentUser.id;
    }
    const data = await getProducts(params);
    products = data.data || [];
  } catch (err) {
    console.error('Failed to load products:', err);
    products = [];
  }
  renderProducts();
}

// Utility Functions
function capitalizeCategory(category) {
  const categories = {
    'vegetables': 'Vegetables',
    'fruits': 'Fruits',
    'grains': 'Grains',
    'dairy': 'Dairy',
    'spices': 'Spices',
    'other': 'Other'
  };
  return categories[category] || category;
}

function capitalizePaymentMethod(method) {
  const methods = {
    'cash': 'Cash',
    'card': 'Credit/Debit Card',
    'bank_transfer': 'Bank Transfer',
    'digital_wallet': 'Digital Wallet'
  };
  return methods[method] || method;
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}
