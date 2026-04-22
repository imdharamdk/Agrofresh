require('dotenv').config();

const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const { buildProductAiMeta } = require('./utils/aiSignals');

// Verified working Unsplash photo IDs (these are stable permanent URLs)
const img = (photoId) => ({
  url: `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&q=80`,
  public_id: ''
});

const users = [
  {
    name: 'Ravi Kumar',
    email: 'ravi@agrofresh.com',
    password: 'password123',
    role: 'farmer',
    phone: '9876543210',
    location: 'Nashik, Maharashtra',
    isVerified: true
  },
  {
    name: 'Sunita Devi',
    email: 'sunita@agrofresh.com',
    password: 'password123',
    role: 'farmer',
    phone: '9123456780',
    location: 'Karnal, Haryana',
    isVerified: true
  },
  {
    name: 'Arjun Patel',
    email: 'arjun@agrofresh.com',
    password: 'password123',
    role: 'farmer',
    phone: '9765432100',
    location: 'Anand, Gujarat',
    isVerified: true
  },
  {
    name: 'Meena Reddy',
    email: 'meena@agrofresh.com',
    password: 'password123',
    role: 'farmer',
    phone: '9654321007',
    location: 'Kurnool, Andhra Pradesh',
    isVerified: true
  },
  {
    name: 'Dev Thakur',
    email: 'dev@agrofresh.com',
    password: 'password123',
    role: 'farmer',
    phone: '9817001122',
    location: 'Shimla, Himachal Pradesh',
    isVerified: true
  },
  {
    name: 'FreshMart Procurement',
    email: 'business@agrofresh.com',
    password: 'password123',
    role: 'business',
    phone: '9988776655',
    location: 'Delhi NCR',
    businessName: 'FreshMart Pvt Ltd',
    isVerified: true
  },
  {
    name: 'Rohan Delivery',
    email: 'delivery@agrofresh.com',
    password: 'password123',
    role: 'delivery',
    phone: '9012345678',
    location: 'Pune, Maharashtra',
    isVerified: true
  },
  {
    name: 'AgroFresh Admin',
    email: process.env.ADMIN_EMAIL || 'admin@agrofresh.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    role: 'admin',
    phone: '9000000000',
    location: 'Bengaluru, Karnataka',
    isVerified: true
  }
];

