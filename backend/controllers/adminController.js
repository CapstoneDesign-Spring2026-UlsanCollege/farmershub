const fs = require('fs');
const path = require('path');

const User = require('../models/User');
const Product = require('../models/Product');
const Post = require('../models/Post');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const FriendRequest = require('../models/FriendRequest');
const Profile = require('../models/Profile');
const ProviderProfile = require('../models/ProviderProfile');
const { FarmServiceListing } = require('../models/FarmServiceListing');
const { FarmServiceRequest } = require('../models/FarmServiceRequest');
const { Order, ORDER_STATUSES } = require('../models/Order');
const AdminActionLog = require('../models/AdminActionLog');
const AdminAnnouncement = require('../models/AdminAnnouncement');
const AdminSetting = require('../models/AdminSetting');
const { createNotification } = require('./notificationController');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { isConfiguredAdmin } = require('../services/adminAccountService');

const UPLOAD_ROOT = path.resolve(__dirname, '..', 'uploads');
const DEFAULT_SETTINGS = {
  siteTitle: 'FarmersHub',
  siteDescription: 'Fresh marketplace connecting farmers, customers, and farm service providers.',
  contactEmail: 'support@farmershub.local',
  maintenanceMode: false,
  announcementsEnabled: true,
};

function toId(value) {
  return String(value?._id || value?.id || value || '');
}

