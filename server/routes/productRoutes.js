const express = require('express');
const { body, query, param } = require('express-validator');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { CATEGORY_OPTIONS, UNIT_OPTIONS } = require('../utils/productCatalog');

const router = express.Router();

const booleanString = ['true', 'false'];

router.get(
  '/',
  [
    query('category').optional().isIn(CATEGORY_OPTIONS),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('bulkAvailable').optional().isIn(booleanString),
    query('fresh').optional().isIn(booleanString),
    query('organic').optional().isIn(booleanString),
    query('nearMe').optional().isIn(booleanString),
    query('location').optional().isString(),
    validate
  ],
  getProducts
);

router.get('/farmer/my-products', protect, authorize('farmer'), getMyProducts);
router.get('/:id', [param('id').isMongoId(), validate], getProductById);

router.post(
  '/',
  protect,
  authorize('farmer'),
  upload.array('images', 5),
  [
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
  '/:id',
  protect,
  authorize('farmer'),
  upload.array('images', 5),
  [
    param('id').isMongoId(),
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

router.delete('/:id', protect, authorize('farmer'), [param('id').isMongoId(), validate], deleteProduct);

module.exports = router;
