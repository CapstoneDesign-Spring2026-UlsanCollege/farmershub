const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');

const memory = {
  users: {
    farmer: [],
    customer: []
  },
  products: []
};

let idCounter = 1;

function makeId() {
  idCounter += 1;
  return String(idCounter);
}

function nowIso() {
  return new Date().toISOString();
}

function toUserPublic(user, role) {
  return {
    id: String(user._id || user.id),
    email: user.email,
    fullName: user.fullName,
    role,
    age: user.age,
    gender: user.gender,
    address: user.address,
    phone: user.phone,
    paymentMethod: user.paymentMethod,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function toProductApi(product) {
  return {
    id: String(product._id || product.id),
    name: product.name,
    brand: product.brand || '',
    description: product.description || '',
    category: product.category || 'General',
    costPrice: Number(product.costPrice || 0),
    sellingPrice: Number(product.sellingPrice || 0),
    discount: Number(product.discount || 0),
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    unit: product.unit || 'kg',
    harvestDate: product.harvestDate || '',
    expiryDate: product.expiryDate || '',
    imageUrl: product.imageUrl || '',
    paymentMethods: Array.isArray(product.paymentMethods) ? product.paymentMethods : [],
    seller: product.seller,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };
}

function mapRoleToModel(_role) {
  return User;
}

async function findByEmailAcrossRoles(email, useMemory) {
  if (useMemory) {
    const farmer = memory.users.farmer.find((item) => item.email === email);
    if (farmer) {
      return { role: 'farmer', user: farmer };
    }

    const customer = memory.users.customer.find((item) => item.email === email);
    if (customer) {
      return { role: 'customer', user: customer };
    }

    return null;
  }

  const found = await User.findOne({ email });
  if (found) {
    return { role: found.role, user: found };
  }

  return null;
}

function normalizeProductInput(payload) {
  const sellingPrice = Number(payload.sellingPrice || 0);
  const discount = Number(payload.discount || 0);
  const computedPrice = Number((sellingPrice * (1 - discount / 100)).toFixed(2));

  return {
    name: String(payload.name || '').trim(),
    brand: String(payload.brand || '').trim(),
    description: String(payload.description || '').trim(),
    category: String(payload.category || 'General').trim(),
    costPrice: Number(payload.costPrice || 0),
    sellingPrice,
    discount,
    price: Number(payload.price || computedPrice),
    stock: Number(payload.stock || 0),
    unit: String(payload.unit || 'kg').trim(),
    harvestDate: String(payload.harvestDate || ''),
    expiryDate: String(payload.expiryDate || ''),
    imageUrl: String(payload.imageUrl || '').trim(),
    paymentMethods: Array.isArray(payload.paymentMethods)
      ? payload.paymentMethods.map((item) => String(item).trim()).filter(Boolean)
      : []
  };
}

function createStore({ useMemory }) {
  async function registerUser(data) {
    const payload = {
      email: String(data.email || '').trim().toLowerCase(),
      password: String(data.password || ''),
      role: String(data.role || '').trim(),
      fullName: String(data.fullName || '').trim(),
      age: Number(data.age),
      gender: String(data.gender || '').trim(),
      address: String(data.address || '').trim(),
      phone: String(data.phone || data.contact || '').trim(),
      paymentMethod: String(data.paymentMethod || '').trim()
    };

    const existing = await findByEmailAcrossRoles(payload.email, useMemory);
    if (existing) {
      return { error: { status: 409, message: 'User already exists.' } };
    }

    if (useMemory) {
      const id = makeId();
      const hashed = await bcrypt.hash(payload.password, 10);
      const timestamp = nowIso();
      const user = {
        id,
        _id: id,
        ...payload,
        password: hashed,
        createdAt: timestamp,
        updatedAt: timestamp,
        comparePassword(candidate) {
          return bcrypt.compare(candidate, this.password);
        }
      };

      memory.users[payload.role].push(user);
      return { user: toUserPublic(user, payload.role) };
    }

    const Model = mapRoleToModel(payload.role);
    const created = await Model.create(payload);
    return { user: toUserPublic(created, payload.role) };
  }

  async function login(email, password) {
    const found = await findByEmailAcrossRoles(String(email).trim().toLowerCase(), useMemory);
    if (!found) {
      return { error: { status: 401, message: 'Invalid email or password.' } };
    }

    const isMatch = await found.user.comparePassword(password);
    if (!isMatch) {
      return { error: { status: 401, message: 'Invalid email or password.' } };
    }

    return { role: found.role, user: toUserPublic(found.user, found.role) };
  }

  async function listUsers(role) {
    if (useMemory) {
      return memory.users[role].map((user) => toUserPublic(user, role));
    }

    const Model = mapRoleToModel(role);
    const records = await Model.find({ role }, '-password').sort({ createdAt: -1 });
    return records.map((record) => toUserPublic(record, role));
  }

  async function getUserById(role, id) {
    if (useMemory) {
      const user = memory.users[role].find((item) => String(item.id) === String(id));
      return user ? toUserPublic(user, role) : null;
    }

    const Model = mapRoleToModel(role);
    const user = await Model.findById(id, '-password');
    return user ? toUserPublic(user, role) : null;
  }

  async function createProduct(payload, seller) {
    const normalized = normalizeProductInput(payload);
    const now = nowIso();

    if (useMemory) {
      const id = makeId();
      const product = {
        id,
        _id: id,
        ...normalized,
        seller,
        createdAt: now,
        updatedAt: now
      };

      memory.products.unshift(product);
      return toProductApi(product);
    }

    const created = await Product.create({ ...normalized, seller });
    return toProductApi(created);
  }

  async function listProducts(query) {
    const search = String(query.search || '').trim().toLowerCase();
    const category = String(query.category || '').trim().toLowerCase();

    if (useMemory) {
      return memory.products
        .filter((item) => {
          const searchPass =
            !search ||
            item.name.toLowerCase().includes(search) ||
            item.description.toLowerCase().includes(search) ||
            item.brand.toLowerCase().includes(search);

          const categoryPass = !category || item.category.toLowerCase() === category;
          return searchPass && categoryPass;
        })
        .map(toProductApi);
    }

    const mongoQuery = {};
    if (search) {
      mongoQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      mongoQuery.category = { $regex: `^${category}$`, $options: 'i' };
    }

    const products = await Product.find(mongoQuery).sort({ createdAt: -1 });
    return products.map(toProductApi);
  }

  async function updateProduct(id, payload, userId) {
    const normalized = normalizeProductInput(payload);

    if (useMemory) {
      const product = memory.products.find((item) => String(item.id) === String(id));
      if (!product) {
        return { error: { status: 404, message: 'Product not found.' } };
      }

      if (String(product.seller.id) !== String(userId)) {
        return { error: { status: 403, message: 'You can only edit your own products.' } };
      }

      Object.assign(product, normalized, { updatedAt: nowIso() });
      return { product: toProductApi(product) };
    }

    const existing = await Product.findById(id);
    if (!existing) {
      return { error: { status: 404, message: 'Product not found.' } };
    }

    if (String(existing.seller.id) !== String(userId)) {
      return { error: { status: 403, message: 'You can only edit your own products.' } };
    }

    Object.assign(existing, normalized);
    await existing.save();
    return { product: toProductApi(existing) };
  }

  async function deleteProduct(id, userId) {
    if (useMemory) {
      const index = memory.products.findIndex((item) => String(item.id) === String(id));
      if (index === -1) {
        return { error: { status: 404, message: 'Product not found.' } };
      }

      if (String(memory.products[index].seller.id) !== String(userId)) {
        return { error: { status: 403, message: 'You can only delete your own products.' } };
      }

      memory.products.splice(index, 1);
      return { success: true };
    }

    const existing = await Product.findById(id);
    if (!existing) {
      return { error: { status: 404, message: 'Product not found.' } };
    }

    if (String(existing.seller.id) !== String(userId)) {
      return { error: { status: 403, message: 'You can only delete your own products.' } };
    }

    await existing.deleteOne();
    return { success: true };
  }

  return {
    registerUser,
    login,
    listUsers,
    getUserById,
    createProduct,
    listProducts,
    updateProduct,
    deleteProduct
  };
}

function resetMemoryStore() {
  memory.users.farmer = [];
  memory.users.customer = [];
  memory.products = [];
  idCounter = 1;
}

module.exports = {
  createStore,
  resetMemoryStore
};
