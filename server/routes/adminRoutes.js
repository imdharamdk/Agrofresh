const express = require('express');
const { body, param } = require('express-validator');
const { getUsers, verifyFarmer, getAllOrders, getAnalytics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect, authorize('admin'));
router.get('/users', getUsers);
router.put('/users/:id/verify', [param('id').isMongoId(), body('isVerified').optional().isBoolean(), validate], verifyFarmer);
router.get('/orders', getAllOrders);
router.get('/analytics', getAnalytics);

module.exports = router;
