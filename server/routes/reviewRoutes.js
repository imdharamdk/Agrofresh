const express = require('express');
const { body, param } = require('express-validator');
const { createReview, getFarmerReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('customer', 'business'),
  [body('farmerId').isMongoId(), body('rating').isInt({ min: 1, max: 5 }), body('comment').trim().notEmpty(), validate],
  createReview
);
router.get('/:farmerId', [param('farmerId').isMongoId(), validate], getFarmerReviews);

module.exports = router;
