const Order = require('../models/Order');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/response');

const getDeliveryOrders = asyncHandler(async (req, res) => {
  let query = { deliveryStatus: { $in: ['assigned', 'picked_up', 'in_transit'] } };

  if (req.user.role === 'delivery') {
    query = { assignedDeliveryPartner: req.user._id };
  }

  const orders = await Order.find(query)
    .populate('buyerId', 'name phone location businessName')
    .populate('assignedDeliveryPartner', 'name phone')
    .populate('items.productId', 'name unit')
    .sort({ createdAt: -1 });

  sendResponse(res, 200, true, { orders }, 'Delivery orders fetched successfully');
});

const assignDeliveryPartner = asyncHandler(async (req, res) => {
  const { deliveryPartnerId } = req.body;
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return sendResponse(res, 404, false, {}, 'Order not found');
  }

  const partner = await User.findById(deliveryPartnerId);
  if (!partner || partner.role !== 'delivery') {
    return sendResponse(res, 404, false, {}, 'Delivery partner not found');
  }

  order.assignedDeliveryPartner = partner._id;
  order.deliveryStatus = 'assigned';
  await order.save();

  sendResponse(res, 200, true, { order }, 'Delivery partner assigned successfully');
});

const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return sendResponse(res, 404, false, {}, 'Order not found');
  }

  const isAssignedPartner = order.assignedDeliveryPartner && order.assignedDeliveryPartner.toString() === req.user._id.toString();
  if (!isAssignedPartner && req.user.role !== 'admin') {
    return sendResponse(res, 403, false, {}, 'You cannot update this delivery');
  }

  order.deliveryStatus = req.body.deliveryStatus;
  if (req.body.deliveryStatus === 'delivered') {
    order.status = 'delivered';
  }
  await order.save();

  sendResponse(res, 200, true, { order }, 'Delivery status updated successfully');
});

module.exports = {
  getDeliveryOrders,
  assignDeliveryPartner,
  updateDeliveryStatus
};
