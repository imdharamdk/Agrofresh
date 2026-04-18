const express = require('express');
const { body } = require('express-validator');
const { createSubscription, getMySubscriptions } = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.post('/', protect, authorize('farmer', 'business'), [body('plan').isIn(['growth', 'enterprise']), validate], createSubscription);
router.get('/mine', protect, authorize('farmer', 'business'), getMySubscriptions);

module.exports = router;
