const express = require('express');
const { body, param } = require('express-validator');
const {
  getUsers,
  verifyFarmer,
  getAllOrders,
  getAnalytics,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { CATEGORY_OPTIONS, UNIT_OPTIONS } = require('../utils/productCatalog');

const router = express.Router();
const booleanString = ['true', 'false'];

router.use(protect, authorize('admin'));
router.get('/users', getUsers);
router.put('/users/:id/verify', [param('id').isMongoId(), body('isVerified').optional().isBoolean(), validate], verifyFarmer);
router.get('/orders', getAllOrders);
router.get('/analytics', getAnalytics);
router.get('/products', getAllProducts);
router.post(
  '/products',
  upload.array('images', 5),
  [
    body('farmerId').isMongoId(),
    body('name').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('category').isIn(CATEGORY_OPTIONS),
    body('price').isFloat({ min: 0 }),
    body('bulkPrice').optional().isFloat({ min: 0 }),
    body('minBulkQty').optional().isFloat({ min: 0 }),
    body('unit').isIn(UNIT_OPTIONS),
    body('quantity').isFloat({ min: 0 }),
    body('harvestDate').optional().isISO8601(),
    body('location').optional().isString(),
    body('imageUrl').optional().isURL(),
    body('isOrganic').optional().isIn(booleanString),
    validate
  ],
  createProduct
);
router.put(
  '/products/:id',
  upload.array('images', 5),
  [
    param('id').isMongoId(),
    body('farmerId').optional().isMongoId(),
    body('category').optional().isIn(CATEGORY_OPTIONS),
    body('price').optional().isFloat({ min: 0 }),
    body('bulkPrice').optional().isFloat({ min: 0 }),
    body('minBulkQty').optional().isFloat({ min: 0 }),
    body('quantity').optional().isFloat({ min: 0 }),
    body('unit').optional().isIn(UNIT_OPTIONS),
    body('harvestDate').optional().isISO8601(),
    body('location').optional().isString(),
    body('imageUrl').optional().isURL(),
    body('isOrganic').optional().isIn(booleanString),
    validate
  ],
  updateProduct
);
router.delete('/products/:id', [param('id').isMongoId(), validate], deleteProduct);

module.exports = router;
