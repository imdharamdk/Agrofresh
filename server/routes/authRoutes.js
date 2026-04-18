const express = require('express');
const { body } = require('express-validator');
const { register, login, me, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['farmer', 'customer', 'business']).withMessage('Role must be farmer, customer, or business'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('businessName').custom((value, { req }) => {
      if (req.body.role === 'business' && !value) {
        throw new Error('Business name is required for business accounts');
      }
      return true;
    }),
    validate
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  login
);

router.get('/me', protect, me);
router.post('/logout', protect, logout);

module.exports = router;
