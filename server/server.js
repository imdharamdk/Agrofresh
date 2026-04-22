require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { initCloudinary } = require('./config/cloudinary');
const ChatMessage = require('./models/ChatMessage');
const Negotiation = require('./models/Negotiation');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const negotiationRoutes = require('./routes/negotiationRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const sendResponse = require('./utils/response');
const { createSocketAuthMiddleware, canAccessNegotiation } = require('./utils/socketAuth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

connectDB();
initCloudinary();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  sendResponse(res, 200, true, { name: 'AgroFresh API', modules: ['b2c', 'b2b', 'delivery', 'reviews', 'admin', 'chat'] }, 'API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/negotiations', negotiationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/admin', adminRoutes);

// One-time seed trigger endpoint — protected by SEED_SECRET env var
app.get('/api/run-seed', async (req, res) => {
  const secret = req.query.secret;
  if (!secret || secret !== process.env.SEED_SECRET) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  try {
    const User = require('./models/User');
    const Product = require('./models/Product');
    const { buildProductAiMeta } = require('./utils/aiSignals');

    // Inline seed data import
    const seedModule = require('./seed-data');
    const { users: seedUsers, productData } = seedModule;

    await Product.deleteMany();
    await User.deleteMany({ email: { $in: seedUsers.map((u) => u.email) } });

    const usersWithHashedPasswords = await Promise.all(
      seedUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );

    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    const farmers = createdUsers.filter((u) => u.role === 'farmer');
    const farmerIds = farmers.map((u) => u._id);

    const products = productData.map((data) => {
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

    await Product.insertMany(products);

    return res.json({
      success: true,
      message: `Seed complete: ${createdUsers.length} users, ${products.length} products inserted.`
    });
  } catch (err) {
    console.error('Seed error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

io.use(createSocketAuthMiddleware());

io.on('connection', (socket) => {
  socket.on('join-negotiation', async ({ negotiationId }) => {
    const negotiation = await Negotiation.findById(negotiationId);
    if (!negotiation) return;
    if (!canAccessNegotiation(socket.user, negotiation)) return;

    socket.join(`negotiation:${negotiationId}`);
  });

  socket.on('send-message', async ({ negotiationId, message }) => {
    if (!negotiationId || !message) return;

    const negotiation = await Negotiation.findById(negotiationId);
    if (!negotiation) return;
    if (!canAccessNegotiation(socket.user, negotiation)) return;

    const chatMessage = await ChatMessage.create({ negotiationId, senderId: socket.user._id, message });
    const populated = await ChatMessage.findById(chatMessage._id).populate('senderId', 'name role businessName');

    io.to(`negotiation:${negotiationId}`).emit('new-message', populated);
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`AgroFresh server running on port ${PORT}`);
});

module.exports = { app, server, io };
