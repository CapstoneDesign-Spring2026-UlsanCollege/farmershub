const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.USE_IN_MEMORY_DB = 'true';
process.env.JWT_SECRET = 'test-secret';

const { app, resetMemoryStore } = require('../server');

test.beforeEach(() => {
  resetMemoryStore();
});

test('health endpoint reports server status', async () => {
  const response = await request(app).get('/api/health');

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.status, 'ok');
  assert.equal(response.body.data.inMemoryMode, true);
});

test('register, login, and fetch profile works', async () => {
  const register = await request(app).post('/api/auth/register').send({
    email: 'farmer1@example.com',
    password: 'Password123!',
    role: 'farmer',
    fullName: 'Farmer One',
    age: 28,
    gender: 'male',
    address: 'Village 1',
    phone: '010-1000-1000',
    paymentMethod: 'cash'
  });

  assert.equal(register.status, 201);
  assert.equal(register.body.success, true);
  assert.ok(register.body.token);

  const login = await request(app).post('/api/auth/login').send({
    email: 'farmer1@example.com',
    password: 'Password123!'
  });

  assert.equal(login.status, 200);
  assert.equal(login.body.success, true);
  assert.equal(login.body.user.role, 'farmer');

  const profile = await request(app)
    .get('/api/users/me')
    .set('Authorization', `Bearer ${login.body.token}`);

  assert.equal(profile.status, 200);
  assert.equal(profile.body.success, true);
  assert.equal(profile.body.data.email, 'farmer1@example.com');
});

test('farmer can create/update/delete products and search them', async () => {
  await request(app).post('/api/auth/register').send({
    email: 'farmer2@example.com',
    password: 'Password123!',
    role: 'farmer',
    fullName: 'Farmer Two',
    age: 31,
    gender: 'female',
    address: 'Village 2',
    phone: '010-2222-2222',
    paymentMethod: 'card'
  });

  const login = await request(app).post('/api/auth/login').send({
    email: 'farmer2@example.com',
    password: 'Password123!'
  });

  const token = login.body.token;

  const created = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Organic Tomato',
      category: 'Vegetable',
      sellingPrice: 10,
      discount: 10,
      stock: 20,
      harvestDate: '2026-05-01'
    });

  assert.equal(created.status, 201);
  assert.equal(created.body.success, true);
  assert.equal(created.body.data.name, 'Organic Tomato');
  assert.equal(created.body.data.price, 9);

  const list = await request(app).get('/api/products?search=tomato');
  assert.equal(list.status, 200);
  assert.equal(list.body.success, true);
  assert.equal(list.body.data.length, 1);

  const productId = created.body.data.id;

  const updated = await request(app)
    .put(`/api/products/${productId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Organic Tomato Premium',
      category: 'Vegetable',
      sellingPrice: 12,
      discount: 0,
      stock: 18
    });

  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.name, 'Organic Tomato Premium');
  assert.equal(updated.body.data.price, 12);

  const deleted = await request(app)
    .delete(`/api/products/${productId}`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(deleted.status, 200);
  assert.equal(deleted.body.success, true);

  const afterDelete = await request(app).get('/api/products?search=tomato');
  assert.equal(afterDelete.body.data.length, 0);
});