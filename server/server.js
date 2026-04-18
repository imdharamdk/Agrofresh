require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
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
