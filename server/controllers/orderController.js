const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Negotiation = require('../models/Negotiation');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/response');

const buildOrderItems = async (items, session, options = {}) => {
  const { orderType, negotiation } = options;
  const orderItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId).session(session);

    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    if (product.quantity < item.qty) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    product.quantity -= item.qty;
    product.isAvailable = product.quantity > 0;
    await product.save({ session });

    let unitPrice = product.price;

    if (orderType === 'B2B') {
      unitPrice = Number(negotiation.latestOfferPrice);
    }
    orderItems.push({
      productId: product._id,
      productName: product.name,
      qty: item.qty,
      price: unitPrice,
      farmerId: product.farmerId
    });
    totalAmount += item.qty * unitPrice;
  }

  return { orderItems, totalAmount };
};

const createGenericOrder = async (req, res, orderType, negotiationId = null) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, deliveryAddress, paymentMethod } = req.body;
    let negotiation = null;

    if (orderType === 'B2B') {
      negotiation = await Negotiation.findById(negotiationId).session(session);

      if (!negotiation) {
        throw new Error('Negotiation not found');
      }

      if (negotiation.status !== 'accepted') {
        throw new Error('Only accepted negotiations can be converted to orders');
      }

      if (items.length !== 1) {
        throw new Error('Bulk orders must contain exactly one negotiated product');
      }

      const [item] = items;
      if (negotiation.productId.toString() !== item.productId) {
        throw new Error('Bulk order product must match the negotiated product');
      }

      if (Number(item.qty) !== negotiation.requestedQty) {
        throw new Error('Bulk order quantity must match the accepted negotiation quantity');
      }
    }

    const { orderItems, totalAmount } = await buildOrderItems(items, session, { orderType, negotiation });
    const commissionAmount = Number((totalAmount * 0.05).toFixed(2));

    const [order] = await Order.create(
      [
        {
          buyerId: req.user._id,
          items: orderItems,
          totalAmount,
          deliveryAddress,
          paymentMethod,
          orderType,
          commissionAmount,
          negotiationId
        }
      ],
      { session }
    );

    if (negotiationId) {
      await Negotiation.findByIdAndUpdate(negotiationId, { status: 'accepted' }, { session });
    }

    await session.commitTransaction();
    sendResponse(res, 201, true, { orderId: order._id, order }, 'Order placed successfully');
  } catch (error) {
    await session.abortTransaction();
    res.status(400);
    throw error;
  } finally {
    session.endSession();
  }
};

const createOrder = asyncHandler(async (req, res) => {
  await createGenericOrder(req, res, 'B2C');
});

const createBulkOrder = asyncHandler(async (req, res) => {
  const { negotiationId } = req.body;

  if (req.user.role !== 'business') {
    return sendResponse(res, 403, false, {}, 'Only business accounts can place bulk orders');
  }

  if (!negotiationId) {
    return sendResponse(res, 400, false, {}, 'Accepted negotiation id is required for bulk orders');
  }

  if (negotiationId) {
    const negotiation = await Negotiation.findById(negotiationId);
    if (!negotiation) {
      return sendResponse(res, 404, false, {}, 'Negotiation not found');
    }
    if (negotiation.businessId.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, {}, 'Negotiation does not belong to this business');
    }
  }

  await createGenericOrder(req, res, 'B2B', negotiationId || null);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyerId: req.user._id })
    .populate('items.productId', 'name images unit')
    .populate('assignedDeliveryPartner', 'name phone')
    .sort({ createdAt: -1 });

  sendResponse(res, 200, true, { orders }, 'Orders fetched successfully');
});

const getFarmerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ 'items.farmerId': req.user._id })
    .populate('buyerId', 'name role phone location businessName')
    .populate('items.productId', 'name images unit')
    .populate('assignedDeliveryPartner', 'name phone')
    .sort({ createdAt: -1 });

  sendResponse(res, 200, true, { orders }, 'Farmer orders fetched successfully');
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('buyerId', 'name email phone location businessName role')
    .populate('items.productId', 'name images unit')
    .populate('assignedDeliveryPartner', 'name phone')
    .populate('negotiationId');

  if (!order) {
    return sendResponse(res, 404, false, {}, 'Order not found');
  }

  const userId = req.user._id.toString();
  const isBuyer = order.buyerId?._id?.toString() === userId;
  const isFarmer = order.items.some((item) => item.farmerId.toString() === userId);
  const isDelivery = order.assignedDeliveryPartner?._id?.toString() === userId;
  const isAdmin = req.user.role === 'admin';

  if (!isBuyer && !isFarmer && !isDelivery && !isAdmin) {
    return sendResponse(res, 403, false, {}, 'You are not allowed to view this order');
  }

  sendResponse(res, 200, true, { order }, 'Order fetched successfully');
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return sendResponse(res, 404, false, {}, 'Order not found');
  }

  const ownsProducts = order.items.some((item) => item.farmerId.toString() === req.user._id.toString());
  if (!ownsProducts) {
    return sendResponse(res, 403, false, {}, 'You can only update orders containing your products');
  }

  if (!['confirmed', 'cancelled'].includes(req.body.status)) {
    return sendResponse(res, 400, false, {}, 'Farmers can only mark orders as confirmed or cancelled');
  }

  order.status = req.body.status;
  await order.save();

  const updatedOrder = await Order.findById(order._id)
    .populate('buyerId', 'name email phone location businessName role')
    .populate('items.productId', 'name images unit')
    .populate('assignedDeliveryPartner', 'name phone');

  sendResponse(res, 200, true, { order: updatedOrder }, 'Order status updated successfully');
});

module.exports = {
  createOrder,
  createBulkOrder,
  getMyOrders,
  getFarmerOrders,
  getOrderById,
  updateOrderStatus
};
