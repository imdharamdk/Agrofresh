require('dotenv').config();

const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const { buildProductAiMeta } = require('./utils/aiSignals');

const sampleImage = (seed) => ({
  url: `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=900&q=80`,
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

// [name, description, category, price, bulkPrice, minBulkQty, unit, quantity, unsplashSeed, farmerIndex, location, isOrganic]
const productData = [
  // VEGETABLES (14)
  ['Organic Tomatoes',       'Fresh red tomatoes harvested at sunrise, zero chemicals.',          'Vegetables',  42,  34, 20, 'kg',    48, '1560566993-photo-1607305387299-a3d9611cd469', 0, 'Nashik, Maharashtra',     true ],
  ['Green Spinach',          'Crisp spinach bundles rich in iron, hand-picked daily.',            'Vegetables',  28,  22, 15, 'kg',    22, '1607305387299-photo-1576045057995-568f588f82fb', 0, 'Nashik, Maharashtra', false],
  ['Potatoes',               'Firm yellow potatoes ideal for everyday cooking.',                  'Vegetables',  30,  25, 40, 'kg',    80, '1740745248323-photo-1518977676601-b53f82aba655', 1, 'Karnal, Haryana',     false],
  ['Red Onions',             'Sharp and pungent red onions freshly lifted from the field.',       'Vegetables',  36,  30, 30, 'kg',    52, '1740845248323-photo-1618512496248-a4a4c0a0d9b5', 0, 'Nashik, Maharashtra', false],
  ['Green Chillies',         'Spicy thin green chillies perfect for Indian cooking.',             'Vegetables',  55,  45, 10, 'kg',    18, '1560566937-photo-1631897642056-97a7abcf6a6e', 3, 'Kurnool, Andhra Pradesh', false],
  ['Cauliflower',            'White compact cauliflower heads with fresh green leaves.',          'Vegetables',  38,  30, 20, 'piece', 35, '1565557656-photo-1568702846914-96b305d2aaeb', 1, 'Karnal, Haryana',     false],
  ['Brinjal (Eggplant)',     'Glossy purple brinjals with tender flesh, farm direct.',            'Vegetables',  32,  26, 15, 'kg',    27, '1641325978-photo-1613743983303-b3e89f8a2b80', 3, 'Kurnool, Andhra Pradesh', false],
  ['Lady Finger (Okra)',     'Tender young okra pods freshly harvested this morning.',            'Vegetables',  45,  37, 12, 'kg',    20, '1560566993-photo-1567375698348-0d10baa8cae2', 3, 'Kurnool, Andhra Pradesh', false],
  ['Bottle Gourd (Lauki)',   'Smooth pale green bottle gourd, freshly cut from the vine.',       'Vegetables',  22,  18, 20, 'piece', 40, '1560566993-photo-1540420773420-3366772f4999', 1, 'Karnal, Haryana',     false],
  ['Capsicum (Bell Pepper)', 'Mixed red, yellow and green capsicums, crisp and sweet.',          'Vegetables',  80,  68, 10, 'kg',    15, '1641325978-photo-1601648764658-cf37e8c89b70', 0, 'Nashik, Maharashtra', true ],
  ['Carrots',                'Sweet orange carrots freshly pulled, great for juicing.',          'Vegetables',  35,  28, 25, 'kg',    38, '1560566993-photo-1447175008436-054170c2e979', 1, 'Karnal, Haryana',     false],
  ['Peas (Matar)',           'Fresh green peas in the pod, sweet and tender variety.',           'Vegetables',  60,  50, 10, 'kg',    16, '1560566993-photo-1583258292688-d0213dc5a3a8', 0, 'Nashik, Maharashtra', false],
  ['Coriander Leaves',       'Fragrant coriander bundles, packed same day as harvest.',          'Vegetables',  15,  12, 30, 'kg',    14, '1560566993-photo-1610725664285-7c57e6eeac3f', 3, 'Kurnool, Andhra Pradesh', false],
  ['Cabbage',                'Dense round cabbage heads with tightly packed leaves.',            'Vegetables',  25,  20, 30, 'piece', 55, '1560566993-photo-1582284540020-8acbe03f4924', 1, 'Karnal, Haryana',     false],

  // FRUITS (10)
  ['Farm Mangoes (Alphonso)','Naturally ripened GI-tagged Alphonso mangoes, Devgad farm.',      'Fruits',     140, 120, 15, 'kg',    30, '1740245248323-photo-1601493700631-2b16ec4b4716', 2, 'Anand, Gujarat',      false],
  ['Bananas (Robusta)',      'Sweet Robusta bananas packed from same-day harvest.',              'Fruits',      55,  48, 20, 'piece', 18, '1740345248323-photo-1528825871115-3581a5387919', 1, 'Karnal, Haryana',     false],
  ['Watermelon',             'Large seedless watermelons, sugar-sweet and chilled.',             'Fruits',      18,  14, 50, 'kg',    60, '1560566993-photo-1587049352846-4a222e784d38', 2, 'Anand, Gujarat',      false],
  ['Papaya',                 'Ripe orange papayas rich in papain enzymes, tree fresh.',         'Fruits',      35,  28, 20, 'piece', 25, '1560566993-photo-1617112634259-50a0c1ad2a72', 3, 'Kurnool, Andhra Pradesh', false],
  ['Guava',                  'Crunchy white-flesh guavas, naturally sweet with few seeds.',     'Fruits',      50,  42, 15, 'kg',    22, '1560566993-photo-1637494511038-7e56ac8e1c68', 2, 'Anand, Gujarat',      false],
  ['Pomegranate (Bhagwa)',   'Deep-red Bhagwa pomegranates with juicy arils, seedless type.',  'Fruits',     180, 155, 10, 'kg',    12, '1560566993-photo-1508747703725-719777637510', 0, 'Nashik, Maharashtra', false],
  ['Sweet Lime (Mosambi)',   'Thin-skinned mosambi rich in vitamin C, ready to juice.',         'Fruits',      60,  50, 20, 'piece', 20, '1560566993-photo-1573246123716-6b1782bfc499', 2, 'Anand, Gujarat',      false],
  ['Grapes (Thompson)',      'Pale green seedless Thompson grapes, crisp and sweet.',           'Fruits',      95,  80, 10, 'kg',    14, '1560566993-photo-1423757736953-61e1f6a92abe', 0, 'Nashik, Maharashtra', false],
  ['Chikoo (Sapota)',        'Brown-skinned chikoo with honey-sweet caramel flesh.',            'Fruits',      70,  58, 12, 'kg',    18, '1560566993-photo-1661958504666-d1b6f4fe44e0', 2, 'Anand, Gujarat',      false],
  ['Coconut',                'Brown mature coconuts full of water and white kernel.',           'Fruits',      30,  25, 25, 'piece', 35, '1560566993-photo-1519162808019-7de1683fa2ad', 3, 'Kurnool, Andhra Pradesh', false],

  // GRAINS (8)
  ['Brown Rice',             'Stone-milled fragrant brown rice, minimally processed.',          'Grains',      70,  62, 50, 'kg',    60, '1740445248323-photo-1586201375761-83865001e31c', 0, 'Nashik, Maharashtra', false],
  ['Basmati Rice',           'Long-grain premium Basmati rice aged 2 years, extra aroma.',     'Grains',     110,  92, 25, 'kg',    45, '1560566993-photo-1536304993881-ff86d42818e1', 1, 'Karnal, Haryana',     false],
  ['Wheat Flour (Atta)',     'Whole-wheat atta stone-ground from hard red wheat.',             'Grains',      40,  34, 50, 'kg',    70, '1560566993-photo-1574323347407-f5e1ad6d020b', 1, 'Karnal, Haryana',     false],
  ['Maize (Corn)',           'Yellow maize kernels dried on the cob, suitable for flour.',     'Grains',      25,  20, 80, 'kg',    90, '1560566993-photo-1601300100614-6b6a5dd9e5a8', 2, 'Anand, Gujarat',      false],
  ['Black Gram (Urad Dal)',  'Whole urad dal with skin, rich in protein, direct from farm.',   'Grains',      95,  82, 20, 'kg',    35, '1560566993-photo-1585527697535-e9f01e07b18b', 3, 'Kurnool, Andhra Pradesh', false],
  ['Chickpeas (Kabuli Chana)','Large white kabuli chana premium grade, high protein.',         'Grains',      90,  75, 25, 'kg',    40, '1560566993-photo-1615484477778-ca3b77940c25', 1, 'Karnal, Haryana',     false],
  ['Jowar (Sorghum)',        'Organic white jowar, gluten-free millet for rotis and porridge.','Grains',      50,  42, 30, 'kg',    48, '1560566993-photo-1560806887-1735c0462745', 3, 'Kurnool, Andhra Pradesh', true ],
  ['Bajra (Pearl Millet)',   'Nutrient-dense bajra grains, rich in iron and magnesium.',       'Grains',      45,  38, 30, 'kg',    55, '1560566993-photo-1625944525533-4c1db97fad1e', 2, 'Anand, Gujarat',      false],

  // SPICES (9)
  ['Turmeric Powder',        'Sun-dried turmeric ground in small batches, high curcumin.',     'Spices',     180, 155, 10, 'kg',    15, '1740645248323-photo-1615485290382-441e4aa8a5d7', 0, 'Nashik, Maharashtra', false],
  ['Red Chilli Powder',      'Bright red Kashmiri chilli powder, deep colour and mild heat.',  'Spices',     200, 170, 10, 'kg',    12, '1560566993-photo-1596040033229-a9821ebd058d', 3, 'Kurnool, Andhra Pradesh', false],
  ['Coriander Powder',       'Freshly ground dhaniya seeds, bold aroma, farm-batch.',          'Spices',     130, 110, 10, 'kg',    10, '1560566993-photo-1612204103590-b4e3b7c60e9a', 2, 'Anand, Gujarat',      false],
  ['Cumin Seeds (Jeera)',    'Whole jeera with strong earthy aroma, sun-dried naturally.',     'Spices',     280, 245,  5, 'kg',     8, '1560566993-photo-1588671890052-30e48eeaa3ac', 2, 'Anand, Gujarat',      false],
  ['Black Pepper',           'Bold whole black peppercorns, stone-picked from Kerala vines.',  'Spices',     650, 580,  5, 'kg',     6, '1560566993-photo-1506184109228-f0673f6ce2ee', 3, 'Kurnool, Andhra Pradesh', false],
  ['Cardamom (Elaichi)',     'Plump green cardamom pods bursting with sweet floral aroma.',   'Spices',    1200,1050,  2, 'kg',     4, '1560566993-photo-1612204103590-b4e3b7c60e9a', 3, 'Kurnool, Andhra Pradesh', false],
  ['Dry Ginger Powder',      'Sunthi powder made from dried farm ginger, strong and pungent.','Spices',     220, 190, 10, 'kg',     9, '1560566993-photo-1609205807107-6a1e49ef89ed', 0, 'Nashik, Maharashtra', false],
  ['Cloves (Laung)',         'Aromatic dried cloves hand-selected, intensely flavoured.',      'Spices',     850, 740,  2, 'kg',     5, '1560566993-photo-1615485290382-441e4aa8a5d7', 2, 'Anand, Gujarat',      false],
  ['Mustard Seeds',          'Tiny black mustard seeds for tempering, pungent raw flavour.',   'Spices',      80,  65, 20, 'kg',    18, '1560566993-photo-1596040033229-a9821ebd058d', 1, 'Karnal, Haryana',     false],

  // DAIRY (6)
  ['Cow Milk (Full Cream)',  'Fresh full-cream milk from desi cows, delivered chilled daily.', 'Dairy',       65,  58, 25, 'litre', 25, '1740545248323-photo-1563636619-e9143da7f009', 1, 'Karnal, Haryana',     false],
  ['Free Range Eggs',        'Clean farm-packed eggs from free-roaming country hens.',         'Dairy',       78,  68, 10, 'piece', 12, '1740945248323-photo-1482049016688-2d3e1b311543', 1, 'Karnal, Haryana', false],
  ['A2 Desi Ghee',           'Hand-churned pure A2 ghee from Gir cow milk, bilona method.',   'Dairy',      850, 750,  5, 'kg',     8, '1560566993-photo-1631897642056-97a7abcf6a6e', 2, 'Anand, Gujarat',      true ],
  ['Paneer (Cottage Cheese)','Soft fresh paneer made daily from whole buffalo milk.',          'Dairy',      280, 240, 10, 'kg',    10, '1560566993-photo-1550989460-0adf9ea622e2', 2, 'Anand, Gujarat',      false],
  ['Buffalo Curd (Dahi)',    'Thick set curd from buffalo milk, creamy and mildly tangy.',    'Dairy',       55,  45, 20, 'kg',    16, '1560566993-photo-1488477181228-bf5b1f3fbb1c', 1, 'Karnal, Haryana',     false],
  ['Buttermilk (Chaas)',     'Fresh salted chaas churned from curd, hydrating summer drink.', 'Dairy',       18,  14, 50, 'litre', 30, '1560566993-photo-1571068316344-75bc76f77890', 2, 'Anand, Gujarat',      false],

  // ORGANIC (7)
  ['Organic Moringa Leaves', 'Drumstick tree leaves sun-dried, superfood grade, no spray.',   'Organic',    220, 185, 10, 'kg',    10, '1560566993-photo-1610725664285-7c57e6eeac3f', 3, 'Kurnool, Andhra Pradesh', true ],
  ['Organic Amla',           'Certified organic amla berries, vitamin C powerhouse.',         'Organic',    130, 108, 15, 'kg',    14, '1560566993-photo-1637494511038-7e56ac8e1c68', 0, 'Nashik, Maharashtra', true ],
  ['Organic Flaxseeds',      'Cold-pressed whole flaxseeds, omega-3 rich, zero pesticides.', 'Organic',    160, 138, 10, 'kg',    12, '1560566993-photo-1585527697535-e9f01e07b18b', 3, 'Kurnool, Andhra Pradesh', true ],
  ['Organic Tulsi Leaves',   'Fresh Krishna Tulsi leaves, hand-harvested, pesticide-free.',  'Organic',     80,  65, 20, 'kg',     8, '1560566993-photo-1570197788417-0e82375c9371', 0, 'Nashik, Maharashtra', true ],
  ['Organic Coconut Sugar',  'Low-GI coconut palm sugar, unrefined, natural caramel taste.', 'Organic',    350, 300,  5, 'kg',     7, '1560566993-photo-1519162808019-7de1683fa2ad', 3, 'Kurnool, Andhra Pradesh', true ],
  ['Organic Sesame Seeds',   'White til seeds naturally sun-dried, high calcium content.',   'Organic',    200, 170, 10, 'kg',    11, '1560566993-photo-1560806887-1735c0462745', 2, 'Anand, Gujarat',      true ],
  ['Organic Dry Figs',       'Soft sun-dried Poona anjeer figs, no sulphur, naturally sweet.','Organic',   480, 420,  5, 'kg',     6, '1560566993-photo-1661958504666-d1b6f4fe44e0', 0, 'Nashik, Maharashtra', true ],
];

const buildProducts = (farmerIds) => {
  return productData.map(([name, description, category, price, bulkPrice, minBulkQty, unit, quantity, seed, farmerIndex, location, isOrganic]) => {
    const product = {
      name,
      description,
      category,
      price,
      bulkPrice,
      minBulkQty,
      unit,
      quantity,
      farmerId: farmerIds[farmerIndex],
      location,
      images: [sampleImage(seed)],
      isAvailable: quantity > 0,
      isOrganic: !!isOrganic,
      isFeatured: price > 100
    };

    product.aiMeta = buildProductAiMeta(product);
    return product;
  });
};

const seed = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    await User.deleteMany({ email: { $in: users.map((user) => user.email) } });

    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );

    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    const farmers = createdUsers.filter((user) => user.role === 'farmer');
    const products = buildProducts(farmers.map((user) => user._id));

    await Product.insertMany(products);
    console.log(`Seed complete: ${createdUsers.length} users, ${products.length} products inserted.`);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