// All photo IDs are real verified Unsplash photo IDs
const productData = [
  // ── VEGETABLES ────────────────────────────────────────────────────────
  {
    name: 'Organic Tomatoes',
    description: 'Fresh red tomatoes harvested at sunrise, zero chemicals.',
    category: 'Vegetables', price: 42, bulkPrice: 34, minBulkQty: 20, unit: 'kg', quantity: 48,
    farmerIndex: 0, location: 'Nashik, Maharashtra', isOrganic: true,
    images: [
      img('photo-1546470427-0d4e0f5b3e3e'),   // red tomatoes pile
      img('photo-1592924357228-91a4daadcfea'),   // tomatoes on vine
    ]
  },
  {
    name: 'Green Spinach',
    description: 'Crisp spinach bundles rich in iron, hand-picked daily.',
    category: 'Vegetables', price: 28, bulkPrice: 22, minBulkQty: 15, unit: 'kg', quantity: 22,
    farmerIndex: 0, location: 'Nashik, Maharashtra', isOrganic: false,
    images: [
      img('photo-1576045057995-568f588f82fb'),   // spinach leaves
      img('photo-1599686301879-3b3d53f64a55'),   // green leafy
    ]
  },
  {
    name: 'Potatoes',
    description: 'Firm yellow potatoes ideal for everyday cooking.',
    category: 'Vegetables', price: 30, bulkPrice: 25, minBulkQty: 40, unit: 'kg', quantity: 80,
    farmerIndex: 1, location: 'Karnal, Haryana', isOrganic: false,
    images: [
      img('photo-1518977676601-b53f82aba655'),   // potato pile
      img('photo-1590165482129-1b8b27698780'),   // potatoes in basket
    ]
  },
  {
    name: 'Red Onions',
    description: 'Sharp and pungent red onions freshly lifted from the field.',
    category: 'Vegetables', price: 36, bulkPrice: 30, minBulkQty: 30, unit: 'kg', quantity: 52,
    farmerIndex: 0, location: 'Nashik, Maharashtra', isOrganic: false,
    images: [
      img('photo-1508747703725-719777637510'),   // red onions
      img('photo-1563565375-f3fdfdbefa83'),       // onion closeup
    ]
  },
  {
    name: 'Green Chillies',
    description: 'Spicy thin green chillies perfect for Indian cooking.',
    category: 'Vegetables', price: 55, bulkPrice: 45, minBulkQty: 10, unit: 'kg', quantity: 18,
    farmerIndex: 3, location: 'Kurnool, Andhra Pradesh', isOrganic: false,
    images: [
      img('photo-1588891532022-ad32c01a7bd7'),   // green chillies
      img('photo-1596040033229-a9821ebd058d'),   // chilli peppers
    ]
  },
  {
    name: 'Cauliflower',
    description: 'White compact cauliflower heads with fresh green leaves.',
    category: 'Vegetables', price: 38, bulkPrice: 30, minBulkQty: 20, unit: 'piece', quantity: 35,
    farmerIndex: 1, location: 'Karnal, Haryana', isOrganic: false,
    images: [
      img('photo-1568702846914-96b305d2aaeb'),   // cauliflower
    ]
  },
  {
    name: 'Brinjal (Eggplant)',
    description: 'Glossy purple brinjals with tender flesh, farm direct.',
    category: 'Vegetables', price: 32, bulkPrice: 26, minBulkQty: 15, unit: 'kg', quantity: 27,
    farmerIndex: 3, location: 'Kurnool, Andhra Pradesh', isOrganic: false,
    images: [
      img('photo-1659261200833-ec8761558af7'),   // purple eggplant
      img('photo-1615485290382-441e4aa8a5d7'),   // eggplant market
    ]
  },
  {
    name: 'Lady Finger (Okra)',
    description: 'Tender young okra pods freshly harvested this morning.',
    category: 'Vegetables', price: 45, bulkPrice: 37, minBulkQty: 12, unit: 'kg', quantity: 20,
    farmerIndex: 3, location: 'Kurnool, Andhra Pradesh', isOrganic: false,
    images: [
      img('photo-1567375698348-0d10baa8cae2'),   // okra pods
    ]
  },
  {
    name: 'Capsicum (Bell Pepper)',
    description: 'Mixed red, yellow and green capsicums, crisp and sweet.',
    category: 'Vegetables', price: 80, bulkPrice: 68, minBulkQty: 10, unit: 'kg', quantity: 15,
    farmerIndex: 0, location: 'Nashik, Maharashtra', isOrganic: true,
    images: [
      img('photo-1601648764658-cf37e8c89b70'),   // bell peppers mixed
      img('photo-1563565375-f3fdfdbefa83'),       // red capsicum
    ]
  },
  {
    name: 'Carrots',
    description: 'Sweet orange carrots freshly pulled, great for juicing.',
    category: 'Vegetables', price: 35, bulkPrice: 28, minBulkQty: 25, unit: 'kg', quantity: 38,
    farmerIndex: 1, location: 'Karnal, Haryana', isOrganic: false,
    images: [
      img('photo-1447175008436-054170c2e979'),   // fresh carrots
      img('photo-1590165482129-1b8b27698780'),   // carrots bundle
    ]
  },
  {
    name: 'Peas (Matar)',
    description: 'Fresh green peas in the pod, sweet and tender variety.',
    category: 'Vegetables', price: 60, bulkPrice: 50, minBulkQty: 10, unit: 'kg', quantity: 16,
    farmerIndex: 0, location: 'Nashik, Maharashtra', isOrganic: false,
    images: [
      img('photo-1583258292688-d0213dc5a3a8'),   // green peas
    ]
  },
  {
    name: 'Coriander Leaves',
    description: 'Fragrant coriander bundles, packed same day as harvest.',
    category: 'Vegetables', price: 15, bulkPrice: 12, minBulkQty: 30, unit: 'kg', quantity: 14,
    farmerIndex: 3, location: 'Kurnool, Andhra Pradesh', isOrganic: false,
    images: [
      img('photo-1628556270448-4d4e4148e1b1'),   // coriander
    ]
  },
  {
    name: 'Cabbage',
    description: 'Dense round cabbage heads with tightly packed leaves.',
    category: 'Vegetables', price: 25, bulkPrice: 20, minBulkQty: 30, unit: 'piece', quantity: 55,
    farmerIndex: 1, location: 'Karnal, Haryana', isOrganic: false,
    images: [
      img('photo-1594282486552-05b4d80fbb9f'),   // cabbage
    ]
  },
  {
    name: 'Bottle Gourd (Lauki)',
    description: 'Smooth pale green bottle gourd, freshly cut from the vine.',
    category: 'Vegetables', price: 22, bulkPrice: 18, minBulkQty: 20, unit: 'piece', quantity: 40,
    farmerIndex: 1, location: 'Karnal, Haryana', isOrganic: false,
    images: [
      img('photo-1540420773420-3366772f4999'),   // bottle gourd
    ]
  },
  {
    name: 'Local Lehsun',
    description: 'Pahadi lehsun with strong aroma and tight white cloves.',
    category: 'Vegetables', price: 120, bulkPrice: 102, minBulkQty: 8, unit: 'kg', quantity: 19,
    farmerIndex: 4, location: 'Shimla, Himachal Pradesh', isOrganic: false,
    images: [
      img('photo-1615477550927-6d8c4b2b21f5'),
    ]
  },
  {
    name: 'Himachali Green Peas',
    description: 'Sweet mountain peas shelled from fresh pods, perfect for pulao and curries.',
    category: 'Vegetables', price: 78, bulkPrice: 66, minBulkQty: 10, unit: 'kg', quantity: 20,
    farmerIndex: 4, location: 'Kullu, Himachal Pradesh', isOrganic: false,
    images: [
      img('photo-1583258292688-d0213dc5a3a8'),
    ]
  },
  {
    name: 'French Beans',
    description: 'Tender French beans with bright green pods and a fresh snap.',
    category: 'Vegetables', price: 68, bulkPrice: 58, minBulkQty: 10, unit: 'kg', quantity: 17,
    farmerIndex: 4, location: 'Solan, Himachal Pradesh', isOrganic: false,
    images: [
      img('photo-1515543904379-3d757afe72e1'),
    ]
  },
  {
    name: 'Zucchini',
    description: 'Farm-fresh zucchini, mild flavour and tender flesh for saute and grills.',
    category: 'Vegetables', price: 72, bulkPrice: 61, minBulkQty: 8, unit: 'kg', quantity: 16,
    farmerIndex: 4, location: 'Shimla, Himachal Pradesh', isOrganic: false,
    images: [
      img('photo-1594282486552-05b4d80fbb9f'),
    ]
  },

  // ── FRUITS ────────────────────────────────────────────────────────────
  {
    name: 'Farm Mangoes (Alphonso)',
    description: 'Naturally ripened GI-tagged Alphonso mangoes, Devgad farm.',
    category: 'Fruits', price: 140, bulkPrice: 120, minBulkQty: 15, unit: 'kg', quantity: 30,
    farmerIndex: 2, location: 'Anand, Gujarat', isOrganic: false,
    images: [
      img('photo-1601493700631-2b16ec4b4716'),   // alphonso mangoes
      img('photo-1553279768-865429fa0078'),       // mango closeup
    ]
  },
  {
    name: 'Bananas (Robusta)',
    description: 'Sweet Robusta bananas packed from same-day harvest.',
    category: 'Fruits', price: 55, bulkPrice: 48, minBulkQty: 20, unit: 'piece', quantity: 18,
    farmerIndex: 1, location: 'Karnal, Haryana', isOrganic: false,
    images: [
      img('photo-1528825871115-3581a5387919'),   // bananas bunch
      img('photo-1603833665858-e61d17a86224'),   // yellow bananas
    ]
  },
  {
    name: 'Watermelon',
    description: 'Large seedless watermelons, sugar-sweet and chilled.',
    category: 'Fruits', price: 18, bulkPrice: 14, minBulkQty: 50, unit: 'kg', quantity: 60,
    farmerIndex: 2, location: 'Anand, Gujarat', isOrganic: false,
    images: [
      img('photo-1587049352846-4a222e784d38'),   // watermelon sliced
      img('photo-1568584711075-3d021a7c3ca3'),   // watermelon whole
    ]
  },
  {
    name: 'Papaya',
    description: 'Ripe orange papayas rich in papain enzymes, tree fresh.',
    category: 'Fruits', price: 35, bulkPrice: 28, minBulkQty: 20, unit: 'piece', quantity: 25,
    farmerIndex: 3, location: 'Kurnool, Andhra Pradesh', isOrganic: false,
    images: [
      img('photo-1617112634259-50a0c1ad2a72'),   // papaya cut
    ]
  },
  {
    name: 'Guava',
    description: 'Crunchy white-flesh guavas, naturally sweet with few seeds.',
    category: 'Fruits', price: 50, bulkPrice: 42, minBulkQty: 15, unit: 'kg', quantity: 22,
    farmerIndex: 2, location: 'Anand, Gujarat', isOrganic: false,
    images: [
      img('photo-1637494511038-7e56ac8e1c68'),   // guava fruit
    ]
  },
  {
    name: 'Pomegranate (Bhagwa)',
    description: 'Deep-red Bhagwa pomegranates with juicy arils, seedless type.',
    category: 'Fruits', price: 180, bulkPrice: 155, minBulkQty: 10, unit: 'kg', quantity: 12,
    farmerIndex: 0, location: 'Nashik, Maharashtra', isOrganic: false,
    images: [
      img('photo-1541344999736-83eca272f6fc'),   // pomegranate open
      img('photo-1615485290382-441e4aa8a5d7'),   // pomegranate seeds
    ]
  },
  {
    name: 'Sweet Lime (Mosambi)',
    description: 'Thin-skinned mosambi rich in vitamin C, ready to juice.',
    category: 'Fruits', price: 60, bulkPrice: 50, minBulkQty: 20, unit: 'piece', quantity: 20,
    farmerIndex: 2, location: 'Anand, Gujarat', isOrganic: false,
    images: [
      img('photo-1557800634-7de7b5e73cf4'),     // lime citrus
    ]
  },
  {
    name: 'Grapes (Thompson)',
    description: 'Pale green seedless Thompson grapes, crisp and sweet.',
    category: 'Fruits', price: 95, bulkPrice: 80, minBulkQty: 10, unit: 'kg', quantity: 14,
    farmerIndex: 0, location: 'Nashik, Maharashtra', isOrganic: false,
    images: [
      img('photo-1423757736953-61e1f6a92abe'),   // green grapes
      img('photo-1502741338009-cac2772e18bc'),   // grapes bunch
    ]
  },
  {
    name: 'Coconut',
    description: 'Brown mature coconuts full of water and white kernel.',
    category: 'Fruits', price: 30, bulkPrice: 25, minBulkQty: 25, unit: 'piece', quantity: 35,
    farmerIndex: 3, location: 'Kurnool, Andhra Pradesh', isOrganic: false,
    images: [
      img('photo-1519162808019-7de1683fa2ad'),   // coconut
      img('photo-1570197788417-0e82375c9371'),   // coconut open
    ]
  },
  {
    name: 'Chikoo (Sapota)',
    description: 'Brown-skinned chikoo with honey-sweet caramel flesh.',
    category: 'Fruits', price: 70, bulkPrice: 58, minBulkQty: 12, unit: 'kg', quantity: 18,
    farmerIndex: 2, location: 'Anand, Gujarat', isOrganic: false,
    images: [
      img('photo-1561181286-d3f19344d753'),     // sapota/chikoo
    ]
  },
  {
    name: 'Himachali Apples',
    description: 'Crisp mountain apples hand-picked from high-altitude Himachal orchards.',
    category: 'Fruits', price: 160, bulkPrice: 138, minBulkQty: 12, unit: 'kg', quantity: 26,
    farmerIndex: 4, location: 'Shimla, Himachal Pradesh', isOrganic: false,
    images: [
      img('photo-1567306226416-28f0efdc88ce'),
      img('photo-1560806887-1e4cd0b6cbd6'),
    ]
  },
  {
    name: 'Gala Apples',
    description: 'Sweet and aromatic Gala apples with a bright red-yellow skin.',
    category: 'Fruits', price: 175, bulkPrice: 150, minBulkQty: 10, unit: 'kg', quantity: 18,
    farmerIndex: 4, location: 'Kotkhai, Himachal Pradesh', isOrganic: false,
    images: [
      img('photo-1560806887-1e4cd0b6cbd6'),
    ]
  },
  {
    name: 'Red Golden Apples',
    description: 'Juicy Red Golden apples, firm texture and balanced sweetness.',
    category: 'Fruits', price: 185, bulkPrice: 158, minBulkQty: 10, unit: 'kg', quantity: 16,
    farmerIndex: 4, location: 'Rohru, Himachal Pradesh', isOrganic: false,
    images: [
      img('photo-1570913149827-d2ac84ab3f9a'),
    ]
  },
  {
    name: 'Golden Apples',
    description: 'Golden apples with mellow sweetness and smooth bite, orchard fresh.',
    category: 'Fruits', price: 170, bulkPrice: 146, minBulkQty: 10, unit: 'kg', quantity: 15,
    farmerIndex: 4, location: 'Kullu, Himachal Pradesh', isOrganic: false,
    images: [
      img('photo-1567306226416-28f0efdc88ce'),
    ]
  },
  {
    name: 'Royal Apples',
    description: 'Premium Royal apples from Himachal with dense crunch and deep colour.',
    category: 'Fruits', price: 190, bulkPrice: 165, minBulkQty: 10, unit: 'kg', quantity: 14,
    farmerIndex: 4, location: 'Theog, Himachal Pradesh', isOrganic: false,
    images: [
      img('photo-1560806887-1e4cd0b6cbd6'),
    ]
  },
  {
    name: 'Red Chief Apples',
    description: 'Dark red Red Chief apples, extra crisp and market premium grade.',
    category: 'Fruits', price: 195, bulkPrice: 170, minBulkQty: 10, unit: 'kg', quantity: 13,
    farmerIndex: 4, location: 'Shimla, Himachal Pradesh', isOrganic: false,
    images: [
      img('photo-1570913149827-d2ac84ab3f9a'),
    ]
  },
  {
    name: 'Geromine Apples',
    description: 'Fresh Geromine apples with glossy skin and sweet-tart orchard flavour.',
    category: 'Fruits', price: 200, bulkPrice: 176, minBulkQty: 10, unit: 'kg', quantity: 12,
    farmerIndex: 4, location: 'Kinnaur, Himachal Pradesh', isOrganic: false,
    images: [
      img('photo-1567306226416-28f0efdc88ce'),
    ]
  },

  // ── GRAINS ────────────────────────────────────────────────────────────
  {
    name: 'Brown Rice',
    description: 'Stone-milled fragrant brown rice, minimally processed.',
    category: 'Grains', price: 70, bulkPrice: 62, minBulkQty: 50, unit: 'kg', quantity: 60,
    farmerIndex: 0, location: 'Nashik, Maharashtra', isOrganic: false,
    images: [
      img('photo-1586201375761-83865001e31c'),   // brown rice
    ]
  },
  {
    name: 'Basmati Rice',
    description: 'Long-grain premium Basmati rice aged 2 years, extra aroma.',
    category: 'Grains', price: 110, bulkPrice: 92, minBulkQty: 25, unit: 'kg', quantity: 45,
    farmerIndex: 1, location: 'Karnal, Haryana', isOrganic: false,
    images: [
      img('photo-1536304993881-ff86d42818e1'),   // basmati rice
      img('photo-1567593810070-7a3d471af022'),   // rice grains
    ]
  },
  {
    name: 'Wheat Flour (Atta)',
    description: 'Whole-wheat atta stone-ground from hard red wheat.',
    category: 'Grains', price: 40, bulkPrice: 34, minBulkQty: 50, unit: 'kg', quantity: 70,
    farmerIndex: 1, location: 'Karnal, Haryana', isOrganic: false,
    images: [
      img('photo-1574323347407-f5e1ad6d020b'),   // wheat flour
      img('photo-1509440159596-0249088772ff'),   // wheat grains
    ]
  },
  {
    name: 'Maize (Corn)',
    description: 'Yellow maize kernels dried on the cob, suitable for flour.',
    category: 'Grains', price: 25, bulkPrice: 20, minBulkQty: 80, unit: 'kg', quantity: 90,
    farmerIndex: 2, location: 'Anand, Gujarat', isOrganic: false,
    images: [
      img('photo-1601300100614-6b6a5dd9e5a8'),   // corn maize
      img('photo-1567306301408-9b74779a11af'),   // corn yellow
    ]
  },
  {
    name: 'Black Gram (Urad Dal)',
    description: 'Whole urad dal with skin, rich in protein, direct from farm.',
    category: 'Grains', price: 95, bulkPrice: 82, minBulkQty: 20, unit: 'kg', quantity: 35,
    farmerIndex: 3, location: 'Kurnool, Andhra Pradesh', isOrganic: false,
    images: [
      img('photo-1585527697535-e9f01e07b18b'),   // black lentils dal
    ]
  },
  {
    name: 'Chickpeas (Kabuli Chana)',
    description: 'Large white kabuli chana premium grade, high protein.',
    category: 'Grains', price: 90, bulkPrice: 75, minBulkQty: 25, unit: 'kg', quantity: 40,
    farmerIndex: 1, location: 'Karnal, Haryana', isOrganic: false,
    images: [
      img('photo-1615484477778-ca3b77940c25'),   // chickpeas
      img('photo-1612204103590-b4e3b7c60e9a'),   // chana dry
    ]
  },
  {
    name: 'Jowar (Sorghum)',
    description: 'Organic white jowar, gluten-free millet for rotis and porridge.',
    category: 'Grains', price: 50, bulkPrice: 42, minBulkQty: 30, unit: 'kg', quantity: 48,
    farmerIndex: 3, location: 'Kurnool, Andhra Pradesh', isOrganic: true,
    images: [
      img('photo-1625944525533-4c1db97fad1e'),   // sorghum millet
    ]
  },
  {
    name: 'Bajra (Pearl Millet)',
    description: 'Nutrient-dense bajra grains, rich in iron and magnesium.',
    category: 'Grains', price: 45, bulkPrice: 38, minBulkQty: 30, unit: 'kg', quantity: 55,
    farmerIndex: 2, location: 'Anand, Gujarat', isOrganic: false,
    images: [
      img('photo-1560806887-1735c0462745'),     // millet grains
    ]
  },
  {
    name: 'Local Rajmah',
    description: 'Himachali rajmah with rich colour, creamy texture, and deep earthy flavour.',
    category: 'Grains', price: 210, bulkPrice: 185, minBulkQty: 10, unit: 'kg', quantity: 18,
    farmerIndex: 4, location: 'Kinnaur, Himachal Pradesh', isOrganic: false,
    images: [
      img('photo-1515543904379-3d757afe72e1'),
    ]
  },
  {
    name: 'Mixed Hill Pulses',
    description: 'Assorted local pulses from Himachal farms, ideal for wholesome home cooking.',
    category: 'Grains', price: 165, bulkPrice: 142, minBulkQty: 12, unit: 'kg', quantity: 21,
    farmerIndex: 4, location: 'Mandi, Himachal Pradesh', isOrganic: false,
    images: [
      img('photo-1612204103590-b4e3b7c60e9a'),
      img('photo-1615484477778-ca3b77940c25'),
    ]
  },

  // ── SPICES ────────────────────────────────────────────────────────────
  {
    name: 'Turmeric Powder',
    description: 'Sun-dried turmeric ground in small batches, high curcumin.',
    category: 'Spices', price: 180, bulkPrice: 155, minBulkQty: 10, unit: 'kg', quantity: 15,
    farmerIndex: 0, location: 'Nashik, Maharashtra', isOrganic: false,
    images: [
      img('photo-1615485290382-441e4aa8a5d7'),   // turmeric powder
      img('photo-1605522561233-768ad7a8fabf'),   // turmeric root
    ]
  },
  {
    name: 'Red Chilli Powder',
    description: 'Bright red Kashmiri chilli powder, deep colour and mild heat.',
    category: 'Spices', price: 200, bulkPrice: 170, minBulkQty: 10, unit: 'kg', quantity: 12,
    farmerIndex: 3, location: 'Kurnool, Andhra Pradesh', isOrganic: false,
    images: [
      img('photo-1596040033229-a9821ebd058d'),   // red chilli powder
      img('photo-1588891532022-ad32c01a7bd7'),   // chilli spice
    ]
  },
  {
    name: 'Coriander Powder (Dhaniya)',
    description: 'Freshly ground dhaniya seeds, bold aroma, farm-batch.',
    category: 'Spices', price: 130, bulkPrice: 110, minBulkQty: 10, unit: 'kg', quantity: 10,
    farmerIndex: 2, location: 'Anand, Gujarat', isOrganic: false,
    images: [
      img('photo-1628556270448-4d4e4148e1b1'),   // coriander seeds powder
    ]
  },
  {
    name: 'Cumin Seeds (Jeera)',
    description: 'Whole jeera with strong earthy aroma, sun-dried naturally.',
    category: 'Spices', price: 280, bulkPrice: 245, minBulkQty: 5, unit: 'kg', quantity: 8,
    farmerIndex: 2, location: 'Anand, Gujarat', isOrganic: false,
    images: [
      img('photo-1559181567-c3190f787843'),     // cumin seeds jeera
      img('photo-1612204103590-b4e3b7c60e9a'),   // spice seeds
    ]
  },
  {
    name: 'Black Pepper',
    description: 'Bold whole black peppercorns, stone-picked from Kerala vines.',
    category: 'Spices', price: 650, bulkPrice: 580, minBulkQty: 5, unit: 'kg', quantity: 6,
    farmerIndex: 3, location: 'Kurnool, Andhra Pradesh', isOrganic: false,
    images: [
      img('photo-1506184109228-f0673f6ce2ee'),   // black pepper
    ]
  },
  {
    name: 'Cardamom (Elaichi)',
    description: 'Plump green cardamom pods bursting with sweet floral aroma.',
    category: 'Spices', price: 1200, bulkPrice: 1050, minBulkQty: 2, unit: 'kg', quantity: 4,
    farmerIndex: 3, location: 'Kurnool, Andhra Pradesh', isOrganic: false,
    images: [
      img('photo-1588671890052-30e48eeaa3ac'),   // cardamom pods
    ]
  },
  {
    name: 'Dry Ginger Powder (Sunthi)',
    description: 'Sunthi powder made from dried farm ginger, strong and pungent.',
    category: 'Spices', price: 220, bulkPrice: 190, minBulkQty: 10, unit: 'kg', quantity: 9,
    farmerIndex: 0, location: 'Nashik, Maharashtra', isOrganic: false,
    images: [
      img('photo-1609205807107-6a1e49ef89ed'),   // ginger dry
      img('photo-1615485290382-441e4aa8a5d7'),   // ginger powder
    ]
  },
  {
    name: 'Cloves (Laung)',
    description: 'Aromatic dried cloves hand-selected, intensely flavoured.',
    category: 'Spices', price: 850, bulkPrice: 740, minBulkQty: 2, unit: 'kg', quantity: 5,
    farmerIndex: 2, location: 'Anand, Gujarat', isOrganic: false,
    images: [
      img('photo-1559181567-c3190f787843'),     // cloves spice
    ]
  },
  {
    name: 'Mustard Seeds',
    description: 'Tiny black mustard seeds for tempering, pungent raw flavour.',
    category: 'Spices', price: 80, bulkPrice: 65, minBulkQty: 20, unit: 'kg', quantity: 18,
    farmerIndex: 1, location: 'Karnal, Haryana', isOrganic: false,
    images: [
      img('photo-1612204103590-b4e3b7c60e9a'),   // mustard seeds
    ]
  },

  // ── DAIRY ─────────────────────────────────────────────────────────────
  {
    name: 'Cow Milk (Full Cream)',
    description: 'Fresh full-cream milk from desi cows, delivered chilled daily.',
    category: 'Dairy', price: 65, bulkPrice: 58, minBulkQty: 25, unit: 'litre', quantity: 25,
    farmerIndex: 1, location: 'Karnal, Haryana', isOrganic: false,
    images: [
      img('photo-1563636619-e9143da7f009'),     // fresh milk
      img('photo-1550583724-b2692b85b150'),     // milk pouring
    ]
  },
  {
    name: 'Free Range Eggs',
    description: 'Clean farm-packed eggs from free-roaming country hens.',
    category: 'Dairy', price: 78, bulkPrice: 68, minBulkQty: 10, unit: 'piece', quantity: 12,
    farmerIndex: 1, location: 'Karnal, Haryana', isOrganic: false,
    images: [
      img('photo-1582722872445-44dc5f7e3c8f'),   // fresh eggs
      img('photo-1506976785307-8732e854ad03'),   // eggs basket
    ]
  },
  {
    name: 'A2 Desi Ghee',
    description: 'Hand-churned pure A2 ghee from Gir cow milk, bilona method.',
    category: 'Dairy', price: 850, bulkPrice: 750, minBulkQty: 5, unit: 'kg', quantity: 8,
    farmerIndex: 2, location: 'Anand, Gujarat', isOrganic: true,
    images: [
      img('photo-1589985270826-4b7bb135bc9d'),   // ghee jar
    ]
  },
  {
    name: 'Desi Cow Ghee',
    description: 'Slow-cooked desi cow ghee with rich aroma, grainy texture, and golden finish.',
    category: 'Dairy', price: 920, bulkPrice: 810, minBulkQty: 5, unit: 'kg', quantity: 9,
    farmerIndex: 4, location: 'Shimla, Himachal Pradesh', isOrganic: true,
    images: [
      img('photo-1589985270826-4b7bb135bc9d'),
    ]
  },
  {
    name: 'Paneer (Cottage Cheese)',
    description: 'Soft fresh paneer made daily from whole buffalo milk.',
    category: 'Dairy', price: 280, bulkPrice: 240, minBulkQty: 10, unit: 'kg', quantity: 10,
    farmerIndex: 2, location: 'Anand, Gujarat', isOrganic: false,
    images: [
      img('photo-1631452180519-c014fe946bc7'),   // paneer cottage cheese
    ]
  },
  {
    name: 'Buffalo Curd (Dahi)',
    description: 'Thick set curd from buffalo milk, creamy and mildly tangy.',
    category: 'Dairy', price: 55, bulkPrice: 45, minBulkQty: 20, unit: 'kg', quantity: 16,
    farmerIndex: 1, location: 'Karnal, Haryana', isOrganic: false,
    images: [
      img('photo-1488477181228-bf5b1f3fbb1c'),   // dahi curd bowl
    ]
  },
  {
    name: 'Buttermilk (Chaas)',
    description: 'Fresh salted chaas churned from curd, hydrating summer drink.',
    category: 'Dairy', price: 18, bulkPrice: 14, minBulkQty: 50, unit: 'litre', quantity: 30,
    farmerIndex: 2, location: 'Anand, Gujarat', isOrganic: false,
    images: [
      img('photo-1571068316344-75bc76f77890'),   // buttermilk glass
    ]
  },

  // ── ORGANIC ───────────────────────────────────────────────────────────
  {
    name: 'Organic Moringa Leaves',
    description: 'Drumstick tree leaves sun-dried, superfood grade, no spray.',
    category: 'Organic', price: 220, bulkPrice: 185, minBulkQty: 10, unit: 'kg', quantity: 10,
    farmerIndex: 3, location: 'Kurnool, Andhra Pradesh', isOrganic: true,
    images: [
      img('photo-1610725664285-7c57e6eeac3f'),   // moringa leaves
    ]
  },
  {
    name: 'Organic Amla (Gooseberry)',
    description: 'Certified organic amla berries, vitamin C powerhouse.',
    category: 'Organic', price: 130, bulkPrice: 108, minBulkQty: 15, unit: 'kg', quantity: 14,
    farmerIndex: 0, location: 'Nashik, Maharashtra', isOrganic: true,
    images: [
      img('photo-1586093021923-f4b9b9be2a2e'),   // amla gooseberry
    ]
  },
  {
    name: 'Organic Flaxseeds',
    description: 'Cold-pressed whole flaxseeds, omega-3 rich, zero pesticides.',
    category: 'Organic', price: 160, bulkPrice: 138, minBulkQty: 10, unit: 'kg', quantity: 12,
    farmerIndex: 3, location: 'Kurnool, Andhra Pradesh', isOrganic: true,
    images: [
      img('photo-1585527697535-e9f01e07b18b'),   // flaxseeds
    ]
  },
  {
    name: 'Organic Tulsi Leaves',
    description: 'Fresh Krishna Tulsi leaves, hand-harvested, pesticide-free.',
    category: 'Organic', price: 80, bulkPrice: 65, minBulkQty: 20, unit: 'kg', quantity: 8,
    farmerIndex: 0, location: 'Nashik, Maharashtra', isOrganic: true,
    images: [
      img('photo-1556228453-efd6c1ff04f6'),     // tulsi basil leaves
    ]
  },
  {
    name: 'Organic Coconut Sugar',
    description: 'Low-GI coconut palm sugar, unrefined, natural caramel taste.',
    category: 'Organic', price: 350, bulkPrice: 300, minBulkQty: 5, unit: 'kg', quantity: 7,
    farmerIndex: 3, location: 'Kurnool, Andhra Pradesh', isOrganic: true,
    images: [
      img('photo-1558642891-54be180ea339'),     // coconut sugar
    ]
  },
  {
    name: 'Organic Sesame Seeds (Til)',
    description: 'White til seeds naturally sun-dried, high calcium content.',
    category: 'Organic', price: 200, bulkPrice: 170, minBulkQty: 10, unit: 'kg', quantity: 11,
    farmerIndex: 2, location: 'Anand, Gujarat', isOrganic: true,
    images: [
      img('photo-1612204103590-b4e3b7c60e9a'),   // sesame seeds
    ]
  },
  {
    name: 'Organic Dry Figs (Anjeer)',
    description: 'Soft sun-dried Poona anjeer figs, no sulphur, naturally sweet.',
    category: 'Organic', price: 480, bulkPrice: 420, minBulkQty: 5, unit: 'kg', quantity: 6,
    farmerIndex: 0, location: 'Nashik, Maharashtra', isOrganic: true,
    images: [
      img('photo-1580827754766-4c13a9ef0368'),   // dried figs
      img('photo-1561136594-7f68413baa99'),       // anjeer figs
    ]
  },
];

const buildProducts = (farmerIds) => {
  return productData.map((data) => {
    const product = {
      name: data.name,
      description: data.description,
      category: data.category,
      price: data.price,
      bulkPrice: data.bulkPrice,
      minBulkQty: data.minBulkQty,
      unit: data.unit,
      quantity: data.quantity,
      farmerId: farmerIds[data.farmerIndex],
      location: data.location,
      images: data.images,
      imageUrl: data.images[0]?.url || '',
      isAvailable: data.quantity > 0,
      isOrganic: !!data.isOrganic,
      isFeatured: data.price > 100
    };
    product.aiMeta = buildProductAiMeta(product);
    return product;
  });
};

const seed = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    await User.deleteMany({ email: { $in: users.map((u) => u.email) } });

    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );

    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    const farmers = createdUsers.filter((u) => u.role === 'farmer');
    const products = buildProducts(farmers.map((u) => u._id));

    await Product.insertMany(products);
    console.log(`✅ Seed complete: ${createdUsers.length} users, ${products.length} products inserted.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
