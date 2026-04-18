const express = require('express');
const { body, param } = require('express-validator');
const {
  createOrder,
  createBulkOrder,
  getMyOrders,
  getFarmerOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

const addressValidators = [
  body('deliveryAddress.street').trim().notEmpty().withMessage('Street is required'),
  body('deliveryAddress.city').trim().notEmpty().withMessage('City is required'),
  body('deliveryAddress.state').trim().notEmpty().withMessage('State is required'),
  body('deliveryAddress.pincode').trim().notEmpty().withMessage('Pincode is required')
];

const orderValidators = [
  body('items').isArray({ min: 1 }).withMessage('Order items are required'),
  body('items.*.productId').isMongoId().withMessage('Valid product id is required'),
  body('items.*.qty').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.price').optional().isFloat({ min: 0 }).withMessage('Price must be valid'),
  body('paymentMethod').isIn(['COD']).withMessage('Only COD is supported'),
  ...addressValidators,
  validate
];

router.post('/', protect, authorize('customer'), orderValidators, createOrder);
router.post('/bulk', protect, authorize('business'), orderValidators, createBulkOrder);
router.get('/my-orders', protect, authorize('customer', 'business'), getMyOrders);
router.get('/farmer-orders', protect, authorize('farmer'), getFarmerOrders);
router.get('/:id', protect, [param('id').isMongoId(), validate], getOrderById);
router.put(
  '/:id/status',
  protect,
  authorize('farmer'),
  [param('id').isMongoId(), body('status').isIn(['confirmed', 'cancelled']), validate],
  updateOrderStatus
);

module.exports = router;
