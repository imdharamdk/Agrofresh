const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.NODE_ENV = 'test';

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Negotiation = require('./models/Negotiation');
const orderRoutes = require('./routes/orderRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const originalJwtVerify = jwt.verify;
const originalUserFindById = User.findById;
const originalProductFindById = Product.findById;
const originalOrderCreate = Order.create;
const originalOrderFindById = Order.findById;
const originalNegotiationFindById = Negotiation.findById;
const originalNegotiationFindByIdAndUpdate = Negotiation.findByIdAndUpdate;
const originalStartSession = mongoose.startSession;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/orders', orderRoutes);
app.use(errorHandler);

const queryResult = (value) => ({
  session: async () => value,
  then: (resolve, reject) => Promise.resolve(value).then(resolve, reject),
  catch: (reject) => Promise.resolve(value).catch(reject)
});

const makeProduct = ({ id, farmerId = 'farmer-1', price = 42, quantity = 10 }) => ({
  _id: id,
  name: 'Tomatoes',
  price,
  quantity,
  isAvailable: quantity > 0,
  farmerId,
  save: async function save() {
    return this;
  }
});

const makeSession = () => ({
  startTransaction() {},
  commitTransaction: async () => {},
  abortTransaction: async () => {},
  endSession() {}
});

const authCookie = (userId) => [`token=${userId}`];

const users = {};
let products = {};
let negotiations = {};
let orders = {};
let createdOrders = [];

const resetMocks = () => {
  products = {};
  negotiations = {};
  orders = {};
  createdOrders = [];

  jwt.verify = (token, secret) => {
    assert.equal(secret, process.env.JWT_SECRET);
    return { userId: token };
  };

  User.findById = (id) => ({
    select: async () => users[id] || null
  });

  Product.findById = (id) => queryResult(products[id] || null);
  Negotiation.findById = (id) => queryResult(negotiations[id] || null);
  Negotiation.findByIdAndUpdate = async (id, update) => {
    if (negotiations[id]) {
      Object.assign(negotiations[id], update);
    }
    return negotiations[id] || null;
  };

  Order.create = async (docs) => {
    createdOrders = docs.map((doc, index) => ({ _id: `order-${index + 1}`, ...doc }));
    createdOrders.forEach((order) => {
      orders[order._id] = order;
    });
    return createdOrders;
  };

  Order.findById = async (id) => orders[id] || null;
  mongoose.startSession = async () => makeSession();
};

test.beforeEach(() => {
  users.customer = { _id: 'customer', role: 'customer', name: 'Customer' };
  users.business = { _id: 'business', role: 'business', name: 'Business Buyer' };
  users.farmer = { _id: 'farmer', role: 'farmer', name: 'Farmer' };
  users.admin = { _id: 'admin', role: 'admin', name: 'Admin' };
  resetMocks();
});

test.after(() => {
  jwt.verify = originalJwtVerify;
  User.findById = originalUserFindById;
  Product.findById = originalProductFindById;
  Order.create = originalOrderCreate;
  Order.findById = originalOrderFindById;
  Negotiation.findById = originalNegotiationFindById;
  Negotiation.findByIdAndUpdate = originalNegotiationFindByIdAndUpdate;
  mongoose.startSession = originalStartSession;
});

test('POST /api/orders ignores client supplied price for B2C orders', async () => {
  products['507f1f77bcf86cd799439011'] = makeProduct({ id: '507f1f77bcf86cd799439011', price: 42, quantity: 10 });

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', authCookie('customer'))
    .send({
      items: [{ productId: '507f1f77bcf86cd799439011', qty: 2, price: 1 }],
      deliveryAddress: { street: 'A', city: 'B', state: 'C', pincode: '123456' },
      paymentMethod: 'COD'
    });

  assert.equal(response.status, 201);
  assert.equal(createdOrders[0].items[0].price, 42);
  assert.equal(createdOrders[0].totalAmount, 84);
  assert.equal(products['507f1f77bcf86cd799439011'].quantity, 8);
});

test('POST /api/orders/bulk requires a negotiation id', async () => {
  const response = await request(app)
    .post('/api/orders/bulk')
    .set('Cookie', authCookie('business'))
    .send({
      items: [{ productId: '507f1f77bcf86cd799439011', qty: 5, price: 1 }],
      deliveryAddress: { street: 'A', city: 'B', state: 'C', pincode: '123456' },
      paymentMethod: 'COD'
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.message, 'Accepted negotiation id is required for bulk orders');
});

test('POST /api/orders/bulk uses the accepted negotiation price instead of client price', async () => {
  products['507f1f77bcf86cd799439011'] = makeProduct({ id: '507f1f77bcf86cd799439011', price: 200, quantity: 12 });
  negotiations['507f1f77bcf86cd799439012'] = {
    _id: '507f1f77bcf86cd799439012',
    productId: '507f1f77bcf86cd799439011',
    businessId: 'business',
    farmerId: 'farmer',
    requestedQty: 5,
    latestOfferPrice: 80,
    status: 'accepted'
  };

  const response = await request(app)
    .post('/api/orders/bulk')
    .set('Cookie', authCookie('business'))
    .send({
      negotiationId: '507f1f77bcf86cd799439012',
      items: [{ productId: '507f1f77bcf86cd799439011', qty: 5, price: 1 }],
      deliveryAddress: { street: 'A', city: 'B', state: 'C', pincode: '123456' },
      paymentMethod: 'COD'
    });

  assert.equal(response.status, 201);
  assert.equal(createdOrders[0].items[0].price, 80);
  assert.equal(createdOrders[0].totalAmount, 400);
  assert.equal(products['507f1f77bcf86cd799439011'].quantity, 7);
});

test('PUT /api/orders/:id/status rejects delivered updates from farmers', async () => {
  orders.order1 = {
    _id: 'order1',
    items: [{ farmerId: 'farmer' }],
    status: 'pending',
    save: async function save() {
      return this;
    }
  };

  const response = await request(app)
    .put('/api/orders/order1/status')
    .set('Cookie', authCookie('farmer'))
    .send({ status: 'delivered' });

  assert.equal(response.status, 400);
  assert.equal(response.body.message, 'Validation failed');
  assert.equal(orders.order1.status, 'pending');
});
