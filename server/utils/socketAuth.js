const jwt = require('jsonwebtoken');
const User = require('../models/User');

const parseCookies = (cookieHeader = '') => {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const [name, ...valueParts] = part.split('=');
      if (!name) return cookies;
      cookies[name] = decodeURIComponent(valueParts.join('='));
      return cookies;
    }, {});
};

const canAccessNegotiation = (user, negotiation) => {
  if (!user || !negotiation) return false;

  const userId = user._id.toString();
  return (
    negotiation.farmerId.toString() === userId ||
    negotiation.businessId.toString() === userId ||
    user.role === 'admin'
  );
};

const createSocketAuthMiddleware = ({ jwtLib = jwt, userModel = User } = {}) => {
  return async (socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token = cookies.token;

      if (!token) {
        return next(new Error('Not authorized'));
      }

      const decoded = jwtLib.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.userId).select('_id name role businessName');

      if (!user) {
        return next(new Error('User no longer exists'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Not authorized'));
    }
  };
};

module.exports = {
  parseCookies,
  canAccessNegotiation,
  createSocketAuthMiddleware
};
