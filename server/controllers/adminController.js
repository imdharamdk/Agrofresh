const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Negotiation = require('../models/Negotiation');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/response');
const { createProduct, updateProduct, deleteProduct } = require('./productController');

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  sendResponse(res, 200, true, { users }, 'Users fetched successfully');
});

const verifyFarmer = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user || user.role !== 'farmer') {
    return sendResponse(res, 404, false, {}, 'Farmer not found');
  }

  user.isVerified = req.body.isVerified !== undefined ? req.body.isVerified : true;
  await user.save();

  sendResponse(res, 200, true, { user }, 'Farmer verification updated');
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('buyerId', 'name role businessName')
    .populate('assignedDeliveryPartner', 'name')
    .sort({ createdAt: -1 });

  sendResponse(res, 200, true, { orders }, 'Orders fetched successfully');
});

const getAnalytics = asyncHandler(async (req, res) => {
  const [users, orders, products, negotiations] = await Promise.all([
    User.countDocuments(),
    Order.find(),
    Product.countDocuments(),
    Negotiation.countDocuments()
  ]);

  const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const commission = orders.reduce((sum, order) => sum + order.commissionAmount, 0);

  sendResponse(
    res,
    200,
    true,
    {
      users,
      products,
      negotiations,
      orders: orders.length,
      revenue,
      commission,
      b2bOrders: orders.filter((order) => order.orderType === 'B2B').length,
      b2cOrders: orders.filter((order) => order.orderType === 'B2C').length
    },
    'Analytics fetched successfully'
  );
});

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find()
    .populate('farmerId', 'name businessName email location isVerified')
    .sort({ createdAt: -1 });

  sendResponse(res, 200, true, { products }, 'Admin products fetched successfully');
});

module.exports = {
  getUsers,
  verifyFarmer,
  getAllOrders,
  getAnalytics,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
