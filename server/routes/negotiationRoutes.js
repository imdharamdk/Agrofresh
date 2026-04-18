const express = require('express');
const { body, param } = require('express-validator');
const {
  createNegotiation,
  getNegotiationById,
  listMyNegotiations,
  updateNegotiationStatus
} = require('../controllers/negotiationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('business'),
  [
    body('productId').isMongoId(),
    body('requestedQty').isInt({ min: 1 }),
    body('requestedPrice').isFloat({ min: 0 }),
    body('notes').optional().isString(),
    validate
  ],
  createNegotiation
);

router.get('/mine', protect, authorize('business', 'farmer'), listMyNegotiations);
router.get('/:id', protect, [param('id').isMongoId(), validate], getNegotiationById);
router.put(
  '/:id',
  protect,
  authorize('business', 'farmer'),
  [
    param('id').isMongoId(),
    body('latestOfferPrice').optional().isFloat({ min: 0 }),
    body('status').optional().isIn(['open', 'accepted', 'rejected', 'closed']),
    body('notes').optional().isString(),
    validate
  ],
  updateNegotiationStatus
);

module.exports = router;
