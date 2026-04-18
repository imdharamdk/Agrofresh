const express = require('express');
const { body, param } = require('express-validator');
const { getDeliveryOrders, assignDeliveryPartner, updateDeliveryStatus } = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/orders', protect, authorize('delivery', 'admin'), getDeliveryOrders);
router.put('/assign/:orderId', protect, authorize('admin'), [param('orderId').isMongoId(), body('deliveryPartnerId').isMongoId(), validate], assignDeliveryPartner);
router.put('/status/:orderId', protect, authorize('delivery', 'admin'), [param('orderId').isMongoId(), body('deliveryStatus').isIn(['assigned', 'picked_up', 'in_transit', 'delivered']), validate], updateDeliveryStatus);

module.exports = router;
