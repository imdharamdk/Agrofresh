require('dotenv').config();

const fs = require('fs');
const path = require('path');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const User = require('../models/User');
const { buildProductAiMeta } = require('../utils/aiSignals');
const { getFreshnessTag } = require('../utils/productCatalog');

const DEFAULT_PASSWORD = process.env.DEFAULT_SYNC_FARMER_PASSWORD || 'password123';

const img = (photoId) => ({
  url: `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&q=80`,
  public_id: ''
});

const himachalFarmerSeed = {
  name: 'Dev Thakur',
  email: 'dev@agrofresh.com',
  password: DEFAULT_PASSWORD,
  role: 'farmer',
  phone: '9817001122',
  location: 'Shimla, Himachal Pradesh',
  isVerified: true
};

const requestedProducts = [
  {
    name: 'Himachali Apples',
    description: 'Crisp mountain apples hand-picked from high-altitude Himachal orchards.',
    category: 'Fruits',
    price: 160,
    bulkPrice: 138,
    minBulkQty: 12,
    unit: 'kg',
    quantity: 26,
    location: 'Shimla, Himachal Pradesh',
    isOrganic: false,
    images: [img('photo-1567306226416-28f0efdc88ce'), img('photo-1560806887-1e4cd0b6cbd6')]
  },
  {
    name: 'Gala Apples',
    description: 'Sweet and aromatic Gala apples with a bright red-yellow skin.',
    category: 'Fruits',
    price: 175,
    bulkPrice: 150,
    minBulkQty: 10,
    unit: 'kg',
    quantity: 18,
    location: 'Kotkhai, Himachal Pradesh',
    isOrganic: false,
    images: [img('photo-1560806887-1e4cd0b6cbd6')]
  },
  {
    name: 'Red Golden Apples',
    description: 'Juicy Red Golden apples, firm texture and balanced sweetness.',
    category: 'Fruits',
    price: 185,
    bulkPrice: 158,
    minBulkQty: 10,
    unit: 'kg',
    quantity: 16,
    location: 'Rohru, Himachal Pradesh',
    isOrganic: false,
    images: [img('photo-1570913149827-d2ac84ab3f9a')]
  },
  {
    name: 'Golden Apples',
    description: 'Golden apples with mellow sweetness and smooth bite, orchard fresh.',
    category: 'Fruits',
    price: 170,
    bulkPrice: 146,
    minBulkQty: 10,
    unit: 'kg',
    quantity: 15,
    location: 'Kullu, Himachal Pradesh',
    isOrganic: false,
    images: [img('photo-1567306226416-28f0efdc88ce')]
  },
  {
    name: 'Royal Apples',
    description: 'Premium Royal apples from Himachal with dense crunch and deep colour.',
    category: 'Fruits',
    price: 190,
    bulkPrice: 165,
    minBulkQty: 10,
    unit: 'kg',
    quantity: 14,
    location: 'Theog, Himachal Pradesh',
    isOrganic: false,
    images: [img('photo-1560806887-1e4cd0b6cbd6')]
  },
  {
    name: 'Red Chief Apples',
    description: 'Dark red Red Chief apples, extra crisp and market premium grade.',
    category: 'Fruits',
    price: 195,
    bulkPrice: 170,
    minBulkQty: 10,
    unit: 'kg',
    quantity: 13,
    location: 'Shimla, Himachal Pradesh',
    isOrganic: false,
    images: [img('photo-1570913149827-d2ac84ab3f9a')]
  },
  {
    name: 'Geromine Apples',
    description: 'Fresh Geromine apples with glossy skin and sweet-tart orchard flavour.',
    category: 'Fruits',
    price: 200,
    bulkPrice: 176,
    minBulkQty: 10,
    unit: 'kg',
    quantity: 12,
    location: 'Kinnaur, Himachal Pradesh',
    isOrganic: false,
    images: [img('photo-1567306226416-28f0efdc88ce')]
  },
  {
    name: 'Desi Cow Ghee',
    description: 'Slow-cooked desi cow ghee with rich aroma, grainy texture, and golden finish.',
    category: 'Dairy',
    price: 920,
    bulkPrice: 810,
    minBulkQty: 5,
    unit: 'kg',
    quantity: 9,
    location: 'Shimla, Himachal Pradesh',
    isOrganic: true,
    images: [img('photo-1589985270826-4b7bb135bc9d')]
  },
  {
    name: 'Local Rajmah',
    description: 'Himachali rajmah with rich colour, creamy texture, and deep earthy flavour.',
    category: 'Grains',
    price: 210,
    bulkPrice: 185,
    minBulkQty: 10,
    unit: 'kg',
    quantity: 18,
    location: 'Kinnaur, Himachal Pradesh',
    isOrganic: false,
    images: [img('photo-1515543904379-3d757afe72e1')]
  },
  {
    name: 'Mixed Hill Pulses',
    description: 'Assorted local pulses from Himachal farms, ideal for wholesome home cooking.',
    category: 'Grains',
    price: 165,
    bulkPrice: 142,
    minBulkQty: 12,
    unit: 'kg',
    quantity: 21,
    location: 'Mandi, Himachal Pradesh',
    isOrganic: false,
    images: [img('photo-1612204103590-b4e3b7c60e9a'), img('photo-1615484477778-ca3b77940c25')]
  },
  {
    name: 'Local Lehsun',
    description: 'Pahadi lehsun with strong aroma and tight white cloves.',
    category: 'Vegetables',
    price: 120,
    bulkPrice: 102,
    minBulkQty: 8,
    unit: 'kg',
    quantity: 19,
    location: 'Shimla, Himachal Pradesh',
    isOrganic: false,
    images: [img('photo-1615477550927-6d8c4b2b21f5')]
  },
  {
    name: 'Himachali Green Peas',
    description: 'Sweet mountain peas shelled from fresh pods, perfect for pulao and curries.',
    category: 'Vegetables',
    price: 78,
    bulkPrice: 66,
    minBulkQty: 10,
    unit: 'kg',
    quantity: 20,
    location: 'Kullu, Himachal Pradesh',
    isOrganic: false,
    images: [img('photo-1583258292688-d0213dc5a3a8')]
  },
  {
    name: 'French Beans',
    description: 'Tender French beans with bright green pods and a fresh snap.',
    category: 'Vegetables',
    price: 68,
    bulkPrice: 58,
    minBulkQty: 10,
    unit: 'kg',
    quantity: 17,
    location: 'Solan, Himachal Pradesh',
    isOrganic: false,
    images: [img('photo-1515543904379-3d757afe72e1')]
  },
  {
    name: 'Zucchini',
    description: 'Farm-fresh zucchini, mild flavour and tender flesh for saute and grills.',
    category: 'Vegetables',
    price: 72,
    bulkPrice: 61,
    minBulkQty: 8,
    unit: 'kg',
    quantity: 16,
    location: 'Shimla, Himachal Pradesh',
    isOrganic: false,
    images: [img('photo-1594282486552-05b4d80fbb9f')]
  }
];

