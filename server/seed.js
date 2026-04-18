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

const buildProducts = (farmerIds) => {
  const base = [
    ['Organic Tomatoes', 'Fresh red tomatoes harvested at sunrise.', 'Vegetables', 42, 34, 20, 'kg', 48, 1740045248323, farmerIds[0], 'Nashik, Maharashtra'],
    ['Green Spinach', 'Leafy spinach bundles rich in iron.', 'Vegetables', 28, 22, 15, 'kg', 22, 1740145248323, farmerIds[0], 'Nashik, Maharashtra'],
    ['Farm Mangoes', 'Naturally ripened Alphonso mangoes.', 'Fruits', 140, 120, 15, 'kg', 30, 1740245248323, farmerIds[1], 'Karnal, Haryana'],
    ['Bananas', 'Sweet bananas packed from the same day harvest.', 'Fruits', 55, 48, 20, 'piece', 18, 1740345248323, farmerIds[1], 'Karnal, Haryana'],
    ['Brown Rice', 'Stone-milled fragrant brown rice.', 'Grains', 70, 62, 50, 'kg', 60, 1740445248323, farmerIds[0], 'Nashik, Maharashtra'],
    ['Cow Milk', 'Fresh full-cream milk delivered chilled.', 'Dairy', 65, 58, 25, 'litre', 25, 1740545248323, farmerIds[1], 'Karnal, Haryana'],
    ['Turmeric Powder', 'Sun-dried turmeric ground in small batches.', 'Spices', 180, 160, 10, 'kg', 15, 1740645248323, farmerIds[0], 'Nashik, Maharashtra'],
    ['Potatoes', 'Firm potatoes suitable for home cooking.', 'Vegetables', 30, 25, 40, 'kg', 80, 1740745248323, farmerIds[1], 'Karnal, Haryana'],
    ['Red Onions', 'Sharp and fresh onions from local fields.', 'Vegetables', 36, 30, 30, 'kg', 52, 1740845248323, farmerIds[0], 'Nashik, Maharashtra'],
    ['Free Range Eggs', 'Clean, farm-packed eggs.', 'Dairy', 78, 68, 10, 'piece', 12, 1740945248323, farmerIds[1], 'Karnal, Haryana']
  ];

  return base.map(([name, description, category, price, bulkPrice, minBulkQty, unit, quantity, seed, farmerId, location]) => {
    const product = {
      name,
      description,
      category,
      price,
      bulkPrice,
      minBulkQty,
      unit,
      quantity,
      farmerId,
      location,
      images: [sampleImage(seed)],
      isAvailable: quantity > 0
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
    console.log('Seed data inserted successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
