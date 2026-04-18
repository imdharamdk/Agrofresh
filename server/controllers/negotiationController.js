const Negotiation = require('../models/Negotiation');
const Product = require('../models/Product');
const ChatMessage = require('../models/ChatMessage');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/response');

const createNegotiation = asyncHandler(async (req, res) => {
  const { productId, requestedQty, requestedPrice, notes } = req.body;

  if (req.user.role !== 'business') {
    return sendResponse(res, 403, false, {}, 'Only business buyers can start negotiations');
  }

  const product = await Product.findById(productId);
  if (!product) {
    return sendResponse(res, 404, false, {}, 'Product not found');
  }

  const negotiation = await Negotiation.create({
    productId,
    farmerId: product.farmerId,
    businessId: req.user._id,
    requestedQty,
    requestedPrice,
    latestOfferPrice: requestedPrice,
    notes
  });

  sendResponse(res, 201, true, { negotiation }, 'Negotiation created successfully');
});

const getNegotiationById = asyncHandler(async (req, res) => {
  const negotiation = await Negotiation.findById(req.params.id)
    .populate('productId', 'name price bulkPrice minBulkQty unit images')
    .populate('farmerId', 'name phone location')
    .populate('businessId', 'name businessName phone location');

  if (!negotiation) {
    return sendResponse(res, 404, false, {}, 'Negotiation not found');
  }

  const isParty = [negotiation.farmerId._id.toString(), negotiation.businessId._id.toString()].includes(req.user._id.toString()) || req.user.role === 'admin';
  if (!isParty) {
    return sendResponse(res, 403, false, {}, 'You are not allowed to view this negotiation');
  }

  const messages = await ChatMessage.find({ negotiationId: negotiation._id })
    .populate('senderId', 'name role businessName')
    .sort({ createdAt: 1 });

  sendResponse(res, 200, true, { negotiation, messages }, 'Negotiation fetched successfully');
});

const listMyNegotiations = asyncHandler(async (req, res) => {
  const query = req.user.role === 'business' ? { businessId: req.user._id } : { farmerId: req.user._id };
  const negotiations = await Negotiation.find(query)
    .populate('productId', 'name unit images price bulkPrice')
    .populate('farmerId', 'name')
    .populate('businessId', 'name businessName')
    .sort({ createdAt: -1 });

  sendResponse(res, 200, true, { negotiations }, 'Negotiations fetched successfully');
});

const updateNegotiationStatus = asyncHandler(async (req, res) => {
  const negotiation = await Negotiation.findById(req.params.id);

  if (!negotiation) {
    return sendResponse(res, 404, false, {}, 'Negotiation not found');
  }

  const isParty = [negotiation.farmerId.toString(), negotiation.businessId.toString()].includes(req.user._id.toString());
  if (!isParty) {
    return sendResponse(res, 403, false, {}, 'You cannot update this negotiation');
  }

  if (req.body.latestOfferPrice !== undefined) {
    negotiation.latestOfferPrice = Number(req.body.latestOfferPrice);
  }

  if (req.body.status) {
    negotiation.status = req.body.status;
  }

  if (req.body.notes !== undefined) {
    negotiation.notes = req.body.notes;
  }

  await negotiation.save();
  sendResponse(res, 200, true, { negotiation }, 'Negotiation updated successfully');
});

module.exports = {
  createNegotiation,
  getNegotiationById,
  listMyNegotiations,
  updateNegotiationStatus
};
