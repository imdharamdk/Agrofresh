const Review = require('../models/Review');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/response');

const createReview = asyncHandler(async (req, res) => {
  const { farmerId, rating, comment } = req.body;

  const farmer = await User.findById(farmerId);
  if (!farmer || farmer.role !== 'farmer') {
    return sendResponse(res, 404, false, {}, 'Farmer not found');
  }

  const review = await Review.create({
    farmerId,
    reviewerId: req.user._id,
    rating,
    comment
  });

  sendResponse(res, 201, true, { review }, 'Review created successfully');
});

const getFarmerReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ farmerId: req.params.farmerId })
    .populate('reviewerId', 'name role businessName')
    .sort({ createdAt: -1 });

  const averageRating = reviews.length
    ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
    : 0;

  sendResponse(res, 200, true, { reviews, averageRating }, 'Reviews fetched successfully');
});

module.exports = {
  createReview,
  getFarmerReviews
};