const normalizeName = (value) => String(value || '').trim().toLowerCase();

const buildSeedImageMap = () => {
  const seedPath = path.join(__dirname, '..', 'seed.js');
  const source = fs.readFileSync(seedPath, 'utf8');
  const section = source.split('const productData = [')[1]?.split('];')[0] || '';
  const matches = [...section.matchAll(/name: '([^']+)'[\s\S]*?images:\s*\[\s*img\('([^']+)'\)/g)];
  return new Map(
    matches.map(([, name, photoId]) => [normalizeName(name), img(photoId)])
  );
};

const applyProductData = (product, data, farmerId) => {
  product.name = data.name;
  product.description = data.description;
  product.category = data.category;
  product.price = data.price;
  product.bulkPrice = data.bulkPrice;
  product.minBulkQty = data.minBulkQty;
  product.unit = data.unit;
  product.quantity = data.quantity;
  product.location = data.location;
  product.images = data.images;
  product.imageUrl = data.images[0]?.url || product.imageUrl || '';
  product.farmerId = farmerId;
  product.isOrganic = Boolean(data.isOrganic);
  product.isAvailable = Number(data.quantity) > 0;
  product.isFeatured = Number(data.price) > 100;
  product.harvestDate = product.harvestDate || null;
  product.freshnessTag = getFreshnessTag(product.harvestDate);
  product.aiMeta = buildProductAiMeta(product);
  return product;
};

const ensureFarmer = async () => {
  let farmer = await User.findOne({ email: himachalFarmerSeed.email });

  if (!farmer) {
    farmer = await User.create(himachalFarmerSeed);
    return { farmer, created: true };
  }

  let changed = false;
  for (const [key, value] of Object.entries(himachalFarmerSeed)) {
    if (key === 'password') continue;
    if (farmer[key] !== value) {
      farmer[key] = value;
      changed = true;
    }
  }

  if (changed) {
    await farmer.save();
  }

  return { farmer, created: false };
};

const syncRequestedProducts = async (farmerId) => {
  const result = { created: 0, updated: 0 };

  for (const data of requestedProducts) {
    let product = await Product.findOne({ name: data.name });
    const isNew = !product;

    if (!product) {
      product = new Product();
    }

    applyProductData(product, data, farmerId);
    await product.save();
    result[isNew ? 'created' : 'updated'] += 1;
  }

  return result;
};

const backfillMissingImages = async () => {
  const imageMap = buildSeedImageMap();
  const products = await Product.find({
    $or: [
      { imageUrl: { $in: [null, ''] } },
      { images: { $exists: false } },
      { images: { $size: 0 } }
    ]
  });

  let updated = 0;

  for (const product of products) {
    const fallback = imageMap.get(normalizeName(product.name));
    if (!fallback) continue;

    const hasImages = Array.isArray(product.images) && product.images.some((image) => image?.url);
    if (!hasImages) {
      product.images = [fallback];
    }

    if (!String(product.imageUrl || '').trim()) {
      product.imageUrl = fallback.url;
    }

    product.aiMeta = buildProductAiMeta(product);
    await product.save();
    updated += 1;
  }

  return updated;
};

const main = async () => {
  await connectDB();

  const { farmer, created: farmerCreated } = await ensureFarmer();
  const productResult = await syncRequestedProducts(farmer._id);
  const backfilled = await backfillMissingImages();

  console.log(JSON.stringify({
    farmerCreated,
    farmerEmail: farmer.email,
    productsCreated: productResult.created,
    productsUpdated: productResult.updated,
    imageBackfills: backfilled
  }, null, 2));
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Catalog sync failed:', error);
    process.exit(1);
  });
