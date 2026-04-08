// Global variable to store products
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
  loadProductsFromStorage();
  renderProducts();
  setupEventListeners();
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
function handleFormSubmit(e) {
  e.preventDefault();

  // Get payment methods
  const paymentCheckboxes = document.querySelectorAll('input[name="paymentMethod"]:checked');
  if (paymentCheckboxes.length === 0) {
    alert('Please select at least one payment method');
    return;
  }

  const paymentMethods = Array.from(paymentCheckboxes).map(cb => cb.value);

  // Validate dates
  const makingDate = new Date(document.getElementById('makingDate').value);
  const expiryDate = new Date(document.getElementById('expiryDate').value);
  
  if (expiryDate <= makingDate) {
    alert('Expiry date must be after making/harvest date');
    return;
  }

  // Get image
  const imageFile = productImageInput.files[0];
  if (!imageFile && !currentEditingProductId) {
    alert('Please select a product image');
    return;
  }

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const productData = createProductObject(paymentMethods, event.target.result);
      saveProduct(productData);
    };
    reader.readAsDataURL(imageFile);
  } else if (currentEditingProductId) {
    const productData = createProductObject(paymentMethods, null);
    saveProduct(productData);
  }
}

function createProductObject(paymentMethods, imageData) {
  const costPrice = parseFloat(document.getElementById('costPrice').value);
  const sellingPrice = parseFloat(document.getElementById('sellingPrice').value);
  const discount = parseFloat(document.getElementById('discount').value);
  const finalPrice = sellingPrice - (sellingPrice * discount / 100);

  const product = {
    id: currentEditingProductId || Date.now(),
    productName: document.getElementById('productName').value,
    description: document.getElementById('description').value,
    category: document.getElementById('category').value,
    brand: document.getElementById('brand').value,
    costPrice: costPrice,
    sellingPrice: sellingPrice,
    discount: discount,
    finalPrice: finalPrice.toFixed(2),
    stock: parseInt(document.getElementById('stock').value),
    unit: document.getElementById('unit').value,
    makingDate: document.getElementById('makingDate').value,
    expiryDate: document.getElementById('expiryDate').value,
    paymentMethods: paymentMethods,
    sellerName: document.getElementById('sellerName').value,
    sellerEmail: document.getElementById('sellerEmail').value,
    sellerPhone: document.getElementById('sellerPhone').value,
    sellerLocation: document.getElementById('sellerLocation').value,
    image: imageData || (currentEditingProductId ? products.find(p => p.id === currentEditingProductId).image : null),
    createdAt: currentEditingProductId ? products.find(p => p.id === currentEditingProductId).createdAt : new Date().toLocaleString()
  };

  return product;
}

function saveProduct(product) {
  if (currentEditingProductId) {
    // Update existing product
    const index = products.findIndex(p => p.id === currentEditingProductId);
    if (index > -1) {
      products[index] = product;
    }
  } else {
    // Add new product
    products.push(product);
  }

  saveProductsToStorage();
  renderProducts();
  closeProductModal();
  alert(currentEditingProductId ? 'Product updated successfully!' : 'Product added successfully!');
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
  card.innerHTML = `
    <img src="${product.image}" alt="${product.productName}" class="product-card-image">
    <div class="product-card-body">
      <div class="product-card-title">${product.productName}</div>
      <div class="product-card-category">${capitalizeCategory(product.category)}</div>
      <div class="product-card-price">$${product.finalPrice}</div>
      <div class="product-card-stock">Stock: ${product.stock} ${product.unit}</div>
      <div class="product-card-description">${product.description}</div>
    </div>
  `;

  card.addEventListener('click', () => showProductDetails(product));
  return card;
}

// Show Product Details
function showProductDetails(product) {
  const paymentMethodsText = product.paymentMethods
    .map(method => capitalizePaymentMethod(method))
    .join(', ');

  const daysUntilExpiry = Math.ceil((new Date(product.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  const expiryStatus = daysUntilExpiry < 0 ? 'Expired' : daysUntilExpiry < 7 ? `Expires in ${daysUntilExpiry} days` : 'Fresh';

  detailsContent.innerHTML = `
    <img src="${product.image}" alt="${product.productName}" class="detail-image">
    
    <div class="detail-row">
      <div class="detail-label">Product Name:</div>
      <div class="detail-value">${product.productName}</div>
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
      <div class="detail-value" style="color: #d32f2f; font-weight: 700;">$${product.finalPrice}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Stock:</div>
      <div class="detail-value">${product.stock} ${product.unit}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Harvest Date:</div>
      <div class="detail-value">${formatDate(product.makingDate)}</div>
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
      <div class="detail-value">${product.sellerName}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Seller Email:</div>
      <div class="detail-value"><a href="mailto:${product.sellerEmail}">${product.sellerEmail}</a></div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Seller Phone:</div>
      <div class="detail-value"><a href="tel:${product.sellerPhone}">${product.sellerPhone}</a></div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Location:</div>
      <div class="detail-value">${product.sellerLocation}</div>
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
  document.getElementById('productName').value = product.productName;
  document.getElementById('category').value = product.category;
  document.getElementById('brand').value = product.brand;
  document.getElementById('description').value = product.description;
  document.getElementById('costPrice').value = product.costPrice;
  document.getElementById('sellingPrice').value = product.sellingPrice;
  document.getElementById('discount').value = product.discount;
  document.getElementById('stock').value = product.stock;
  document.getElementById('unit').value = product.unit;
  document.getElementById('makingDate').value = product.makingDate;
  document.getElementById('expiryDate').value = product.expiryDate;
  document.getElementById('sellerName').value = product.sellerName;
  document.getElementById('sellerEmail').value = product.sellerEmail;
  document.getElementById('sellerPhone').value = product.sellerPhone;
  document.getElementById('sellerLocation').value = product.sellerLocation;

  // Set payment methods
  document.querySelectorAll('input[name="paymentMethod"]').forEach(cb => {
    cb.checked = product.paymentMethods.includes(cb.value);
  });

  // Set image preview
  imagePreview.innerHTML = `<img src="${product.image}" alt="Product Image">`;

  modalTitle.textContent = 'Edit Product';
  closeDetailsModal();
  productModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

// Delete Product
function deleteProduct() {
  if (confirm('Are you sure you want to delete this product?')) {
    products = products.filter(p => p.id !== currentEditingProductId);
    saveProductsToStorage();
    renderProducts();
    closeDetailsModal();
    alert('Product deleted successfully!');
  }
}

// Storage Functions
function saveProductsToStorage() {
  localStorage.setItem('farmershubProducts', JSON.stringify(products));
}

function loadProductsFromStorage() {
  const stored = localStorage.getItem('farmershubProducts');
  if (stored) {
    try {
      products = JSON.parse(stored);
    } catch (e) {
      console.error('Error loading products from storage:', e);
      products = [];
    }
  }
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
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}