function asInt(value, fallback) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function escapeRegex(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getPaging(query) {
  const page = Math.max(asInt(query.page, 1), 1);
  const limit = Math.min(Math.max(asInt(query.limit, 25), 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

function serializeUser(user) {
  return {
    id: toId(user),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    address: user.address || '',
    isActive: Boolean(user.isActive),
    isVerified: Boolean(user.isVerified),
    rating: user.rating || 0,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function serializeProduct(product) {
  const price = Number((Number(product.sellingPrice || 0) - (Number(product.sellingPrice || 0) * Number(product.discount || 0) / 100)).toFixed(2));
  return {
    id: toId(product),
    name: product.name,
    category: product.category,
    price,
    sellingPrice: product.sellingPrice,
    stock: product.stock,
    unit: product.unit,
    imagePath: product.imagePath || '',
    seller: product.seller || {},
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function serializeOrder(order) {
  return {
    id: toId(order),
    orderNumber: order.orderNumber,
    product: order.product,
    customer: order.customer,
    farmer: order.farmer,
    quantity: order.quantity,
    totalAmount: order.totalAmount,
    notes: order.notes,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

function serializeMessage(message) {
  return {
    id: toId(message),
    sender: message.sender,
    receiver: message.receiver,
    content: message.content,
    isRead: message.isRead,
    relatedProduct: message.relatedProduct,
    relatedServiceRequest: message.relatedServiceRequest,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

function getStartOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function getStartOfLastSevenDays() {
  const date = getStartOfToday();
  date.setDate(date.getDate() - 6);
  return date;
}

function dayLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

async function chartFor(Model, match = {}) {
  const start = getStartOfLastSevenDays();
  const days = [];
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push(date);
  }

  const rows = await Model.aggregate([
    { $match: { ...match, createdAt: { $gte: start } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = new Map(rows.map((row) => [`${row._id.year}-${row._id.month}-${row._id.day}`, row.count]));
  return {
    labels: days.map(dayLabel),
    values: days.map((date) => counts.get(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`) || 0),
  };
}

function getDiskUploads() {
  const files = [];
  if (!fs.existsSync(UPLOAD_ROOT)) return files;

  function walk(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(absolute);
        return;
      }

      const stats = fs.statSync(absolute);
      const relative = path.relative(UPLOAD_ROOT, absolute).replace(/\\/g, '/');
      files.push({
        path: `/uploads/${relative}`,
        size: stats.size,
        updatedAt: stats.mtime,
      });
    });
  }

  walk(UPLOAD_ROOT);
  return files;
}

async function getUploadSummary() {
  const [products, posts, avatarUsers, coverUsers] = await Promise.all([
    Product.find({ imagePath: { $ne: '' } }, 'name imagePath createdAt seller').lean(),
    Post.find({ imagePaths: { $exists: true, $ne: [] } }, 'content imagePaths author createdAt').lean(),
    User.find({ 'avatar.url': { $ne: '' } }, 'fullName email role avatar createdAt').lean(),
    User.find({ 'coverImage.url': { $ne: '' } }, 'fullName email role coverImage createdAt').lean(),
  ]);

  const references = [
    ...products.map((product) => ({
      ownerType: 'product',
      ownerId: toId(product),
      label: product.name,
      path: product.imagePath,
      createdAt: product.createdAt,
    })),
    ...posts.flatMap((post) => (post.imagePaths || []).map((imagePath) => ({
      ownerType: 'post',
      ownerId: toId(post),
      label: (post.content || 'Post upload').slice(0, 80),
      path: imagePath,
      createdAt: post.createdAt,
    }))),
    ...avatarUsers.map((user) => ({
      ownerType: 'avatar',
      ownerId: toId(user),
      label: user.fullName || user.email,
      path: user.avatar?.url,
      createdAt: user.createdAt,
    })),
    ...coverUsers.map((user) => ({
      ownerType: 'cover',
      ownerId: toId(user),
      label: user.fullName || user.email,
      path: user.coverImage?.url,
      createdAt: user.createdAt,
    })),
  ].filter((item) => item.path);

  const diskFiles = getDiskUploads();
  const totalBytes = diskFiles.reduce((sum, file) => sum + file.size, 0);

  return {
    count: Math.max(references.length, diskFiles.length),
    totalBytes,
    references,
    diskFiles,
  };
}

async function recordAdminLog(admin, action, targetType = '', targetId = '', metadata = {}, req = null) {
  try {
    await AdminActionLog.create({
      admin: {
        userId: admin?._id,
        email: admin?.email || '',
        name: admin?.fullName || '',
      },
      action,
      targetType,
      targetId: String(targetId || ''),
      metadata,
      ipAddress: req?.ip || '',
    });
  } catch (error) {
    console.error('Failed to record admin action:', error.message);
  }
}

async function getSettingsMap() {
  const docs = await AdminSetting.find({ key: { $in: Object.keys(DEFAULT_SETTINGS) } }).lean();
  return docs.reduce((settings, doc) => {
    settings[doc.key] = doc.value;
    return settings;
  }, { ...DEFAULT_SETTINGS });
}

async function getTopFarmers(limit = 5) {
  const [farmers, productCounts, orderCounts] = await Promise.all([
    User.find({ role: 'farmer' }, 'fullName email rating totalReviews createdAt').lean(),
    Product.aggregate([{ $group: { _id: '$seller.userId', count: { $sum: 1 } } }]),
    Order.aggregate([{ $group: { _id: '$farmer.userId', count: { $sum: 1 } } }]),
  ]);

  const productMap = new Map(productCounts.map((row) => [toId(row._id), row.count]));
  const orderMap = new Map(orderCounts.map((row) => [toId(row._id), row.count]));

  return farmers
    .map((farmer) => ({
      id: toId(farmer),
      name: farmer.fullName || farmer.email,
      email: farmer.email,
      products: productMap.get(toId(farmer)) || 0,
      orders: orderMap.get(toId(farmer)) || 0,
      rating: farmer.rating || 0,
      createdAt: farmer.createdAt,
    }))
    .sort((a, b) => (b.products + b.orders) - (a.products + a.orders))
    .slice(0, limit);
}

async function getRecentActivities() {
  const [users, products, posts, orders, messages] = await Promise.all([
    User.find({}, 'email role createdAt').sort({ createdAt: -1 }).limit(5).lean(),
    Product.find({}, 'name seller createdAt').sort({ createdAt: -1 }).limit(5).lean(),
    Post.find({}, 'author content createdAt').sort({ createdAt: -1 }).limit(5).lean(),
    Order.find({}, 'orderNumber customer farmer status createdAt').sort({ createdAt: -1 }).limit(5).lean(),
    Message.find({}, 'sender receiver content createdAt').sort({ createdAt: -1 }).limit(5).populate('sender receiver', 'email fullName').lean(),
  ]);

  return [
    ...users.map((user) => ({ type: 'user', text: `New ${user.role} registered: ${user.email}`, createdAt: user.createdAt })),
    ...products.map((product) => ({ type: 'product', text: `Product added: ${product.name}`, createdAt: product.createdAt })),
    ...posts.map((post) => ({ type: 'post', text: `Feed post by ${post.author?.name || 'farmer'}`, createdAt: post.createdAt })),
    ...orders.map((order) => ({ type: 'order', text: `Order ${order.orderNumber} is ${order.status}`, createdAt: order.createdAt })),
    ...messages.map((message) => ({ type: 'message', text: `Message from ${message.sender?.email || 'user'}`, createdAt: message.createdAt })),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);
}

async function getOverview(req, res, next) {
  try {
    const uploads = await getUploadSummary();
    const [
      totalUsers,
      farmers,
      customers,
      providers,
      products,
      orders,
      messages,
      posts,
      charts,
      recentActivities,
      topFarmers,
      settings,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'provider' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Message.countDocuments(),
      Post.countDocuments(),
      Promise.all([
        chartFor(User),
        chartFor(Product),
        chartFor(Order),
      ]),
      getRecentActivities(),
      getTopFarmers(),
      getSettingsMap(),
    ]);

    const diskUsedGB = uploads.totalBytes / (1024 * 1024 * 1024);

    return successResponse(res, 'Admin overview', {
      metrics: {
        totalUsers,
        farmers,
        customers,
        sellers: providers,
        products,
        orders,
        messages,
        uploads: uploads.count,
        feedPosts: posts,
      },
      charts: {
        users: charts[0],
        products: charts[1],
        orders: charts[2],
      },
      recentActivities,
      topFarmers,
      system: {
        status: 'All systems operational',
        maintenanceMode: Boolean(settings.maintenanceMode),
        storageUsed: `${diskUsedGB.toFixed(2)} GB`,
        databaseStatus: 'Connected',
        version: '1.0.0',
      },
    });
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const { page, limit, skip } = getPaging(req.query);
    const { role, status, search } = req.query;
    const filter = {};

    if (role && role !== 'all') filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ fullName: regex }, { email: regex }, { phone: regex }, { address: regex }];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    return successResponse(res, 'Admin users', {
      users: users.map(serializeUser),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

async function getUserDetails(req, res, next) {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return errorResponse(res, 'User not found', 404);

    const id = user._id;
    const [products, posts, sentMessages, receivedMessages, notifications, orders] = await Promise.all([
      Product.find({ 'seller.userId': id }).sort({ createdAt: -1 }).limit(20).lean(),
      Post.find({ 'author.userId': id }).sort({ createdAt: -1 }).limit(20).lean(),
      Message.countDocuments({ sender: id }),
      Message.countDocuments({ receiver: id }),
      Notification.find({ user: id }).sort({ createdAt: -1 }).limit(20).lean(),
      Order.find({ $or: [{ 'customer.userId': id }, { 'farmer.userId': id }] }).sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    return successResponse(res, 'Admin user detail', {
      user: serializeUser(user),
      products: products.map(serializeProduct),
      posts,
      messages: { sent: sentMessages, received: receivedMessages },
      notifications,
      orders: orders.map(serializeOrder),
    });
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 'User not found', 404);
    if (isConfiguredAdmin(user)) return errorResponse(res, 'The configured admin account cannot be deleted', 400);

    const id = user._id;
    const result = await Promise.all([
      Product.deleteMany({ 'seller.userId': id }),
      Post.deleteMany({ 'author.userId': id }),
      Message.deleteMany({ $or: [{ sender: id }, { receiver: id }] }),
      Notification.deleteMany({ user: id }),
      FriendRequest.deleteMany({ $or: [{ requester: id }, { recipient: id }] }),
      Profile.deleteOne({ userId: id }),
      ProviderProfile.deleteOne({ userId: id }),
      FarmServiceListing.deleteMany({ 'provider.userId': id }),
      FarmServiceRequest.deleteMany({ $or: [{ 'farmer.userId': id }, { 'provider.userId': id }] }),
      Order.deleteMany({ $or: [{ 'customer.userId': id }, { 'farmer.userId': id }] }),
    ]);

    await user.deleteOne();
    await recordAdminLog(req.user, 'delete_user', 'User', id, { email: user.email, cascade: result.map((item) => item.deletedCount || 0) }, req);

    return successResponse(res, 'User and related data deleted', { id: toId(user), email: user.email });
  } catch (err) {
    next(err);
  }
}

async function listProducts(req, res, next) {
  try {
    const { page, limit, skip } = getPaging(req.query);
    const { search, category, sellerId } = req.query;
    const filter = {};

    if (category && category !== 'all') filter.category = String(category).toLowerCase();
    if (sellerId) filter['seller.userId'] = sellerId;
    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ name: regex }, { description: regex }, { brand: regex }, { 'seller.name': regex }, { 'seller.email': regex }];
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    return successResponse(res, 'Admin products', {
      products: products.map(serializeProduct),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 'Product not found', 404);

    await Promise.all([
      Post.updateMany({ linkedProductId: product._id }, { linkedProductId: null }),
      Notification.deleteMany({ relatedId: product._id, relatedModel: 'Product' }),
      Order.deleteMany({ 'product.productId': product._id }),
    ]);
    await product.deleteOne();
    await recordAdminLog(req.user, 'delete_product', 'Product', product._id, { name: product.name }, req);

    return successResponse(res, 'Product deleted', { id: toId(product), name: product.name });
  } catch (err) {
    next(err);
  }
}

async function listUploads(req, res, next) {
  try {
    const uploads = await getUploadSummary();
    return successResponse(res, 'Admin uploads', uploads);
  } catch (err) {
    next(err);
  }
}

function resolveUploadPath(uploadPath) {
  const raw = String(uploadPath || '').replace(/\\/g, '/');
  const relative = raw.replace(/^\/?uploads\//, '').replace(/^\/+/, '');
  const absolute = path.resolve(UPLOAD_ROOT, relative);
  const inside = path.relative(UPLOAD_ROOT, absolute);
  if (!inside || inside.startsWith('..') || path.isAbsolute(inside)) {
    throw new Error('Invalid upload path');
  }
  return absolute;
}

async function deleteUpload(req, res, next) {
  try {
    const { path: uploadPath, ownerType, ownerId } = req.body;
    if (!uploadPath) return errorResponse(res, 'Upload path is required', 400);

    if (ownerType === 'product' && ownerId) {
      await Product.findByIdAndUpdate(ownerId, { imagePath: '' });
    } else if (ownerType === 'post' && ownerId) {
      await Post.findByIdAndUpdate(ownerId, { $pull: { imagePaths: uploadPath } });
    } else if (ownerType === 'avatar' && ownerId) {
      await User.findByIdAndUpdate(ownerId, { 'avatar.url': '', 'avatar.publicId': '' });
    } else if (ownerType === 'cover' && ownerId) {
      await User.findByIdAndUpdate(ownerId, { 'coverImage.url': '', 'coverImage.publicId': '' });
    }

    const absolute = resolveUploadPath(uploadPath);
    if (fs.existsSync(absolute)) fs.unlinkSync(absolute);

    await recordAdminLog(req.user, 'delete_upload', ownerType || 'Upload', ownerId || uploadPath, { path: uploadPath }, req);
    return successResponse(res, 'Upload deleted', { path: uploadPath });
  } catch (err) {
    next(err);
  }
}

async function listOrders(req, res, next) {
  try {
    const { page, limit, skip } = getPaging(req.query);
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [
        { orderNumber: regex },
        { 'product.name': regex },
        { 'customer.email': regex },
        { 'farmer.email': regex },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(filter),
    ]);

    return successResponse(res, 'Admin orders', {
      orders: orders.map(serializeOrder),
      statuses: ORDER_STATUSES,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

async function updateOrder(req, res, next) {
  try {
    const { status, note = '' } = req.body;
    if (!ORDER_STATUSES.includes(status)) return errorResponse(res, 'Invalid order status', 400);

    const order = await Order.findById(req.params.id);
    if (!order) return errorResponse(res, 'Order not found', 404);

    order.status = status;
    order.statusHistory.push({
      status,
      changedBy: req.user._id,
      note: String(note || '').trim(),
      changedAt: new Date(),
    });
    await order.save();
    await createNotification(order.customer.userId, 'order', 'Order status updated', `${order.orderNumber} is now ${status}.`, order._id, 'Order');
    await recordAdminLog(req.user, 'update_order_status', 'Order', order._id, { status }, req);

    return successResponse(res, 'Order updated', serializeOrder(order));
  } catch (err) {
    next(err);
  }
}

async function deleteOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return errorResponse(res, 'Order not found', 404);

    await Promise.all([
      Notification.deleteMany({ relatedId: order._id, relatedModel: 'Order' }),
      order.deleteOne(),
    ]);
    await recordAdminLog(req.user, 'delete_order', 'Order', order._id, { orderNumber: order.orderNumber }, req);

    return successResponse(res, 'Order deleted', { id: toId(order), orderNumber: order.orderNumber });
  } catch (err) {
    next(err);
  }
}

async function listMessages(req, res, next) {
  try {
    const { page, limit, skip } = getPaging(req.query);
    const { search } = req.query;
    const filter = {};

    if (search) {
      filter.content = new RegExp(escapeRegex(search), 'i');
    }

    const [messages, total] = await Promise.all([
      Message.find(filter)
        .populate('sender', 'fullName email role')
        .populate('receiver', 'fullName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments(filter),
    ]);

    return successResponse(res, 'Admin messages', {
      messages: messages.map(serializeMessage),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

async function deleteMessage(req, res, next) {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return errorResponse(res, 'Message not found', 404);

    await Promise.all([
      Notification.deleteMany({ relatedId: message._id, relatedModel: 'Message' }),
      message.deleteOne(),
    ]);
    await recordAdminLog(req.user, 'delete_message', 'Message', message._id, {}, req);

    return successResponse(res, 'Message deleted', { id: toId(message) });
  } catch (err) {
    next(err);
  }
}

async function deleteConversation(req, res, next) {
  try {
    const { userA, userB } = req.params;
    const result = await Message.deleteMany({
      $or: [
        { sender: userA, receiver: userB },
        { sender: userB, receiver: userA },
      ],
    });
    await recordAdminLog(req.user, 'delete_conversation', 'Message', `${userA}:${userB}`, { deletedCount: result.deletedCount }, req);

    return successResponse(res, 'Conversation deleted', { deletedCount: result.deletedCount });
  } catch (err) {
    next(err);
  }
}

async function listAnnouncements(req, res, next) {
  try {
    const announcements = await AdminAnnouncement.find({})
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return successResponse(res, 'Admin announcements', { announcements });
  } catch (err) {
    next(err);
  }
}

async function createAnnouncement(req, res, next) {
  try {
    const title = String(req.body.title || '').trim();
    const body = String(req.body.body || '').trim();
    const audience = ['all', 'farmer', 'customer', 'provider'].includes(req.body.audience) ? req.body.audience : 'all';
    const sendNotification = req.body.sendNotification !== false;

    if (!title || !body) return errorResponse(res, 'Announcement title and body are required', 400);

    const announcement = await AdminAnnouncement.create({
      title,
      body,
      audience,
      createdBy: req.user._id,
    });

    let notifiedCount = 0;
    if (sendNotification) {
      const filter = audience === 'all' ? {} : { role: audience };
      const users = await User.find(filter, '_id').lean();
      await Promise.all(users.map((user) => createNotification(user._id, 'system', title, body, announcement._id, 'AdminAnnouncement')));
      notifiedCount = users.length;
    }

    await recordAdminLog(req.user, 'create_announcement', 'Announcement', announcement._id, { audience, notifiedCount }, req);
    return successResponse(res, 'Announcement created', { announcement, notifiedCount }, 201);
  } catch (err) {
    next(err);
  }
}

async function deleteAnnouncement(req, res, next) {
  try {
    const announcement = await AdminAnnouncement.findById(req.params.id);
    if (!announcement) return errorResponse(res, 'Announcement not found', 404);
    announcement.isActive = false;
    await announcement.save();
    await recordAdminLog(req.user, 'deactivate_announcement', 'Announcement', announcement._id, { title: announcement.title }, req);

    return successResponse(res, 'Announcement deactivated', { id: toId(announcement) });
  } catch (err) {
    next(err);
  }
}

async function getSettings(req, res, next) {
  try {
    return successResponse(res, 'Admin settings', await getSettingsMap());
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const updates = {};
    Object.keys(DEFAULT_SETTINGS).forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    await Promise.all(Object.entries(updates).map(([key, value]) => (
      AdminSetting.findOneAndUpdate(
        { key },
        { value, updatedBy: req.user._id },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )));

    await recordAdminLog(req.user, 'update_settings', 'AdminSetting', 'global', updates, req);
    return successResponse(res, 'Settings updated', await getSettingsMap());
  } catch (err) {
    next(err);
  }
}

async function listLogs(req, res, next) {
  try {
    const { page, limit, skip } = getPaging(req.query);
    const [logs, total] = await Promise.all([
      AdminActionLog.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AdminActionLog.countDocuments(),
    ]);
    return successResponse(res, 'Admin logs', { logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
}

async function createBackup(req, res, next) {
  try {
    const [users, products, posts, orders, messages, announcements, settings] = await Promise.all([
      User.find({}, '-password').lean(),
      Product.find({}).lean(),
      Post.find({}).lean(),
      Order.find({}).lean(),
      Message.find({}).lean(),
      AdminAnnouncement.find({}).lean(),
      AdminSetting.find({}).lean(),
    ]);

    const backup = {
      generatedAt: new Date().toISOString(),
      collections: { users, products, posts, orders, messages, announcements, settings },
    };

    const dir = path.join(UPLOAD_ROOT, 'backups');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const fileName = `admin-backup-${Date.now()}.json`;
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));

    await recordAdminLog(req.user, 'create_backup', 'Backup', fileName, {
      users: users.length,
      products: products.length,
      posts: posts.length,
      orders: orders.length,
      messages: messages.length,
    }, req);

    return successResponse(res, 'Backup created', {
      file: `/uploads/backups/${fileName}`,
      counts: {
        users: users.length,
        products: products.length,
        posts: posts.length,
        orders: orders.length,
        messages: messages.length,
      },
    }, 201);
  } catch (err) {
    next(err);
  }
}

function tableFromUsers(users) {
  return {
    columns: ['Name', 'Email', 'Role', 'Date'],
    rows: users.map((user) => [user.fullName || '', user.email, user.role, user.createdAt]),
  };
}

async function assistantQuery(req, res, next) {
  try {
    const message = String(req.body.message || req.body.prompt || '').trim();
    const prompt = message.toLowerCase();
    if (!message) return errorResponse(res, 'Assistant message is required', 400);

    let response;

    if (prompt.includes('registered') && (prompt.includes('week') || prompt.includes('7 day'))) {
      const since = getStartOfLastSevenDays();
      const users = await User.find({ createdAt: { $gte: since } }).sort({ createdAt: -1 }).limit(20).lean();
      response = {
        answer: `Here are ${users.length} users who registered in the last 7 days.`,
        table: tableFromUsers(users),
      };
    } else if (prompt.includes('uploaded today') || (prompt.includes('product') && prompt.includes('today'))) {
      const today = getStartOfToday();
      const products = await Product.find({ createdAt: { $gte: today } }).sort({ createdAt: -1 }).limit(20).lean();
      response = {
        answer: `${products.length} products were uploaded today.`,
        table: {
          columns: ['Product', 'Seller', 'Category', 'Stock'],
          rows: products.map((product) => [product.name, product.seller?.email || product.seller?.name || '', product.category, product.stock]),
        },
      };
    } else if (prompt.includes('pending order')) {
      const orders = await Order.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(20).lean();
      response = {
        answer: `${orders.length} pending orders need review.`,
        table: {
          columns: ['Order', 'Product', 'Customer', 'Farmer'],
          rows: orders.map((order) => [order.orderNumber, order.product?.name || '', order.customer?.email || '', order.farmer?.email || '']),
        },
      };
    } else if (prompt.includes('users by role') || prompt.includes('role')) {
      const rows = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
      response = {
        answer: 'Here is the current user count by role.',
        table: {
          columns: ['Role', 'Users'],
          rows: rows.map((row) => [row._id, row.count]),
        },
      };
    } else if (prompt.includes('active farmer') || prompt.includes('top farmer')) {
      const farmers = await getTopFarmers(5);
      response = {
        answer: 'Top active farmers ranked by product and order activity.',
        table: {
          columns: ['Farmer', 'Products', 'Orders', 'Rating'],
          rows: farmers.map((farmer) => [farmer.name, farmer.products, farmer.orders, farmer.rating || 'Not rated']),
        },
      };
    } else if (prompt.includes('recent product')) {
      const products = await Product.find({}).sort({ createdAt: -1 }).limit(10).lean();
      response = {
        answer: 'Here are the most recent products.',
        table: {
          columns: ['Product', 'Seller', 'Category', 'Created'],
          rows: products.map((product) => [product.name, product.seller?.email || '', product.category, product.createdAt]),
        },
      };
    } else {
      const [users, products, orders, messages] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
        Message.countDocuments(),
      ]);
      response = {
        answer: `FarmersHub currently has ${users} users, ${products} products, ${orders} orders, and ${messages} messages. Try asking for registered users this week, pending orders, users by role, recent products, or top active farmers.`,
        chips: ['Registered users this week', 'Pending orders', 'Users by role', 'Recent products', 'Top active farmers'],
      };
    }

    await recordAdminLog(req.user, 'assistant_query', 'Assistant', '', { prompt: message }, req);
    return successResponse(res, 'Assistant response', response);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOverview,
  listUsers,
  getUserDetails,
  deleteUser,
  listProducts,
  deleteProduct,
  listUploads,
  deleteUpload,
  listOrders,
  updateOrder,
  deleteOrder,
  listMessages,
  deleteMessage,
  deleteConversation,
  listAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getSettings,
  updateSettings,
  listLogs,
  createBackup,
  assistantQuery,
};
