const Subscription = require('../models/Subscription');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/response');

const planCatalog = {
  growth: {
    price: 999,
    features: ['Bulk order tools', 'Negotiation dashboard', 'Priority listing']
  },
  enterprise: {
    price: 2499,
    features: ['Dedicated success manager', 'Advanced analytics', 'Featured marketplace placement']
  }
};

const createSubscription = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  const catalogEntry = planCatalog[plan];

  if (!catalogEntry) {
    return sendResponse(res, 400, false, {}, 'Invalid subscription plan');
  }

  const subscription = await Subscription.create({
    userId: req.user._id,
    plan,
    price: catalogEntry.price,
    features: catalogEntry.features
  });

  await User.findByIdAndUpdate(req.user._id, { subscriptionPlan: plan });

  sendResponse(res, 201, true, { subscription }, 'Subscription activated successfully');
});

const getMySubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({ userId: req.user._id }).sort({ createdAt: -1 });
  sendResponse(res, 200, true, { subscriptions }, 'Subscriptions fetched successfully');
});

module.exports = {
  createSubscription,
  getMySubscriptions,
  planCatalog
};
