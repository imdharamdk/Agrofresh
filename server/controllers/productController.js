const Product = require('../models/Product');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/response');
const { buildProductAiMeta } = require('../utils/aiSignals');
const { parseHarvestDate, getFreshnessTag, buildLocationRegex } = require('../utils/productCatalog');

const normalizeUploadedImages = (files) => {
  if (!files || !files.length) {
    return [];
  }

  return files
    .map((file) => ({
      url: file.path || file.secure_url || '',
      public_id: file.filename || file.public_id || ''
    }))
    .filter((image) => image.url);
};

const removeCloudinaryImages = async (images) => {
  const deletions = images
    .filter((image) => image.public_id)
    .map((image) => cloudinary.uploader.destroy(image.public_id));

  if (deletions.length) {
    await Promise.allSettled(deletions);
  }
};

const toBoolean = (value) => value === true || value === 'true';

const parseImageList = (value) => {
  if (!value) return null;
  if (Array.isArray(value)) return value.filter(Boolean);

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : null;
  } catch (error) {
    return null;
  }
};

const canManageProduct = (actor, product) => (
  actor?.role === 'admin' || product.farmerId.toString() === actor?._id?.toString()
);

const resolveOwnerForAdmin = async (farmerId) => {
  if (!farmerId) {
    throw new Error('farmerId is required for admin product management');
  }

  const owner = await User.findById(farmerId);

  if (!owner || owner.role !== 'farmer') {
    throw new Error('Selected farmer was not found');
  }

  return owner;
};

const resolveProductOwner = async (actor, farmerId, fallbackOwnerId) => {
  if (actor.role === 'admin') {
    const selectedOwnerId = farmerId || fallbackOwnerId;
    return resolveOwnerForAdmin(selectedOwnerId);
  }

  return actor;
};

const assignProductFields = (target, payload, owner) => {
  const hasValue = (value) => value !== undefined && value !== null && value !== '';
  const imageUrl = String(payload.imageUrl || '').trim();
  const harvestDate = hasValue(payload.harvestDate) ? parseHarvestDate(payload.harvestDate) : target.harvestDate;
  const location = String(payload.location || target.location || owner.location || '').trim();
  const isOrganic = payload.isOrganic !== undefined
    ? toBoolean(payload.isOrganic)
    : payload.category === 'Organic' || target.category === 'Organic' || Boolean(target.isOrganic);

  target.name = String(payload.name || target.name || '').trim();
  target.description = String(payload.description || target.description || '').trim();
  target.category = payload.category || target.category;
  target.price = hasValue(payload.price) ? Number(payload.price) : Number(target.price || 0);
  target.bulkPrice = hasValue(payload.bulkPrice) ? Number(payload.bulkPrice) : Number(target.bulkPrice || 0);
  target.minBulkQty = hasValue(payload.minBulkQty) ? Number(payload.minBulkQty) : Number(target.minBulkQty || 0);
  target.quantity = hasValue(payload.quantity) ? Number(payload.quantity) : Number(target.quantity || 0);
  target.unit = payload.unit || target.unit;
  target.isOrganic = isOrganic;
  target.isFeatured = payload.isFeatured !== undefined ? toBoolean(payload.isFeatured) : Boolean(target.isFeatured);
  target.harvestDate = harvestDate;
  target.freshnessTag = getFreshnessTag(harvestDate);
  target.location = location;
  target.isAvailable = Number(target.quantity) > 0;
  target.farmerId = owner._id;

  if (imageUrl) {
    target.imageUrl = imageUrl;
  } else if (!target.imageUrl && target.images?.length) {
    target.imageUrl = target.images[0].url;
  }

  target.aiMeta = buildProductAiMeta(target);
  return target;
};

const createProduct = asyncHandler(async (req, res) => {
  const owner = await resolveProductOwner(req.user, req.body.farmerId);
  const product = assignProductFields(new Product({ farmerId: owner._id }), req.body, owner);
  const uploadedImages = normalizeUploadedImages(req.files).slice(0, 5);

  if (uploadedImages.length) {
    product.images = uploadedImages;
    product.imageUrl = uploadedImages[0].url;
  }

  await product.save();

  const populatedProduct = await Product.findById(product._id).populate('farmerId', 'name email phone location avatar businessName isVerified');
  sendResponse(res, 201, true, { product: populatedProduct }, 'Product created successfully');
});

const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    minPrice,
    maxPrice,
    bulkAvailable,
    fresh,
    organic,
    location,
    nearMe,
    page = 1,
    limit = 12
  } = req.query;

  const query = {};

  if (category) query.category = category;
  if (organic === 'true') query.isOrganic = true;
  if (fresh === 'true') query.freshnessTag = 'Today Harvest';

  if (bulkAvailable === 'true') {
    query.minBulkQty = { $gt: 0 };
    query.$expr = { $gte: ['$quantity', '$minBulkQty'] };
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const locationQuery = nearMe === 'true' || location ? buildLocationRegex(location) : null;
  if (locationQuery) {
    query.location = locationQuery;
  }

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('farmerId', 'name location avatar phone businessName isVerified')
      .sort({ freshnessTag: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNumber),
    Product.countDocuments(query)
  ]);

  sendResponse(
    res,
    200,
    true,
    {
      products,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber)
      }
    },
    'Products fetched successfully'
  );
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('farmerId', 'name email phone location avatar businessName isVerified');

  if (!product) {
    return sendResponse(res, 404, false, {}, 'Product not found');
  }

  sendResponse(res, 200, true, { product }, 'Product fetched successfully');
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return sendResponse(res, 404, false, {}, 'Product not found');
  }

  if (!canManageProduct(req.user, product)) {
    return sendResponse(res, 403, false, {}, 'You can only update your own product');
  }

  const owner = await resolveProductOwner(req.user, req.body.farmerId, product.farmerId);
  const uploadedImages = normalizeUploadedImages(req.files);
  const replaceImages = req.body.replaceImages === 'true';
  const retainedImages = parseImageList(req.body.retainedImages);

  if (replaceImages) {
    await removeCloudinaryImages(product.images);
    product.images = uploadedImages.slice(0, 5);
  } else if (retainedImages) {
    const keepSet = new Set(retainedImages);
    const removedImages = product.images.filter((image) => !keepSet.has(image.url));
    const keptImages = product.images.filter((image) => keepSet.has(image.url));
    await removeCloudinaryImages(removedImages);
    product.images = [...keptImages, ...uploadedImages].slice(0, 5);
  } else if (uploadedImages.length) {
    product.images = [...product.images, ...uploadedImages].slice(0, 5);
  }

  assignProductFields(product, req.body, owner);

  if (product.images.length) {
    product.imageUrl = product.images[0].url;
  } else if (!req.body.imageUrl) {
    product.imageUrl = '';
  }

  await product.save();

  const updatedProduct = await Product.findById(product._id).populate('farmerId', 'name email phone location avatar businessName isVerified');
  sendResponse(res, 200, true, { product: updatedProduct }, 'Product updated successfully');
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return sendResponse(res, 404, false, {}, 'Product not found');
  }

  if (!canManageProduct(req.user, product)) {
    return sendResponse(res, 403, false, {}, 'You can only delete your own product');
  }

  await removeCloudinaryImages(product.images);
  await product.deleteOne();

  sendResponse(res, 200, true, {}, 'Product deleted successfully');
});

const getMyProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ farmerId: req.user._id }).sort({ createdAt: -1 });
  sendResponse(res, 200, true, { products }, 'Farmer products fetched successfully');
});

module.exports = {
  normalizeUploadedImages,
  removeCloudinaryImages,
  assignProductFields,
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts
};
